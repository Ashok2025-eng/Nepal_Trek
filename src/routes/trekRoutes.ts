import express from "express";
import { createTrek, getTrekById, getTreks } from "../controllers/trekController";


const router = express.Router();


router.post("/",createTrek)
router.get("/",getTreks)
router.get("/:id",getTrekById)

export default router;