import React from 'react';
import { Link2 } from 'lucide-react';
import IctStatusBadge, { IctAgeBadge } from './IctStatusBadge';
import { ictTone } from './ictUi';

export interface IntegrationHealth {
  name: string;
  status: string;
  /** Base endpoint or host, rendered monospace */
  endpoint?: string;
  latency?: string;
  failuresToday?: number;
  /** Only supplied when the page actually has a timestamp for it */
  lastChecked?: string;
  /** Short category tag, e.g. "SIS", "EMAIL", "PAYMENTS" */
  category?: string;
}

const RAIL: Record<string, string> = {
  success: 'bg-[var(--ict-ok)]',
  info: 'bg-[var(--ict-info)]',
  warning: 'bg-[var(--ict-warn)]',
  danger: 'bg-[var(--ict-crit)]',
  neutral: 'bg-[var(--ict-mute)]',
};

function railFor(status: string) {
  const normalized = (status || '').trim().toLowerCase();
  if (['healthy', 'operational', 'connected', 'synced'].includes(normalized)) return RAIL.success;
  if (['degraded', 'warning', 'partial', 'pending'].includes(normalized)) return RAIL.warning;
  if (['down', 'failed', 'error', 'critical', 'revoked'].includes(normalized)) return RAIL.danger;
  if (['active', 'syncing', 'in_progress'].includes(normalized)) return RAIL.info;
  return RAIL.neutral;
}

/**
 * Enterprise connector row.
 *
 * Renders only the fields the caller has real values for — a missing metric is
 * simply omitted rather than filled with a placeholder number.
 */
export default function IctIntegrationCard({
  integration,
  actions,
  className = '',
  onClick,
}: {
  integration: IntegrationHealth;
  /** Real, already-implemented actions only */
  actions?: React.ReactNode;
  className?: string;
  /** Makes the row a link/button when a details view exists */
  onClick?: () => void;
}) {
  const { name, status, endpoint, latency, failuresToday, lastChecked, category } = integration;
  const down = (status || '').toUpperCase() === 'DOWN';
  const failures = failuresToday ?? 0;

  const body = (
    <>
      {/* Status rail: reads at a glance without colouring the whole card */}
      <span className={`absolute inset-y-0 left-0 w-[3px] rounded-l-[8px] ${railFor(status)}`} aria-hidden />

      <div className="min-w-0 flex-1 pl-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[14px] font-semibold leading-tight text-[var(--text-primary)]">
            {name}
          </span>
          <IctStatusBadge status={status} />
          {category && (
            <span className="rounded-[4px] bg-[var(--ict-surface-inset)] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.06em] text-[var(--text-muted)] ring-1 ring-inset ring-[var(--border-color)] ">
              {category}
            </span>
          )}
        </div>

        {endpoint && (
          <p className="mt-1 flex min-w-0 items-center gap-1 text-[12px] text-[var(--text-muted)]">
            <Link2 className="h-3 w-3 shrink-0" aria-hidden />
            <span className="ict-mono ict-clamp-1" title={endpoint}>
              {endpoint}
            </span>
          </p>
        )}

        <dl className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
          {latency !== undefined && (
            <div className="flex items-baseline gap-1">
              <dt className="ict-label">Latency</dt>
              <dd
                className={`ict-mono ict-num font-bold ${
                  down ? 'text-[var(--ict-crit)]' : 'text-[var(--text-primary)] '
                }`}
              >
                {latency}
              </dd>
            </div>
          )}
          {failuresToday !== undefined && (
            <div className="flex items-baseline gap-1">
              <dt className="ict-label">Failures</dt>
              <dd
                className={`ict-num font-bold ${failures > 0 ? ictTone.danger.fg : 'text-[var(--text-muted)]'}`}
              >
                {failures}
              </dd>
            </div>
          )}
          {lastChecked !== undefined && (
            <div className="flex items-baseline gap-1">
              <dt className="ict-label">Last checked</dt>
              <dd>
                <IctAgeBadge timestamp={lastChecked} />
              </dd>
            </div>
          )}
        </dl>
      </div>

      {actions && <div className="flex shrink-0 items-center gap-1.5 pl-1">{actions}</div>}
    </>
  );

  const shell = `ict-card relative flex flex-col gap-3 p-3 transition-[border-color,box-shadow] duration-150 sm:flex-row sm:items-center sm:justify-between ${
    down ? 'ict-bd-critical' : 'ict-hover-accent ict-shadow-sm'
  } ${className}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${shell} w-full text-left ict-focus`}>
        {body}
      </button>
    );
  }

  return <div className={shell}>{body}</div>;
}
