import { Router } from "express";
import { getMetrics } from "../controllers/metric.controller.js";

const router = Router();

router.get("/", getMetrics);

export default router;