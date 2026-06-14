import React from 'react';
import { CandidateApplication } from '../types/employer.types';
import toast from 'react-hot-toast';

interface ApplicationsTabProps {
  applications: CandidateApplication[];
  onUpdateStatus: (applicationId: string, status: CandidateApplication['status']) => void;
  darkMode: boolean;
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({ applications, onUpdateStatus, darkMode }) => {

  const handleViewResume = (resumeUrl?: string) => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    } else {
      toast.error('No resume available for this candidate.');
    }
  };

  const getStatusBadge = (status: CandidateApplication['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'SHORTLISTED':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'PENDING':
      case 'REVIEWED':
      default:
        return 'bg-amber-100 text-amber-800 border border-amber-200';
    }
  };

  return (
    <div className={`p-8 border rounded-3xl shadow-sm transition-all duration-300 ${
      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
    }`}>
      <div className="pb-6 border-b border-gray-150 mb-6">
        <h3 className="text-2xl font-bold">Candidate Applications</h3>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Review academic transcripts, verified CGPAs, and skills match lists</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className={`border-b border-gray-150 text-xs font-bold uppercase tracking-wider ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              <th className="pb-3 pr-2">Candidate</th>
              <th className="pb-3 pr-2">Job Opening</th>
              <th className="pb-3 pr-2">Academic Info</th>
              <th className="pb-3 pr-2">CV / Resume</th>
              <th className="pb-3 pr-2">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50/5 hover:transition-colors">
                <td className="py-4 pr-2">
                  <p className="font-bold">{app.alumnusName}</p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{app.alumnusEmail}</p>
                </td>
                <td className="py-4 pr-2">
                  <p className="font-semibold">{app.jobTitle}</p>
                  <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Applied {app.appliedDate}</p>
                </td>
                <td className="py-4 pr-2">
                  <p className="font-bold text-astu-navy text-xs">{app.department}</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    CGPA: <span className="font-bold text-astu-green">{app.cgpa}</span> &bull; Class of {app.graduationYear}
                  </p>
                </td>
                <td className="py-4 pr-2">
                  <button
                    onClick={() => handleViewResume(app.resumeUrl)}
                    className="text-xs font-bold text-astu-red hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    View Resume
                  </button>
                </td>
                <td className="py-4 pr-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    {app.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          onUpdateStatus(app.id, 'SHORTLISTED');
                          toast.success(`${app.alumnusName} shortlisted!`);
                        }}
                        className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100"
                      >
                        Shortlist
                      </button>
                    )}
                    {app.status !== 'ACCEPTED' && app.status !== 'HIRED' && (
                      <button
                        onClick={() => {
                          onUpdateStatus(app.id, 'ACCEPTED');
                          toast.success(`${app.alumnusName} application accepted!`);
                        }}
                        className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100"
                      >
                        Accept
                      </button>
                    )}
                    {app.status !== 'REJECTED' && (
                      <button
                        onClick={() => {
                          onUpdateStatus(app.id, 'REJECTED');
                          toast.success(`${app.alumnusName} application declined.`);
                        }}
                        className="px-3 py-1 bg-red-50 border border-red-200 text-astu-red rounded-lg text-xs font-bold hover:bg-red-100"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400 italic">No candidate applications registered.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
