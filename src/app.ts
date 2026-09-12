import express, { Request, Response } from "express";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler";

import cors from "cors";
import helmet from "helmet";
import { authLimiter, generateLimiter } from "./middlewares/rateLimiter";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import enquiryRoutes from "./routes/enquiryRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import trekRoutes from "./routes/trekRoutes";


const app = express();

app.use(express.json())
app.use(helmet());

// CORS — first, so it applies to everything including preflight requests
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(morgan("dev"));

//* API HEALTH CHECK
app.get("/api/health", (req: Request, Res: Response) => {
  Res.status(200).json({
    success: true,
    message: "Nepal Trek API is running",
  });
});

app.use("/api/treks", trekRoutes);

// stricter limiter
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/reviews", reviewRoutes);

//Applying general limiter to everything
app.use(generateLimiter);

//* error handler
app.use(errorHandler);

export default app;
