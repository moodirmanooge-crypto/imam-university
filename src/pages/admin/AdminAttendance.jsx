import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Save,
  Building2,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { getAllAttendance, updateAttendanceRecordStatus } from "../../firebase/attendance";
import { getStudents } from "../../firebase/admin";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "present", label: "Present", icon: Check, activeClass: "bg-sage text-white border-sage" },
  { value: "absent", label: "Absent", icon: X, activeClass: "bg-rose text-white border-rose" },
  { value: "situation", label: "Situation", icon: AlertTriangle, activeClass: "bg-gold-500 text-navy-900 border-gold-500" },
];

function statusBadge(status) {
  const map = {
    present: "bg-sage/15 text-sage",
    absent: "bg-rose/10 text-rose",
    situation: "bg-gold-100 text-gold-700",
  };
  const label = status ? status[0].toUpperCase() + status.slice(1) : "—";
  return { label, className: map[status] || "bg-navy-50 text-navy-400" };
}

function initials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [studentsById, setStudentsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filterDept, setFilterDept] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Pending local edits per record before Save is pressed:
  // { [recordId]: { [studentId]: newStatus } }
  const [pendingEdits, setPendingEdits] = useState({});
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const [att, students] = await Promise.all([getAllAttendance(), getStudents()]);
    setRecords(att);
    const map = {};
    students.forEach((s) => (map[s.id] = s));
    setStudentsById(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const departments = [...new Set(records.map((r) => r.department).filter(Boolean))];
  const teachers = [...new Set(records.map((r) => r.teacherName).filter(Boolean))];

  const filtered = records.filter((r) => {
    if (filterDept && r.department !== filterDept) return false;
    if (filterTeacher && r.teacherName !== filterTeacher) return false;
    if (filterDate && r.date !== filterDate) return false;
    return true;
  });

  const setPendingStatus = (recordId, studentId, status) => {
    setPendingEdits((prev) => ({
      ...prev,
      [recordId]: { ...(prev[recordId] || {}), [studentId]: status },
    }));
  };

  const getDisplayStatus = (record, studentId, original) =>
    pendingEdits[record.id]?.[studentId] ?? original;

  const hasPendingChanges = (recordId) =>
    !!pendingEdits[recordId] && Object.keys(pendingEdits[recordId]).length > 0;

  const handleSave = async (record) => {
    const edits = pendingEdits[record.id];
    if (!edits || Object.keys(edits).length === 0) return;
    setSavingId(record.id);
    try {
      let updatedRecords = record.records;
      for (const [studentId, status] of Object.entries(edits)) {
        updatedRecords = await updateAttendanceRecordStatus(
          record.id,
          studentId,
          status,
          updatedRecords
        );
      }
      setRecords((rs) =>
        rs.map((r) => (r.id === record.id ? { ...r, records: updatedRecords } : r))
      );
      setPendingEdits((prev) => {
        const next = { ...prev };
        delete next[record.id];
        return next;
      });
      toast.success("Xaadirinta waa la kaydiyay!");
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-800">
        Xaadirinta
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Dhammaan xaadirinta Teachers oo dhan, kala saaran taariikh iyo
        department. Riix mid si aad u aragto Students oo aad u bedesho
        xaaladda.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-md border border-navy-100 bg-white px-3 py-2">
          <Building2 size={14} className="text-navy-400" />
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="text-xs outline-none"
          >
            <option value="">Dhammaan Department-yada</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-navy-100 bg-white px-3 py-2">
          <GraduationCap size={14} className="text-navy-400" />
          <select
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}
            className="text-xs outline-none"
          >
            <option value="">Dhammaan Teachers</option>
            {teachers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-navy-100 bg-white px-3 py-2">
          <Calendar size={14} className="text-navy-400" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="text-xs outline-none"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="text-[11px] text-navy-400 hover:text-rose"
            >
              Ka saar
            </button>
          )}
        </div>
      </div>

      {loading && (
        <p className="mt-8 text-sm text-navy-400">Soo dejinaya...</p>
      )}
      {!loading && filtered.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-navy-200 py-14 text-center">
          <p className="text-sm text-navy-400">Weli xaadirin lama duubin.</p>
        </div>
      )}

      <div className="mt-5 space-y-3 pb-6">
        {filtered.map((r) => {
          const isOpen = expanded === r.id;
          const presentCount = r.records?.filter((x) => x.status === "present").length || 0;
          const dirty = hasPendingChanges(r.id);

          return (
            <div key={r.id} className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
              <button
                onClick={() => setExpanded(isOpen ? null : r.id)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-700 text-gold-400">
                    <CalendarClock size={17} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy-800">
                      {r.teacherName} <span className="text-navy-300">·</span> {r.subject}
                    </p>
                    <p className="text-xs text-navy-500">
                      {r.department} · {r.semester?.replace("_", " ")} ·{" "}
                      <span className="font-mono">{r.date}</span>
                      {r.time && <> · {r.time}</>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {dirty && (
                    <span className="rounded-full bg-gold-100 px-2.5 py-1 text-[10px] font-semibold text-gold-700">
                      Isbeddel aan la kaydin
                    </span>
                  )}
                  <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-500">
                    {presentCount}/{r.records?.length || 0} xaadir
                  </span>
                  {isOpen ? (
                    <ChevronDown size={16} className="text-navy-400" />
                  ) : (
                    <ChevronRight size={16} className="text-navy-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-navy-50">
                  {r.records?.map((rec, i) => {
                    const student = studentsById[rec.studentId];
                    const displayStatus = getDisplayStatus(r, rec.studentId, rec.status);
                    const badge = statusBadge(displayStatus);
                    return (
                      <div
                        key={rec.studentId}
                        className={`flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between ${
                          i !== r.records.length - 1 ? "border-b border-navy-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              displayStatus === "present"
                                ? "bg-sage/15 text-sage"
                                : displayStatus === "situation"
                                ? "bg-gold-100 text-gold-700"
                                : "bg-rose/10 text-rose"
                            }`}
                          >
                            {initials(student?.fullName)}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-navy-800">
                              {student?.fullName || rec.studentId}
                            </p>
                            <p className="font-mono text-xs text-navy-400">{rec.studentId}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                          <div className="flex gap-1.5">
                            {STATUS_OPTIONS.map((opt) => {
                              const Icon = opt.icon;
                              const active = displayStatus === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => setPendingStatus(r.id, rec.studentId, opt.value)}
                                  className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                                    active
                                      ? opt.activeClass
                                      : "border-navy-100 text-navy-600 hover:bg-navy-50"
                                  }`}
                                >
                                  <Icon size={12} />
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Save bar */}
                  <div className="border-t border-navy-50 bg-navy-50/40 p-3">
                    <button
                      onClick={() => handleSave(r)}
                      disabled={!dirty || savingId === r.id}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-navy-600 to-navy-700 py-3 text-sm font-semibold text-parchment shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Save size={15} />
                      {savingId === r.id ? "Kaydinaya..." : "SAVE"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}