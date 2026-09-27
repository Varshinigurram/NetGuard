import { useState } from 'react';
import { Router, Server, Monitor, Cpu, X, Shield } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getDevices } from '../services/api';
import { StatusBadge, DeviceTypeBadge } from '../components/common/Badges';
import { ErrorState } from '../components/common/States';
import type { NetworkDevice } from '../types/device';

const REFRESH_MS = 10000;

// VLAN definitions — static architectural knowledge
const VLANS = [
  { id: 10, name: 'USERS',      color: '#3b82f6', subnet: '192.168.10.0/24', gateway: '192.168.10.1' },
  { id: 20, name: 'SERVERS',    color: '#14b8a6', subnet: '192.168.20.0/24', gateway: '192.168.20.1' },
  { id: 30, name: 'SECURITY',   color: '#a855f7', subnet: '192.168.30.0/24', gateway: '192.168.30.1' },
  { id: 99, name: 'MANAGEMENT', color: '#f59e0b', subnet: '192.168.99.0/24', gateway: '192.168.99.1' },
];

const VLAN_MAP = Object.fromEntries(VLANS.map(v => [v.id, v]));

// Topology layout — fixed positions matching the actual Packet Tracer architecture
const LAYOUT = {
  'r1-edge':          { x: 380, y: 40 },
  'sw1-core':         { x: 380, y: 180 },
  'pc1-user':         { x: 80,  y: 380 },
  'pc2-user':         { x: 210, y: 380 },
  'pc3-user':         { x: 340, y: 380 },
  'srv-web':          { x: 470, y: 380 },
  'srv-dns':          { x: 590, y: 380 },
  'netguard-monitor': { x: 700, y: 380 },
};

const CONNECTIONS: Array<[string, string, string]> = [
  ['r1-edge',   'sw1-core',          'trunk'],
  ['sw1-core',  'pc1-user',          'VLAN 10'],
  ['sw1-core',  'pc2-user',          'VLAN 10'],
  ['sw1-core',  'pc3-user',          'VLAN 10'],
  ['sw1-core',  'srv-web',           'VLAN 20'],
  ['sw1-core',  'srv-dns',           'VLAN 20'],
  ['sw1-core',  'netguard-monitor',  'VLAN 30'],
];

const NODE_W = 128;
const NODE_H = 70;

function getDeviceIcon(type: NetworkDevice['type']) {
  switch (type) {
    case 'router': return <Router size={20} aria-hidden="true" />;
    case 'switch': return <Cpu size={20} aria-hidden="true" />;
    case 'server': return <Server size={20} aria-hidden="true" />;
    case 'pc':     return <Monitor size={20} aria-hidden="true" />;
  }
}

const typeColors: Record<string, string> = {
  router: '#3b82f6',
  switch: '#a855f7',
  server: '#14b8a6',
  pc:     '#6b7280',
};

function statusColor(status?: string) {
  if (status === 'online')  return '#22c55e';
  if (status === 'offline') return '#ef4444';
  return '#6b7280';
}

// Group label positions
const VLAN_LABELS = [
  { x: 55,  y: 320, vlan: 10, width: 380 },
  { x: 450, y: 320, vlan: 20, width: 200 },
  { x: 660, y: 320, vlan: 30, width: 140 },
];

interface TopoNodeProps {
  device: NetworkDevice;
  x: number;
  y: number;
  selected: boolean;
  onSelect: (d: NetworkDevice) => void;
}

