import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {items.length > 0 && (
          <nav className="flex flex-wrap items-center gap-1 text-[11px] font-medium text-slate-500" aria-label="Breadcrumb">
            <a href="/admin/dashboard" className="inline-flex items-center gap-1 hover:text-[#003580] transition-colors">
              <Home className="h-3 w-3" />
            </a>
            {items.map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                <ChevronRight className="h-3 w-3 text-slate-300" />
                {item.href ? (
                  <a href={item.href} className="hover:text-[#003580] transition-colors">
                    {item.label}
                  </a>
                ) : (
                  <span className="text-slate-800 font-semibold">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 max-w-3xl text-sm text-slate-500 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
