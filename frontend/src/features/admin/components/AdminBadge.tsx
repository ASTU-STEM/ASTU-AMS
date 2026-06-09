import React from 'react';
import type { AdminBadgeProps } from '../types/admin.types';

const variantClasses: Record<NonNullable<AdminBadgeProps['variant']>, string> = {
  default: 'bg-blue-50/70 text-blue-700',
  info: 'bg-blue-50/70 text-blue-700',
  success: 'bg-emerald-50/70 text-emerald-700',
  warning: 'bg-amber-50/70 text-amber-700',
  danger: 'bg-rose-50/70 text-rose-700',
  neutral: 'bg-slate-100 text-slate-600',
  purple: 'bg-violet-50/70 text-violet-700',
  published: 'bg-emerald-50/70 text-emerald-700',
  draft: 'bg-slate-100 text-slate-500',
  scheduled: 'bg-blue-50/70 text-blue-700',
  featured: 'bg-violet-50/70 text-violet-700',
  pinned: 'bg-amber-50/70 text-amber-700',
  'needs-review': 'bg-orange-50/70 text-orange-700',
  archived: 'bg-slate-100 text-slate-400',
  amber: 'bg-amber-50/70 text-amber-700',
  'purple-soft': 'bg-violet-50/70 text-violet-600',
  emerald: 'bg-emerald-50/70 text-emerald-700',
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
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none transition-all',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {content}
    </span>
  );
}
