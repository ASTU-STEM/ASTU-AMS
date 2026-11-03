import React from 'react';
import IctStatusBadge, { resolveIctStatus } from './IctStatusBadge';

/**
 * Compact health indicator — status dot + label, optionally followed by a
 * secondary metric. Used wherever a service/connector/endpoint is listed so
 * health reads identically everywhere.
 */
export default function IctHealthIndicator({
  status,
  label,
  detail,
  size = 'sm',
  className = '',
}: {
  status: string | null | undefined;
  /** Overrides the mapped label, e.g. "Healthy" instead of "HEALTHY" */
  label?: string;
  /** Right-aligned contextual value, e.g. a latency reading */
  detail?: React.ReactNode;
  size?: 'xs' | 'sm';
  className?: string;
}) {
  const resolved = resolveIctStatus(status);

  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <IctStatusBadge status={status} label={label} size={size} />
      {detail && (
        <span className="ict-mono ict-num shrink-0 text-[11px] font-bold text-[var(--text-secondary)] ">
          {detail}
        </span>
      )}
      <span className="sr-only">{resolved.label}</span>
    </span>
  );
}

/** Slim horizontal capacity / utilisation meter */
export function IctMeter({
  value,
  max = 100,
  tone = 'info',
  label,
  className = '',
}: {
  value: number;
  max?: number;
  tone?: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = {
    success: 'bg-[var(--ict-ok)]',
    info: 'bg-[var(--ict-info)]',
    warning: 'bg-[var(--ict-warn)]',
    danger: 'bg-[var(--ict-crit)]',
    neutral: 'bg-[var(--ict-mute)]',
  }[tone];

  return (
    <div
      className={`ict-meter-track ${className}`}
      role="meter"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div className={`h-full rounded-full transition-[width] duration-300 ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Stacked status distribution bar (2xx / 4xx / 5xx style breakdowns) */
export function IctStatusBar({
  segments,
  className = '',
  ariaLabel,
}: {
  segments: { value: number; tone: 'success' | 'warning' | 'danger' | 'neutral'; label: string }[];
  className?: string;
  ariaLabel?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const fill = {
    success: 'bg-[var(--ict-ok)]',
    warning: 'bg-[var(--ict-warn)]',
    danger: 'bg-[var(--ict-crit)]',
    neutral: 'bg-[var(--ict-mute)]',
  };

  return (
    <div className={className}>
      <div
        className="ict-meter-track"
        role="img"
        aria-label={ariaLabel || segments.map((s) => `${s.label} ${s.value}%`).join(', ')}
      >
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <div
                key={s.label}
                className={`h-full transition-[width] duration-300 ${fill[s.tone]}`}
                style={{ width: `${(s.value / total) * 100}%` }}
                title={`${s.label}: ${s.value}%`}
              />
            ))}
      </div>
    </div>
  );
}
