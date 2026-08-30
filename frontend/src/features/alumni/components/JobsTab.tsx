import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { JobMatch } from '../types/alumni.types';

interface JobsTabProps {
  jobs: JobMatch[];
  onViewJob: (job: JobMatch) => void;
  onToggleSaveJob: (jobId: number) => void;
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
    'International / Overseas'
  ];

  // Dynamically include any additional location found in the loaded jobs
  const dynamicJobLocations = Array.from(
    new Set(
      jobs
        .map(j => j.location)
        .filter((loc): loc is string => Boolean(loc && loc.trim()))
        .map(loc => loc.trim())
    )
  );

  const allLocationOptions = Array.from(
    new Set([...defaultLocations, ...dynamicJobLocations])
  );

  const formats = ['All', 'Full-Time', 'Internship', 'Contract', 'Part-Time'];

  const handleToggleSave = (e: React.MouseEvent, id: number, saved: boolean) => {
    e.stopPropagation();
    onToggleSaveJob(id);
    toast.success(
      saved ? 'Removed from saved listings.' : 'Listing saved for later review!'
    );
  };

  let tabJobs = jobs;
  if (innerTab === 'saved') tabJobs = jobs.filter(j => j.saved);
  else if (innerTab === 'applied') tabJobs = jobs.filter(j => j.applied);

  const filteredJobs = tabJobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) || false;

    const matchesLocation = (() => {
      if (selectedLocation === 'All') return true;
      if (!job.location) return false;

      const jobLoc = job.location.toLowerCase();
      const selLoc = selectedLocation.toLowerCase();

      if (jobLoc.includes(selLoc) || selLoc.includes(jobLoc)) return true;
      if (selLoc.includes('adama') && (jobLoc.includes('adama') || jobLoc.includes('nazret'))) return true;
      if (selLoc.includes('bishoftu') && (jobLoc.includes('bishoftu') || jobLoc.includes('debre zeit'))) return true;
      if (selLoc.includes('remote') && jobLoc.includes('remote')) return true;
      if (selLoc.includes('hybrid') && jobLoc.includes('hybrid')) return true;

      const cleanSel = selLoc.replace(/\s*\([^)]*\)/g, '').trim();
      if (cleanSel && (jobLoc.includes(cleanSel) || cleanSel.includes(jobLoc))) return true;

      return false;
    })();

    const matchesFormat =
      selectedFormat === 'All' ||
      job.type.toLowerCase().replace(/[^a-z]/g, '').includes(selectedFormat.toLowerCase().replace(/[^a-z]/g, '')) ||
      selectedFormat.toLowerCase().replace(/[^a-z]/g, '').includes(job.type.toLowerCase().replace(/[^a-z]/g, ''));

    return matchesSearch && matchesLocation && matchesFormat;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const parseSalary = (s: string) => parseInt(s.replace(/[^0-9]/g, '')) || 0;
    switch (sortBy) {
      case 'match': return parseInt(b.match) - parseInt(a.match);
      case 'recent': return (b.views || 0) - (a.views || 0);
      case 'salary': return parseSalary(b.salary) - parseSalary(a.salary);
      case 'views': return (b.applications || 0) - (a.applications || 0);
      default: return 0;
    }
  });

  const totalPages = Math.ceil(sortedJobs.length / pageSize);
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const tabConfig = [
    { key: 'all' as const, label: 'Available Placements', icon: 'work' },
    { key: 'saved' as const, label: 'Saved Opportunities', icon: 'star' },
    { key: 'applied' as const, label: 'My Applications', icon: 'task_alt' }
  ];

