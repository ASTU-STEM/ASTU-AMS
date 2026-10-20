import React, { useState } from 'react';
import { JobMatch } from '../types/alumni.types';
import toast from 'react-hot-toast';

interface JobDetailsModalProps {
  job: JobMatch | null;
  onClose: () => void;
  onApply: (jobId: any, coverLetter?: string) => void;
  /** Full job list, used to derive genuinely similar postings. */
  allJobs?: JobMatch[];
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose, onApply, allJobs = [] }) => {
  const [coverLetter, setCoverLetter] = useState('');

  if (!job) return null;

  const handleUseSavedCoverLetter = () => {
    const saved = localStorage.getItem('astu_saved_cover_letter');
    if (saved && saved.trim()) {
      setCoverLetter(saved);
      toast.success('Loaded saved cover letter template!');
    } else {
      toast.error('No saved cover letter template found. Save one under your Profile or Settings!');
    }
  };

  // Similar jobs are derived from the real job list, ranked by the (real)
  // skill-overlap match score. Previously this was a hardcoded demo list.
  const similarJobs: { title: string; company: string; match: string }[] = allJobs
    .filter((j) => j.id !== job.id)
    .map((j) => ({ title: j.title, company: j.company, match: j.match || '' }))
    .sort((a, b) => (parseInt(b.match, 10) || 0) - (parseInt(a.match, 10) || 0))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 z-10"
          style={{ background: 'linear-gradient(135deg, #f8faff, #fff)' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#003366] to-[#004d99] text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
                {job.remoteOption === 'remote' ? 'Remote' : job.remoteOption === 'hybrid' ? 'Hybrid' : 'On-Site'}
              </span>
              {job.match && (
                <span className="px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
                  {job.match} Skills Match
                </span>
              )}
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider rounded-full">
                {job.type}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
            <p className="text-sm font-bold text-[#003366] mt-0.5">{job.company}</p>
            {job.industry && <p className="text-[10px] text-gray-500 mt-0.5">{job.industry} · {job.companySize || 'Medium'}</p>}
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
          <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl border border-gray-100 text-center"
            style={{ background: 'linear-gradient(135deg, #f8faff, #f0f4fe)' }}>
            <div className="p-2 rounded-xl bg-white/60 backdrop-blur-sm">
              <p className="text-[10px] uppercase font-bold text-gray-400">Compensation</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{job.salary}</p>
            </div>
            <div className="p-2 rounded-xl bg-white/60 backdrop-blur-sm">
              <p className="text-[10px] uppercase font-bold text-gray-400">Location</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{job.location.split(',')[0]}</p>
            </div>
            <div className="p-2 rounded-xl bg-white/60 backdrop-blur-sm">
              <p className="text-[10px] uppercase font-bold text-gray-400">Experience</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{job.experience || 'N/A'}</p>
            </div>
            <div className="p-2 rounded-xl bg-white/60 backdrop-blur-sm">
              <p className="text-[10px] uppercase font-bold text-gray-400">Posted</p>
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

          {/* Application Progress */}
          {job.applied && (
            <div className="p-4 rounded-2xl border border-astu-green/20 bg-astu-green/5 space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-astu-green">description</span>
                Application Status
              </h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    job.applicationStatus === 'Offered' ? 'bg-astu-green' :
                    job.applicationStatus === 'Interview Scheduled' ? 'bg-blue-500' :
                    'bg-amber-500'
                  }`}>
                    {job.applicationStatus === 'Offered' ? '✓' : job.applicationStatus === 'Interview Scheduled' ? '📅' : '⏳'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{job.applicationStatus}</p>
                    {job.appliedDate && <p className="text-[10px] text-gray-500">Applied: {job.appliedDate}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skills Tags */}
          {job.skills && job.skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hiring Metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
            <div className="text-center">
              <p className="text-lg font-extrabold text-gray-900">{job.views}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Views</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-gray-900">{job.applications}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Applicants</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-astu-green">{job.shortlisted}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Shortlisted</p>
            </div>
          </div>

          {/* Cover Letter Input for Unapplied Jobs */}
          {!job.applied && (
            <div className="p-4 rounded-2xl border border-[#003366]/20 bg-[#003366]/5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#003366] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">description</span>
                  Cover Letter / Application Note
                </label>
                <button
                  type="button"
                  onClick={handleUseSavedCoverLetter}
                  className="px-3 py-1 bg-white border border-[#003366]/30 text-[#003366] text-[10px] font-extrabold rounded-lg hover:bg-[#003366] hover:text-white transition-all shadow-xs flex items-center gap-1"
                >
                  📝 Use Saved
                </button>
              </div>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write a short cover letter or click 'Use Saved' to load your saved template..."
                className="w-full text-xs p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] transition-all h-28 resize-none"
              />
            </div>
          )}

          {/* Similar Jobs */}
          {similarJobs.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900">Similar Positions</h4>
            <div className="space-y-2">
              {similarJobs.map((sj, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{sj.title}</p>
                    <p className="text-[10px] text-gray-500">{sj.company}</p>
                  </div>
                  {sj.match && <span className="px-2 py-0.5 bg-astu-green/10 text-astu-green text-[10px] font-bold rounded-full">{sj.match} Match</span>}
                </div>
              ))}
            </div>
          </div>
          )}
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
              onApply(job.id, coverLetter);
              onClose();
            }}
            className={`flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md text-white ${
              job.applied 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            }`}
            disabled={job.applied}
          >
            {job.applied ? 'Application Submitted' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
};
