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
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Interview Scheduled':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Applied':
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // 1. Filter jobs by inner sub-tabs
  let tabJobs = jobs;
  if (innerTab === 'saved') {
    tabJobs = jobs.filter(j => j.saved);
  } else if (innerTab === 'applied') {
    tabJobs = jobs.filter(j => j.applied);
  }

  // 2. Filter jobs by search and drop-downs
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

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <section className="bg-gradient-to-r from-emerald-900 via-teal-900 to-astu-navy rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="max-w-3xl relative z-10 space-y-4">
          <span className="px-3 py-1 bg-white/15 text-[#FFD700] text-xs font-bold uppercase tracking-wider rounded-full">ASTU Corporate Careers</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">AI-Powered Career Placement Board 💼</h2>
          <p className="text-md opacity-90 leading-relaxed">
            Discover corporate career openings and internship opportunities mapped directly to your graduating major and verified skill-set. Apply in one click using your ASTU verified credentials.
          </p>
        </div>
      </section>

      {/* Sub-navigation Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setInnerTab('all')}
          className={`pb-4 px-2 font-bold text-sm tracking-wide transition-all border-b-2 flex items-center gap-1.5 ${
            innerTab === 'all' 
              ? 'border-astu-green text-astu-green' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-lg">work</span>
          Available Placements
        </button>
        <button
          onClick={() => setInnerTab('saved')}
          className={`pb-4 px-2 font-bold text-sm tracking-wide transition-all border-b-2 flex items-center gap-1.5 ${
            innerTab === 'saved' 
              ? 'border-astu-green text-astu-green' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-lg">star</span>
          Saved Opportunities
        </button>
        <button
          onClick={() => setInnerTab('applied')}
          className={`pb-4 px-2 font-bold text-sm tracking-wide transition-all border-b-2 flex items-center gap-1.5 ${
            innerTab === 'applied' 
              ? 'border-astu-green text-astu-green' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-lg">task_alt</span>
          My Application Tracking
        </button>
      </div>

      {/* Search and Filters panel (Hide on Applied tab if not necessary, but useful always) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, key skills, or corporate partners..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-green/20 focus:border-astu-green focus:bg-white transition-all"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-green/20 focus:border-astu-green focus:bg-white transition-all"
            >
              <option value="All">All Locations</option>
              {locations.filter(l => l !== 'All').map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-astu-green/20 focus:border-astu-green focus:bg-white transition-all"
            >
              <option value="All">All Formats</option>
              {formats.filter(f => f !== 'All').map(fmt => (
                <option key={fmt} value={fmt}>{fmt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-gray-500">{filteredJobs.length} Positions Found</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onViewJob(job)}
              className="p-6 bg-white border border-gray-200/60 rounded-3xl hover:shadow-md hover:border-astu-green/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-astu-green transition-colors">{job.title}</h4>
                      <p className="text-sm font-bold text-astu-navy">{job.company}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded ${
                        job.type === 'Internship' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {job.type}
                      </span>
                      <span className="px-2.5 py-0.5 bg-astu-green/10 text-astu-green text-[10px] font-extrabold rounded flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px] font-bold">bolt</span>
                        {job.match} AI Match
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(e, job.id, job.saved)}
                        className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 flex items-center ${
                          job.saved ? 'text-amber-500' : 'text-gray-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">{job.saved ? 'star' : 'star_border'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{job.description}</p>

                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base font-bold">location_on</span>
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base font-bold">paid</span>
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base font-bold">schedule</span>
                      {job.postedDate}
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col items-stretch justify-center gap-3 w-full md:w-auto">
                  {innerTab === 'applied' ? (
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase">Application Status</span>
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getApplicationStatusBadge(job.applicationStatus || 'Applied')}`}>
                        {job.applicationStatus || 'Applied'}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewJob(job);
                      }}
                      className={`px-6 py-3 rounded-xl text-xs font-extrabold tracking-wide transition-all text-center ${
                        job.applied 
                          ? 'bg-blue-50 border border-blue-200 text-blue-600' 
                          : 'bg-astu-navy hover:bg-astu-navy/90 text-white shadow-sm'
                      }`}
                    >
                      {job.applied ? 'Applied' : 'View & Apply'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="bg-white border border-gray-200/60 rounded-3xl p-12 text-center text-gray-500 italic">
              {innerTab === 'saved' 
                ? 'You have not saved any career listings yet. Star jobs to review them here.'
                : innerTab === 'applied'
                  ? 'No applications tracked yet. Start applying to partner roles!'
                  : 'No jobs match your selected filters.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
