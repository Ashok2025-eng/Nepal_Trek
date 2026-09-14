import { NextFunction, Request, Response } from "express";
import Booking from "../models/booking.model";
import Trek from "../models/trek.model";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { paginate } from "../utils/paginationAndFilter.utils";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export const createTrek = catchAsync(async (req: Request, res: Response) => {
  const trek = await Trek.create(req.body);
  res.status(201).json({
    success: true,
    data: trek,
  });
});

export const getTreks = catchAsync(async (req: Request, res: Response) => {
  const queryObj: Record<string, any> = {};

  if (req.query.region) queryObj.region = req.query.region;
  if (req.query.difficulty) queryObj.difficulty = req.query.difficulty;
  if (req.query.priceType) queryObj.priceType = req.query.priceType;

  if (req.query.minPrice || req.query.maxPrice) {
    queryObj.price = {};
    if (req.query.minPrice) queryObj.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) queryObj.price.$lte = Number(req.query.maxPrice);
  }

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search as string, "i");
    queryObj.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  const result = await paginate(Trek, queryObj, {
    page: Number(req.query.page),
    limit: Number(req.query.limit),
  });

  res.status(200).json({ success: true, ...result });
});

export const getTrekById = catchAsync(
  async (req: Request, res: Response, next) => {
    const trek = await Trek.findById(req.params.id);

    if (!trek) {
      return next(new AppError("Trek not found", 404));
    }

    res.status(200).json({
      success: true,
      data: trek,
    });
  },
);

export const updateTrek = catchAsync(
  async (req: Request, res: Response, next) => {
    const trek = await Trek.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!trek) {
      return next(new AppError("Trek not found", 404));
    }

    res.status(200).json({
      success: true,
      data: trek,
    });
  },
);

// @desc    Delete a trek
// @route   DELETE /api/treks/:id
export const deleteTrek = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const activeBookings = await Booking.countDocuments({
      trek: req.params.id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeBookings > 0) {
      return next(
        new AppError(
          `Cannot delete this trek — it has ${activeBookings} active booking(s). Cancel or complete them first.`,
          400,
        ),
      );
    }

    const trek = await Trek.findByIdAndDelete(req.params.id);

    if (!trek) {
      return next(new AppError("Trek not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Trek deleted successfully",
      data: trek,
    });
  },
);

// @desc    Upload images for a trek
// @route   POST /api/treks/:id/images
export const uploadTrekImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const trek = await Trek.findById(req.params.id);

    if (!trek) {
      return next(new AppError("Trek not found", 404));
    }

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return next(new AppError("No images provided", 400));
    }

    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, "nepal-trek/treks"),
    );

    const uploadedUrls = await Promise.all(uploadPromises);

    trek.images.push(...uploadedUrls);
    await trek.save();

    res.status(200).json({
      success: true,
      data: trek,
    });
  },
);
