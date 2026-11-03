import React from 'react';
import { TrendingDown, TrendingUp, Minus, type LucideIcon } from 'lucide-react';

export type DashboardStatTone = 'blue' | 'gold' | 'green' | 'red' | 'amber' | 'purple';

export interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** Material Symbols name when Lucide icon is not provided */
  materialIcon?: string;
  trend?: string;
  description?: string;
  tone?: DashboardStatTone;
  trendDirection?: 'up' | 'down' | 'flat';
  progress?: number;
  onClick?: () => void;
  loading?: boolean;
  compact?: boolean;
  className?: string;
}

const toneStyles: Record<
  DashboardStatTone,
  { bg: string; icon: string; bar: string; soft: string }
> = {
  blue: {
    bg: 'bg-[#003580]/8 dark:bg-sky-500/15',
    icon: 'text-[#003580] dark:text-sky-300',
    bar: 'bg-[#003580]',
    soft: 'hover:border-[#003580]/35 dark:hover:border-sky-400/40',
  },
  gold: {
    bg: 'bg-[#E8A020]/10 dark:bg-amber-500/15',
    icon: 'text-[#B87900] dark:text-amber-300',
    bar: 'bg-[#E8A020]',
    soft: 'hover:border-[#E8A020]/40 dark:hover:border-amber-400/40',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/15',
    icon: 'text-emerald-600 dark:text-emerald-300',
    bar: 'bg-emerald-500',
    soft: 'hover:border-emerald-400/50',
  },
  red: {
    bg: 'bg-rose-50 dark:bg-rose-500/15',
    icon: 'text-rose-600 dark:text-rose-300',
    bar: 'bg-rose-500',
    soft: 'hover:border-rose-400/50',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-500/15',
    icon: 'text-amber-600 dark:text-amber-300',
    bar: 'bg-amber-500',
    soft: 'hover:border-amber-400/50',
  },
  purple: {
    bg: 'bg-violet-50 dark:bg-violet-500/15',
    icon: 'text-violet-600 dark:text-violet-300',
    bar: 'bg-violet-500',
    soft: 'hover:border-violet-400/50',
  },
};

/**
 * Shared KPI card used across Registrar, Employer, Department, and Admin-style dashboards.
 */
export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  materialIcon,
  trend,
  description,
  tone = 'blue',
  trendDirection = 'up',
  progress,
  onClick,
  loading = false,
  compact = false,
  className = '',
}: DashboardStatCardProps) {
  const style = toneStyles[tone];
  const interactive = Boolean(onClick);
  const progressValue =
    typeof progress === 'number' && Number.isFinite(progress)
      ? Math.max(0, Math.min(100, progress))
      : undefined;

  const trendTone =
    trendDirection === 'down'
      ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
      : trendDirection === 'flat'
        ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';

  const TrendIcon =
    trendDirection === 'down' ? TrendingDown : trendDirection === 'flat' ? Minus : TrendingUp;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      title={interactive ? `Open ${label}` : undefined}
      className={[
        'group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-200',
        'dark:border-slate-800 dark:bg-slate-900',
        interactive ? `cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${style.soft}` : 'hover:-translate-y-0.5 hover:shadow-md',
        compact ? 'p-4' : 'p-5',
        className,
      ].join(' ')}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-slate-50 opacity-70 dark:bg-slate-800/60" />

      <div className="relative flex items-start justify-between gap-3">
        <div className={`min-w-0 ${compact ? 'space-y-1' : 'space-y-1.5'}`}>
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            {label}
          </p>
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
          ) : (
            <p
              className={`font-bold tracking-tight text-slate-900 dark:text-white ${
                compact ? 'text-2xl' : 'text-[28px] sm:text-[32px]'
              }`}
            >
              {value ?? '—'}
            </p>
          )}
        </div>

        <div
          className={`flex shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${
            compact ? 'h-10 w-10' : 'h-11 w-11 sm:h-12 sm:w-12'
          } ${style.bg} ${style.icon}`}
        >
          {Icon ? (
            <Icon className={compact ? 'h-5 w-5' : 'h-5 w-5 sm:h-6 sm:w-6'} />
          ) : materialIcon ? (
            <span className={`material-symbols-outlined ${compact ? 'text-[20px]' : 'text-[22px]'}`}>
              {materialIcon}
            </span>
          ) : null}
        </div>
      </div>

      {typeof progressValue === 'number' && (
        <div className="relative mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full rounded-full transition-all duration-500 ${style.bar}`} style={{ width: `${progressValue}%` }} />
          </div>
          <p className="mt-1 text-[10px] font-semibold text-slate-400">{progressValue.toFixed(0)}%</p>
        </div>
      )}

      {(trend || description) && (
        <div className={`relative ${compact ? 'mt-2.5' : 'mt-3.5'} flex flex-wrap items-center gap-2`}>
          {trend && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${trendTone}`}>
              <TrendIcon className="h-3 w-3" />
              {trend}
            </span>
          )}
          {description && (
            <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardStatCard;
