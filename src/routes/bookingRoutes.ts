import express from "express";
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  updateBookingStatus,
} from "../controllers/bookingController";
import { protect, restrictTo } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/", protect, restrictTo("admin"), getAllBookings);
router.put("/:id/status", protect, restrictTo("admin"), updateBookingStatus);
export default router;
