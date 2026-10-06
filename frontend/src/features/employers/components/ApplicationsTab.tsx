import React, { useState } from 'react';
import { CandidateApplication } from '../types/employer.types';
import toast from 'react-hot-toast';
import { CandidateProfileModal } from './CandidateProfileModal';

interface ApplicationsTabProps {
  applications: CandidateApplication[];
  onUpdateStatus: (applicationId: number, status: CandidateApplication['status']) => void;
  onMessageCandidate?: (app: CandidateApplication) => void;
  darkMode: boolean;
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({ applications, onUpdateStatus, onMessageCandidate, darkMode }) => {
  const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const [selectedApp, setSelectedApp] = useState<CandidateApplication | null>(null);
  
  const getStatusBadge = (status: CandidateApplication['status']) => {
    switch (status) {
      case 'Accepted':
      case 'Hired':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Shortlisted':
      case 'Interviewed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className={`p-4 sm:p-8 border rounded-2xl sm:rounded-3xl shadow-sm transition-all duration-300 ${
      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
    }`}>
      <div className="pb-4 sm:pb-6 border-b border-[var(--border-color)] mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold">Candidate Applications</h3>
        <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Review academic transcripts, verified CGPAs, and skills match lists</p>
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className={`border-b border-[var(--border-color)] text-xs font-bold uppercase tracking-wider ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              <th className="pb-3 pr-2">Candidate</th>
              <th className="pb-3 pr-2">Job Opening</th>
              <th className="pb-3 pr-2">Academic Info</th>
              <th className="pb-3 pr-2">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50/5 hover:transition-colors group">
                <td className="py-4 pr-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={app.alumnusAvatar ? (app.alumnusAvatar.startsWith('http') ? app.alumnusAvatar : `${UPLOAD_BASE}${app.alumnusAvatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(app.alumnusName)}&background=003366&color=ffffff&bold=true`}
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.alumnusName)}&background=003366&color=ffffff&bold=true`;
                      }}
                      alt={app.alumnusName}
                      className="w-10 h-10 rounded-xl object-cover border border-[var(--border-color)] shadow-xs"
                    />
                    <div>
                      <p className="font-bold">{app.alumnusName}</p>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{app.alumnusEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-2">
                  <p className="font-semibold">{app.jobTitle}</p>
                  <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Applied {app.appliedDate}</p>
                </td>
                <td className="py-4 pr-2">
                  <p className="font-bold text-[#003366] text-xs">{app.department}</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    CGPA: <span className={`font-bold ${app.cgpa.includes('Hidden') ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]' : 'text-[#1a5c3a]'}`}>{app.cgpa}</span> • Class of {app.graduationYear}
                  </p>
                </td>
                <td className="py-4 pr-2">
                  <span className={`px-2.5 py-0.5 border rounded-full text-xs font-bold ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex gap-2 justify-end items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onMessageCandidate?.(app)}
                      className="px-3 py-1.5 bg-[#003366]/10 text-[#003366] rounded-lg text-xs font-bold hover:bg-[#003366] hover:text-white transition-colors flex items-center gap-1"
                    >
                      💬 Message
                    </button>
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-3 py-1.5 bg-[#003366]/5 border border-[#003366]/20 text-[#003366] rounded-lg text-xs font-extrabold hover:bg-[#003366] hover:text-white transition-colors"
                    >
                      👁️ See Profile
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[var(--text-muted)] italic">No candidate applications registered.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (Visible on small screens) */}
      <div className="block md:hidden space-y-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all ${
              darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50/70 border-gray-200/80'
            }`}
          >
            {/* Header: Candidate Info & Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={app.alumnusAvatar ? (app.alumnusAvatar.startsWith('http') ? app.alumnusAvatar : `${UPLOAD_BASE}${app.alumnusAvatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(app.alumnusName)}&background=003366&color=ffffff&bold=true`}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.alumnusName)}&background=003366&color=ffffff&bold=true`;
                  }}
                  alt={app.alumnusName}
                  className="w-12 h-12 rounded-xl object-cover border border-[var(--border-color)] shadow-xs shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-[var(--text-primary)] dark:text-white">{app.alumnusName}</h4>
                  <p className="text-xs text-[var(--text-muted)] truncate max-w-[180px]">{app.alumnusEmail}</p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 border rounded-full text-[11px] font-bold shrink-0 ${getStatusBadge(app.status)}`}>
                {app.status}
              </span>
            </div>

            {/* Application & Academic Context */}
            <div className="space-y-1.5 pt-1 text-xs border-t border-[var(--border-color)] dark:border-slate-700/60">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)] font-medium">Applied Position:</span>
                <span className="font-bold text-[#003366] dark:text-blue-400">{app.jobTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)] font-medium">Department:</span>
                <span className="font-semibold text-[var(--text-primary)] dark:text-slate-200">{app.department}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)] font-medium">Academic Record:</span>
                <span className="font-medium">
                  CGPA: <strong className={app.cgpa.includes('Hidden') ? 'text-amber-600' : 'text-emerald-700'}>{app.cgpa}</strong> • Class of {app.graduationYear}
                </span>
              </div>
            </div>

            {/* Mobile Actions Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)] dark:border-slate-700/60">
              <button
                onClick={() => setSelectedApp(app)}
                className="flex-1 py-2 bg-[#003366] text-white rounded-xl text-xs font-bold hover:bg-[#002244] transition-colors flex items-center justify-center gap-1 shadow-xs"
              >
                👁️ See Profile
              </button>
              <button
                onClick={() => onMessageCandidate?.(app)}
                className="flex-1 py-2 bg-[#003366]/10 border border-[#003366]/20 text-[#003366] dark:text-blue-300 dark:bg-blue-900/30 rounded-xl text-xs font-bold hover:bg-[#003366] hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                💬 Message
              </button>
            </div>
          </div>
        ))}

        {applications.length === 0 && (
          <div className="py-8 text-center text-[var(--text-muted)] italic text-xs">No candidate applications registered.</div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <CandidateProfileModal
          candidate={selectedApp}
          onClose={() => setSelectedApp(null)}
          darkMode={darkMode}
          onMessageCandidate={onMessageCandidate}
          onUpdateStatus={(id, status) => {
            onUpdateStatus(id, status);
            setSelectedApp(prev => prev ? { ...prev, status } : null);
          }}
          showStatusControls={true}
        />
      )}
    </div>
  );
};
