import express from "express";
import multer from "multer";
import { uploadToDrive } from "../services/driveService.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/file", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadToDrive(req.file);
    res.json({ success: true, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

export default router;
