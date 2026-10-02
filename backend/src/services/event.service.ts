import { NetworkEvent } from "../types/event.js";
import {
  readJsonFile,
  writeJsonFile
} from "./storage.service.js";

const EVENTS_FILE = "events.json";

let events: NetworkEvent[] = readJsonFile<NetworkEvent[]>(
  EVENTS_FILE,
  []
);

export function getAllEvents(): NetworkEvent[] {
  return events;
}

export function getEventById(
  id: string
): NetworkEvent | undefined {
  return events.find(
    (event) => event.id === id
  );
}

export function eventExists(id: string): boolean {
  return events.some((event) => event.id === id);
}

export function createEvent(
  event: NetworkEvent
): NetworkEvent {
  events.push(event);

  writeJsonFile(
    EVENTS_FILE,
    events
  );

  return event;
}