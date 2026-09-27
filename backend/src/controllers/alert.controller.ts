import { Request, Response } from "express";
import {
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert
} from "../services/alert.service.js";
import { SecurityAlert } from "../types/alert.js";

export function getAlerts(
  _req: Request,
  res: Response
): void {
  const alerts = getAllAlerts();

  res.status(200).json({
    success: true,
    count: alerts.length,
    data: alerts
  });
}

export function getAlert(
  req: Request,
  res: Response
): void {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const alert = getAlertById(id);

  if (!alert) {
    res.status(404).json({
      success: false,
      message: "Alert not found"
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: alert
  });
}

export function postAlert(
  req: Request,
  res: Response
): void {
  const alert = req.body as SecurityAlert;

  const createdAlert = createAlert(alert);

  res.status(201).json({
    success: true,
    data: createdAlert
  });
}

export function patchAlert(
  req: Request,
  res: Response
): void {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const updatedAlert = updateAlert(id, req.body);

  if (!updatedAlert) {
    res.status(404).json({
      success: false,
      message: "Alert not found"
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: updatedAlert
  });
}