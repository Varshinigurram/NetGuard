/**
 * TestIngest.tsx  —  Network Event Console
 *
 * Development / demo route only (/test-ingest, dev builds only).
 *
 * Purpose: simulate the role of a network event bridge — the component that
 * would forward a structured security event observed in the Cisco Packet Tracer
 * network to the NetGuard monitoring backend via POST /api/events.
 *
 * This page does NOT represent direct Cisco Packet Tracer → Windows communication.
 * Packet Tracer is a network simulator; its simulated devices cannot make real
 * TCP connections to this host.  This console records the event that was *observed*
 * in the simulation and submits it as a structured payload to the backend.
 */

import { useState } from 'react';
import {
  Shield,
  Send,
  CheckCircle,
  AlertTriangle,
  Info,
  Network,
  ChevronRight,
} from 'lucide-react';
import { postEvent } from '../services/api';
import type { NetworkEvent } from '../types/event';

// ─── Observed event (matches the actual Packet Tracer ACL block scenario) ──────

const OBSERVED_EVENT: Omit<NetworkEvent, 'id' | 'timestamp'> = {
  eventType: 'ACL_BLOCK',
  severity: 'high',
  sourceIp: '192.168.10.11',
  destinationIp: '192.168.99.2',
  sourceDeviceId: 'pc1-user',
  destinationDeviceId: 'sw1-core',
  protocol: 'ICMP',
  message: 'ACL blocked unauthorized management access from PC1-USER to SW1-CORE',
};

const EVENT_META = {
  sourceVlan: 'VLAN 10 — USERS',
  destinationVlan: 'VLAN 99 — MANAGEMENT',
  aclName: 'USER-SECURITY',
  appliedOn: 'R1-EDGE  G0/0.10  (inbound)',
  action: 'DENY',
};

