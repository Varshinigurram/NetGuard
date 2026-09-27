# NetGuard

### Network Traffic Anomaly Detection and Security Monitoring System

> **NetGuard is an end-to-end network security monitoring system that combines Cisco Packet Tracer network infrastructure, VLAN segmentation, ACL-based security controls, Syslog monitoring, Packet Tracer JavaScript integration, a TypeScript/Express backend, anomaly detection, security alerts, persistent event storage, and a professional React-based Security Operations Center dashboard.**

---

## 📌 Project Overview

NetGuard is a full-stack Computer Networks project designed to demonstrate how network infrastructure can be monitored and connected to a software-based security monitoring platform.

The system combines a simulated enterprise network in **Cisco Packet Tracer** with a custom backend and web dashboard.

The project demonstrates the complete flow from:

```text
Network Infrastructure
        ↓
Traffic / Security Event
        ↓
Monitoring & Integration
        ↓
Backend Event Processing
        ↓
Anomaly Detection
        ↓
Security Alert
        ↓
Metrics
        ↓
Security Dashboard
```

The project is intentionally divided into three major layers:

1. **Network Layer** — Cisco Packet Tracer
2. **Processing Layer** — Node.js + Express + TypeScript
3. **Presentation Layer** — React + TypeScript + Vite

---

# 🎯 Objectives

The main objectives of NetGuard are:

- Design a segmented enterprise-style network.
- Implement VLAN-based network separation.
- Configure Router-on-a-Stick inter-VLAN routing.
- Implement access-control policies using Cisco ACLs.
- Demonstrate unauthorized management-access blocking.
- Configure Cisco Syslog monitoring.
- Integrate Packet Tracer with an external backend using `RealHTTPClient`.
- Collect network security events.
- Persist events and alerts.
- Detect anomalous security events.
- Generate security alerts.
- Calculate network security metrics.
- Visualize network state through a professional SOC dashboard.
- Demonstrate an end-to-end network security monitoring workflow.

---

# 🏗️ System Architecture

```text
                         NETGUARD SYSTEM
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────────┐                 ┌───────────────────────┐
│  CISCO PACKET TRACER  │                 │   NETGUARD FRONTEND   │
│                       │                 │                       │
│ R1-EDGE               │                 │ React + TypeScript    │
│ SW1-CORE              │                 │ Vite                  │
│ PC1 / PC2 / PC3       │                 │ Axios                 │
│ SRV-WEB               │                 │ Recharts              │
│ SRV-DNS               │                 │ Lucide React           │
│ NETGUARD-MONITOR      │                 │                       │
└───────────┬───────────┘                 └───────────▲───────────┘
            │                                         │
            │ Network / Syslog                        │ REST API
            │                                         │
            ▼                                         │
┌───────────────────────┐                             │
│ NETGUARD-MONITOR      │                             │
│ 192.168.30.10         │                             │
│                       │                             │
│ Packet Tracer Syslog  │                             │
└───────────┬───────────┘                             │
            │                                         │
            │ Packet Tracer JavaScript                │
            │ RealHTTPClient                          │
            ▼                                         │
┌──────────────────────────────────────────────────────┴──────┐
│                    NETGUARD BACKEND                          │
│                                                              │
│ Node.js + Express + TypeScript                              │
│                                                              │
│  Devices ── Events ── Anomaly Detection ── Alerts ── Metrics│
│                         │                                    │
│                         ▼                                    │
│                   JSON Persistence                           │
└──────────────────────────────────────────────────────────────┘
```

### Important integration distinction

Cisco devices are configured to send Syslog messages to `NETGUARD-MONITOR`.

Separately, Packet Tracer JavaScript uses `RealHTTPClient` to communicate with the NetGuard backend and submit security events.

The verified security-event path is:

```text
Packet Tracer
      ↓
RealHTTPClient
      ↓
POST /api/events
      ↓
Backend Event Service
      ↓
JSON Persistence
      ↓
Anomaly Detection
      ↓
Security Alert
      ↓
Metrics
      ↓
React Dashboard
```

---

# 🌐 Network Topology

The NetGuard network contains eight devices.

```text
                         R1-EDGE
                            │
                       802.1Q TRUNK
                            │
                        SW1-CORE
             ┌──────────────┼──────────────┐
             │              │              │
          VLAN 10        VLAN 20        VLAN 30
           USERS         SERVERS        SECURITY
             │              │              │
       ┌─────┼─────┐    ┌───┴────┐         │
       │     │     │    │        │          │
      PC1   PC2   PC3 SRV-WEB  SRV-DNS   NETGUARD
                                         -MONITOR

                       VLAN 99
                    MANAGEMENT
```

