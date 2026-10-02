/**
 * ingestion.service.ts
 *
 * Orchestrates the full NetGuard event pipeline:
 *   1. Validate incoming event payload
 *   2. Idempotency check (reject duplicate eventId)
 *   3. Persist event via event.service
 *   4. Run rule-based anomaly detection via anomaly.service
 *   5. If anomaly detected, auto-generate and persist an alert via alert.service
 *
 * This file was added to wire together existing services that were previously
 * disconnected.  No existing service logic was changed.
 */

import { NetworkEvent, EventType, EventSeverity } from "../types/event.js";
import { SecurityAlert } from "../types/alert.js";
import { eventExists, createEvent } from "./event.service.js";
import { analyzeEvent } from "./anomaly.service.js";
import { alertExistsByEventId, createAlert } from "./alert.service.js";

// ─── Validation ────────────────────────────────────────────────────────────────

const VALID_EVENT_TYPES: EventType[] = [
  "ACL_BLOCK",
  "SYSLOG",
  "CONNECTION",
  "SYSTEM",
];

const VALID_SEVERITIES: EventSeverity[] = [
  "low",
  "medium",
  "high",
  "critical",
];

export interface ValidationError {
  field: string;
  message: string;
}

export function validateEvent(
  body: unknown
): { valid: true; event: NetworkEvent } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (typeof body !== "object" || body === null) {
    return { valid: false, errors: [{ field: "body", message: "Request body must be a JSON object." }] };
  }

  const b = body as Record<string, unknown>;

  if (typeof b.id !== "string" || b.id.trim() === "") {
    errors.push({ field: "id", message: "id is required and must be a non-empty string." });
  }

  if (!VALID_EVENT_TYPES.includes(b.eventType as EventType)) {
    errors.push({
      field: "eventType",
      message: `eventType must be one of: ${VALID_EVENT_TYPES.join(", ")}.`,
    });
  }

  if (!VALID_SEVERITIES.includes(b.severity as EventSeverity)) {
    errors.push({
      field: "severity",
      message: `severity must be one of: ${VALID_SEVERITIES.join(", ")}.`,
    });
  }

  if (typeof b.message !== "string" || b.message.trim() === "") {
    errors.push({ field: "message", message: "message is required and must be a non-empty string." });
  }

  // timestamp: accept provided ISO string or default to now
  const timestamp =
    typeof b.timestamp === "string" && b.timestamp.trim() !== ""
      ? b.timestamp
      : new Date().toISOString();

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const event: NetworkEvent = {
    id: (b.id as string).trim(),
    timestamp,
    eventType: b.eventType as EventType,
    severity: b.severity as EventSeverity,
    message: (b.message as string).trim(),
    ...(typeof b.sourceIp === "string" && { sourceIp: b.sourceIp }),
    ...(typeof b.destinationIp === "string" && { destinationIp: b.destinationIp }),
    ...(typeof b.sourceDeviceId === "string" && { sourceDeviceId: b.sourceDeviceId }),
    ...(typeof b.destinationDeviceId === "string" && { destinationDeviceId: b.destinationDeviceId }),
    ...(typeof b.protocol === "string" && { protocol: b.protocol }),
  };

  return { valid: true, event };
}

// ─── Pipeline ──────────────────────────────────────────────────────────────────

export type IngestResult =
  | { status: "duplicate"; message: string }
  | { status: "validation_error"; errors: ValidationError[] }
  | { status: "created"; event: NetworkEvent; anomalyDetected: boolean; alertCreated: boolean };

/**
 * Full ingest pipeline.  Call this from the POST /api/events controller.
 */
export function ingestEvent(body: unknown): IngestResult {
  // Step 1 — Validate
  const validation = validateEvent(body);
  if (!validation.valid) {
    return { status: "validation_error", errors: validation.errors };
  }

  const event = validation.event;

  // Step 2 — Idempotency: reject if event id already exists
  if (eventExists(event.id)) {
    return {
      status: "duplicate",
      message: `Event with id '${event.id}' already exists.  Skipping duplicate ingestion.`,
    };
  }

  // Step 3 — Persist event
  createEvent(event);

  // Step 4 — Run rule-based anomaly detection (anomaly.service logic unchanged)
  const anomaly = analyzeEvent(event);

  let alertCreated = false;

  // Step 5 — Auto-generate alert if anomaly detected and no alert already exists for this event
  if (anomaly.isAnomaly && !alertExistsByEventId(event.id)) {
    const now = new Date().toISOString();

    const alertId = `alert-${event.id}`;

    const alert: SecurityAlert = {
      id: alertId,
      createdAt: now,
      updatedAt: now,
      title: buildAlertTitle(event),
      description: buildAlertDescription(event, anomaly.reason),
      severity: anomaly.severity,
      status: "open",
      eventIds: [event.id],
      ...(event.sourceIp !== undefined && { sourceIp: event.sourceIp }),
      ...(event.destinationIp !== undefined && { destinationIp: event.destinationIp }),
    };

    createAlert(alert);
    alertCreated = true;
  }

  return { status: "created", event, anomalyDetected: anomaly.isAnomaly, alertCreated };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildAlertTitle(event: NetworkEvent): string {
  if (event.eventType === "ACL_BLOCK") {
    const src = event.sourceDeviceId?.toUpperCase() ?? event.sourceIp ?? "Unknown Source";
    const dst = event.destinationDeviceId?.toUpperCase() ?? event.destinationIp ?? "Unknown Destination";
    return `ACL Security Alert - ${src} Unauthorized Access to ${dst}`;
  }
  return `Security Alert - ${event.eventType} (${event.severity.toUpperCase()})`;
}

function buildAlertDescription(event: NetworkEvent, anomalyReason: string): string {
  const parts: string[] = [anomalyReason];
  if (event.sourceIp) parts.push(`Source: ${event.sourceIp}`);
  if (event.destinationIp) parts.push(`Destination: ${event.destinationIp}`);
  if (event.protocol) parts.push(`Protocol: ${event.protocol}`);
  return parts.join("  |  ");
}
