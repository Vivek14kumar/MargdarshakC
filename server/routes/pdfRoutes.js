import express from "express";
import admin from "../config/firebaseAdmin.js";
import {
  getUploadSignature,
  deleteFromCloudinary,
} from "../services/cloudinaryService.js";

const router = express.Router();
const db = admin.firestore();

/* ===============================
   SIGNED UPLOAD API
================================ */
router.get("/pdf/sign", (req, res) => {
  const folder = req.query.folder;
  res.json(getUploadSignature(folder));
});

/* ===============================
   DELETE PDF (Cloudinary → Firestore)
================================ */
router.delete("/pdf/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // 1️⃣ Get Firestore document
    const docRef = db.collection("pdfs").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ message: "PDF not found" });
    }

    const data = snap.data();
    console.log("📄 Firestore data:", data);

    // 2️⃣ Delete from Cloudinary (ONLY if publicId exists)
    if (data.publicId) {
      const result = await deleteFromCloudinary(data.publicId);
      console.log("☁ Cloudinary delete result:", result);
    } else {
      console.warn("⚠ No publicId found, skipping Cloudinary delete");
    }

    // 3️⃣ Delete Firestore document
    await docRef.delete();
    console.log("🗑 Firestore doc deleted");

    res.json({ success: true });
  } catch (err) {
    console.error("🔥 DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
