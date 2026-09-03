import express from "express";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
} from "../controllers/authController";
import {
  forgotPasswordValidationRules,
  loginValidationRules,
  registerValidationRules,
  resetPasswordValidationRules,
} from "../middlewares/authValidator";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

router.post("/register", registerValidationRules, validateRequest, register);
router.post("/login", loginValidationRules, validateRequest, login);

//New password Reset Routes
router.post(
  "/forgot-password",
  forgotPasswordValidationRules,
  validateRequest,
  forgotPassword,
);

router.put(
  "/reset-password/:token",
  resetPasswordValidationRules,
  validateRequest,
  resetPassword,
);
export default router;
