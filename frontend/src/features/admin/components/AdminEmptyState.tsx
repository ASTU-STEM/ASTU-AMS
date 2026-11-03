import React from 'react';
import { LucideIcon, Inbox, AlertTriangle } from 'lucide-react';

export interface AdminEmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: 'empty' | 'error' | 'search';
  className?: string;
}

export default function AdminEmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'empty',
  className = '',
}: AdminEmptyStateProps) {
  const IconComponent = icon || (variant === 'error' ? AlertTriangle : Inbox);

  const iconStyles = {
    empty: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    error: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    search: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  }[variant];

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-8 text-center transition-colors ${className}`}
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xs mb-4 ${iconStyles}`}>
        <IconComponent className="h-7 w-7" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#002660] focus:outline-hidden dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-700/60 focus:outline-hidden"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
