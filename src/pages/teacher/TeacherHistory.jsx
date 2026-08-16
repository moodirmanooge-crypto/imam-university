// src/pages/teacher/TeacherHistory.jsx
import { useEffect, useMemo, useState } from "react";
import { Search, ArrowLeft, CalendarCheck2, CalendarX2, Percent } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAllStudents, getStudentAttendance } from "../../firebase/attendance";
import toast from "react-hot-toast";

export default function TeacherHistory() {
  const { user } = useAuth();
  const assignments = user.assignments || [];

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

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

  useEffect(() => {
    (async () => {
      const all = await getAllStudents();
      setStudents(all);
      setLoading(false);
    })();
  }, []);

  // Every department + semester this teacher has ever taught, from
  // their assignments — used to show, by default, every student they
  // could have taken attendance for (not just the ones matching a
  // search).
  const myScopes = useMemo(
    () =>
      assignments.map((a) => ({ department: a.department, semester: a.semester })),
    [assignments]
  );

  const myStudents = useMemo(
    () =>
      students.filter((s) =>
        myScopes.some(
          (scope) => scope.department === s.department && scope.semester === s.semester
        )
      ),
    [students, myScopes]
  );

  const filtered = myStudents.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true; // show the full list by default
    return s.id?.toLowerCase().includes(q) || s.fullName?.toLowerCase().includes(q);
  });

  const openHistory = async (student) => {
    setSelectedStudent(student);
    setLoadingRecords(true);
    try {
      const data = await getStudentAttendance(student.id);
      setRecords(data);
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setLoadingRecords(false);
    }
  };

  const backToSearch = () => {
    setSelectedStudent(null);
    setRecords([]);
  };

  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const rate = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

  if (selectedStudent) {
    return (
      <div>
        <button
          onClick={backToSearch}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-navy-500 hover:text-navy-700"
        >
          <ArrowLeft size={14} />
          Dib ugu noqo Liiska
        </button>

        <h1 className="font-display text-2xl font-semibold text-navy-800">
          {selectedStudent.fullName}
        </h1>
        <p className="mt-1 font-mono text-xs text-navy-400">{selectedStudent.id}</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-navy-100 bg-white p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage/15 text-sage">
              <CalendarCheck2 size={16} />
            </span>
            <p className="mt-3 font-display text-2xl font-semibold text-navy-800">
              {loadingRecords ? "…" : present}
            </p>
            <p className="text-xs text-navy-500">Maalmaha Xaadir</p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-white p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose/10 text-rose">
              <CalendarX2 size={16} />
            </span>
            <p className="mt-3 font-display text-2xl font-semibold text-navy-800">
              {loadingRecords ? "…" : absent}
            </p>
            <p className="text-xs text-navy-500">Maalmaha Maqan</p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-white p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
              <Percent size={16} />
            </span>
            <p className="mt-3 font-display text-2xl font-semibold text-navy-800">
              {loadingRecords ? "…" : `${rate}%`}
            </p>
            <p className="text-xs text-navy-500">Heerka Xaadirinta</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-navy-100 bg-white">
          <div className="border-b border-navy-100 bg-navy-50/60 px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              Taariikhda oo Dhamaystiran
            </p>
          </div>
          {loadingRecords && (
            <p className="p-6 text-center text-sm text-navy-400">Soo dejinaya...</p>
          )}
          {!loadingRecords && records.length === 0 && (
            <p className="p-6 text-center text-sm text-navy-400">
              Weli xaadirin lama duubin Studentgan.
            </p>
          )}
          {records.map((r, i) => (
            <div
              key={r.id + i}
              className={`flex items-center justify-between px-5 py-3 ${
                i !== records.length - 1 ? "border-b border-navy-50" : ""
              }`}
            >
              <div>
                <p className="font-mono text-xs text-navy-500">{r.date}</p>
                <p className="text-[11px] text-navy-400">
                  {r.department} · {r.semester?.replace("_", " ")} · {r.subject}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  r.status === "present"
                    ? "bg-sage/15 text-sage"
                    : r.status === "situation"
                    ? "bg-gold-100 text-gold-700"
                    : "bg-rose/10 text-rose"
                }`}
              >
                {r.status === "present" ? "Xaadir" : r.status === "situation" ? "Situation" : "Maqan"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-800">
        History
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-md border border-navy-100 bg-white px-3 py-2.5">
        <Search size={16} className="text-navy-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Raadi Student: ID ama Magaca..."
          className="w-full text-sm outline-none"
        />
      </div>

      {loading && (
        <p className="mt-6 text-center text-sm text-navy-400">Soo dejinaya...</p>
      )}

      {!loading && (
        <div className="mt-4 overflow-hidden rounded-xl border border-navy-100 bg-white">
          <div className="border-b border-navy-100 bg-navy-50/60 px-5 py-2.5">
            <p className="text-xs font-semibold text-navy-500">
              {filtered.length} Student
            </p>
          </div>
          {filtered.length === 0 && (
            <p className="p-6 text-center text-sm text-navy-400">
              {myStudents.length === 0
                ? "Weli Student lagugu ma xilsan department/semester-kaaga."
                : "Wax natiijo ah lama helin."}
            </p>
          )}
          {filtered.map((s, i) => (
            <button
              key={s.id}
              onClick={() => openHistory(s)}
              className={`flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-navy-50/60 ${
                i !== filtered.length - 1 ? "border-b border-navy-50" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium text-navy-800">{s.fullName}</p>
                <p className="font-mono text-xs text-navy-400">
                  {s.id} · {s.department} · {s.semester?.replace("_", " ")}
                </p>
              </div>
              <span className="rounded-md bg-navy-700 px-3 py-1.5 text-xs font-semibold text-parchment">
                View History
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}