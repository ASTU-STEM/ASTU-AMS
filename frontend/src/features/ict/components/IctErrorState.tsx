import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ictBtnSecondary } from './ictUi';

interface IctErrorStateProps {
  title?: string;
  description?: string;
  /** Existing retry / reload handler — wired to whatever the page already does */
  onRetry?: () => void;
  retryLabel?: string;
  action?: React.ReactNode;
  /** Optional technical detail — only pass it when it is safe to surface */
  detail?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Error presentation for module data that failed to load.
 * Operators get a plain explanation plus the retry the page already supports;
 * raw internal errors stay out unless explicitly passed as `detail`.
 */
export default function IctErrorState({
  title = 'Unable to load this data',
  description = 'The request did not complete. Check connectivity to the ASTU-AMS services and try again.',
  onRetry,
  retryLabel = 'Retry',
  action,
  detail,
  size = 'md',
  className = '',
}: IctErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center justify-center rounded-[6px] border border-[var(--ict-crit-line)]/80 bg-[var(--ict-crit-bg)] px-5 text-center ${
        size === 'sm' ? 'py-5' : 'py-8'
      } ${className}`}
    >
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--ict-crit)]/10 text-[var(--ict-crit)] ring-1 ring-inset ring-[var(--ict-crit-line)]">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-sm font-extrabold text-[var(--text-primary)] ">{title}</p>
      {description && (
        <p className="mt-1 max-w-md text-[11px] leading-relaxed text-[var(--text-secondary)] ">
          {description}
        </p>
      )}
      {detail && (
        <p className="ict-mono ict-break mt-2 max-w-md rounded border border-[var(--ict-hairline)] bg-[var(--ict-surface)] px-2 py-1 text-[10px] text-[var(--text-muted)]">
          {detail}
        </p>
      )}
      {(onRetry || action) && (
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <button type="button" onClick={onRetry} className={ictBtnSecondary}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              {retryLabel}
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
