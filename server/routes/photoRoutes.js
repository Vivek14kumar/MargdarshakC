// server/routes/photoRoutes.js
import express from "express";
import admin from "../config/firebaseAdmin.js";
import { deleteFromCloudinary } from "../services/cloudinaryService.js";

const router = express.Router();
const db = admin.firestore();

router.post("/", async (req, res) => {
  const { title, url, publicId } = req.body;

  const doc = await db.collection("photos").add({
    title,
    url,
    publicId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  res.json({ id: doc.id });
});

router.get("/", async (req, res) => {
  const snap = await db.collection("photos").orderBy("createdAt", "desc").get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});

router.delete("/:id", async (req, res) => {
  const ref = db.collection("photos").doc(req.params.id);
  const snap = await ref.get();

  if (!snap.exists) return res.sendStatus(404);

  await deleteFromCloudinary(snap.data().publicId);
  await ref.delete();

  res.json({ success: true });
});

export default router;
