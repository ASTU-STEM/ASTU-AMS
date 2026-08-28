import React, { useMemo, useState, useCallback } from 'react';
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
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminStatCard from '../components/AdminStatCard';
import { adminService } from '../services/admin.service';

type JobType = 'FULL_TIME' | 'INTERNSHIP' | 'PART_TIME';
type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'ACCEPTED' | 'WITHDRAWN';

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

const applicationRows: ApplicationRecord[] = [];

const jobsPostedData = [
  { month: 'Jan', jobs: 8 },
  { month: 'Feb', jobs: 12 },
  { month: 'Mar', jobs: 15 },
  { month: 'Apr', jobs: 19 },
  { month: 'May', jobs: 24 },
  { month: 'Jun', jobs: 28 },
];

const funnelData = [
  { name: 'Posted', value: 124 },
  { name: 'Applied', value: 96 },
  { name: 'Shortlisted', value: 34 },
  { name: 'Hired', value: 18 },
];

const employerPosts = [
  { name: 'Safaricom', jobs: 18 },
  { name: 'Ethio Telecom', jobs: 16 },
  { name: 'INSA', jobs: 12 },
  { name: 'Huawei', jobs: 10 },
  { name: 'Ethiopian Airlines', jobs: 8 },
  { name: 'CBE', jobs: 7 },
];

