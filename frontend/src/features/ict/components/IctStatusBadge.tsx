import React from 'react';
import { ictBadgeBase, ictTone } from './ictUi';

export type IctStatusTone = 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'ai';

/**
 * The single status language for the whole ICT console.
 *
 * Colour is never the only signal: every badge carries a dot AND a text label,
 * so the state is still legible in monochrome or for colour-blind operators.
 */
const TONES: Record<IctStatusTone, string> = {
  success: `${ictTone.success.bg} ${ictTone.success.fg} ${ictTone.success.ring}`,
  info: `${ictTone.info.bg} ${ictTone.info.fg} ${ictTone.info.ring}`,
  warning: `${ictTone.warning.bg} ${ictTone.warning.fg} ${ictTone.warning.ring}`,
  danger: `${ictTone.danger.bg} ${ictTone.danger.fg} ${ictTone.danger.ring}`,
  neutral: `${ictTone.neutral.bg} ${ictTone.neutral.fg} ${ictTone.neutral.ring}`,
  ai: `${ictTone.ai.bg} ${ictTone.ai.fg} ${ictTone.ai.ring}`,
};

const DOT_TONES: Record<IctStatusTone, string> = {
  success: ictTone.success.dot,
  info: ictTone.info.dot,
  warning: ictTone.warning.dot,
  danger: ictTone.danger.dot,
  neutral: ictTone.neutral.dot,
  ai: ictTone.ai.dot,
};

/** Normalized status → tone + display label. Pulse only for genuinely live states. */
const STATUS_MAP: Record<string, { tone: IctStatusTone; label: string; pulse?: boolean }> = {
  // Operational
  healthy: { tone: 'success', label: 'HEALTHY' },
  operational: { tone: 'success', label: 'OPERATIONAL' },
  full: { tone: 'success', label: 'FULL' },
  ok: { tone: 'success', label: 'OK' },
  synced: { tone: 'success', label: 'SYNCED' },
  connected: { tone: 'success', label: 'CONNECTED' },
  available: { tone: 'success', label: 'AVAILABLE' },
  enabled: { tone: 'success', label: 'ENABLED' },
  resolved: { tone: 'success', label: 'RESOLVED' },
  recovered: { tone: 'success', label: 'RECOVERED' },
  protected: { tone: 'success', label: 'PROTECTED' },
  pass: { tone: 'success', label: 'PASS' },
  success: { tone: 'success', label: 'SUCCESS' },
  active_now: { tone: 'success', label: 'ACTIVE NOW' },

  // In flight / informational
  open: { tone: 'info', label: 'OPEN' },
  in_progress: { tone: 'info', label: 'IN PROGRESS' },
  investigating: { tone: 'info', label: 'INVESTIGATING' },
  mitigating: { tone: 'info', label: 'MITIGATING' },
  syncing: { tone: 'info', label: 'SYNCING', pulse: true },
  testing: { tone: 'info', label: 'TESTING' },
  info: { tone: 'info', label: 'INFO' },
  notice: { tone: 'info', label: 'NOTICE' },
  monitored: { tone: 'info', label: 'MONITORED' },

  // Attention
  active: { tone: 'success', label: 'ACTIVE' },
  rollout: { tone: 'warning', label: 'ROLLOUT' },
  degraded: { tone: 'warning', label: 'DEGRADED' },
  warning: { tone: 'warning', label: 'WARNING' },
  pending: { tone: 'warning', label: 'PENDING' },
  pending_ict_admin: { tone: 'warning', label: 'PENDING ICT', pulse: true },
  waiting: { tone: 'warning', label: 'WAITING' },
  partial: { tone: 'warning', label: 'PARTIAL' },
  medium: { tone: 'warning', label: 'MEDIUM' },
  high: { tone: 'warning', label: 'HIGH' },

  // Critical
  down: { tone: 'danger', label: 'DOWN', pulse: true },
  critical: { tone: 'danger', label: 'CRITICAL', pulse: true },
  failed: { tone: 'danger', label: 'FAILED' },
  error: { tone: 'danger', label: 'ERROR' },
  revoked: { tone: 'danger', label: 'REVOKED' },
  action_required: { tone: 'danger', label: 'ACTION REQUIRED' },
  low: { tone: 'neutral', label: 'LOW' },

  // Inactive / unknown
  disabled: { tone: 'neutral', label: 'DISABLED' },
  unknown: { tone: 'neutral', label: 'UNKNOWN' },
  closed: { tone: 'neutral', label: 'CLOSED' },
  archived: { tone: 'neutral', label: 'ARCHIVED' },
  inactive: { tone: 'neutral', label: 'INACTIVE' },
  expired: { tone: 'neutral', label: 'EXPIRED' },
  pending_queue: { tone: 'neutral', label: 'QUEUED' },

  // HTTP methods
  get: { tone: 'info', label: 'GET' },
  post: { tone: 'success', label: 'POST' },
  put: { tone: 'warning', label: 'PUT' },
  patch: { tone: 'warning', label: 'PATCH' },
  delete: { tone: 'danger', label: 'DELETE' },

  // Environments
  development: { tone: 'info', label: 'DEVELOPMENT' },
  staging: { tone: 'warning', label: 'STAGING' },
  production: { tone: 'danger', label: 'PRODUCTION' },
  sandbox: { tone: 'neutral', label: 'SANDBOX' },

  // AI surfaces
  ai: { tone: 'ai', label: 'AI' },
};

