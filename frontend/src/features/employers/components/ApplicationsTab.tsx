import React, { useState } from 'react';
import { CandidateApplication } from '../types/employer.types';
import toast from 'react-hot-toast';

interface ApplicationsTabProps {
  applications: CandidateApplication[];
  onUpdateStatus: (applicationId: number, status: CandidateApplication['status']) => void;
  darkMode: boolean;
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({ applications, onUpdateStatus, darkMode }) => {
  const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const [selectedApp, setSelectedApp] = useState<CandidateApplication | null>(null);
  
  const handleDownloadCV = (alumnusName: string, fileName?: string, cvUrl?: string) => {
    if (cvUrl) {
      window.open(cvUrl.startsWith('http') ? cvUrl : `${UPLOAD_BASE}${cvUrl}`, '_blank');
      toast.success(`Opening CV for ${alumnusName}`);
    } else {
      toast.success(`Simulated CV Download: "${fileName || 'resume.pdf'}" saved for ${alumnusName}.`);
    }
  };

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
              <th className="pb-3 pr-2">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50/5 hover:transition-colors group">
                <td className="py-4 pr-2">
                  <p className="font-bold">{app.alumnusName}</p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{app.alumnusEmail}</p>
                </td>
                <td className="py-4 pr-2">
                  <p className="font-semibold">{app.jobTitle}</p>
                  <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Applied {app.appliedDate}</p>
                </td>
                <td className="py-4 pr-2">
                  <p className="font-bold text-[#003366] text-xs">{app.department}</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    CGPA: <span className="font-bold text-[#1a5c3a]">{app.cgpa}</span> • Class of {app.graduationYear}
                  </p>
                </td>
                <td className="py-4 pr-2">
                  <span className={`px-2.5 py-0.5 border rounded-full text-xs font-bold ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex gap-2 justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-3 py-1.5 bg-[#003366]/5 border border-[#003366]/20 text-[#003366] rounded-lg text-xs font-extrabold hover:bg-[#003366] hover:text-white transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 italic">No candidate applications registered.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center p-6 border-b border-gray-150/50">
              <div>
                <h3 className="text-2xl font-extrabold text-[#003366]">{selectedApp.alumnusName}</h3>
                <p className={`text-sm mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Applying for <span className="text-[#1a5c3a] font-bold">{selectedApp.jobTitle}</span>
                </p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Academic & Contact Info */}
                <div className="space-y-6">
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Candidate Profile</h4>
                    <div className={`p-4 rounded-xl border space-y-3 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Email</span>
                        <span className="text-sm font-semibold">{selectedApp.alumnusEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Department</span>
                        <span className="text-sm font-semibold">{selectedApp.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Graduation Year</span>
                        <span className="text-sm font-semibold">{selectedApp.graduationYear}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200/50">
                        <span className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>CGPA</span>
                        <span className="text-lg font-extrabold text-[#1a5c3a]">{selectedApp.cgpa}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.skills && selectedApp.skills.length > 0 ? selectedApp.skills.map(skill => (
                        <span key={skill} className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                          darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-gray-700 border-gray-200 shadow-sm'
                        }`}>{skill}</span>
                      )) : <span className="text-sm text-gray-400 italic">No skills listed</span>}
                    </div>
                  </div>
                </div>

                {/* Application Materials */}
                <div className="space-y-6">
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Application Materials</h4>
                    <button
                      onClick={() => handleDownloadCV(selectedApp.alumnusName, selectedApp.cvFileName, selectedApp.resumeUrl)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-gray-50 border-gray-200 shadow-sm hover:shadow'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">{selectedApp.cvFileName || 'resume.pdf'}</p>
                          <p className="text-xs text-gray-500">Curriculum Vitae</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Cover Letter</h4>
                    <div className={`p-4 rounded-xl border h-48 overflow-y-auto text-sm leading-relaxed ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-700'
                    }`}>
                      {selectedApp.coverLetter ? selectedApp.coverLetter : <span className="italic text-gray-400">No cover letter provided.</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className={`p-6 border-t flex items-center justify-between ${
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">Current Status:</span>
                <span className={`px-3 py-1 border rounded-full text-xs font-bold ${getStatusBadge(selectedApp.status)}`}>
                  {selectedApp.status}
                </span>
              </div>
              <div className="flex gap-2">
                <select 
                  className={`text-sm rounded-xl border px-3 py-2 font-semibold cursor-pointer outline-none ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onUpdateStatus(selectedApp.id, e.target.value as CandidateApplication['status']);
                      setSelectedApp({...selectedApp, status: e.target.value as CandidateApplication['status']});
                    }
                  }}
                >
                  <option value="" disabled>Update Status...</option>
                  <option value="Reviewed">Mark as Reviewed</option>
                  <option value="Shortlisted">Shortlist</option>
                  <option value="Interviewed">Schedule Interview</option>
                  <option value="Hired">Offer / Hire</option>
                  <option value="Rejected">Reject</option>
                </select>
                
                {selectedApp.status !== 'Hired' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedApp.id, 'Hired');
                      setSelectedApp({...selectedApp, status: 'Hired'});
                    }}
                    className="px-5 py-2 bg-[#1a5c3a] hover:bg-[#134d2f] text-white rounded-xl text-sm font-extrabold transition-colors shadow-md"
                  >
                    Hire Candidate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
