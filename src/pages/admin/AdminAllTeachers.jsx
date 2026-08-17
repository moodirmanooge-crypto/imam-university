import { useEffect, useState } from "react";
import { ArrowRightLeft, Users2, Trash2, Search } from "lucide-react";
import { getTeachers, updateTeacherAssignments, bulkUpdateStudentSemesterByDept } from "../../firebase/admin";
import toast from "react-hot-toast";

const SEMESTERS = Array.from({ length: 10 }, (_, i) => `Semester_${i + 1}`);

function formatSemester(sem) {
  if (!sem) return "—";
  return sem.replace("_", " ");
}

export default function AdminAllTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // { teacherId, index }
  const [newSemester, setNewSemester] = useState("");
  const [moveStudentsToo, setMoveStudentsToo] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setTeachers(await getTeachers());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (teacherId, index, currentSemester) => {
    setEditing({ teacherId, index });
    setNewSemester(currentSemester || SEMESTERS[0]);
    setMoveStudentsToo(true);
  };

  const cancelEdit = () => {
    setEditing(null);
    setNewSemester("");
  };

  const confirmTransfer = async () => {
    if (!editing || !newSemester) return;
    const teacher = teachers.find((t) => t.id === editing.teacherId);
    if (!teacher) return;
    const assignment = teacher.assignments[editing.index];
    const oldSemester = assignment?.semester;
    const department = assignment?.department;

    setSaving(true);
    try {
      const updated = (teacher.assignments || []).map((a, i) =>
        i === editing.index ? { ...a, semester: newSemester } : a
      );
      await updateTeacherAssignments(teacher.id, updated);

      let movedCount = 0;
      if (moveStudentsToo && department && oldSemester && oldSemester !== newSemester) {
        movedCount = await bulkUpdateStudentSemesterByDept(department, oldSemester, newSemester);
      }

      toast.success(
        movedCount > 0
          ? `Assignment-ka waa la wareejiyay! ${movedCount} arday ayaa sidoo kale loo wareejiyay.`
          : "Assignment-ka waa la wareejiyay!"
      );
      cancelEdit();
      load();
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  const removeAssignment = async (teacherId, index) => {
    if (!confirm("Ma hubtaa inaad ka saarto assignment-kan Teacherka?")) return;
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return;
    setSaving(true);
    try {
      const updated = (teacher.assignments || []).filter((_, i) => i !== index);
      await updateTeacherAssignments(teacher.id, updated);
      toast.success("Assignment-ka waa laga saaray Teacherka.");
      load();
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      t.fullName?.toLowerCase().includes(q) ||
      t.username?.toLowerCase().includes(q) ||
      t.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-800">
        Dhammaan Teachers
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Halkan waxaad ka aragtaa Teacher kasta iyo assignments-kiisa oo dhan
        — waxaad ka bedeli kartaa ama ka saari kartaa assignment kasta.
        Marka semester la wareejiyo, ardayda department + semester-kaas
        oo dhan waxay la socon karaan.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-md border border-navy-100 bg-white px-3 py-2.5">
        <Search size={16} className="text-navy-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Raadi Teacher: magac ama username..."
          className="w-full text-sm outline-none"
        />
      </div>

      {loading && (
        <p className="mt-8 text-sm text-navy-400">Soo dejinaya...</p>
      )}

      {!loading && filteredTeachers.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-navy-200 py-14 text-center">
          <p className="text-sm text-navy-400">
            {teachers.length === 0 ? "Weli Teacher lama darin." : "Wax natiijo ah lama helin."}
          </p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {filteredTeachers.map((t) => {
          const assignments = Array.isArray(t.assignments) ? t.assignments : [];
          return (
            <div key={t.id} className="rounded-xl border border-navy-100 bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-700 text-gold-400">
                  {t.photo ? (
                    <img src={t.photo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Users2 size={16} />
                  )}
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-800">{t.fullName}</p>
                  <p className="font-mono text-xs text-navy-400">{t.username || t.id}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {assignments.length === 0 && (
                  <p className="text-xs text-navy-400">
                    Assignment lama helin — Teacherkan wuxuu leeyahay qaab
                    hore (department/semester toos ku jira, ma aha
                    assignments array).
                  </p>
                )}
                {assignments.map((a, i) => {
                  const isEditing = editing?.teacherId === t.id && editing?.index === i;
                  return (
                    <div
                      key={i}
                      className={isEditing ? "rounded-md border border-gold-300 bg-gold-50 px-3 py-2.5" : "flex flex-wrap items-center gap-2 rounded-md border border-navy-50 bg-navy-50/40 px-3 py-2 text-xs"}
                    >
                      {isEditing ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-navy-700">{a.department || "—"}</span>
                            <span className="text-navy-400">·</span>
                            <span className="text-navy-500">
                              Semester hadda: <strong>{formatSemester(a.semester)}</strong>
                            </span>
                            <span className="text-navy-400">→</span>
                            <select
                              value={newSemester}
                              onChange={(e) => setNewSemester(e.target.value)}
                              className="rounded-md border border-gold-400 px-2 py-1 text-xs outline-none"
                            >
                              {SEMESTERS.map((s) => (
                                <option key={s} value={s}>
                                  {formatSemester(s)}
                                </option>
                              ))}
                            </select>
                            <span className="text-navy-400">·</span>
                            <span className="text-navy-600">{a.subject || a.className || "—"}</span>
                          </div>
                          <label className="flex items-center gap-1.5 text-[11px] text-navy-600">
                            <input
                              type="checkbox"
                              checked={moveStudentsToo}
                              onChange={(e) => setMoveStudentsToo(e.target.checked)}
                            />
                            Sidoo kale wareeji dhammaan ardayda {a.department} / {formatSemester(a.semester)} una geey semester-ka cusub
                          </label>
                          <div className="flex gap-1.5">
                            <button
                              onClick={confirmTransfer}
                              disabled={saving}
                              className="rounded-md bg-navy-700 px-2.5 py-1 text-[11px] font-semibold text-parchment disabled:opacity-60"
                            >
                              {saving ? "..." : "Xaqiiji"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded-md border border-navy-200 px-2.5 py-1 text-[11px] font-medium text-navy-500"
                            >
                              Jooji
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold text-navy-700">
                            {a.department || "—"}
                          </span>
                          <span className="text-navy-400">·</span>
                          <span className="text-navy-600">
                            {formatSemester(a.semester)}
                          </span>
                          <span className="text-navy-400">·</span>
                          <span className="text-navy-600">
                            {a.subject || a.className || "—"}
                          </span>
                          {a.employment && (
                            <span
                              className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                a.employment === "full_time"
                                  ? "bg-sage/15 text-sage"
                                  : "bg-gold-100 text-gold-700"
                              }`}
                            >
                              {a.employment === "full_time" ? "Full Time" : "Part Time"}
                            </span>
                          )}

                          <div className="ml-auto flex gap-1.5">
                            <button
                              onClick={() => startEdit(t.id, i, a.semester)}
                              className="flex items-center gap-1 rounded-md border border-navy-200 px-2.5 py-1 text-[11px] font-medium text-navy-600 hover:bg-white"
                            >
                              <ArrowRightLeft size={11} />
                              Wareeji Semester
                            </button>
                            <button
                              onClick={() => removeAssignment(t.id, i)}
                              className="flex items-center gap-1 rounded-md border border-rose/30 px-2.5 py-1 text-[11px] font-medium text-rose hover:bg-rose/5"
                            >
                              <Trash2 size={11} />
                              Ka saar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}