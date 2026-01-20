// server/routes/courseRoutes.js
import express from "express";
import { addCourse, getCourses } from "../services/courseService.js";

const router = express.Router();

// Add new course
router.post("/add", async (req, res) => {
  const { name, desc, fees, duration } = req.body;

  if (!name || !desc || !fees || !duration) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const result = await addCourse({ name, desc, fees, duration });
  res.json(result);
});

// Get all courses
router.get("/", async (req, res) => {
  const courses = await getCourses();
  res.json(courses);
});

export default router;
