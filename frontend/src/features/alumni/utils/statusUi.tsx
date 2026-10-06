import React from 'react';
import { AlumniApplicationStatus } from '../types/alumni.types';
import { alumniStatusBadge } from '../components/alumniUi';

type StatusTone = keyof typeof alumniStatusBadge;

const APPLICATION_STATUS_TONE: Record<AlumniApplicationStatus, StatusTone> = {
  Applied: 'info',
  'Under Review': 'info',
  Shortlisted: 'brand',
  'Interview Scheduled': 'brand',
  Offered: 'success',
  Hired: 'success',
  Accepted: 'success',
  Rejected: 'danger',
  Withdrawn: 'neutral',
};

const PULSE_STATUSES: ReadonlySet<AlumniApplicationStatus> = new Set([
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
]);

export function getApplicationStatusTone(status?: AlumniApplicationStatus | string): StatusTone {
  if (!status) return 'info';
  return APPLICATION_STATUS_TONE[status as AlumniApplicationStatus] ?? 'info';
}

export function formatEmploymentStatus(raw?: string | null): string {
  if (!raw || !String(raw).trim()) return 'Not set';
  return String(raw)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ApplicationStatusBadgeProps {
  status?: AlumniApplicationStatus | string;
  className?: string;
  showPulse?: boolean;
}

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({
  status,
  className = '',
  showPulse = true,
}) => {
  const label = (status || 'Applied') as AlumniApplicationStatus;
  const tone = getApplicationStatusTone(label);
  const pulse = showPulse && PULSE_STATUSES.has(label);

  return (
    <span className={`${alumniStatusBadge[tone]} ${className}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full bg-current opacity-80 ${pulse ? 'animate-pulse' : ''}`}
        aria-hidden
      />
      {label}
    </span>
  );
};
