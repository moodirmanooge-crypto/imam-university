import { useEffect, useMemo, useState } from "react";
import { Check, X, Save, Lock, ChevronDown, CalendarClock, CalendarOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getAllStudents,
  submitAttendance,
  getExistingAttendance,
  getTeacherAttendance,
} from "../../firebase/attendance";
import { getHolidays } from "../../firebase/admin";
import toast from "react-hot-toast";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function nowTimeStr() {
  return new Date().toTimeString().slice(0, 5);
}
function todayDayName() {
  return DAY_NAMES[new Date().getDay()];
}

// Computes an exact days/hours/minutes breakdown between `now` and a
// target Date object. Since `now` is refreshed every tick (see the
// useState/useEffect below), this stays accurate live rather than
// freezing at whatever it was when the page first loaded.
function breakdownUntil(targetDate, now) {
  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0, totalHours: 0, totalMinutes: 0 };
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  return { days, hours, minutes, totalHours, totalMinutes };
}

function nextOccurrenceOfDay(targetDayName, now) {
  const targetIndex = DAY_NAMES.indexOf(targetDayName);
  if (targetIndex === -1) return null;
  const currentIndex = now.getDay();
  let daysAhead = (targetIndex - currentIndex + 7) % 7;
  if (daysAhead === 0) daysAhead = 7;
  const target = new Date(now);
  target.setDate(now.getDate() + daysAhead);
  target.setHours(0, 0, 0, 0);
  return target;
}

function endOfHolidayDate(endDateStr, now) {
  const target = new Date(endDateStr + "T00:00:00");
  target.setDate(target.getDate() + 1); // holiday ends at end of endDate
  return target;
}

