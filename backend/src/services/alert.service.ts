import { SecurityAlert } from "../types/alert.js";
import {
  readJsonFile,
  writeJsonFile
} from "./storage.service.js";

const ALERTS_FILE = "alerts.json";

let alerts: SecurityAlert[] = readJsonFile<SecurityAlert[]>(
  ALERTS_FILE,
  []
);

export function getAllAlerts(): SecurityAlert[] {
  return alerts;
}

export function getAlertById(
  id: string
): SecurityAlert | undefined {
  return alerts.find(
    (alert) => alert.id === id
  );
}

export function createAlert(
  alert: SecurityAlert
): SecurityAlert {
  alerts.push(alert);

  writeJsonFile(
    ALERTS_FILE,
    alerts
  );

  return alert;
}

export function updateAlert(
  id: string,
  updates: Partial<SecurityAlert>
): SecurityAlert | undefined {
  const alert = getAlertById(id);

  if (!alert) {
    return undefined;
  }

  Object.assign(alert, {
    ...updates,
    updatedAt: new Date().toISOString()
  });

  writeJsonFile(
    ALERTS_FILE,
    alerts
  );

  return alert;
}