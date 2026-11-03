import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ictBtnGhost, ictInput, ictSelect } from './ictUi';

/**
 * Filter / search bar shared by every module.
 * Purely presentational: it hosts the page's existing controls and simply
 * aligns, spaces and labels them consistently.
 */
export default function IctToolbar({
  children,
  onReset,
  resetLabel = 'Reset',
  showReset,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  onReset?: () => void;
  resetLabel?: string;
  /** Defaults to true whenever a reset handler is supplied */
  showReset?: boolean;
  className?: string;
  as?: 'div' | 'form';
}) {
  const reset = showReset ?? Boolean(onReset);

  return (
    <Tag
      role={Tag === 'form' ? 'search' : undefined}
      className={`ict-inset flex flex-col gap-2 p-2.5 lg:flex-row lg:items-center ${className}`}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      {reset && (
        <div className="flex shrink-0 items-center gap-2 lg:justify-end">
          <button type="button" onClick={onReset} className={`${ictBtnGhost} w-full lg:w-auto`}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            {resetLabel}
          </button>
        </div>
      )}
    </Tag>
  );
}

interface IctFilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

/** Compact labelled <select> for severity / source / status filters */
export function IctFilterSelect({ label, value, onChange, options, className = '' }: IctFilterSelectProps) {
  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="ict-label whitespace-nowrap">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${ictSelect} w-auto min-w-[7.5rem] py-1`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Labelled text field used in detail panels and forms */
export function IctField({
  label,
  hint,
  required,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="ict-label mb-1 block">
        {label}
        {required && <span className="ml-0.5 text-[var(--ict-crit)]">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-[var(--text-muted)]">{hint}</span>}
    </div>
  );
}

export { ictInput };
