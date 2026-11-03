import React from 'react';
import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  to?: string;
}

/** Breadcrumb trail shared by every ICT module header */
export default function IctBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-[11px]">
        {items.map((crumb, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
              {crumb.to && !last ? (
                <Link
                  to={crumb.to}
                  className="rounded-[3px] font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--ict-accent-text)] ict-focus"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={`font-semibold ${last ? 'text-[var(--text-primary)] ' : 'text-[var(--text-muted)]'}`}
                  aria-current={last ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
              {!last && (
                <span className="select-none px-0.5 text-[var(--text-muted)]/70" aria-hidden>
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
