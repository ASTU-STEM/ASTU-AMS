import React from 'react';

export interface AdminSectionCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export default function AdminSectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
}: AdminSectionCardProps) {
  const hasHeader = Boolean(title || subtitle || action);

  return (
    <section className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors ${className}`}>
      {hasHeader && (
        <div className={`mb-4 flex flex-wrap items-start justify-between gap-3 ${headerClassName}`}>
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              typeof subtitle === 'string' ? (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
              ) : (
                subtitle
              )
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
