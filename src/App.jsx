//src/app.jsx
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Community from "./pages/Community";
import Login from "./pages/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import Studentsshboard from "./pages/student/StudentDashboard";

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/*"
          element={
            <ProtectedRoute role="student">
              <Studentsshboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
