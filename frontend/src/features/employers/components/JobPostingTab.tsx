import React, { useState } from 'react';
import { CandidateApplication, EmployerJob } from '../types/employer.types';
import { employerService } from '../services/employer.service';
import toast from 'react-hot-toast';

interface JobPostingTabProps {
  jobs: EmployerJob[];
  onPostJob: (job: Omit<EmployerJob, 'id' | 'applicationsCount' | 'shortlistedCount' | 'viewsCount' | 'postedDate'>) => Promise<EmployerJob | void> | void;
  onToggleJobStatus: (jobId: number) => void;
  onUpdateJob: (job: EmployerJob) => void;
  onDeleteJob: (jobId: number) => void;
  darkMode: boolean;
}

export const JobPostingTab: React.FC<JobPostingTabProps> = ({ jobs, onPostJob, onToggleJobStatus, onUpdateJob, onDeleteJob, darkMode }) => {
  const [isPosting, setIsPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Open' | 'Closed'>('all');
  const [formData, setFormData] = useState({
    title: '',
    type: 'Full-Time' as EmployerJob['type'],
    location: '',
    salaryRange: '30,001 - 60,000 ETB/mo',
    experienceRequired: '1-3 years',
    description: '',
    skillsInput: ''
  });

  // AI Recommendation Modals state
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [recommendedAlumni, setRecommendedAlumni] = useState<CandidateApplication[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<CandidateApplication | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = formData.skillsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

    if (isEditing && editingJobId !== null) {
      const originalJob = jobs.find(job => job.id === editingJobId);
      const updatedJob: EmployerJob = {
        id: editingJobId,
        title: formData.title,
        type: formData.type,
        location: formData.location,
        salaryRange: formData.salaryRange,
        experienceRequired: formData.experienceRequired,
        description: formData.description,
        skillsRequired: skills,
        status: originalJob?.status || 'Open',
        applicationsCount: originalJob?.applicationsCount || 0,
        shortlistedCount: originalJob?.shortlistedCount || 0,
        viewsCount: originalJob?.viewsCount || 0,
        postedDate: originalJob?.postedDate || ''
      };
      await onUpdateJob(updatedJob);
      setIsEditing(false);
      setEditingJobId(null);
    } else {
      const createdJob = await onPostJob({
        title: formData.title,
        type: formData.type,
        location: formData.location,
        salaryRange: formData.salaryRange,
        experienceRequired: formData.experienceRequired,
        description: formData.description,
        skillsRequired: skills,
        status: 'Open'
      });
      
      // If job creation returned recommendations, display them
      if (createdJob && createdJob.recommendations && createdJob.recommendations.length > 0) {
        setRecommendedAlumni(createdJob.recommendations);
        setShowRecommendationModal(true);
      }
    }

    setIsPosting(false);
    setFormData({ title: '', type: 'Full-Time', location: '', salaryRange: '30,001 - 60,000 ETB/mo', experienceRequired: '1-3 years', description: '', skillsInput: '' });
  };

  const handleSendMessage = async () => {
    if (!selectedAlumni || !messageText.trim()) return;
    setIsSendingMessage(true);
    try {
      await employerService.sendDirectMessage(selectedAlumni.id.toString(), messageText);
      toast.success(`Message sent to ${selectedAlumni.alumnusName}`);
      setMessageText('');
      setSelectedAlumni(null); // Go back to recommendation list
    } catch (err: any) {
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const populateFormForEdit = (job: EmployerJob) => {
    setIsEditing(true);
    setIsPosting(true);
    setEditingJobId(job.id);
    setFormData({
      title: job.title,
      type: job.type,
      location: job.location,
      salaryRange: job.salaryRange,
      experienceRequired: job.experienceRequired,
      description: job.description,
      skillsInput: job.skillsRequired.join(', ')
    });
  };

  const filteredJobs = activeFilter === 'all' ? jobs : jobs.filter(j => j.status === activeFilter);
  const openCount = jobs.filter(j => j.status === 'Open').length;
  const closedCount = jobs.filter(j => j.status === 'Closed').length;

  const inputClass = "w-full text-xs p-3 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] focus:bg-[var(--bg-card)] transition-all duration-200 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]";
  const labelClass = "text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.15em]";

  const TYPE_COLORS: Record<string, string> = {
    'Full-Time': 'bg-blue-50 text-blue-700 border-blue-200',
    'Internship': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Contract': 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003366] via-[#004080] to-[#006633] opacity-95"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFD700]/8 rounded-full translate-y-1/3 -translate-x-1/4"></div>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-2.5 py-1 bg-white/15 text-[#FFD700] text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-full backdrop-blur-sm">
              Recruitment
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {isEditing ? 'Edit Job Listing' : 'Job Scaffolder'}
            </h2>
            <p className="text-sm text-white/80 max-w-lg">
              {isEditing ? 'Modify existing job posting details and requirements.' : 'Create, manage, and track your career postings for ASTU graduates.'}
            </p>
          </div>
          <button
            onClick={() => { setIsPosting(!isPosting); if (isEditing) { setIsEditing(false); setEditingJobId(null); } }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 border border-white/15 shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {isPosting ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />}
            </svg>
            {isPosting ? 'Close Form' : 'New Job'}
          </button>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Jobs', value: jobs.length, icon: 'work', color: 'blue' },
          { label: 'Open Positions', value: openCount, icon: 'check_circle', color: 'emerald' },
          { label: 'Closed', value: closedCount, icon: 'lock', color: 'gray' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="material-symbols-outlined text-base">{stat.icon}</span>
              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                stat.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>{stat.label}</span>
            </div>
            <p className="text-xl font-extrabold text-[var(--text-primary)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Job Posting Form */}
      {isPosting && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#004d99] flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">
                {isEditing ? 'Edit Job Details' : 'Create New Job Listing'}
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold">Fill in the details to attract top ASTU talent</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Job Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} className={inputClass} placeholder="e.g. Senior Frontend Developer" required />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Job Type</label>
                <select value={formData.type} onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as EmployerJob['type'] }))} className={inputClass}>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} className={inputClass} placeholder="e.g. Addis Ababa (Hybrid)" required />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Salary Range</label>
                <select value={formData.salaryRange} onChange={e => setFormData(prev => ({ ...prev, salaryRange: e.target.value }))} className={inputClass}>
                  <option value="Under 15,000 ETB/mo">Under 15,000 ETB/mo</option>
                  <option value="15,000 - 30,000 ETB/mo">15,000 - 30,000 ETB/mo</option>
                  <option value="30,001 - 60,000 ETB/mo">30,001 - 60,000 ETB/mo</option>
                  <option value="60,001 - 100,000 ETB/mo">60,001 - 100,000 ETB/mo</option>
                  <option value="Over 100,000 ETB/mo">Over 100,000 ETB/mo</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Experience Level</label>
                <select value={formData.experienceRequired} onChange={e => setFormData(prev => ({ ...prev, experienceRequired: e.target.value }))} className={inputClass}>
                  <option value="Entry Level (0-1 years)">Entry Level (0-1 yrs)</option>
                  <option value="Junior (1-3 years)">Junior (1-3 yrs)</option>
                  <option value="Mid-Level (3-5 years)">Mid-Level (3-5 yrs)</option>
                  <option value="Senior (5+ years)">Senior (5+ yrs)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Required Skills (comma separated)</label>
              <input type="text" value={formData.skillsInput} onChange={e => setFormData(prev => ({ ...prev, skillsInput: e.target.value }))} className={inputClass} placeholder="e.g. React, TypeScript, Node.js, SQL" required />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Job Description & Responsibilities</label>
              <textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} className={`${inputClass} h-28 resize-none`} placeholder="Describe candidate expectations, duties, and project frameworks..." required />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setIsPosting(false); setIsEditing(false); setEditingJobId(null); setFormData({ title: '', type: 'Full-Time', location: '', salaryRange: '30,001 - 60,000 ETB/mo', experienceRequired: '1-3 years', description: '', skillsInput: '' }); }}
                className="flex-1 py-3 border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] transition-all"
              >
                Cancel
              </button>
              <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-[#003366] to-[#004d99] hover:from-[#00264d] hover:to-[#003366] text-white rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-lg">
                {isEditing ? 'Update Listing' : 'Publish Job'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all' as const, label: 'All Jobs', count: jobs.length },
          { id: 'Open' as const, label: 'Open', count: openCount },
          { id: 'Closed' as const, label: 'Closed', count: closedCount },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
              activeFilter === f.id
                ? 'bg-[#003366] text-white shadow-md'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[#003366]/30'
            }`}
          >
            {f.label}
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
              activeFilter === f.id ? 'bg-white/20' : 'bg-[var(--bg-page)]'
            }`}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.map(job => (
          <div key={job.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            {/* Job Header */}
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">{job.title}</h4>
                        <span className={`px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-full border ${
                          job.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>{job.status}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] font-medium">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {job.experienceRequired}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${TYPE_COLORS[job.type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] font-medium whitespace-nowrap">{job.postedDate}</span>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">{job.description}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {job.skillsRequired.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-md text-[10px] font-bold text-[var(--text-secondary)]">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-2 border-t border-[var(--border-color)]">
                    <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-medium">
                      <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      {job.viewsCount} views
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-medium">
                      <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {job.applicationsCount} applications
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-medium">
                      <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {job.shortlistedCount} shortlisted
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-medium">
                      <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {job.salaryRange}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Action Bar */}
            <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--bg-page)]/50 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => populateFormForEdit(job)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-[10px] font-bold text-[var(--text-primary)] hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this job listing?')) {
                    // No toast here: the parent reports success or failure after
                    // the request resolves.
                    onDeleteJob(job.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-[10px] font-bold text-[var(--text-primary)] hover:border-red-300 hover:text-red-600 transition-all"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
              <button
                onClick={() => { onToggleJobStatus(job.id); }}
                className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  job.status === 'Open'
                    ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {job.status === 'Open' ? (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    Close
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Reopen
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-16 text-center">
            <span className="material-symbols-outlined text-4xl block mb-3">work</span>
            <p className="text-xs font-bold text-[var(--text-secondary)]">No {activeFilter !== 'all' ? activeFilter.toLowerCase() : ''} job listings found</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Create your first job posting to start receiving applications</p>
          </div>
        )}
      </div>

      {/* Recommendation Modal */}
      {showRecommendationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin">
            <button onClick={() => {setShowRecommendationModal(false); setSelectedAlumni(null);}} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-page)] rounded-full p-1 border border-[var(--border-color)] transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            {!selectedAlumni ? (
              <>
                <div className="mb-6 pr-6">
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#E24B4A]">psychology</span>
                    AI Candidate Recommendations
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">We found {recommendedAlumni.length} alumni whose skills match your new job posting.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {recommendedAlumni.map(alumni => (
                    <div key={alumni.id} onClick={() => setSelectedAlumni(alumni)} className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl p-4 cursor-pointer hover:border-[#003366] hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#003366] to-[#004d99] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                             {alumni.alumnusName.charAt(0).toUpperCase()}
                           </div>
                           <div>
                             <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[#003366]">{alumni.alumnusName}</h4>
                             <p className="text-xs text-[var(--text-secondary)]">{alumni.department}</p>
                           </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {alumni.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-white/50 dark:bg-black/20 border border-[var(--border-color)] rounded-md text-[9px] font-bold text-[var(--text-secondary)]">
                            {skill}
                          </span>
                        ))}
                        {alumni.skills.length > 3 && <span className="px-2 py-0.5 text-[9px] font-bold text-[var(--text-muted)]">+{alumni.skills.length - 3}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
                  <button onClick={() => setSelectedAlumni(null)} className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[#003366] transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)]">Contact {selectedAlumni.alumnusName}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Direct Message / Interview Invite</p>
                  </div>
                </div>
                
                <div className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl p-5 mb-5 flex items-start gap-4 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#003366] to-[#004d99] flex items-center justify-center text-white font-bold text-2xl shadow-md shrink-0">
                    {selectedAlumni.alumnusName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[var(--text-primary)]">{selectedAlumni.alumnusName}</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{selectedAlumni.department} • Class of {selectedAlumni.graduationYear}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedAlumni.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded text-[10px] font-bold text-[var(--text-primary)]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Message</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full text-sm p-4 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:outline-none focus:border-[#003366] min-h-[120px] resize-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    placeholder={`Hi ${selectedAlumni.alumnusName},\n\nWe saw your impressive profile and think you'd be a great fit for our new opening...`}
                  ></textarea>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setSelectedAlumni(null)} className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] transition-all">
                      Back
                    </button>
                    <button onClick={handleSendMessage} disabled={isSendingMessage || !messageText.trim()} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#003366] to-[#004d99] hover:from-[#00264d] hover:to-[#003366] text-white text-sm font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2">
                      {isSendingMessage ? 'Sending...' : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};