import React from 'react';
import { X, User, Mail, Phone, GraduationCap, Briefcase, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { UserRow } from './userManagement.types';

interface UserDetailsModalProps {
  user: UserRow | null;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-input)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2196F3]/20 border border-[#2196F3] text-[#22D3EE] font-bold flex items-center justify-center text-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">{user.name}</h2>
              <p className="text-xs text-[var(--text-secondary)]">{user.email} • {user.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[var(--text-primary)]">
          {/* Identity & Status */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-color)]">
              <span className="text-[11px] text-[var(--text-secondary)] block">Student ID</span>
              <span className="font-mono text-[#22D3EE] font-semibold">{user.studentId || 'N/A'}</span>
            </div>
            <div className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-color)]">
              <span className="text-[11px] text-[var(--text-secondary)] block">Account Status</span>
              <span className="font-semibold text-emerald-400">{user.status}</span>
            </div>
            <div className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-color)]">
              <span className="text-[11px] text-[var(--text-secondary)] block">Batch Class</span>
              <span className="font-semibold">{user.batch || '2024'}</span>
            </div>
          </div>

          {/* Academic Background */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-[#22D3EE] tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Academic Records
            </h3>
            <div className="bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-color)] space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Department:</span>
                <span className="font-semibold">{user.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Cumulative GPA:</span>
                <span className="font-mono text-emerald-400 font-bold">{user.cgpa || '3.75'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Graduation Year:</span>
                <span>{user.graduationYear || user.batch || '2024'}</span>
              </div>
              {user.thesisTitle && (
                <div className="pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)] block">Capstone / Thesis:</span>
                  <span className="text-slate-300 italic">{user.thesisTitle}</span>
                </div>
              )}
            </div>
          </div>

          {/* Professional Placement */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-[#22D3EE] tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Professional Profile
            </h3>
            <div className="bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-color)] space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Current Employer:</span>
                <span className="font-semibold">{user.employerName || 'Ethio Telecom Innovation Labs'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Position / Title:</span>
                <span>{user.jobTitle || 'Associate Software Engineer'}</span>
              </div>
              {user.skills && user.skills.length > 0 && (
                <div className="pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)] block mb-1.5">Verified Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[11px] text-[#22D3EE]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-[#22D3EE] tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4" /> Contact & Registry
            </h3>
            <div className="bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-[var(--text-secondary)] block">Phone:</span>
                <span>{user.phone || '+251 91 123 4567'}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block">Registered On:</span>
                <span>{user.registeredAt || '2024-01-15'}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block">Last Login:</span>
                <span>{user.lastLogin || '2 hours ago'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-input)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2196F3] hover:bg-[#1976D2] text-white rounded-lg text-xs font-bold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
