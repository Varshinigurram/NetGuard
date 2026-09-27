import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import deviceRoutes from "./routes/device.routes.js";
import eventRoutes from "./routes/event.routes.js";
import anomalyRoutes from "./routes/anomaly.routes.js";
import alertRoutes from "./routes/alert.routes.js";
import metricRoutes from "./routes/metric.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "NetGuard backend is running",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/devices", deviceRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/anomalies", anomalyRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/metrics", metricRoutes);

app.listen(env.port, () => {
  console.log(
    `NetGuard backend running on http://localhost:${env.port}`
  );
});