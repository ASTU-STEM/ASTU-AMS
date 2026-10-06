import React, { useEffect, useState } from 'react';
import { JobMatch } from '../types/alumni.types';
import toast from 'react-hot-toast';
import { ApplicationStatusBadge } from '../utils/statusUi';
import { alumniPrimaryBtnClass, alumniSecondaryBtnClass, alumniStatusBadge } from './alumniUi';

interface JobDetailsModalProps {
  job: JobMatch | null;
  onClose: () => void;
  onApply: (jobId: string | number, coverLetter?: string) => void;
  onWithdraw?: (jobId: string | number) => Promise<void> | void;
}

function getCompanyInitials(company: string): string {
  const parts = company.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'JP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose, onApply, onWithdraw }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (!job) return;
    setCoverLetter('');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [job, onClose]);

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

I am writing to express my strong interest in the ${job.title} position${job.department ? ` (${job.department})` : ''}. As an Adama Science and Technology University (ASTU) graduate, I bring solid technical foundations, practical problem-solving, and a commitment to professional excellence.

My background aligns with your requirements. I would welcome the opportunity to discuss how I can contribute to your team.

Thank you for your consideration.

Sincerely,
ASTU Alumni Candidate`;
    setCoverLetter(template);
    toast.success('ASTU cover letter template applied!');
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

  const showListingStats =
    (job.views ?? 0) > 0 || (job.applications ?? 0) > 0 || (job.shortlisted ?? 0) > 0;

  const coverLen = coverLetter.trim().length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl sm:max-h-[92vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — always visible */}
        <div className="shrink-0 border-b border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-4 sm:px-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#004d99] text-sm font-black text-white shadow-sm">
              {getCompanyInitials(job.company)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#003366] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  {job.type}
                </span>
                {job.department && (
                  <span className={alumniStatusBadge.warning + ' !rounded-md !text-[10px]'}>
                    Dept: {job.department}
                  </span>
                )}
                {job.remoteOption && (
                  <span className={alumniStatusBadge.info + ' !rounded-md !text-[10px]'}>
                    {job.remoteOption === 'remote' ? 'Remote' : job.remoteOption === 'hybrid' ? 'Hybrid' : 'On-site'}
                  </span>
                )}
                {job.isVerified && (
                  <span className={alumniStatusBadge.success + ' !rounded-md !text-[10px]'}>Verified employer</span>
                )}
              </div>
              <h2 id="job-modal-title" className="text-lg font-black leading-tight text-[var(--text-primary)] sm:text-xl">
                {job.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                <span className="font-bold text-[var(--text-primary)]">{job.company}</span>
                <span className="mx-1.5 text-[var(--text-muted)]">·</span>
                {job.location}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full p-2 text-[var(--text-secondary)] transition hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5"
              title="Close (Esc)"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Compensation', value: job.salary || 'Competitive' },
              { label: 'Location', value: job.location.split(',')[0] },
              { label: 'Experience', value: job.experience || 'Entry level' },
              { label: 'Posted', value: job.postedDate },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2.5 text-center"
              >
                <dt className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{item.label}</dt>
                <dd className="mt-0.5 truncate text-xs font-bold text-[var(--text-primary)] sm:text-sm">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Body — scrollable middle only */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-5 lg:col-span-3">
              <section>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">About this role</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
                  {job.description}
                </p>
              </section>

              {job.responsibilities && (
                <section>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Key responsibilities</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
                    {job.responsibilities}
                  </p>
                </section>
              )}

              {job.requirements && job.requirements.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Requirements</h3>
                  <ul className="mt-2 space-y-2">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="material-symbols-outlined mt-0.5 shrink-0 text-base text-emerald-600">check_circle</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {job.skills && job.skills.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Skills & tools</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {showListingStats && (
                <section className="rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-page)] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Listing activity</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="font-black text-[var(--text-primary)]">{job.views}</p>
                      <p className="text-[var(--text-muted)]">Views</p>
                    </div>
                    <div>
                      <p className="font-black text-[var(--text-primary)]">{job.applications}</p>
                      <p className="text-[var(--text-muted)]">Applicants</p>
                    </div>
                    <div>
                      <p className="font-black text-emerald-600">{job.shortlisted}</p>
                      <p className="text-[var(--text-muted)]">Shortlisted</p>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Application panel — sticky on large screens */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4 lg:sticky lg:top-0">
                {job.applied ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">task_alt</span>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">You applied</h4>
                      <ApplicationStatusBadge status={job.applicationStatus || 'Applied'} />
                    </div>
                    {job.appliedDate && (
                      <p className="text-xs text-[var(--text-secondary)]">Submitted {job.appliedDate}</p>
                    )}
                    <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                      Track updates on the Jobs board. You can withdraw while the employer is still reviewing applications.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <label htmlFor="job-cover-letter" className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        Cover letter
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={handleGenerateAstuTemplate}
                          className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-[10px] font-bold text-[#003366] transition hover:bg-[#003366] hover:text-white dark:text-[#FFD700]"
                        >
                          ASTU template
                        </button>
                        <button
                          type="button"
                          onClick={handleUseSavedCoverLetter}
                          className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-[10px] font-bold text-[var(--text-secondary)] transition hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          Use saved
                        </button>
                      </div>
                    </div>
                    <textarea
                      id="job-cover-letter"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Brief introduction, relevant ASTU projects, and why you fit this role…"
                      className="mt-3 min-h-[140px] w-full resize-y rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366]/15"
                    />
                    <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
                      {coverLen > 0 ? `${coverLen} characters` : 'Optional — a short note can improve shortlist rates'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer — actions always visible */}
        <div className="shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button type="button" onClick={onClose} className={alumniSecondaryBtnClass + ' w-full sm:w-auto text-sm'}>
              Close
            </button>
            {job.canWithdraw && onWithdraw && job.applied && (
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
                className="w-full rounded-xl border border-rose-300 px-5 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40 sm:w-auto"
              >
                {isWithdrawing ? 'Withdrawing…' : 'Withdraw application'}
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={job.applied || isSubmitting}
              className={
                (job.applied
                  ? 'cursor-not-allowed bg-slate-400 opacity-70 '
                  : alumniPrimaryBtnClass + ' ') + ' w-full sm:min-w-[200px] sm:w-auto text-sm'
              }
            >
              {job.applied ? 'Already submitted' : isSubmitting ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
