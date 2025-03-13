// routes/collegeRoutes.js
import express from "express";
import {
  createCollegeRequest,
  ReqAccept,
  ReqReject,
  getCollegeByCode,
  verifyCollege,
  applyRole,
} from "../controller/college.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Endpoint for admin to create a new college request
router.post("/create", verifyJWT,createCollegeRequest);

//Endpoint for admin to join a college
router.post("/join", verifyJWT);

// Endpoint to get college details for verification (developer view)
router.get("/verification/:code", getCollegeByCode);

router.post("/apply-role",verifyJWT,applyRole);

router.get("/joinReq/:code/:email/:role/accept",ReqAccept);
router.get("/joinReq/:code/reject",ReqReject);

// Endpoint for developer to verify or reject the college request
router.post("/verification/:code", verifyCollege);

export default router;
