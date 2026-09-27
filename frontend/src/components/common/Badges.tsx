import type { DeviceStatus } from '../../types/device';
import type { EventSeverity } from '../../types/event';
import type { AlertStatus, AlertSeverity } from '../../types/alert';

interface SeverityBadgeProps {
  severity: EventSeverity | AlertSeverity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span className={`badge badge-${severity}`} aria-label={`Severity: ${severity}`}>
      {severity.toUpperCase()}
    </span>
  );
}

interface StatusBadgeProps {
  status: DeviceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge badge-${status}`} aria-label={`Status: ${status}`}>
      {status.toUpperCase()}
    </span>
  );
}

interface AlertStatusBadgeProps {
  status: AlertStatus;
}

export function AlertStatusBadge({ status }: AlertStatusBadgeProps) {
  return (
    <span className={`badge badge-${status}`} aria-label={`Alert status: ${status}`}>
      {status.toUpperCase()}
    </span>
  );
}

interface DeviceTypeBadgeProps {
  type: 'router' | 'switch' | 'pc' | 'server';
}

export function DeviceTypeBadge({ type }: DeviceTypeBadgeProps) {
  const map: Record<string, string> = {
    router: 'Router',
    switch: 'Switch',
    server: 'Server',
    pc: 'Endpoint',
  };
  const cls: Record<string, string> = {
    router: 'badge-router',
    switch: 'badge-switch',
    server: 'badge-server',
    pc: 'badge-endpoint',
  };
  return (
    <span className={`badge ${cls[type]}`}>
      {map[type] ?? type}
    </span>
  );
}
