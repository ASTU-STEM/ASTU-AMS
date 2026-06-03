import React from 'react';
import { JobMatch } from '../types/alumni.types';

interface JobDetailsModalProps {
  job: JobMatch | null;
  onClose: () => void;
  onApply: (jobId: number) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose, onApply }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        {/* Enhanced Modal Header with Gradient */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 z-10"
          style={{ background: 'linear-gradient(135deg, #f8faff, #fff)' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#003366] to-[#004d99] text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
                {job.location.includes('Remote') ? 'Remote' : 'On-Site'}
              </span>
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
                {job.match} Skills Match
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
            <p className="text-sm font-bold text-[#003366] mt-0.5">{job.company}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Quick info cards */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl border border-gray-100 text-center"
            style={{ background: 'linear-gradient(135deg, #f8faff, #f0f4fe)' }}>
            <div className="p-2 rounded-xl bg-white/60 backdrop-blur-sm">
              <p className="text-[10px] uppercase font-bold text-gray-400">Compensation</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{job.salary.split(' ')[0]} ETB</p>
            </div>
            <div className="p-2 rounded-xl bg-white/60 backdrop-blur-sm">
              <p className="text-[10px] uppercase font-bold text-gray-400">Location</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{job.location.split(' ')[0]}</p>
            </div>
            <div className="p-2 rounded-xl bg-white/60 backdrop-blur-sm">
              <p className="text-[10px] uppercase font-bold text-gray-400">Posted Date</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{job.postedDate}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900">Job Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900">Candidate Requirements</h4>
            <ul className="space-y-2">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="material-symbols-outlined text-astu-green text-lg mt-0.5">check_circle</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900">Compensation & Benefits</h4>
            <ul className="space-y-2">
              {job.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="material-symbols-outlined text-astu-navy text-lg mt-0.5">verified</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-4 sticky bottom-0 bg-white z-10">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition-all hover:shadow-sm"
          >
            Close Details
          </button>
          <button 
            onClick={() => {
              onApply(job.id);
              onClose();
            }}
            className={`flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md text-white ${
              job.applied 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            }`}
            disabled={job.applied}
          >
            {job.applied ? 'Application Submitted' : 'Apply For Job'}
          </button>
        </div>
      </div>
    </div>
  );
};
