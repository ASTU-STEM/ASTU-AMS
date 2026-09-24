import { Briefcase, Store, Hourglass, UserX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface StatusConfig {
  label: string;
  badge: string;
  dot: string;
  Icon: LucideIcon;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  EMPLOYED: {
    label: 'Employed',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
    Icon: Briefcase,
  },
  SELF_EMPLOYED: {
    label: 'Self-Employed',
    badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    dot: 'bg-blue-500',
    Icon: Store,
  },
  UNEMPLOYED: {
    label: 'Unemployed',
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
    Icon: Hourglass,
  },
  UNKNOWN: {
    label: 'Unknown',
    badge: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    dot: 'bg-slate-400',
    Icon: UserX,
  },
};

export const STATUS_ORDER: string[] = ['EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED'];

export const statusConfig = (status: string): StatusConfig =>
  STATUS_CONFIG[status] ?? STATUS_CONFIG.UNKNOWN;

/** Map any employment status string to a known filter key. */
export const normalizeEmploymentStatus = (status: string | null | undefined): string =>
  status && STATUS_CONFIG[status] ? status : 'UNKNOWN';

export const formatSalary = (salary: number | null | undefined): string =>
  salary == null ? '—' : `ETB ${salary.toLocaleString('en-US')}`;

export { StatusBadge } from '../../../components/StatusBadge';