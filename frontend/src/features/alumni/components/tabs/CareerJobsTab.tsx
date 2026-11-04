import React, { useState, useMemo } from 'react';
import { Search, Briefcase, Building2, CheckCircle2, Bookmark, Send, Sparkles } from 'lucide-react';
import { JobMatch } from '../../types/alumni.types';

interface CareerJobsTabProps {
  jobs: JobMatch[];
  onApply: (jobId: string | number) => void;
  onToggleSave?: (jobId: string | number) => void;
}

export const CareerJobsTab: React.FC<CareerJobsTabProps> = ({ jobs, onApply, onToggleSave }) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSalary, setSelectedSalary] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');

  const engineeringDepartments = [
    'All',
    'Computer Science & Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil & Environmental Engineering',
    'Chemical Engineering',
    'Materials Science Engineering',
  ];

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        !search ||
        `${job.title} ${job.company} ${job.description} ${(job.skills || []).join(' ')}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchDept = selectedDept === 'All' || !job.department || job.department.includes(selectedDept) || selectedDept.includes(job.department || '');
      const matchTier =
        selectedTier === 'All' ||
        (job as any).tier === selectedTier ||
        (selectedTier === 'Strategic' && job.company.toLowerCase().includes('telecom')) ||
        (selectedTier === 'Technology' && (job.title.toLowerCase().includes('software') || job.title.toLowerCase().includes('engineer')));
      return matchSearch && matchDept && matchTier;
    });
  }, [jobs, search, selectedDept, selectedTier]);

  return (
    <div data-testid="career-jobs-tab" className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-page)] to-[var(--bg-card)] p-6 text-[var(--text-primary)] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Engineering Careers</span>
            <h2 className="mt-1 text-2xl font-black">ASTU Verified Career & Job Board</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Corporate partner vacancies matched to your verified credentials. Submit applications with 1-click resume transfer.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] px-4 py-2.5 text-center">
              <div className="text-xl font-black text-[var(--text-primary)]">{filteredJobs.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Open Roles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 text-xs">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles, tech stack, employer..."
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-sky-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-xs text-[var(--text-secondary)] focus:border-sky-500 focus:outline-none"
        >
          {engineeringDepartments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <select
          value={selectedSalary}
          onChange={(e) => setSelectedSalary(e.target.value)}
          className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-xs text-[var(--text-secondary)] focus:border-sky-500 focus:outline-none"
        >
          <option value="All">All Salary Brackets</option>
          <option value="entry">&lt; 20,000 ETB</option>
          <option value="mid">20,000 - 45,000 ETB</option>
          <option value="senior">45,000+ ETB</option>
        </select>

        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-xs text-[var(--text-secondary)] focus:border-sky-500 focus:outline-none"
        >
          <option value="All">All Partner Tiers</option>
          <option value="Strategic">Strategic Partners</option>
          <option value="Technology">Technology Hubs</option>
          <option value="Research">Research Institutions</option>
          <option value="Recruitment">Recruitment Agencies</option>
        </select>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center text-[var(--text-muted)]">
            No openings match your current search filters. Try widening your criteria.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col justify-between rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-lg transition-all hover:border-sky-500/40"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{job.title}</h4>
                      <p className="text-xs font-semibold text-sky-400">{job.company}</p>
                    </div>
                  </div>
                  {onToggleSave && (
                    <button
                      type="button"
                      onClick={() => onToggleSave(job.id)}
                      className={`rounded-lg p-1.5 transition-colors ${
                        job.saved ? 'text-amber-400 bg-amber-400/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">{job.description}</p>

                {job.skills && job.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="rounded-md bg-[var(--bg-card-secondary)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[var(--border-color)] pt-3.5 text-xs">
                <span className="font-mono text-[var(--text-secondary)]">{job.salary || 'Competitive ETB'}</span>
                {job.applied ? (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onApply(job.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-sky-500 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" /> 1-Click Apply
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
