// routes/collegeRoutes.js
import express from "express";
import {
  createCollegeRequest,
  getCollege,
  getCollegeByCode,
  updateCollegeDetails,
  verifyCollege,
} from "../controller/college.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/getCollege", verifyJWT, getCollege);
// Endpoint for admin to create a new college request
router.post("/create", verifyJWT, createCollegeRequest);

// Endpoint to get college details for verification (developer view)
router.get("/verification/:code", getCollegeByCode);

// Endpoint for developer to verify or reject the college request
router.post("/verification/:code", verifyCollege);
router.patch(
  "/update-college",
  verifyJWT,
  upload.single("logo"),
  updateCollegeDetails
);

export default router;
