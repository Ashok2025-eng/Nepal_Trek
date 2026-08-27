import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

//extend express's request type to include our user
export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authorized,no token", 401));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError("JWT SECRET is not defined in .env", 500);
    }
    let decoded: { id: string };
    try {
      decoded = Jwt.verify(token, secret) as { id: string };
    } catch (error) {
      return next(new AppError("Not authorized, invalid token", 401));
    }
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }
    req.user = user;
    next();
  },
);

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permisson to perform this action", 403),
      );
    }
    next();
  };
};
