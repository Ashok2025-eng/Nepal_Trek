import { Request, Response } from "express";
import Trek from "../models/trek.model";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

export const createTrek = catchAsync(async (req: Request, res: Response) => {
  const trek = await Trek.create(req.body);
  res.status(201).json({
    success: true,
    data: trek,
  });
});

export const getTreks = catchAsync(async (req: Request, res: Response) => {
  const treks = await Trek.find();
  res.status(200).json({
    success: true,
    count: treks.length,
    data: treks,
  });
});

export const getTrekById = catchAsync(async (req: Request, res: Response, next) => {
  const trek = await Trek.findById(req.params.id);

  if (!trek) {
    return next(new AppError("Trek not found", 404));
  }

  res.status(200).json({
    success: true,
    data: trek,
  });
});

export const updateTrek = catchAsync(async (req: Request, res: Response, next) => {
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
});

export const deleteTrek = catchAsync(async (req: Request, res: Response, next) => {
  const trek = await Trek.findByIdAndDelete(req.params.id);

  if (!trek) {
    return next(new AppError("Trek not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Trek deleted successfully",
    data: trek,
  });
});