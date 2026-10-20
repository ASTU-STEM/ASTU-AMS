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
import { DashboardBroadcastHero } from '../../../components/DashboardBroadcastHero';

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
  '#7C3AED': { circle: 'bg-[#0284C7]/10 text-[#0284C7]', label: 'text-[#0284C7]', border: 'border-[#0284C7]' },
};

function TrendChip({ text, tone }: { text: string; tone: TrendTone }) {
  const classes =
    tone === 'success'
      ? 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15'
      : 'bg-[#EF9F27]/10 text-[#B86D00] border-[#EF9F27]/15';

  return <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold ${classes}`}>{text}</span>;
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
    <div className="admin-card border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function StatusDot({ status }: { status: 'healthy' | 'warning' | 'critical' }) {
  const colors = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
  };

  return (
    <span className={`inline-block h-2 w-2 rounded-full ${colors[status]} ${status === 'healthy' ? 'animate-pulse' : ''}`} />
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
      value: metrics?.kpis?.totalAlumni?.toString() || '—',
      trend: 'From database',
      icon: GraduationCap,
      accent: '#003580',
      chip: 'success' as TrendTone,
      path: '/admin/users?role=ALUMNI',
    },
    {
      label: 'Total Employers',
      value: metrics?.kpis?.totalEmployers?.toString() || '—',
      trend: 'From database',
      icon: Building2,
      accent: '#E8A020',
      chip: 'success' as TrendTone,
      path: '/admin/users?role=EMPLOYER',
    },
    {
      label: 'Survey Completion',
      value: metrics?.kpis?.surveyCompletion || '—',
      trend: 'Current rate',
      icon: ClipboardCheck,
      accent: '#1D9E75',
      chip: 'success' as TrendTone,
      path: '/admin/surveys',
    },
    {
      label: 'Active Jobs',
      value: metrics?.kpis?.activeJobs?.toString() || '—',
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

  // `surveyCompletion` arrives as a display string ("72%"). Parse defensively
  // so a missing value yields 0 rather than NaN in the donut chart.
  const surveyCompletionPct = (() => {
    const parsed = Number.parseFloat(String(metrics?.kpis?.surveyCompletion ?? '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0;
  })();

  const activeSurveyData = [
    { name: 'Completed', value: surveyCompletionPct, color: '#1D9E75' },
    { name: 'Remaining', value: Math.max(0, 100 - surveyCompletionPct), color: '#E8A020' },
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
    <div className="space-y-5">
      <style>{`
        @keyframes fade-slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-card {
          animation: fade-slide-up 0.35s ease-out both;
        }
        .admin-card:nth-child(2) { animation-delay: 0.04s; }
        .admin-card:nth-child(3) { animation-delay: 0.08s; }
        .admin-card:nth-child(4) { animation-delay: 0.12s; }
        .admin-card:nth-child(5) { animation-delay: 0.16s; }
        .admin-card:nth-child(6) { animation-delay: 0.2s; }
        .admin-card:nth-child(7) { animation-delay: 0.24s; }
        .admin-card:nth-child(8) { animation-delay: 0.28s; }
      `}</style>

      <AdminPageHeader
        title={`${greeting}, ${user ? user.firstName : 'System Administrator'}`}
        subtitle="Welcome back to the ASTU Alumni Management System control panel."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 border border-white/15 bg-white/5 p-0.5 text-xs text-white">
              {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1.5 font-semibold transition-colors cursor-pointer ${
                    timeRange === range
                      ? 'bg-[#FFCC00] text-slate-900'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <span className="border border-[#FFCC00]/30 bg-[#FFCC00]/10 px-2.5 py-1.5 text-xs font-mono font-bold text-[#FFCC00]">v1.4</span>
          </div>
        }
      >
        <div className="flex flex-col gap-3 text-xs font-medium text-slate-200/90 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-2 border border-white/10 bg-white/5 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFCC00] animate-pulse" />
              <span>{today}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300/85">
              <RefreshCw className="h-3.5 w-3.5 text-[#FFCC00]" />
              <span>Last sync: {metrics?.headerInfo?.lastSync || 'Just now'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300/85">
              <Database className="h-3.5 w-3.5 text-[#FFCC00]" />
              <span>{metrics?.headerInfo?.totalRecords || 'Connected'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300/85">
              <Users className="h-3.5 w-3.5 text-[#FFCC00]" />
              <span>{metrics?.headerInfo?.activeSessions || 'Active'}</span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 self-start border px-3 py-1.5 text-xs font-semibold md:self-auto ${systemStatus.color}`}>
            <span className={`h-2 w-2 rounded-full animate-pulse ${systemStatus.dot}`} />
            {systemStatus.label}
          </div>
        </div>
      </AdminPageHeader>

      <DashboardBroadcastHero actorRole="ADMIN" className="mb-1" />

      {/* Admin Command Center */}
      <section className="border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 border-b border-[var(--border-color)] pb-4 md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight text-[var(--text-primary)]">
              <Zap className="h-4 w-4 text-[#003580]" />
              Admin Command Center
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              System health, approvals, jobs, and database sync status.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const csvContent = [
                ['Metric', 'Value'],
                ['Total Alumni', metrics?.kpis?.totalAlumni || 0],
                ['Total Employers', metrics?.kpis?.totalEmployers || 0],
                ['Survey Completion', metrics?.kpis?.surveyCompletion || '—'],
                ['Active Jobs', metrics?.kpis?.activeJobs || 0],
                ['Identity Coverage', metrics?.commandCenter?.identityCoverage || '—'],
                ['Approval Queue Count', metrics?.commandCenter?.approvalQueueCount || 0],
                ['System SLA', metrics?.commandCenter?.systemSLA || '—'],
                ['Profile Completeness', metrics?.commandCenter?.completeness || '—'],
                ['Total Database Records', metrics?.headerInfo?.totalRecords || '—'],
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
            className="inline-flex items-center justify-center gap-2 bg-[#003580] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#002866] cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export System Report
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="grid grid-cols-2 gap-3 lg:col-span-7">
            {[
              { label: 'IDENTITY COVERAGE', value: metrics?.commandCenter?.identityCoverage || '—', icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { label: 'APPROVAL QUEUE', value: (metrics?.commandCenter?.approvalQueueCount ?? activePendingActions.length).toString(), icon: AlertTriangle, tone: 'text-amber-600 bg-amber-50 border-amber-100' },
              { label: 'SYSTEM SLA', value: metrics?.commandCenter?.systemSLA || '—', icon: Clock3, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { label: 'EXPORT STATUS', value: metrics?.commandCenter?.exportStatus || 'Ready', icon: FileSpreadsheet, tone: 'text-[#003580] bg-blue-50 border-blue-100' },
            ].map((sig) => {
              const Icon = sig.icon;
              return (
                <div key={sig.label} className="border border-[var(--border-color)] bg-[var(--bg-page)] p-4 transition-colors hover:bg-[var(--bg-card)]">
                  <div className="flex items-center gap-2">
                    <span className={`border p-1.5 ${sig.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{sig.label}</span>
                  </div>
                  <p className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">{sig.value}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col justify-between border border-[var(--border-color)] bg-[var(--bg-page)] p-4 lg:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">System Data Quality</span>
              <span className="border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                MONITORED
              </span>
            </div>

            <div className="my-3 grid grid-cols-3 gap-2">
              <div className="border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-center">
                <p className="text-lg font-extrabold text-[var(--text-primary)]">{metrics?.commandCenter?.duplicateScan || '—'}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase text-[var(--text-muted)]">DUPLICATE SCAN</p>
              </div>
              <div className="border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-center">
                <p className="text-lg font-extrabold text-[var(--text-primary)]">{metrics?.commandCenter?.completeness || '—'}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase text-[var(--text-muted)]">COMPLETENESS</p>
              </div>
              <div className="border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-center">
                <p className="text-lg font-extrabold text-emerald-600">{metrics?.commandCenter?.auditTrail || 'Live'}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase text-[var(--text-muted)]">AUDIT TRAIL</p>
              </div>
            </div>

            <p className="text-[11px] font-medium text-[var(--text-secondary)]">
              {metrics?.commandCenter?.healthStatusText || 'System database health verified conflict-free. All audit trails logging active.'}
            </p>
          </div>
        </div>
      </section>

      {/* KPI Stats Cards */}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {activeStatCards.map((card) => {
          const Icon = card.icon;
          const styles = statToneClasses[card.accent];

          return (
            <div
              key={card.label}
              onClick={() => navigate(card.path)}
              className="admin-card group cursor-pointer border border-[var(--border-color)] bg-[var(--bg-card)] p-5 transition-colors hover:border-[#003580]/30"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center ${styles.circle}`}>
                  <Icon className={`h-5 w-5 ${styles.label}`} />
                </div>
                <span className="border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  VERIFIED
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{card.label}</p>
                <p className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">{card.value}</p>
              </div>
              <p className="mt-3 flex items-center justify-between border-t border-[var(--border-color)] pt-3 text-xs font-medium text-[var(--text-secondary)]">
                <span>{card.trend}</span>
                <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[#003580]" />
              </p>
            </div>
          );
        })}
      </section>

      {/* Quick Actions Bar */}
      <section className="admin-card border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#E8A020]" />
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Quick Actions</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="group flex flex-col items-center gap-2 border border-[var(--border-color)] bg-[var(--bg-page)] p-3 text-center transition-colors hover:border-[#003580]/25 hover:bg-[var(--bg-card)] cursor-pointer"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: `${action.accent}14`, color: action.accent }}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{action.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Charts Row */}
      <section className="grid gap-3 xl:grid-cols-5">
        <div className="admin-card xl:col-span-3">
          <ChartCard
            title="Employment Rate by Department"
            subtitle="Percentage of alumni employed within each department group."
            action={
              <button
                type="button"
                onClick={() => navigate('/admin/reports')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#003580] hover:underline cursor-pointer"
              >
                View Full Report <ChevronRight className="h-3 w-3" />
              </button>
            }
          >
            <div className="h-[320px]">
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
                      borderRadius: 4,
                      border: '1px solid #E8EDF5',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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

        <div className="admin-card xl:col-span-2">
          <ChartCard
            title="Survey Completion Rate"
            subtitle="Current tracer survey response distribution."
            action={
              <button
                type="button"
                onClick={() => navigate('/admin/surveys')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#003580] hover:underline cursor-pointer"
              >
                Manage Surveys <ChevronRight className="h-3 w-3" />
              </button>
            }
          >
            <div className="h-[320px]">
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
                      value={metrics?.kpis?.surveyCompletion || '—'}
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
                      borderRadius: 4,
                      border: '1px solid #E8EDF5',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
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

      {/* System Health */}
      <section className="admin-card border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">System Health</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs font-bold" style={{ color: systemStatus.status === 'healthy' ? '#059669' : systemStatus.status === 'warning' ? '#d97706' : '#dc2626' }}>
            <StatusDot status={systemStatus.status} />
            {systemStatus.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'API Response Time', value: metrics?.systemHealth?.apiLatency || '—', status: (metrics?.systemHealth?.apiLatencyNum || 0) < 300 ? ('healthy' as const) : ('warning' as const), trend: metrics?.systemHealth?.latencyTrend || 'Optimal' },
            { label: 'Database Status', value: metrics?.systemHealth?.dbStatus || metrics?.headerInfo?.totalRecords || 'Connected', status: 'healthy' as const, trend: 'Prisma DB Live' },
            { label: 'Profile Completeness', value: metrics?.systemHealth?.completeness || metrics?.commandCenter?.completeness || '—', status: 'healthy' as const, trend: 'Data Verified' },
            { label: 'Active Sessions', value: metrics?.systemHealth?.activeSessions || metrics?.headerInfo?.activeSessions || '—', status: 'healthy' as const, trend: 'User Accounts' },
          ].map((metric) => (
            <div key={metric.label} className="border border-[var(--border-color)] bg-[var(--bg-page)] p-4 transition-colors hover:bg-[var(--bg-card)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{metric.label}</span>
                <StatusDot status={metric.status} />
              </div>
              <p className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">{metric.value}</p>
              <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">{metric.trend}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Row */}
      <section className="grid gap-3 xl:grid-cols-3">
        <div className="admin-card border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent System Activity</h3>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Latest administrative actions and sync events.</p>
            </div>
            <AdminBadge variant="neutral">Live Feed</AdminBadge>
          </div>

          <div className="mt-5 space-y-3">
            {activeSystemActivities.map((entry: any, index: number) => {
              const Icon = entry.icon;
              return (
                <div key={index} className="group flex gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--bg-page)] transition-colors group-hover:bg-[#003580]/5">
                    <Icon className="h-4 w-4" style={{ color: entry.tone }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{entry.text}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-[var(--text-muted)]">{entry.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-card border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Pending Actions</h3>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Tasks waiting for administrative review.</p>
          </div>

          <div className="mt-5 space-y-2.5">
            {activePendingActions.map((task: any, index: number) => (
              <div
                key={index}
                className="group border border-[var(--border-color)] border-l-4 bg-[var(--bg-page)] p-3.5 transition-colors hover:bg-[var(--bg-card)]"
                style={{ borderLeftColor: task.tone }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{task.label}</p>
                  <button
                    type="button"
                    onClick={() => navigate(task.path || '/admin/users')}
                    className="px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-110 cursor-pointer"
                    style={{ backgroundColor: task.tone }}
                  >
                    {task.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-[var(--border-color)] pt-3">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-1 text-xs font-bold text-[#003580] hover:underline cursor-pointer"
            >
              View All Tasks <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="admin-card border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Skill Gap Alert</h3>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Top Missing Skills Reported by Employers</p>
            </div>
            <AdminBadge variant="warning">Curriculum Input</AdminBadge>
          </div>

          <div className="mt-5 space-y-4">
            {activeSkillGaps.length > 0 ? activeSkillGaps.map((item) => (
              <div key={item.skill} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-[var(--text-primary)]">{item.skill}</span>
                  <span className="font-bold text-[var(--text-secondary)]">{item.value}%</span>
                </div>
                <div className="h-2 overflow-hidden bg-[var(--bg-page)]">
                  <div
                    className="h-full bg-[#003580] transition-all duration-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="py-6 text-center text-sm text-[var(--text-muted)]">Skill gap data will appear as employer feedback is collected.</p>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[var(--border-color)] pt-4 text-xs font-medium">
            <span className="text-[var(--text-secondary)]">Based on employer feedback submissions</span>
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
              View All <ExternalLink className="h-3 w-3" />
            </button>
          }
        >
          <div className="h-[280px] cursor-pointer" onClick={() => setIsHiringModalOpen(true)}>
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
                    borderRadius: 4,
                    border: '1px solid #E8EDF5',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                />
                <Bar dataKey="hires" radius={[0, 4, 4, 0]} fill="#003580">
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-[95vw] flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl lg:max-w-6xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-[#003580]/10 text-[#003580]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="flex flex-wrap items-center gap-2 text-lg font-bold text-slate-900">
                    Top Hiring Companies & Employer Market Analytics
                    <span className="border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      Verified Placement Analytics
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Graduate hiring statistics, market share, and active job postings across registered organizations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHiringModalOpen(false)}
                className="p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="border border-blue-100 bg-blue-50/60 p-4">
                  <div className="text-xs font-semibold text-blue-800">Total System Hires</div>
                  <div className="mt-1 text-2xl font-black text-[#003580]">{totalSystemHires}</div>
                  <div className="mt-1 text-[11px] text-blue-600">Verified alumni placements</div>
                </div>

                <div className="border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="text-xs font-semibold text-emerald-800">Registered Companies</div>
                  <div className="mt-1 text-2xl font-black text-emerald-900">{allHiringCompanies.length}</div>
                  <div className="mt-1 text-[11px] text-emerald-600">Active employer profiles</div>
                </div>

                <div className="border border-[#003580]/15 bg-[#003580]/5 p-4">
                  <div className="text-xs font-semibold text-[#003580]">Top Hiring Partner</div>
                  <div className="mt-1 truncate text-lg font-bold text-slate-900">{allHiringCompanies[0]?.name || 'N/A'}</div>
                  <div className="mt-1 text-[11px] text-slate-600">
                    {allHiringCompanies[0]?.percentage || 0}% of all graduate hires
                  </div>
                </div>

                <div className="border border-amber-100 bg-amber-50/60 p-4">
                  <div className="text-xs font-semibold text-amber-800">Leading Hiring Sector</div>
                  <div className="mt-1 truncate text-lg font-bold text-amber-950">{metrics?.leadingSector || allHiringCompanies[0]?.industry || '—'}</div>
                  <div className="mt-1 text-[11px] text-amber-700">Highest employer placement volume</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={hiringSearchQuery}
                    onChange={(e) => setHiringSearchQuery(e.target.value)}
                    placeholder="Search company by name or industry..."
                    className="w-full border border-slate-200 py-2 pl-9 pr-4 text-xs focus:border-[#003580] focus:outline-none focus:ring-2 focus:ring-[#003580]/15"
                  />
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Showing {filteredHiringCompanies.length} of {allHiringCompanies.length} companies
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200">
                <table className="w-full min-w-[920px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600">
                      <th className="w-14 px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Organization Name</th>
                      <th className="px-4 py-3">Industry / Sector</th>
                      <th className="px-4 py-3 text-center">Hired Alumni Placements (Click to view)</th>
                      <th className="w-40 px-4 py-3">Hiring Share (%)</th>
                      <th className="px-4 py-3 text-center">Active Jobs</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHiringCompanies.map((comp, idx) => (
                      <tr
                        key={comp.id || idx}
                        onClick={() => setSelectedCompanyForAlumni(comp)}
                        className="cursor-pointer transition-colors hover:bg-[#003580]/5"
                      >
                        <td className="px-4 py-3 font-bold text-slate-500">
                          {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            {comp.name}
                            {comp.isVerified && (
                              <CheckCircle2 className="inline-block h-3.5 w-3.5 text-emerald-600" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{comp.location}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600">
                          {comp.industry}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompanyForAlumni(comp);
                            }}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 cursor-pointer"
                            title="Click to view full list of hired alumni"
                          >
                            <Users className="h-3.5 w-3.5" />
                            <span>{comp.hires} Hired {comp.hires === 1 ? 'Graduate' : 'Graduates'}</span>
                            <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden bg-slate-100">
                              <div
                                className="h-full bg-[#003580] transition-all duration-300"
                                style={{ width: `${Math.min(100, Math.max(5, comp.percentage))}%` }}
                              />
                            </div>
                            <span className="w-9 text-right font-bold text-[#003580]">{comp.percentage}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-700">
                          {comp.postedJobs > 0 ? (
                            <span className="bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                              {comp.postedJobs} open
                            </span>
                          ) : (
                            <span className="font-normal text-slate-400">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsHiringModalOpen(false);
                              navigate('/admin/users?role=EMPLOYER');
                            }}
                            className="bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-[#003580] transition-colors hover:bg-blue-100 cursor-pointer"
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

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500">
              <div>* Placement percentages and market analytics are aggregated from official graduate employment reports and verified partner records.</div>
              <button
                type="button"
                onClick={() => setIsHiringModalOpen(false)}
                className="bg-slate-800 px-4 py-1.5 font-semibold text-white transition-colors hover:bg-slate-900 cursor-pointer"
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
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-emerald-500/10 font-bold text-emerald-700">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    Hired Alumni at {selectedCompanyForAlumni.name}
                    {selectedCompanyForAlumni.isVerified && (
                      <CheckCircle2 className="inline-block h-4 w-4 text-emerald-600" />
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
                className="p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={alumniSearchQuery}
                    onChange={(e) => setAlumniSearchQuery(e.target.value)}
                    placeholder="Search alumni by name, email, or department..."
                    className="w-full border border-slate-200 py-2 pl-9 pr-4 text-xs focus:border-[#003580] focus:outline-none focus:ring-2 focus:ring-[#003580]/15"
                  />
                </div>
                <div className="text-xs font-medium text-slate-500">
                  {selectedCompanyForAlumni.alumniList?.length || 0} Placements Recorded
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {(selectedCompanyForAlumni.alumniList || []).filter((a: any) => {
                  if (!alumniSearchQuery.trim()) return true;
                  const q = alumniSearchQuery.toLowerCase();
                  return (a.name || '').toLowerCase().includes(q) ||
                         (a.department || '').toLowerCase().includes(q) ||
                         (a.email || '').toLowerCase().includes(q) ||
                         (a.position || '').toLowerCase().includes(q);
                }).map((alumnus: any, idx: number) => (
                  <div key={alumnus.id || idx} className="border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:bg-white">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-[#003580] text-sm font-bold text-white">
                        {(alumnus.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="flex items-center gap-1.5 truncate text-sm font-bold text-slate-900">
                            {alumnus.name}
                            <CheckCircle2 className="inline-block h-3.5 w-3.5 text-emerald-600" />
                          </h4>
                          <span className="bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                            {alumnus.source}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs font-semibold text-slate-700">
                          {alumnus.position || 'Hired Graduate'}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                          <span>🎓 {typeof alumnus.department === 'object' ? (alumnus.department?.name || alumnus.department?.code || 'Engineering') : (alumnus.department || 'Engineering')}</span>
                          <span>•</span>
                          <span>{alumnus.graduationYear}</span>
                        </div>
                        <div className="mt-1 truncate text-[11px] text-slate-400">
                          ✉️ {alumnus.email} {alumnus.phone && `• 📞 ${alumnus.phone}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(!selectedCompanyForAlumni.alumniList || selectedCompanyForAlumni.alumniList.length === 0) && (
                <div className="py-12 text-center text-xs text-slate-400">
                  No individual alumnus profiles recorded for this company entry yet.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-3">
              <button
                type="button"
                onClick={() => setSelectedCompanyForAlumni(null)}
                className="bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-900 cursor-pointer"
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
