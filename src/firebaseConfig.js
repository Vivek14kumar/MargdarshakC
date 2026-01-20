// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // ← add this

// 1️⃣ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyClMQocnDPiBxtzyPuwhTOdamQbdB0FaMo",
  authDomain: "coaching-data.firebaseapp.com",
  projectId: "coaching-data",
  storageBucket: "coaching-data.firebasestorage.app",
  messagingSenderId: "77942869656",
  appId: "1:77942869656:web:3de714901402a5ecf94aed",
  measurementId: "G-S20J4G6PNQ"
};

// 2️⃣ Initialize Firebase
const app = initializeApp(firebaseConfig);

// 3️⃣ Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app); // ✅ after `app` is defined
export const db = getDatabase(app);
// Storage
export const storage = getStorage(app); // ← export storage
//export const db = getFirestore(app);