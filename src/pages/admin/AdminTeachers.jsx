import { useEffect, useState } from "react";
import { Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { addTeacher, getTeachers, deleteTeacher, getDepartments } from "../../firebase/admin";
import toast from "react-hot-toast";

const SEMESTERS = Array.from({ length: 10 }, (_, i) => `Semester_${i + 1}`);

const FULL_TIME_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
const PART_TIME_DAYS = ["Thursday", "Friday"];

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
  day: "",
};

function formatAssignment(a) {
  const dept = a.department || "—";
  const sem = a.semester ? a.semester.replace("Semester_", "S") : "—";
  const subj = a.subject || a.className || "—";
  const day = a.day ? ` · ${a.day}` : "";
  return `${dept}/${sem}/${subj}${day}`;
}

// True when the draft has enough filled in that it looks like the admin
// meant to add it as an assignment, but never clicked "Ku dar Assignment".
function draftHasUnsavedContent(draft) {
  return !!(draft.department || draft.semester || draft.subject.trim() || draft.day);
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

  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignmentDraft((a) => {
      if (name === "employment") {
        return { ...a, employment: value, day: "" };
      }
      return { ...a, [name]: value };
    });
  };

  const dayOptions =
    assignmentDraft.employment === "part_time" ? PART_TIME_DAYS : FULL_TIME_DAYS;

  const addAssignment = () => {
    if (!assignmentDraft.department || !assignmentDraft.semester || !assignmentDraft.subject.trim()) {
      toast.error("Department, semester iyo subject waa lagama maarmaan.");
      return false;
    }
    if (!assignmentDraft.day) {
      toast.error("Fadlan dooro maalinta uu xaadirinayo.");
      return false;
    }
    setAssignments((a) => [...a, assignmentDraft]);
    setAssignmentDraft({ ...emptyAssignment, employment: assignmentDraft.employment });
    return true;
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

    // Safety net: the admin filled the assignment builder fields but
    // forgot to press "Ku dar Assignment" — this is exactly the bug
    // that silently drops a second/third assignment. Catch it here
    // instead of letting the teacher get saved with fewer assignments
    // than intended.
    let finalAssignments = assignments;
    if (draftHasUnsavedContent(assignmentDraft)) {
      const complete =
        assignmentDraft.department &&
        assignmentDraft.semester &&
        assignmentDraft.subject.trim() &&
        assignmentDraft.day;
      if (complete) {
        const confirmed = confirm(
          "Waxaa jira assignment aad buuxisay laakiin aadan riixin \"Ku dar Assignment\". Ma rabtaa in la daro?"
        );
        if (confirmed) {
          finalAssignments = [...assignments, assignmentDraft];
          setAssignments(finalAssignments);
          setAssignmentDraft({ ...emptyAssignment, employment: assignmentDraft.employment });
        }
      } else {
        toast.error(
          "Waxaa jira assignment aan dhamaystirneyn (Department/Semester/Subject/Maalin). Dhamaystir ama nadiifi ka hor inta aadan Teacher-ka kaydin."
        );
        return;
      }
    }

    if (finalAssignments.length === 0) {
      toast.error("Ku dar ugu yaraan hal assignment (department + semester + subject + maalin).");
      return;
    }

    setSaving(true);
    try {
      await addTeacher({
        ...form,
        username: form.username.trim(),
        assignments: finalAssignments,
      });
      toast.success(
        `Teacherkii waa la daray! (${finalAssignments.length} assignment)`
      );
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

  const draftPending = draftHasUnsavedContent(assignmentDraft);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-800">
        Teachers
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Add new teachers to the portal. Each teacher can be assigned to multiple departments, semesters, subjects, and different teaching days. A single teacher may teach across up to 10 semesters, with different subjects assigned to each semester.

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
          <option value="">Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
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
            Ku dar Assignment (Department + Semester + Subject + Nooca + Maalinta)
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
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
            <select
              name="day"
              value={assignmentDraft.day}
              onChange={handleAssignmentChange}
              className="rounded-md border border-navy-100 px-2.5 py-2 text-xs outline-none focus:border-gold-400"
            >
              <option value="">Maalinta</option>
              {dayOptions.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1.5 text-[11px] text-navy-400">
            {assignmentDraft.employment === "part_time"
              ? "Part Time: dooro hal maalin — Thursday ama Friday."
              : "Full Time: dooro hal maalin oo ka mid ah Saturday–Wednesday."}
          </p>

          {draftPending && (
            <div className="mt-2 flex items-center gap-1.5 rounded-md bg-gold-100 px-3 py-2 text-[11px] font-medium text-gold-700">
              <AlertTriangle size={13} />
              Ha ilaawin inaad riixdo "Ku dar Assignment" ka hor inta aadan
              Teacher-ka kaydin — haddii kale assignment-kan lama keydin doono.
            </div>
          )}

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
              <p className="text-[11px] font-semibold text-navy-500">
                {assignments.length} assignment oo la diyaariyay:
              </p>
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
                    </span>{" "}
                    · <span className="font-semibold">{a.day || "—"}</span>
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