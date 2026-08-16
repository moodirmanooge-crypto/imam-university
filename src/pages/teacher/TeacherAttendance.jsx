import { useEffect, useMemo, useState } from "react";
import { Check, X, Save, Lock, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getAllStudents,
  submitAttendance,
  getExistingAttendance,
} from "../../firebase/attendance";
import toast from "react-hot-toast";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function nowTimeStr() {
  return new Date().toTimeString().slice(0, 5);
}

export default function TeacherAttendance() {
  const { user } = useAuth();
  const assignments = user.assignments || [];
  const date = todayStr();

  // useEffect kan wuxuu xannibayaa right-click, F12, DevTools shortcuts, view-source, iyo save
  useEffect(() => {
    const blockContextMenu = (e) => {
      e.preventDefault();
    };

    const blockKeys = (e) => {
      const key = e.key?.toUpperCase();

      // F12 - furista DevTools
      if (key === "F12") {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+I / J / C - DevTools variants (Inspect, Console, Element picker)
      if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(key)) {
        e.preventDefault();
        return;
      }

      // Ctrl+U - View Page Source
      if (e.ctrlKey && key === "U") {
        e.preventDefault();
        return;
      }

      // Ctrl+S - Save Page
      if (e.ctrlKey && key === "S") {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  const departments = useMemo(
    () => [...new Set(assignments.map((a) => a.department).filter(Boolean))],
    [assignments]
  );
  const [department, setDepartment] = useState(departments[0] || "");

  const semesters = useMemo(
    () =>
      [
        ...new Set(
          assignments
            .filter((a) => a.department === department)
            .map((a) => a.semester)
            .filter(Boolean)
        ),
      ],
    [assignments, department]
  );
  const [semester, setSemester] = useState(semesters[0] || "");

  const subjects = useMemo(
    () =>
      [
        ...new Set(
          assignments
            .filter((a) => a.department === department && a.semester === semester)
            .map((a) => a.subject)
            .filter(Boolean)
        ),
      ],
    [assignments, department, semester]
  );
  const [subject, setSubject] = useState(subjects[0] || "");

  // Employment options available for the currently chosen
  // department + semester + subject combo (a teacher could in theory
  // have both a full_time and part_time assignment for the same trio).
  const employmentOptions = useMemo(
    () =>
      [
        ...new Set(
          assignments
            .filter(
              (a) =>
                a.department === department &&
                a.semester === semester &&
                a.subject === subject
            )
            .map((a) => a.employment)
            .filter(Boolean)
        ),
      ],
    [assignments, department, semester, subject]
  );
  const [employment, setEmployment] = useState(employmentOptions[0] || "full_time");

  useEffect(() => {
    setSemester(semesters[0] || "");
  }, [department]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    setSubject(subjects[0] || "");
  }, [semester]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    setEmployment(employmentOptions[0] || "full_time");
  }, [subject]); // eslint-disable-line react-hooks/exhaustive-deps

  const assignment =
    department && semester && subject ? { department, semester, subject } : null;

  const [allStudents, setAllStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);
  const [checkingLock, setCheckingLock] = useState(true);

  useEffect(() => {
    (async () => {
      const students = await getAllStudents();
      setAllStudents(students);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!assignment) {
      setCheckingLock(false);
      setExistingRecord(null);
      return;
    }
    setCheckingLock(true);
    (async () => {
      const existing = await getExistingAttendance({
        teacherId: user.uid,
        department: assignment.department,
        semester: assignment.semester,
        subject: assignment.subject,
        date,
      });
      setExistingRecord(existing);
      setCheckingLock(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, semester, subject]);

  const classStudents = assignment
    ? allStudents.filter(
        (s) => s.department === department && s.semester === semester
      )
    : [];

  useEffect(() => {
    const initial = {};
    classStudents.forEach((s) => (initial[s.id] = "present"));
    setStatuses(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allStudents, department, semester]);

  const setStatus = (studentId, status) =>
    setStatuses((s) => ({ ...s, [studentId]: status }));

  const handleSubmit = async () => {
    if (!assignment) {
      toast.error("Fadlan dooro department, semester iyo subject.");
      return;
    }
    if (existingRecord) {
      toast.error("Xaadirintan maalinta waa hore loo kaydiyay.");
      return;
    }
    setSaving(true);
    try {
      const records = classStudents.map((s) => ({
        studentId: s.id,
        status: statuses[s.id] || "absent",
      }));
      await submitAttendance({
        teacherId: user.uid,
        teacherName: user.fullName,
        department,
        semester,
        subject,
        employment,
        date,
        time: nowTimeStr(),
        records,
      });
      toast.success("Xaadirinta waa la kaydiyay! Waxaad heli kartaa asbuuca xiga.");
      setExistingRecord({ date });
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  if (assignments.length === 0) {
    return (
      <p className="text-sm text-navy-400">
        Weli assignment lagugu ma xilsan. La xiriir maamulaha.
      </p>
    );
  }

  const isLocked = !checkingLock && !!existingRecord;

  const SelectField = ({ label, value, onChange, options, disabled, renderLabel }) => (
    <div className="min-w-0 flex-1">
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-navy-400">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled || options.length === 0}
          className="w-full appearance-none rounded-lg border border-navy-100 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:border-gold-400 disabled:bg-navy-50 disabled:text-navy-300"
        >
          {options.length === 0 && <option value="">Wax lama helin</option>}
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {renderLabel ? renderLabel(opt) : opt.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-300"
        />
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-navy-800 sm:text-2xl">
        Geli Xaadirinta
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Taariikhda maanta: <span className="font-mono">{date}</span>
      </p>

      {/* Selection card */}
      <div className="mt-5 rounded-xl border border-navy-100 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SelectField
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={departments}
          />
          <SelectField
            label="Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            options={semesters}
            disabled={!department}
          />
          <SelectField
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            options={subjects}
            disabled={!semester}
          />
          <SelectField
            label="Nooca Shaqada"
            value={employment}
            onChange={(e) => setEmployment(e.target.value)}
            options={employmentOptions.length > 0 ? employmentOptions : ["full_time", "part_time"]}
            disabled={!subject}
            renderLabel={(opt) => (opt === "full_time" ? "Full Time" : "Part Time")}
          />
        </div>
      </div>

      {isLocked && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-gold-300 bg-gold-50 px-4 py-3 text-sm text-navy-700">
          <Lock size={15} className="mt-0.5 shrink-0 text-gold-600" />
          <span>
            Xaadirinta maanta ee <strong>{subject}</strong> waa hore loo
            kaydiyay. Waxaad heli doontaa asbuuca xiga.
          </span>
        </div>
      )}

      {/* Student list */}
      <div className="mt-5 overflow-hidden rounded-xl border border-navy-100 bg-white">
        <div className="border-b border-navy-100 bg-navy-50/60 px-4 py-3 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            {classStudents.length} Student
          </p>
        </div>
        {loading && (
          <p className="p-8 text-center text-sm text-navy-400">
            Soo dejinaya...
          </p>
        )}
        {!loading && !assignment && (
          <p className="p-8 text-center text-sm text-navy-400">
            Dooro Department, Semester iyo Subject si Students loo muujiyo.
          </p>
        )}
        {!loading && assignment && classStudents.length === 0 && (
          <p className="p-8 text-center text-sm text-navy-400">
            Student lama helin department + semester-kan.
          </p>
        )}
        {!loading &&
          classStudents.map((s, i) => (
            <div
              key={s.id}
              className={`flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
                i !== classStudents.length - 1 ? "border-b border-navy-50" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium text-navy-800">{s.fullName}</p>
                <p className="font-mono text-xs text-navy-400">{s.id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={isLocked}
                  onClick={() => setStatus(s.id, "present")}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 sm:flex-none ${
                    statuses[s.id] === "present"
                      ? "bg-sage/20 text-sage"
                      : "bg-navy-50 text-navy-400 hover:bg-navy-100"
                  }`}
                >
                  <Check size={13} />
                  Xaadir
                </button>
                <button
                  disabled={isLocked}
                  onClick={() => setStatus(s.id, "absent")}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 sm:flex-none ${
                    statuses[s.id] === "absent"
                      ? "bg-rose/10 text-rose"
                      : "bg-navy-50 text-navy-400 hover:bg-navy-100"
                  }`}
                >
                  <X size={13} />
                  Maqan
                </button>
              </div>
            </div>
          ))}
      </div>

      {!isLocked && classStudents.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={saving || checkingLock}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gold-500 px-6 py-3.5 text-sm font-semibold text-navy-900 disabled:opacity-60 sm:w-fit"
        >
          <Save size={16} />
          {saving ? "Kaydinaya..." : "Kaydi Xaadirinta"}
        </button>
      )}
    </div>
  );
}