import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
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
  Layers,
  Mail,
  MessageSquare,
  PencilLine,
  Pin,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  ShieldX,
  SlidersHorizontal,
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
import toast from 'react-hot-toast';

type JobType = 'FULL_TIME' | 'INTERNSHIP' | 'PART_TIME';
type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'ACCEPTED' | 'WITHDRAWN';
type PostingSource = 'All' | 'ASTU_ADMIN' | 'EXTERNAL';

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
  email?: string;
  phone?: string;
  department?: string;
  graduationYear?: string;
  cgpa?: string;
  skills?: string[];
  bio?: string;
  coverLetter?: string;
  resumeUrl?: string;
  linkedIn?: string;
  gitHub?: string;
  portfolio?: string;
  jobTitle: string;
  employer: string;
  appliedDate: string;
  status: ApplicationStatus;
  isSelfPosted?: boolean;
};

const UPLOAD_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

function getFullUrl(url?: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${UPLOAD_BASE}${url}`;
  return `${UPLOAD_BASE}/${url}`;
}

const jobStatuses: Array<'All' | JobStatus> = ['All', 'DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'];
const jobTypes: Array<'All' | JobType> = ['All', 'FULL_TIME', 'INTERNSHIP', 'PART_TIME'];

function formatDate(dateValue: string) {
  if (!dateValue || dateValue === 'Open') return 'Open';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return dateValue;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateValue;
  }
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
    <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function JobsManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCms = location.pathname.startsWith('/cms');
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'analytics'>('jobs');
  const [selectedJobStatus, setSelectedJobStatus] = useState<'All' | JobStatus>('All');
  const [selectedEmployer, setSelectedEmployer] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState<'All' | JobType>('All');
  const [selectedApplicantStatus, setSelectedApplicantStatus] = useState<'All' | ApplicationStatus>('All');
  const [selectedSource, setSelectedSource] = useState<PostingSource>('All');
  const [query, setQuery] = useState('');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>('PENDING');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobRecord | null>(null);
  const [selectedAppModal, setSelectedAppModal] = useState<ApplicationRecord | null>(null);

  // Pagination States for Jobs & Applications
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsLimit, setJobsLimit] = useState<'10' | '25' | '50' | '100' | 'all'>('10');
  const [appsPage, setAppsPage] = useState(1);
  const [appsLimit, setAppsLimit] = useState<'10' | '25' | '50' | '100' | 'all'>('10');

  // Messaging state
  const [messagingApp, setMessagingApp] = useState<ApplicationRecord | null>(null);
  const [msgTitle, setMsgTitle] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgSending, setMsgSending] = useState(false);

  // Dynamic Backend States
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0,
    closedJobs: 0,
  });

  const [applicationRows, setApplicationRows] = useState<ApplicationRecord[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // Analytics Dynamic States
  const [jobsPostedData, setJobsPostedData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [employerPosts, setEmployerPosts] = useState<any[]>([]);
  const [hiredAnalytics, setHiredAnalytics] = useState<{
    totalHired: number;
    jobBoardHired: number;
    nonJobBoardHired: number;
    astuHired: number;
    externalHired: number;
    astuJobBoardHired: number;
    externalJobBoardHired: number;
    hiredChannelData: any[];
    hiredEmployerData: any[];
  }>({
    totalHired: 0,
    jobBoardHired: 0,
    nonJobBoardHired: 0,
    astuHired: 0,
    externalHired: 0,
    astuJobBoardHired: 0,
    externalJobBoardHired: 0,
    hiredChannelData: [
      { name: 'System Job Board Hired', value: 0, fill: '#003580' },
      { name: 'External / Direct Hired', value: 0, fill: '#1D9E75' },
    ],
    hiredEmployerData: [
      { name: 'External Corporate Hires', value: 0, fill: '#E8A020' },
      { name: 'University (ASTU) Hires', value: 0, fill: '#003580' },
    ]
  });

  // Modal Form Inputs
  const [formTitle, setFormTitle] = useState('');
  const [formEmployer, setFormEmployer] = useState('');
  const [formType, setFormType] = useState<JobType>('FULL_TIME');
  const [formLocation, setFormLocation] = useState('');
  const [formSalary, setFormSalary] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  const isEmployerSelfPosted = useCallback((employerName?: string) => {
    const emp = (employerName || '').toLowerCase();
    return emp.includes('astu') || emp.includes('adama science') || emp.includes('university') || emp.includes('super admin');
  }, []);

  const loadJobs = useCallback(async () => {
    const res = await adminService.getJobs({
      query,
      status: selectedJobStatus === 'All' ? undefined : selectedJobStatus,
    });
    if (res.ok && res.data) {
      setJobs(res.data.jobs || []);
      setTotalJobs(res.data.total || 0);
      if (res.data.stats) {
        setStats({
          totalJobs: res.data.stats.totalJobs || res.data.total || 0,
          totalApplications: res.data.stats.totalApplications || 0,
          activeJobs: res.data.stats.activeJobs || 0,
          closedJobs: res.data.stats.closedJobs || 0,
        });
      }
    }
  }, [query, selectedJobStatus]);

  const loadApplications = useCallback(async () => {
    setAppsLoading(true);
    const res = await adminService.getJobApplications({
      query,
      status: selectedApplicantStatus === 'All' ? undefined : selectedApplicantStatus,
    });
    if (res.ok && res.data) {
      setApplicationRows(res.data.applications || []);
    }
    setAppsLoading(false);
  }, [query, selectedApplicantStatus]);

  const loadAnalytics = useCallback(async () => {
    const res = await adminService.getJobAnalytics();
    if (res.ok && res.data) {
      setJobsPostedData(res.data.jobsPostedData || []);
      setFunnelData(res.data.funnelData || []);
      setEmployerPosts(res.data.employerPosts || []);
      if (res.data.hiredAnalytics) {
        setHiredAnalytics(res.data.hiredAnalytics);
      }
    }
  }, []);

  useEffect(() => {
    loadJobs();
    loadAnalytics();
  }, [loadJobs, loadAnalytics]);

  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, loadApplications, loadAnalytics]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const res = await adminService.updateJobStatus(id, newStatus);
    if (res.ok) {
      toast.success(`Job status updated to ${newStatus}`);
      loadJobs();
    } else {
      toast.error(res.message || 'Failed to update job status');
    }
  };

  const handleSaveJob = async () => {
    if (!formTitle.trim()) {
      toast.error('Please enter a job title');
      return;
    }
    setFormSaving(true);
    try {
      if (editingJob) {
        const res = await adminService.updateJob(editingJob.id, {
          title: formTitle,
          employer: formEmployer,
          type: formType,
          location: formLocation,
          salary: formSalary,
          deadline: formDeadline,
          description: formDescription,
        });
        if (res.ok) {
          toast.success('Job listing updated successfully!');
          setModalOpen(false);
          loadJobs();
        } else {
          toast.error(res.message || 'Failed to update job listing');
        }
      } else {
        const res = await adminService.createJob({
          title: formTitle,
          employer: formEmployer || 'ASTU University (Super Admin)',
          type: formType,
          location: formLocation || 'Adama, Ethiopia (ASTU Main Campus)',
          salary: formSalary || 'Competitive / Scale',
          deadline: formDeadline,
          description: formDescription,
        });
        if (res.ok) {
          toast.success('New job listing published live!');
          setModalOpen(false);
          loadJobs();
        } else {
          toast.error(res.message || 'Failed to create job listing');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred saving the job');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    const res = await adminService.deleteJob(id);
    if (res.ok) {
      toast.success('Job listing deleted successfully');
      loadJobs();
    } else {
      toast.error(res.message || 'Failed to delete job listing');
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesQuery = !query || [job.title, job.employer].join(' ').toLowerCase().includes(query.toLowerCase());
      const matchesStatus = selectedJobStatus === 'All' || job.status === selectedJobStatus;
      const matchesEmployer = selectedEmployer === 'All' || job.employer === selectedEmployer;
      const matchesType = selectedJobType === 'All' || job.type === selectedJobType;
      const selfPosted = isEmployerSelfPosted(job.employer);
      const matchesSource =
        selectedSource === 'All' ||
        (selectedSource === 'ASTU_ADMIN' && selfPosted) ||
        (selectedSource === 'EXTERNAL' && !selfPosted);
      return matchesQuery && matchesStatus && matchesEmployer && matchesType && matchesSource;
    });
  }, [jobs, query, selectedJobStatus, selectedEmployer, selectedJobType, selectedSource, isEmployerSelfPosted]);

  const filteredApplications = useMemo(() => {
    return applicationRows.filter((application) => {
      const matchesQuery = !query || [application.applicant, application.jobTitle, application.employer, application.email || ''].join(' ').toLowerCase().includes(query.toLowerCase());
      const matchesStatus = selectedApplicantStatus === 'All' || application.status === selectedApplicantStatus;
      const selfPosted = isEmployerSelfPosted(application.employer);
      const matchesSource =
        selectedSource === 'All' ||
        (selectedSource === 'ASTU_ADMIN' && selfPosted) ||
        (selectedSource === 'EXTERNAL' && !selfPosted);
      return matchesQuery && matchesStatus && matchesSource;
    });
  }, [applicationRows, query, selectedApplicantStatus, selectedSource, isEmployerSelfPosted]);

  useEffect(() => {
    setJobsPage(1);
  }, [query, selectedJobStatus, selectedEmployer, selectedJobType, selectedSource]);

  useEffect(() => {
    setAppsPage(1);
  }, [query, selectedApplicantStatus, selectedSource]);

  const paginatedJobs = useMemo(() => {
    if (jobsLimit === 'all') return filteredJobs;
    const limitNum = parseInt(jobsLimit, 10);
    const start = (jobsPage - 1) * limitNum;
    return filteredJobs.slice(start, start + limitNum);
  }, [filteredJobs, jobsPage, jobsLimit]);

  const totalJobPages = useMemo(() => {
    if (jobsLimit === 'all') return 1;
    const limitNum = parseInt(jobsLimit, 10);
    return Math.ceil(filteredJobs.length / limitNum) || 1;
  }, [filteredJobs.length, jobsLimit]);

  const paginatedApplications = useMemo(() => {
    if (appsLimit === 'all') return filteredApplications;
    const limitNum = parseInt(appsLimit, 10);
    const start = (appsPage - 1) * limitNum;
    return filteredApplications.slice(start, start + limitNum);
  }, [filteredApplications, appsPage, appsLimit]);

  const totalAppPages = useMemo(() => {
    if (appsLimit === 'all') return 1;
    const limitNum = parseInt(appsLimit, 10);
    return Math.ceil(filteredApplications.length / limitNum) || 1;
  }, [filteredApplications.length, appsLimit]);

  const jobSourceCounts = useMemo(() => {
    const astu = jobs.filter(j => isEmployerSelfPosted(j.employer)).length;
    const external = jobs.filter(j => !isEmployerSelfPosted(j.employer)).length;
    return { all: jobs.length, astu, external };
  }, [jobs, isEmployerSelfPosted]);

  const appSourceCounts = useMemo(() => {
    const astu = applicationRows.filter(a => isEmployerSelfPosted(a.employer)).length;
    const external = applicationRows.filter(a => !isEmployerSelfPosted(a.employer)).length;
    return { all: applicationRows.length, astu, external };
  }, [applicationRows, isEmployerSelfPosted]);

  const hasActiveJobFilters = Boolean(query || selectedJobStatus !== 'All' || selectedEmployer !== 'All' || selectedJobType !== 'All' || selectedSource !== 'All');
  const hasActiveAppFilters = Boolean(query || selectedApplicantStatus !== 'All' || selectedSource !== 'All');

  const resetJobFilters = () => {
    setQuery('');
    setSelectedJobStatus('All');
    setSelectedEmployer('All');
    setSelectedJobType('All');
    setSelectedSource('All');
  };

  const resetAppFilters = () => {
    setQuery('');
    setSelectedApplicantStatus('All');
    setSelectedSource('All');
  };

  const isAppSelfPosted = useCallback((app: ApplicationRecord) => {
    if (typeof app.isSelfPosted === 'boolean') return app.isSelfPosted;
    return isEmployerSelfPosted(app.employer);
  }, [isEmployerSelfPosted]);

  const selectableApplications = useMemo(() => {
    return filteredApplications.filter(isAppSelfPosted);
  }, [filteredApplications, isAppSelfPosted]);

  const toggleApplication = (id: string) => {
    setSelectedApplications((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleSelectAllApplications = () => {
    if (selectableApplications.length > 0 && selectedApplications.length === selectableApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(selectableApplications.map((app) => app.id));
    }
  };

  const bulkUpdate = async () => {
    if (selectedApplications.length === 0) {
      toast.error('Please select at least one application');
      return;
    }
    const res = await adminService.bulkUpdateApplicationStatus(selectedApplications, bulkStatus);
    if (res.ok) {
      toast.success(`Successfully updated ${selectedApplications.length} application(s) to ${bulkStatus}`);
      setSelectedApplications([]);
      loadApplications();
    } else {
      toast.error(res.message || 'Failed to bulk update application status');
    }
  };

  const handleSingleAppStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    const res = await adminService.updateApplicationStatus(id, newStatus);
    if (res.ok) {
      toast.success(`Application status updated to ${newStatus}`);
      loadApplications();
    } else {
      toast.error(res.message || 'Failed to update application status');
    }
  };

  const handleOpenChatWithAlumni = (app: ApplicationRecord) => {
    const target = {
      name: app.applicant,
      email: app.email || '',
      userId: app.id,
      role: 'ALUMNI',
      roleLabel: 'ASTU Alumni Candidate',
      department: `Candidate for ${app.jobTitle} (${app.employer})`,
    };

    toast.success(`Opening ASTU_AMS Hub chat with ${app.applicant}...`);
    navigate(`/admin/messages?name=${encodeURIComponent(app.applicant)}&email=${encodeURIComponent(app.email || '')}&jobTitle=${encodeURIComponent(app.jobTitle)}`, {
      state: { target }
    });
  };

  const openCreateJob = () => {
    setEditingJob(null);
    setFormTitle('');
    setFormEmployer('');
    setFormType('FULL_TIME');
    setFormLocation('');
    setFormSalary('');
    setFormDeadline('');
    setFormDescription('');
    setModalOpen(true);
  };

  const openEditJob = (job: JobRecord) => {
    setEditingJob(job);
    setFormTitle(job.title);
    setFormEmployer(job.employer);
    setFormType(job.type);
    setFormLocation('Adama, Ethiopia (ASTU Main Campus)');
    setFormSalary('Competitive / Scale');
    setFormDeadline(job.deadline || '');
    setFormDescription(`${job.title} listing by ${job.employer}`);
    setModalOpen(true);
  };

  const realTotalJobs = useMemo(() => {
    return Math.max(stats.totalJobs || 0, totalJobs || 0, jobs.length || 0);
  }, [stats.totalJobs, totalJobs, jobs.length]);

  const realActiveJobs = useMemo(() => {
    const publishedInJobs = jobs.filter(j => j.status === 'PUBLISHED' || (j.status as string) === 'Open').length;
    return Math.max(stats.activeJobs || 0, publishedInJobs);
  }, [stats.activeJobs, jobs]);

  const realClosedJobs = useMemo(() => {
    const closedInJobs = jobs.filter(j => j.status === 'CLOSED' || (j.status as string) === 'Closed').length;
    return Math.max(stats.closedJobs || 0, closedInJobs);
  }, [stats.closedJobs, jobs]);

  const realTotalApps = useMemo(() => {
    const appsInJobs = jobs.reduce((sum, j) => sum + (j.applicants || 0), 0);
    return Math.max(stats.totalApplications || 0, appsInJobs, applicationRows.length);
  }, [stats.totalApplications, jobs, applicationRows.length]);

  const employers = ['All', ...Array.from(new Set(jobs.map((job) => job.employer)))];
  const jobSummaryCards = [
    { title: 'Total Jobs', value: `${realTotalJobs}`, icon: Briefcase, tone: 'blue' as const, trend: 'All listings' },
    { title: 'Applications', value: `${realTotalApps}`, icon: Users, tone: 'green' as const, trend: 'Combined applications' },
    { title: 'Active Jobs', value: `${realActiveJobs}`, icon: Star, tone: 'gold' as const, trend: 'Published jobs' },
    { title: 'Total Hired Alumni', value: `${hiredAnalytics.totalHired}`, icon: UserCheck, tone: 'purple' as const, trend: `${hiredAnalytics.jobBoardHired} Job Board • ${hiredAnalytics.nonJobBoardHired} External` },
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
        breadcrumbs={isCms ? [{ label: 'Alumni Office' }, { label: 'Jobs & Careers' }] : [{ label: 'Admin' }, { label: 'Jobs Management' }]}
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

      <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {statusButton('All Jobs', activeTab === 'jobs', () => setActiveTab('jobs'))}
        {statusButton('Applications', activeTab === 'applications', () => setActiveTab('applications'))}
        {statusButton('Analytics', activeTab === 'analytics', () => setActiveTab('analytics'))}
      </div>

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {/* Modern Source Segment Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#003580]" /> Filter By Source:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSource('All')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSource === 'All'
                    ? 'bg-[#003580] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>All Listings</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSource === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {jobSourceCounts.all}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSource('ASTU_ADMIN')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSource === 'ASTU_ADMIN'
                    ? 'bg-[#003580] text-white shadow-sm'
                    : 'bg-blue-50 text-[#003580] hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <span>🎓 ASTU / Super Admin</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSource === 'ASTU_ADMIN' ? 'bg-white/20 text-white' : 'bg-blue-200 text-[#003580]'}`}>
                  {jobSourceCounts.astu}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSource('EXTERNAL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSource === 'EXTERNAL'
                    ? 'bg-[#003580] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>🏢 External Employers</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSource === 'EXTERNAL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {jobSourceCounts.external}
                </span>
              </button>
            </div>

            {hasActiveJobFilters && (
              <button
                type="button"
                onClick={resetJobFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            )}
          </div>

          {/* Detailed Filters Controls Toolbar */}
          <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-3">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
              <label className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)]/50 px-3 py-2 text-sm xl:col-span-4 focus-within:border-[#003580] focus-within:bg-white transition-all shadow-inner">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search job title, description, or company..."
                  className="w-full bg-transparent outline-none placeholder:text-slate-400 text-slate-800"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)]/50 px-3 py-2 text-sm xl:col-span-2 focus-within:border-[#003580] focus-within:bg-white transition-all">
                <ShieldCheck className="h-4 w-4 text-[#003580]" />
                <select value={selectedJobStatus} onChange={(event) => setSelectedJobStatus(event.target.value as typeof selectedJobStatus)} className="w-full bg-transparent outline-none text-slate-700 font-medium">
                  {jobStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'All' ? 'All Statuses' : status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)]/50 px-3 py-2 text-sm xl:col-span-3 focus-within:border-[#003580] focus-within:bg-white transition-all">
                <Building2 className="h-4 w-4 text-slate-500" />
                <select value={selectedEmployer} onChange={(event) => setSelectedEmployer(event.target.value)} className="w-full bg-transparent outline-none text-slate-700 font-medium">
                  {employers.map((employer) => (
                    <option key={employer} value={employer}>
                      {employer === 'All' ? 'All Employers' : employer}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)]/50 px-3 py-2 text-sm xl:col-span-3 focus-within:border-[#003580] focus-within:bg-white transition-all">
                <Briefcase className="h-4 w-4 text-slate-500" />
                <select value={selectedJobType} onChange={(event) => setSelectedJobType(event.target.value as typeof selectedJobType)} className="w-full bg-transparent outline-none text-slate-700 font-medium">
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'All' ? 'All Job Types' : type}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Active Filter Tags */}
            {hasActiveJobFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Active filters:</span>
                {selectedSource !== 'All' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 font-semibold text-[#003580] border border-blue-100">
                    Source: {selectedSource === 'ASTU_ADMIN' ? '🎓 ASTU / Admin' : '🏢 External'}
                    <button type="button" onClick={() => setSelectedSource('All')} className="hover:text-rose-600"><X className="h-3 w-3" /></button>
                  </span>
                )}
                {selectedJobStatus !== 'All' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 font-semibold text-amber-800 border border-amber-200">
                    Status: {selectedJobStatus}
                    <button type="button" onClick={() => setSelectedJobStatus('All')} className="hover:text-rose-600"><X className="h-3 w-3" /></button>
                  </span>
                )}
                {selectedEmployer !== 'All' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700 border border-slate-200">
                    Employer: {selectedEmployer}
                    <button type="button" onClick={() => setSelectedEmployer('All')} className="hover:text-rose-600"><X className="h-3 w-3" /></button>
                  </span>
                )}
                {selectedJobType !== 'All' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-800 border border-emerald-200">
                    Type: {selectedJobType}
                    <button type="button" onClick={() => setSelectedJobType('All')} className="hover:text-rose-600"><X className="h-3 w-3" /></button>
                  </span>
                )}
                {query && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 font-semibold text-indigo-700 border border-indigo-100">
                    Search: "{query}"
                    <button type="button" onClick={() => setQuery('')} className="hover:text-rose-600"><X className="h-3 w-3" /></button>
                  </span>
                )}
              </div>
            )}
          </section>

          <SectionCard
            title="All Jobs"
            subtitle={`Showing ${filteredJobs.length} of ${jobs.length} employer job listings.`}
          >
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="text-slate-500 font-medium">
                Showing {filteredJobs.length > 0 ? (jobsLimit === 'all' ? 1 : (jobsPage - 1) * parseInt(jobsLimit) + 1) : 0} to{' '}
                {jobsLimit === 'all' ? filteredJobs.length : Math.min(jobsPage * parseInt(jobsLimit), filteredJobs.length)} of {filteredJobs.length} jobs
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Per Page:</span>
                <select
                  value={jobsLimit}
                  onChange={(e) => {
                    setJobsLimit(e.target.value as any);
                    setJobsPage(1);
                  }}
                  className="rounded-md border border-[var(--border-color)] bg-[var(--bg-page)] px-2 py-1 text-xs font-bold text-[#003580] outline-none"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                  <option value="all">All ({filteredJobs.length} jobs)</option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-[10px] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Job Title', 'Employer & Source', 'Type', 'Posted Date', 'Deadline', 'Applicants', 'Status', 'Actions'].map((head) => (
                        <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedJobs.map((job) => {
                      const selfPosted = isEmployerSelfPosted(job.employer);
                      return (
                        <tr key={job.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {job.featured && <Pin className="h-4 w-4 text-[#E8A020]" />}
                              <div>
                                <div className="font-semibold text-slate-900">{job.title}</div>
                                <div className="text-xs text-slate-500 font-mono">{job.id.substring(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-900">{job.employer}</div>
                            {selfPosted ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#003580] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mt-1">
                                🎓 ASTU Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mt-1">
                                🏢 External Partner
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <AdminBadge variant="default" className={typeClass(job.type)}>
                              {job.type}
                            </AdminBadge>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{formatDate(job.postedDate)}</td>
                          <td className="px-4 py-4 text-slate-600">{formatDate(job.deadline)}</td>
                          <td className="px-4 py-4 font-bold text-slate-800">{job.applicants}</td>
                          <td className="px-4 py-4">
                            <AdminBadge variant="success" className={statusClass(job.status)}>
                              {job.status}
                            </AdminBadge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button title="Edit Job" type="button" onClick={() => openEditJob(job)} className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-500 hover:bg-slate-100">
                                <PencilLine className="h-4 w-4" />
                              </button>
                              {job.status === 'PUBLISHED' ? (
                                <button title="Close Job Listing" type="button" onClick={() => handleUpdateStatus(job.id, 'CLOSED')} className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-500 hover:bg-slate-100">
                                  <ShieldX className="h-4 w-4" />
                                </button>
                              ) : (
                                <button title="Publish Job Listing" type="button" onClick={() => handleUpdateStatus(job.id, 'PUBLISHED')} className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-green-500 hover:bg-green-50">
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              )}
                              <button title="Delete Job" type="button" onClick={() => handleDeleteJob(job.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-red-500 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedJobs.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 italic">No job listings found matching active filter options.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Jobs Table Pagination Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs font-medium text-slate-600">
                <div>
                  Showing <span className="font-bold text-slate-900">{filteredJobs.length > 0 ? (jobsLimit === 'all' ? 1 : (jobsPage - 1) * parseInt(jobsLimit) + 1) : 0}</span> to{' '}
                  <span className="font-bold text-slate-900">{jobsLimit === 'all' ? filteredJobs.length : Math.min(jobsPage * parseInt(jobsLimit), filteredJobs.length)}</span> of{' '}
                  <span className="font-bold text-slate-900">{filteredJobs.length}</span> listings
                </div>
                {jobsLimit !== 'all' && totalJobPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={jobsPage === 1}
                      onClick={() => setJobsPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <span className="px-2 font-bold text-slate-800">
                      Page {jobsPage} of {totalJobPages}
                    </span>
                    <button
                      type="button"
                      disabled={jobsPage >= totalJobPages}
                      onClick={() => setJobsPage((p) => Math.min(totalJobPages, p + 1))}
                      className="px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Modern Source Segment Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#003580]" /> Filter By Job Owner:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSource('All')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSource === 'All'
                    ? 'bg-[#003580] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>All Applications</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSource === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {appSourceCounts.all}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSource('ASTU_ADMIN')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSource === 'ASTU_ADMIN'
                    ? 'bg-[#003580] text-white shadow-sm'
                    : 'bg-blue-50 text-[#003580] hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <span>🎓 ASTU / Admin Jobs</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSource === 'ASTU_ADMIN' ? 'bg-white/20 text-white' : 'bg-blue-200 text-[#003580]'}`}>
                  {appSourceCounts.astu}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSource('EXTERNAL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSource === 'EXTERNAL'
                    ? 'bg-[#003580] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>🏢 External Employer Jobs</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSource === 'EXTERNAL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {appSourceCounts.external}
                </span>
              </button>
            </div>

            {hasActiveAppFilters && (
              <button
                type="button"
                onClick={resetAppFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            )}
          </div>

          {/* Detailed Applications Filter Controls Toolbar */}
          <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-3">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
              <label className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)]/50 px-3 py-2 text-sm xl:col-span-5 focus-within:border-[#003580] focus-within:bg-white transition-all shadow-inner">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search alumni name, job title, or company..."
                  className="w-full bg-transparent outline-none placeholder:text-slate-400 text-slate-800"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)]/50 px-3 py-2 text-sm xl:col-span-3 focus-within:border-[#003580] focus-within:bg-white transition-all">
                <Filter className="h-4 w-4 text-slate-400" />
                <select value={selectedApplicantStatus} onChange={(event) => setSelectedApplicantStatus(event.target.value as typeof selectedApplicantStatus)} className="w-full bg-transparent outline-none text-slate-700 font-medium">
                  <option value="All">All Candidate Statuses</option>
                  {['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN'].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <div className="xl:col-span-4 flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 px-2">
                  {selectedApplications.length} selected
                </span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={bulkStatus}
                    onChange={(event) => setBulkStatus(event.target.value as ApplicationStatus)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none"
                  >
                    {['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={bulkUpdate} className="inline-flex items-center gap-1.5 rounded-md bg-[#003580] px-3 py-1 text-xs font-semibold text-white shadow-sm hover:brightness-110">
                    <Send className="h-3.5 w-3.5" />
                    Bulk Update
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {hasActiveAppFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Active filters:</span>
                {selectedSource !== 'All' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 font-semibold text-[#003580] border border-blue-100">
                    Owner: {selectedSource === 'ASTU_ADMIN' ? '🎓 ASTU / Admin Jobs' : '🏢 External Jobs'}
                    <button type="button" onClick={() => setSelectedSource('All')} className="hover:text-rose-600"><X className="h-3 w-3" /></button>
                  </span>
                )}
                {selectedApplicantStatus !== 'All' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 font-semibold text-indigo-700 border border-indigo-100">
                    Status: {selectedApplicantStatus}
                    <button type="button" onClick={() => setSelectedApplicantStatus('All')} className="hover:text-rose-600"><X className="h-3 w-3" /></button>
                  </span>
                )}
                {query && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700 border border-slate-200">
                    Search: "{query}"
                    <button type="button" onClick={() => setQuery('')} className="hover:text-rose-600"><X className="h-3 w-3" /></button>
                  </span>
                )}
              </div>
            )}
          </section>

          <SectionCard title="Applications" subtitle={`Showing ${filteredApplications.length} of ${applicationRows.length} applicant reviews.`}>
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="text-slate-500 font-medium">
                Showing {filteredApplications.length > 0 ? (appsLimit === 'all' ? 1 : (appsPage - 1) * parseInt(appsLimit) + 1) : 0} to{' '}
                {appsLimit === 'all' ? filteredApplications.length : Math.min(appsPage * parseInt(appsLimit), filteredApplications.length)} of {filteredApplications.length} applications
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Per Page:</span>
                <select
                  value={appsLimit}
                  onChange={(e) => {
                    setAppsLimit(e.target.value as any);
                    setAppsPage(1);
                  }}
                  className="rounded-md border border-[var(--border-color)] bg-[var(--bg-page)] px-2 py-1 text-xs font-bold text-[#003580] outline-none"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                  <option value="all">All ({filteredApplications.length} applications)</option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-[10px] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="w-12 px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectableApplications.length > 0 && selectedApplications.length === selectableApplications.length}
                          onChange={toggleSelectAllApplications}
                          className="h-4 w-4 rounded border-slate-300 text-[#003580]"
                        />
                      </th>
                      {['Applicant (alumni)', 'Job Title', 'Employer & Source', 'Applied Date', 'Status', 'Actions'].map((head) => (
                        <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedApplications.map((application) => {
                      const selfPosted = isAppSelfPosted(application);
                      return (
                        <tr key={application.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              disabled={!selfPosted}
                              title={selfPosted ? 'Select for bulk update' : 'Only ASTU / Super Admin job applications can be bulk updated by admin'}
                              checked={selectedApplications.includes(application.id)}
                              onChange={() => toggleApplication(application.id)}
                              className="h-4 w-4 rounded border-slate-300 text-[#003580] disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => setSelectedAppModal(application)}
                              className="font-bold text-[#003580] hover:underline text-left block"
                            >
                              {application.applicant}
                            </button>
                            <span className="text-[10px] text-slate-400 block font-mono">{application.email || 'alumni@astu.edu.et'}</span>
                          </td>
                          <td className="px-4 py-4 text-slate-700 font-semibold">{application.jobTitle}</td>
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-800">{application.employer}</div>
                            {selfPosted ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#003580] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mt-1">
                                🎓 ASTU Official
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mt-1">
                                🏢 External Partner
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-slate-600">{formatDate(application.appliedDate)}</td>
                          <td className="px-4 py-4">
                            <AdminBadge variant="default" className={statusClass(application.status)}>
                              {application.status}
                            </AdminBadge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title="View Application Details & Cover Letter"
                                onClick={() => setSelectedAppModal(application)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] text-slate-600 hover:bg-slate-100 hover:text-[#003580] shadow-sm transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                title="Open Chat in ASTU_AMS Hub"
                                onClick={() => handleOpenChatWithAlumni(application)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] text-[#003580] hover:bg-blue-50 shadow-sm transition-colors"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </button>
                              {selfPosted ? (
                                <select
                                  value={application.status}
                                  onChange={(e) => handleSingleAppStatusChange(application.id, e.target.value as ApplicationStatus)}
                                  className="rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#003580]"
                                >
                                  {['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN'].map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium italic">
                                  Employer Managed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredApplications.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 italic">No application records found matching active filter options.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Applications Table Pagination Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs font-medium text-slate-600">
                <div>
                  Showing <span className="font-bold text-slate-900">{filteredApplications.length > 0 ? (appsLimit === 'all' ? 1 : (appsPage - 1) * parseInt(appsLimit) + 1) : 0}</span> to{' '}
                  <span className="font-bold text-slate-900">{appsLimit === 'all' ? filteredApplications.length : Math.min(appsPage * parseInt(appsLimit), filteredApplications.length)}</span> of{' '}
                  <span className="font-bold text-slate-900">{filteredApplications.length}</span> applications
                </div>
                {appsLimit !== 'all' && totalAppPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={appsPage === 1}
                      onClick={() => setAppsPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <span className="px-2 font-bold text-slate-800">
                      Page {appsPage} of {totalAppPages}
                    </span>
                    <button
                      type="button"
                      disabled={appsPage >= totalAppPages}
                      onClick={() => setAppsPage((p) => Math.min(totalAppPages, p + 1))}
                      className="px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Detailed Hired Alumni Placement Breakdown */}
          <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                  Alumni Hiring & Placement Breakdown
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real database tracking of total hired alumni separated by placement origin and employer category.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  Total Hired Alumni: {hiredAnalytics.totalHired}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {/* Card 1: System Job Board Hired */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800">System Job Board Hired</span>
                  <span className="text-2xl font-black text-[#003580]">{hiredAnalytics.jobBoardHired}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Alumni hired directly through ASTU-AMS platform job board applications.
                </p>
                <div className="pt-2 text-[10px] font-bold text-blue-900 border-t border-blue-100 flex items-center justify-between">
                  <span>University: {hiredAnalytics.astuJobBoardHired}</span>
                  <span>External: {hiredAnalytics.externalJobBoardHired}</span>
                </div>
              </div>

              {/* Card 2: Non-Job Board / Direct Hired */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Non-Job Board Hired</span>
                  <span className="text-2xl font-black text-emerald-700">{hiredAnalytics.nonJobBoardHired}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Employed alumni reported via tracer surveys & profile updates.
                </p>
                <div className="pt-2 text-[10px] font-bold text-emerald-900 border-t border-emerald-100">
                  Direct / Off-Platform Placements
                </div>
              </div>

              {/* Card 3: External Employer Hires */}
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">External Employer Hires</span>
                  <span className="text-2xl font-black text-amber-700">{hiredAnalytics.externalHired}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Hired by external corporate partners (Safaricom, INSA, etc.).
                </p>
                <div className="pt-2 text-[10px] font-bold text-amber-900 border-t border-amber-100">
                  Corporate & Industry Hires
                </div>
              </div>

              {/* Card 4: University / Admin Hires */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">University (ASTU) Hires</span>
                  <span className="text-2xl font-black text-indigo-700">{hiredAnalytics.astuHired}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Hired for internal ASTU campus openings & academic staff.
                </p>
                <div className="pt-2 text-[10px] font-bold text-indigo-900 border-t border-indigo-100">
                  Internal Campus Placements
                </div>
              </div>
            </div>

            {/* Visual Breakdown Charts */}
            <div className="grid gap-4 xl:grid-cols-2 pt-2">
              <ChartCard title="Hiring Channel Breakdown" subtitle="System Job Board Applications vs Non-Job Board / External Hires">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hiredAnalytics.hiredChannelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                      <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {hiredAnalytics.hiredChannelData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill || '#003580'} />
                        ))}
                        <LabelList dataKey="value" position="top" fill="#1E293B" fontSize={12} fontWeight="bold" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Employer Category Hires" subtitle="External Corporate Partner Hires vs University (ASTU) Hires">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hiredAnalytics.hiredEmployerData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                      <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {hiredAnalytics.hiredEmployerData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill || '#E8A020'} />
                        ))}
                        <LabelList dataKey="value" position="top" fill="#1E293B" fontSize={12} fontWeight="bold" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          </section>

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
                        <Cell key={entry.name} fill={['#003580', '#5B7FB8', '#E8A020', '#1D9E75'][index % 4]} />
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

      {/* Add / Edit Job Modal */}
      <AdminModal
        open={modalOpen}
        title={editingJob ? 'Edit Job' : 'Add Job Listing'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={formSaving}
              onClick={handleSaveJob}
              className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 flex items-center gap-2 disabled:opacity-50"
            >
              {formSaving && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              {editingJob ? 'Save Changes' : 'Publish Job'}
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Job Title">
            <input
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Senior Lecturer / Software Engineer"
            />
          </Field>
          <Field label="Employer / Organization">
            <input
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
              value={formEmployer}
              onChange={(e) => setFormEmployer(e.target.value)}
              placeholder="ASTU University (or Company Name)"
            />
            <span className="text-[10px] text-slate-400 font-medium">Leave blank for official ASTU Campus Placement</span>
          </Field>
          <Field label="Type">
            <select
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
              value={formType}
              onChange={(e) => setFormType(e.target.value as JobType)}
            >
              {jobTypes.filter((type): type is JobType => type !== 'All').map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Deadline">
            <input
              type="date"
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
              value={formDeadline}
              onChange={(e) => setFormDeadline(e.target.value)}
            />
          </Field>
          <Field label="Location">
            <input
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              placeholder="e.g. Adama, Ethiopia (ASTU Main Campus)"
            />
          </Field>
          <Field label="Salary / Scale">
            <input
              className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
              value={formSalary}
              onChange={(e) => setFormSalary(e.target.value)}
              placeholder="e.g. 25,000 ETB - 35,000 ETB / Scale"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Job Description & Qualifications">
              <textarea
                rows={3}
                className="w-full rounded-[8px] border border-slate-200 px-3 py-2.5 outline-none focus:border-[#003580]"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Key responsibilities, eligibility criteria, department requirements..."
              />
            </Field>
          </div>
        </div>
      </AdminModal>

      {selectedAppModal && (
        <AdminModal
          open={Boolean(selectedAppModal)}
          title={`Candidate Application Review: ${selectedAppModal.jobTitle}`}
          onClose={() => setSelectedAppModal(null)}
          size="lg"
        >
          <div className="space-y-5 text-slate-800">
            {/* Header Profile Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)]/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003580] text-lg font-bold text-white shadow-md">
                  {selectedAppModal.applicant.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{selectedAppModal.applicant}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                    <span>{selectedAppModal.email || 'alumni@astu.edu.et'}</span>
                    <span>•</span>
                    <span>{selectedAppModal.phone || '+251 900 000 000'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AdminBadge variant="default" className={statusClass(selectedAppModal.status)}>
                  {selectedAppModal.status}
                </AdminBadge>
                {selectedAppModal.isSelfPosted ? (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#003580] uppercase tracking-wider border border-blue-100">
                    ASTU Official
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider border border-slate-200">
                    External Employer
                  </span>
                )}
              </div>
            </div>

            {/* Position Details & Applied Date */}
            <div className="grid gap-3 sm:grid-cols-3 rounded-lg border border-slate-100 bg-white p-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Job Position</span>
                <span className="font-bold text-slate-900">{selectedAppModal.jobTitle}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Employer</span>
                <span className="font-bold text-slate-800">{selectedAppModal.employer}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Applied On</span>
                <span className="font-bold text-slate-800">{formatDate(selectedAppModal.appliedDate)}</span>
              </div>
            </div>

            {/* Academic & Skills Section */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic & Technical Background</h5>
              <div className="grid gap-3 sm:grid-cols-2 rounded-lg border border-slate-200 p-3.5 bg-white text-xs">
                <div>
                  <div className="text-slate-500 font-medium">Department / Major:</div>
                  <div className="font-bold text-slate-900">{selectedAppModal.department || 'Software Engineering / Computer Science'}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Graduation Year & CGPA:</div>
                  <div className="font-bold text-slate-900">
                    Class of {selectedAppModal.graduationYear || '2024'} • CGPA {selectedAppModal.cgpa || '3.75'}
                    <span className="ml-2 inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      ASTU Verified
                    </span>
                  </div>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <div className="text-slate-500 font-medium mb-1.5">Technical Skills & Competencies:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedAppModal.skills && selectedAppModal.skills.length > 0 ? selectedAppModal.skills : ['TypeScript', 'Node.js', 'React', 'Database Systems']).map((skill, i) => (
                      <span key={i} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Letter / Statement of Intent */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Cover Letter / Statement of Purpose</h5>
              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] p-4 text-xs leading-relaxed text-slate-800 whitespace-pre-line font-normal shadow-inner">
                {selectedAppModal.coverLetter || 'I am writing to express my strong interest in this position. With my solid technical background from ASTU and hands-on project experience, I am ready to contribute effectively.'}
              </div>
            </div>

            {/* Resume / Portfolio Attachments */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Resume & Candidate Links</h5>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAppModal.resumeUrl) {
                      window.open(getFullUrl(selectedAppModal.resumeUrl), '_blank');
                    } else {
                      toast.error(`No CV document uploaded for candidate ${selectedAppModal.applicant}`);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#003580] px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-[#002866] transition-colors"
                >
                  <Download className="h-4 w-4" />
                  View Candidate CV / Resume PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenChatWithAlumni(selectedAppModal)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1D9E75] px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-[#16815f] transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Open ASTU_AMS Hub Chat
                </button>
                {selectedAppModal.linkedIn && (
                  <a href={getFullUrl(selectedAppModal.linkedIn)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-slate-50">
                    🔗 LinkedIn Profile
                  </a>
                )}
                {selectedAppModal.gitHub && (
                  <a href={getFullUrl(selectedAppModal.gitHub)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    💻 GitHub Profile
                  </a>
                )}
              </div>
            </div>

            {/* Moderation Status Controls inside Modal */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-medium text-slate-500">
                {selectedAppModal.isSelfPosted ? (
                  <span className="text-emerald-700 font-semibold">✓ You can update candidate status for this ASTU campus opening below.</span>
                ) : (
                  <span className="text-slate-500 italic">This application belongs to an external employer listing. Status is managed directly by the employer.</span>
                )}
              </div>

              {selectedAppModal.isSelfPosted && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Update Candidate Status:</span>
                  <select
                    value={selectedAppModal.status}
                    onChange={async (e) => {
                      const nextSt = e.target.value as ApplicationStatus;
                      await handleSingleAppStatusChange(selectedAppModal.id, nextSt);
                      setSelectedAppModal({ ...selectedAppModal, status: nextSt });
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003580]"
                  >
                    {['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN'].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </AdminModal>
      )}
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
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
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
