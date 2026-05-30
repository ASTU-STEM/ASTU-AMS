import React, { useState } from 'react';
import { JobMatch } from '../types/alumni.types';
import toast from 'react-hot-toast';

interface JobsTabProps {
  jobs: JobMatch[];
  onViewJob: (job: JobMatch) => void;
  onToggleSaveJob: (jobId: number) => void;
}

export const JobsTab: React.FC<JobsTabProps> = ({ jobs, onViewJob, onToggleSaveJob }) => {
  const [innerTab, setInnerTab] = useState<'all' | 'saved' | 'applied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');

  const locations = ['All', 'Addis Ababa', 'Remote'];
  const formats = ['All', 'Full-Time', 'Internship', 'Contract'];

  const handleToggleSave = (e: React.MouseEvent, id: number, saved: boolean) => {
    e.stopPropagation();
    onToggleSaveJob(id);
    toast.success(saved ? 'Removed from saved listings.' : 'Listing saved for later review!');
  };

  const getApplicationStatusBadge = (status?: string) => {
    switch (status) {
      case 'Offered':
        return 'bg-[#1D9E75]/10 text-[#1D9E75] border border-[#1D9E75]/20';
      case 'Interview Scheduled':
        return 'bg-[#003366]/10 text-[#003366] border border-[#003366]/20';
      case 'Under Review':
        return 'bg-[#FFCC00]/10 text-[#92400E] border border-[#FFCC00]/30';
      case 'Applied':
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  let tabJobs = jobs;
  if (innerTab === 'saved') {
    tabJobs = jobs.filter(j => j.saved);
  } else if (innerTab === 'applied') {
    tabJobs = jobs.filter(j => j.applied);
  }

  const filteredJobs = tabJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      selectedLocation === 'All' ||
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesFormat =
      selectedFormat === 'All' ||
      job.type === selectedFormat;

    return matchesSearch && matchesLocation && matchesFormat;
  });

  const tabConfig = [
    { key: 'all' as const, label: 'Available Placements', icon: 'work' },
    { key: 'saved' as const, label: 'Saved Opportunities', icon: 'star' },
    { key: 'applied' as const, label: 'My Applications', icon: 'task_alt' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Hero Banner with ASTU Branding ── */}
      <section
        className="rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #001a33 50%, #0d2b4d 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCC00]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              alt="ASTU Logo"
              className="h-14 w-14 object-contain rounded-xl bg-white/10 p-1.5 border border-white/20 shadow-md flex-shrink-0"
              src="/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg"
            />
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FFCC00]/20 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#FFCC00]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
                ASTU Corporate Careers
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Career Placement Board
              </h2>
              <p className="text-sm text-white/70 leading-relaxed max-w-xl">
                Discover career openings and internships mapped to your graduating major.
                Apply with your ASTU verified credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center">
              <div className="text-2xl font-extrabold text-[#FFCC00]">{filteredJobs.length}</div>
              <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Positions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 text-center">
              <div className="text-2xl font-extrabold text-white">{jobs.filter(j => j.applied).length}</div>
              <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Applied</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sub-navigation Tabs ── */}
      <div className="flex gap-1 border-b border-gray-200 bg-gray-50/50 rounded-xl p-1">
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setInnerTab(tab.key)}
            className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 ${
              innerTab === tab.key
                ? 'bg-white text-[#003366] shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Search and Filters ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/60">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, skills, or company..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] focus:bg-white transition-all"
            />
          </div>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full md:w-44 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] focus:bg-white transition-all"
          >
            <option value="All">All Locations</option>
            {locations.filter(l => l !== 'All').map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full md:w-44 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] focus:bg-white transition-all"
          >
            <option value="All">All Formats</option>
            {formats.filter(f => f !== 'All').map(fmt => (
              <option key={fmt} value={fmt}>{fmt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Job Cards ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{filteredJobs.length} Positions Found</p>
        </div>

        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onViewJob(job)}
              className="bg-white border border-gray-200/60 rounded-2xl p-5 hover:shadow-md hover:border-[#003366]/15 transition-all duration-200 group cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 group-hover:text-[#003366] transition-colors">{job.title}</h4>
                      <p className="text-xs font-bold text-[#003366]">{job.company}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md ${
                        job.type === 'Internship'
                          ? 'bg-[#FFCC00]/15 text-[#92400E]'
                          : 'bg-[#003366]/10 text-[#003366]'
                      }`}>
                        {job.type}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#1D9E75]/10 text-[#1D9E75] text-[10px] font-extrabold rounded-md">
                        <span className="material-symbols-outlined text-[11px] font-bold">bolt</span>
                        {job.match} Match
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(e, job.id, job.saved)}
                        className={`p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ${
                          job.saved ? 'text-[#FFCC00]' : 'text-gray-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">{job.saved ? 'star' : 'star_border'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{job.description}</p>

                  <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">paid</span>
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {job.postedDate}
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col items-stretch justify-center gap-2 w-full md:w-auto">
                  {innerTab === 'applied' ? (
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase">Status</span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${getApplicationStatusBadge(job.applicationStatus || 'Applied')}`}>
                        {job.applicationStatus || 'Applied'}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewJob(job);
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all text-center ${
                        job.applied
                          ? 'bg-[#003366]/5 border border-[#003366]/20 text-[#003366]'
                          : 'text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                      style={!job.applied ? { background: 'linear-gradient(135deg, #003366, #001a33)' } : undefined}
                    >
                      {job.applied ? 'Applied ✓' : 'View & Apply'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="text-center py-12 px-6 rounded-2xl bg-gray-50 border border-gray-200/60">
              <div className="text-4xl mb-3 opacity-30">💼</div>
              <p className="text-sm font-semibold text-gray-600">
                {innerTab === 'saved'
                  ? 'No saved listings yet. Star jobs to review them here.'
                  : innerTab === 'applied'
                    ? 'No applications tracked yet. Start applying to roles!'
                    : 'No jobs match your selected filters.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};