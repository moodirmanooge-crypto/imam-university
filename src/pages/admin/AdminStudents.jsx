import { useEffect, useState } from "react";
import { Plus, Trash2, Search, Eye, EyeOff, Upload } from "lucide-react";
import {
  addStudent,
  getStudents,
  deleteStudent,
  getDepartments,
  bulkAddStudents,
} from "../../firebase/admin";
import toast from "react-hot-toast";

const SEMESTERS = Array.from({ length: 10 }, (_, i) => `Semester_${i + 1}`);

const emptyForm = {
  studentId: "",
  fullName: "",
  gender: "",
  department: "",
  faculty: "",
  semester: "",
  password: "",
};

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("single"); // "single" | "bulk"
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Bulk import state
  const [bulkDept, setBulkDept] = useState("");
  const [bulkFaculty, setBulkFaculty] = useState("");
  const [bulkSemester, setBulkSemester] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, d] = await Promise.all([getStudents(), getDepartments()]);
    setStudents(s);
    setDepartments(d);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId.trim()) {
      toast.error("Student ID waa lagama maarmaan.");
      return;
    }
    setSaving(true);
    try {
      const { studentId, ...rest } = form;
      await addStudent(studentId.trim(), rest);
      toast.success("Studentgii waa la daray!");
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  // Parses lines like:
  // 0001, GUULEED IBRAAHIM DAAHIR, male, 1234
  // studentId, fullName, gender, password  (department + semester shared, set above)
  const parseBulkText = () => {
    return bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        const [studentId, fullName, gender, password] = parts;
        return {
          studentId,
          fullName,
          gender,
          password,
          department: bulkDept,
          faculty: bulkFaculty,
          semester: bulkSemester,
        };
      });
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkDept || !bulkSemester) {
      toast.error("Dooro Department iyo Semester marka hore.");
      return;
    }
    const entries = parseBulkText();
    if (entries.length === 0) {
      toast.error("Geli ugu yaraan hal Student.");
      return;
    }
    setBulkSaving(true);
    try {
      const result = await bulkAddStudents(entries);
      toast.success(`${result.added.length} Student waa la daray!`);
      if (result.skipped.length > 0) {
        toast.error(`${result.skipped.length} saf ID ma lahayn, waa la boodey.`);
      }
      setBulkText("");
      load();
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setBulkSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ma hubtaa inaad tirtirto Studentgan?")) return;
    await deleteStudent(id);
    load();
  };

  const togglePassword = (id) =>
    setVisiblePasswords((v) => ({ ...v, [id]: !v[id] }));

  const filteredStudents = students.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.id?.toLowerCase().includes(q) ||
      s.fullName?.toLowerCase().includes(q) ||
      s.semester?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q) ||
      s.faculty?.toLowerCase().includes(q)
    );
  });

  const previewEntries = mode === "bulk" ? parseBulkText() : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-800">
        Students
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Ku dar Students cusub, ama maamul kuwa jira.
      </p>

      {/* Mode toggle */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setMode("single")}
          className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
            mode === "single"
              ? "bg-navy-700 text-parchment"
              : "bg-navy-50 text-navy-500 hover:bg-navy-100"
          }`}
        >
          Hal Student
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
            mode === "bulk"
              ? "bg-navy-700 text-parchment"
              : "bg-navy-50 text-navy-500 hover:bg-navy-100"
          }`}
        >
          <Upload size={13} />
          Diiwaan-gelin Badan
        </button>
      </div>

      {mode === "single" && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-navy-100 bg-white p-6 sm:grid-cols-2"
        >
          <input
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            placeholder="Student ID (tusaale: 8029)"
            className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400 sm:col-span-2"
          />
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
            <option value="Lab">Male</option>
            <option value="Dhedig">Female</option>
          </select>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
          >
            <option value="">Dooro Fasalka (Department)</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
          <input
            name="faculty"
            value={form.faculty}
            onChange={handleChange}
            placeholder="Kuliyada (Faculty)"
            className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
          />
          <select
            name="semester"
            value={form.semester}
            onChange={handleChange}
            className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
          >
            <option value="">Dooro Semester</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
          />
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-md bg-navy-700 px-4 py-2.5 text-sm font-semibold text-parchment disabled:opacity-60 sm:col-span-2"
          >
            <Plus size={16} />
            {saving ? "Kaydinaya..." : "Ku dar Student"}
          </button>
        </form>
      )}

      {mode === "bulk" && (
        <form
          onSubmit={handleBulkSubmit}
          className="mt-4 space-y-4 rounded-xl border border-navy-100 bg-white p-6"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={bulkDept}
              onChange={(e) => setBulkDept(e.target.value)}
              className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
            >
              <option value="">Dooro Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <input
              value={bulkFaculty}
              onChange={(e) => setBulkFaculty(e.target.value)}
              placeholder="Kuliyada (Faculty) — ikhtiyaari"
              className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
            />
            <select
              value={bulkSemester}
              onChange={(e) => setBulkSemester(e.target.value)}
              className="rounded-md border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400"
            >
              <option value="">Dooro Semester</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-navy-500">
              Hal Student hal xariiq: <code className="rounded bg-navy-50 px-1">ID, Name, Gender, Password</code>
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={8}
              placeholder={`8030, MARYAN ALI AHMED, Dhedig, 1234\n8031, MAXAMED ALI AHMED, Lab, 2345`}
              className="w-full rounded-md border border-navy-100 px-3 py-2.5 font-mono text-xs outline-none focus:border-gold-400"
            />
          </div>

          {previewEntries.length > 0 && (
            <div className="rounded-md border border-gold-200 bg-gold-50 p-3">
              <p className="text-xs font-semibold text-navy-700">
                {previewEntries.length} Student la diyaariyay ({bulkDept || "?"} / {bulkSemester ? bulkSemester.replace("_", " ") : "?"})
              </p>
              <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                {previewEntries.map((en, i) => (
                  <p key={i} className="text-xs text-navy-500">
                    <span className="font-mono">{en.studentId || "—"}</span> · {en.fullName || "—"}
                  </p>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={bulkSaving}
            className="flex items-center justify-center gap-2 rounded-md bg-navy-700 px-4 py-2.5 text-sm font-semibold text-parchment disabled:opacity-60"
          >
            <Upload size={16} />
            {bulkSaving ? "Kaydinaya..." : "Ku dar Dhammaan Students"}
          </button>
        </form>
      )}

      <div className="mt-8 flex items-center gap-2 rounded-md border border-navy-100 bg-white px-3 py-2.5">
        <Search size={16} className="text-navy-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Raadi Student: ID, magac, ama semester..."
          className="w-full text-sm outline-none"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-navy-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy-100 bg-navy-50/60 text-xs uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Magaca</th>
              <th className="px-4 py-3">Qaybta</th>
              <th className="px-4 py-3">Kuliyada</th>
              <th className="px-4 py-3">Semester</th>
              <th className="px-4 py-3">Password</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-navy-400">
                  Soo dejinaya...
                </td>
              </tr>
            )}
            {!loading && filteredStudents.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-navy-400">
                  {students.length === 0
                    ? "Weli Student lama darin."
                    : "Wax natiijo ah lama helin."}
                </td>
              </tr>
            )}
            {filteredStudents.map((s) => (
              <tr key={s.id} className="border-b border-navy-50 last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-navy-600">
                  {s.id}
                </td>
                <td className="px-4 py-3 text-navy-800">{s.fullName}</td>
                <td className="px-4 py-3 text-navy-500">{s.department}</td>
                <td className="px-4 py-3 text-navy-500">{s.faculty}</td>
                <td className="px-4 py-3 text-navy-500">
                  {s.semester?.replace("_", " ")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-navy-500">
                      {visiblePasswords[s.id] ? s.password : "••••••"}
                    </span>
                    <button
                      onClick={() => togglePassword(s.id)}
                      className="text-navy-300 hover:text-navy-500"
                    >
                      {visiblePasswords[s.id] ? (
                        <EyeOff size={13} />
                      ) : (
                        <Eye size={13} />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(s.id)}
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