import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase config — Sahal Server POS project
const firebaseConfig = {
  apiKey: "AIzaSyAEwc0WkqlsGE-Ink1YhlJk2UcRg_XsDs8",
  authDomain: "sahal-server-pos.firebaseapp.com",
  projectId: "sahal-server-pos",
  storageBucket: "sahal-server-pos.firebasestorage.app",
  messagingSenderId: "330016123657",
  appId: "1:330016123657:web:05aa135950841a1e0781d8",
  measurementId: "G-S2EDY82VGC",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app, "gs://sahal-server-pos.firebasestorage.app");
export default app;