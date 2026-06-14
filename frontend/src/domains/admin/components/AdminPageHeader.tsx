import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import type { AdminPageHeaderProps } from '../types/admin.types';

export default function AdminPageHeader({
  title,
  subtitle,
  breadcrumb = [],
  breadcrumbs = [],
  actions,
  className = '',
}: AdminPageHeaderProps) {
  const items = breadcrumbs.length > 0 ? breadcrumbs : breadcrumb;

  return (
    <div className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="space-y-2">
        {items.length > 0 && (
          <nav className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-slate-400" aria-label="Breadcrumb">
            <a href="/cms/dashboard" className="inline-flex items-center gap-1 hover:text-[#003580] transition-colors">
              <Home className="h-3.5 w-3.5" />
            </a>
            {items.map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                <ChevronRight className="h-3 w-3 text-slate-300" />
                {item.href ? (
                  <a href={item.href} className="hover:text-[#003580] transition-colors">
                    {item.label}
                  </a>
                ) : (
                  <span className="text-slate-500 font-semibold">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-3xl text-sm text-slate-500 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
