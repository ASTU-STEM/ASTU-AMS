import React from 'react';
import { Eye, PencilLine, Shield, Trash2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { UserRow } from './userManagement.types';

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

const getRoleBadge = (role: string) => {
  const normalized = role.toLowerCase();
  if (normalized.includes('super'))
    return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600/40';
  if (normalized.includes('admin'))
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600/40';
  if (normalized.includes('registrar'))
    return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-600/40';
  if (normalized.includes('dept') || normalized.includes('head'))
    return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-600/40';
  if (normalized.includes('employer'))
    return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600/40';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600/40';
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-600/30';
    case 'Suspended':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600/30';
    case 'Pending Verification':
      return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-600/30';
    default:
      return 'bg-[var(--bg-card-secondary)] text-[var(--text-muted)] border-[var(--border-color)]';
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
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase font-semibold">
            <tr>
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-[var(--border-color)] bg-[var(--bg-card)] text-[#2196F3] focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department / Batch</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[var(--text-secondary)]">
                  No matching user accounts found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-[var(--bg-hover)] transition-colors ${isSelected ? 'bg-[var(--bg-card-secondary)]' : ''}`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(u.id)}
                        className="rounded border-[var(--border-color)] bg-[var(--bg-card)] text-[#2196F3] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-cyan)] font-bold shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-[var(--text-primary)] truncate">{u.name}</div>
                          <div className="text-[11px] text-[var(--text-secondary)] truncate">{u.email}</div>
                          {u.studentId && <div className="text-[10px] text-[var(--accent-cyan)] font-mono">{u.studentId}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-medium text-[var(--text-primary)]">{u.department || 'General'}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">Class of {u.batch || '2024'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] text-[11px] whitespace-nowrap">
                      {u.lastLogin || 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onViewUser(u)}
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditUser(u)}
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[#2196F3] transition-colors"
                          title="Edit User"
                        >
                          <PencilLine className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onChangeRole(u)}
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-purple-400 transition-colors"
                          title="Change Role & Permissions"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteUser(u)}
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-input)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div>
            Page <strong className="text-[var(--text-primary)]">{currentPage}</strong> of{' '}
            <strong className="text-[var(--text-primary)]">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
