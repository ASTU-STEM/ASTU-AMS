import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface DashboardQuickNavItem {
  id: string;
  title: string;
  description: string;
  onClick: () => void;
  icon?: LucideIcon;
  materialIcon?: string;
  badge?: string | number | null;
  tone?: 'navy' | 'green' | 'amber' | 'rose' | 'violet';
}

const toneMap = {
  navy: 'bg-[#003580]/10 text-[#003580] group-hover:bg-[#003580] group-hover:text-white',
  green: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white',
  amber: 'bg-amber-50 text-amber-700 group-hover:bg-amber-500 group-hover:text-white',
  rose: 'bg-rose-50 text-rose-700 group-hover:bg-rose-500 group-hover:text-white',
  violet: 'bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white',
};

export interface DashboardQuickNavProps {
  title?: string;
  subtitle?: string;
  items: DashboardQuickNavItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * Shared shortcut / workflow cards for role dashboards.
 */
export function DashboardQuickNav({
  title = 'Quick actions',
  subtitle,
  items,
  columns = 3,
  className = '',
}: DashboardQuickNavProps) {
  if (!items?.length) return null;

  const grid =
    columns === 2
      ? 'md:grid-cols-2'
      : columns === 4
        ? 'md:grid-cols-2 xl:grid-cols-4'
        : 'md:grid-cols-2 xl:grid-cols-3';

  return (
    <section
      className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>

      <div className={`grid grid-cols-1 gap-3 ${grid}`}>
        {items.map((item) => {
          const Icon = item.icon;
          const tone = toneMap[item.tone || 'navy'];
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#003580]/30 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${tone}`}
                >
                  {Icon ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">{item.materialIcon || 'bolt'}</span>
                  )}
                </div>
                {item.badge != null && item.badge !== '' && (
                  <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                    {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-[#003580] dark:text-white">
                {item.title}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default DashboardQuickNav;