const jobStatuses: Array<'All' | JobStatus> = ['All', 'DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'];
const jobTypes: Array<'All' | JobType> = ['All', 'FULL_TIME', 'INTERNSHIP', 'PART_TIME'];

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusClass(status: JobStatus | ApplicationStatus | string) {
  switch (status) {
    case 'PUBLISHED':
    case 'HIRED':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    case 'CLOSED':
    case 'REJECTED':
      return 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15';
    case 'ARCHIVED':
    case 'PENDING':
    case 'REVIEWED':
      return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
    case 'SHORTLISTED':
    case 'INTERVIEW_SCHEDULED':
    case 'OFFERED':
    case 'ACCEPTED':
      return 'bg-[#003580]/10 text-[#003580] border-[#003580]/15';
    case 'DRAFT':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function typeClass(type: JobType | string) {
  switch (type) {
    case 'FULL_TIME':
      return 'bg-[#003580]/10 text-[#003580] border-[#003580]/15';
    case 'INTERNSHIP':
      return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
    case 'PART_TIME':
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
    <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function SmallStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003580]/10 text-[#003580]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default function JobsManagement() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'analytics'>('jobs');
  const [selectedJobStatus, setSelectedJobStatus] = useState<'All' | JobStatus>('All');
  const [selectedEmployer, setSelectedEmployer] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState<'All' | JobType>('All');
  const [selectedApplicantStatus, setSelectedApplicantStatus] = useState<'All' | ApplicationStatus>('All');
  const [query, setQuery] = useState('');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>('PENDING');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobRecord | null>(null);

  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);

  const loadJobs = useCallback(async () => {
    const res = await adminService.getJobs({
      query,
      status: selectedJobStatus === 'All' ? undefined : selectedJobStatus,
    });
    if (res.ok) {
      setJobs(res.data.jobs);
      setTotalJobs(res.data.total);
    }
  }, [query, selectedJobStatus]);

  React.useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const res = await adminService.updateJobStatus(id, newStatus);
    if (res.ok) {
      loadJobs();
    } else {
      alert(res.message);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesEmployer = selectedEmployer === 'All' || job.employer === selectedEmployer;
      const matchesType = selectedJobType === 'All' || job.type === selectedJobType;
      return matchesEmployer && matchesType;
    });
  }, [jobs, selectedEmployer, selectedJobType]);

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

  const employers = ['All', ...Array.from(new Set(jobs.map((job) => job.employer)))];
  const jobSummaryCards = [
    { title: 'Total Jobs', value: `${totalJobs}`, icon: Briefcase, tone: 'blue' as const, trend: 'All listings' },
    { title: 'Applications', value: `${jobs.reduce((a, b) => a + (b.applicants || 0), 0)}`, icon: Users, tone: 'green' as const, trend: 'Combined applications' },
    { title: 'Active Jobs', value: `${jobs.filter(j => j.status === 'PUBLISHED').length}`, icon: Star, tone: 'gold' as const, trend: 'Published jobs' },
    { title: 'Closed Jobs', value: `${jobs.filter(j => j.status === 'CLOSED').length}`, icon: UserCheck, tone: 'purple' as const, trend: 'Finished hiring' },
  ];

  const statusButton = (label: string, isActive: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-[8px] px-4 py-2 text-sm font-semibold transition-colors',
        isActive ? 'bg-[#003580] text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]' : 'text-slate-600 hover:bg-slate-100',
      ].join(' ')}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Jobs Management"
        subtitle="Track employer posts, applications, and hiring outcomes."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Jobs Management' }]}
        actions={
          <button
            type="button"
            onClick={openCreateJob}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add Job
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {jobSummaryCards.map((card) => (
          <AdminStatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            trend={card.trend}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 rounded-[10px] border border-slate-200 bg-white p-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {statusButton('All Jobs', activeTab === 'jobs', () => setActiveTab('jobs'))}
        {statusButton('Applications', activeTab === 'applications', () => setActiveTab('applications'))}
        {statusButton('Analytics', activeTab === 'analytics', () => setActiveTab('analytics'))}
      </div>

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="grid gap-3 xl:grid-cols-12">
              <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-4">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search job title or employer..."
                  className="w-full bg-transparent outline-none placeholder:text-slate-400"
                />
              </label>
              <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select value={selectedJobStatus} onChange={(event) => setSelectedJobStatus(event.target.value as typeof selectedJobStatus)} className="w-full bg-transparent outline-none">
                  {jobStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <select value={selectedEmployer} onChange={(event) => setSelectedEmployer(event.target.value)} className="w-full bg-transparent outline-none">
                  {employers.map((employer) => (
                    <option key={employer} value={employer}>
                      {employer}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-2">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <select value={selectedJobType} onChange={(event) => setSelectedJobType(event.target.value as typeof selectedJobType)} className="w-full bg-transparent outline-none">
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <input type="date" className="w-full bg-transparent outline-none" />
              </div>
            </div>
          </section>

          <SectionCard title="All Jobs" subtitle="Employer job listings and moderation controls.">
            <div className="overflow-hidden rounded-[10px] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Job Title', 'Employer', 'Type', 'Posted Date', 'Deadline', 'Applicants', 'Status', 'Actions'].map((head) => (
                        <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {job.featured && <Pin className="h-4 w-4 text-[#E8A020]" />}
                            <div>
                              <div className="font-semibold text-slate-900">{job.title}</div>
                              <div className="text-xs text-slate-500">{job.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{job.employer}</td>
                        <td className="px-4 py-4">
                          <AdminBadge variant="default" className={typeClass(job.type)}>
                            {job.type}
                          </AdminBadge>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{formatDate(job.postedDate)}</td>
                        <td className="px-4 py-4 text-slate-600">{job.applicants}</td>
                        <td className="px-4 py-4">
                          <AdminBadge variant="success" className={statusClass(job.status)}>
                            {job.status}
                          </AdminBadge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button title="View Details" type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-500 hover:bg-slate-100">
                              <Eye className="h-4 w-4" />
                            </button>
                            {job.status === 'PUBLISHED' ? (
                              <button title="Take Down Job" type="button" onClick={() => handleUpdateStatus(job.id, 'CLOSED')} className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-500 hover:bg-slate-100">
                                <ShieldX className="h-4 w-4" />
                              </button>
                            ) : (
                              <button title="Publish Job" type="button" onClick={() => handleUpdateStatus(job.id, 'PUBLISHED')} className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-green-500 hover:bg-green-50">
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
                            <button title="Delete Job" type="button" onClick={() => handleUpdateStatus(job.id, 'ARCHIVED')} className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-red-500 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
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
        <div className="space-y-4">
          <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="grid gap-3 xl:grid-cols-12">
              <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-4">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search alumni, job title, or employer..."
                  className="w-full bg-transparent outline-none placeholder:text-slate-400"
                />
              </label>
              <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-3">
                <Filter className="h-4 w-4 text-slate-400" />
                <select value={selectedApplicantStatus} onChange={(event) => setSelectedApplicantStatus(event.target.value as typeof selectedApplicantStatus)} className="w-full bg-transparent outline-none">
                  <option value="All">All Statuses</option>
                  {['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN'].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <div className="xl:col-span-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-slate-500">
                  {selectedApplications.length} selected
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={bulkStatus}
                    onChange={(event) => setBulkStatus(event.target.value as ApplicationStatus)}
                    className="rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none"
                  >
                    {['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={bulkUpdate} className="inline-flex items-center gap-2 rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white">
                    <Send className="h-4 w-4" />
                    Bulk Update
                  </button>
                </div>
              </div>
            </div>
          </section>

          <SectionCard title="Applications" subtitle="Track alumni applications and review outcomes.">
            <div className="overflow-hidden rounded-[10px] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="w-12 px-4 py-3 text-left">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#003580]" />
                      </th>
                      {['Applicant (alumni)', 'Job Title', 'Employer', 'Applied Date', 'Status'].map((head) => (
                        <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr key={application.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(application.id)}
                            onChange={() => toggleApplication(application.id)}
                            className="h-4 w-4 rounded border-slate-300 text-[#003580]"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900">{application.applicant}</div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{application.jobTitle}</td>
                        <td className="px-4 py-4 text-slate-600">{application.employer}</td>
                        <td className="px-4 py-4 text-slate-600">{formatDate(application.appliedDate)}</td>
                        <td className="px-4 py-4">
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
        <div className="space-y-4">
          <section className="grid gap-4 xl:grid-cols-3">
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
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
              Save Job
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Job Title">
            <input className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" defaultValue={editingJob?.title ?? ''} />
          </Field>
          <Field label="Employer">
            <input className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" defaultValue={editingJob?.employer ?? ''} />
          </Field>
          <Field label="Type">
            <select className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" defaultValue={editingJob?.type ?? 'Full-time'}>
              {jobTypes.filter((type): type is JobType => type !== 'All').map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Deadline">
            <input type="date" className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]" defaultValue={editingJob?.deadline ?? ''} />
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
    <div className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
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
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}
