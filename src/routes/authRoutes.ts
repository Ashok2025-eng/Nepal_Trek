import express from "express";
import { register, login } from "../controllers/authController";
import { registerValidationRules, loginValidationRules } from "../middlewares/authValidator";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

router.post("/register", registerValidationRules, validateRequest, register);
router.post("/login", loginValidationRules, validateRequest, login);

export default router;