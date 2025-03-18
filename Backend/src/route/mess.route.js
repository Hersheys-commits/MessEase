import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createMess,
  fetchMessDetails,
  getAllMessesInCollege,
  updateMessDetails,
  updateWeeklyFood,
} from "../controller/mess.controller.js";
const router = express.Router();

router.post("/create", verifyJWT, createMess);
router.get("/:code", verifyJWT, fetchMessDetails);
router.put("/:code", verifyJWT, updateMessDetails);
router.put("/:code/food", verifyJWT, updateWeeklyFood);
router.post("/fetchAllMesses", verifyJWT, getAllMessesInCollege);

export default router;
