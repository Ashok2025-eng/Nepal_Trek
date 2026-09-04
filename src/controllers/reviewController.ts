import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Review from "../models/review.model"
import Booking from "../models/booking.model";
import Trek from "../models/trek.model";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

// @desc    Create a review (only for completed bookings)
// @route   POST /api/reviews
export const createReview = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    if (booking.user.toString() !== (req.user!._id as mongoose.Types.ObjectId).toString()) {
      return next(new AppError("You can only review your own bookings", 403));
    }

    if (booking.status !== "completed") {
      return next(
        new AppError("You can only review treks after your booking is completed", 400)
      );
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return next(new AppError("You have already reviewed this booking", 400));
    }

    const review = await Review.create({
      user: req.user!._id,
      trek: booking.trek,
      booking: bookingId,
      rating,
      comment,
    });

    await updateTrekAverageRating(booking.trek.toString());

    res.status(201).json({
      success: true,
      data: review,
    });
  }
);
// @desc    Get all reviews for a specific trek (public)
// @route   GET /api/treks/:trekId/reviews
export const getTrekReviews = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reviews = await Review.find({ trek: req.params.trekId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  },
);

// @desc    Delete own review
// @route   DELETE /api/reviews/:id
export const deleteReview = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new AppError("Review not found", 404));
    }

    if (
      review.user.toString() !==
        (req.user!._id as mongoose.Types.ObjectId).toString() &&
      req.user!.role !== "admin"
    ) {
      return next(new AppError("You can only delete your own reviews", 403));
    }

    const trekId = review.trek.toString();
    await review.deleteOne();
    await updateTrekAverageRating(trekId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  },
);

// Helper: recalculates and saves a trek's average rating
async function updateTrekAverageRating(trekId: string) {
  const stats = await Review.aggregate([
    { $match: { trek: new mongoose.Types.ObjectId(trekId) } },
    {
      $group: {
        _id: "$trek",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Trek.findByIdAndUpdate(trekId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Trek.findByIdAndUpdate(trekId, {
      averageRating: 0,
      numReviews: 0,
    });
  }
}

import mongoose from "mongoose";
