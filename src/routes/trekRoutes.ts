import express from "express";
import {
  createTrek,
  getTreks,
  getTrekById,
  updateTrek,
  deleteTrek,
} from "../controllers/trekController";
import {
  trekValidationRules,
  updateTrekValidationRules,
} from "../middlewares/trekValidator";
import { validateRequest } from "../middlewares/validateRequest";

const router = express.Router();

router.post("/", trekValidationRules, validateRequest, createTrek);
router.get("/", getTreks);
router.get("/:id", getTrekById);
router.put("/:id", updateTrekValidationRules, validateRequest, updateTrek);
router.delete("/:id", deleteTrek);

export default router;