import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";

const ID_CARDS_COLLECTION = "id_cards";

// Save (create or overwrite) an ID card, keyed by its ID number.
export async function saveIdCard({ idNo, name, title, issue, expiry, photo }) {
  await setDoc(doc(db, ID_CARDS_COLLECTION, idNo), {
    idNo,
    name,
    title: title || "",
    issue: issue || "",
    expiry: expiry || "",
    photo: photo || "",
    printed: false,
    createdAt: serverTimestamp(),
  });
}

export async function getIdCards() {
  const snap = await getDocs(
    query(collection(db, ID_CARDS_COLLECTION), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteIdCard(idNo) {
  await deleteDoc(doc(db, ID_CARDS_COLLECTION, idNo));
}

export async function markIdCardPrinted(idNo, printed = true) {
  await updateDoc(doc(db, ID_CARDS_COLLECTION, idNo), { printed });
}