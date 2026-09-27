import { NetworkDevice } from "../types/device.js";

const devices: NetworkDevice[] = [
  {
    id: "r1-edge",
    name: "R1-EDGE",
    type: "router",
    ipAddress: "192.168.10.1",
    status: "online"
  },
  {
    id: "sw1-core",
    name: "SW1-CORE",
    type: "switch",
    ipAddress: "192.168.99.2",
    vlan: 99,
    status: "online"
  },
  {
    id: "pc1-user",
    name: "PC1-USER",
    type: "pc",
    ipAddress: "192.168.10.11",
    vlan: 10,
    status: "online"
  },
  {
    id: "pc2-user",
    name: "PC2-USER",
    type: "pc",
    ipAddress: "192.168.10.12",
    vlan: 10,
    status: "online"
  },
  {
    id: "pc3-user",
    name: "PC3-USER",
    type: "pc",
    ipAddress: "192.168.10.13",
    vlan: 10,
    status: "online"
  },
  {
    id: "srv-web",
    name: "SRV-WEB",
    type: "server",
    ipAddress: "192.168.20.10",
    vlan: 20,
    status: "online"
  },
  {
    id: "srv-dns",
    name: "SRV-DNS",
    type: "server",
    ipAddress: "192.168.20.20",
    vlan: 20,
    status: "online"
  },
  {
    id: "netguard-monitor",
    name: "NETGUARD-MONITOR",
    type: "server",
    ipAddress: "192.168.30.10",
    vlan: 30,
    status: "online"
  }
];

export function getAllDevices(): NetworkDevice[] {
  return devices;
}

export function getDeviceById(id: string): NetworkDevice | undefined {
  return devices.find((device) => device.id === id);
}