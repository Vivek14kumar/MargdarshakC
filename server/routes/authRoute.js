/*import express from "express";
import { signupUser } from "../services/authService.js";

const router = express.Router();

// Admin signup
router.post("/admin/signup", async (req, res) => {
  const { email, password } = req.body;
  const result = await signupUser(email, password, "admin");
  res.json(result);
});

// Student signup
router.post("/student/signup", async (req, res) => {
  const { email, password } = req.body;
  const result = await signupUser(email, password, "student");
  res.json(result);
});

export default router;
*/