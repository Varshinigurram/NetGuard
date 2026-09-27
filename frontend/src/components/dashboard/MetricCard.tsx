import type { ReactNode } from 'react';
import { SkeletonCard } from '../common/States';

interface MetricCardProps {
  icon: ReactNode;
  iconColor: 'blue' | 'green' | 'amber' | 'red';
  label: string;
  value: number | string;
  sub?: string;
  variant?: string;
}

export function MetricCard({ icon, iconColor, label, value, sub, variant }: MetricCardProps) {
  return (
    <article className={`metric-card ${variant ?? ''}`} aria-label={`${label}: ${value}`}>
      <div className="metric-card-top">
        <div className={`metric-icon ${iconColor}`} aria-hidden="true">
          {icon}
        </div>
      </div>
      <div>
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
        {sub && <div className="metric-sub">{sub}</div>}
      </div>
    </article>
  );
}

export function MetricCardSkeleton() {
  return <SkeletonCard />;
}
