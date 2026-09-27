import { useState, useMemo } from 'react';
import { Search, X, Microscope } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getEvents, getAnomaly } from '../services/api';
import { SeverityBadge } from '../components/common/Badges';
import { EmptyState, ErrorState, SkeletonTableRows, LoadingSpinner } from '../components/common/States';
import type { NetworkEvent } from '../types/event';
import type { AnomalyResult } from '../types/metrics';

const REFRESH_MS = 5000;

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });
  } catch {
    return ts;
  }
}

/* ---- Event detail panel (exported for Overview use) ---- */
interface EventDetailPanelProps {
  event: NetworkEvent;
  onClose: () => void;
}

export function EventDetailPanel({ event, onClose }: EventDetailPanelProps) {
  const [anomaly, setAnomaly] = useState<AnomalyResult | null>(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [anomalyError, setAnomalyError] = useState<string | null>(null);

  const analyze = async () => {
    setAnomalyLoading(true);
    setAnomalyError(null);
    try {
      const res = await getAnomaly(event.id);
      setAnomaly(res.data);
    } catch (err: unknown) {
      setAnomalyError(err instanceof Error ? err.message : 'Anomaly analysis failed');
    } finally {
      setAnomalyLoading(false);
    }
  };

  return (
    <div
      className="detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Event details for ${event.id}`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="detail-panel">
        <div className="detail-panel-header">
          <span className="detail-panel-title">Event Details</span>
          <button className="btn-icon" onClick={onClose} aria-label="Close panel">
            <X size={16} />
          </button>
        </div>

        <div className="detail-panel-body">
          {/* Event info */}
          <div>
            <div className="detail-section-label">Event Information</div>
            <div className="detail-row"><span className="detail-key">Event ID</span>     <span className="detail-val mono">{event.id}</span></div>
            <div className="detail-row"><span className="detail-key">Timestamp</span>    <span className="detail-val mono">{formatTimestamp(event.timestamp)}</span></div>
            <div className="detail-row"><span className="detail-key">Type</span>         <span className="detail-val" style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{event.eventType}</span></div>
            <div className="detail-row"><span className="detail-key">Severity</span>     <SeverityBadge severity={event.severity} /></div>
            <div className="detail-row"><span className="detail-key">Protocol</span>     <span className="detail-val mono">{event.protocol ?? '—'}</span></div>
          </div>

          {/* Network flow */}
          <div>
            <div className="detail-section-label">Network Flow</div>
            <div className="detail-row"><span className="detail-key">Source IP</span>    <span className="detail-val mono">{event.sourceIp ?? '—'}</span></div>
            <div className="detail-row"><span className="detail-key">Source Device</span><span className="detail-val mono">{event.sourceDeviceId ?? '—'}</span></div>
            <div className="detail-row"><span className="detail-key">Dest IP</span>      <span className="detail-val mono">{event.destinationIp ?? '—'}</span></div>
            <div className="detail-row"><span className="detail-key">Dest Device</span>  <span className="detail-val mono">{event.destinationDeviceId ?? '—'}</span></div>
          </div>

          {/* Message */}
          <div>
            <div className="detail-section-label">Message</div>
            <div style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontSize: 13,
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              border: '1px solid var(--border-subtle)',
            }}>
              {event.message}
            </div>
          </div>

          {/* ACL block visualization */}
          {event.eventType === 'ACL_BLOCK' && (
            <div className="acl-viz">
              <div className="detail-section-label" style={{ marginBottom: 14 }}>ACL Block — USER-SECURITY</div>
              <div className="acl-flow">
                <div className="acl-node">
                  <div className="acl-node-label">{event.sourceDeviceId?.toUpperCase() ?? 'SOURCE'}</div>
                  <div className="acl-node-ip">{event.sourceIp}</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>→</span>
                <div className="acl-block-badge">
                  <span className="acl-block-label">⛔ BLOCKED</span>
                  <span className="acl-block-detail">ACL: USER-SECURITY</span>
                  <span className="acl-block-detail">{event.protocol}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>→</span>
                <div className="acl-node">
                  <div className="acl-node-label">{event.destinationDeviceId?.toUpperCase() ?? 'DEST'}</div>
                  <div className="acl-node-ip">{event.destinationIp}</div>
                </div>
              </div>
            </div>
          )}

          {/* Anomaly analysis */}
          <div>
            <div className="detail-section-label">Anomaly Analysis</div>
            {anomaly ? (
              <div className={`anomaly-result ${anomaly.isAnomaly ? 'is-anomaly' : 'not-anomaly'}`}>
                <div className={`anomaly-verdict ${anomaly.isAnomaly ? 'is-anomaly' : 'not-anomaly'}`}>
                  {anomaly.isAnomaly ? '⚠ Anomaly Detected' : '✓ No Anomaly'}
                </div>
                <div className="flex-row" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Severity:</span>
                  <SeverityBadge severity={anomaly.severity} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{anomaly.reason}</div>
              </div>
            ) : anomalyError ? (
              <ErrorState message={anomalyError} onRetry={analyze} />
            ) : (
              <button className="btn btn-secondary" onClick={analyze} disabled={anomalyLoading}>
                {anomalyLoading
                  ? <><LoadingSpinner size={14} /> Analyzing...</>
                  : <><Microscope size={14} /> Analyze Anomaly</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Events page ---- */
export function EventsPage() {
  const { data: events, loading, error, refresh } = useApi(getEvents, REFRESH_MS);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState<NetworkEvent | null>(null);

  const filtered = useMemo(() => {
    if (!events) return [];
    return events.filter(ev => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || ev.id.toLowerCase().includes(q)
        || ev.sourceIp?.toLowerCase().includes(q)
        || ev.destinationIp?.toLowerCase().includes(q)
        || ev.eventType.toLowerCase().includes(q)
        || ev.message.toLowerCase().includes(q);
      const matchSev  = !severityFilter || ev.severity === severityFilter;
      const matchType = !typeFilter     || ev.eventType === typeFilter;
      return matchSearch && matchSev && matchType;
    });
  }, [events, search, severityFilter, typeFilter]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Security Events</h1>
        <p className="page-subtitle">All network security events recorded by NetGuard</p>
      </div>

      {error && <ErrorState message={error} onRetry={refresh} />}

      {!error && (
        <div className="card">
          <div className="filters-row">
            <div className="search-input-wrap">
              <Search size={14} aria-hidden="true" />
              <input
                className="search-input"
                placeholder="Search events..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search events"
              />
            </div>
            <select
              className="filter-select"
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              aria-label="Filter by severity"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              aria-label="Filter by event type"
            >
              <option value="">All Types</option>
              <option value="ACL_BLOCK">ACL Block</option>
              <option value="SYSLOG">Syslog</option>
              <option value="CONNECTION">Connection</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <div className="table-container">
            <table aria-label="Security events">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Protocol</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {loading && !events ? (
                  <SkeletonTableRows rows={5} cols={7} />
                ) : filtered.length === 0 ? (
                  <tr style={{ cursor: 'default' }}>
                    <td colSpan={7}>
                      <EmptyState
                        title="No security events found"
                        message="No events match the current filters."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered
                    .slice()
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(ev => (
                      <tr
                        key={ev.id}
                        onClick={() => setSelected(ev)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setSelected(ev)}
                        aria-label={`Event ${ev.id}`}
                      >
                        <td className="td-mono" style={{ whiteSpace: 'nowrap' }}>{formatTimestamp(ev.timestamp)}</td>
                        <td><span style={{ fontWeight: 600, color: 'var(--accent-blue)', fontSize: 12 }}>{ev.eventType}</span></td>
                        <td><SeverityBadge severity={ev.severity} /></td>
                        <td className="td-mono">{ev.sourceIp ?? '—'}</td>
                        <td className="td-mono">{ev.destinationIp ?? '—'}</td>
                        <td className="td-mono">{ev.protocol ?? '—'}</td>
                        <td style={{ color: 'var(--text-secondary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.message}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <EventDetailPanel event={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