---

# 🖥️ Devices

| Device | Type | IP Address | VLAN | Purpose |
|---|---|---|---:|---|
| R1-EDGE | Router | 192.168.10.1* | Multiple | Inter-VLAN routing |
| SW1-CORE | Switch | 192.168.99.2 | 99 | Core switch / management |
| PC1-USER | PC | 192.168.10.11 | 10 | User endpoint |
| PC2-USER | PC | 192.168.10.12 | 10 | User endpoint |
| PC3-USER | PC | 192.168.10.13 | 10 | User endpoint |
| SRV-WEB | Server | 192.168.20.10 | 20 | Web server |
| SRV-DNS | Server | 192.168.20.20 | 20 | DNS server |
| NETGUARD-MONITOR | Server | 192.168.30.10 | 30 | Security monitoring / Syslog |

\* `192.168.10.1` is the VLAN 10 gateway. R1 also has gateways for VLANs 20, 30, and 99.

---

# 🔀 VLAN Architecture

| VLAN | Name | Network | Gateway |
|---:|---|---|---|
| 10 | USERS | 192.168.10.0/24 | 192.168.10.1 |
| 20 | SERVERS | 192.168.20.0/24 | 192.168.20.1 |
| 30 | SECURITY | 192.168.30.0/24 | 192.168.30.1 |
| 99 | MANAGEMENT | 192.168.99.0/24 | 192.168.99.1 |

### Router-on-a-Stick

R1 uses:

```text
G0/0.10 → VLAN 10 → 192.168.10.1/24
G0/0.20 → VLAN 20 → 192.168.20.1/24
G0/0.30 → VLAN 30 → 192.168.30.1/24
G0/0.99 → VLAN 99 → 192.168.99.1/24
```

SW1 `G0/1` operates as the trunk toward R1.

The trunk carries:

```text
10, 20, 30, 99
```

---

# 🔐 Network Security

## USER-SECURITY ACL

An extended ACL named:

```text
USER-SECURITY
```

is applied inbound on:

```text
R1 G0/0.10
```

The security policy prevents the user network from directly accessing the management network.

```text
192.168.10.0/24
        │
        │ DENY
        ▼
192.168.99.0/24
```

This provides a controlled security boundary between:

```text
USERS
```

and:

```text
MANAGEMENT
```

---

# 🚨 Demonstrated Security Scenario

The primary demonstrated security event is an unauthorized management-access attempt.

```text
PC1-USER
192.168.10.11
       │
       │ ICMP
       ▼
SW1-CORE
192.168.99.2
       │
       X
    BLOCKED
```

The event is represented as:

```text
Event ID:       pt-acl-001
Event Type:     ACL_BLOCK
Severity:       HIGH
Source:         192.168.10.11
Destination:    192.168.99.2
Protocol:       ICMP
```

The backend detects the event as an anomaly and associates it with a security alert.

---

# 📡 Syslog Monitoring

`NETGUARD-MONITOR` acts as the dedicated monitoring server.

```text
IP Address: 192.168.30.10
Subnet:     255.255.255.0
Gateway:    192.168.30.1
```

Cisco devices send Syslog messages to:

```text
192.168.30.10
UDP 514
```

R1 and SW1 were configured for Syslog logging.

SW1 uses:

```text
logging source-interface vlan 99
```

The Packet Tracer Syslog service was verified to receive actual Cisco log messages.

---

# 🔗 Packet Tracer Integration

NetGuard uses Packet Tracer's JavaScript environment to communicate with the external backend.

The integration uses:

```text
RealHTTPClient
```

rather than the simulated HTTP client for external communication.

## Health check

The Packet Tracer integration was first verified using:

```text
GET /api/health
```

with an HTTP `200` response.

## Security event

The security-event integration uses:

```text
POST /api/events
```

with JSON event data.

The verified event:

```json
{
  "id": "pt-acl-001",
  "eventType": "ACL_BLOCK",
  "severity": "high",
  "sourceIp": "192.168.10.11",
  "destinationIp": "192.168.99.2",
  "sourceDeviceId": "pc1-user",
  "destinationDeviceId": "sw1-core",
  "protocol": "ICMP",
  "message": "ACL blocked unauthorized management access from PC1-USER to SW1-CORE"
}
```

The backend successfully returned:

```text
HTTP 201 Created
```

---

# ⚙️ Backend

The backend is implemented using:

