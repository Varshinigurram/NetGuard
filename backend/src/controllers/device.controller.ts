import { Request, Response } from "express";
import {
  getAllDevices,
  getDeviceById
} from "../services/device.service.js";

export function getDevices(_req: Request, res: Response): void {
  const devices = getAllDevices();

  res.status(200).json({
    success: true,
    count: devices.length,
    data: devices
  });
}

export function getDevice(
  req: Request,
  res: Response
): void {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const device = getDeviceById(id);

  if (!device) {
    res.status(404).json({
      success: false,
      message: "Device not found"
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: device
  });
}