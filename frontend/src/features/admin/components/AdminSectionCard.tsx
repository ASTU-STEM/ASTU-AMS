import React from 'react';
import { dashboardPanelClass } from '../../../components/dashboard/DashboardPanel';

/** Alias of the shared dashboard panel surface — keep admin pages on one chrome. */
export const adminPanelClass = dashboardPanelClass;

export const adminInputClass =
  'w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10';

export const adminFilterShellClass =
  'flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--text-primary)]';

export const adminTableHeadClass =
  'sticky top-0 z-10 bg-[var(--bg-page)] text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]';

export const adminTableRowClass =
  'border-t border-[var(--border-color)] text-[var(--text-secondary)] transition hover:bg-black/[0.03] dark:hover:bg-white/[0.04]';

export const adminHeroGhostBtnClass =
  'inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-inner backdrop-blur-sm transition hover:bg-white/20';

export const adminHeroPrimaryBtnClass =
  'inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#003580] shadow-sm transition hover:bg-[#FFCC00] hover:text-[#001F4D] disabled:cursor-not-allowed disabled:opacity-60';

export const adminTabRailClass =
  'flex flex-wrap gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]';

export function adminTabBtnClass(active: boolean) {
  return [
    'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
    active
      ? 'bg-[#003580] text-white shadow-sm'
      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]',
  ].join(' ');
}

export default function AdminSectionCard({
  title,
  subtitle,
  action,
  headerAction,
  children,
  className = '',
  bodyClassName = '',
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Alias used by NotificationCenter */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const trailing = action ?? headerAction;

  return (
    <section className={`${adminPanelClass} p-5 ${className}`}>
      {(title || trailing) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>}
            {subtitle && <p className="mt-1 text-xs text-[var(--text-secondary)]">{subtitle}</p>}
          </div>
          {trailing && <div className="shrink-0">{trailing}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
