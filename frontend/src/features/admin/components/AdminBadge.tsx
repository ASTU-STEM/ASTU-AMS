import React from 'react';
import type { AdminBadgeProps } from '../types/admin.types';

const variantClasses: Record<NonNullable<AdminBadgeProps['variant']>, string> = {
  default: 'bg-[#003580]/10 text-[#003580] border-[#003580]/15',
  info: 'bg-[#003580]/10 text-[#003580] border-[#003580]/15',
  success: 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15',
  warning: 'bg-[#EF9F27]/10 text-[#8A5B08] border-[#EF9F27]/20',
  danger: 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  purple: 'bg-violet-100 text-violet-700 border-violet-200',
};

export default function AdminBadge({
  children,
  label,
  variant = 'default',
  className = '',
}: AdminBadgeProps) {
  const content = label ?? children;

  return (
    <span
      className={[
        'inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold leading-none',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {content}
    </span>
  );
}
