import express from "express";
import admin from "../config/firebaseAdmin.js";
import { deleteFromCloudinary } from "../services/cloudinaryService.js";

const router = express.Router();
const db = admin.firestore();

/* =====================================================
   ADD RESULT (PDF)
===================================================== */
router.post("/add", async (req, res) => {
  try {
    const { title, url, publicId } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: "Title and URL are required",
      });
    }

    await db.collection("results").add({
      title,
      url,
      publicId: publicId || null,
      type: "pdf",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.json({ success: true, message: "Result saved successfully" });
  } catch (err) {
    console.error("Results save error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   LIST RESULTS
===================================================== */
router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("results")
      .orderBy("createdAt", "desc")
      .get();

    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, results });
  } catch (err) {
    console.error("Fetch results error:", err);
    res.status(500).json({ success: false });
  }
});

/* =====================================================
   DELETE RESULT (PDF + MANUAL SAFE)
===================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = db.collection("results").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Result not found" });
    }

    const data = docSnap.data();

    /* 🔥 Delete from Cloudinary if PDF */
    if (data.type === "pdf" && data.publicId) {
      await deleteFromCloudinary(data.publicId);
    }

    /* 🔥 Delete from Firestore */
    await docRef.delete();

    res.json({ success: true, message: "Result deleted successfully" });
  } catch (err) {
    console.error("Delete result error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
