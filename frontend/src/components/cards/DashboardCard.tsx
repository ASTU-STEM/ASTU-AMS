import React from 'react';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  subtitle,
  children,
  className = '',
  headerRight,
  onClick,
}: DashboardCardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-200 dark:border-slate-800 dark:bg-slate-900
        ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:border-[#003580]/25 hover:shadow-md' : 'hover:shadow-md'} ${className}`}
    >
      {(title || headerRight) && (
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
