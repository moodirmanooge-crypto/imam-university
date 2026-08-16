import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";

const AuthContext = createContext(null);

const STORAGE_KEY = "university_portal_session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persist = (session) => {
    setUser(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  };

  async function loginAdmin(username, password) {
    const ref = doc(db, COLLECTIONS.ADMIN, "admin");
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Admin ma jiro.");
    const data = snap.data();
    if (data.username !== username || data.password !== password) {
      throw new Error("Username ama password khaldan.");
    }
    const session = { role: "admin", uid: "admin", fullName: "Admin" };
    persist(session);
    return session;
  }

  async function loginTeacher(username, password) {
    const ref = doc(db, COLLECTIONS.TEACHERS, username);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Teacherku ma jiro.");
    const data = snap.data();
    if (data.password !== password) throw new Error("Password khaldan.");
    const session = {
      role: "teacher",
      uid: snap.id,
      fullName: data.fullName,
      photo: data.photo || "",
      assignments: data.assignments || [],
    };
    persist(session);
    return session;
  }

  async function loginStudent(studentId, password) {
    const ref = doc(db, COLLECTIONS.STUDENTS, studentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Studentgu ma jiro.");
    const data = snap.data();
    if (data.password !== password) throw new Error("Password khaldan.");
    const session = {
      role: "student",
      uid: studentId,
      fullName: data.fullName,
      photo: data.photo || "",
      department: data.department,
      faculty: data.faculty,
      semester: data.semester,
    };
    persist(session);
    return session;
  }

  // Patches the in-memory + persisted session with fields the user just
  // updated about themselves (e.g. Settings changing fullName or photo)
  // — avoids forcing a re-login just to see the change reflected.
  function refreshUser(patch) {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, loginAdmin, loginTeacher, loginStudent, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}