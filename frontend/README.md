# NetGuard

## Network Traffic Anomaly Detection and Security Monitoring System

NetGuard is a network security monitoring system that combines a Cisco Packet Tracer network, a Node.js/Express backend, and a React-based security dashboard.

The system demonstrates how network traffic events can be collected, analyzed for anomalies, persisted as security events, converted into alerts, and presented through a centralized monitoring dashboard.

---

## Project Overview

NetGuard is designed around an end-to-end network monitoring workflow:

```text
Cisco Packet Tracer
        |
        | Network Events / Syslog
        v
NETGUARD-MONITOR
        |
        v
NetGuard Backend
        |
        +---- Events
        +---- Anomaly Detection
        +---- Alerts
        +---- Metrics
        |
        v
React Security Dashboard