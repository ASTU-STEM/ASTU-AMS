import React, { useMemo, useState, useEffect } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  Download,
  Eye,
  Filter,
  PencilLine,
  Pin,
  Plus,
  Search,
  Send,
  ShieldX,
  Star,
  Trash2,
  UserCheck,
  Users,
  X,
  FileText,
} from 'lucide-react';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import { adminApi } from '../api/adminApi';
import { jobsService } from '../api/jobs.service';

type JobType = 'Full-time' | 'Internship' | 'Part-time';
type JobStatus = 'Open' | 'Closed' | 'Paused' | 'Featured';
type ApplicationStatus = 'Under Review' | 'Shortlisted' | 'Rejected' | 'Hired';

type JobRecord = {
  id: string;
  title: string;
  employer: string;
  type: JobType;
  postedDate: string;
  deadline: string;
  applicants: number;
  status: JobStatus;
  featured?: boolean;
};

type ApplicationRecord = {
  id: string;
  applicant: string;
  jobTitle: string;
  employer: string;
  appliedDate: string;
  status: ApplicationStatus;
};

const jobStatuses: Array<'All' | JobStatus> = ['All', 'Open', 'Closed', 'Paused', 'Featured'];
const jobTypes: Array<'All' | JobType> = ['All', 'Full-time', 'Internship', 'Part-time'];

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusClass(status: JobStatus | ApplicationStatus) {
  switch (status) {
    case 'Open':
    case 'Hired':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    case 'Closed':
    case 'Rejected':
      return 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15';
    case 'Paused':
    case 'Under Review':
      return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
    case 'Shortlisted':
      return 'bg-[#003580]/10 text-[#003580] border-[#003580]/15';
    case 'Featured':
      return 'bg-violet-100 text-violet-700 border-violet-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function typeClass(type: JobType) {
  switch (type) {
    case 'Full-time':
      return 'bg-[#003580]/10 text-[#003580] border-[#003580]/15';
    case 'Internship':
      return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
    case 'Part-time':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function SmallStat({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color?: string }) {
  const iconColor = color || '#003580';
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,51,128,0.15)] hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg" style={{ background: `linear-gradient(135deg, ${iconColor}15 0%, ${iconColor}25 100%)`, color: iconColor }}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function JobsManagement() {
  const [jobRows, setJobRows] = useState<JobRecord[]>([]);
  const [applicationRows, setApplicationRows] = useState<ApplicationRecord[]>([]);
  const [jobsPostedData, setJobsPostedData] = useState<{ month: string; jobs: number }[]>([]);
  const [funnelData, setFunnelData] = useState<{ name: string; value: number }[]>([]);
  const [employerPosts, setEmployerPosts] = useState<{ name: string; jobs: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'analytics'>('jobs');
  const [selectedJobStatus, setSelectedJobStatus] = useState<'All' | JobStatus>('All');
  const [selectedEmployer, setSelectedEmployer] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState<'All' | JobType>('All');
  const [selectedApplicantStatus, setSelectedApplicantStatus] = useState<'All' | ApplicationStatus>('All');
  const [query, setQuery] = useState('');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>('Under Review');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobRecord | null>(null);

  useEffect(() => {
    async function fetchJobsData() {
      try {
        setLoading(true);
        setError(null);
        // Call backend admin jobs list using jobsService
        const response = await jobsService.getJobs();
        const jobs = response.jobs || [];
        
        // Fetch applications for all active jobs in parallel
        const appsPromises = jobs.map((j) => jobsService.getApplications(j.id).catch(() => []));
        const appsResults = await Promise.all(appsPromises);
        const allApplications = appsResults.flat();
        
        const transformedJobs: JobRecord[] = jobs.map((job: any) => {
          let mappedStatus: JobStatus = 'Open';
          const statusUpper = String(job.status).toUpperCase();
          if (statusUpper === 'PUBLISHED' || statusUpper === 'OPEN') mappedStatus = 'Open';
          else if (statusUpper === 'CLOSED') mappedStatus = 'Closed';
          else if (statusUpper === 'DRAFT' || statusUpper === 'PAUSED') mappedStatus = 'Paused';
          else if (statusUpper === 'ARCHIVED') mappedStatus = 'Closed';
          else mappedStatus = 'Open';

          let mappedType: JobType = 'Full-time';
          const typeUpper = String(job.type || job.employmentType).toUpperCase();
          if (typeUpper === 'FULL_TIME') mappedType = 'Full-time';
          else if (typeUpper === 'PART_TIME') mappedType = 'Part-time';
          else if (typeUpper === 'INTERNSHIP') mappedType = 'Internship';
          else mappedType = 'Full-time';

          return {
            id: job.id,
            title: job.title,
            employer: job.employer,
            type: mappedType,
            postedDate: job.postedAt || job.createdAt || new Date().toISOString(),
            deadline: job.deadline,
            applicants: job.applicants || 0,
            status: mappedStatus,
            featured: job.featured || false,
          };
        });

        const transformedApps: ApplicationRecord[] = allApplications.map((app: any) => {
          let mappedStatus: ApplicationStatus = 'Under Review';
          const statusUpper = String(app.status).toUpperCase();
          if (statusUpper === 'PENDING' || statusUpper === 'REVIEWED' || statusUpper === 'UNDER REVIEW' || statusUpper === 'UNDER_REVIEW') mappedStatus = 'Under Review';
          else if (statusUpper === 'SHORTLISTED' || statusUpper === 'INTERVIEW_SCHEDULED' || statusUpper === 'OFFERED') mappedStatus = 'Shortlisted';
          else if (statusUpper === 'HIRED' || statusUpper === 'ACCEPTED') mappedStatus = 'Hired';
          else if (statusUpper === 'REJECTED' || statusUpper === 'WITHDRAWN') mappedStatus = 'Rejected';

          return {
            id: app.id,
            applicant: app.applicantName || app.fullName || 'Alumni',
            jobTitle: app.jobTitle,
            employer: jobs.find((j) => j.id === app.jobId)?.employer || 'Employer',
            appliedDate: app.appliedAt || app.createdAt || new Date().toISOString(),
            status: mappedStatus,
          };
        });

        setJobRows(transformedJobs);
        setApplicationRows(transformedApps);
        
        // Fetch real analytics data
        const analyticsData = await adminApi.getAnalyticsOverview().catch(() => null);
        if (analyticsData) {
          setJobsPostedData(analyticsData.jobsPostedByMonth || []);
          setFunnelData(analyticsData.applicationFunnel || []);
          setEmployerPosts(analyticsData.hiringCompanies || []);
        } else {
          setJobsPostedData([]);
          setFunnelData([]);
          setEmployerPosts([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs data');
      } finally {
        setLoading(false);
      }
    }
    fetchJobsData();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobRows.filter((job) => {
      const matchesQuery = !query || [job.title, job.employer].join(' ').toLowerCase().includes(query.toLowerCase());
      const matchesStatus = selectedJobStatus === 'All' || job.status === selectedJobStatus || (selectedJobStatus === 'Featured' && job.featured);
      const matchesEmployer = selectedEmployer === 'All' || job.employer === selectedEmployer;
      const matchesType = selectedJobType === 'All' || job.type === selectedJobType;
      return matchesQuery && matchesStatus && matchesEmployer && matchesType;
    });
  }, [query, selectedJobStatus, selectedEmployer, selectedJobType]);

  const filteredApplications = useMemo(() => {
    return applicationRows.filter((application) => {
      const matchesQuery = !query || [application.applicant, application.jobTitle, application.employer].join(' ').toLowerCase().includes(query.toLowerCase());
      const matchesStatus = selectedApplicantStatus === 'All' || application.status === selectedApplicantStatus;
      return matchesQuery && matchesStatus;
    });
  }, [query, selectedApplicantStatus]);

  const toggleApplication = (id: string) => {
    setSelectedApplications((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const bulkUpdate = () => {
    setSelectedApplications([]);
  };

  const openCreateJob = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  const openEditJob = (job: JobRecord) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const employers = ['All', ...Array.from(new Set(jobRows.map((job) => job.employer)))];
  const jobSummaryCards = useMemo(() => {
    const activeJobs = jobRows.filter((j) => j.status === 'Open').length;
    const featuredJobs = jobRows.filter((j) => j.featured || j.status === 'Featured').length;
    const totalApplications = applicationRows.length;
    const placedAlumni = applicationRows.filter((a) => a.status === 'Hired').length;
    
    return [
      { label: 'Active Jobs', value: String(activeJobs), icon: Briefcase, color: '#003580', trend: `${jobRows.length} total jobs` },
      { label: 'Applications', value: String(totalApplications), icon: Users, color: '#1D9E75', trend: 'Submitted' },
      { label: 'Featured Jobs', value: String(featuredJobs), icon: Star, color: '#E8A020', trend: 'Pinned to top' },
      { label: 'Placed Alumni', value: String(placedAlumni), icon: UserCheck, color: '#7C3AED', trend: 'Hired status' },
    ];
  }, [jobRows, applicationRows]);

  const statusButton = (label: string, isActive: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300',
        isActive ? 'bg-gradient-to-r from-[#003580] to-[#004499] text-white shadow-[0_4px_12px_rgba(0,51,128,0.25)]' : 'text-slate-600 hover:bg-slate-100',
      ].join(' ')}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Custom Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003580] via-[#004499] to-[#1D9E75] p-8 shadow-[0_8px_30px_rgba(0,51,128,0.3)]">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_0%,transparent_40%,rgba(232,160,32,0.08)_60%,transparent_100%)]" />
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                <FileText className="h-6 w-6 text-[#E8A020]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Jobs Management</h1>
                <p className="mt-1 text-sm text-white/80">
                  Track employer posts, applications, and hiring outcomes.
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreateJob}
            className="inline-flex items-center gap-2.5 rounded-xl bg-white/10 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all hover:bg-white/20 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Job
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {jobSummaryCards.map((card) => (
          <SmallStat
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {statusButton('All Jobs', activeTab === 'jobs', () => setActiveTab('jobs'))}
        {statusButton('Applications', activeTab === 'applications', () => setActiveTab('applications'))}
        {statusButton('Analytics', activeTab === 'analytics', () => setActiveTab('analytics'))}
      </div>

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="grid gap-4 xl:grid-cols-12">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-4 hover:border-slate-300 transition-all">
                <Search className="h-4.5 w-4.5 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search job title or employer..."
                  className="w-full bg-transparent outline-none placeholder:text-slate-400"
                />
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-2 hover:border-slate-300 transition-all">
                <Filter className="h-4.5 w-4.5 text-slate-400" />
                <select value={selectedJobStatus} onChange={(event) => setSelectedJobStatus(event.target.value as typeof selectedJobStatus)} className="w-full bg-transparent outline-none">
                  {jobStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-2 hover:border-slate-300 transition-all">
                <Building2 className="h-4.5 w-4.5 text-slate-400" />
                <select value={selectedEmployer} onChange={(event) => setSelectedEmployer(event.target.value)} className="w-full bg-transparent outline-none">
                  {employers.map((employer) => (
                    <option key={employer} value={employer}>
                      {employer}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-2 hover:border-slate-300 transition-all">
                <Briefcase className="h-4.5 w-4.5 text-slate-400" />
                <select value={selectedJobType} onChange={(event) => setSelectedJobType(event.target.value as typeof selectedJobType)} className="w-full bg-transparent outline-none">
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-2">
                <CalendarDays className="h-4.5 w-4.5 text-slate-400" />
                <input type="date" className="w-full bg-transparent outline-none" />
              </div>
            </div>
          </section>

          <SectionCard title="All Jobs" subtitle="Employer job listings and moderation controls.">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                    <tr>
                      {['Job Title', 'Employer', 'Type', 'Posted Date', 'Deadline', 'Applicants', 'Status', 'Actions'].map((head) => (
                        <th key={head} className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="border-t border-slate-100 hover:bg-slate-50/80 transition-all">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {job.featured && <Pin className="h-4 w-4 text-[#E8A020]" />}
                            <div>
                              <div className="font-semibold text-slate-900">{job.title}</div>
                              <div className="text-xs text-slate-500">{job.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{job.employer}</td>
                        <td className="px-5 py-4">
                          <AdminBadge variant="default" className={typeClass(job.type)}>
                            {job.type}
                          </AdminBadge>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{formatDate(job.postedDate)}</td>
                        <td className="px-5 py-4 text-slate-600">{formatDate(job.deadline)}</td>
                        <td className="px-5 py-4 text-slate-600">{job.applicants}</td>
                        <td className="px-5 py-4">
                          <AdminBadge variant="success" className={statusClass(job.status)}>
                            {job.featured ? 'Featured' : job.status}
                          </AdminBadge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:border-[#003580]/40 hover:bg-[#003580]/5 hover:text-[#003580]">
                              <Eye className="h-4.5 w-4.5" />
                            </button>
                            <button type="button" onClick={() => openEditJob(job)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:border-[#003580]/40 hover:bg-[#003580]/5 hover:text-[#003580]">
                              <PencilLine className="h-4.5 w-4.5" />
                            </button>
                            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:border-[#003580]/40 hover:bg-[#003580]/5 hover:text-[#003580]">
                              <ShieldX className="h-4.5 w-4.5" />
                            </button>
                            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:border-[#003580]/40 hover:bg-[#003580]/5 hover:text-[#003580]">
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-[#E8A020] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:border-[#E8A020]/40 hover:bg-amber-50">
                              <Star className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="grid gap-4 xl:grid-cols-12">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-4 hover:border-slate-300 transition-all">
                <Search className="h-4.5 w-4.5 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search alumni, job title, or employer..."
                  className="w-full bg-transparent outline-none placeholder:text-slate-400"
                />
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-3 hover:border-slate-300 transition-all">
                <Filter className="h-4.5 w-4.5 text-slate-400" />
                <select value={selectedApplicantStatus} onChange={(event) => setSelectedApplicantStatus(event.target.value as typeof selectedApplicantStatus)} className="w-full bg-transparent outline-none">
                  <option value="All">All Statuses</option>
                  {['Under Review', 'Shortlisted', 'Rejected', 'Hired'].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <div className="xl:col-span-5 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-slate-500">
                  {selectedApplications.length} selected
                </div>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={bulkStatus}
                    onChange={(event) => setBulkStatus(event.target.value as ApplicationStatus)}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm outline-none hover:border-slate-300 transition-all"
                  >
                    {['Under Review', 'Shortlisted', 'Rejected', 'Hired'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={bulkUpdate} className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105">
                    <Send className="h-4.5 w-4.5" />
                    Bulk Update
                  </button>
                </div>
              </div>
            </div>
          </section>

          <SectionCard title="Applications" subtitle="Track alumni applications and review outcomes.">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                    <tr>
                      <th className="w-12 px-5 py-4 text-left">
                        <input type="checkbox" className="h-4.5 w-4.5 rounded-lg border-slate-300 text-[#003580]" />
                      </th>
                      {['Applicant (alumni)', 'Job Title', 'Employer', 'Applied Date', 'Status'].map((head) => (
                        <th key={head} className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr key={application.id} className="border-t border-slate-100 hover:bg-slate-50/80 transition-all">
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(application.id)}
                            onChange={() => toggleApplication(application.id)}
                            className="h-4.5 w-4.5 rounded-lg border-slate-300 text-[#003580]"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">{application.applicant}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{application.jobTitle}</td>
                        <td className="px-5 py-4 text-slate-600">{application.employer}</td>
                        <td className="px-5 py-4 text-slate-600">{formatDate(application.appliedDate)}</td>
                        <td className="px-5 py-4">
                          <AdminBadge variant="default" className={statusClass(application.status)}>
                            {application.status}
                          </AdminBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <section className="grid gap-8 xl:grid-cols-3">
            <ChartCard title="Jobs Posted Per Month" subtitle="Monthly posting volume across the last 6 months.">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobsPostedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#003580" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Application Funnel" subtitle="Posted → Applied → Shortlisted → Hired">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      {funnelData.map((entry, index) => (
                        <Cell key={entry.name} fill={['#003580', '#5B7FB8', '#E8A020', '#1D9E75'][index]} />
                      ))}
                      <LabelList position="right" fill="#334155" stroke="none" dataKey="name" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Top Employers by Job Postings" subtitle="Employers contributing the most listings.">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employerPosts} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#E8A020" radius={[0, 8, 8, 0]}>
                      <LabelList dataKey="jobs" position="right" fill="#334155" fontSize={11} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </section>
        </div>
      )}

      <AdminModal
        open={modalOpen}
        title={editingJob ? 'Edit Job' : 'Add Job'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200/80 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button type="button" className="rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105">
              Save Job
            </button>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Job Title">
            <input className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" defaultValue={editingJob?.title ?? ''} />
          </Field>
          <Field label="Employer">
            <input className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" defaultValue={editingJob?.employer ?? ''} />
          </Field>
          <Field label="Type">
            <select className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" defaultValue={editingJob?.type ?? 'Full-time'}>
              {jobTypes.filter((type): type is JobType => type !== 'All').map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Deadline">
            <input type="date" className="w-full rounded-xl border border-slate-200/80 px-4 py-3 outline-none focus:border-[#003580] transition-all" defaultValue={editingJob?.deadline ?? ''} />
          </Field>
        </div>
      </AdminModal>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <div className="mb-5">
        <h4 className="text-base font-bold text-slate-900">{title}</h4>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}
