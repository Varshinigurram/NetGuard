export type DeviceType =
  | "router"
  | "switch"
  | "pc"
  | "server";

export type DeviceStatus =
  | "online"
  | "offline"
  | "unknown";

export interface NetworkDevice {
  id: string;
  name: string;
  type: DeviceType;
  ipAddress: string;
  vlan?: number;
  status: DeviceStatus;
}