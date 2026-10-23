import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IctPageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  /** Optional chips rendered between the description and the actions */
  meta?: React.ReactNode;
}

/**
 * Consistent module header for every ICT page.
 * Single title / description / action row — Alumni-quality hierarchy, ICT density.
 */
export default function IctPageHeader({
  icon: Icon,
  title,
  description,
  actions,
  breadcrumbs,
  meta,
}: IctPageHeaderProps) {
  return (
    <header className="ict-rise flex flex-col gap-3.5 border-b border-[var(--ict-hairline)] pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] border border-[var(--ict-hairline)] bg-[var(--bg-card)] text-[var(--ict-accent-text)]"
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0">
          {breadcrumbs && (
            <div className="mb-1.5 flex flex-wrap items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)]">
              {breadcrumbs}
            </div>
          )}
          <h1 className="text-[24px] font-bold leading-tight tracking-[-0.025em] text-[var(--text-primary)] sm:text-[26px]">
            {title}
          </h1>
          <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>
          {meta && <div className="mt-2.5 flex flex-wrap items-center gap-1.5">{meta}</div>}
        </div>
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end sm:pt-0.5">{actions}</div>
      ) : null}
    </header>
  );
}
