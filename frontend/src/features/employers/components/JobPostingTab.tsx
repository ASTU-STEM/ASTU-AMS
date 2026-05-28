import React, { useState } from 'react';
import { EmployerJob } from '../types/employer.types';
import toast from 'react-hot-toast';

interface JobPostingTabProps {
  jobs: EmployerJob[];
  onPostJob: (job: Omit<EmployerJob, 'id' | 'applicationsCount' | 'shortlistedCount' | 'viewsCount' | 'postedDate'>) => void;
  onToggleJobStatus: (jobId: number) => void;
  darkMode: boolean;
}

export const JobPostingTab: React.FC<JobPostingTabProps> = ({ jobs, onPostJob, onToggleJobStatus, darkMode }) => {
  const [isPosting, setIsPosting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Full-Time' as EmployerJob['type'],
    location: '',
    salaryRange: '30,001 - 60,000 ETB/mo',
    experienceRequired: '1-3 years',
    description: '',
    skillsInput: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = formData.skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    onPostJob({
      title: formData.title,
      type: formData.type,
      location: formData.location,
      salaryRange: formData.salaryRange,
      experienceRequired: formData.experienceRequired,
      description: formData.description,
      skillsRequired: skills,
      status: 'Open'
    });

    setIsPosting(false);
    setFormData({
      title: '',
      type: 'Full-Time',
      location: '',
      salaryRange: '30,001 - 60,000 ETB/mo',
      experienceRequired: '1-3 years',
      description: '',
      skillsInput: ''
    });
    toast.success('New job listing posted successfully!');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Job Posting Scaffolder</h3>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Create, close, and manage active career postings</p>
        </div>
        <button
          onClick={() => setIsPosting(!isPosting)}
          className="px-6 py-2.5 bg-gradient-to-r from-astu-red to-red-600 text-white font-bold rounded-xl hover:scale-105 shadow-md transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined">{isPosting ? 'close' : 'add'}</span>
          {isPosting ? 'Close Form' : 'Post New Job'}
        </button>
      </div>

      {/* Dynamic Job Posting Form */}
      {isPosting && (
        <form 
          onSubmit={handleSubmit}
          className={`p-6 border rounded-3xl shadow-sm transition-all duration-300 space-y-6 max-w-3xl mx-auto ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200/60 text-gray-900'
          }`}
        >
          <h4 className="text-lg font-bold border-b pb-2">Enter Job Details</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full text-sm p-3 rounded-xl border focus:outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'
                }`}
                placeholder="e.g. Senior Frontend React Developer"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider">Job Format / Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as EmployerJob['type'] }))}
                className={`w-full text-sm p-3 rounded-xl border focus:outline-none font-semibold ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <option value="Full-Time">Full-Time Placement</option>
                <option value="Internship">Internship Placement</option>
                <option value="Contract">Contract Placement</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className={`w-full text-sm p-3 rounded-xl border focus:outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'
                }`}
                placeholder="e.g. Addis Ababa (Hybrid) or Remote"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider">Salary Range Bracket</label>
              <select
                value={formData.salaryRange}
                onChange={e => setFormData(prev => ({ ...prev, salaryRange: e.target.value }))}
                className={`w-full text-sm p-3 rounded-xl border focus:outline-none font-semibold ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <option value="Under 15,000 ETB/mo">Under 15,000 ETB/mo</option>
                <option value="15,000 - 30,000 ETB/mo">15,000 - 30,000 ETB/mo</option>
                <option value="30,001 - 60,000 ETB/mo">30,001 - 60,000 ETB/mo</option>
                <option value="60,001 - 100,000 ETB/mo">60,001 - 100,000 ETB/mo</option>
                <option value="Over 100,000 ETB/mo">Over 100,000 ETB/mo</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider">Experience Level</label>
              <select
                value={formData.experienceRequired}
                onChange={e => setFormData(prev => ({ ...prev, experienceRequired: e.target.value }))}
                className={`w-full text-sm p-3 rounded-xl border focus:outline-none font-semibold ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <option value="Entry Level (0-1 years)">Entry Level (0-1 years)</option>
                <option value="Junior (1-3 years)">Junior (1-3 years)</option>
                <option value="Mid-Level (3-5 years)">Mid-Level (3-5 years)</option>
                <option value="Senior (5+ years)">Senior (5+ years)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider">Required Skills (Comma separated)</label>
            <input
              type="text"
              value={formData.skillsInput}
              onChange={e => setFormData(prev => ({ ...prev, skillsInput: e.target.value }))}
              className={`w-full text-sm p-3 rounded-xl border focus:outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'
              }`}
              placeholder="e.g. React, TypeScript, Node.js, SQL"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider">Job Description & Responsibilities</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full text-sm p-3 rounded-xl border focus:outline-none h-32 resize-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'
              }`}
              placeholder="Describe candidate expectations, duties, and project frameworks..."
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsPosting(false)}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-astu-navy text-white rounded-xl font-bold transition-all shadow-md"
            >
              Post Career Opening
            </button>
          </div>
        </form>
      )}

      {/* Jobs list grid */}
      <div className="grid grid-cols-1 gap-4">
        {jobs.map(job => (
          <div
            key={job.id}
            className={`p-6 border rounded-3xl shadow-sm transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              darkMode ? 'bg-slate-900 border-slate-800 text-white hover:border-slate-700' : 'bg-white border-gray-200/60 text-gray-900 hover:border-gray-300'
            }`}
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold group-hover:text-astu-red transition-colors">{job.title}</h4>
                  <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded inline-block mt-1 ${
                    job.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <div className="text-right text-xs text-gray-500 font-semibold">
                  Posted {job.postedDate}
                </div>
              </div>

              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'} line-clamp-2`}>
                {job.description}
              </p>

              {/* Stats and skills */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  {job.viewsCount} views
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">description</span>
                  {job.applicationsCount} applications
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {job.shortlistedCount} shortlisted
                </span>
              </div>
            </div>

            {/* Toggle Status action */}
            <div className="flex md:flex-col gap-2">
              <button
                onClick={() => {
                  onToggleJobStatus(job.id);
                  toast.success(`Job status changed to: ${job.status === 'Open' ? 'Closed' : 'Open'}`);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  job.status === 'Open' 
                    ? 'bg-red-50 border border-red-200 text-astu-red hover:bg-red-100' 
                    : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                }`}
              >
                {job.status === 'Open' ? 'Close Job' : 'Re-open'}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
