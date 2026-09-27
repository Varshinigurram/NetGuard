export type AlertSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type AlertStatus =
  | "open"
  | "acknowledged"
  | "resolved";

export interface SecurityAlert {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  eventIds: string[];
  sourceIp?: string;
  destinationIp?: string;
}