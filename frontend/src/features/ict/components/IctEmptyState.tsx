import React from 'react';
import type { LucideIcon } from 'lucide-react';

type IctEmptyTone = 'neutral' | 'success' | 'info' | 'warning';

const TONE: Record<IctEmptyTone, string> = {
  neutral: 'bg-[var(--ict-mute-bg)] text-[var(--ict-mute)] ring-[var(--ict-mute-line)]',
  success: 'bg-[var(--ict-ok-bg)] text-[var(--ict-ok)] ring-[var(--ict-ok-line)]',
  info: 'bg-[var(--ict-info-bg)] text-[var(--ict-info)] ring-[var(--ict-info-line)]',
  warning: 'bg-[var(--ict-warn-bg)] text-[var(--ict-warn)] ring-[var(--ict-warn-line)]',
};

interface IctEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** An action that genuinely exists — never a placeholder */
  action?: React.ReactNode;
  tone?: IctEmptyTone;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Professional empty state. Every module uses one so no page ever shows a
 * blank white rectangle with no explanation.
 */
export default function IctEmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'neutral',
  size = 'md',
  className = '',
}: IctEmptyStateProps) {
  const compact = size === 'sm';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center rounded-[6px] border border-dashed border-[var(--border-color)] bg-[var(--ict-surface-inset)] px-5 text-center  ${
        compact ? 'py-6' : 'py-10'
      } ${className}`}
    >
      {Icon && (
        <span
          className={`mb-3 inline-flex items-center justify-center rounded-md ring-1 ring-inset ${TONE[tone]} ${
            compact ? 'h-9 w-9' : 'h-11 w-11'
          }`}
          aria-hidden
        >
          <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </span>
      )}
      <p className={`font-extrabold text-[var(--text-primary)]  ${compact ? 'text-xs' : 'text-sm'}`}>
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-md text-[11px] leading-relaxed text-[var(--text-muted)]">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
