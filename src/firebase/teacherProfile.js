// src/firebase/teacherProfile.js
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";

export async function getTeacherProfile(teacherId) {
  const snap = await getDoc(doc(db, COLLECTIONS.TEACHERS, teacherId));
  if (!snap.exists()) throw new Error("Teacherku ma jiro.");
  return snap.data();
}

// Teacher can update their own fullName, photo, and password — never
// username (that stays the login key / document ID forever).
export async function updateTeacherProfile(teacherId, { fullName, photo, password }) {
  const updates = {};
  if (fullName !== undefined) updates.fullName = fullName;
  if (photo !== undefined) updates.photo = photo;
  if (password) updates.password = password;
  await updateDoc(doc(db, COLLECTIONS.TEACHERS, teacherId), updates);
}