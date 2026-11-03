import React from 'react';

/** Canonical panel surface shared by role + admin dashboards */
export const dashboardPanelClass =
  'rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]';

export interface DashboardPanelProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Shared content panel wrapper for role dashboards. */
export function DashboardPanel({
  title,
  subtitle,
  actions,
  children,
  className = '',
}: DashboardPanelProps) {
  return (
    <section className={`${dashboardPanelClass} p-5 ${className}`}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export default DashboardPanel;
