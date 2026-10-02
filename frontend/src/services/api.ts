import axios from 'axios';
import type { NetworkDevice } from '../types/device';
import type { NetworkEvent } from '../types/event';
import type { SecurityAlert } from '../types/alert';
import type {
  NetworkMetrics,
  AnomalyResponse,
  HealthResponse,
  ApiListResponse,
  ApiItemResponse,
} from '../types/metrics';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export async function getHealth(): Promise<HealthResponse> {
  const res = await apiClient.get<HealthResponse>('/api/health');
  return res.data;
}

export async function getDevices(): Promise<NetworkDevice[]> {
  const res = await apiClient.get<ApiListResponse<NetworkDevice>>('/api/devices');
  return res.data.data;
}

export async function getDevice(id: string): Promise<NetworkDevice> {
  const res = await apiClient.get<ApiItemResponse<NetworkDevice>>(`/api/devices/${id}`);
  return res.data.data;
}

export async function getEvents(): Promise<NetworkEvent[]> {
  const res = await apiClient.get<ApiListResponse<NetworkEvent>>('/api/events');
  return res.data.data;
}

export async function getEvent(id: string): Promise<NetworkEvent> {
  const res = await apiClient.get<ApiItemResponse<NetworkEvent>>(`/api/events/${id}`);
  return res.data.data;
}

export async function getAlerts(): Promise<SecurityAlert[]> {
  const res = await apiClient.get<ApiListResponse<SecurityAlert>>('/api/alerts');
  return res.data.data;
}

export async function getAlert(id: string): Promise<SecurityAlert> {
  const res = await apiClient.get<ApiItemResponse<SecurityAlert>>(`/api/alerts/${id}`);
  return res.data.data;
}

export async function getMetrics(): Promise<NetworkMetrics> {
  const res = await apiClient.get<ApiItemResponse<NetworkMetrics>>('/api/metrics');
  return res.data.data;
}

export async function getAnomaly(id: string): Promise<AnomalyResponse> {
  const res = await apiClient.get<AnomalyResponse>(`/api/anomalies/${id}`);
  return res.data;
}

export async function postEvent(event: Omit<NetworkEvent, never>): Promise<{
  success: boolean;
  duplicate?: boolean;
  message?: string;
  data?: NetworkEvent;
  anomalyDetected?: boolean;
  alertCreated?: boolean;
}> {
  const res = await apiClient.post('/api/events', event);
  return res.data as {
    success: boolean;
    duplicate?: boolean;
    message?: string;
    data?: NetworkEvent;
    anomalyDetected?: boolean;
    alertCreated?: boolean;
  };
}
