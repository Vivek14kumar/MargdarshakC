import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyClMQocnDPiBxtzyPuwhTOdamQbdB0FaMo",
  authDomain: "coaching-data.firebaseapp.com",
  projectId: "coaching-data",
  storageBucket: "coaching-data.firebasestorage.app",
  messagingSenderId: "77942869656",
  appId: "1:77942869656:web:3de714901402a5ecf94aed",
  measurementId: "G-S20J4G6PNQ"
};

/* ================= INITIALIZE ================= */
const app = initializeApp(firebaseConfig);

/* ================= AUTH (🔥 IMPORTANT) ================= */
export const auth = getAuth(app);

// 🔥 REQUIRED for PWA + TWA
setPersistence(auth, browserLocalPersistence);

/* ================= DATABASES ================= */
export const firestore = getFirestore(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
