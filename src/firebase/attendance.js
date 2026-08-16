import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";

function nowTimeStr() {
  return new Date().toTimeString().slice(0, 5);
}

export async function getClassStudents(studentIds) {
  if (!studentIds || studentIds.length === 0) return [];
  const results = await Promise.all(
    studentIds.map(async (id) => {
      const snap = await getDoc(doc(db, COLLECTIONS.STUDENTS, id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    })
  );
  return results.filter(Boolean);
}

export async function getAllStudents() {
  const snap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((s) => s.pendingDeletion !== true);
}

export async function getExistingAttendance({ teacherId, department, semester, subject, date }) {
  const q = query(
    collection(db, COLLECTIONS.ATTENDANCE),
    where("teacherId", "==", teacherId),
    where("department", "==", department),
    where("semester", "==", semester),
    where("subject", "==", subject),
    where("date", "==", date)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function submitAttendance({
  teacherId,
  teacherName,
  department,
  semester,
  subject,
  employment,
  date,
  time,
  records,
}) {
  await addDoc(collection(db, COLLECTIONS.ATTENDANCE), {
    teacherId,
    teacherName,
    department,
    semester,
    subject,
    employment,
    date,
    time: time || nowTimeStr(),
    records,
    locked: true,
    createdAt: new Date().toISOString(),
  });
}

export async function getTeacherAttendance(teacherId) {
  const q = query(
    collection(db, COLLECTIONS.ATTENDANCE),
    where("teacherId", "==", teacherId),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllAttendance() {
  const q = query(collection(db, COLLECTIONS.ATTENDANCE), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateAttendanceRecordStatus(attendanceId, studentId, newStatus, records) {
  const updated = records.map((r) =>
    r.studentId === studentId ? { ...r, status: newStatus } : r
  );
  await updateDoc(doc(db, COLLECTIONS.ATTENDANCE, attendanceId), {
    records: updated,
  });
  return updated;
}

// Student: every attendance record mentioning this student, now also
// carrying teacherName + subject so StudentOverview can group by
// teacher.
export async function getStudentAttendance(studentId) {
  const snap = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
  const results = [];
  snap.forEach((d) => {
    const data = d.data();
    const record = data.records?.find((r) => r.studentId === studentId);
    if (record) {
      results.push({
        id: d.id,
        date: data.date,
        time: data.time,
        subject: data.subject,
        department: data.department,
        semester: data.semester,
        teacherName: data.teacherName || "Teacher",
        status: record.status,
      });
    }
  });
  return results.sort((a, b) => (a.date < b.date ? 1 : -1));
}