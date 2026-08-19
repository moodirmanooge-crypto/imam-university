// src/layouts/DashboardLayout.jsx
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const ROLE_LABEL = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};

export default function DashboardLayout({ title, navItems, children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarAvatar = ({ size = 44 }) => (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold-500/40 bg-navy-800"
      style={{ width: size, height: size }}
    >
      <img
        src={user?.photo || logo}
        alt=""
        className="h-full w-full object-cover"
      />
    </span>
  );

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-5">
        <SidebarAvatar />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-parchment">
            {user?.fullName || title}
          </p>
          <p className="truncate text-xs text-gold-400/80">
            {ROLE_LABEL[user?.role] || ""}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gold-500/15 text-gold-400"
                  : "text-navy-200 hover:bg-navy-800 hover:text-parchment"
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose hover:bg-navy-800"
        >
          <LogOut size={17} />
          Ka bax
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-parchment">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-navy-800 bg-navy-900 md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="flex flex-1 flex-col md:hidden">
        <div className="flex items-center justify-between border-b border-navy-100 bg-navy-900 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <SidebarAvatar size={34} />
            <p className="text-sm font-semibold text-parchment">
              {user?.fullName || title}
            </p>
          </div>
          <button onClick={() => setOpen(true)} className="text-parchment">
            <Menu size={22} />
          </button>
        </div>

        {open && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex w-72 flex-col bg-navy-900">
              <div className="flex justify-end p-3">
                <button onClick={() => setOpen(false)} className="text-navy-300">
                  <X size={22} />
                </button>
              </div>
              <SidebarContent />
            </div>
            <div className="flex-1 bg-navy-950/60" onClick={() => setOpen(false)} />
          </div>
        )}

        <main className="flex-1 p-4">{children}</main>
      </div>

      {/* Desktop content */}
      <main className="hidden flex-1 p-8 md:block">{children}</main>
    </div>
  );
}