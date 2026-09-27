import { Router } from "express";
import { analyzeEventById } from "../controllers/anomaly.controller.js";

const router = Router();

router.get("/:id", analyzeEventById);

export default router;