import { Router } from "express";

import {
  getAlerts,
  getAlert,
  postAlert,
  patchAlert
} from "../controllers/alert.controller.js";

const router = Router();

router.get("/", getAlerts);

router.get("/:id", getAlert);

router.post("/", postAlert);

router.patch("/:id", patchAlert);

export default router;