import { Router } from "express";
import {
  getEvents,
  getEvent,
  postEvent
} from "../controllers/event.controller.js";

const router = Router();

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/", postEvent);

export default router;