- Node.js
- Express
- TypeScript
- CORS
- dotenv
- Zod
- tsx

## Backend architecture

```text
HTTP Request
      ↓
Route
      ↓
Controller
      ↓
Service
      ↓
Persistence / Domain Logic
```

### Main services

```text
Device Service
Event Service
Anomaly Service
Alert Service
Metrics Service
```

---

# 📊 Backend APIs

Base development address:

```text
http://localhost:5000
```

## Health

```http
GET /api/health
```

Returns backend availability and timestamp.

---

## Devices

```http
GET /api/devices
```

Returns the complete network device inventory.

```http
GET /api/devices/:id
```

Returns a specific device.

---

## Events

```http
GET /api/events
```

Returns network events.

```http
GET /api/events/:id
```

Returns a specific event.

```http
POST /api/events
```

Creates a network event.

---

## Anomalies

```http
GET /api/anomalies/:id
```

Analyzes a stored event.

Example:

```json
{
  "success": true,
  "eventId": "pt-acl-001",
  "data": {
    "isAnomaly": true,
    "severity": "high",
    "reason": "Access control list blocked network traffic."
  }
}
```

---

## Alerts

```http
GET /api/alerts
```

Returns security alerts.

```http
GET /api/alerts/:id
```

Returns a specific alert.

```http
POST /api/alerts
```

Creates a security alert.

---

## Metrics

```http
GET /api/metrics
```

Returns:

```text
totalDevices
onlineDevices
offlineDevices
totalEvents
totalAlerts
openAlerts
criticalAlerts
aclBlocks
```

The frontend retrieves these values dynamically.

---

# 💾 Persistence

Events and alerts are persisted using JSON files:

```text
backend/
└── data/
    ├── events.json
    └── alerts.json
```

Persistence was tested by:

1. Creating events/alerts.
2. Confirming they were written to disk.
3. Restarting the backend.
4. Requesting the records again.
5. Confirming the records remained available.

---

# 🖥️ Frontend

The NetGuard dashboard is built using:

- React
- TypeScript
- Vite
- Axios
- React Router
- Lucide React
- Recharts

The frontend is designed as a professional Security Operations Center interface.

---

# 📊 Dashboard Modules

## Overview

Displays:

- Total Devices
- Online Devices
- Security Events
- Open Alerts
- ACL Blocks
- Device health
- Security overview
- Recent security events
- Open alerts
- Backend/system status

---

## Devices

Displays real device information:

- Name
- Type
- IP address
- VLAN
- Status

---

## Security Events

Provides:

- Event table
- Search
- Severity filtering
- Event-type filtering
- Event details
- Source/destination information
- Protocol
- Security message
- ACL block visualization
- Anomaly analysis

---

## Alerts

Provides:

- Alert listing
- Search
- Severity filtering
- Status filtering
- Alert details
- Related event information

Supported statuses:

```text
OPEN
ACKNOWLEDGED
RESOLVED
```

---

## Anomalies

Provides event-level investigation.

The user can analyze an event through:

```text
GET /api/anomalies/:id
```

The result includes:

```text
Is Anomaly
Severity
Reason
```

---

## Network Topology

The dashboard contains an interactive representation of the actual Packet Tracer topology.

It represents:

```text
R1-EDGE
   │
SW1-CORE
   ├── VLAN 10
   │   ├── PC1-USER
   │   ├── PC2-USER
   │   └── PC3-USER
   │
   ├── VLAN 20
   │   ├── SRV-WEB
   │   └── SRV-DNS
   │
   └── VLAN 30
       └── NETGUARD-MONITOR
```

The topology also communicates the ACL security relationship between the user and management networks.

---

# 🔄 Automatic Refresh

The frontend periodically refreshes backend information.

Current behavior includes:

```text
Most API-driven pages → approximately 5 seconds
Topology → approximately 10 seconds
```

Intervals are cleaned up correctly when components are unmounted.

A manual refresh control is also available.

The dashboard displays the last update time.

---

# 🛡️ Frontend Error Handling

The dashboard provides:

### Loading States

Skeleton interfaces while data is being retrieved.

### Empty States

Clear messaging when no records exist.

### Error States

Non-destructive error handling for failed API requests.

### Backend Offline

The application detects when the backend cannot be reached and displays a backend-offline state instead of falsely reporting that the system is operational.

---

# 📁 Project Structure

