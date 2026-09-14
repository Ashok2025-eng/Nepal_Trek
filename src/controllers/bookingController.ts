import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Booking from "../models/booking.model";
import Trek from "../models/trek.model";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { paginate } from "../utils/paginationAndFilter.utils";
import { sendEmail } from "../utils/sendEmail";

// Helper: calculates how many people are already booked for a trek+date
async function getBookedCount(trekId: string, startDate: Date): Promise<number> {
  const existingBookings = await Booking.find({
    trek: trekId,
    startDate,
    status: { $in: ["pending", "confirmed"] },
  });

  return existingBookings.reduce((sum, booking) => sum + booking.numberOfPeople, 0);
}

// Helper: rechecks and clears/sets the capacity flag for ALL bookings on a trek+date
async function recheckCapacityFlags(trekId: string, startDate: Date, maxGroupSize: number) {
  const bookings = await Booking.find({
    trek: trekId,
    startDate,
    status: { $in: ["pending", "confirmed"] },
  }).sort({ createdAt: 1 }); // earliest bookings get priority

  let runningTotal = 0;

  for (const booking of bookings) {
    runningTotal += booking.numberOfPeople;
    const shouldFlag = runningTotal > maxGroupSize;

    if (booking.needsCapacityReview !== shouldFlag) {
      booking.needsCapacityReview = shouldFlag;
      await booking.save();
    }
  }
}

// @desc    Check availability for a trek on a specific date
// @route   GET /api/bookings/availability?trekId=...&date=...
export const checkAvailability = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { trekId, date } = req.query;

    if (!trekId || !date) {
      return next(new AppError("trekId and date are required", 400));
    }

    const trek = await Trek.findById(trekId as string);

    if (!trek) {
      return next(new AppError("Trek not found", 404));
    }

    const bookedCount = await getBookedCount(trekId as string, new Date(date as string));
    const spotsLeft = trek.maxGroupSize - bookedCount;

    res.status(200).json({
      success: true,
      data: {
        maxGroupSize: trek.maxGroupSize,
        alreadyBooked: bookedCount,
        spotsLeft: spotsLeft > 0 ? spotsLeft : 0,
        isFull: spotsLeft <= 0,
      },
    });
  }
);

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
          400
        )
      );
    }

    const parsedDate = new Date(startDate);
    const alreadyBookedCount = await getBookedCount(trekId, parsedDate);
    const totalAfterThisBooking = alreadyBookedCount + numberOfPeople;
    const exceedsCapacity = totalAfterThisBooking > trek.maxGroupSize;

    const totalPrice = (trek.price as number) * numberOfPeople;
    const advanceAmount = (trek.advanceAmount as number) * numberOfPeople;

    const booking = await Booking.create({
      user: req.user!._id,
      trek: trek._id,
      startDate: parsedDate,
      numberOfPeople,
      totalPrice,
      advanceAmount,
      needsCapacityReview: exceedsCapacity,
    });

    try {
      await sendEmail({
        email: req.user!.email,
        subject: "Booking Received - Nepal Trek",
        message: `Hi ${req.user!.name},\n\nWe've received your booking request for "${trek.name}".\n\nTrip details:\n- Start date: ${parsedDate.toDateString()}\n- Number of people: ${numberOfPeople}\n- Total price: $${totalPrice}\n- Advance amount due: $${advanceAmount}\n\nYour booking is currently PENDING. Our team will review and confirm it shortly.\n\nThank you for choosing us!`,
      });
    } catch (err) {
      console.error("Failed to send booking confirmation email:", err);
    }

    res.status(201).json({
      success: true,
      data: booking,
      ...(exceedsCapacity && {
        notice: `This booking pushes the trek over its usual capacity (${trek.maxGroupSize}) for this date. Our team may arrange a staggered departure or additional guide support. You can check other dates via GET /api/bookings/availability.`,
      }),
    });
  }
);

// @desc    Get logged-in user's own bookings
// @route   GET /api/bookings/my
export const getMyBookings = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const bookings = await Booking.find({ user: req.user!._id }).populate(
      "trek",
      "name region duration price images"
    );

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  }
);

// @desc    Get all bookings (admin only)
// @route   GET /api/bookings
export const getAllBookings = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const queryObj: Record<string, any> = {};
    if (req.query.status) queryObj.status = req.query.status;
    if (req.query.needsCapacityReview) {
      queryObj.needsCapacityReview = req.query.needsCapacityReview === "true";
    }

    const result = await paginate(
      Booking,
      queryObj,
      { page: Number(req.query.page), limit: Number(req.query.limit) },
      [
        { path: "trek", select: "name region duration price" },
        { path: "user", select: "name email" },
      ]
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

// @desc    Update booking status (admin only)
// @route   PUT /api/bookings/:id/status
export const updateBookingStatus = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];

    if (!validStatuses.includes(status)) {
      return next(
        new AppError(`Status must be one of: ${validStatuses.join(", ")}`, 400)
      );
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("trek", "name maxGroupSize")
      .populate("user", "name email");

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

   // If this booking was cancelled, clear its own flag AND recheck other bookings' flags
if (status === "cancelled") {
  booking.needsCapacityReview = false;
  await booking.save();

  const trekData = booking.trek as any;
  await recheckCapacityFlags(trekData._id.toString(), booking.startDate, trekData.maxGroupSize);
}
    if (status === "confirmed" || status === "cancelled") {
      const trekData = booking.trek as any;
      const userData = booking.user as any;

      const trekName = trekData.name;
      const userEmail = userData.email;
      const userName = userData.name;

      try {
        await sendEmail({
          email: userEmail,
          subject:
            status === "confirmed"
              ? "Your Booking is Confirmed! - Nepal Trek"
              : "Booking Cancelled - Nepal Trek",
          message:
            status === "confirmed"
              ? `Hi ${userName},\n\nGreat news! Your booking for "${trekName}" has been CONFIRMED.\n\nWe'll be in touch with further trip details soon.\n\nSee you on the trail!`
              : `Hi ${userName},\n\nYour booking for "${trekName}" has been cancelled.\n\nIf you have any questions, please reach out to us.`,
        });
      } catch (err) {
        console.error("Failed to send status update email:", err);
      }
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  }
);