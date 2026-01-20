import express from "express";
import admin from "../config/firebaseAdmin.js";

const router = express.Router();
const db = admin.firestore();

/**
 * 🔐 ADMIN SIGNUP (ONLY ONCE)
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!email || !password || !mobile) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔍 Check if admin already exists
    const adminSnap = await db.collection("admins").limit(1).get();
    if (!adminSnap.empty) {
      return res.status(403).json({
        message: "Admin already exists. Signup disabled.",
      });
    }

    // 🔐 Create admin in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      phoneNumber: `+91${mobile}`,
      displayName: name,
    });

    // 📄 Save admin profile
    await db.collection("admins").doc(userRecord.uid).set({
      name,
      email,
      mobile,
      role: "ADMIN",
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Admin created successfully",
      uid: userRecord.uid,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 🔑 ADMIN LOGIN (TOKEN VERIFY)
 */
router.post("/login", async (req, res) => {
  try {
    const { idToken } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);

    const adminDoc = await db.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists) {
      return res.status(403).json({ message: "Not an admin" });
    }

    res.json({
      message: "Admin login success",
      admin: adminDoc.data(),
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
