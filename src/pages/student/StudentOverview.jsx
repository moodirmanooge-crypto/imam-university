import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, CalendarX2, Percent, User, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getStudentAttendance } from "../../firebase/attendance";

export default function StudentOverview() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTeacher, setOpenTeacher] = useState(null);

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
      setRecords(await getStudentAttendance(user.uid));
      setLoading(false);
    })();
  }, [user.uid]);

  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const rate = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

  const stats = [
    { label: "Maalmaha Xaadir", value: present, icon: CalendarCheck2, color: "text-sage", bg: "bg-sage/10" },
    { label: "Maalmaha Maqan", value: absent, icon: CalendarX2, color: "text-rose", bg: "bg-rose/10" },
    { label: "Heerka Xaadirinta", value: `${rate}%`, icon: Percent, color: "text-gold-600", bg: "bg-gold-100" },
  ];

  // Group every attendance record by teacher, so the student can open
  // one teacher at a time and see just their days present/absent,
  // instead of one long mixed list.
  const byTeacher = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const key = r.teacherName || "Teacher";
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return Object.entries(map)
      .map(([teacherName, recs]) => {
        const p = recs.filter((r) => r.status === "present").length;
        const a = recs.filter((r) => r.status === "absent").length;
        return {
          teacherName,
          records: recs.sort((x, y) => (x.date < y.date ? 1 : -1)),
          present: p,
          absent: a,
          rate: recs.length > 0 ? Math.round((p / recs.length) * 100) : 0,
        };
      })
      .sort((a, b) => a.teacherName.localeCompare(b.teacherName));
  }, [records]);

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-navy-800 sm:text-2xl">
        Xaadirintayda
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Welcome-{user.fullName} — {user.department}, {user.semester?.replace("_", " ")}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-navy-100 bg-white p-5 sm:p-6">
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
              <s.icon size={18} />
            </span>
            <p className="mt-4 font-display text-2xl font-semibold text-navy-800 sm:text-3xl">
              {loading ? "…" : s.value}
            </p>
            <p className="mt-1 text-sm text-navy-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-navy-700">
          Teacher kasta oo aad wax ka bartay
        </h2>

        {loading && (
          <p className="rounded-xl border border-navy-100 bg-white p-6 text-center text-sm text-navy-400">
            Soo dejinaya...
          </p>
        )}

        {!loading && byTeacher.length === 0 && (
          <p className="rounded-xl border border-navy-100 bg-white p-6 text-center text-sm text-navy-400">
            Weli xaadirin lama duubin.
          </p>
        )}

        <div className="space-y-3">
          {byTeacher.map((t) => {
            const isOpen = openTeacher === t.teacherName;
            return (
              <div
                key={t.teacherName}
                className="overflow-hidden rounded-xl border border-navy-100 bg-white"
              >
                <button
                  onClick={() => setOpenTeacher(isOpen ? null : t.teacherName)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-700 text-gold-400">
                      <User size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy-800">
                        {t.teacherName}
                      </p>
                      <p className="text-xs text-navy-500">
                        {t.records.length} Days ·{" "}
                        <span className="text-sage">{t.present} xaadir</span> ·{" "}
                        <span className="text-rose">{t.absent} maqan</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-600">
                      {t.rate}%
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
                    {t.records.map((r, i) => (
                      <div
                        key={r.id + i}
                        className={`flex items-center justify-between px-4 py-3 sm:px-5 ${
                          i !== t.records.length - 1 ? "border-b border-navy-50" : ""
                        }`}
                      >
                        <div>
                          <p className="font-mono text-xs text-navy-600">{r.date}</p>
                          {r.subject && (
                            <p className="text-[11px] text-navy-400">{r.subject}</p>
                          )}
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
                          {r.status === "present"
                            ? "Xaadir"
                            : r.status === "situation"
                            ? "Situation"
                            : "Maqan"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}