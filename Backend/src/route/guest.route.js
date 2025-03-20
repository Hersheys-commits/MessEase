import express from "express";
import {
  checkAvailability,
  allocateRoom,
  allBookedRoom,
  deleteBookedRoom,
} from "../controller/guest.controller.js";

const router = express.Router();

router.post("/see-availability", checkAvailability);
router.post("/book-guest-room", allocateRoom);
router.get("/booked-guest-rooms", allBookedRoom); // to get all the booked guest rooms
router.delete("/cancel-booking", deleteBookedRoom);
export default router;
