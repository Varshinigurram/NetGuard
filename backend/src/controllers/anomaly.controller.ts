import { Request, Response } from "express";
import { getEventById } from "../services/event.service.js";
import { analyzeEvent } from "../services/anomaly.service.js";

export function analyzeEventById(
  req: Request,
  res: Response
): void {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const event = getEventById(id);

  if (!event) {
    res.status(404).json({
      success: false,
      message: "Event not found"
    });
    return;
  }

  const result = analyzeEvent(event);

  res.status(200).json({
    success: true,
    eventId: event.id,
    data: result
  });
}