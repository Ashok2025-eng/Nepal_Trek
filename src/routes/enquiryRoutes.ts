import express from "express";
import {
  createEnquiry,
  getAllEnquiries,
  updateEnquiryStatus,
} from "../controllers/enquiryController";
import { protect, restrictTo } from "../middlewares/authMiddleware";
import { enquiryValidationRules } from "../middlewares/enquiryValidator";
import { validateRequest } from "../middlewares/validateRequest";
const router = express.Router();

router.post("/", enquiryValidationRules, validateRequest, createEnquiry);
router.get("/", protect, restrictTo("admin"), getAllEnquiries);
router.put("/:id/status", protect, restrictTo("admin"), updateEnquiryStatus);

export default router;
