import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { NetworkMetrics } from '../../types/metrics';

interface NetworkHealthProps {
  metrics: NetworkMetrics;
}

const STATUS_COLORS = ['#22c55e', '#ef4444', '#6b7280'];
const SEV_COLORS    = ['#22c55e', '#f59e0b', '#ef4444', '#dc2626'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color?: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{
      background: 'var(--bg-overlay)',
      border: '1px solid var(--border-default)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
      color: 'var(--text-primary)',
    }}>
      <span style={{ color: item.payload.color }}>{item.name}</span>: <strong>{item.value}</strong>
    </div>
  );
}

export function NetworkHealthChart({ metrics }: NetworkHealthProps) {
  const deviceData = [
    { name: 'Online',  value: metrics.onlineDevices,             color: STATUS_COLORS[0] },
    { name: 'Offline', value: metrics.offlineDevices,            color: STATUS_COLORS[1] },
    { name: 'Unknown', value: metrics.totalDevices - metrics.onlineDevices - metrics.offlineDevices, color: STATUS_COLORS[2] },
  ].filter(d => d.value > 0);

  return (
    <div className="card section-gap">
      <div className="card-header">
        <span className="card-title">Device Health</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {metrics.totalDevices} total devices
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={deviceData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            aria-label="Device health distribution"
          >
            {deviceData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SecurityOverviewChart({ metrics }: NetworkHealthProps) {
  const alertData = [
    { name: 'Resolved',   value: Math.max(0, metrics.totalAlerts - metrics.openAlerts),          color: SEV_COLORS[0] },
    { name: 'Open',       value: Math.max(0, metrics.openAlerts - metrics.criticalAlerts),        color: SEV_COLORS[1] },
    { name: 'Critical',   value: Math.max(0, metrics.criticalAlerts),                            color: SEV_COLORS[2] },
    { name: 'ACL Blocks', value: Math.max(0, metrics.aclBlocks),                                color: SEV_COLORS[3] },
  ].filter(d => d.value > 0);

  if (alertData.length === 0) {
    alertData.push({ name: 'No Alerts', value: 1, color: SEV_COLORS[0] });
  }

  return (
    <div className="card section-gap">
      <div className="card-header">
        <span className="card-title">Security Overview</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {metrics.totalAlerts} total alerts
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={alertData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            aria-label="Security alert distribution"
          >
            {alertData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
