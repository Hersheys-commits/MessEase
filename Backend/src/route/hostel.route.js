import express from "express";
import { createHostel } from "../controller/hostel.controller.js";
const router = express.Router();

router.post("/create-hostel", createHostel);

export default router;