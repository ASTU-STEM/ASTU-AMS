import React from 'react';
import { AlertTriangle, RefreshCw, Inbox } from 'lucide-react';

// ─── Skeleton ────────────────────────────────────────────────────────────────

interface CmsSkeletonProps {
  rows?: number;
  card?: boolean;
}

export function CmsSkeleton({ rows = 4, card = false }: CmsSkeletonProps) {
  if (card) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5"
        >
          <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────────

interface CmsErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function CmsError({ message = 'Failed to load data.', onRetry }: CmsErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
        <AlertTriangle className="h-7 w-7 text-rose-500" />
      </div>
      <div>
        <p className="text-sm font-bold text-rose-700 dark:text-rose-400">Something went wrong</p>
        <p className="mt-1 text-xs text-rose-500 dark:text-rose-500/80 max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

interface CmsEmptyProps {
  label?: string;
  description?: string;
  action?: React.ReactNode;
}

export function CmsEmpty({ label = 'No items found', description, action }: CmsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Inbox className="h-7 w-7 text-slate-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{label}</p>
        {description && (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 max-w-xs">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Inline Loading Spinner ───────────────────────────────────────────────────

export function CmsSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8';
  return (
    <svg
      className={`${sizeClass} animate-spin text-[#003580] dark:text-blue-400`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
