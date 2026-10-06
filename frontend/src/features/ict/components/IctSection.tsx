import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IctSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Skip the card chrome — for sections that supply their own container */
  bare?: boolean;
  /** Remove body padding (tables and toolbars manage their own insets) */
  flush?: boolean;
  /** Heading level for correct document outline */
  as?: 'h2' | 'h3';
}

/** Section shell — the single container used by every module. */
export default function IctSection({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className = '',
  bodyClassName = '',
  bare = false,
  flush = false,
  as: Heading = 'h2',
}: IctSectionProps) {
  const header = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && (
          <span className="mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-[var(--ict-accent-soft)] text-[var(--ict-accent-text)]">
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <Heading className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </Heading>
          {description && (
            <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--text-muted)]">{description}</p>
          )}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );

  if (bare) {
    return (
      <section className={`space-y-2.5 ${className}`}>
        {header}
        <div className={bodyClassName}>{children}</div>
      </section>
    );
  }

  return (
    <section className={`ict-card ${className}`}>
      <div className="border-b border-[var(--ict-hairline)] px-3.5 py-2.5 sm:px-4">{header}</div>
      <div className={`${flush ? '' : 'p-3.5 sm:p-4'} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
