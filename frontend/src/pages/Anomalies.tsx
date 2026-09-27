import { useState } from 'react';
import { Microscope, Search } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getEvents, getAnomaly } from '../services/api';
import { SeverityBadge } from '../components/common/Badges';
import { EmptyState, ErrorState, LoadingSpinner, SkeletonTableRows } from '../components/common/States';
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

interface AnomalyCardProps {
  event: NetworkEvent;
}

function AnomalyCard({ event }: AnomalyCardProps) {
  const [result, setResult] = useState<AnomalyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnomaly(event.id);
      setResult(res.data);
      setAnalyzed(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Event header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {event.id}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {formatTimestamp(event.timestamp)}
          </div>
        </div>
        <div className="flex-row" style={{ gap: 8 }}>
          <span style={{ fontWeight: 600, color: 'var(--accent-blue)', fontSize: 12 }}>{event.eventType}</span>
          <SeverityBadge severity={event.severity} />
        </div>
      </div>

      {/* Flow */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Network Flow
        </div>
        <div className="acl-flow">
          <div className="acl-node" style={{ padding: '8px 12px', minWidth: 100 }}>
            <div className="acl-node-label" style={{ fontSize: 11 }}>
              {event.sourceDeviceId?.toUpperCase() ?? 'SOURCE'}
            </div>
            <div className="acl-node-ip">{event.sourceIp ?? '—'}</div>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>→</span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
            background: 'var(--bg-overlay)', padding: '3px 8px', borderRadius: 4,
          }}>
            {event.protocol ?? 'N/A'}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>→</span>
          <div className="acl-node" style={{ padding: '8px 12px', minWidth: 100 }}>
            <div className="acl-node-label" style={{ fontSize: 11 }}>
              {event.destinationDeviceId?.toUpperCase() ?? 'DEST'}
            </div>
            <div className="acl-node-ip">{event.destinationIp ?? '—'}</div>
          </div>
        </div>
      </div>

      {/* Result or analyze button */}
      <div style={{ padding: '14px 18px' }}>
        {analyzed && result ? (
          <div className={`anomaly-result ${result.isAnomaly ? 'is-anomaly' : 'not-anomaly'}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className={`anomaly-verdict ${result.isAnomaly ? 'is-anomaly' : 'not-anomaly'}`} style={{ fontSize: 14 }}>
                {result.isAnomaly ? '⚠ ANOMALY DETECTED' : '✓ NO ANOMALY'}
              </div>
              <SeverityBadge severity={result.severity} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {result.reason}
            </div>
            {result.isAnomaly && event.eventType === 'ACL_BLOCK' && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                Triggered by ACL <strong style={{ color: 'var(--sev-high)' }}>USER-SECURITY</strong> —
                VLAN 10 access to VLAN 99 (Management) is blocked.
              </div>
            )}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={analyze} />
        ) : (
          <button className="btn btn-secondary" onClick={analyze} disabled={loading}>
            {loading
              ? <><LoadingSpinner size={14} /> Analyzing...</>
              : <><Microscope size={14} /> Analyze Anomaly</>
            }
          </button>
        )}
      </div>
    </div>
  );
}

export function AnomaliesPage() {
  const { data: events, loading, error, refresh } = useApi(getEvents, REFRESH_MS);
  const [search, setSearch] = useState('');

  const filtered = events?.filter(ev => {
    const q = search.toLowerCase();
    return !q
      || ev.id.toLowerCase().includes(q)
      || ev.eventType.toLowerCase().includes(q)
      || ev.sourceIp?.includes(q)
      || ev.destinationIp?.includes(q);
  }) ?? [];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Anomaly Investigation</h1>
        <p className="page-subtitle">Analyze network events for anomalies using the NetGuard detection engine</p>
      </div>

      {error && <ErrorState message={error} onRetry={refresh} />}

      {!error && (
        <>
          <div className="filters-row section-gap">
            <div className="search-input-wrap">
              <Search size={14} aria-hidden="true" />
              <input
                className="search-input"
                placeholder="Search events to analyze..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search events"
              />
            </div>
          </div>

          {loading && !events ? (
            <div className="card">
              <table>
                <tbody><SkeletonTableRows rows={3} cols={3} /></tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No events to analyze"
              message="No security events are currently available for anomaly analysis."
              icon={<Microscope size={40} />}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered
                .slice()
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map(ev => (
                  <AnomalyCard key={ev.id} event={ev} />
                ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
