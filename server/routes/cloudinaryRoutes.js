// server/routes/cloudinaryRoutes.js
import express from "express";
import { getUploadSignature } from "../services/cloudinaryService.js";

const router = express.Router();

router.get("/sign", (req, res) => {
  const folder = req.query.folder || "default";
  res.json(getUploadSignature(folder));
});

export default router;
