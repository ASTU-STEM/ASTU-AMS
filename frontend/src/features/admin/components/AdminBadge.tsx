import React from 'react';
import type { AdminBadgeProps } from '../types/admin.types';

const variantClasses: Record<NonNullable<AdminBadgeProps['variant']>, string> = {
  default: 'bg-blue-50/70 text-blue-700 dark:bg-[#15294A] dark:text-[#22D3EE] dark:border dark:border-[#22D3EE]/30',
  info: 'bg-blue-50/70 text-blue-700 dark:bg-[#15294A] dark:text-[#22D3EE] dark:border dark:border-[#22D3EE]/30',
  success: 'bg-emerald-50/70 text-emerald-700 dark:bg-[#163828] dark:text-[#22C55E] dark:border dark:border-[#22C55E]/30',
  warning: 'bg-amber-50/70 text-amber-700 dark:bg-[#382B14] dark:text-[#F59E0B] dark:border dark:border-[#F59E0B]/30',
  danger: 'bg-rose-50/70 text-rose-700 dark:bg-[#3B1A22] dark:text-[#F87171] dark:border dark:border-[#F87171]/30',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-[#1B2636] dark:text-[#B0BDCE] dark:border dark:border-[#2A3749]',
  purple: 'bg-violet-50/70 text-violet-700 dark:bg-[#2E1A47] dark:text-[#C084FC] dark:border dark:border-[#C084FC]/30',
  published: 'bg-emerald-50/70 text-emerald-700 dark:bg-[#163828] dark:text-[#22C55E] dark:border dark:border-[#22C55E]/30',
  draft: 'bg-slate-100 text-slate-500 dark:bg-[#1B2636] dark:text-[#8493A8] dark:border dark:border-[#2A3749]',
  scheduled: 'bg-blue-50/70 text-blue-700 dark:bg-[#15294A] dark:text-[#22D3EE] dark:border dark:border-[#22D3EE]/30',
  featured: 'bg-violet-50/70 text-violet-700 dark:bg-[#2E1A47] dark:text-[#C084FC] dark:border dark:border-[#C084FC]/30',
  pinned: 'bg-amber-50/70 text-amber-700 dark:bg-[#382B14] dark:text-[#F59E0B] dark:border dark:border-[#F59E0B]/30',
  'needs-review': 'bg-orange-50/70 text-orange-700 dark:bg-[#382B14] dark:text-[#F59E0B] dark:border dark:border-[#F59E0B]/30',
  archived: 'bg-slate-100 text-slate-400 dark:bg-[#151D2B] dark:text-[#8493A8] dark:border dark:border-[#2A3749]',
  amber: 'bg-amber-50/70 text-amber-700 dark:bg-[#382B14] dark:text-[#F59E0B] dark:border dark:border-[#F59E0B]/30',
  'purple-soft': 'bg-violet-50/70 text-violet-600 dark:bg-[#2E1A47] dark:text-[#C084FC] dark:border dark:border-[#C084FC]/30',
  emerald: 'bg-emerald-50/70 text-emerald-700 dark:bg-[#163828] dark:text-[#22C55E] dark:border dark:border-[#22C55E]/30',
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