```text
NetGuard/
│
├── README.md
├── NetGuard.pkt
│
├── backend/
│   ├── data/
│   │   ├── alerts.json
│   │   └── events.json
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── server.ts
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   ├── dashboard/
    │   │   ├── devices/
    │   │   ├── events/
    │   │   ├── alerts/
    │   │   ├── topology/
    │   │   └── common/
    │   │
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   ├── styles/
    │   ├── types/
    │   └── App.tsx
    │
    ├── .env.example
    ├── package.json
    └── vite.config.ts
```

---

# 🚀 Installation

## Prerequisites

Install:

- Node.js
- npm
- Cisco Packet Tracer
- Modern web browser

---

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd NetGuard
```

---

## 2. Configure the backend

```powershell
cd backend
npm install
```

Create `.env` from `.env.example`.

Example:

```env
NODE_ENV=development
PORT=5000
SYSLOG_HOST=192.168.30.10
SYSLOG_PORT=514
```

---

## 3. Build the backend

```powershell
npm run build
```

---

## 4. Start the backend

```powershell
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## 5. Configure the frontend

Open another terminal:

```powershell
cd frontend
npm install
```

Create `.env` from `.env.example`.

Example:

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 6. Start the frontend

```powershell
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 Verification

NetGuard was verified at multiple levels.

## Network Verification

Verified:

- VLAN configuration
- Trunk configuration
- Router-on-a-Stick
- Inter-VLAN routing
- Management SVI
- Default gateway
- ACL enforcement
- Syslog configuration
- Device connectivity

---

## ACL Verification

Controlled tests confirmed that:

```text
PC1-USER
192.168.10.11
```

cannot directly access:

```text
SW1-CORE
192.168.99.2
```

through the protected management path.

The ACL counters increased during controlled tests.

---

## Backend Verification

Verified:

```text
GET  /api/health
GET  /api/devices
GET  /api/devices/:id
GET  /api/events
GET  /api/events/:id
POST /api/events
GET  /api/anomalies/:id
GET  /api/alerts
GET  /api/alerts/:id
POST /api/alerts
GET  /api/metrics
```

Not-found responses were also tested.

---

## Persistence Verification

Events and alerts remained available after restarting the backend.

---

## Frontend Verification

Verified:

- TypeScript compilation
- Production build
- All six routes
- API integration
- Real metrics
- Real devices
- Real events
- Real alerts
- Anomaly analysis
- Automatic refresh
- Backend health monitoring
- Loading states
- Empty states
- Error states
- Interactive topology

Final production build completed with:

```text
0 TypeScript errors
```

---

# 🔍 End-to-End Security Flow

The main demonstrated scenario is:

```text
1. PC1-USER
   192.168.10.11

          ↓

2. Attempts management access

          ↓

3. R1 evaluates USER-SECURITY ACL

          ↓

4. Traffic to 192.168.99.2 is BLOCKED

          ↓

5. Packet Tracer security event is submitted

          ↓

6. POST /api/events

          ↓

7. Event is persisted

          ↓

8. Anomaly detection identifies ACL_BLOCK

          ↓

9. Security alert is generated

          ↓

10. Metrics are updated

          ↓

11. React dashboard displays the event,
    anomaly and alert
```

This is the central end-to-end workflow demonstrated by NetGuard.

---

# 📈 Current Verified Security Data

The project has verified data representing ACL-blocked events.

Example:

```text
Event:
pt-acl-001

Type:
ACL_BLOCK

Severity:
HIGH

Source:
192.168.10.11

Destination:
192.168.99.2

Protocol:
ICMP
```

Anomaly result:

```text
isAnomaly: true
severity: high
```

Security alert:

```text
alert-pt-acl-001
```

The exact number of events and alerts may change as the system is tested, because these values are persisted backend data rather than hardcoded dashboard values.

---

# 🧠 Anomaly Detection

The current anomaly engine is deterministic and rule-based.

An event is treated as anomalous when it meets defined security conditions such as:

```text
eventType == ACL_BLOCK
```

High-severity and critical events are also handled according to the backend anomaly rules.

Example:

```text
ACL_BLOCK
      ↓
Anomaly = TRUE
      ↓
Severity = HIGH
      ↓