function generateEventId(): string {
  return `acl-obs-${Date.now()}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SubmitState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'duplicate'; message: string }
  | { phase: 'success'; eventId: string; anomalyDetected: boolean; alertCreated: boolean }
  | { phase: 'error'; message: string };

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({ label, value, mono = false, accent = false }: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '180px 1fr',
      gap: 8,
      padding: '7px 0',
      borderBottom: '1px solid var(--border-subtle)',
      alignItems: 'center',
    }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{
        fontSize: 13,
        fontFamily: mono ? 'monospace' : undefined,
        color: accent ? 'var(--sev-high)' : 'var(--text-primary)',
        fontWeight: accent ? 700 : 500,
      }}>
        {value}
      </span>
    </div>
  );
}

function PipelineStep({
  done,
  label,
  sub,
}: {
  done: boolean;
  label: string;
  sub?: string;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '8px 0',
    }}>
      <div style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: done ? 'rgba(34,197,94,0.15)' : 'var(--bg-overlay)',
        border: `1px solid ${done ? 'rgba(34,197,94,0.4)' : 'var(--border-subtle)'}`,
        marginTop: 1,
      }}>
        {done
          ? <CheckCircle size={13} style={{ color: 'var(--status-online)' }} />
          : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border-default)' }} />
        }
      </div>
      <div>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: done ? 'var(--text-primary)' : 'var(--text-muted)',
        }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function TestIngestPage() {
  const [eventId] = useState(generateEventId);
  const [currentId, setCurrentId] = useState(eventId);
  const [state, setState] = useState<SubmitState>({ phase: 'idle' });

  const handleSubmit = async () => {
    setState({ phase: 'loading' });

    const event: NetworkEvent = {
      id: currentId,
      timestamp: new Date().toISOString(),
      ...OBSERVED_EVENT,
    };

    try {
      const result = await postEvent(event);

      if (result.duplicate) {
        setState({ phase: 'duplicate', message: result.message ?? 'This event has already been recorded.' });
        return;
      }

      setState({
        phase: 'success',
        eventId: event.id,
        anomalyDetected: result.anomalyDetected ?? false,
        alertCreated: result.alertCreated ?? false,
      });

      // Rotate ID so next submission is a new unique event
      setCurrentId(generateEventId());
    } catch (err: unknown) {
      setState({
        phase: 'error',
        message: err instanceof Error ? err.message : 'Request failed',
      });
    }
  };

  const isLoading = state.phase === 'loading';
  const isDone = state.phase === 'success';

  return (
    <>
      {/* ── Dev-context notice ──────────────────────────────────────── */}
      <div
        role="note"
        aria-label="Development context"
        style={{
          background: 'rgba(59,130,246,0.07)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '9px 14px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 9,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        <Info size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: 1 }} />
        <span>
          <strong style={{ color: 'var(--text-secondary)' }}>Development / demonstration route</strong>
          {' — '}
          available only in dev builds. This console records a security event
          observed in the Cisco Packet Tracer simulation and forwards the structured
          payload to the NetGuard backend. It is not a direct network connection from
          Packet Tracer to this host.
        </span>
      </div>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Network size={22} style={{ color: 'var(--accent-blue)' }} />
          <div>
            <h1 className="page-title" style={{ marginBottom: 2 }}>Network Event Console</h1>
            <p className="page-subtitle">
              This console records a security event observed in the Cisco Packet Tracer
              network and forwards the structured event to the NetGuard monitoring backend.
            </p>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 8 }}>

        {/* LEFT — observed event details */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Shield size={14} style={{ color: 'var(--sev-high)' }} />
              Observed Security Event
            </span>
            <span className={`badge badge-high`}>ACL_BLOCK</span>
          </div>

          <div style={{ padding: '4px 0' }}>
            <DetailRow label="Event Type"    value="ACL_BLOCK"           accent />
            <DetailRow label="Severity"      value="HIGH"                accent />
            <DetailRow label="Protocol"      value="ICMP"                mono />
            <DetailRow label="Source IP"     value="192.168.10.11"       mono />
            <DetailRow label="Source VLAN"   value={EVENT_META.sourceVlan} />
            <DetailRow label="Destination IP"    value="192.168.99.2"     mono />
            <DetailRow label="Destination VLAN"  value={EVENT_META.destinationVlan} />
          </div>

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ACL Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 14px', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>ACL Name</span>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{EVENT_META.aclName}</span>
              <span style={{ color: 'var(--text-muted)' }}>Applied on</span>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{EVENT_META.appliedOn}</span>
              <span style={{ color: 'var(--text-muted)' }}>Action</span>
              <span style={{ color: 'var(--sev-high)', fontWeight: 700 }}>{EVENT_META.action}</span>
            </div>
          </div>
        </div>

        {/* RIGHT — submission + result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Submit card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Forward to NetGuard Backend</span>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
              Submits the observed event as a structured JSON payload to{' '}
              <code style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                POST /api/events
              </code>
              . The backend will validate, persist, and run anomaly detection automatically.
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Event ID: </span>
              <code style={{ fontFamily: 'monospace' }}>{currentId}</code>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => void handleSubmit()}
              disabled={isLoading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Send size={14} />
              {isLoading ? 'Forwarding event…' : 'Record Observed ACL Event'}
            </button>
          </div>

          {/* Pipeline status card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Processing Pipeline</span>
            </div>

            <PipelineStep
              done={isDone || state.phase === 'duplicate'}
              label="Security event received"
              sub={isDone ? `POST /api/events → 201 Created` : state.phase === 'duplicate' ? 'POST /api/events → 200 Duplicate' : undefined}
            />
            <PipelineStep
              done={isDone}
              label="Event persisted"
              sub={isDone ? `events.json updated` : undefined}
            />
            <PipelineStep
              done={isDone && state.phase === 'success' && state.anomalyDetected}
              label="Rule-based anomaly detected"
              sub={isDone && state.phase === 'success' && state.anomalyDetected
                ? 'ACL_BLOCK → isAnomaly: true, severity: high'
                : undefined}
            />
            <PipelineStep
              done={isDone && state.phase === 'success' && state.alertCreated}
              label="Alert generated"
              sub={isDone && state.phase === 'success' && state.alertCreated
                ? `alert-${state.eventId}`
                : undefined}
            />

            {/* Result block */}
            {state.phase === 'success' && (
              <div style={{
                marginTop: 14,
                padding: '10px 12px',
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <CheckCircle size={13} style={{ color: 'var(--status-online)' }} />
                  <strong style={{ color: 'var(--status-online)' }}>Pipeline complete</strong>
                </div>
                <div>
                  Dashboard will reflect this event within the next polling cycle (≤ 5 s).
                  Check{' '}
                  <strong style={{ color: 'var(--text-secondary)' }}>Events</strong>,{' '}
                  <strong style={{ color: 'var(--text-secondary)' }}>Anomalies</strong>,{' '}
                  <strong style={{ color: 'var(--text-secondary)' }}>Alerts</strong>, and{' '}
                  <strong style={{ color: 'var(--text-secondary)' }}>Overview</strong>.
                </div>
              </div>
            )}

            {state.phase === 'duplicate' && (
              <div style={{
                marginTop: 14,
                padding: '10px 12px',
                background: 'rgba(59,130,246,0.06)',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Info size={13} style={{ color: 'var(--accent-blue)' }} />
                  <strong style={{ color: 'var(--accent-blue)' }}>Already recorded</strong>
                </div>
                <div>{state.message}</div>
                <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>
                  A new event ID has been assigned above for the next submission.
                </div>
              </div>
            )}

            {state.phase === 'error' && (
              <div style={{
                marginTop: 14,
                padding: '10px 12px',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <AlertTriangle size={13} style={{ color: 'var(--sev-high)' }} />
                  <strong style={{ color: 'var(--sev-high)' }}>Forwarding failed</strong>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>{state.message}</div>
                <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>
                  Ensure the backend is running on port 5000.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Architecture note ────────────────────────────────────────── */}
      <div className="card section-gap" style={{ marginTop: 20 }}>
        <div className="card-header">
          <span className="card-title">NetGuard Architecture</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 6,
          padding: '8px 0',
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          {[
            'Cisco Packet Tracer\n(simulated network)',
            'Observed ACL block\n(manual bridge)',
            'POST /api/events',
            'Validate + Persist',
            'analyzeEvent()',
            'Auto-generate alert',
            'Frontend polling\n(every 5 s)',
            'Dashboard update',
          ].map((label, i, arr) => (
            <span key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <span style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
                color: 'var(--text-secondary)',
                whiteSpace: 'pre',
                textAlign: 'center',
                lineHeight: 1.4,
              }}>
                {label}
              </span>
              {i < arr.length - 1 && (
                <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 4 }} />
              )}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
