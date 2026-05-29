import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { AdminPageHeaderProps } from '../types/admin.types';

export default function AdminPageHeader({
  title,
  subtitle,
  breadcrumb = [],
  breadcrumbs = [],
  actions,
}: AdminPageHeaderProps) {
  const items = breadcrumbs.length > 0 ? breadcrumbs : breadcrumb;

  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border-color)] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 text-[11px] font-medium text-[var(--text-secondary)]">
            {items.map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                {item.href ? (
                    <a href={item.href} className="hover:text-[#003580]">
                    {item.label}
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="mt-1 max-w-3xl text-sm text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
