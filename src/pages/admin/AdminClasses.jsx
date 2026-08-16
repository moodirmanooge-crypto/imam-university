import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  addClass,
  getClasses,
  deleteClass,
  getTeachers,
  getStudents,
} from "../../firebase/admin";
import toast from "react-hot-toast";

const SEMESTERS = Array.from({ length: 10 }, (_, i) => `Semester_${i + 1}`);

const emptyForm = {
  department: "",
  teacherId: "",
};

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [activeSemester, setActiveSemester] = useState(SEMESTERS[0]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [c, t, s] = await Promise.all([
      getClasses(),
      getTeachers(),
      getStudents(),
    ]);
    setClasses(c);
    setTeachers(t);
    setStudents(s);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "department") setSelectedStudents([]);
  };

  const toggleStudent = (id) =>
    setSelectedStudents((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );

  // Teachers filtered to only those matching the entered department
  const teachersForDept = teachers.filter(
    (t) => !form.department.trim() || t.department === form.department.trim()
  );

  const studentsInActiveSemester = students.filter(
    (s) => s.semester === activeSemester
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.department.trim() || !form.teacherId) {
      toast.error("Department-ka iyo Teacherku waa lagama maarmaan.");
      return;
    }
    setSaving(true);
    try {
      await addClass({
        className: form.department.trim(),
        department: form.department.trim(),
        teacherId: form.teacherId,
        studentIds: selectedStudents,
      });
      toast.success("Class-kii waa la sameeyay!");
      setForm(emptyForm);
      setSelectedStudents([]);
      load();
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ma hubtaa inaad tirtirto class-kan?")) return;
    await deleteClass(id);
    load();
  };

  const teacherName = (id) => teachers.find((t) => t.id === id)?.fullName || "—";

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-800">
        Classes
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Geli Department iyo Teacher, kuna dar Students dhammaan semester-yada.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-xl border border-navy-100 bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="Department (tusaale: IT)"
            className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
          />
          <select
            name="teacherId"
            value={form.teacherId}
            onChange={handleChange}
            disabled={!form.department.trim()}
            className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400 disabled:bg-navy-50 disabled:text-navy-300"
          >
            <option value="">
              {form.department.trim()
                ? "Dooro Teacher"
                : "Marka hore geli Department"}
            </option>
            {teachersForDept.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </select>
        </div>
        {form.department.trim() && teachersForDept.length === 0 && (
          <p className="text-xs text-navy-400">
            Teacher kuma jiro Department-kan.
          </p>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-navy-500">
            Dooro Students ({selectedStudents.length} la doortay guud ahaan)
          </p>

          <div className="flex flex-wrap gap-1.5 border-b border-navy-100 pb-2">
            {SEMESTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveSemester(s)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  activeSemester === s
                    ? "bg-navy-700 text-parchment"
                    : "bg-navy-50 text-navy-500 hover:bg-navy-100"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-md border border-navy-100 p-2">
            {studentsInActiveSemester.length === 0 && (
              <p className="px-2 py-1 text-xs text-navy-400">
                Semester-kan wax Student ah kuma jiro.
              </p>
            )}
            {studentsInActiveSemester.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-navy-50"
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(s.id)}
                  onChange={() => toggleStudent(s.id)}
                />
                <span className="font-mono text-navy-400">{s.id}</span>
                <span className="text-navy-700">{s.fullName}</span>
                <span className="text-navy-400">({s.department})</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-md bg-navy-700 px-4 py-2.5 text-sm font-semibold text-parchment disabled:opacity-60"
        >
          <Plus size={16} />
          {saving ? "Kaydinaya..." : "Samee Class"}
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-navy-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy-100 bg-navy-50/60 text-xs uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-4 py-3">Qaybta</th>
              <th className="px-4 py-3">Teacherka</th>
              <th className="px-4 py-3">Students</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-navy-400">
                  Soo dejinaya...
                </td>
              </tr>
            )}
            {!loading && classes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-navy-400">
                  Weli class lama sameyn.
                </td>
              </tr>
            )}
            {classes.map((c) => (
              <tr key={c.id} className="border-b border-navy-50 last:border-0">
                <td className="px-4 py-3 text-navy-800">{c.department}</td>
                <td className="px-4 py-3 text-navy-500">{teacherName(c.teacherId)}</td>
                <td className="px-4 py-3 text-navy-500">{c.studentIds?.length || 0}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-rose hover:opacity-70"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}