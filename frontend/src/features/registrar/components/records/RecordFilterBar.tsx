import React from 'react';
import { Search, Filter } from 'lucide-react';

interface RecordFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  departmentFilter: string;
  onDepartmentChange: (val: string) => void;
  departments: string[];
  batchFilter: string;
  onBatchChange: (val: string) => void;
  batches: string[];
  verificationFilter: string;
  onVerificationChange: (val: string) => void;
}

export const RecordFilterBar: React.FC<RecordFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  departments,
  batchFilter,
  onBatchChange,
  batches,
  verificationFilter,
  onVerificationChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 text-xs">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search student ID, name, email..."
          className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-sky-500 focus:outline-none"
        />
      </div>

      <select
        value={departmentFilter}
        onChange={(e) => onDepartmentChange(e.target.value)}
        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-xs text-[var(--text-secondary)] focus:border-sky-500 focus:outline-none"
      >
        <option value="All">All Departments</option>
        {departments.filter((d) => d !== 'All').map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={batchFilter}
        onChange={(e) => onBatchChange(e.target.value)}
        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-xs text-[var(--text-secondary)] focus:border-sky-500 focus:outline-none"
      >
        <option value="All">All Batches</option>
        {batches.filter((b) => b !== 'All').slice(0, 15).map((b) => (
          <option key={b} value={b}>
            Class of {b}
          </option>
        ))}
      </select>

      <select
        value={verificationFilter}
        onChange={(e) => onVerificationChange(e.target.value)}
        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-xs text-[var(--text-secondary)] focus:border-sky-500 focus:outline-none"
      >
        <option value="All">All Verification</option>
        <option value="Verified">Verified Only</option>
        <option value="Unverified">Unverified Only</option>
      </select>
    </div>
  );
};
