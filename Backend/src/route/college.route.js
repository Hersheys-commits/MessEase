// routes/collegeRoutes.js
import express from "express";
import {
  createCollegeRequest,
  getCollegeByCode,
  verifyCollege,
} from "../controller/college.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Endpoint for admin to create a new college request
router.post("/create", verifyJWT,createCollegeRequest);

// Endpoint to get college details for verification (developer view)
router.get("/verification/:code", getCollegeByCode);

// Endpoint for developer to verify or reject the college request
router.post("/verification/:code", verifyCollege);

export default router;
