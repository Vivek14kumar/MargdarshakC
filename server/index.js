import "./config/env.js"; // 🔥 FIRST LINE
import express from "express";
import cors from "cors";
//import dotenv from "dotenv";

import adminRoutes from "./routes/adminRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js"
import cloudinaryRoutes from "./routes/cloudinaryRoutes.js";
import photoRoutes from "./routes/photoRoutes.js";
import resultRoutes from "./routes/resultsRoutes.js";

//dotenv.config();
const app = express();

console.log("☁ Cloudinary config index:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api", pdfRoutes); // ✅ API PATH
app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/results",resultRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Coaching Backend Running (Firebase Admin)");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
