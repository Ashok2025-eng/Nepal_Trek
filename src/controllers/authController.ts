import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { sendEmail } from "../utils/sendEmail";
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in .env");
  }

  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ||
      "7d") as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign({ id: userId }, secret, options);
};

//@desc Register a new user

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new AppError("email already registered", 400));
    }
    const user = await User.create({ name, email, password });
    const token = generateToken(
      (user._id as mongoose.Types.ObjectId).toString(),
    );
    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  },
);

//@desc login user
// @route POST /api/auth/login

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new AppError("Invalid Credentials", 401));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new AppError("Invalid Credentials", 401));
    }
    const token = generateToken(
      (user._id as mongoose.Types.ObjectId).toString(),
    );
    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  },
);

// Request a password reset token
// post /api/auth/forgot-password

// Request a password reset token
// post /api/auth/forgot-password

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("No user found with that email", 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PUT request with your new password to:\n\n${resetUrl}\n\nIf you didn't forget your password, please ignore this email! This link is valid for 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 mins)",
        message,
      });

      res.status(200).json({
        success: true,
        message: "Token sent to email successfully!",
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "There was an error sending the email. Try again later.",
          500,
        ),
      );
    }
  },
);

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  },
);
