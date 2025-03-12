// routes/adminRoutes.js
import express from "express";
import { registerAdmin,verifyAdminOTP,loginAdmin, getCollege, googleAuth, logoutAdmin,verifyToken } from "../controller/admin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
// import {joinReq} from "../controller/admin.controller.js";
const router = express.Router();

router.post("/register", registerAdmin);
router.post("/verify-otp",verifyAdminOTP);
router.post("/login", loginAdmin);
router.post("/college",verifyJWT,getCollege);
router.post("/google",googleAuth);
router.post("/logout",verifyJWT,logoutAdmin);
router.post("/verify-token",verifyJWT,verifyToken);
// router.get("/join",verifyJWT,joinReq);

export default router;
