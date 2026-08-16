import { useEffect, useState } from "react";
import { ArrowRightLeft, Users2 } from "lucide-react";
import { getTeachers, updateTeacherAssignments } from "../../firebase/admin";
import toast from "react-hot-toast";

const SEMESTERS = Array.from({ length: 10 }, (_, i) => `Semester_${i + 1}`);

function formatSemester(sem) {
  if (!sem) return "—";
  return sem.replace("_", " ");
}

export default function AdminAllTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { teacherId, index }
  const [newSemester, setNewSemester] = useState("");
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
  };

  const cancelEdit = () => {
    setEditing(null);
    setNewSemester("");
  };

  const confirmTransfer = async () => {
    if (!editing || !newSemester) return;
    const teacher = teachers.find((t) => t.id === editing.teacherId);
    if (!teacher) return;
    setSaving(true);
    try {
      const updated = (teacher.assignments || []).map((a, i) =>
        i === editing.index ? { ...a, semester: newSemester } : a
      );
      await updateTeacherAssignments(teacher.id, updated);
      toast.success("Assignment-ka waa la wareejiyay!");
      cancelEdit();
      load();
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-800">
        Dhammaan Teachers
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Halkan waxaad ka aragtaa Teacher kasta iyo assignments-kiisa oo dhan
        — waxaana ka bedeli kartaa semester-ka assignment kasta.
      </p>

      {loading && (
        <p className="mt-8 text-sm text-navy-400">Soo dejinaya...</p>
      )}

      {!loading && teachers.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-navy-200 py-14 text-center">
          <p className="text-sm text-navy-400">Weli Teacher lama darin.</p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {teachers.map((t) => {
          const assignments = Array.isArray(t.assignments) ? t.assignments : [];
          return (
            <div key={t.id} className="rounded-xl border border-navy-100 bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-700 text-gold-400">
                  <Users2 size={16} />
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
                      className="flex flex-wrap items-center gap-2 rounded-md border border-navy-50 bg-navy-50/40 px-3 py-2 text-xs"
                    >
                      <span className="font-semibold text-navy-700">
                        {a.department || "—"}
                      </span>
                      <span className="text-navy-400">·</span>
                      {isEditing ? (
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
                      ) : (
                        <span className="text-navy-600">
                          {formatSemester(a.semester)}
                        </span>
                      )}
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
                        {isEditing ? (
                          <>
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
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(t.id, i, a.semester)}
                            className="flex items-center gap-1 rounded-md border border-navy-200 px-2.5 py-1 text-[11px] font-medium text-navy-600 hover:bg-white"
                          >
                            <ArrowRightLeft size={11} />
                            Wareeji Semester
                          </button>
                        )}
                      </div>
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