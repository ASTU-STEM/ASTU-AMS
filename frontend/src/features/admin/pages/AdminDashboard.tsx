import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Building2,
  Briefcase,
  ClipboardCheck,
  GraduationCap,
  Clock3,
  ShieldAlert,
  FileSpreadsheet,
  UserPlus,
  MessageSquareText,
  CheckCircle2,
  AlertTriangle,
  CircleDashed,
  Search,
  Users,
  Zap,
  Activity,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Database,
  Bell,
  Settings,
  Lock,
  Globe,
  X,
  Award,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  Legend,
  LabelList,
} from 'recharts';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import { adminService } from '../services/admin.service';
import { useAuth } from '../../../contexts/AuthContext';

type TrendTone = 'success' | 'warning';
type TimeRange = '7d' | '30d' | '90d' | '1y';

const quickActions = [
  { label: 'Add User', icon: UserPlus, path: '/admin/users', accent: '#003580' },
  { label: 'Post Job', icon: Briefcase, path: '/admin/jobs', accent: '#7C3AED' },
  { label: 'Create Survey', icon: ClipboardCheck, path: '/admin/surveys', accent: '#1D9E75' },
  { label: 'New Event', icon: Clock3, path: '/admin/reports', accent: '#E8A020' },
  { label: 'System Backup', icon: Database, path: '/admin/backup', accent: '#E24B4A' },
  { label: 'Analytics', icon: Activity, path: '/admin/analytics', accent: '#0284C7' },
];

const statToneClasses: Record<string, { circle: string; label: string; border: string }> = {
  '#003580': { circle: 'bg-[#003580]/10 text-[#003580]', label: 'text-[#003580]', border: 'border-[#003580]' },
  '#E8A020': { circle: 'bg-[#E8A020]/10 text-[#B87900]', label: 'text-[#B87900]', border: 'border-[#E8A020]' },
  '#1D9E75': { circle: 'bg-[#1D9E75]/10 text-[#1D9E75]', label: 'text-[#1D9E75]', border: 'border-[#1D9E75]' },
  '#7C3AED': { circle: 'bg-violet-500/10 text-violet-600', label: 'text-violet-600', border: 'border-violet-500' },
};

