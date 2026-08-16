import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { LayoutDashboard, MessagesSquare, Settings } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StudentOverview from "./StudentOverview";
import StudentSettings from "./StudentSettings";
import Community from "../Community";

const navItems = [
  { to: "/student", label: "Xaadirintayda", icon: LayoutDashboard },
  { to: "/student/community", label: "Post", icon: MessagesSquare },
  { to: "/student/settings", label: "Settings", icon: Settings },
];

export default function Studentsshboard() {
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
    <DashboardLayout title="Studentga" navItems={navItems}>
      <Routes>
        <Route index element={<StudentOverview />} />
        <Route path="community" element={<Community />} />
        <Route path="settings" element={<StudentSettings />} />
      </Routes>
    </DashboardLayout>
  );
}