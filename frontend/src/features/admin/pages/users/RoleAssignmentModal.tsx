import React, { useState } from 'react';
import { X, Shield, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserRow, Role } from './userManagement.types';

interface RoleAssignmentModalProps {
  user: UserRow | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignRole: (userId: string, newRole: Role) => void;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Alumni: ['View Job Board', 'Request Documents', 'Edit Profile & Skill Matrix', 'Message Alumni'],
  Employer: ['Post Vacancies', 'Review Applications', 'Candidate Pipeline Kanban', 'Sign MoUs'],
  'Department Head': ['Curriculum Insights', 'Wave 3 Tracer Audit', 'Employment Outcomes Matrix', 'ABET Reports'],
  Registrar: ['Student Records Verification', 'CSV Data Integration', 'Seal Generation', 'SLA Telemetry'],
  Admin: ['Manage Users', 'View System Logs', 'Review Content', 'Export Analytics'],
  'Super Admin': ['Full System Governance', 'Security Audit Trail', 'Role & Permission Controls', 'Database Backups'],
};

export const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({
  user,
  isOpen,
  onClose,
  onAssignRole,
}) => {
  const [selectedRole, setSelectedRole] = useState<Role>(() => user?.role || 'Alumni');

  if (!isOpen || !user) return null;

  const handleSave = () => {
    onAssignRole(user.id, selectedRole);
    toast.success(`Role for ${user.name} changed to ${selectedRole}`);
    onClose();
  };

  const permissions = ROLE_PERMISSIONS[selectedRole] || ROLE_PERMISSIONS['Alumni'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-input)]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Assign Role & Permissions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <div className="text-[var(--text-secondary)] text-[11px] uppercase font-semibold mb-1">Target User</div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium">
              {user.name} <span className="text-[var(--text-secondary)]">({user.email})</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase mb-1">
              Select System Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-xs focus:outline-none"
            >
              {Object.keys(ROLE_PERMISSIONS).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase mb-1.5">
              Granted Role Privileges
            </span>
            <div className="space-y-1.5 bg-[var(--bg-input)] p-3 rounded-lg border border-[var(--border-color)]">
              {permissions.map((p) => (
                <div key={p} className="flex items-center gap-2 text-[var(--text-primary)] text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[var(--border-color)] flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
