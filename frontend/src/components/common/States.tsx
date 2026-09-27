import { AlertTriangle, Inbox, RefreshCw, WifiOff } from 'lucide-react';

export function LoadingSpinner({ size = 18 }: { size?: number }) {
  return (
    <RefreshCw
      size={size}
      className="spinning"
      aria-label="Loading"
      style={{ color: 'var(--accent-blue)' }}
    />
  );
}

export function SkeletonLine({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 4 }}
      role="presentation"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonLine width="60%" height={12} />
          <SkeletonLine width="40%" height={10} />
        </div>
      </div>
      <SkeletonLine width="30%" height={28} />
      <div style={{ marginTop: 8 }}>
        <SkeletonLine width="50%" height={10} />
      </div>
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} style={{ cursor: 'default' }}>
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} style={{ padding: '12px 16px' }}>
              <SkeletonLine width={`${50 + Math.random() * 40}%`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'No data available',
  message = 'Nothing to display at this time.',
  icon,
}: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      {icon ?? <Inbox size={40} aria-hidden="true" />}
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-sub">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Failed to load data', message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <AlertTriangle size={20} aria-hidden="true" />
      <div>
        <p className="error-state-title">{title}</p>
        <p className="error-state-msg">{message}</p>
        {onRetry && (
          <button
            className="btn btn-secondary"
            onClick={onRetry}
            style={{ marginTop: 10 }}
          >
            <RefreshCw size={14} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

interface OfflineBannerProps {
  onRetry: () => void;
}

export function OfflineBanner({ onRetry }: OfflineBannerProps) {
  return (
    <div className="offline-banner" role="alert">
      <div className="offline-banner-icon" aria-hidden="true">
        <WifiOff size={28} />
      </div>
      <h2 className="offline-banner-title">Backend Connection Unavailable</h2>
      <p className="offline-banner-msg">
        NetGuard cannot reach the backend API server.
        <br />
        Ensure the server is running on port 5000.
      </p>
      <button className="btn btn-primary" onClick={onRetry}>
        <RefreshCw size={14} />
        Retry Connection
      </button>
    </div>
  );
}
