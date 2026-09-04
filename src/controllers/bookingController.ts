import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Booking from "../models/booking.model";
import Trek from "../models/trek.model";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { sendEmail } from "../utils/sendEmail";

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

// send booking confirmation email - failure here shouldnt block the booking
try{
  await sendEmail({
    email:req.user!.email,
    subject:"Booking Received -Nepal Trek",
        message: `Hi ${req.user!.name},\n\nWe've received your booking request for "${trek.name}".\n\nTrip details:\n- Start date: ${new Date(startDate).toDateString()}\n- Number of people: ${numberOfPeople}\n- Total price: $${totalPrice}\n- Advance amount due: $${advanceAmount}\n\nYour booking is currently PENDING. Our team will review and confirm it shortly.\n\nThank you for choosing us!`,
  })
}catch(err){
  console.error("Failed to send booking confirmation email:",err)
}

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
      .populate("trek", "name")
      .populate("user", "name email");

    if (!booking) {
      return next(new AppError("Booking not found", 404));
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