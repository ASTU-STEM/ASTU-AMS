import React, { useState } from 'react';
import { JobMatch } from '../types/alumni.types';
import toast from 'react-hot-toast';

interface JobDetailsModalProps {
  job: JobMatch | null;
  onClose: () => void;
  onApply: (jobId: string | number, coverLetter?: string) => void;
  onWithdraw?: (jobId: string | number) => Promise<void> | void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose, onApply, onWithdraw }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  if (!job) return null;

  const handleUseSavedCoverLetter = () => {
    const saved = localStorage.getItem('astu_saved_cover_letter');
    if (saved && saved.trim()) {
      setCoverLetter(saved);
      toast.success('Loaded saved cover letter template!');
    } else {
      toast.error('No saved cover letter found. You can write your cover letter below!');
    }
  };

  const handleGenerateAstuTemplate = () => {
    const template = `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.title} position (${job.department ? `Department: ${job.department}` : ''}). As an Adama Science and Technology University (ASTU) graduate, I have developed solid foundational knowledge, hands-on engineering problem-solving capabilities, and a commitment to professional excellence.

My technical background and qualifications directly align with your requirements. I would welcome the opportunity to discuss how my skills can contribute to your team.

Thank you for your time and consideration.

Sincerely,
ASTU Alumni Candidate`;
    setCoverLetter(template);
    toast.success('ASTU Graduate Cover Letter template applied!');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onApply(job.id, coverLetter);
      onClose();
    } catch {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-[var(--bg-card)] rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-[var(--border-color)] flex flex-col text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--border-color)] flex justify-between items-start sticky top-0 z-10 bg-[var(--bg-card)] backdrop-blur-md">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-[#003366] text-white text-[11px] font-extrabold uppercase tracking-wider rounded-md shadow-xs">
                {job.type}
              </span>
              {job.department && (
                <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-extrabold uppercase tracking-wider rounded-md border border-amber-500/20">
                  Dept: {job.department}
                </span>
              )}
              {job.remoteOption && (
                <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-extrabold uppercase tracking-wider rounded-md">
                  {job.remoteOption === 'remote' ? 'Remote' : job.remoteOption === 'hybrid' ? 'Hybrid' : 'On-Site'}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">{job.title}</h2>
            <p className="text-sm font-bold text-[#003366] dark:text-blue-400">
              {job.company} — <span className="text-[var(--text-secondary)] font-normal">{job.location}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 sm:space-y-6 flex-1 overflow-y-auto">
          {/* Quick info cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-center">
            <div className="p-2.5 rounded-lg bg-[var(--bg-card)] shadow-xs">
              <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Compensation</p>
              <p className="text-sm font-black text-[var(--text-primary)] mt-1">{job.salary}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-card)] shadow-xs">
              <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Location</p>
              <p className="text-sm font-black text-[var(--text-primary)] mt-1 truncate">{job.location.split(',')[0]}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-card)] shadow-xs">
              <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Experience</p>
              <p className="text-sm font-black text-[var(--text-primary)] mt-1">{job.experience || 'Entry Level'}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-card)] shadow-xs">
              <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Posted Date</p>
              <p className="text-sm font-black text-[var(--text-primary)] mt-1">{job.postedDate}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-base text-[var(--text-primary)]">Job Description</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities if available */}
          {job.responsibilities && (
            <div className="space-y-2">
              <h3 className="font-bold text-base text-[var(--text-primary)]">Key Responsibilities</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {job.responsibilities}
              </p>
            </div>
          )}

          {/* Candidate Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-bold text-base text-[var(--text-primary)]">Candidate Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5 shrink-0">check_circle</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills / Tech Stack */}
          {job.skills && job.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-base text-[var(--text-primary)]">Required Skills & Tools</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-black/5 dark:bg-white/5 text-[var(--text-primary)] text-xs font-bold rounded-lg border border-[var(--border-color)]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hiring Metrics */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-center">
            <div>
              <p className="text-lg font-black text-[var(--text-primary)]">{job.views || 0}</p>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Views</p>
            </div>
            <div>
              <p className="text-lg font-black text-[var(--text-primary)]">{job.applications || 0}</p>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Applicants</p>
            </div>
            <div>
              <p className="text-lg font-black text-emerald-600">{job.shortlisted || 0}</p>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Shortlisted</p>
            </div>
          </div>

          {/* Application Status Banner if applied */}
          {job.applied ? (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">task_alt</span>
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  Application Submitted
                </h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Status: <span className="font-bold text-[var(--text-primary)]">{job.applicationStatus || 'Applied'}</span>
                {job.appliedDate && ` · Submitted on ${job.appliedDate}`}
              </p>
            </div>
          ) : (
            /* Cover Letter Input for Unapplied Jobs */
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-black/5 dark:bg-white/5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-black text-[#003366] dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">description</span>
                  Cover Letter / Application Note
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleGenerateAstuTemplate}
                    className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] text-[#003366] dark:text-blue-300 text-[11px] font-bold rounded-lg hover:bg-[#003366] hover:text-white transition shadow-xs cursor-pointer"
                  >
                    🎓 ASTU Template
                  </button>
                  <button
                    type="button"
                    onClick={handleUseSavedCoverLetter}
                    className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-[11px] font-bold rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition shadow-xs cursor-pointer"
                  >
                    📝 Use Saved
                  </button>
                </div>
              </div>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Introduce yourself, highlight your academic achievements, and state why you are ideal for this role..."
                className="w-full text-xs sm:text-sm p-3 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] transition-all h-32 resize-none"
              />
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-[var(--border-color)] flex gap-3 sticky bottom-0 bg-[var(--bg-card)] z-10">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-2.5 sm:py-3 border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-xs sm:text-sm font-bold text-[var(--text-secondary)] transition cursor-pointer"
          >
            Close Details
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={job.applied || isSubmitting}
            className={`flex-1 px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm text-white ${
              job.applied 
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-70' 
                : 'bg-[#003366] hover:bg-[#002244] hover:shadow-md cursor-pointer'
            }`}
          >
            {job.applied ? 'Application Submitted ✓' : isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
          {job.canWithdraw && onWithdraw && (
            <button
              type="button"
              onClick={async () => {
                setIsWithdrawing(true);
                try {
                  await onWithdraw(job.id);
                } finally {
                  setIsWithdrawing(false);
                }
              }}
              disabled={isWithdrawing}
              className="px-5 py-2.5 sm:py-3 border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300 transition cursor-pointer disabled:opacity-60"
            >
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
