import React from 'react';
import { Search, X } from 'lucide-react';
import { ictInput } from './ictUi';

/** Command-style search input with clear affordance and optional live result count */
export default function IctSearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  label,
  className = '',
  leadingIcon: LeadingIcon = Search,
  resultCount,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Accessible name — required if there is no visible <label> */
  label: string;
  className?: string;
  leadingIcon?: React.ComponentType<{ className?: string }>;
  resultCount?: number;
  autoFocus?: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      <LeadingIcon
        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
        aria-hidden
      />
      <input
        type="search"
        role="searchbox"
        aria-label={label}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${ictInput} h-9 rounded-[8px] pl-9 pr-16 text-[12.5px] [&::-webkit-search-cancel-button]:appearance-none`}
      />
      <div className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
        {typeof resultCount === 'number' && value.trim() && (
          <span className="ict-num rounded-[4px] bg-[var(--ict-surface-inset)] px-1.5 py-px text-[10px] font-bold text-[var(--text-muted)] ">
            {resultCount}
          </span>
        )}
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="pointer-events-auto rounded p-0.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] ict-focus"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