function normalize(raw: string) {
  return raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export function resolveIctStatus(status: string | null | undefined): {
  tone: IctStatusTone;
  label: string;
  pulse: boolean;
} {
  const raw = (status ?? '').trim();
  if (!raw) return { tone: 'neutral', label: 'UNKNOWN', pulse: false };
  const mapped = STATUS_MAP[normalize(raw)];
  if (mapped) return { tone: mapped.tone, label: mapped.label, pulse: Boolean(mapped.pulse) };
  return { tone: 'neutral', label: raw.toUpperCase(), pulse: false };
}

interface IctStatusBadgeProps {
  status: string | null | undefined;
  className?: string;
  showDot?: boolean;
  /** Override display label */
  label?: string;
  size?: 'xs' | 'sm' | 'md';
}

export default function IctStatusBadge({
  status,
  className = '',
  showDot = true,
  label,
  size = 'sm',
}: IctStatusBadgeProps) {
  const resolved = resolveIctStatus(status);
  const tone = resolved.tone;
  const sizeCls =
    size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : size === 'md' ? 'px-2 py-1 text-[12px]' : 'px-1.5 py-0.5 text-[11px]';
  const text = label || resolved.label;

  return (
    <span
      className={`${ictBadgeBase} ${TONES[tone]} ${sizeCls} ${className}`}
      title={text}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_TONES[tone]} ${resolved.pulse ? 'ict-pulse' : ''}`}
          aria-hidden
        />
      )}
      <span className="ict-clamp-1">{text}</span>
    </span>
  );
}

/** HTTP method badge — no dot, monospace so it lines up in endpoint tables */
export function IctMethodBadge({ method, className = '' }: { method: string; className?: string }) {
  return (
    <IctStatusBadge
      status={method}
      showDot={false}
      className={`ict-mono tracking-tight ${className}`}
    />
  );
}

/**
 * Severity badge with an explicit level scale.
 * Critical is visually dominant; INFO/LOW stay quiet so they do not compete.
 */
export function IctSeverityBadge({
  severity,
  className = '',
  label,
}: {
  severity: string;
  className?: string;
  label?: string;
}) {
  const resolved = resolveIctStatus(severity);
  const isCritical = resolved.tone === 'danger';
  return (
    <IctStatusBadge
      status={severity}
      label={label}
      className={isCritical ? `${className} ring-inset font-black` : className}
    />
  );
}

/** Deployment environment chip */
export function IctEnvironmentBadge({ environment, className = '' }: { environment: string; className?: string }) {
  return <IctStatusBadge status={environment} showDot={false} className={`ict-mono ${className}`} />;
}

/**
 * Record age indicator. Derived purely from a timestamp that already exists on
 * the record — no thresholds are invented here.
 */
export function IctAgeBadge({
  timestamp,
  className = '',
  staleAfterHours,
}: {
  timestamp: string | number | Date | null | undefined;
  className?: string;
  /** When supplied, ages beyond the threshold are flagged as needing attention */
  staleAfterHours?: number;
}) {
  if (!timestamp) return <span className={`ict-mono text-[var(--text-muted)] ${className}`}>—</span>;

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return <span className={`ict-mono text-[var(--text-muted)] ${className}`}>—</span>;
  }

  const hours = (Date.now() - date.getTime()) / 36e5;
  const stale = typeof staleAfterHours === 'number' ? hours >= staleAfterHours : false;
  const suffix =
    hours < 1 ? `${Math.max(1, Math.round(hours * 60))}m ago` : hours < 48 ? `${Math.round(hours)}h ago` : `${Math.round(hours / 24)}d ago`;

  return (
    <span
      className={`ict-mono whitespace-nowrap ${stale ? 'text-[var(--ict-warn)]' : 'text-[var(--text-muted)]'} ${className}`}
      title={date.toLocaleString()}
    >
      {suffix}
    </span>
  );
}
