import express, { Request, Response } from "express";
import { errorHandler } from "./middlewares/errorHandler";

import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import enquiryRoutes from "./routes/enquiryRoutes";
import trekRoutes from "./routes/trekRoutes";
const app = express();

app.use(express.json());

//* API HEALTH CHECK
app.get("/api/health", (req: Request, Res: Response) => {
  Res.status(200).json({
    success: true,
    message: "Nepal Trek API is running",
  });
});

app.use("/api/treks", trekRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/enquiries", enquiryRoutes);

//* error handler
app.use(errorHandler);

export default app;
