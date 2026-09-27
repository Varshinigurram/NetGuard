import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { NetworkEvent } from '../../types/event';
import { SeverityBadge } from '../common/Badges';
import { EmptyState } from '../common/States';

interface RecentEventsProps {
  events: NetworkEvent[];
  onSelect: (event: NetworkEvent) => void;
}

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

export function RecentEvents({ events, onSelect }: RecentEventsProps) {
  const recent = [...events]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="card section-gap">
      <div className="card-header">
        <span className="card-title">Recent Security Events</span>
        <Link
          to="/events"
          className="btn btn-secondary"
          style={{ padding: '4px 10px', fontSize: 12 }}
          aria-label="View all security events"
        >
          View All <ArrowRight size={12} />
        </Link>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          title="No security events"
          message="No events have been recorded yet."
        />
      ) : (
        <div className="table-container">
          <table aria-label="Recent security events">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Source → Dest</th>
                <th>Severity</th>
                <th>Proto</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(ev => (
                <tr
                  key={ev.id}
                  onClick={() => onSelect(ev)}
                  role="button"
                  aria-label={`Event ${ev.id}: ${ev.eventType}`}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && onSelect(ev)}
                >
                  <td className="td-mono" style={{ whiteSpace: 'nowrap' }}>{formatTimestamp(ev.timestamp)}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--accent-blue)', fontSize: 12 }}>
                      {ev.eventType}
                    </span>
                  </td>
                  <td className="td-mono">
                    {ev.sourceIp ?? '—'} → {ev.destinationIp ?? '—'}
                  </td>
                  <td><SeverityBadge severity={ev.severity} /></td>
                  <td className="td-mono">{ev.protocol ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
