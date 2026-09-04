import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Enquiry from "../models/enquiry.model";
import Trek from "../models/trek.model";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { sendEmail } from "../utils/sendEmail";

// @desc    Create a new enquiry (no login required)
// @route   POST /api/enquiries
export const createEnquiry = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      trekId,
      name,
      email,
      phone,
      message,
      numberOfPeople,
      tentativeDate,
    } = req.body;

    const trek = await Trek.findById(trekId);

    if (!trek) {
      return next(new AppError("Trek not found", 404));
    }

    const enquiry = await Enquiry.create({
      user: req.user?._id,
      trek: trekId,
      name,
      email,
      phone,
      message,
      numberOfPeople,
      tentativeDate,
    });
        // Auto-reply to the customer confirming we received their enquiry
try{
  await sendEmail({
    email,
    subject:"We Received Your Enquiry - Nepal Trek",
            message: `Hi ${name},\n\nThank you for your interest in "${trek.name}"!\n\nWe've received your enquiry and our team will get back to you within 24 hours with pricing and details.\n\nYour message:\n"${message}"\n\nIf you'd like a faster response, feel free to reach out to us directly.\n\nThanks for choosing us!`,

  })
}catch(err){
  console.error("Failed to send enquiry confirmation email:",err)
}

    res.status(201).json({
      success: true,
      data: enquiry,
    });
  },
);

// @desc    Get all enquiries (admin only)
// @route   GET /api/enquiries
export const getAllEnquiries = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const enquiries = await Enquiry.find()
      .populate("trek", "name region priceType")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  },
);

// @desc    Update enquiry status (admin only)
// @route   PUT /api/enquiries/:id/status
export const updateEnquiryStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;

    const validStatuses = ["new", "contacted", "closed"];

    if (!validStatuses.includes(status)) {
      return next(
        new AppError(`Status must be one of: ${validStatuses.join(", ")}`, 400),
      );
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );

    if (!enquiry) {
      return next(new AppError("Enquiry not found", 404));
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  },
);