function TopoNode({ device, x, y, selected, onSelect }: TopoNodeProps) {
  const color = typeColors[device.type] ?? '#3b82f6';
  const sColor = statusColor(device.status);

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={() => onSelect(device)}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={`${device.name} - ${device.status}`}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(device)}
    >
      {/* Selection ring */}
      {selected && (
        <rect
          x={-4} y={-4}
          width={NODE_W + 8} height={NODE_H + 8}
          rx={14} ry={14}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          opacity={0.7}
        />
      )}
      {/* Card background */}
      <rect
        x={0} y={0}
        width={NODE_W} height={NODE_H}
        rx={10} ry={10}
        fill="#161e35"
        stroke={selected ? '#3b82f6' : '#ffffff18'}
        strokeWidth={selected ? 1.5 : 1}
      />
      {/* Top accent bar */}
      <rect x={0} y={0} width={NODE_W} height={3} rx={10} fill={color} opacity={0.8} />

      {/* Icon circle */}
      <circle cx={22} cy={35} r={14} fill={`${color}22`} stroke={`${color}60`} strokeWidth={1} />
      <foreignObject x={13} y={26} width={18} height={18}>
        <div
          style={{
            width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color,
          }}
        >
          {getDeviceIcon(device.type)}
        </div>
      </foreignObject>

      {/* Text */}
      <text
        x={40} y={28}
        fill="#e8edf5"
        fontSize="10"
        fontWeight="700"
        fontFamily="'SF Mono', Consolas, monospace"
        letterSpacing="0.04em"
      >
        {device.name.length > 14 ? device.name.slice(0, 13) + '…' : device.name}
      </text>
      <text
        x={40} y={42}
        fill="#4e5e80"
        fontSize="9"
        fontFamily="'SF Mono', Consolas, monospace"
      >
        {device.ipAddress}
      </text>

      {/* Status dot */}
      <circle cx={NODE_W - 12} cy={12} r={5} fill={sColor} opacity={0.9} />
      {device.status === 'online' && (
        <circle cx={NODE_W - 12} cy={12} r={7} fill="none" stroke={sColor} strokeWidth={1} opacity={0.4}>
          <animate attributeName="r" values="5;9;5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

function TopologyCanvas({ devices }: { devices: NetworkDevice[] }) {
  const [selected, setSelected] = useState<NetworkDevice | null>(null);
  const deviceMap = Object.fromEntries(devices.map(d => [d.id, d]));

  const getCenter = (id: string) => {
    const pos = LAYOUT[id as keyof typeof LAYOUT];
    if (!pos) return null;
    return { x: pos.x + NODE_W / 2, y: pos.y + NODE_H / 2 };
  };

  return (
    <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
      {/* SVG canvas */}
      <div style={{ flex: 1, minWidth: 0, overflowX: 'auto' }}>
        <svg
          viewBox="0 0 860 480"
          style={{ width: '100%', minWidth: 720, display: 'block' }}
          aria-label="Network topology diagram"
          role="img"
        >
          {/* VLAN group backgrounds */}
          {VLAN_LABELS.map(({ x, y, vlan, width }) => {
            const v = VLAN_MAP[vlan];
            return (
              <g key={vlan}>
                <rect
                  x={x - 15} y={y - 8}
                  width={width + 10} height={160}
                  rx={12} fill={`${v.color}08`}
                  stroke={`${v.color}25`} strokeWidth={1}
                />
                <text
                  x={x - 10} y={y + 8}
                  fill={v.color} fontSize="9" fontWeight="700"
                  fontFamily="'SF Mono', Consolas, monospace"
                  letterSpacing="0.1em"
                >
                  VLAN {vlan} — {v.name}
                </text>
              </g>
            );
          })}

          {/* VLAN 99 management label near sw1-core */}
          <text x={420} y={172} fill="#f59e0b" fontSize="8" fontWeight="700"
            fontFamily="'SF Mono', Consolas, monospace" letterSpacing="0.08em">
            MGMT VLAN 99
          </text>

          {/* Connections */}
          {CONNECTIONS.map(([fromId, toId, label]) => {
            const from = getCenter(fromId);
            const to   = getCenter(toId);
            if (!from || !to) return null;
            const isTrunk = label === 'trunk';
            const vlanId = label.includes('10') ? 10 : label.includes('20') ? 20 : label.includes('30') ? 30 : 0;
            const lineColor = vlanId ? (VLAN_MAP[vlanId]?.color ?? '#3b82f6') : '#3b82f6';

            // midpoint for label
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;

            return (
              <g key={`${fromId}-${toId}`}>
                <line
                  x1={from.x} y1={from.y}
                  x2={to.x}   y2={to.y}
                  stroke={isTrunk ? '#3b82f6' : `${lineColor}80`}
                  strokeWidth={isTrunk ? 2 : 1.5}
                  strokeDasharray={isTrunk ? '6,3' : undefined}
                />
                {isTrunk && (
                  <text x={mx + 4} y={my - 4} fill="#3b82f666"
                    fontSize="8" fontFamily="'SF Mono', Consolas, monospace">
                    trunk
                  </text>
                )}
              </g>
            );
          })}

          {/* ACL blocked path indicator */}
          {(() => {
            const from = getCenter('pc1-user');
            const to   = getCenter('sw1-core');
            if (!from || !to) return null;
            const mx = (from.x + to.x) / 2 + 30;
            const my = (from.y + to.y) / 2;
            return (
              <g>
                <line
                  x1={from.x} y1={from.y}
                  x2={to.x}   y2={to.y}
                  stroke="#ef444455"
                  strokeWidth={1.5}
                  strokeDasharray="4,3"
                />
                <rect x={mx - 28} y={my - 10} width={56} height={18} rx={4}
                  fill="#ef444422" stroke="#ef444455" strokeWidth={1} />
                <text x={mx} y={my + 4} textAnchor="middle"
                  fill="#ef4444" fontSize="8" fontWeight="700"
                  fontFamily="'SF Mono', Consolas, monospace">
                  ACL BLOCK
                </text>
              </g>
            );
          })()}

          {/* Nodes */}
          {Object.entries(LAYOUT).map(([id, pos]) => {
            const device = deviceMap[id];
            if (!device) return null;
            return (
              <TopoNode
                key={id}
                device={device}
                x={pos.x} y={pos.y}
                selected={selected?.id === id}
                onSelect={setSelected}
              />
            );
          })}
        </svg>
      </div>

      {/* Selected device info panel */}
      {selected && (
        <div style={{
          width: 240,
          flexShrink: 0,
          background: 'var(--bg-elevated)',
          borderLeft: '1px solid var(--border-default)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Node Details
            </span>
            <button className="btn-icon" onClick={() => setSelected(null)} aria-label="Close details">
              <X size={14} />
            </button>
          </div>

          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {selected.name}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <DeviceTypeBadge type={selected.type} />
              <StatusBadge status={selected.status} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>IP Address</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{selected.ipAddress}</span>
            </div>
            {selected.vlan !== undefined && (() => {
              const v = VLAN_MAP[selected.vlan];
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>VLAN</span>
                    <span style={{ fontWeight: 700, color: v?.color ?? 'var(--text-muted)' }}>
                      {selected.vlan} — {v?.name ?? 'Unknown'}
                    </span>
                  </div>
                  {v && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Gateway</span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{v.gateway}</span>
                    </div>
                  )}
                </>
              );
            })()}
            {selected.type === 'router' && (
              <div style={{ marginTop: 8, background: 'var(--sev-high-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sev-high)', marginBottom: 4 }}>
                  ⚠ ACL: USER-SECURITY
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Applied inbound on G0/0.10. Blocks VLAN 10 → VLAN 99 traffic.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TopologyPage() {
  const { data: devices, loading, error, refresh } = useApi(getDevices, REFRESH_MS);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Network Topology</h1>
        <p className="page-subtitle">Live view of the NetGuard Packet Tracer network architecture</p>
      </div>

      {/* VLAN legend */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {VLANS.map(v => (
          <div key={v.id} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: `${v.color}10`, border: `1px solid ${v.color}30`,
            borderRadius: 6, padding: '4px 10px',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: v.color }}>VLAN {v.id}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.name}</span>
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{v.subnet}</span>
          </div>
        ))}
      </div>

      {/* ACL notice */}
      <div style={{
        background: 'var(--sev-high-bg)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 8,
        padding: '10px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
      }}>
        <Shield size={16} style={{ color: 'var(--sev-high)', flexShrink: 0 }} aria-hidden="true" />
        <span style={{ color: 'var(--text-primary)' }}>
          <strong style={{ color: 'var(--sev-high)' }}>ACL USER-SECURITY</strong> — Applied inbound on R1-EDGE G0/0.10.
          Blocks all VLAN 10 (Users) traffic to VLAN 99 (Management). PC1-USER → SW1-CORE access is denied.
        </span>
      </div>

      {error && <ErrorState message={error} onRetry={refresh} />}

      {!error && (
        <div className="topology-container">
          {loading && !devices ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading topology...
            </div>
          ) : devices ? (
            <TopologyCanvas devices={devices} />
          ) : null}
        </div>
      )}

      {/* Topology table reference */}
      {devices && (
        <div className="card section-gap" style={{ marginTop: 16 }}>
          <div className="card-header">
            <span className="card-title">Device Reference</span>
          </div>
          <div className="table-container">
            <table aria-label="Device reference table">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Type</th>
                  <th>IP Address</th>
                  <th>VLAN</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {devices.map(d => {
                  const v = d.vlan !== undefined ? VLAN_MAP[d.vlan] : null;
                  return (
                    <tr key={d.id} style={{ cursor: 'default' }}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td><DeviceTypeBadge type={d.type} /></td>
                      <td className="td-mono">{d.ipAddress}</td>
                      <td>
                        {v ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: v.color }}>
                            VLAN {d.vlan} — {v.name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td><StatusBadge status={d.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
