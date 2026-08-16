import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { addTeacher, getTeachers, deleteTeacher, getDepartments } from "../../firebase/admin";
import toast from "react-hot-toast";

const SEMESTERS = Array.from({ length: 10 }, (_, i) => `Semester_${i + 1}`);

const emptyForm = {
  fullName: "",
  gender: "",
  username: "",
  password: "",
};

const emptyAssignment = {
  department: "",
  semester: "",
  subject: "",
  employment: "full_time",
};

function formatAssignment(a) {
  const dept = a.department || "—";
  const sem = a.semester ? a.semester.replace("Semester_", "S") : "—";
  const subj = a.subject || a.className || "—";
  return `${dept}/${sem}/${subj}`;
}

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [assignments, setAssignments] = useState([]);
  const [assignmentDraft, setAssignmentDraft] = useState(emptyAssignment);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [t, d] = await Promise.all([getTeachers(), getDepartments()]);
    setTeachers(t);
    setDepartments(d);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAssignmentChange = (e) =>
    setAssignmentDraft((a) => ({ ...a, [e.target.name]: e.target.value }));

  const addAssignment = () => {
    if (!assignmentDraft.department || !assignmentDraft.semester || !assignmentDraft.subject.trim()) {
      toast.error("Department, semester iyo subject waa lagama maarmaan.");
      return;
    }
    setAssignments((a) => [...a, assignmentDraft]);
    setAssignmentDraft(emptyAssignment);
  };

  const removeAssignment = (idx) =>
    setAssignments((a) => a.filter((_, i) => i !== idx));

  const resetForm = () => {
    setForm(emptyForm);
    setAssignments([]);
    setAssignmentDraft(emptyAssignment);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.fullName.trim()) {
      toast.error("Magaca iyo username-ka waa lagama maarmaan.");
      return;
    }
    if (!form.password.trim()) {
      toast.error("Password waa lagama maarmaan.");
      return;
    }
    if (assignments.length === 0) {
      toast.error("Ku dar ugu yaraan hal assignment (department + semester + subject).");
      return;
    }
    setSaving(true);
    try {
      await addTeacher({
        ...form,
        username: form.username.trim(),
        assignments,
      });
      toast.success("Teacherkii waa la daray!");
      resetForm();
      load();
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ma hubtaa inaad tirtirto Teacherkan?")) return;
    await deleteTeacher(id);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-800">
        Teachers
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Ku dar Teachers cusub. Teacher kastaa wuxuu yeelan karaa dhawr
        department, semester iyo subject oo kala duwan.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-navy-100 bg-white p-6 sm:grid-cols-2"
      >
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Magaca oo dhamaystiran"
          className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
        />
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
        >
          <option value="">Jinsiga</option>
          <option value="Lab">Lab</option>
          <option value="Dhedig">Dhedig</option>
        </select>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username (isticmaali doono si uu ugu galo)"
          className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
        />

        {/* Assignment builder */}
        <div className="sm:col-span-2 rounded-lg border border-navy-100 bg-navy-50/40 p-4">
          <p className="mb-2 text-xs font-semibold text-navy-600">
            Ku dar Assignment (Department + Semester + Subject + Nooca)
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <select
              name="department"
              value={assignmentDraft.department}
              onChange={handleAssignmentChange}
              className="rounded-md border border-navy-100 px-2.5 py-2 text-xs outline-none focus:border-gold-400"
            >
              <option value="">Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              name="semester"
              value={assignmentDraft.semester}
              onChange={handleAssignmentChange}
              className="rounded-md border border-navy-100 px-2.5 py-2 text-xs outline-none focus:border-gold-400"
            >
              <option value="">Semester</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            <input
              name="subject"
              value={assignmentDraft.subject}
              onChange={handleAssignmentChange}
              placeholder="Subject (tusaale: Database)"
              className="rounded-md border border-navy-100 px-2.5 py-2 text-xs outline-none focus:border-gold-400"
            />
            <select
              name="employment"
              value={assignmentDraft.employment}
              onChange={handleAssignmentChange}
              className="rounded-md border border-navy-100 px-2.5 py-2 text-xs outline-none focus:border-gold-400"
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
            </select>
          </div>
          <button
            type="button"
            onClick={addAssignment}
            className="mt-2 flex items-center gap-1.5 rounded-md border border-navy-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-600 hover:bg-navy-50"
          >
            <Plus size={13} />
            Ku dar Assignment
          </button>

          {assignments.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {assignments.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-xs"
                >
                  <span className="text-navy-700">
                    <strong>{a.department || "—"}</strong> ·{" "}
                    {a.semester ? a.semester.replace("_", " ") : "—"} ·{" "}
                    {a.subject || "—"} ·{" "}
                    <span
                      className={
                        a.employment === "full_time" ? "text-sage" : "text-gold-600"
                      }
                    >
                      {a.employment === "full_time" ? "Full Time" : "Part Time"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAssignment(i)}
                    className="text-navy-400 hover:text-rose"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-md bg-navy-700 px-4 py-2.5 text-sm font-semibold text-parchment disabled:opacity-60 sm:col-span-2"
        >
          <Plus size={16} />
          {saving ? "Kaydinaya..." : "Ku dar Teacher"}
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-navy-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy-100 bg-navy-50/60 text-xs uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Magaca</th>
              <th className="px-4 py-3">Assignments</th>
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
            {!loading && teachers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-navy-400">
                  Weli Teacher lama darin.
                </td>
              </tr>
            )}
            {teachers.map((t) => {
              const teacherAssignments = Array.isArray(t.assignments) ? t.assignments : [];
              return (
                <tr key={t.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-navy-600">
                    {t.username || t.id}
                  </td>
                  <td className="px-4 py-3 text-navy-800">{t.fullName}</td>
                  <td className="px-4 py-3 text-navy-500">
                    <div className="flex flex-wrap gap-1">
                      {teacherAssignments.map((a, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-navy-50 px-2 py-0.5 text-xs"
                        >
                          {formatAssignment(a)}
                        </span>
                      ))}
                      {teacherAssignments.length === 0 && "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-rose hover:opacity-70"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}