import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Users, GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const roles = [
  { key: "admin", label: "Admin", icon: ShieldCheck },
  { key: "teacher", label: "Teacher", icon: Users },
  { key: "student", label: "Student", icon: GraduationCap },
];

export default function Login() {
  const [role, setRole] = useState("student");
  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginAdmin, loginTeacher, loginStudent } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (role === "admin") {
        await loginAdmin(idOrEmail, password);
        navigate("/admin");
      } else if (role === "teacher") {
        await loginTeacher(idOrEmail, password);
        navigate("/teacher");
      } else {
        await loginStudent(idOrEmail, password);
        navigate("/student");
      }
      toast.success("Ku soo dhawoow!");
    } catch (err) {
      toast.error(err.message || "Wax qalad ah ayaa dhacay.");
    } finally {
      setLoading(false);
    }
  };

  const placeholders = {
    admin: "Username",
    teacher: "Username-ka Teacherka",
    student: "Student ID (tusaale: 8029)",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-700 px-4 py-12 ledger-lines">
      <div className="w-full max-w-md rounded-xl border border-gold-800/30 bg-navy-800 p-8 shadow-2xl">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/50 bg-gold-500/10 text-gold-400">
            <GraduationCap size={22} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-parchment">
            Gal Portal-ka
          </h1>
          <p className="mt-1 text-xs text-navy-300">
            Dooro doorkaaga oo geli xogtaada
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {roles.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors ${
                role === r.key
                  ? "border-gold-500 bg-gold-500/15 text-gold-300"
                  : "border-navy-500/40 text-navy-200 hover:bg-white/5"
              }`}
            >
              <r.icon size={17} />
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-navy-200">
              {placeholders[role]}
            </label>
            <input
              value={idOrEmail}
              onChange={(e) => setIdOrEmail(e.target.value)}
              required
              className="w-full rounded-md border border-navy-500/40 bg-navy-900/50 px-3.5 py-2.5 text-sm text-parchment outline-none placeholder:text-navy-400 focus:border-gold-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-navy-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-navy-500/40 bg-navy-900/50 px-3.5 py-2.5 text-sm text-parchment outline-none placeholder:text-navy-400 focus:border-gold-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gold-500 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-60"
          >
            {loading ? "Gelayaa..." : "Gal"}
          </button>
        </form>
      </div>
    </div>
  );
}