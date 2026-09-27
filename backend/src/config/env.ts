import "dotenv/config";

const port = Number(process.env.PORT ?? 5000);
const syslogPort = Number(process.env.SYSLOG_PORT ?? 514);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("Invalid PORT configuration.");
}

if (!Number.isInteger(syslogPort) || syslogPort <= 0 || syslogPort > 65535) {
  throw new Error("Invalid SYSLOG_PORT configuration.");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  syslogHost: process.env.SYSLOG_HOST ?? "127.0.0.1",
  syslogPort
} as const;