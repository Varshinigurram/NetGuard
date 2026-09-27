import { useState, useMemo } from 'react';
import { Search, X, Router, Server, Monitor, Cpu } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getDevices } from '../services/api';
import { StatusBadge, DeviceTypeBadge } from '../components/common/Badges';
import { EmptyState, ErrorState, SkeletonTableRows } from '../components/common/States';
import type { NetworkDevice, DeviceType } from '../types/device';

const REFRESH_MS = 5000;

// VLAN info — static architectural knowledge, not fabricated metrics
const VLAN_INFO: Record<number, { name: string; color: string; subnet: string; gateway: string }> = {
  10: { name: 'USERS',      color: '#3b82f6', subnet: '192.168.10.0/24', gateway: '192.168.10.1' },
  20: { name: 'SERVERS',    color: '#14b8a6', subnet: '192.168.20.0/24', gateway: '192.168.20.1' },
  30: { name: 'SECURITY',   color: '#a855f7', subnet: '192.168.30.0/24', gateway: '192.168.30.1' },
  99: { name: 'MANAGEMENT', color: '#f59e0b', subnet: '192.168.99.0/24', gateway: '192.168.99.1' },
};

function DeviceIcon({ type, size = 18 }: { type: DeviceType; size?: number }) {
  switch (type) {
    case 'router': return <Router size={size} aria-hidden="true" />;
    case 'switch': return <Cpu size={size} aria-hidden="true" />;
    case 'server': return <Server size={size} aria-hidden="true" />;
    case 'pc':     return <Monitor size={size} aria-hidden="true" />;
  }
}

const typeIconColors: Record<DeviceType, string> = {
  router: 'blue',
  switch: 'badge-switch',
  server: 'badge-server',
  pc:     '',
};

