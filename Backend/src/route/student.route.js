import express from "express";
import { registerStudent, verifyStudentOTP, loginStudent } from "../controller/student.controller.js";
const router = express.Router();

router.post("/signup", registerStudent);
router.post("/verify-otp", verifyStudentOTP);
router.post("/login", loginStudent);

export default router;