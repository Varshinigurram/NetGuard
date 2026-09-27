import { getAllDevices } from "./device.service.js";
import { getAllEvents } from "./event.service.js";
import { getAllAlerts } from "./alert.service.js";
import { NetworkMetrics } from "../types/metric.js";

export function getNetworkMetrics(): NetworkMetrics {
  const devices = getAllDevices();
  const events = getAllEvents();
  const alerts = getAllAlerts();

  const totalDevices = devices.length;

  const onlineDevices = devices.filter(
    (device) => device.status === "online"
  ).length;

  const offlineDevices = devices.filter(
    (device) => device.status === "offline"
  ).length;

  const totalEvents = events.length;

  const totalAlerts = alerts.length;

  const openAlerts = alerts.filter(
    (alert) => alert.status === "open"
  ).length;

  const criticalAlerts = alerts.filter(
    (alert) => alert.severity === "critical"
  ).length;

  const aclBlocks = events.filter(
    (event) => event.eventType === "ACL_BLOCK"
  ).length;

  return {
    totalDevices,
    onlineDevices,
    offlineDevices,
    totalEvents,
    totalAlerts,
    openAlerts,
    criticalAlerts,
    aclBlocks
  };
}