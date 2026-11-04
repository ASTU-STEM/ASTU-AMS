import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PaginationControls } from '../../../components/dashboard/PaginationControls';
import { JobMatch } from '../types/alumni.types';
import {
  alumniFilterBarClass,
  alumniGhostBtnClass,
  alumniInputClass,
  alumniMutedClass,
  alumniPageClass,
  alumniPanelClass,
  alumniPrimaryBtnClass,
  alumniSecondaryBtnClass,
  alumniSelectClass,
  alumniStatusBadge,
  alumniTabBtn,
  alumniTabRailClass,
} from './alumniUi';

interface JobsTabProps {
  jobs: JobMatch[];
  onViewJob: (job: JobMatch) => void;
  onToggleSaveJob: (jobId: string | number) => void;
}

const hasRealSalary = (salary?: string) => {
  if (!salary) return false;
  const trimmed = salary.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (['n/a', 'na', 'tbd', 'negotiable', '-', '—'].includes(lower)) return false;
  return /\d/.test(trimmed);
};

export const JobsTab: React.FC<JobsTabProps> = ({
  jobs,
  onViewJob,
  onToggleSaveJob,
}) => {
  const [innerTab, setInnerTab] = useState<'all' | 'saved' | 'applied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [sortBy, setSortBy] = useState<'match' | 'recent' | 'salary' | 'views'>('match');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const defaultLocations = [
    'Addis Ababa',
    'Adama (Nazret)',
    'Bishoftu (Debre Zeit)',
    'Hawassa',
    'Dire Dawa',
    'Bahir Dar',
    'Mekelle',
    'Gondar',
    'Jimma',
    'Dessie / Kombolcha',
    'Arba Minch',
    'Jigjiga',
    'Harar',
    'Dilla',
    'Asosa',
    'Semera',
    'Gambela',
    'Remote (Ethiopia)',
    'Remote (Global)',
    'Hybrid',
    'International / Overseas',
  ];

  const dynamicJobLocations = Array.from(
    new Set(
      jobs
        .map((j) => j.location)
        .filter((loc): loc is string => Boolean(loc && loc.trim()))
        .map((loc) => loc.trim())
    )
  );

  const allLocationOptions = Array.from(
    new Set([...defaultLocations, ...dynamicJobLocations])
  );

  const formats = ['All', 'Full-Time', 'Internship', 'Contract', 'Part-Time'];

  const handleToggleSave = (e: React.MouseEvent, id: string | number, saved: boolean) => {
    e.stopPropagation();
    onToggleSaveJob(id);
    toast.success(
      saved ? 'Removed from saved listings.' : 'Listing saved for later review!'
    );
  };

  let tabJobs = jobs;
  if (innerTab === 'saved') tabJobs = jobs.filter((j) => j.saved);
  else if (innerTab === 'applied') tabJobs = jobs.filter((j) => j.applied);

  const filteredJobs = tabJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills?.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      false;

    const matchesLocation = (() => {
      if (selectedLocation === 'All') return true;
      if (!job.location) return false;

      const jobLoc = job.location.toLowerCase();
      const selLoc = selectedLocation.toLowerCase();

      if (jobLoc.includes(selLoc) || selLoc.includes(jobLoc)) return true;
      if (selLoc.includes('adama') && (jobLoc.includes('adama') || jobLoc.includes('nazret')))
        return true;
      if (
        selLoc.includes('bishoftu') &&
        (jobLoc.includes('bishoftu') || jobLoc.includes('debre zeit'))
      )
        return true;
      if (selLoc.includes('remote') && jobLoc.includes('remote')) return true;
      if (selLoc.includes('hybrid') && jobLoc.includes('hybrid')) return true;

      const cleanSel = selLoc.replace(/\s*\([^)]*\)/g, '').trim();
      if (cleanSel && (jobLoc.includes(cleanSel) || cleanSel.includes(jobLoc))) return true;

      return false;
    })();

    const matchesFormat =
      selectedFormat === 'All' ||
      job.type
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .includes(selectedFormat.toLowerCase().replace(/[^a-z]/g, '')) ||
      selectedFormat
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .includes(job.type.toLowerCase().replace(/[^a-z]/g, ''));

    return matchesSearch && matchesLocation && matchesFormat;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const parseSalary = (s: string) => parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
    switch (sortBy) {
      case 'match':
        return parseInt(b.match, 10) - parseInt(a.match, 10);
      case 'recent':
        return (b.views || 0) - (a.views || 0);
      case 'salary':
        return parseSalary(b.salary) - parseSalary(a.salary);
      case 'views':
        return (b.applications || 0) - (a.applications || 0);
      default:
        return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedJobs = sortedJobs.slice((safePage - 1) * pageSize, safePage * pageSize);

  const tabConfig = [
    { key: 'all' as const, label: 'Available', icon: 'work' },
    { key: 'saved' as const, label: 'Saved', icon: 'bookmark' },
    { key: 'applied' as const, label: 'Applied', icon: 'task_alt' },
  ];

  const appliedCount = jobs.filter((j) => j.applied).length;

  return (
    <div className={alumniPageClass}>
      {/* Career hero */}
      <section
        className={`${alumniPanelClass} relative overflow-hidden`}
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--brand-navy) 92%, #000) 0%, var(--bg-card) 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <img
              alt="ASTU seal"
              className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
              src="/images/astu-seal-logo.png"
            />
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                ASTU Career Placement
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Jobs Board
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
                Openings and internships matched to your verified ASTU profile. Save roles,
                track applications, and apply with your credentials.
              </p>
            </div>
          </div>

          <div className="flex gap-3 self-start md:self-center">
            <div className="min-w-[6.5rem] rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
              <div className="text-2xl font-extrabold text-white">{filteredJobs.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/65">
                Available
              </div>
            </div>
            <div className="min-w-[6.5rem] rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
              <div className="text-2xl font-extrabold text-white">{appliedCount}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/65">
                Applied
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className={alumniTabRailClass} role="tablist" aria-label="Jobs board filters">
        {tabConfig.map((tab) => {
          const isActive = innerTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setInnerTab(tab.key);
                setCurrentPage(1);
              }}
              className={alumniTabBtn(isActive)}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className={alumniFilterBarClass}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[20px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search jobs, companies, or skills…"
              className={`${alumniInputClass} pl-11`}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-0">
            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setCurrentPage(1);
              }}
              className={alumniSelectClass}
              aria-label="Filter by location"
            >
              <option value="All">All locations</option>
              <optgroup label="Ethiopian cities & hubs">
                {allLocationOptions
                  .filter(
                    (loc) =>
                      !loc.toLowerCase().includes('remote') &&
                      !loc.toLowerCase().includes('hybrid') &&
                      !loc.toLowerCase().includes('international')
                  )
                  .map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Work modes & international">
                {allLocationOptions
                  .filter(
                    (loc) =>
                      loc.toLowerCase().includes('remote') ||
                      loc.toLowerCase().includes('hybrid') ||
                      loc.toLowerCase().includes('international')
                  )
                  .map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
              </optgroup>
            </select>

            <select
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                setCurrentPage(1);
              }}
              className={alumniSelectClass}
              aria-label="Filter by employment format"
            >
              <option value="All">All formats</option>
              {formats
                .filter((f) => f !== 'All')
                .map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className={alumniSelectClass}
              aria-label="Sort jobs"
            >
              <option value="match">Best match</option>
              <option value="recent">Most recent</option>
              <option value="salary">Highest salary</option>
              <option value="views">Most viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
          <p className={`${alumniMutedClass} font-semibold`}>
            {sortedJobs.length} position{sortedJobs.length === 1 ? '' : 's'} found
          </p>
        </div>

        {sortedJobs.length === 0 ? (
          <div className={`${alumniPanelClass} text-center`}>
            <span className="material-symbols-outlined mb-2 text-4xl text-[var(--text-muted)]">
              find_in_page
            </span>
            <p className="text-base font-semibold text-[var(--text-primary)]">
              No matching career listings found.
            </p>
            <p className={alumniMutedClass}>Try adjusting search keywords or filters.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedJobs.map((job) => (
                <article
                  key={job.id}
                  onClick={() => onViewJob(job)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onViewJob(job);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group cursor-pointer rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-xs transition hover:border-[var(--brand-primary)]/35 hover:bg-[var(--bg-hover)] sm:p-6"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={alumniStatusBadge.brand}>{job.type}</span>
                        {job.postedDate && (
                          <span className="text-xs font-medium text-[var(--text-muted)]">
                            {job.postedDate}
                          </span>
                        )}
                        {job.deadline && (
                          <span className={alumniStatusBadge.warning}>
                            Deadline {job.deadline}
                          </span>
                        )}
                        {job.applied && (
                          <span className={alumniStatusBadge.success}>Applied</span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)] transition group-hover:text-[var(--brand-primary)] sm:text-2xl">
                          {job.title}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)] sm:text-base">
                          {job.company}
                          {job.location ? (
                            <span className="font-normal text-[var(--text-muted)]">
                              {' '}
                              · {job.location}
                            </span>
                          ) : null}
                        </p>
                      </div>

                      {job.description && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-[15px]">
                          {job.description}
                        </p>
                      )}

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.slice(0, 8).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card-secondary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 8 && (
                            <span className="px-2 py-1 text-xs font-medium text-[var(--text-muted)]">
                              +{job.skills.length - 8} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex w-full shrink-0 flex-row items-center justify-between gap-3 border-t border-[var(--border-color)] pt-4 md:w-auto md:flex-col md:items-end md:border-t-0 md:pt-0">
                      <div className="text-left md:text-right">
                        {hasRealSalary(job.salary) && (
                          <>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                              Salary
                            </p>
                            <p className="text-lg font-bold text-[var(--text-primary)]">
                              {job.salary}
                            </p>
                          </>
                        )}
                        {job.experience && (
                          <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                            {job.experience}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title={job.saved ? 'Remove from saved' : 'Save opportunity'}
                          onClick={(e) => handleToggleSave(e, job.id, job.saved)}
                          className={`${alumniGhostBtnClass} !px-2.5 !py-2.5 border border-[var(--border-color)]`}
                        >
                          <span
                            className={`material-symbols-outlined text-[20px] ${
                              job.saved ? 'text-[var(--warning)]' : ''
                            }`}
                            style={job.saved ? { fontVariationSettings: "'FILL' 1" } : undefined}
                          >
                            bookmark
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewJob(job);
                          }}
                          className={
                            job.applied
                              ? `${alumniSecondaryBtnClass} !border-emerald-500/30 !text-emerald-600 dark:!text-emerald-400`
                              : alumniPrimaryBtnClass
                          }
                        >
                          {job.applied ? 'View application' : 'View & apply'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {sortedJobs.length > pageSize && (
              <PaginationControls
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={sortedJobs.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                className="pt-2"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
