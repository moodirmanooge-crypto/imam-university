// src/firebase/studentProfile.js
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";

// Student can update their own fullName, photo, and password — never
// studentId (that stays the login key / document ID forever).
export async function updateStudentProfile(studentId, { fullName, photo, password }) {
  const updates = {};
  if (fullName !== undefined) updates.fullName = fullName;
  if (photo !== undefined) updates.photo = photo;
  if (password) updates.password = password;
  await updateDoc(doc(db, COLLECTIONS.STUDENTS, studentId), updates);
}