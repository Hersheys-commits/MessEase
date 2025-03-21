// routes/adminRoutes.js
import express from "express";
import {
  registerAdmin,
  verifyAdminOTP,
  loginAdmin,
  getCollege,
  googleAuth,
  logoutAdmin,
  verifyToken,
  getAdminProfile,
  updateAdminProfile,
} from "../controller/admin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/verify-otp", verifyAdminOTP);
router.post("/login", loginAdmin);
router.post("/college", verifyJWT, getCollege);
router.post("/google", googleAuth);
router.post("/logout", verifyJWT, logoutAdmin);
router.post("/verify-token", verifyJWT, verifyToken);
router.get("/profile", verifyJWT, getAdminProfile);
router.patch(
  "/update-profile",
  verifyJWT,
  upload.single("profilePicture"),
  updateAdminProfile
);

export default router;
