import express from "express";
import { getTrekReviews } from "../controllers/reviewController";
import {
  createTrek,
  deleteTrek,
  getTrekById,
  getTreks,
  updateTrek,
  uploadTrekImages,
} from "../controllers/trekController";
import { protect, restrictTo } from "../middlewares/authMiddleware";
import {
  trekValidationRules,
  updateTrekValidationRules,
} from "../middlewares/trekValidator";
import upload from "../middlewares/uploadMiddleware";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.array("images", 5),
  trekValidationRules,
  validateRequest,
  createTrek,
);
router.post(
  "/:id/images",
  protect,
  restrictTo("admin"),
  upload.array("images", 5),
  uploadTrekImages,
);
router.get("/", getTreks);
router.get("/:id", getTrekById);
router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  updateTrekValidationRules,
  validateRequest,
  updateTrek,
);
router.delete("/:id", protect, restrictTo("admin"), deleteTrek);

// add alongside your existing routes:
router.get("/:trekId/reviews", getTrekReviews);

export default router;
