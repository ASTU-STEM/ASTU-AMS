import React, { useState } from 'react';
import { JobMatch } from '../types/alumni.types';
import toast from 'react-hot-toast';
import {
  alumniGhostBtnClass,
  alumniMutedClass,
  alumniPrimaryBtnClass,
  alumniSecondaryBtnClass,
  alumniStatusBadge,
  alumniTextareaClass,
} from './alumniUi';

interface JobDetailsModalProps {
  job: JobMatch | null;
  onClose: () => void;
  onApply: (jobId: any, coverLetter?: string) => void;
  onWithdraw?: (jobId: string | number) => void;
  /** Full job list, used to derive genuinely similar postings. */
  allJobs?: JobMatch[];
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  onClose,
  onApply,
  onWithdraw,
  allJobs = [],
}) => {
  const [coverLetter, setCoverLetter] = useState('');

  if (!job) return null;

  const handleUseSavedCoverLetter = () => {
    const saved = localStorage.getItem('astu_saved_cover_letter');
    if (saved && saved.trim()) {
      setCoverLetter(saved);
      toast.success('Loaded saved cover letter template!');
    } else {
      toast.error(
        'No saved cover letter template found. Save one under your Profile or Settings!'
      );
    }
  };

  const similarJobs: { title: string; company: string; match: string }[] = allJobs
    .filter((j) => j.id !== job.id)
    .map((j) => ({ title: j.title, company: j.company, match: j.match || '' }))
    .sort((a, b) => (parseInt(b.match, 10) || 0) - (parseInt(a.match, 10) || 0))
    .slice(0, 3);

  const remoteLabel =
    job.remoteOption === 'remote'
      ? 'Remote'
      : job.remoteOption === 'hybrid'
        ? 'Hybrid'
        : 'On-Site';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-details-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={alumniStatusBadge.info}>{remoteLabel}</span>
              {job.match && (
                <span className={alumniStatusBadge.success}>{job.match} skills match</span>
              )}
              <span className={alumniStatusBadge.brand}>{job.type}</span>
            </div>
            <h3 id="job-details-title" className="text-xl font-bold tracking-tight">
              {job.title}
            </h3>
            <p className="text-sm font-semibold text-[var(--brand-primary)]">{job.company}</p>
            {job.industry && (
              <p className="text-xs text-[var(--text-muted)]">
                {job.industry}
                {job.companySize ? ` · ${job.companySize}` : ''}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`${alumniGhostBtnClass} !p-2 shrink-0`}
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] p-3 text-center sm:grid-cols-4">
            {[
              { label: 'Compensation', value: job.salary || '—' },
              { label: 'Location', value: job.location?.split(',')[0] || '—' },
              { label: 'Experience', value: job.experience || 'N/A' },
              { label: 'Posted', value: job.postedDate || '—' },
            ].map((cell) => (
              <div
                key={cell.label}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-2.5"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  {cell.label}
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{cell.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[var(--text-primary)]">Job description</h4>
            <p className={`leading-relaxed ${alumniMutedClass}`}>{job.description}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-[var(--text-primary)]">Candidate requirements</h4>
            <ul className="space-y-2">
              {(Array.isArray(job.requirements) ? job.requirements : []).map((req, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
                >
                  <span className="material-symbols-outlined mt-0.5 text-lg text-[var(--success)]">
                    check_circle
                  </span>
                  <span>{req}</span>
                </li>
              ))}
              {(!job.requirements ||
                (Array.isArray(job.requirements) && job.requirements.length === 0)) && (
                <li className="text-sm text-[var(--text-muted)]">
                  Requirements will appear when the employer publishes them.
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-[var(--text-primary)]">Compensation & benefits</h4>
            <ul className="space-y-2">
              {(Array.isArray(job.benefits) ? job.benefits : []).map((benefit, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
                >
                  <span className="material-symbols-outlined mt-0.5 text-lg text-[var(--brand-primary)]">
                    verified
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
              {(!job.benefits ||
                (Array.isArray(job.benefits) && job.benefits.length === 0)) && (
                <li className="text-sm text-[var(--text-muted)]">
                  Benefits details are provided by the employer.
                </li>
              )}
            </ul>
          </div>

          {job.applied && (
            <div className="space-y-3 rounded-xl border border-[var(--success)]/25 bg-[var(--success)]/5 p-4">
              <h4 className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <span className="material-symbols-outlined text-[var(--success)]">description</span>
                Application status
              </h4>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                    job.applicationStatus === 'Offered'
                      ? 'bg-[var(--success)]'
                      : job.applicationStatus === 'Interview Scheduled'
                        ? 'bg-[var(--brand-primary)]'
                        : 'bg-[var(--warning)]'
                  }`}
                >
                  {job.applicationStatus === 'Offered'
                    ? '✓'
                    : job.applicationStatus === 'Interview Scheduled'
                      ? '📅'
                      : '⏳'}
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {job.applicationStatus}
                  </p>
                  {job.appliedDate && (
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Applied: {job.appliedDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-[var(--text-primary)]">Required skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-secondary)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] p-4">
            <div className="text-center">
              <p className="text-lg font-extrabold text-[var(--text-primary)]">{job.views ?? 0}</p>
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Views</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-[var(--text-primary)]">
                {job.applications ?? 0}
              </p>
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Applicants</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-[var(--success)]">{job.shortlisted ?? 0}</p>
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Shortlisted</p>
            </div>
          </div>

          {!job.applied && (
            <div className="space-y-3 rounded-xl border border-[var(--brand-primary)]/25 bg-[var(--brand-primary)]/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--brand-primary)]">
                  <span className="material-symbols-outlined text-base">description</span>
                  Cover letter / application note
                </label>
                <button
                  type="button"
                  onClick={handleUseSavedCoverLetter}
                  className={`${alumniSecondaryBtnClass} !px-3 !py-1.5 !text-[10px]`}
                >
                  Use saved
                </button>
              </div>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write a short cover letter or load your saved template…"
                className={`${alumniTextareaClass} h-28 min-h-[7rem] resize-none`}
              />
            </div>
          )}

          {similarJobs.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-[var(--text-primary)]">Similar positions</h4>
              <div className="space-y-2">
                {similarJobs.map((sj) => (
                  <div
                    key={`${sj.company}-${sj.title}`}
                    className="flex items-center justify-between rounded-xl border border-[var(--border-color)] p-3 transition hover:bg-[var(--bg-hover)]"
                  >
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">{sj.title}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{sj.company}</p>
                    </div>
                    {sj.match && (
                      <span className={alumniStatusBadge.success}>{sj.match} match</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex flex-wrap gap-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6">
          <button type="button" onClick={onClose} className={`flex-1 ${alumniSecondaryBtnClass}`}>
            Close details
          </button>
          {job.applied && job.canWithdraw && onWithdraw ? (
            <button
              type="button"
              onClick={() => {
                onWithdraw(job.id);
                onClose();
              }}
              className={`flex-1 ${alumniSecondaryBtnClass} !border-[var(--error)]/35 !text-[var(--error)]`}
            >
              Withdraw application
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onApply(job.id, coverLetter);
                onClose();
              }}
              disabled={job.applied}
              className={`flex-1 ${
                job.applied
                  ? 'cursor-not-allowed rounded-xl bg-[var(--bg-card-secondary)] px-4 py-2.5 text-sm font-bold text-[var(--text-muted)]'
                  : alumniPrimaryBtnClass
              }`}
            >
              {job.applied ? 'Application submitted' : 'Submit application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
