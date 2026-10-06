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
      className={`rounded-xl border border-outline-variant bg-[var(--bg-card)] shadow-sm 
        ${onClick ? 'cursor-pointer hover:shadow-md transition-all' : ''} ${className}`}
    >
      {(title || headerRight) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
          <div>
            {title && <h3 className="text-sm font-semibold text-on-surface">{title}</h3>}
            {subtitle && <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
