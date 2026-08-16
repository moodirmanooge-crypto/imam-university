import { useEffect, useState } from "react";
import { ArrowLeft, GraduationCap, Users2, ArrowRightLeft } from "lucide-react";
import { getStudents, getTeachers, bulkUpdateStudentSemester } from "../../firebase/admin";
import toast from "react-hot-toast";

const SEMESTERS = Array.from({ length: 10 }, (_, i) => `Semester_${i + 1}`);

export default function DepartmentDetail({ department, onBack }) {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSemester, setActiveSemester] = useState(SEMESTERS[0]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [transferTarget, setTransferTarget] = useState("");
  const [transferring, setTransferring] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, t] = await Promise.all([getStudents(), getTeachers()]);
    setStudents(s.filter((x) => x.department === department));
    setTeachers(t.filter((x) => x.department === department));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department]);

  const studentsInSemester = students.filter(
    (s) => s.semester === activeSemester
  );

  const toggleStudent = (id) =>
    setSelectedStudents((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );

  const toggleAll = () => {
    if (selectedStudents.length === studentsInSemester.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(studentsInSemester.map((s) => s.id));
    }
  };

  const handleTransfer = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Dooro ugu yaraan hal Student.");
      return;
    }
    if (!transferTarget) {
      toast.error("Dooro semester-ka la wareejinayo.");
      return;
    }
    setTransferring(true);
    try {
      await bulkUpdateStudentSemester(selectedStudents, transferTarget);
      toast.success(
        `${selectedStudents.length} Student waxaa loo wareejiyay ${transferTarget.replace("_", " ")}!`
      );
      setSelectedStudents([]);
      setTransferTarget("");
      load();
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-navy-500 hover:text-navy-700"
      >
        <ArrowLeft size={14} />
        Dib ugu noqo class
      </button>

      <h1 className="font-display text-2xl font-semibold text-navy-800">
        {department}
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Dooro semester si aad u aragto Students iyo Teachers.
      </p>

      {/* Teachers in this department */}
      <div className="mt-6 rounded-xl border border-navy-100 bg-white p-6">
        <div className="flex items-center gap-2">
          <Users2 size={16} className="text-navy-500" />
          <p className="text-sm font-semibold text-navy-800">
            Teachers ({teachers.length})
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {loading && <p className="text-xs text-navy-400">Soo dejinaya...</p>}
          {!loading && teachers.length === 0 && (
            <p className="text-xs text-navy-400">Teacher kuma jiro.</p>
          )}
          {teachers.map((t) => (
            <span
              key={t.id}
              className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700"
            >
              {t.fullName}
            </span>
          ))}
        </div>
      </div>

      {/* Semester tabs */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {SEMESTERS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setActiveSemester(s);
              setSelectedStudents([]);
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeSemester === s
                ? "bg-navy-700 text-parchment"
                : "bg-navy-50 text-navy-500 hover:bg-navy-100"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Students in active semester */}
      <div className="mt-4 rounded-xl border border-navy-100 bg-white">
        <div className="flex items-center justify-between border-b border-navy-100 bg-navy-50/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-navy-500" />
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              {activeSemester.replace("_", " ")} — {studentsInSemester.length} Student
            </p>
          </div>
          {studentsInSemester.length > 0 && (
            <label className="flex items-center gap-1.5 text-xs text-navy-500">
              <input
                type="checkbox"
                checked={
                  selectedStudents.length === studentsInSemester.length &&
                  studentsInSemester.length > 0
                }
                onChange={toggleAll}
              />
              Dooro dhammaan
            </label>
          )}
        </div>

        {loading && (
          <p className="p-6 text-center text-sm text-navy-400">
            Soo dejinaya...
          </p>
        )}
        {!loading && studentsInSemester.length === 0 && (
          <p className="p-6 text-center text-sm text-navy-400">
            Semester-kan wax Student ah kuma jiro.
          </p>
        )}
        {studentsInSemester.map((s, i) => (
          <label
            key={s.id}
            className={`flex items-center gap-3 px-5 py-3 text-sm ${
              i !== studentsInSemester.length - 1 ? "border-b border-navy-50" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selectedStudents.includes(s.id)}
              onChange={() => toggleStudent(s.id)}
            />
            <span className="font-mono text-xs text-navy-400">{s.id}</span>
            <span className="text-navy-800">{s.fullName}</span>
          </label>
        ))}
      </div>

      {/* Transfer bar */}
      {selectedStudents.length > 0 && (
        <div className="sticky bottom-4 mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-gold-300 bg-gold-50 p-4 shadow-lg">
          <ArrowRightLeft size={16} className="text-gold-700" />
          <p className="text-xs font-medium text-navy-700">
            {selectedStudents.length} Student la doortay
          </p>
          <select
            value={transferTarget}
            onChange={(e) => setTransferTarget(e.target.value)}
            className="rounded-md border border-navy-100 px-3 py-2 text-xs outline-none focus:border-gold-400"
          >
            <option value="">Wareeji una...</option>
            {SEMESTERS.filter((s) => s !== activeSemester).map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <button
            onClick={handleTransfer}
            disabled={transferring}
            className="rounded-md bg-navy-700 px-4 py-2 text-xs font-semibold text-parchment disabled:opacity-60"
          >
            {transferring ? "Wareejinaya..." : "Wareeji"}
          </button>
        </div>
      )}
    </div>
  );
}