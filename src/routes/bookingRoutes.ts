import express from "express";
import {
  createBooking,
  getAllBookings,
  getMyBookings,
} from "../controllers/bookingController";
import { protect, restrictTo } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/", protect, restrictTo("admin"), getAllBookings);

export default router;
