import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type IctMetricTone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'ai';

interface IctMetricCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  /** Contextual line beneath the value */
  hint?: string;
  /** Optional status badge / chip beside the hint */
  status?: React.ReactNode;
  tone?: IctMetricTone;
  /** Upper-right note, e.g. "24h" or "live" */
  aside?: React.ReactNode;
  className?: string;
  /** Optional thin meter rendered under the card body */
  meter?: React.ReactNode;
  onClick?: () => void;
}

const ACCENT: Record<IctMetricTone, { text: string; surface: string; rail: string }> = {
  default: {
    text: 'text-[var(--text-primary)] ',
    surface: 'bg-[var(--ict-accent-soft)] text-[var(--ict-accent-text)]',
    rail: '',
  },
  success: {
    text: 'text-[var(--ict-ok)]',
    surface: 'bg-[var(--ict-ok-bg)] text-[var(--ict-ok)]',
    rail: 'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-[8px] before:bg-[var(--ict-ok)]',
  },
  warning: {
    text: 'text-[var(--ict-warn)]',
    surface: 'bg-[var(--ict-warn-bg)] text-[var(--ict-warn)]',
    rail: 'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-[8px] before:bg-[var(--ict-warn)]',
  },
  danger: {
    text: 'text-[var(--ict-crit)]',
    surface: 'bg-[var(--ict-crit-bg)] text-[var(--ict-crit)]',
    rail: 'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-[8px] before:bg-[var(--ict-crit)]',
  },
  info: {
    text: 'text-[var(--ict-info)]',
    surface: 'bg-[var(--ict-info-bg)] text-[var(--ict-info)]',
    rail: 'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-[8px] before:bg-[var(--ict-info)]',
  },
  ai: {
    text: 'text-[var(--ict-ai)]',
    surface: 'bg-[var(--ict-ai-bg)] text-[var(--ict-ai)]',
    rail: 'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-[8px] before:bg-[var(--ict-ai)]',
  },
};

/**
 * Compact operational metric. Icon · label · primary value · status · context.
 * Tone only tints the value and icon chip — the card frame stays neutral so a
 * wall of metrics never looks like a colour-coded toy.
 */
export default function IctMetricCard({
  label,
  value,
  icon: Icon,
  hint,
  status,
  tone = 'default',
  aside,
  className = '',
  meter,
  onClick,
}: IctMetricCardProps) {
  const accent = ACCENT[tone];
  const interactive = Boolean(onClick);
  const Comp = interactive ? 'button' : 'div';

  return (
    <Comp
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      className={`ict-card group relative flex flex-col gap-2 overflow-hidden px-3.5 py-3 text-left transition-[border-color,box-shadow,transform] duration-150 ${
        interactive
          ? 'cursor-pointer hover:-translate-y-px hover:border-[var(--ict-accent)] hover:shadow-[var(--ict-shadow-md)]'
          : ''
      } ${accent.rail} ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="ict-label ict-clamp-1 min-w-0 text-[11px]" title={label}>
          {label}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          {aside}
          {Icon && (
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-[5px] ${accent.surface}`}
              aria-hidden
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>

      <p className={`ict-num text-[24px] font-bold leading-none tracking-[-0.02em] ${accent.text}`}>
        {value}
      </p>

      {(status || hint) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {status}
          {hint && (
            <p className="ict-clamp-1 min-w-0 text-[12px] font-normal text-[var(--text-muted)]" title={hint}>
              {hint}
            </p>
          )}
        </div>
      )}

      {meter && <div className="mt-0.5">{meter}</div>}
    </Comp>
  );
}
