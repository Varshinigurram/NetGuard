import { Request, Response } from "express";
import {
  getAllEvents,
  getEventById,
  createEvent
} from "../services/event.service.js";
import { NetworkEvent } from "../types/event.js";

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
  const event = req.body as NetworkEvent;

  const createdEvent = createEvent(event);

  res.status(201).json({
    success: true,
    data: createdEvent
  });
}