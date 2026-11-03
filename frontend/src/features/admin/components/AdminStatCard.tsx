import React from 'react';
import type { AdminStatCardData } from '../types/admin.types';

const toneStyles: Record<NonNullable<AdminStatCardData['tone']>, { bg: string; icon: string; ring: string }> = {
  blue: { bg: 'bg-[#003580]/8 dark:bg-[#15294A]', icon: 'text-[#003580] dark:text-[#22D3EE]', ring: 'ring-[#003580]/10 dark:ring-[#22D3EE]/20' },
  gold: { bg: 'bg-[#E8A020]/8 dark:bg-[#382B14]', icon: 'text-[#B87900] dark:text-[#F59E0B]', ring: 'ring-[#E8A020]/15 dark:ring-[#F59E0B]/20' },
  green: { bg: 'bg-emerald-50 dark:bg-[#163828]', icon: 'text-emerald-600 dark:text-[#22C55E]', ring: 'ring-emerald-100 dark:ring-[#22C55E]/20' },
  red: { bg: 'bg-rose-50 dark:bg-[#3B1A22]', icon: 'text-rose-600 dark:text-[#F87171]', ring: 'ring-rose-100 dark:ring-[#F87171]/20' },
  amber: { bg: 'bg-amber-50 dark:bg-[#382B14]', icon: 'text-amber-600 dark:text-[#F59E0B]', ring: 'ring-amber-100 dark:ring-[#F59E0B]/20' },
  purple: { bg: 'bg-violet-50 dark:bg-[#2E1A47]', icon: 'text-violet-600 dark:text-[#C084FC]', ring: 'ring-violet-100 dark:ring-[#C084FC]/20' },
};

export default function AdminStatCard({
  label,
  title,
  value,
  change,
  trend,
  icon: Icon,
  tone = 'blue',
  accentColor,
  trendDirection,
}: AdminStatCardData) {
  const style = toneStyles[tone];
  const heading = title ?? label ?? '';
  const trendText = trend ?? change ?? '';
  const trendTone =
    trendDirection === 'down'
      ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-[#3B1A22] dark:text-[#F87171] dark:border-[#F87171]/30'
      : trendDirection === 'flat'
        ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-[#1B2636] dark:text-[#B0BDCE] dark:border-[#2A3749]'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#163828] dark:text-[#22C55E] dark:border-[#22C55E]/30';

  return (
    <div className="group rounded-xl border border-slate-200 dark:border-[#2A3749] bg-white dark:bg-[#151D2B] p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-[#8493A8]">{heading}</p>
          <p className="text-[32px] font-bold tracking-tight text-slate-900 dark:text-[#F1F5F9]">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${style.bg}`}
          style={accentColor ? { backgroundColor: `${accentColor}12`, color: accentColor } : undefined}
        >
          <Icon className={`h-6 w-6 ${style.icon}`} />
        </div>
      </div>
      {trendText && (
        <div className="mt-4">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${trendTone}`}>{trendText}</span>
        </div>
      )}
    </div>
  );
}
