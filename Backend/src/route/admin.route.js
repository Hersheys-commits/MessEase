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
<<<<<<< HEAD
// import {joinReq} from "../controller/admin.controller.js";
=======
import { upload } from "../middleware/multer.middleware.js";
import {
  getAllStudents,
  getFilterOptions,
  getStudentById,
  toggleBlockStudent,
} from "../controller/student.controller.js";

>>>>>>> newBranch
const router = express.Router();

router.post("/register", registerAdmin);
router.post("/verify-otp", verifyAdminOTP);
router.post("/login", loginAdmin);
<<<<<<< HEAD
router.post("/college",verifyJWT,getCollege);
router.post("/google",googleAuth);
router.post("/logout",verifyJWT,logoutAdmin);
router.post("/verify-token",verifyJWT,verifyToken);
// router.get("/join",verifyJWT,joinReq);
=======
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
router.get("/students", verifyJWT, getAllStudents);
router.get("/students/filter-options", verifyJWT, getFilterOptions);
router.get("/students/:id", verifyJWT, getStudentById);
router.put("/students/:id/toggle-block", verifyJWT, toggleBlockStudent);
>>>>>>> newBranch

export default router;
