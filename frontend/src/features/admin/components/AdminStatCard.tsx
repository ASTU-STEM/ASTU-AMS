import React from 'react';
import type { AdminStatCardData } from '../types/admin.types';

const toneStyles: Record<NonNullable<AdminStatCardData['tone']>, { bg: string; icon: string; ring: string; left: string }> = {
  blue: { bg: 'bg-[#003580]/10', icon: 'text-[#003580]', ring: 'ring-[#003580]/10', left: 'border-[#003580]' },
  gold: { bg: 'bg-[#E8A020]/10', icon: 'text-[#B87900]', ring: 'ring-[#E8A020]/15', left: 'border-[#E8A020]' },
  green: { bg: 'bg-[#1D9E75]/10', icon: 'text-[#1D9E75]', ring: 'ring-[#1D9E75]/15', left: 'border-[#1D9E75]' },
  red: { bg: 'bg-[#E24B4A]/10', icon: 'text-[#E24B4A]', ring: 'ring-[#E24B4A]/15', left: 'border-[#E24B4A]' },
  amber: { bg: 'bg-[#EF9F27]/10', icon: 'text-[#C47A06]', ring: 'ring-[#EF9F27]/15', left: 'border-[#EF9F27]' },
  purple: { bg: 'bg-violet-100', icon: 'text-violet-600', ring: 'ring-violet-100', left: 'border-violet-500' },
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
      ? 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15'
      : trendDirection === 'flat'
        ? 'bg-slate-100 text-slate-600 border-slate-200'
        : trendText.toLowerCase().includes('soon')
          ? 'bg-[#EF9F27]/10 text-[#B86D00] border-[#EF9F27]/15'
          : 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
  const accent = accentColor ?? style.left.replace('border-', '');

  return (
    <div
      className={`admin-card group rounded-[10px] border-l-[4px] border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] ${style.left} ${style.ring}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">{heading}</p>
          <p className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 ${style.bg}`}
          style={accentColor ? { backgroundColor: `${accentColor}1A`, color: accentColor } : undefined}
        >
          <Icon className={`h-5 w-5 ${style.icon}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold ${trendTone}`}>{trendText}</div>
        {accent && <span className="sr-only">Accent {accent}</span>}
      </div>
    </div>
  );
}
