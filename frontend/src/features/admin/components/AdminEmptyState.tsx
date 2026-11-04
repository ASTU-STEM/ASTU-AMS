import React from 'react';
import { Inbox } from 'lucide-react';

export default function AdminEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-page)] px-6 py-12 text-center ${className}`}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#003580]/10 text-[#003580] dark:bg-sky-500/15 dark:text-sky-300">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-[var(--text-secondary)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
