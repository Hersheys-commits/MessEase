import express from "express";
import {
  checkAvailability,
  allocateRoom,
} from "../controller/guest.controller.js";

const router = express.Router();

router.post("/see-availability", checkAvailability);
router.post("/book-guest-room", allocateRoom);

export default router;
