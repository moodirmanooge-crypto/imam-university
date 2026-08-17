import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";

// ---- Admin settings ----
export async function getAdminCredentials() {
  const snap = await getDoc(doc(db, COLLECTIONS.ADMIN, "admin"));
  if (!snap.exists()) throw new Error("Admin ma jiro.");
  return snap.data();
}

export async function updateAdminCredentials({ username, password }) {
  const updates = {};
  if (username) updates.username = username;
  if (password) updates.password = password;
  await updateDoc(doc(db, COLLECTIONS.ADMIN, "admin"), updates);
}

// ---- Departments ----
export async function addDepartment(name) {
  const ref = await addDoc(collection(db, COLLECTIONS.DEPARTMENTS), {
    name: name.trim(),
    pendingDeletion: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getDepartments() {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.DEPARTMENTS), orderBy("createdAt", "desc"))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((dpt) => dpt.pendingDeletion !== true);
}

export async function deleteDepartment(id) {
  await updateDoc(doc(db, COLLECTIONS.DEPARTMENTS, id), {
    pendingDeletion: true,
  });
}

// ---- Students ----
export async function addStudent(studentId, data) {
  await setDoc(doc(db, COLLECTIONS.STUDENTS, studentId), {
    employment: "full_time",
    ...data,
    pendingDeletion: false,
    createdAt: serverTimestamp(),
  });
}

export async function bulkAddStudents(entries) {
  const results = { added: [], skipped: [] };
  for (const entry of entries) {
    if (!entry.studentId) {
      results.skipped.push(entry);
      continue;
    }
    await setDoc(doc(db, COLLECTIONS.STUDENTS, entry.studentId), {
      fullName: entry.fullName || "",
      gender: entry.gender || "",
      department: entry.department || "",
      faculty: entry.faculty || "",
      semester: entry.semester || "",
      employment: entry.employment || "full_time",
      password: entry.password || "",
      pendingDeletion: false,
      createdAt: serverTimestamp(),
    });
    results.added.push(entry.studentId);
  }
  return results;
}

export async function getStudents() {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.STUDENTS), orderBy("createdAt", "desc"))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((s) => s.pendingDeletion !== true);
}

export async function deleteStudent(studentId) {
  await updateDoc(doc(db, COLLECTIONS.STUDENTS, studentId), {
    pendingDeletion: true,
  });
}

export async function bulkUpdateStudentSemester(studentIds, newSemester) {
  await Promise.all(
    studentIds.map((id) =>
      updateDoc(doc(db, COLLECTIONS.STUDENTS, id), { semester: newSemester })
    )
  );
}

// Moves every student in a department + semester to a new semester in
// one go — used when an admin transfers a teacher's assignment
// semester on AdminAllTeachers, so the whole class follows along
// rather than just the teacher's own record.
export async function bulkUpdateStudentSemesterByDept(department, oldSemester, newSemester) {
  const q = query(
    collection(db, COLLECTIONS.STUDENTS),
    where("department", "==", department),
    where("semester", "==", oldSemester)
  );
  const snap = await getDocs(q);
  const ids = snap.docs.map((d) => d.id);
  await Promise.all(
    ids.map((id) => updateDoc(doc(db, COLLECTIONS.STUDENTS, id), { semester: newSemester }))
  );
  return ids.length;
}

// ---- Teachers ----
export async function addTeacher(data) {
  const { username, ...rest } = data;
  await setDoc(doc(db, COLLECTIONS.TEACHERS, username), {
    ...rest,
    username,
    assignments: rest.assignments || [],
    pendingDeletion: false,
    createdAt: serverTimestamp(),
  });
  return username;
}

export async function getTeachers() {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.TEACHERS), orderBy("createdAt", "desc"))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((t) => t.pendingDeletion !== true);
}

export async function deleteTeacher(teacherId) {
  await updateDoc(doc(db, COLLECTIONS.TEACHERS, teacherId), {
    pendingDeletion: true,
  });
}

export async function updateTeacherAssignments(teacherId, assignments) {
  await updateDoc(doc(db, COLLECTIONS.TEACHERS, teacherId), {
    assignments,
  });
}

// ---- Classes ----
export async function addClass(data) {
  const ref = await addDoc(collection(db, COLLECTIONS.CLASSES), {
    ...data,
    studentIds: data.studentIds || [],
    pendingDeletion: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getClasses() {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.CLASSES), orderBy("createdAt", "desc"))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((c) => c.pendingDeletion !== true);
}

export async function deleteClass(classId) {
  await updateDoc(doc(db, COLLECTIONS.CLASSES, classId), {
    pendingDeletion: true,
  });
}

// ---- Holidays ----
// { title, startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }
// Attendance is blocked for every teacher on any date that falls
// within [startDate, endDate] of an active holiday.
export async function addHoliday({ title, startDate, endDate }) {
  const ref = await addDoc(collection(db, COLLECTIONS.HOLIDAYS), {
    title: title.trim(),
    startDate,
    endDate,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getHolidays() {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.HOLIDAYS), orderBy("startDate", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteHoliday(id) {
  await deleteDoc(doc(db, COLLECTIONS.HOLIDAYS, id));
}