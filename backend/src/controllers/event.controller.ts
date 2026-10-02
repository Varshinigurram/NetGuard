import { Request, Response } from "express";
import {
  getAllEvents,
  getEventById,
} from "../services/event.service.js";
import { ingestEvent } from "../services/ingestion.service.js";

export function getEvents(
  _req: Request,
  res: Response
): void {
  const events = getAllEvents();

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
}

export function getEvent(
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

  res.status(200).json({
    success: true,
    data: event
  });
}

export function postEvent(
  req: Request,
  res: Response
): void {
  const result = ingestEvent(req.body);

  if (result.status === "validation_error") {
    res.status(400).json({
      success: false,
      message: "Event validation failed.",
      errors: result.errors,
    });
    return;
  }

  if (result.status === "duplicate") {
    // Idempotent: return 200 (not 201) with the existing event to avoid false errors
    // when a retry or demo re-submission occurs.
    res.status(200).json({
      success: true,
      duplicate: true,
      message: result.message,
    });
    return;
  }

  // status === "created"
  res.status(201).json({
    success: true,
    data: result.event,
    anomalyDetected: result.anomalyDetected,
    alertCreated: result.alertCreated,
  });
}