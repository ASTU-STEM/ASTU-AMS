import React from 'react';
import { Eye, PencilLine, Shield, Trash2, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { UserRow } from './userManagement.types';
import AdminBadge from '../../components/AdminBadge';
import AdminEmptyState from '../../components/AdminEmptyState';
import {
  adminTableHeadClass,
  adminTableRowClass,
} from '../../components/AdminSectionCard';

interface UserTableProps {
  users: UserRow[];
  selectedUserIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewUser: (user: UserRow) => void;
  onEditUser: (user: UserRow) => void;
  onChangeRole: (user: UserRow) => void;
  onDeleteUser: (user: UserRow) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getRoleBadgeVariant = (role: string): 'default' | 'purple' | 'info' | 'amber' | 'success' | 'neutral' => {
  const normalized = role.toLowerCase();
  if (normalized.includes('super')) return 'purple';
  if (normalized.includes('admin')) return 'info';
  if (normalized.includes('registrar')) return 'info';
  if (normalized.includes('dept') || normalized.includes('head')) return 'purple';
  if (normalized.includes('employer')) return 'amber';
  return 'success';
};

const getStatusBadgeVariant = (
  status: string
): 'success' | 'danger' | 'warning' | 'neutral' => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Suspended':
      return 'danger';
    case 'Pending Verification':
      return 'warning';
    default:
      return 'neutral';
  }
};

export const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUserIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewUser,
  onEditUser,
  onChangeRole,
  onDeleteUser,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const allSelected = users.length > 0 && selectedUserIds.length === users.length;

  return (
    <div className="flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className={`${adminTableHeadClass} w-10 p-3 text-center`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="cursor-pointer rounded border-[var(--border-color)] bg-[var(--bg-card)] text-[#003580] focus:ring-0"
                />
              </th>
              {['User', 'Role', 'Department / Batch', 'Status', 'Last Login'].map((head) => (
                <th key={head} className={`${adminTableHeadClass} px-4 py-3`}>
                  {head}
                </th>
              ))}
              <th className={`${adminTableHeadClass} px-4 py-3 text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8">
                  <AdminEmptyState
                    icon={Users}
                    title="No matching user accounts"
                    description="Try another status tab or clear the search filters."
                  />
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <tr
                    key={u.id}
                    className={`${adminTableRowClass} ${isSelected ? 'bg-[#003580]/[0.04]' : ''}`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(u.id)}
                        className="cursor-pointer rounded border-[var(--border-color)] bg-[var(--bg-card)] text-[#003580] focus:ring-0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-page)] text-xs font-bold text-[#003580]">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-[var(--text-primary)]">{u.name}</div>
                          <div className="truncate text-[11px] text-[var(--text-secondary)]">{u.email}</div>
                          {u.studentId && (
                            <div className="font-mono text-[10px] text-[var(--text-muted)]">{u.studentId}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <AdminBadge variant={getRoleBadgeVariant(u.role)}>{u.role}</AdminBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-[var(--text-primary)]">{u.department || 'General'}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">Class of {u.batch || '2024'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <AdminBadge variant={getStatusBadgeVariant(u.status)}>{u.status}</AdminBadge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[11px] text-[var(--text-muted)]">
                      {u.lastLogin || 'Never'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onViewUser(u)}
                          className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-page)] hover:text-[#003580]"
                          title="View Profile"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditUser(u)}
                          className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-page)] hover:text-[#003580]"
                          title="Edit User"
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onChangeRole(u)}
                          className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-page)] hover:text-[#003580]"
                          title="Change Role & Permissions"
                        >
                          <Shield className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteUser(u)}
                          className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-page)] hover:text-rose-500"
                          title="Delete User"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-page)] p-3 text-xs text-[var(--text-secondary)]">
          <div>
            Page <strong className="text-[var(--text-primary)]">{currentPage}</strong> of{' '}
            <strong className="text-[var(--text-primary)]">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