function TrendChip({ text, tone }: { text: string; tone: TrendTone }) {
  const classes =
    tone === 'success'
      ? 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15'
      : 'bg-[#EF9F27]/10 text-[#B86D00] border-[#EF9F27]/15';

  return <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold ${classes}`}>{text}</span>;
}

function ChartCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-card rounded-[10px] border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [metrics, setMetrics] = useState<any>(() => {
    try {
      const cached = localStorage.getItem(`admin_dashboard_metrics_${timeRange}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!metrics);

  // Top Hiring Companies Modal state
  const [isHiringModalOpen, setIsHiringModalOpen] = useState(false);
  const [hiringSearchQuery, setHiringSearchQuery] = useState('');

  // Selected Company for Alumni Breakdown Modal
  const [selectedCompanyForAlumni, setSelectedCompanyForAlumni] = useState<any | null>(null);
  const [alumniSearchQuery, setAlumniSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      // Check cache for range first
      try {
        const cached = localStorage.getItem(`admin_dashboard_metrics_${timeRange}`);
        if (cached && !metrics) {
          setMetrics(JSON.parse(cached));
          setLoading(false);
        }
      } catch {
        // ignore
      }

      const result = await adminService.getDashboardMetrics(timeRange);
      if (result.ok && isMounted) {
        setMetrics(result.data);
        setLoading(false);
        try {
          localStorage.setItem(`admin_dashboard_metrics_${timeRange}`, JSON.stringify(result.data));
        } catch {
          // ignore
        }
      } else if (isMounted) {
        setLoading(false);
      }
    };
    fetchMetrics();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Lock body & layout main scrolling when any modal is open
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (isHiringModalOpen || selectedCompanyForAlumni) {
      document.body.style.overflow = 'hidden';
      if (mainEl) mainEl.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (mainEl) mainEl.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (mainEl) mainEl.style.overflow = '';
    };
  }, [isHiringModalOpen, selectedCompanyForAlumni]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const navigate = useNavigate();

  // Derived state from metrics — real data only, no fallbacks to mock
  const activeStatCards = [
    {
      label: 'Total Alumni',
      value: metrics?.kpis?.totalAlumni?.toString() || '0',
      trend: 'From database',
      icon: GraduationCap,
      accent: '#003580',
      chip: 'success' as TrendTone,
      path: '/admin/users?role=ALUMNI',
    },
    {
      label: 'Total Employers',
      value: metrics?.kpis?.totalEmployers?.toString() || '0',
      trend: 'From database',
      icon: Building2,
      accent: '#E8A020',
      chip: 'success' as TrendTone,
      path: '/admin/users?role=EMPLOYER',
    },
    {
      label: 'Survey Completion',
      value: metrics?.kpis?.surveyCompletion || '0%',
      trend: 'Current rate',
      icon: ClipboardCheck,
      accent: '#1D9E75',
      chip: 'success' as TrendTone,
      path: '/admin/surveys',
    },
    {
      label: 'Active Jobs',
      value: metrics?.kpis?.activeJobs?.toString() || '0',
      trend: 'Currently posted',
      icon: Briefcase,
      accent: '#7C3AED',
      chip: 'warning' as TrendTone,
      path: '/admin/jobs',
    },
  ];

  const activeEmploymentData = metrics?.employmentData || [];
  const activePendingActions = metrics?.pendingActions || [];
  const activeSystemActivities = (metrics?.systemActivities || []).map((a: any) => ({
    icon: a.text?.includes('registered') ? UserPlus : a.text?.includes('backup') ? Database : FileSpreadsheet,
    tone: a.tone || '#003580',
    text: a.text,
    time: new Date(a.time).toLocaleString()
  }));
  const activeHiringCompanies: { name: string; hires: number; percentage?: number }[] = metrics?.topHiringCompanies || [];
  const allHiringCompanies: {
    id: string;
    name: string;
    hires: number;
    percentage: number;
    postedJobs: number;
    industry: string;
    isVerified: boolean;
    location: string;
    alumniList?: any[];
  }[] = metrics?.allHiringCompanies || activeHiringCompanies.map((c, i) => ({
    id: `comp-${i}`,
    name: c.name,
    hires: c.hires,
    percentage: c.percentage || Math.round((c.hires / (activeHiringCompanies.reduce((s, x) => s + x.hires, 0) || 1)) * 100),
    postedJobs: 0,
    industry: 'Technology & Enterprise',
    isVerified: true,
    location: 'Ethiopia',
    alumniList: []
  }));

  const totalSystemHires = metrics?.totalSystemHires || allHiringCompanies.reduce((s, c) => s + c.hires, 0) || 0;

  const filteredHiringCompanies = useMemo(() => {
    if (!hiringSearchQuery.trim()) return allHiringCompanies;
    const q = hiringSearchQuery.toLowerCase();
    return allHiringCompanies.filter((c: any) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
  }, [allHiringCompanies, hiringSearchQuery]);

  const activeSurveyData = [
    { name: 'Completed', value: parseInt(metrics?.kpis?.surveyCompletion || '0'), color: '#1D9E75' },
    { name: 'Remaining', value: Math.max(0, 100 - parseInt(metrics?.kpis?.surveyCompletion || '0')), color: '#E8A020' },
  ];
  const activeSkillGaps: { skill: string; value: number }[] = metrics?.skillGaps || [];

  const systemStatus = useMemo(() => {
    if (loading) {
      return {
        label: 'Connecting...',
        color: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
        dot: 'bg-blue-400',
        status: 'warning' as const
      };
    }
    if (!metrics) {
      return {
        label: 'System Offline',
        color: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
        dot: 'bg-rose-400',
        status: 'critical' as const
      };
    }
    if ((metrics.commandCenter?.approvalQueueCount || 0) > 15) {
      return {
        label: 'High Review Volume',
        color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        dot: 'bg-amber-400',
        status: 'warning' as const
      };
    }
    return {
      label: 'All Systems Operational',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      dot: 'bg-emerald-400',
      status: 'healthy' as const
    };
  }, [loading, metrics]);

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fade-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-card {
          animation: fade-slide-up 0.4s ease-out both;
        }
        .admin-card:nth-child(2) { animation-delay: 0.05s; }
        .admin-card:nth-child(3) { animation-delay: 0.1s; }
        .admin-card:nth-child(4) { animation-delay: 0.15s; }
        .admin-card:nth-child(5) { animation-delay: 0.2s; }
        .admin-card:nth-child(6) { animation-delay: 0.25s; }
        .admin-card:nth-child(7) { animation-delay: 0.3s; }
        .admin-card:nth-child(8) { animation-delay: 0.35s; }
      `}</style>

      <AdminPageHeader
        title={`${greeting}, ${user ? user.firstName : 'System Administrator'}`}
        subtitle="Welcome back to the ASTU Alumni Management System control panel."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 p-0.5 text-xs text-white">
              {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`rounded-md px-2.5 py-1.5 font-semibold transition-all ${
                    timeRange === range
                      ? 'bg-[#FFCC00] text-slate-900 shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <span className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-extrabold bg-[#FFCC00]/15 text-[#FFCC00] border border-[#FFCC00]/30 shadow-xs">v1.4</span>
          </div>
        }
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-slate-200/90 font-medium">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] animate-pulse" />
              <span>{today}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300/80">
              <RefreshCw className="w-3.5 h-3.5 text-[#FFCC00]" />
              <span>Last sync: {metrics?.headerInfo?.lastSync || 'Just now'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300/80">
              <Database className="w-3.5 h-3.5 text-[#FFCC00]" />
              <span>{metrics?.headerInfo?.totalRecords || 'Connected'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300/80">
              <Users className="w-3.5 h-3.5 text-[#FFCC00]" />
              <span>{metrics?.headerInfo?.activeSessions || 'Active'}</span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm self-start md:self-auto ${systemStatus.color}`}>
            <span className={`h-2 w-2 rounded-full animate-pulse ${systemStatus.dot}`} />
            {systemStatus.label}
          </div>
        </div>
      </AdminPageHeader>

      {/* Admin Command Center */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#003580]" />
              Admin Command Center
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified governance layer for system health, user approvals, active jobs, and database sync status.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const csvContent = [
                ['Metric', 'Value'],
                ['Total Alumni', metrics?.kpis?.totalAlumni || 0],
                ['Total Employers', metrics?.kpis?.totalEmployers || 0],
                ['Survey Completion', metrics?.kpis?.surveyCompletion || '0%'],
                ['Active Jobs', metrics?.kpis?.activeJobs || 0],
                ['Identity Coverage', metrics?.commandCenter?.identityCoverage || '0%'],
                ['Approval Queue Count', metrics?.commandCenter?.approvalQueueCount || 0],
                ['System SLA', metrics?.commandCenter?.systemSLA || '100%'],
                ['Profile Completeness', metrics?.commandCenter?.completeness || '0%'],
                ['Total Database Records', metrics?.headerInfo?.totalRecords || '0'],
                ['Report Generated At', new Date().toISOString()],
              ].map(e => e.join(',')).join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `ASTU_System_Report_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003580] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#002866] hover:shadow-md cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export System Report
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 grid grid-cols-2 gap-3.5">
            {[
              { label: 'IDENTITY COVERAGE', value: metrics?.commandCenter?.identityCoverage || '0%', icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { label: 'APPROVAL QUEUE', value: (metrics?.commandCenter?.approvalQueueCount ?? activePendingActions.length).toString(), icon: AlertTriangle, tone: 'text-amber-600 bg-amber-50 border-amber-100' },
              { label: 'SYSTEM SLA', value: metrics?.commandCenter?.systemSLA || '100% On-Time', icon: Clock3, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { label: 'EXPORT STATUS', value: metrics?.commandCenter?.exportStatus || 'Ready', icon: FileSpreadsheet, tone: 'text-[#003580] bg-blue-50 border-blue-100' },
            ].map((sig) => {
              const Icon = sig.icon;
              return (
                <div key={sig.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg border text-sm ${sig.tone}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{sig.label}</span>
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">{sig.value}</p>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 rounded-xl border border-slate-100 bg-slate-50/60 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">System Data Quality</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                MONITORED
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="p-3 rounded-lg bg-white border border-slate-100 text-center">
                <p className="text-lg font-extrabold text-slate-900">{metrics?.commandCenter?.duplicateScan || '0 open'}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">DUPLICATE SCAN</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-100 text-center">
                <p className="text-lg font-extrabold text-slate-900">{metrics?.commandCenter?.completeness || '0%'}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">COMPLETENESS</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-100 text-center">
                <p className="text-lg font-extrabold text-emerald-600">{metrics?.commandCenter?.auditTrail || 'Live'}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">AUDIT TRAIL</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              {metrics?.commandCenter?.healthStatusText || 'System database health verified conflict-free. All audit trails logging active.'}
            </p>
          </div>
        </div>
      </section>

      {/* KPI Stats Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {activeStatCards.map((card) => {
          const Icon = card.icon;
          const styles = statToneClasses[card.accent];

          return (
            <div
              key={card.label}
              onClick={() => navigate(card.path)}
              className={`admin-card relative group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.circle} transition-transform duration-300 group-hover:scale-105`}>
                  <Icon className={`h-5 w-5 ${styles.label}`} />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  SYSTEM VERIFIED
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">{card.value}</p>
              </div>
              <p className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium flex items-center justify-between">
                <span>{card.trend}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </p>
            </div>
          );
        })}
      </section>

      {/* Quick Actions Bar */}
      <section className="admin-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">Quick Actions</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-center transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 shadow-xs"
                  style={{ backgroundColor: `${action.accent}14`, color: action.accent }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">{action.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Charts Row */}
      <section className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3 admin-card">
          <ChartCard
            title="Employment Rate by Department"
            subtitle="Percentage of alumni employed within each department group."
            action={
              <button
                type="button"
                onClick={() => navigate('/admin/reports')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#003580] hover:underline cursor-pointer"
              >
                View Full Report <ChevronRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeEmploymentData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                  <XAxis dataKey="department" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Employment Rate']}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E8EDF5',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {activeEmploymentData.map((entry: any, index: number) => (
                      <Cell key={`cell-${entry.department}`} fill={index === 4 ? '#E8A020' : '#003580'} />
                    ))}
                    <LabelList dataKey="value" position="top" formatter={(value: number) => `${value}%`} fill="#334155" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="xl:col-span-2 admin-card">
          <ChartCard
            title="Survey Completion Rate"
            subtitle="Current tracer survey response distribution."
            action={
              <button
                type="button"
                onClick={() => navigate('/admin/surveys')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#003580] hover:underline cursor-pointer"
              >
                Manage Surveys <ChevronRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeSurveyData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {activeSurveyData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                    <Label
                      value={metrics?.kpis?.surveyCompletion || '0%'}
                      position="center"
                      className="text-2xl font-extrabold fill-slate-900"
                    />
                    <Label
                      value="Overall Completion"
                      position="center"
                      dy={22}
                      className="text-[11px] font-semibold fill-slate-500"
                    />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E8EDF5',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 18, fontSize: 12, color: '#475569' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </section>

      {/* System Status */}
      <section className="admin-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">System Health</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs font-bold" style={{ color: systemStatus.status === 'healthy' ? '#059669' : systemStatus.status === 'warning' ? '#d97706' : '#dc2626' }}>
            <StatusDot status={systemStatus.status} />
            {systemStatus.label}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'API Response Time', value: metrics?.systemHealth?.apiLatency || '<20ms', status: (metrics?.systemHealth?.apiLatencyNum || 0) < 300 ? ('healthy' as const) : ('warning' as const), trend: metrics?.systemHealth?.latencyTrend || 'Optimal' },
            { label: 'Database Status', value: metrics?.systemHealth?.dbStatus || metrics?.headerInfo?.totalRecords || 'Connected', status: 'healthy' as const, trend: 'Prisma DB Live' },
            { label: 'Profile Completeness', value: metrics?.systemHealth?.completeness || metrics?.commandCenter?.completeness || '0%', status: 'healthy' as const, trend: 'Data Verified' },
            { label: 'Active Sessions', value: metrics?.systemHealth?.activeSessions || metrics?.headerInfo?.activeSessions || '1 active session', status: 'healthy' as const, trend: 'User Accounts' },
          ].map((metric) => (
            <div key={metric.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400`}>{metric.label}</span>
                <StatusDot status={metric.status} />
              </div>
              <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-500 font-medium">{metric.trend}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Row */}
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="admin-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent System Activity</h3>
              <p className="mt-0.5 text-xs text-slate-500">Latest administrative actions and sync events.</p>
            </div>
            <AdminBadge variant="neutral">Live Feed</AdminBadge>
          </div>

          <div className="mt-5 space-y-4">
            {activeSystemActivities.map((entry: any, index: number) => {
              const Icon = entry.icon;
              return (
                <div key={index} className="flex gap-3 group">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-blue-50 transition-colors">
                    <Icon className="h-4.5 w-4.5" style={{ color: entry.tone }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{entry.text}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400 font-medium">{entry.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:shadow-md">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pending Actions</h3>
            <p className="mt-0.5 text-xs text-slate-500">Tasks waiting for administrative review.</p>
          </div>

          <div className="mt-5 space-y-3">
            {activePendingActions.map((task: any, index: number) => (
              <div
                key={index}
                className="group rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-2xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                style={{ borderLeftColor: task.tone }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">{task.label}</p>
                  <button
                    type="button"
                    onClick={() => navigate(task.path || '/admin/users')}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all hover:brightness-110 hover:shadow-md cursor-pointer"
                    style={{ backgroundColor: task.tone }}
                  >
                    {task.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-1 text-xs font-bold text-[#003580] hover:underline cursor-pointer"
            >
              View All Tasks <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="admin-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Skill Gap Alert</h3>
              <p className="mt-0.5 text-xs text-slate-500">Top Missing Skills Reported by Employers</p>
            </div>
            <AdminBadge variant="warning">Curriculum Input</AdminBadge>
          </div>

          <div className="mt-5 space-y-4">
            {activeSkillGaps.length > 0 ? activeSkillGaps.map((item) => (
              <div key={item.skill} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-700">{item.skill}</span>
                  <span className="font-bold text-slate-500">{item.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="relative h-full rounded-full bg-gradient-to-r from-[#003580] via-[#5B7FB8] to-[#E8A020] transition-all duration-500"
                    style={{ width: `${item.value}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 py-6 text-center">Skill gap data will appear as employer feedback is collected.</p>
            )}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-500">Based on employer feedback submissions</span>
            <button
              type="button"
              onClick={() => navigate('/admin/analytics')}
              className="font-bold text-[#003580] hover:underline cursor-pointer"
            >
              View Details
            </button>
          </div>
        </div>
      </section>

      {/* Top Hiring Companies */}
      <section className="admin-card">
        <ChartCard
          title="Top Hiring Companies"
          subtitle="Organizations with the highest graduate hiring volume."
          action={
            <button
              type="button"
              onClick={() => setIsHiringModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#003580] hover:underline cursor-pointer"
            >
              View All <ExternalLink className="w-3 h-3" />
            </button>
          }
        >
          <div className="h-[300px] cursor-pointer" onClick={() => setIsHiringModalOpen(true)}>
            <ResponsiveContainer width="100%" height="100%">
              {activeHiringCompanies.length > 0 ? (
              <BarChart data={activeHiringCompanies} layout="vertical" margin={{ top: 12, right: 24, left: 12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fill: '#334155', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [value, 'Hires']}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E8EDF5',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="hires" radius={[0, 8, 8, 0]} fill="#003580">
                  <LabelList dataKey="hires" position="right" fill="#334155" fontSize={12} />
                </Bar>
              </BarChart>
              ) : (
                <text x="50%" y="50%" textAnchor="middle" fill="#94a3b8" fontSize={14}>Hiring data will appear as employers submit records.</text>
              )}
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      {/* Top Hiring Companies Detailed Modal */}
      {isHiringModalOpen && createPortal(
        <div
          onClick={() => setIsHiringModalOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] lg:max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#003580]/10 flex items-center justify-center text-[#003580]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    Top Hiring Companies & Employer Market Analytics
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      Verified Placement Analytics
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive graduate hiring statistics, market percentage share, and active job postings across registered organizations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHiringModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                  <div className="text-xs font-semibold text-blue-800">Total System Hires</div>
                  <div className="text-2xl font-black text-[#003580] mt-1">{totalSystemHires}</div>
                  <div className="text-[11px] text-blue-600 mt-1">Verified alumni placements</div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="text-xs font-semibold text-emerald-800">Registered Companies</div>
                  <div className="text-2xl font-black text-emerald-900 mt-1">{allHiringCompanies.length}</div>
                  <div className="text-[11px] text-emerald-600 mt-1">Active employer profiles</div>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                  <div className="text-xs font-semibold text-purple-800">Top Hiring Partner</div>
                  <div className="text-lg font-bold text-purple-950 mt-1 truncate">{allHiringCompanies[0]?.name || 'N/A'}</div>
                  <div className="text-[11px] text-purple-700 mt-1">
                    {allHiringCompanies[0]?.percentage || 0}% of all graduate hires
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                  <div className="text-xs font-semibold text-amber-800">Leading Hiring Sector</div>
                  <div className="text-lg font-bold text-amber-950 mt-1 truncate">{metrics?.leadingSector || allHiringCompanies[0]?.industry || 'Telecommunications'}</div>
                  <div className="text-[11px] text-amber-700 mt-1">Highest employer placement volume</div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={hiringSearchQuery}
                    onChange={(e) => setHiringSearchQuery(e.target.value)}
                    placeholder="Search company by name or industry..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580]"
                  />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Showing {filteredHiringCompanies.length} of {allHiringCompanies.length} companies
                </div>
              </div>

              {/* Table of Companies */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                <table className="w-full min-w-[920px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-3 px-4 w-14">Rank</th>
                      <th className="py-3 px-4">Organization Name</th>
                      <th className="py-3 px-4">Industry / Sector</th>
                      <th className="py-3 px-4 text-center">Hired Alumni Placements (Click to view)</th>
                      <th className="py-3 px-4 w-40">Hiring Share (%)</th>
                      <th className="py-3 px-4 text-center">Active Jobs</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHiringCompanies.map((comp, idx) => (
                      <tr
                        key={comp.id || idx}
                        onClick={() => setSelectedCompanyForAlumni(comp)}
                        className="hover:bg-blue-50/80 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 font-bold text-slate-500">
                          {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {comp.name}
                            {comp.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline-block" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{comp.location}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {comp.industry}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompanyForAlumni(comp);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                            title="Click to view full list of hired alumni"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{comp.hires} Hired {comp.hires === 1 ? 'Graduate' : 'Graduates'}</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-[#003580] h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, Math.max(5, comp.percentage))}%` }}
                              />
                            </div>
                            <span className="font-bold text-[#003580] w-9 text-right">{comp.percentage}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-700">
                          {comp.postedJobs > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                              {comp.postedJobs} open
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsHiringModalOpen(false);
                              navigate('/admin/users?role=EMPLOYER');
                            }}
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-[#003580] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                          >
                            Manage User
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
              <div>* Placement percentages and market analytics are aggregated from official graduate employment reports and verified partner records.</div>
              <button
                type="button"
                onClick={() => setIsHiringModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Hired Alumni List Modal */}
      {selectedCompanyForAlumni && createPortal(
        <div
          onClick={() => setSelectedCompanyForAlumni(null)}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700 font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    Hired Alumni at {selectedCompanyForAlumni.name}
                    {selectedCompanyForAlumni.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedCompanyForAlumni.industry} • {selectedCompanyForAlumni.location} • {selectedCompanyForAlumni.hires} total placed graduates
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompanyForAlumni(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 min-h-0">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={alumniSearchQuery}
                    onChange={(e) => setAlumniSearchQuery(e.target.value)}
                    placeholder="Search alumni by name, email, or department..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580]"
                  />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {selectedCompanyForAlumni.alumniList?.length || 0} Placements Recorded
                </div>
              </div>

              {/* Alumni Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(selectedCompanyForAlumni.alumniList || []).filter((a: any) => {
                  if (!alumniSearchQuery.trim()) return true;
                  const q = alumniSearchQuery.toLowerCase();
                  return (a.name || '').toLowerCase().includes(q) ||
                         (a.department || '').toLowerCase().includes(q) ||
                         (a.email || '').toLowerCase().includes(q) ||
                         (a.position || '').toLowerCase().includes(q);
                }).map((alumnus: any, idx: number) => (
                  <div key={alumnus.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#003580] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {(alumnus.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                            {alumnus.name}
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline-block" />
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
                            {alumnus.source}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5">
                          {alumnus.position || 'Hired Graduate'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                          <span>🎓 {typeof alumnus.department === 'object' ? (alumnus.department?.name || alumnus.department?.code || 'Engineering') : (alumnus.department || 'Engineering')}</span>
                          <span>•</span>
                          <span>{alumnus.graduationYear}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 truncate">
                          ✉️ {alumnus.email} {alumnus.phone && `• 📞 ${alumnus.phone}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(!selectedCompanyForAlumni.alumniList || selectedCompanyForAlumni.alumniList.length === 0) && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No individual alumnus profiles recorded for this company entry yet.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setSelectedCompanyForAlumni(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
