import React from 'react';
import { alumniPanelClass, alumniSectionTitleClass } from './alumniUi';

export interface AlumniSectionBlockProps {
  /** Optional step number shown as a clear visual anchor (1, 2, 3…). */
  step?: number;
  title: string;
  description?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** When true, wraps content in the standard alumni panel (card + padding). */
  panel?: boolean;
}

/**
 * Section header + body with consistent vertical rhythm and a bottom rule
 * so long pages (e.g. Tools) read as clear, scannable blocks.
 */
export const AlumniSectionBlock: React.FC<AlumniSectionBlockProps> = ({
  step,
  title,
  description,
  aside,
  children,
  className = '',
  panel = true,
}) => {
  const header = (
    <header className="mb-6 flex flex-col gap-4 border-b border-[var(--border-color)] pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-4">
        {step != null && (
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#003366]/10 text-sm font-black text-[#003366] dark:bg-[#FFCC00]/15 dark:text-[#FFD700] ring-1 ring-[var(--border-color)]"
            aria-hidden
          >
            {step}
          </span>
        )}
        <div className="min-w-0">
          <h3 className={alumniSectionTitleClass}>{title}</h3>
          {description && (
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
              {description}
            </p>
          )}
        </div>
      </div>
      {aside && <div className="shrink-0 self-start">{aside}</div>}
    </header>
  );

  const body = <div className="space-y-5">{children}</div>;

  if (panel) {
    return (
      <section className={`${alumniPanelClass} ${className}`}>
        {header}
        {body}
      </section>
    );
  }

  return (
    <section className={`space-y-5 ${className}`}>
      {header}
      {body}
    </section>
  );
};

export default AlumniSectionBlock;
