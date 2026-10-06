import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
  color?: string;
  onClick?: () => void;
}

export default function StatCard({ title, value, icon, trend, subtitle, color, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-outline-variant bg-[var(--bg-card)] p-5 shadow-sm transition-all
        ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-on-surface-variant">{title}</p>
          <p className="text-2xl font-bold text-on-surface">{value}</p>
          {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <svg
                className={`w-4 h-4 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                {trend.isPositive ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                )}
              </svg>
              <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`p-3 rounded-lg ${color ? '' : 'bg-astu-navy/10'}`}
            style={color ? { backgroundColor: `${color}15`, color } : undefined}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
