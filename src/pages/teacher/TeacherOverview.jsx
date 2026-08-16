import { useEffect } from "react";
import { BookOpenCheck, ArrowRight, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function TeacherOverview() {
  const { user } = useAuth();
  const assignments = user.assignments || [];

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

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-navy-700 p-6 text-parchment sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-500/10 sm:h-56 sm:w-56" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-500/50 bg-gold-500/10 text-gold-400 sm:h-14 sm:w-14">
            <GraduationCap size={24} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-300">
              Teacherka Portal
            </p>
            <h1 className="mt-1 font-display text-xl font-semibold sm:text-2xl">
              Welcome-{user.fullName}
            </h1>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-navy-500">
        “Your assigned assignments are listed below.” ✅
      </p>

      <div className="mt-4 rounded-xl border border-navy-100 bg-white p-5 sm:p-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-700 text-gold-400">
          <BookOpenCheck size={18} />
        </span>
        <p className="mt-4 text-sm font-medium text-navy-500">
          Assignments ({assignments.length})
        </p>
        <div className="mt-3 space-y-2">
          {assignments.length === 0 && (
            <p className="text-xs text-navy-400">
              Weli assignment lagugu ma xilsan.
            </p>
          )}
          {assignments.map((a, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-2 rounded-md bg-navy-50/60 px-3 py-2 text-xs"
            >
              <span className="font-semibold text-navy-700">
                {a.department || "—"}
              </span>
              <span className="text-navy-400">·</span>
              <span className="text-navy-600">
                {a.semester ? a.semester.replace("_", " ") : "—"}
              </span>
              <span className="text-navy-400">·</span>
              <span className="text-navy-600">{a.subject || a.className || "—"}</span>
              {a.employment && (
                <span
                  className={`sm:ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    a.employment === "full_time"
                      ? "bg-sage/15 text-sage"
                      : "bg-gold-100 text-gold-700"
                  }`}
                >
                  {a.employment === "full_time" ? "Full Time" : "Part Time"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <Link
        to="/teacher/attendance"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gold-500 px-6 py-3.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 sm:w-fit"
      >
        Geli Xaadirinta
        <ArrowRight size={16} strokeWidth={2.5} />
      </Link>
    </div>
  );
}