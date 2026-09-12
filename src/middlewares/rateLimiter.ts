import rateLimit from "express-rate-limit";

// Generate limiter -applies to all routes

export const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter - for all sensative auth routes (login ,register ., forgot-password)

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:10,
  message: {
    success: false,
    message:
      "Too many attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
