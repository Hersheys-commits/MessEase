import express from "express";
import {
  registerStudent,
  verifyStudentOTP,
  loginStudent,
  googleAuth,
  logout,
  verifyToken,
} from "../controller/student.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", registerStudent);
router.post("/verify-otp", verifyStudentOTP);
router.post("/login", loginStudent);
router.post("/google", googleAuth);
router.post("/logout", verifyJWT, logout);
router.post("/verify-token", verifyJWT, verifyToken);

export default router;
