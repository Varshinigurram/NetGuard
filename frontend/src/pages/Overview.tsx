import { useState } from 'react';
import { Server, Monitor, Activity, Bell, ShieldAlert } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getMetrics, getEvents, getAlerts } from '../services/api';
import { MetricCard, MetricCardSkeleton } from '../components/dashboard/MetricCard';
import { NetworkHealthChart, SecurityOverviewChart } from '../components/dashboard/NetworkHealth';
import { RecentEvents } from '../components/dashboard/RecentEvents';
import { ErrorState } from '../components/common/States';
import type { NetworkEvent } from '../types/event';
import { EventDetailPanel } from './Events';

const REFRESH_MS = 5000;

export function OverviewPage() {
  const metrics = useApi(getMetrics, REFRESH_MS);
  const events  = useApi(getEvents,  REFRESH_MS);
  const alerts  = useApi(getAlerts,  REFRESH_MS);
  const [selectedEvent, setSelectedEvent] = useState<NetworkEvent | null>(null);

  const isLoading = metrics.loading || events.loading;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Real-time network security monitoring summary</p>
      </div>

      {/* Metrics row */}
      <div className="metrics-grid">
        {isLoading && !metrics.data ? (
          Array.from({ length: 5 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : metrics.error ? (
          <div style={{ gridColumn: '1/-1' }}>
            <ErrorState message={metrics.error} onRetry={metrics.refresh} />
          </div>
        ) : metrics.data ? (
          <>
            <MetricCard
              icon={<Server size={18} />}
              iconColor="blue"
              label="Total Devices"
              value={metrics.data.totalDevices}
              sub={`${metrics.data.onlineDevices} online`}
              variant="device-card"
            />
            <MetricCard
              icon={<Monitor size={18} />}
              iconColor="green"
              label="Online Devices"
              value={metrics.data.onlineDevices}
              sub={`${metrics.data.offlineDevices} offline`}
              variant="device-card"
            />
            <MetricCard
              icon={<Activity size={18} />}
              iconColor="amber"
              label="Security Events"
              value={metrics.data.totalEvents}
              sub="Network activity detected"
              variant="event-card"
            />
            <MetricCard
              icon={<Bell size={18} />}
              iconColor="red"
              label="Open Alerts"
              value={metrics.data.openAlerts}
              sub={metrics.data.openAlerts > 0 ? 'Requires attention' : 'All clear'}
              variant="alert-card"
            />
            <MetricCard
              icon={<ShieldAlert size={18} />}
              iconColor="red"
              label="ACL Blocks"
              value={metrics.data.aclBlocks}
              sub="Blocked traffic detected"
              variant="acl-card"
            />
          </>
        ) : null}
      </div>

      {/* Charts */}
      {metrics.data && (
        <div className="charts-grid">
          <NetworkHealthChart metrics={metrics.data} />
          <SecurityOverviewChart metrics={metrics.data} />
        </div>
      )}

      {/* Recent events */}
      {events.error && (
        <ErrorState message={events.error} onRetry={events.refresh} />
      )}
      {(events.data || !events.loading) && (
        <RecentEvents
          events={events.data ?? []}
          onSelect={setSelectedEvent}
        />
      )}

      {/* Recent alerts summary */}
      {alerts.data && alerts.data.filter(a => a.status === 'open').length > 0 && (
        <div className="card section-gap">
          <div className="card-header">
            <span className="card-title">Open Alerts</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.data
              .filter(a => a.status === 'open')
              .slice(0, 3)
              .map(alert => (
                <div
                  key={alert.id}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: `3px solid var(--sev-${alert.severity})`,
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  role="listitem"
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {alert.sourceIp} → {alert.destinationIp}
                    </div>
                  </div>
                  <span className={`badge badge-${alert.severity}`}>{alert.severity.toUpperCase()}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Event detail panel */}
      {selectedEvent && (
        <EventDetailPanel
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
}
