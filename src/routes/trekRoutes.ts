import express from "express";
import {
  createTrek,
  deleteTrek,
  getTrekById,
  getTreks,
  updateTrek,
} from "../controllers/trekController";
import { protect, restrictTo } from "../middlewares/authMiddleware";
import {
  trekValidationRules,
  updateTrekValidationRules,
} from "../middlewares/trekValidator";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("admin"),
  trekValidationRules,
  validateRequest,
  createTrek,
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

export default router;
