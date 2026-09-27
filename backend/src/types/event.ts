export type EventType =
  | "ACL_BLOCK"
  | "SYSLOG"
  | "CONNECTION"
  | "SYSTEM";

export type EventSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface NetworkEvent {
  id: string;
  timestamp: string;
  eventType: EventType;
  severity: EventSeverity;
  sourceIp?: string;
  destinationIp?: string;
  sourceDeviceId?: string;
  destinationDeviceId?: string;
  protocol?: string;
  message: string;
}