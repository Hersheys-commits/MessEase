// routes/adminRoutes.js
import express from "express";
import { registerAdmin, loginAdmin, getCollege } from "../controller/admin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/college",verifyJWT,getCollege);

export default router;
