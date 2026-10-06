import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface IctEmergencyBannerProps {
  message: string;
  type?: 'emergency' | 'maintenance' | 'info';
  onDismiss?: () => void;
}

const TONE: Record<string, { bar: string; surface: string; accent: string }> = {
  emergency: {
    bar: 'bg-[var(--ict-crit)]',
    surface: 'bg-[var(--ict-crit-bg)]',
    accent: 'text-[var(--ict-crit)]',
  },
  maintenance: {
    bar: 'bg-[var(--ict-warn)]',
    surface: 'bg-[var(--ict-warn-bg)]',
    accent: 'text-[var(--ict-warn)]',
  },
  info: {
    bar: 'bg-[var(--ict-info)]',
    surface: 'bg-[var(--ict-info-bg)]',
    accent: 'text-[var(--ict-info)]',
  },
};

const LABEL: Record<string, string> = {
  emergency: 'Emergency',
  maintenance: 'Maintenance',
  info: 'Notice',
};

/**
 * Institutional-wide announcement rail. Reads as a status bar, not a marketing
 * banner — flat surface, colour-coded left edge, dismiss affordance.
 */
export default function IctEmergencyBanner({
  message,
  type = 'emergency',
  onDismiss,
}: IctEmergencyBannerProps) {
  if (!message) return null;
  const tone = TONE[type] || TONE.emergency;

  return (
    <div className={`relative flex items-center gap-2.5 border-b border-[var(--border-color)] px-3 py-2 sm:px-4 ${tone.surface}`}>
      <span className={`absolute inset-y-0 left-0 w-[3px] ${tone.bar}`} aria-hidden />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <ShieldAlert className={`h-3.5 w-3.5 shrink-0 ict-pulse ${tone.accent}`} aria-hidden />
        <span className={`text-[10px] font-extrabold uppercase tracking-[0.1em] ${tone.accent}`}>{LABEL[type] || 'Notice'}</span>
        <span className="h-3 w-px shrink-0 bg-current opacity-20" aria-hidden />
        <p className={`ict-clamp-1 min-w-0 text-[11px] font-bold ${tone.accent}`} title={message}>
          {message}
        </p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={`shrink-0 rounded p-1 transition-colors hover:bg-[var(--bg-card)]/40 ${tone.accent} ict-focus`}
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}