function DeviceDetailPanel({ device, onClose }: { device: NetworkDevice; onClose: () => void }) {
  const vlan = device.vlan ? VLAN_INFO[device.vlan] : null;

  return (
    <div
      className="detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Device details for ${device.name}`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="detail-panel">
        <div className="detail-panel-header">
          <span className="detail-panel-title">Device Details</span>
          <button className="btn-icon" onClick={onClose} aria-label="Close panel">
            <X size={16} />
          </button>
        </div>

        <div className="detail-panel-body">
          {/* Device card */}
          <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <div className={`metric-icon ${typeIconColors[device.type] ?? 'blue'}`} style={{ width: 48, height: 48 }}>
              <DeviceIcon type={device.type} size={22} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{device.name}</div>
              <div className="flex-row" style={{ marginTop: 6, gap: 6 }}>
                <DeviceTypeBadge type={device.type} />
                <StatusBadge status={device.status} />
              </div>
            </div>
          </div>

          {/* Fields */}
          <div>
            <div className="detail-section-label">Network Information</div>
            <div className="detail-row"><span className="detail-key">Device ID</span>  <span className="detail-val mono">{device.id}</span></div>
            <div className="detail-row"><span className="detail-key">IP Address</span> <span className="detail-val mono">{device.ipAddress}</span></div>
            <div className="detail-row"><span className="detail-key">Type</span>       <DeviceTypeBadge type={device.type} /></div>
            <div className="detail-row"><span className="detail-key">Status</span>     <StatusBadge status={device.status} /></div>
            {device.vlan !== undefined && (
              <div className="detail-row">
                <span className="detail-key">VLAN</span>
                <span className="detail-val mono">
                  VLAN {device.vlan}
                  {vlan && <span style={{ marginLeft: 6, color: 'var(--text-muted)' }}>({vlan.name})</span>}
                </span>
              </div>
            )}
          </div>

          {/* VLAN info */}
          {vlan && (
            <div>
              <div className="detail-section-label">VLAN Information</div>
              <div style={{
                background: 'var(--bg-elevated)',
                border: `1px solid ${vlan.color}40`,
                borderLeft: `4px solid ${vlan.color}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
              }}>
                <div style={{ fontWeight: 700, color: vlan.color, marginBottom: 6 }}>
                  VLAN {device.vlan} — {vlan.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <div>Subnet: <span style={{ fontFamily: 'monospace' }}>{vlan.subnet}</span></div>
                  <div>Gateway: <span style={{ fontFamily: 'monospace' }}>{vlan.gateway}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Router note */}
          {device.type === 'router' && (
            <div>
              <div className="detail-section-label">Router Notes</div>
              <div style={{
                background: 'var(--accent-blue-muted)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontSize: 13,
                color: 'var(--text-primary)',
                lineHeight: 1.6,
              }}>
                R1-EDGE operates as a router-on-a-stick for inter-VLAN routing. <br />
                ACL <strong>USER-SECURITY</strong> is applied inbound on G0/0.10 to block VLAN 10 → VLAN 99 access.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DevicesPage() {
  const { data: devices, loading, error, refresh } = useApi(getDevices, REFRESH_MS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vlanFilter, setVlanFilter] = useState('');
  const [selected, setSelected] = useState<NetworkDevice | null>(null);

  const filtered = useMemo(() => {
    if (!devices) return [];
    return devices.filter(d => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || d.name.toLowerCase().includes(q)
        || d.ipAddress.includes(q)
        || d.id.toLowerCase().includes(q);
      const matchType   = !typeFilter   || d.type === typeFilter;
      const matchStatus = !statusFilter || d.status === statusFilter;
      const matchVlan   = !vlanFilter   || String(d.vlan ?? '') === vlanFilter;
      return matchSearch && matchType && matchStatus && matchVlan;
    });
  }, [devices, search, typeFilter, statusFilter, vlanFilter]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Devices</h1>
        <p className="page-subtitle">All network devices monitored by NetGuard</p>
      </div>

      {error && <ErrorState message={error} onRetry={refresh} />}

      {!error && (
        <div className="card">
          <div className="filters-row">
            <div className="search-input-wrap">
              <Search size={14} aria-hidden="true" />
              <input
                className="search-input"
                placeholder="Search devices..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search devices"
              />
            </div>
            <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} aria-label="Filter by type">
              <option value="">All Types</option>
              <option value="router">Router</option>
              <option value="switch">Switch</option>
              <option value="server">Server</option>
              <option value="pc">PC (Endpoint)</option>
            </select>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status">
              <option value="">All Statuses</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="unknown">Unknown</option>
            </select>
            <select className="filter-select" value={vlanFilter} onChange={e => setVlanFilter(e.target.value)} aria-label="Filter by VLAN">
              <option value="">All VLANs</option>
              <option value="10">VLAN 10 — Users</option>
              <option value="20">VLAN 20 — Servers</option>
              <option value="30">VLAN 30 — Security</option>
              <option value="99">VLAN 99 — Management</option>
            </select>
          </div>

          <div className="table-container">
            <table aria-label="Network devices">
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
                {loading && !devices ? (
                  <SkeletonTableRows rows={8} cols={5} />
                ) : filtered.length === 0 ? (
                  <tr style={{ cursor: 'default' }}>
                    <td colSpan={5}>
                      <EmptyState title="No devices found" message="No devices match the current filters." />
                    </td>
                  </tr>
                ) : (
                  filtered.map(device => {
                    const vlan = device.vlan ? VLAN_INFO[device.vlan] : null;
                    return (
                      <tr
                        key={device.id}
                        onClick={() => setSelected(device)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setSelected(device)}
                        aria-label={`Device: ${device.name}`}
                      >
                        <td>
                          <div className="flex-row">
                            <div className={`metric-icon ${typeIconColors[device.type] ?? 'blue'}`}
                              style={{ width: 30, height: 30, flexShrink: 0 }}>
                              <DeviceIcon type={device.type} size={14} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{device.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{device.id}</div>
                            </div>
                          </div>
                        </td>
                        <td><DeviceTypeBadge type={device.type} /></td>
                        <td className="td-mono">{device.ipAddress}</td>
                        <td>
                          {device.vlan !== undefined ? (
                            <span style={{
                              fontSize: 11, fontWeight: 700,
                              color: vlan?.color ?? 'var(--text-muted)',
                              background: `${vlan?.color ?? '#6b7280'}20`,
                              padding: '2px 8px', borderRadius: 4,
                            }}>
                              {device.vlan} {vlan ? `— ${vlan.name}` : ''}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td><StatusBadge status={device.status} /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <DeviceDetailPanel device={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
