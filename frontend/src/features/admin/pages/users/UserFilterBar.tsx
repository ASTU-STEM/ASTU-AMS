import React from 'react';
import { Search, Filter, RotateCcw, Download, Plus } from 'lucide-react';
import { UserFilters } from './userManagement.types';

interface UserFilterBarProps {
  filters: UserFilters;
  onFilterChange: (key: keyof UserFilters, value: string) => void;
  onReset: () => void;
  onExport: () => void;
  onAddUser: () => void;
  departments: string[];
  batches: string[];
}

const ROLES = [
  'All',
  'Alumni',
  'Employer',
  'Department Head',
  'Registrar',
  'Admin',
  'Super Admin',
];

const STATUSES = ['All', 'Active', 'Inactive', 'Suspended', 'Pending Verification'];

export const UserFilterBar: React.FC<UserFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  onExport,
  onAddUser,
  departments,
  batches,
}) => {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onFilterChange('query', e.target.value)}
            placeholder="Search by name, email, student ID..."
            className="w-full pl-9 pr-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={onExport}
            className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={onAddUser}
            className="px-3.5 py-2 rounded-lg bg-[#2196F3] hover:bg-[#1976D2] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New User</span>
          </button>
        </div>
      </div>

      {/* Select Dropdown Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--border-color)]">
        <select
          value={filters.role}
          onChange={(e) => onFilterChange('role', e.target.value)}
          className="bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="All">All Roles</option>
          {ROLES.filter((r) => r !== 'All').map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          {STATUSES.filter((s) => s !== 'All').map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filters.department}
          onChange={(e) => onFilterChange('department', e.target.value)}
          className="bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="All">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={filters.batch}
          onChange={(e) => onFilterChange('batch', e.target.value)}
          className="bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="All">All Batches</option>
          {batches.map((b) => (
            <option key={b} value={b}>
              Batch {b}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
