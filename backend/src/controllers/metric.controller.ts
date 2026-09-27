import { Request, Response } from "express";
import { getNetworkMetrics } from "../services/metric.service.js";

export function getMetrics(
  _req: Request,
  res: Response
): void {
  const metrics = getNetworkMetrics();

  res.status(200).json({
    success: true,
    data: metrics
  });
}