return (
       <div className="space-y-8 bg-gray-50/50 min-h-screen">
      
      {/* HERO SECTION */}
      <section
        className="rounded-2xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #003366 0%, #001a33 50%, #0d2b4d 100%)'
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-8">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <img
              alt="ASTU Logo"
              className="h-14 w-14 object-contain scale-110 shrink-0"
              src="/images/astu-seal-logo.png"
            />
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFCC00]/20 text-[#FFD700] text-xs font-bold uppercase tracking-widest rounded-full border border-[#FFCC00]/30">
                <span className="w-2 h-2 rounded-full bg-[#FFCC00] animate-pulse"></span>
                ASTU Corporate Careers
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Career Placement Board
              </h2>
              <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
                Discover career openings and internships mapped to your graduating major.
                Apply with your ASTU verified credentials.
              </p>
            </div>
          </div>

          <div className="flex gap-4 self-start md:self-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-center border border-white/10 min-w-[100px]">
              <div className="text-3xl font-extrabold text-[#FFCC00]">
                {filteredJobs.length}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/60">
                Positions
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-center border border-white/10 min-w-[100px]">
              <div className="text-3xl font-extrabold text-white">
                {jobs.filter(j => j.applied).length}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/60">
                Applied
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER TABS */}
      <div className="flex p-1.5 bg-white rounded-xl border border-gray-200 shadow-sm gap-1">
        {tabConfig.map(tab => {
          const isActive = innerTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setInnerTab(tab.key)}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-base md:text-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                isActive
                  ? 'bg-[#003366] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? 'text-[#FFCC00]' : ''}`}>
                {tab.icon}
              </span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* SEARCH & SELECT FILTERS */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search jobs, companies, or skills..."
              className="w-full pl-11 pr-4 py-3 text-base border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-2 lg:flex gap-3">
            <select
              value={selectedLocation}
              onChange={e => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
              className="px-4 py-3 text-base rounded-xl border border-gray-200 bg-white shadow-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none cursor-pointer min-w-[170px]"
            >
              <option value="All">📍 All Locations</option>
              <optgroup label="📍 Ethiopian Cities & Regional Hubs">
                {allLocationOptions
                  .filter(loc => !loc.toLowerCase().includes('remote') && !loc.toLowerCase().includes('hybrid') && !loc.toLowerCase().includes('international'))
                  .map(loc => (
                    <option key={loc} value={loc}>
                      📍 {loc}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="🌐 Work Modes & International">
                {allLocationOptions
                  .filter(loc => loc.toLowerCase().includes('remote') || loc.toLowerCase().includes('hybrid') || loc.toLowerCase().includes('international'))
                  .map(loc => (
                    <option key={loc} value={loc}>
                      {loc.toLowerCase().includes('remote') ? '🌐 ' : loc.toLowerCase().includes('hybrid') ? '🏢 ' : '✈️ '}
                      {loc}
                    </option>
                  ))}
              </optgroup>
            </select>

            <select
              value={selectedFormat}
              onChange={e => { setSelectedFormat(e.target.value); setCurrentPage(1); }}
              className="px-4 py-3 text-base rounded-xl border border-gray-200 bg-white shadow-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none cursor-pointer min-w-[160px]"
            >
              <option value="All">All Formats</option>
              {formats.filter(f => f !== 'All').map(fmt => (
                <option key={fmt} value={fmt}>{fmt}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-3 text-base rounded-xl border border-gray-200 bg-white shadow-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none cursor-pointer min-w-[160px]"
            >
              <option value="match">🎯 Best Match</option>
              <option value="recent">🕐 Most Recent</option>
              <option value="salary">💰 Highest Salary</option>
              <option value="views">👁️ Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* JOB LISTINGS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            {sortedJobs.length} Positions Found
            {currentPage > 1 && <span className="text-gray-400 font-normal lowercase ml-1">(page {currentPage}/{totalPages})</span>}
          </p>
          <div className="flex items-center gap-2">
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'bg-[#003366] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {sortedJobs.length === 0 ? (
          <div className="text-center py-16 bg-white border rounded-2xl shadow-sm">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">
              find_in_page
            </span>
            <p className="text-gray-500 font-medium text-lg">No matching career listings found.</p>
            <p className="text-gray-400 text-sm">Try tweaking your search keywords or filters.</p>
          </div>
        ) : (
          paginatedJobs.map(job => (
            <div
              key={job.id}
              onClick={() => onViewJob(job)}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer relative group"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                <div className="space-y-3 flex-1 w-full">
                  
                  {/* Top line metadata */}
                  <div className="flex items-center justify-between md:justify-start gap-3">
                    <span className="px-2.5 py-1 bg-blue-50 text-[#003366] text-xs font-bold uppercase rounded-md tracking-wide">
                      {job.type}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      ⏱️ {job.postedDate}
                    </span>
                    
                    {/* Floating Save Button on Mobile */}
                    <button
                      onClick={(e) => handleToggleSave(e, job.id, job.saved)}
                      className="md:hidden p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-yellow-500"
                    >
                      <span className={`material-symbols-outlined ${job.saved ? 'text-yellow-500' : ''}`}>
                        star
                      </span>
                    </button>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h4 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-[#003366] transition-colors">
                      {job.title}
                    </h4>
                    <p className="text-lg font-semibold text-gray-600 mt-0.5">
                      {job.company} — <span className="text-base font-normal text-gray-500">{job.location}</span>
                    </p>
                  </div>

                  {/* Job description */}
                  <p className="text-base md:text-lg text-gray-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Metrics & Hiring Analytics Panel */}
                  <div className="grid grid-cols-3 gap-2 max-w-sm pt-2 border-t border-gray-100 text-sm font-medium text-gray-500">
                    <div>👀 <span className="text-gray-800 font-bold">{job.views}</span> Views</div>
                    <div>📝 <span className="text-gray-800 font-bold">{job.applications}</span> Applied</div>
                    <div>🎯 <span className="text-green-600 font-bold">{job.shortlisted}</span> Shortlisted</div>
                  </div>
                </div>

                {/* Desktop Action Column */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 gap-4">
                  <div className="text-left md:text-right">
                    <div className="text-base text-gray-400 font-medium">Est. Monthly Salary</div>
                    <div className="text-xl font-black text-gray-900">{job.salary}</div>
                    <div className="text-sm text-gray-500 font-semibold">{job.experience}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Desktop Save Star Button */}
                    <button
                      onClick={(e) => handleToggleSave(e, job.id, job.saved)}
                      className="hidden md:flex p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-400 hover:text-yellow-500"
                      title={job.saved ? "Remove from saved" : "Save Opportunity"}
                    >
                      <span className={`material-symbols-outlined text-xl ${job.saved ? 'text-yellow-400' : ''}`}>
                        star
                      </span>
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onViewJob(job);
                      }}
                      className={`px-6 py-3 text-base font-bold rounded-xl shadow-sm whitespace-nowrap transition-all ${
                        job.applied
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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