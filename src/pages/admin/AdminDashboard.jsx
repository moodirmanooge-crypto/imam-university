import { Routes, Route } from "react-router-dom";
import { LayoutDashboard, GraduationCap, Users2, MessagesSquare, Building2, UsersRound, CalendarClock, IdCard, Layers, Settings } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import AdminOverview from "./AdminOverview";
import AdminDepartments from "./AdminDepartments";
import AdminStudents from "./AdminStudents";
import AdminTeachers from "./AdminTeachers";
import AdminAllTeachers from "./AdminAllTeachers";
import AdminAttendance from "./AdminAttendance";
import CreateIdCard from "./CreateIdCard";
import AllIdCards from "./AllIdCards";
import AdminCommunity from "./AdminCommunity";
import AdminSettings from "./AdminSettings";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/teachers", label: "Add Teacher", icon: Users2 },
  { to: "/admin/students", label: "Add Students", icon: GraduationCap },
  { to: "/admin/departments", label: "classes", icon: Building2 },
  { to: "/admin/all-teachers", label: "All Teachers", icon: UsersRound },
  { to: "/admin/attendance", label: "Attendance", icon: CalendarClock },
  { to: "/admin/create-id-card", label: "Create ID Cards", icon: IdCard },
  { to: "/admin/all-id-cards", label: "All ID Cards", icon: Layers },
  { to: "/admin/community", label: "Posts", icon: MessagesSquare },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Maamulaha" navItems={navItems}>
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="all-teachers" element={<AdminAllTeachers />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="create-id-card" element={<CreateIdCard />} />
        <Route path="all-id-cards" element={<AllIdCards />} />
        <Route path="community" element={<AdminCommunity />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </DashboardLayout>
  );
}