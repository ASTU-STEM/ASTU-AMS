import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { JobMatch } from '../types/alumni.types';
import { BrandMark } from './BrandMark';
import { EmptyState } from '../../../components/EmptyState';
import { ApplicationStatusBadge } from '../utils/statusUi';

interface JobsTabProps {
  jobs: JobMatch[];
  onViewJob: (job: JobMatch) => void;
  onToggleSaveJob: (jobId: string | number) => void;
}

export const JobsTab: React.FC<JobsTabProps> = ({
  jobs,
  onViewJob,
  onToggleSaveJob
}) => {
  const [innerTab, setInnerTab] = useState<'all' | 'saved' | 'applied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [quickFilter, setQuickFilter] = useState<'all' | 'fulltime' | 'internship' | 'contract' | 'remote' | 'adama' | 'addis'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'match' | 'salary' | 'views'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Extract real locations from live database jobs
  const dynamicJobLocations = Array.from(
    new Set(
      jobs
        .map(j => j.location)
        .filter((loc): loc is string => Boolean(loc && loc.trim()))
        .map(loc => loc.trim())
    )
  ).sort();

  // Extract real departments from live database jobs
  const dynamicDepartments = Array.from(
    new Set(
      jobs
        .map(j => j.department)
        .filter((d): d is string => Boolean(d && d.trim()))
        .map(d => d.trim())
    )
  ).sort();

  const formats = ['All', 'Full-Time', 'Internship', 'Contract', 'Part-Time'];

  const handleToggleSave = (e: React.MouseEvent, id: string | number, saved: boolean) => {
    e.stopPropagation();
    onToggleSaveJob(id);
    toast.success(
      saved ? 'Removed from saved listings.' : 'Listing saved for later review!'
    );
  };

  const handleShareJob = (e: React.MouseEvent, job: JobMatch) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/alumni/dashboard?tab=jobs&jobId=${job.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success(`Share link for "${job.title}" copied!`);
      }).catch(() => {
        toast.success(`Position: ${job.title} at ${job.company}`);
      });
    } else {
      toast.success(`Position: ${job.title} at ${job.company}`);
    }
  };

  // Determine active dataset based on inner tab
  let tabJobs = jobs;
  if (innerTab === 'saved') {
    tabJobs = jobs.filter(j => j.saved);
  } else if (innerTab === 'applied') {
    tabJobs = jobs.filter(j => j.applied);
  }

  // Filter jobs by search, location, format, department, and quick filter
  const filteredJobs = tabJobs.filter(job => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      (job.department && job.department.toLowerCase().includes(query)) ||
      job.skills?.some(skill => skill.toLowerCase().includes(query)) || false;

    const matchesLocation = (() => {
      if (selectedLocation === 'All') return true;
      if (!job.location) return false;
      const jobLoc = job.location.toLowerCase();
      const selLoc = selectedLocation.toLowerCase();
      return jobLoc.includes(selLoc) || selLoc.includes(jobLoc);
    })();

    const matchesFormat =
      selectedFormat === 'All' ||
      job.type.toLowerCase().replace(/[^a-z]/g, '').includes(selectedFormat.toLowerCase().replace(/[^a-z]/g, '')) ||
      selectedFormat.toLowerCase().replace(/[^a-z]/g, '').includes(job.type.toLowerCase().replace(/[^a-z]/g, ''));

    const matchesDepartment =
      selectedDepartment === 'All' ||
      (job.department && job.department.toUpperCase() === selectedDepartment.toUpperCase());

    const matchesQuickFilter = (() => {
      if (quickFilter === 'all') return true;
      if (quickFilter === 'fulltime') return job.type.toLowerCase().includes('full');
      if (quickFilter === 'internship') return job.type.toLowerCase().includes('intern');
      if (quickFilter === 'contract') return job.type.toLowerCase().includes('contract');
      if (quickFilter === 'remote') return (job.location && job.location.toLowerCase().includes('remote')) || job.remoteOption === 'remote';
      if (quickFilter === 'adama') return job.location && (job.location.toLowerCase().includes('adama') || job.location.toLowerCase().includes('nazret'));
      if (quickFilter === 'addis') return job.location && job.location.toLowerCase().includes('addis');
      return true;
    })();

    return matchesSearch && matchesLocation && matchesFormat && matchesDepartment && matchesQuickFilter;
  });

  // Sort filtered results
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const parseSalary = (s: string) => parseInt(s.replace(/[^0-9]/g, '')) || 0;
    switch (sortBy) {
      case 'salary':
        return parseSalary(b.salary) - parseSalary(a.salary);
      case 'views':
        return (b.views || 0) - (a.views || 0);
      case 'match':
        return parseInt(b.match.replace(/[^0-9]/g, '') || '0') - parseInt(a.match.replace(/[^0-9]/g, '') || '0');
      case 'recent':
      default: {
        const dateA = new Date(a.postedDate).getTime() || 0;
        const dateB = new Date(b.postedDate).getTime() || 0;
        return dateB - dateA;
      }
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / pageSize));
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const tabConfig = [
    { key: 'all' as const, label: 'Available Placements', count: jobs.length, icon: 'work' },
    { key: 'saved' as const, label: 'Saved Opportunities', count: jobs.filter(j => j.saved).length, icon: 'bookmark' },
    { key: 'applied' as const, label: 'My Applications', count: jobs.filter(j => j.applied).length, icon: 'task_alt' }
  ];

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase() || 'CP';
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedLocation('All');
    setSelectedFormat('All');
    setSelectedDepartment('All');
    setQuickFilter('all');
    setCurrentPage(1);
  };

  const isFiltered = searchQuery !== '' || selectedLocation !== 'All' || selectedFormat !== 'All' || selectedDepartment !== 'All' || quickFilter !== 'all';

  return (
    <div className="space-y-6 sm:space-y-8 min-h-screen text-[var(--text-primary)]">
      
      {/* HERO SECTION */}
      <section
        className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #003366 0%, #001a33 50%, #0d2b4d 100%)'
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            <BrandMark className="h-14 w-14 object-contain scale-110 shrink-0" tone="dark" />
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFCC00]/20 text-[#FFD700] text-xs font-bold uppercase tracking-widest rounded-full border border-[#FFCC00]/30">
                <span className="w-2 h-2 rounded-full bg-[#FFCC00] animate-pulse" />
                ASTU Corporate Careers
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                Career Placement Board
              </h2>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl">
                Discover verified career openings, apprenticeships, and engineering contracts registered with ASTU.
                Apply directly with your ASTU verified credentials.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-3 sm:gap-4 self-start md:self-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-5 py-3 text-center border border-white/10 min-w-[90px] sm:min-w-[100px]">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#FFCC00]">
                {jobs.length}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/60">
                Positions
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-5 py-3 text-center border border-white/10 min-w-[90px] sm:min-w-[100px]">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {jobs.filter(j => j.applied).length}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/60">
                Applied
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-5 py-3 text-center border border-white/10 min-w-[90px] sm:min-w-[100px]">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                {jobs.filter(j => j.saved).length}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/60">
                Saved
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER TABS */}
      <div className="flex p-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-xs gap-1.5">
        {tabConfig.map(tab => {
          const isActive = innerTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setInnerTab(tab.key);
                setCurrentPage(1);
              }}
              className={`flex-1 py-3 px-3 sm:px-4 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#003366] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className={`material-symbols-outlined text-lg sm:text-xl ${isActive ? 'text-[#FFCC00]' : ''}`}>
                {tab.icon}
              </span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEARCH & SELECT FILTERS */}
      <div className="bg-[var(--bg-card)] p-4 sm:p-5 rounded-xl border border-[var(--border-color)] shadow-xs space-y-3 sm:space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by title, company, or skill…"
              className="w-full pl-11 pr-10 py-3 text-sm sm:text-base border border-[var(--border-color)] rounded-xl bg-[var(--bg-page)] text-[var(--text-primary)] focus:bg-[var(--bg-card)] focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] p-1 cursor-pointer"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:flex gap-2.5 sm:gap-3">
            <select
              value={selectedLocation}
              onChange={e => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by Location"
              className="px-3.5 py-3 text-xs sm:text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] shadow-xs focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none cursor-pointer min-w-[140px]"
            >
              <option value="All">📍 All Locations</option>
              {dynamicJobLocations.map(loc => (
                <option key={loc} value={loc}>
                  📍 {loc}
                </option>
              ))}
            </select>

            <select
              value={selectedFormat}
              onChange={e => { setSelectedFormat(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by Format"
              className="px-3.5 py-3 text-xs sm:text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] shadow-xs focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none cursor-pointer min-w-[130px]"
            >
              <option value="All">💼 All Formats</option>
              {formats.filter(f => f !== 'All').map(fmt => (
                <option key={fmt} value={fmt}>{fmt}</option>
              ))}
            </select>

            {dynamicDepartments.length > 0 && (
              <select
                value={selectedDepartment}
                onChange={e => { setSelectedDepartment(e.target.value); setCurrentPage(1); }}
                aria-label="Filter by Department"
                className="px-3.5 py-3 text-xs sm:text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] shadow-xs focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none cursor-pointer min-w-[120px]"
              >
                <option value="All">🎓 All Depts</option>
                {dynamicDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort Order"
              className="col-span-2 lg:col-span-1 px-3.5 py-3 text-xs sm:text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] shadow-xs focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none cursor-pointer min-w-[130px]"
            >
              <option value="recent">🕐 Most Recent</option>
              <option value="salary">💰 Highest Salary</option>
              <option value="views">👁️ Most Popular</option>
              <option value="match">🎯 Match Score</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 border-t border-[var(--border-color)] text-xs">
          <span className="text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px] mr-1">
            Quick Filters:
          </span>

          {[
            { id: 'all' as const, label: 'All Jobs' },
            { id: 'fulltime' as const, label: '💼 Full-Time' },
            { id: 'internship' as const, label: '🎓 Internships' },
            { id: 'contract' as const, label: '📄 Contract' },
            { id: 'remote' as const, label: '🌐 Remote' },
            { id: 'adama' as const, label: '📍 Adama' },
            { id: 'addis' as const, label: '📍 Addis Ababa' },
          ].map(pill => {
            const isSelected = quickFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => {
                  setQuickFilter(pill.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#003366] text-white shadow-xs'
                    : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/10'
                }`}
              >
                {pill.label}
              </button>
            );
          })}

          {isFiltered && (
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs text-[#E24B4A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* MY APPLICATIONS STATUS BANNER */}
      {innerTab === 'applied' && (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">verified_user</span>
              Active Job Applications & Real-time Tracking
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
              {jobs.filter(j => j.applied).length} Applied
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your university-verified credentials and cover letter have been submitted directly to the employers. Track status updates below.
          </p>
        </div>
      )}

      {/* JOB LISTINGS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <p className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            {sortedJobs.length} {sortedJobs.length === 1 ? 'Position' : 'Positions'} Found
            {currentPage > 1 && <span className="text-[var(--text-muted)] font-normal lowercase ml-1">(page {currentPage}/{totalPages})</span>}
          </p>
          <div className="flex items-center gap-2">
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border border-[var(--border-color)] transition ${
                    currentPage === 1 ? 'opacity-40 cursor-not-allowed text-[var(--text-secondary)]' : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)] cursor-pointer'
                  }`}
                  title="Previous Page"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page ? 'bg-[#003366] text-white shadow-xs' : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border border-[var(--border-color)] transition ${
                    currentPage === totalPages ? 'opacity-40 cursor-not-allowed text-[var(--text-secondary)]' : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)] cursor-pointer'
                  }`}
                  title="Next Page"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {sortedJobs.length === 0 ? (
          <EmptyState
            icon={<span className="material-symbols-outlined text-5xl text-[var(--text-muted)]">find_in_page</span>}
            title={
              innerTab === 'saved'
                ? 'No Saved Jobs'
                : innerTab === 'applied'
                ? 'No Applications Submitted Yet'
                : 'No matching career listings found'
            }
            description={
              innerTab === 'saved'
                ? 'Save interesting positions using the bookmark icon on any job card.'
                : innerTab === 'applied'
                ? 'Browse available placements and submit your application to track them here.'
                : isFiltered
                ? 'Try adjusting your search keywords, location, or department filters.'
                : 'There are no published openings on the board right now. Saved and applied tabs will fill as employers post roles.'
            }
            action={
              isFiltered ? (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-[#003366] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#002244] transition cursor-pointer"
                >
                  Reset Filters
                </button>
              ) : innerTab !== 'all' ? (
                <button
                  type="button"
                  onClick={() => setInnerTab('all')}
                  className="px-4 py-2 bg-[#003366] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#002244] transition cursor-pointer"
                >
                  Browse all openings
                </button>
              ) : null
            }
          />
        ) : (
          paginatedJobs.map(job => (
            <div
              key={job.id}
              onClick={() => onViewJob(job)}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 hover:shadow-md hover:border-[#003366]/30 transition-all duration-200 cursor-pointer relative group"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 sm:gap-6">
                
                <div className="space-y-3 flex-1 w-full">
                  
                  {/* Top line metadata */}
                  <div className="flex flex-wrap items-center justify-between md:justify-start gap-2 sm:gap-3">
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-[#003366] dark:text-blue-300 text-xs font-bold uppercase rounded-md tracking-wide">
                      {job.type}
                    </span>

                    {job.department && (
                      <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-md border border-amber-200/50">
                        🎓 {job.department}
                      </span>
                    )}

                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      ⏱️ {job.postedDate}
                    </span>

                    {job.applied && (
                      <ApplicationStatusBadge status={job.applicationStatus || 'Applied'} />
                    )}
                    
                    {/* Floating Save Button on Mobile */}
                    <button
                      onClick={(e) => handleToggleSave(e, job.id, job.saved)}
                      className="md:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition text-[var(--text-muted)] hover:text-yellow-500 cursor-pointer"
                    >
                      <span className={`material-symbols-outlined ${job.saved ? 'text-yellow-500 fill-current' : ''}`}>
                        star
                      </span>
                    </button>
                  </div>

                  {/* Title & Company */}
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#003366] to-[#004d99] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {getCompanyInitials(job.company)}
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[#003366] transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-base font-semibold text-[var(--text-secondary)] mt-0.5">
                        <span className="text-[var(--text-primary)] font-bold">{job.company}</span> — <span className="text-sm font-normal text-[var(--text-secondary)]">{job.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Job description */}
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Tech Stack / Requirements Tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] rounded-md text-xs sm:text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {((job.views ?? 0) > 0 || (job.applications ?? 0) > 0 || (job.shortlisted ?? 0) > 0) && (
                    <div className="grid max-w-sm grid-cols-3 gap-2 border-t border-[var(--border-color)] pt-2 text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
                      <div>
                        <span className="text-[var(--text-primary)] font-bold">{job.views}</span> views
                      </div>
                      <div>
                        <span className="text-[var(--text-primary)] font-bold">{job.applications}</span> applicants
                      </div>
                      <div>
                        <span className="font-bold text-emerald-600">{job.shortlisted}</span> shortlisted
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Action Column */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 gap-4 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Monthly Compensation</div>
                    <div className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                      {job.salary}
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-semibold">{job.experience || 'Entry Level'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={(e) => handleShareJob(e, job)}
                      className="p-3 rounded-xl border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 transition text-[var(--text-secondary)] hover:text-[#003366] cursor-pointer"
                      title="Share Job Link"
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">share</span>
                    </button>

                    {/* Desktop Save Star Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSave(e, job.id, job.saved)}
                      className={`p-3 rounded-xl border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer ${
                        job.saved ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'text-[var(--text-muted)] hover:text-amber-500'
                      }`}
                      title={job.saved ? "Remove from saved" : "Save Opportunity"}
                    >
                      <span className={`material-symbols-outlined text-lg sm:text-xl ${job.saved ? 'fill-current' : ''}`}>
                        star
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onViewJob(job);
                      }}
                      className={`px-5 sm:px-6 py-3 text-sm sm:text-base font-bold rounded-xl shadow-xs whitespace-nowrap transition-all cursor-pointer ${
                        job.applied
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-[#003366] text-white hover:bg-[#002244]'
                      }`}
                    >
                      {job.applied ? 'Applied ✓' : 'View & Apply'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
