import React from 'react';
import type { AdminStatCardData } from '../types/admin.types';

const toneStyles: Record<NonNullable<AdminStatCardData['tone']>, { bg: string; icon: string; ring: string }> = {
  blue: { bg: 'bg-[#003580]/8', icon: 'text-[#003580]', ring: 'ring-[#003580]/10' },
  gold: { bg: 'bg-[#E8A020]/8', icon: 'text-[#B87900]', ring: 'ring-[#E8A020]/15' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
  red: { bg: 'bg-rose-50', icon: 'text-rose-600', ring: 'ring-rose-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
  purple: { bg: 'bg-violet-50', icon: 'text-violet-600', ring: 'ring-violet-100' },
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
      ? 'bg-rose-50 text-rose-600 border-rose-200'
      : trendDirection === 'flat'
        ? 'bg-[var(--bg-page)] text-[var(--text-muted)] border-[var(--border-color)]'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <div className="group rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{heading}</p>
          <p className="text-[32px] font-bold tracking-tight text-[var(--text-primary)]">{value}</p>
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