export default function TeacherAttendance() {
  const { user } = useAuth();
  const assignments = user.assignments || [];
  const date = todayStr();
  const currentDayName = todayDayName();

  // Ticks every minute so any countdown shown below recalculates live
  // instead of freezing at the moment the page first rendered.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const [activeHoliday, setActiveHoliday] = useState(null);
  const [loadingHoliday, setLoadingHoliday] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const holidays = await getHolidays();
        const active = holidays.find((h) => h.startDate <= date && date <= h.endDate);
        setActiveHoliday(active || null);
      } catch (err) {
        console.error("getHolidays failed:", err);
        setActiveHoliday(null);
      } finally {
        setLoadingHoliday(false);
      }
    })();
  }, [date]);

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
    department && semester && subject && employment
      ? { department, semester, subject, employment }
      : null;

  const scheduledDay = useMemo(() => {
    const match = assignments.find(
      (a) =>
        a.department === department &&
        a.semester === semester &&
        a.subject === subject &&
        a.employment === employment
    );
    return match?.day || null;
  }, [assignments, department, semester, subject, employment]);

  const isCorrectDay = scheduledDay && scheduledDay === currentDayName;
  const isHoliday = !!activeHoliday;
  const canTakeAttendance = isCorrectDay && !isHoliday;

  // Both countdowns are recomputed from the live `now` on every tick.
  const countdown =
    scheduledDay && !isCorrectDay && !isHoliday
      ? breakdownUntil(nextOccurrenceOfDay(scheduledDay, now), now)
      : null;
  const holidayCountdown = isHoliday
    ? breakdownUntil(endOfHolidayDate(activeHoliday.endDate, now), now)
    : null;

  const [allStudents, setAllStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);
  const [checkingLock, setCheckingLock] = useState(true);

  const [lastStatusByStudent, setLastStatusByStudent] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    (async () => {
      const students = await getAllStudents();
      setAllStudents(students);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!assignment || !canTakeAttendance) {
      setCheckingLock(false);
      setExistingRecord(null);
      return;
    }
    setCheckingLock(true);
    (async () => {
      try {
        const existing = await getExistingAttendance({
          teacherId: user.uid,
          department: assignment.department,
          semester: assignment.semester,
          subject: assignment.subject,
          date,
        });
        setExistingRecord(existing);
      } catch (err) {
        console.error("getExistingAttendance failed:", err);
        setExistingRecord(null);
      } finally {
        setCheckingLock(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, semester, subject, employment, canTakeAttendance]);

  useEffect(() => {
    if (!assignment || canTakeAttendance) {
      setLastStatusByStudent({});
      setLoadingHistory(false);
      return;
    }
    let cancelled = false;
    setLoadingHistory(true);
    (async () => {
      try {
        const history = await getTeacherAttendance(user.uid);
        const matching = history
          .filter(
            (h) =>
              h.department === department &&
              h.semester === semester &&
              h.subject === subject &&
              h.employment === employment
          )
          .sort((a, b) => (a.date < b.date ? 1 : -1));

        const latestPerStudent = {};
        for (const record of matching) {
          for (const r of record.records || []) {
            if (!(r.studentId in latestPerStudent)) {
              latestPerStudent[r.studentId] = r.status;
            }
          }
        }
        if (!cancelled) setLastStatusByStudent(latestPerStudent);
      } catch (err) {
        console.error("getTeacherAttendance failed:", err);
        if (!cancelled) setLastStatusByStudent({});
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, semester, subject, employment, canTakeAttendance]);

  const classStudents = assignment
    ? allStudents.filter(
        (s) =>
          s.department === department &&
          s.semester === semester &&
          (s.employment || "full_time") === employment
      )
    : [];

  useEffect(() => {
    const initial = {};
    classStudents.forEach((s) => (initial[s.id] = "present"));
    setStatuses(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allStudents, department, semester, employment]);

  const setStatus = (studentId, status) =>
    setStatuses((s) => ({ ...s, [studentId]: status }));

  const handleSubmit = async () => {
    if (!assignment) {
      toast.error("Fadlan dooro department, semester, subject iyo nooca.");
      return;
    }
    if (isHoliday) {
      toast.error("Xaadirinta waa la xayiray — waa fasax.");
      return;
    }
    if (!isCorrectDay) {
      toast.error(`Waxaad kaliya xaadirin kartaa maalinta ${scheduledDay}.`);
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
  const rosterLoading = loading || loadingHoliday || (loadingHistory && !canTakeAttendance);

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

  const statusBadge = (status) => {
    if (status === "present")
      return <span className="rounded-full bg-sage/15 px-2.5 py-1 text-xs font-medium text-sage">Present</span>;
    if (status === "absent")
      return <span className="rounded-full bg-rose/10 px-2.5 py-1 text-xs font-medium text-rose">Absent</span>;
    if (status === "situation")
      return <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-medium text-gold-700">Situation</span>;
    return <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-400">Wali lama duubin</span>;
  };

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-navy-800 sm:text-2xl">
        Geli Xaadirinta
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Taariikhda maanta: <span className="font-mono">{date}</span> ·{" "}
        <span className="font-medium">{currentDayName}</span>
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
        {scheduledDay && (
          <p className="mt-3 text-xs text-navy-500">
            Maalinta la qaaday: <span className="font-semibold text-navy-700">{scheduledDay}</span>
          </p>
        )}
      </div>

      {/* Holiday banner — takes priority over the wrong-day banner */}
      {assignment && isHoliday && (
        <div className="mt-5 rounded-xl border border-rose/30 bg-rose/5 p-6 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose/10 text-rose">
            <CalendarOff size={20} />
          </span>
          <p className="mt-3 text-sm font-semibold text-navy-800">
            Waa Fasax: <span className="text-rose">{activeHoliday.title}</span>
          </p>
          <p className="mt-1 text-xs text-navy-500">
            {activeHoliday.startDate} → {activeHoliday.endDate} — Xaadirinta waa la xayiray.
          </p>
          {holidayCountdown && (
            <div className="mt-4 flex justify-center gap-4">
              <div>
                <p className="font-display text-2xl font-semibold text-navy-800">{holidayCountdown.days}</p>
                <p className="text-[10px] uppercase tracking-wide text-navy-400">Days</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-navy-800">{holidayCountdown.hours}</p>
                <p className="text-[10px] uppercase tracking-wide text-navy-400">Hours</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-navy-800">{holidayCountdown.minutes}</p>
                <p className="text-[10px] uppercase tracking-wide text-navy-400">Minutes</p>
              </div>
            </div>
          )}
          {holidayCountdown && (
            <p className="mt-2 text-xs font-medium text-navy-500">
              = {holidayCountdown.totalHours} Hours Total · {holidayCountdown.totalMinutes} Minutes Total
            </p>
          )}
          <p className="mt-3 text-[11px] text-navy-400">
            Ilaa fasaxa laga soo noqonayo ayaad heli kartaa xaadirinta.
          </p>
        </div>
      )}

      {/* Wrong day (no holiday) — countdown banner */}
      {assignment && !isHoliday && scheduledDay && !isCorrectDay && (
        <div className="mt-5 rounded-xl border border-gold-300 bg-gold-50 p-6 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gold-100 text-gold-700">
            <CalendarClock size={20} />
          </span>
          <p className="mt-3 text-sm font-semibold text-navy-800">
            Xaadirintan waxaa loo qaadaa kaliya <span className="text-gold-700">{scheduledDay}</span>
          </p>
          <p className="mt-1 text-xs text-navy-500">
            Maanta waa {currentDayName} — ma xaadirin kartid maalintan.
          </p>
          {countdown && (
            <div className="mt-4 flex justify-center gap-4">
              <div>
                <p className="font-display text-2xl font-semibold text-navy-800">{countdown.days}</p>
                <p className="text-[10px] uppercase tracking-wide text-navy-400">Days</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-navy-800">{countdown.hours}</p>
                <p className="text-[10px] uppercase tracking-wide text-navy-400">Hours</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-navy-800">{countdown.minutes}</p>
                <p className="text-[10px] uppercase tracking-wide text-navy-400">Minutes</p>
              </div>
            </div>
          )}
          {countdown && (
            <p className="mt-2 text-xs font-medium text-navy-500">
              = {countdown.totalHours} Hours Total · {countdown.totalMinutes} Minutes Total
            </p>
          )}
          <p className="mt-3 text-[11px] text-navy-400">
            Ilaa {scheduledDay} ee soo socota ayaad heli kartaa.
          </p>
        </div>
      )}

      {isLocked && canTakeAttendance && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-gold-300 bg-gold-50 px-4 py-3 text-sm text-navy-700">
          <Lock size={15} className="mt-0.5 shrink-0 text-gold-600" />
          <span>
            Xaadirinta maanta ee <strong>{subject}</strong> waa hore loo
            kaydiyay. Waxaad heli doontaa asbuuca xiga.
          </span>
        </div>
      )}

      {/* Student roster */}
      <div className="mt-5 overflow-hidden rounded-xl border border-navy-100 bg-white">
        <div className="border-b border-navy-100 bg-navy-50/60 px-4 py-3 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            {classStudents.length} arday
            {employment && (
              <span className="ml-1.5 font-normal normal-case text-navy-400">
                ({employment === "full_time" ? "Full Time" : "Part Time"})
              </span>
            )}
            {!canTakeAttendance && assignment && (
              <span className="ml-1.5 font-normal normal-case text-gold-600">
                — xaaladdii ugu dambeysay
              </span>
            )}
          </p>
        </div>

        {rosterLoading && (
          <p className="p-8 text-center text-sm text-navy-400">
            Soo dejinaya...
          </p>
        )}

        {!rosterLoading && !assignment && (
          <p className="p-8 text-center text-sm text-navy-400">
            Dooro Department, Semester, Subject iyo Nooca si ardayda loo muujiyo.
          </p>
        )}

        {!rosterLoading && assignment && classStudents.length === 0 && (
          <p className="p-8 text-center text-sm text-navy-400">
            Arday lama helin department + semester + nooca-kan.
          </p>
        )}

        {!rosterLoading &&
          classStudents.map((s, i) => (
            <div
              key={s.id}
              className={`flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
                i !== classStudents.length - 1 ? "border-b border-navy-50" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium text-navy-800">{s.fullName}</p>
                <p className="font-mono text-xs text-navy-400">
                  {s.id}
                  {!canTakeAttendance && (
                    <span className="ml-2 font-sans text-navy-400">
                      · {s.department} · {s.semester?.replace("_", " ")}
                    </span>
                  )}
                </p>
              </div>

              {canTakeAttendance ? (
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
              ) : (
                statusBadge(lastStatusByStudent[s.id])
              )}
            </div>
          ))}
      </div>

      {canTakeAttendance && !isLocked && classStudents.length > 0 && (
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