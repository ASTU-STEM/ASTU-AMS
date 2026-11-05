import React from 'react';
import { Search, RotateCcw, Download, Plus } from 'lucide-react';
import { UserFilters } from './userManagement.types';
import {
  adminFilterShellClass,
  adminInputClass,
} from '../../components/AdminSectionCard';

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
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className={`${adminFilterShellClass} w-full md:max-w-sm`}>
          <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onFilterChange('query', e.target.value)}
            placeholder="Search by name, email, student ID..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            title="Reset Filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={onAddUser}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#002a66]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New User</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-[var(--border-color)] pt-3 sm:grid-cols-4">
        <select
          value={filters.role}
          onChange={(e) => onFilterChange('role', e.target.value)}
          className={adminInputClass}
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
          className={adminInputClass}
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
          className={adminInputClass}
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
          className={adminInputClass}
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
