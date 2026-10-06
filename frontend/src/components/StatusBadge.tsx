import {
  Briefcase,
  Store,
  Hourglass,
  UserX,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarClock,
  Loader2,
  FileText,
  Circle,
  type LucideIcon,
} from 'lucide-react';

export type StatusTone = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

interface StatusMeta {
  label?: string;
  tone: StatusTone;
  Icon?: LucideIcon;
}

const TONES: Record<StatusTone, { badge: string; dot: string }> = {
  success: { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  info: { badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200', dot: 'bg-blue-500' },
  warning: { badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', dot: 'bg-amber-500' },
  danger: { badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200', dot: 'bg-rose-500' },
  neutral: { badge: 'bg-[var(--bg-page)] text-[var(--text-secondary)] ring-1 ring-[var(--border-color)]', dot: 'bg-slate-400' },
};

const STATUS_META: Record<string, StatusMeta> = {
  EMPLOYED: { label: 'Employed', tone: 'success', Icon: Briefcase },
  SELF_EMPLOYED: { label: 'Self-Employed', tone: 'info', Icon: Store },
  UNEMPLOYED: { label: 'Unemployed', tone: 'warning', Icon: Hourglass },
  // No status reported. Never render this as "unemployed": a graduate who has
  // not answered is not a job seeker, and the two must stay distinguishable.
  UNSPECIFIED: { label: 'Status not reported', tone: 'neutral', Icon: UserX },
  UNKNOWN: { label: 'Unknown', tone: 'neutral', Icon: UserX },

  ACTIVE: { label: 'Active', tone: 'success', Icon: CheckCircle2 },
  ACCEPTED: { label: 'Accepted', tone: 'success', Icon: CheckCircle2 },
  APPROVED: { label: 'Approved', tone: 'success', Icon: CheckCircle2 },
  CHECKED_IN: { label: 'Checked In', tone: 'success', Icon: CheckCircle2 },
  COMPLETED: { label: 'Completed', tone: 'success', Icon: CheckCircle2 },
  CONNECTED: { label: 'Connected', tone: 'success', Icon: CheckCircle2 },
  GOING: { label: 'Going', tone: 'success', Icon: CheckCircle2 },
  OPEN: { label: 'Open', tone: 'success', Icon: CheckCircle2 },
  PAID: { label: 'Paid', tone: 'success', Icon: CheckCircle2 },
  PUBLISHED: { label: 'Published', tone: 'success', Icon: CheckCircle2 },
  SUCCESS: { label: 'Success', tone: 'success', Icon: CheckCircle2 },
  VERIFIED: { label: 'Verified', tone: 'success', Icon: CheckCircle2 },
  ONBOARDED: { label: 'Onboarded', tone: 'success', Icon: CheckCircle2 },
  SELECTED: { label: 'Selected', tone: 'success', Icon: CheckCircle2 },

  IN_PROGRESS: { label: 'In Progress', tone: 'info', Icon: Loader2 },
  IN_REVIEW: { label: 'In Review', tone: 'info', Icon: Clock },
  PENDING: { label: 'Pending', tone: 'warning', Icon: Clock },
  REQUEST_PENDING: { label: 'Request Pending', tone: 'warning', Icon: Clock },
  SCHEDULED: { label: 'Scheduled', tone: 'info', Icon: CalendarClock },
  SUBMITTED: { label: 'Submitted', tone: 'info', Icon: Clock },

  DRAFT: { label: 'Draft', tone: 'neutral', Icon: FileText },
  PINNED: { label: 'Pinned', tone: 'info', Icon: CalendarClock },
  ARCHIVED: { label: 'Archived', tone: 'neutral', Icon: FileText },
  CLOSED: { label: 'Closed', tone: 'neutral', Icon: Circle },
  INACTIVE: { label: 'Inactive', tone: 'neutral', Icon: Circle },

  CANCELED: { label: 'Canceled', tone: 'danger', Icon: XCircle },
  CANCELLED: { label: 'Cancelled', tone: 'danger', Icon: XCircle },
  EXPIRED: { label: 'Expired', tone: 'danger', Icon: XCircle },
  FAILED: { label: 'Failed', tone: 'danger', Icon: XCircle },
  OVERDUE: { label: 'Overdue', tone: 'danger', Icon: XCircle },
  REJECTED: { label: 'Rejected', tone: 'danger', Icon: XCircle },
  SUSPENDED: { label: 'Suspended', tone: 'danger', Icon: XCircle },
};

const normalize = (status: string) => status.trim().toLowerCase().replace(/\s+/g, '_');

const META_LOOKUP: Record<string, StatusMeta> = {};
for (const [key, meta] of Object.entries(STATUS_META)) {
  META_LOOKUP[normalize(key)] = meta;
}

export interface ResolvedStatus {
  label: string;
  badge: string;
  dot: string;
  Icon: LucideIcon;
}

export function statusMeta(status: string | null | undefined): ResolvedStatus {
  const raw = (status ?? '').trim();
  if (!raw) {
    const tone = TONES.neutral;
    return { label: 'Status not reported', badge: tone.badge, dot: tone.dot, Icon: UserX };
  }
  const meta = META_LOOKUP[normalize(raw)] ?? { tone: 'neutral' as StatusTone };
  const tone = TONES[meta.tone];
  return {
    label: meta.label ?? raw,
    badge: tone.badge,
    dot: tone.dot,
    Icon: meta.Icon ?? Circle,
  };
}

export const StatusBadge = ({
  status,
  className = '',
  showIcon = true,
}: {
  status: string | null | undefined;
  className?: string;
  showIcon?: boolean;
}) => {
  const { label, badge, dot, Icon } = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${badge} ${className}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      {showIcon && <Icon className="h-3 w-3 shrink-0" />}
      {label}
    </span>
  );
};

export default StatusBadge;