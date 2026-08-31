import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Booking from "../models/booking.model";
import Trek from "../models/trek.model";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

// @desc    Create a new booking
// @route   POST /api/bookings
export const createBooking = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { trekId, startDate, numberOfPeople } = req.body;

    const trek = await Trek.findById(trekId);

    if (!trek) {
      return next(new AppError("Trek not found", 404));
    }

    if (trek.priceType !== "fixed") {
      return next(
        new AppError(
          "This trek requires a custom quote. Please enquire directly.",
          400,
        ),
      );
    }

    if (numberOfPeople > trek.maxGroupSize) {
      return next(
        new AppError(
          `Maximum group size for this trek is ${trek.maxGroupSize}`,
          400,
        ),
      );
    }

    const totalPrice = (trek.price as number) * numberOfPeople;
    const advanceAmount = (trek.advanceAmount as number) * numberOfPeople;

    const booking = await Booking.create({
      user: req.user!._id,
      trek: trek._id,
      startDate,
      numberOfPeople,
      totalPrice,
      advanceAmount,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  },
);

// @desc    Get logged-in user's own bookings
// @route   GET /api/bookings/my
export const getMyBookings = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const bookings = await Booking.find({ user: req.user!._id }).populate(
      "trek",
      "name region duration price images",
    );

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  },
);

// @desc    Get all bookings (admin only)
// @route   GET /api/bookings
export const getAllBookings = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const bookings = await Booking.find()
      .populate("trek", "name region duration price")
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  },
);
