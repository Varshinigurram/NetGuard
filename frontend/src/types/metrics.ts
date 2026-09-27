export interface NetworkMetrics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  totalEvents: number;
  totalAlerts: number;
  openAlerts: number;
  criticalAlerts: number;
  aclBlocks: number;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

export interface AnomalyResponse {
  success: boolean;
  eventId: string;
  data: AnomalyResult;
}

export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

export interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}
