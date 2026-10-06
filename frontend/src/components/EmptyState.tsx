import React from 'react';
import { Inbox, FileText, Users, Database } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  const defaultIcon = <Inbox className="h-10 w-10 text-[var(--text-muted)] dark:text-slate-500" />;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center ${className}`}
    >
      <div className="mb-4 inline-flex items-center justify-center p-4 rounded-2xl bg-[var(--bg-page)] dark:bg-slate-800 text-[var(--text-secondary)] dark:text-slate-300 shadow-2xs ring-1 ring-[var(--border-color)] dark:ring-slate-700/60">
        {icon || defaultIcon}
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] dark:text-slate-100 mb-1.5 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] dark:text-slate-400 mb-6 max-w-md leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

// Pre-configured empty states for common use cases
export const EmptyDataState: React.FC<{ action?: React.ReactNode }> = ({ action }) => (
  <EmptyState
    icon={<Database className="h-12 w-12 text-[var(--text-muted)]" />}
    title="No data available"
    description="There is no data to display at this time. Check back later or try adjusting your filters."
    action={action}
  />
);

export const EmptyRecordsState: React.FC<{ action?: React.ReactNode }> = ({ action }) => (
  <EmptyState
    icon={<FileText className="h-12 w-12 text-[var(--text-muted)]" />}
    title="No records found"
    description="No records match your current search criteria. Try adjusting your filters or search terms."
    action={action}
  />
);

export const EmptyUsersState: React.FC<{ action?: React.ReactNode }> = ({ action }) => (
  <EmptyState
    icon={<Users className="h-12 w-12 text-[var(--text-muted)]" />}
    title="No users found"
    description="No users match your current search criteria. Try adjusting your filters."
    action={action}
  />
);

export default EmptyState;
