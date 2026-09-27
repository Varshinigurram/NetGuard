import { RefreshCw } from 'lucide-react';
import type { BackendStatus } from '../../hooks/useBackendHealth';

interface TopHeaderProps {
  backendStatus: BackendStatus;
  lastUpdated: Date | null;
  onRefresh: () => void;
  refreshing: boolean;
}

function formatTime(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleTimeString('en-US', { hour12: false });
}

const statusLabel: Record<BackendStatus, string> = {
  online:   'System Operational',
  offline:  'Backend Offline',
  checking: 'Checking...',
};

export function TopHeader({ backendStatus, lastUpdated, onRefresh, refreshing }: TopHeaderProps) {
  return (
    <header className="top-header" role="banner">
      <div className="header-left">
        <div className="header-title">NETGUARD</div>
        <div className="header-subtitle">Network Security Operations Center</div>
      </div>

      <div className="header-right">
        <div
          className={`system-status ${backendStatus}`}
          role="status"
          aria-live="polite"
          aria-label={`Backend status: ${statusLabel[backendStatus]}`}
        >
          <span className={`status-dot ${backendStatus}`} aria-hidden="true" />
          {statusLabel[backendStatus]}
        </div>

        {lastUpdated && (
          <span className="last-updated" aria-label={`Last updated at ${formatTime(lastUpdated)}`}>
            Updated {formatTime(lastUpdated)}
          </span>
        )}

        <button
          className="btn-refresh"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh all data"
        >
          <RefreshCw size={13} className={refreshing ? 'spinning' : ''} aria-hidden="true" />
          Refresh
        </button>
      </div>
    </header>
  );
}