Reason:
Access control list blocked network traffic.
```

---

# 🔒 Data Integrity Principles

NetGuard follows these principles:

- No fake dashboard metrics.
- No fabricated devices.
- No mock security events in the production dashboard.
- Backend data is the source of truth.
- Frontend API types mirror backend models.
- Network topology represents the actual Packet Tracer architecture.
- Environment-specific configuration is kept outside source code where appropriate.
- Secrets are not intended to be committed to the repository.

---

# 🎨 Dashboard Design

The dashboard uses a dark, professional SOC-inspired visual system.

Design characteristics include:

- Dark navy interface
- Security-oriented status colors
- Clear severity indicators
- Professional navigation
- Responsive layout
- Interactive topology
- Security event visualization
- Alert indicators
- Data-driven metric cards
- Loading and error states
- Subtle transitions and interactions

The dashboard is intentionally designed as a monitoring and investigation interface rather than a generic CRUD application.

---

# 📚 Academic Concepts Demonstrated

NetGuard demonstrates practical concepts from:

### Computer Networks

- IPv4 addressing
- Subnetting
- VLANs
- Trunking
- Inter-VLAN routing
- Router-on-a-Stick
- ICMP
- DNS
- HTTP
- UDP
- Syslog
- Client-server communication

### Network Security

- ACLs
- Network segmentation
- Management-plane protection
- Security event detection
- Security alerts
- Anomaly detection
- Network monitoring

### Software Engineering

- Layered backend architecture
- REST API design
- TypeScript interfaces
- Service/controller separation
- Persistence
- Frontend component architecture
- Error handling
- Environment configuration

---

# ⚠️ Current Scope and Limitations

NetGuard is an academic network security monitoring system.

Current implementation:

- Cisco Packet Tracer simulation
- Rule-based anomaly detection
- JSON persistence
- REST APIs
- React dashboard
- Polling-based updates

It does not currently implement:

- Machine-learning anomaly detection
- Production-grade database infrastructure
- WebSocket streaming
- Enterprise authentication/authorization
- Physical network hardware monitoring

These provide natural directions for future development.

---

# 🚀 Future Enhancements

Potential future versions could include:

- MongoDB or PostgreSQL persistence
- WebSocket-based live event streaming
- Machine-learning-based anomaly detection
- Historical event analytics
- Time-series network monitoring
- Event correlation
- Configurable security rules
- Role-based access control
- User authentication
- Audit logging
- Email notifications
- Slack/Teams notifications
- Advanced network topology visualization
- Containerized deployment
- CI/CD
- Automated API and frontend testing
- Real network device integrations

---

# 🎓 Project Demonstration Flow

For an academic demonstration, the recommended sequence is:

```text
1. Explain NetGuard objective
2. Show Cisco Packet Tracer topology
3. Explain VLAN segmentation
4. Explain Router-on-a-Stick
5. Explain USER-SECURITY ACL
6. Demonstrate normal connectivity
7. Demonstrate blocked management access
8. Show NETGUARD-MONITOR Syslog
9. Demonstrate Packet Tracer → Backend integration
10. Show backend event
11. Show anomaly analysis
12. Show security alert
13. Open NetGuard dashboard
14. Show live metrics
15. Show Security Events
16. Show Alert Center
17. Show Anomaly Investigation
18. Show Network Topology
```

---

# 🏁 Final Status

| Component | Status |
|---|---|
| Cisco Packet Tracer Network | ✅ Complete |
| VLAN Segmentation | ✅ Complete |
| Router-on-a-Stick | ✅ Complete |
| ACL Security | ✅ Complete |
| Syslog Monitoring | ✅ Complete |
| Packet Tracer Integration | ✅ Complete |
| Backend | ✅ Complete |
| Event Persistence | ✅ Complete |
| Anomaly Detection | ✅ Complete |
| Security Alerts | ✅ Complete |
| Metrics | ✅ Complete |
| React Dashboard | ✅ Complete |
| Network Topology UI | ✅ Complete |
| Auto Refresh | ✅ Complete |
| Error Handling | ✅ Complete |
| End-to-End Verification | ✅ Complete |

## NetGuard — Implementation Complete

NetGuard demonstrates an end-to-end network security monitoring workflow in which a segmented Cisco Packet Tracer network is connected to a custom backend and professional monitoring dashboard.

The project brings together:

```text
NETWORKING
+
SECURITY
+
BACKEND DEVELOPMENT
+
FRONTEND DEVELOPMENT
+
MONITORING
+
ANOMALY DETECTION
```

into one integrated system.

---

# 👤 Project Information

**Project Name:** NetGuard

**Full Title:** Network Traffic Anomaly Detection and Security Monitoring System

**Project Domain:** Computer Networks / Network Security

**Project Type:** Academic Full-Stack Network Monitoring System

**Primary Technologies:**

```text
Cisco Packet Tracer
Node.js
Express
TypeScript
React
Vite
Axios
Recharts
Lucide React
REST APIs
JSON Persistence
Packet Tracer JavaScript
```

---

## 📄 License

This project was developed for academic and educational purposes.