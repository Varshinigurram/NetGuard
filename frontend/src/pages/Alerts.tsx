import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getAlerts } from '../services/api';
import { SeverityBadge, AlertStatusBadge } from '../components/common/Badges';
import { EmptyState, ErrorState, SkeletonTableRows } from '../components/common/States';
import type { SecurityAlert } from '../types/alert';

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

/* ---- Alert detail panel ---- */
interface AlertDetailPanelProps {
  alert: SecurityAlert;
  onClose: () => void;
}

function AlertDetailPanel({ alert, onClose }: AlertDetailPanelProps) {
  return (
    <div
      className="detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Alert details for ${alert.id}`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="detail-panel">
        <div className="detail-panel-header">
          <span className="detail-panel-title">Alert Details</span>
          <button className="btn-icon" onClick={onClose} aria-label="Close panel">
            <X size={16} />
          </button>
        </div>

        <div className="detail-panel-body">
          {/* Header block */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderLeft: `4px solid var(--sev-${alert.severity})`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
              {alert.title}
            </div>
            <div className="flex-row">
              <SeverityBadge severity={alert.severity} />
              <AlertStatusBadge status={alert.status} />
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="detail-section-label">Alert Information</div>
            <div className="detail-row"><span className="detail-key">Alert ID</span>   <span className="detail-val mono">{alert.id}</span></div>
            <div className="detail-row"><span className="detail-key">Created</span>    <span className="detail-val mono">{formatTimestamp(alert.createdAt)}</span></div>
            <div className="detail-row"><span className="detail-key">Updated</span>    <span className="detail-val mono">{formatTimestamp(alert.updatedAt)}</span></div>
            <div className="detail-row"><span className="detail-key">Source IP</span>  <span className="detail-val mono">{alert.sourceIp ?? '—'}</span></div>
            <div className="detail-row"><span className="detail-key">Dest IP</span>    <span className="detail-val mono">{alert.destinationIp ?? '—'}</span></div>
          </div>

          {/* Related events */}
          {alert.eventIds.length > 0 && (
            <div>
              <div className="detail-section-label">Related Events</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {alert.eventIds.map(eid => (
                  <div key={eid} style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span className="detail-val mono">{eid}</span>
                    <Link
                      to={`/events`}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                      onClick={onClose}
                    >
                      View Event
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="detail-section-label">Description</div>
            <div style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontSize: 13,
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              border: '1px solid var(--border-subtle)',
            }}>
              {alert.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Alerts page ---- */
export function AlertsPage() {
  const { data: alerts, loading, error, refresh } = useApi(getAlerts, REFRESH_MS);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<SecurityAlert | null>(null);

  const filtered = useMemo(() => {
    if (!alerts) return [];
    return alerts.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || a.id.toLowerCase().includes(q)
        || a.title.toLowerCase().includes(q)
        || a.sourceIp?.toLowerCase().includes(q)
        || a.destinationIp?.toLowerCase().includes(q);
      const matchSev    = !severityFilter || a.severity === severityFilter;
      const matchStatus = !statusFilter   || a.status === statusFilter;
      return matchSearch && matchSev && matchStatus;
    });
  }, [alerts, search, severityFilter, statusFilter]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Alert Center</h1>
        <p className="page-subtitle">Security alerts and notifications requiring attention</p>
      </div>

      {error && <ErrorState message={error} onRetry={refresh} />}

      {!error && (
        <div className="card">
          <div className="filters-row">
            <div className="search-input-wrap">
              <Search size={14} aria-hidden="true" />
              <input
                className="search-input"
                placeholder="Search alerts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search alerts"
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
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="table-container">
            <table aria-label="Security alerts">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Source → Dest</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {loading && !alerts ? (
                  <SkeletonTableRows rows={4} cols={5} />
                ) : filtered.length === 0 ? (
                  <tr style={{ cursor: 'default' }}>
                    <td colSpan={5}>
                      <EmptyState
                        title="No active security alerts"
                        message="No open alerts are currently reported by NetGuard."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered
                    .slice()
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(alert => (
                      <tr
                        key={alert.id}
                        onClick={() => setSelected(alert)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setSelected(alert)}
                        aria-label={`Alert: ${alert.title}`}
                      >
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{alert.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{alert.id}</div>
                        </td>
                        <td><SeverityBadge severity={alert.severity} /></td>
                        <td><AlertStatusBadge status={alert.status} /></td>
                        <td className="td-mono">{alert.sourceIp ?? '—'} → {alert.destinationIp ?? '—'}</td>
                        <td className="td-mono" style={{ whiteSpace: 'nowrap' }}>{formatTimestamp(alert.createdAt)}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <AlertDetailPanel alert={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
