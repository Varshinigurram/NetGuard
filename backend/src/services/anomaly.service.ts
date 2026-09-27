import { NetworkEvent } from "../types/event.js";

export interface AnomalyResult {
  isAnomaly: boolean;
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
}

export function analyzeEvent(
  event: NetworkEvent
): AnomalyResult {
  if (event.eventType === "ACL_BLOCK") {
    return {
      isAnomaly: true,
      severity: event.severity,
      reason: "Access control list blocked network traffic."
    };
  }

  if (event.severity === "critical") {
    return {
      isAnomaly: true,
      severity: "critical",
      reason: "Critical network event detected."
    };
  }

  if (event.severity === "high") {
    return {
      isAnomaly: true,
      severity: "high",
      reason: "High-severity network event detected."
    };
  }

  return {
    isAnomaly: false,
    severity: event.severity,
    reason: "No anomaly detected."
  };
}