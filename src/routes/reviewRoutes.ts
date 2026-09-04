import express from "express";
import { createReview, deleteReview } from "../controllers/reviewController";
import { protect } from "../middlewares/authMiddleware";
import { reviewValidationRules } from "../middlewares/reviewValidator";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

router.post("/", protect, reviewValidationRules, validateRequest, createReview);
router.delete("/:id", protect, deleteReview);

export default router;
