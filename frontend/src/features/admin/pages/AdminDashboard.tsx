import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  ClipboardCheck,
  GraduationCap,
  Clock3,
  FileSpreadsheet,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Search,
  Users,
  Zap,
  Activity,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Database,
  Globe,
  X,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  LabelList,
} from 'recharts';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminStatGrid from '../components/AdminStatGrid';
import AdminEmptyState from '../components/AdminEmptyState';
import AdminSectionCard, {
  adminPanelClass,
  adminTableHeadClass,
  adminTableRowClass,
} from '../components/AdminSectionCard';
import InstitutionalHubBridge from '../../../components/InstitutionalHubBridge';
import { adminService } from '../services/admin.service';
import { useAuth } from '../../../contexts/AuthContext';
import type { AdminStatCardData } from '../types/admin.types';

type TimeRange = '7d' | '30d' | '90d' | '1y';

const quickActions = [
  { label: 'Add User', icon: UserPlus, path: '/admin/users', accent: '#003580' },
  { label: 'Post Job', icon: Briefcase, path: '/admin/jobs', accent: '#7C3AED' },
  { label: 'Create Survey', icon: ClipboardCheck, path: '/admin/surveys', accent: '#1D9E75' },
  { label: 'New Event', icon: Clock3, path: '/cms/events', accent: '#E8A020' },
  { label: 'System Backup', icon: Database, path: '/admin/backup', accent: '#E24B4A' },
  { label: 'Analytics', icon: Activity, path: '/admin/analytics', accent: '#0284C7' },
];

function StatusDot({ status }: { status: string }) {
  const classes: Record<string, string> = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${classes[status] || 'bg-[var(--text-muted)]'}`}
      aria-hidden="true"
    />
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
  const kpiStats: AdminStatCardData[] = [
    {
      title: 'Total Alumni',
      value: metrics?.kpis?.totalAlumni?.toString() || '0',
      description: 'From database',
      icon: GraduationCap,
      tone: 'blue',
      trend: loading ? 'Loading' : metrics ? 'Live' : 'No data',
      trendDirection: 'flat',
      loading,
      onClick: () => navigate('/admin/users?role=ALUMNI'),
    },
    {
      title: 'Total Employers',
      value: metrics?.kpis?.totalEmployers?.toString() || '0',
      description: 'From database',
      icon: Building2,
      tone: 'gold',
      trend: loading ? 'Loading' : metrics ? 'Live' : 'No data',
      trendDirection: 'flat',
      loading,
      onClick: () => navigate('/admin/users?role=EMPLOYER'),
    },
    {
      title: 'Survey Completion',
      value: metrics?.kpis?.surveyCompletion || '0%',
      description: 'Current rate',
      icon: ClipboardCheck,
      tone: 'green',
      trend: loading ? 'Loading' : metrics ? 'Live' : 'No data',
      trendDirection: 'flat',
      loading,
      onClick: () => navigate('/admin/surveys'),
    },
    {
      title: 'Active Jobs',
      value: metrics?.kpis?.activeJobs?.toString() || '0',
      description: 'Currently posted',
      icon: Briefcase,
      tone: 'purple',
      trend: loading ? 'Loading' : metrics ? 'Live' : 'No data',
      trendDirection: 'flat',
      loading,
      onClick: () => navigate('/admin/jobs'),
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
    percentage: c.percentage ?? 0,
    postedJobs: 0,
    industry: 'Unspecified',
    isVerified: false,
    location: 'Unspecified',
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
              <span>Last sync: {metrics?.headerInfo?.lastSync || (loading ? '…' : 'Never synced')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300/80">
              <Database className="w-3.5 h-3.5 text-[#FFCC00]" />
              <span>{metrics?.headerInfo?.totalRecords || (loading ? '…' : '0 records')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300/80">
              <Users className="w-3.5 h-3.5 text-[#FFCC00]" />
              <span>{metrics?.headerInfo?.activeSessions || (loading ? '…' : '0 registered users')}</span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm self-start md:self-auto ${systemStatus.color}`}>
            <span className={`h-2 w-2 rounded-full animate-pulse ${systemStatus.dot}`} />
            {systemStatus.label}
          </div>
        </div>
      </AdminPageHeader>

      <InstitutionalHubBridge currentHub="admin" />

      {/* Executive Directorate Institutional Gateway & Health Strip — live metrics only */}
      <section className={`${adminPanelClass} p-4`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#003580]/10 text-[#003580] dark:bg-[#15294A] dark:text-[#22D3EE] flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Executive Directorate Institutional Gateway</span>
                {(() => {
                  const hubsOnline = metrics?.gatewayStrip?.hubsOnline;
                  const hubsTotal = metrics?.gatewayStrip?.hubsTotal ?? 4;
                  const allUp = typeof hubsOnline === 'number' && hubsOnline === hubsTotal;
                  return (
                    <AdminBadge variant={loading || hubsOnline == null ? 'neutral' : allUp ? 'success' : 'warning'}>
                      {loading
                        ? 'Checking hubs…'
                        : metrics?.gatewayStrip?.hubsLabel || `${hubsOnline ?? 0} of ${hubsTotal} core hubs online`}
                    </AdminBadge>
                  );
                })()}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Live status for Registrar SIS, Fayda National ID (Didit), Chapa payment rail, and document SLA — from settings and database counts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2">
              <ShieldCheck className={`w-4 h-4 ${metrics?.gatewayStrip?.fayda?.healthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-muted)]'}`} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Fayda ID Gateway</div>
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  {loading ? '…' : metrics?.gatewayStrip?.fayda?.status || 'Not configured'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2">
              <Database className={`w-4 h-4 ${metrics?.gatewayStrip?.sis?.healthy ? 'text-[#003580] dark:text-[#22D3EE]' : 'text-[var(--text-muted)]'}`} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">SIS Roster Sync</div>
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  {loading ? '…' : metrics?.gatewayStrip?.sis?.status || '0 records'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] px-3 py-2">
              <Zap className={`w-4 h-4 ${metrics?.gatewayStrip?.systemSLA?.healthy ? 'text-amber-500' : 'text-[var(--text-muted)]'}`} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Document SLA</div>
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  {loading ? '…' : metrics?.gatewayStrip?.systemSLA?.status || metrics?.commandCenter?.systemSLA || 'No requests yet'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Command Center */}
      <AdminSectionCard
        title="Admin Command Center"
        subtitle="Unified governance layer for system health, user approvals, active jobs, and database sync status."
        action={
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
                ['Document SLA', metrics?.commandCenter?.systemSLA || 'No requests yet'],
                ['Profile Completeness', metrics?.commandCenter?.completeness || '0%'],
                ['Total Database Records', metrics?.headerInfo?.totalRecords || '0 records'],
                ['SIS Roster', metrics?.gatewayStrip?.sis?.status || '0 records'],
                ['Fayda Gateway', metrics?.gatewayStrip?.fayda?.status || 'Not configured'],
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
        }
      >
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7 grid grid-cols-2 gap-3">
            {[
              { label: 'IDENTITY COVERAGE', value: metrics?.commandCenter?.identityCoverage || '0%', icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50 dark:bg-[#163828] border-emerald-100 dark:border-[#22C55E]/30' },
              { label: 'APPROVAL QUEUE', value: (metrics?.commandCenter?.approvalQueueCount ?? 0).toString(), icon: AlertTriangle, tone: 'text-amber-600 bg-amber-50 dark:bg-[#382B14] border-amber-100 dark:border-[#F59E0B]/30' },
              { label: 'DOCUMENT SLA', value: metrics?.commandCenter?.systemSLA || 'No requests yet', icon: Clock3, tone: 'text-emerald-600 bg-emerald-50 dark:bg-[#163828] border-emerald-100 dark:border-[#22C55E]/30' },
              { label: 'EXPORT STATUS', value: metrics?.commandCenter?.exportStatus || 'No Data', icon: FileSpreadsheet, tone: 'text-[#003580] dark:text-[#22D3EE] bg-[#003580]/8 dark:bg-[#15294A] border-[#003580]/15 dark:border-[#22D3EE]/30' },
            ].map((sig) => {
              const Icon = sig.icon;
              return (
                <div key={sig.label} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4 transition-all hover:bg-[var(--bg-card)] hover:shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg border text-sm ${sig.tone}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{sig.label}</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-[var(--text-primary)] tracking-tight">{sig.value}</p>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">System Data Quality</span>
              <AdminBadge variant="success">Monitored</AdminBadge>
            </div>

            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-center">
                <p className="text-lg font-bold text-[var(--text-primary)]">{metrics?.commandCenter?.duplicateScan || '0 open'}</p>
                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-0.5">Duplicate Scan</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-center">
                <p className="text-lg font-bold text-[var(--text-primary)]">{metrics?.commandCenter?.completeness || '0%'}</p>
                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-0.5">Completeness</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-center">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{metrics?.commandCenter?.auditTrail || '0 Logged'}</p>
                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-0.5">Audit Trail</p>
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              {metrics?.commandCenter?.healthStatusText || (loading ? 'Loading database health…' : 'No health summary yet — metrics will appear once the database responds.')}
            </p>
          </div>
        </div>
      </AdminSectionCard>

      <AdminStatGrid stats={kpiStats} cols={4} compact />

      <AdminSectionCard title="Quick Actions" subtitle="Jump to common administrative workflows.">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="group flex flex-col items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3.5 text-center transition-all duration-200 hover:bg-[var(--bg-card)] hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: `${action.accent}14`, color: action.accent }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{action.label}</span>
              </button>
            );
          })}
        </div>
      </AdminSectionCard>

      {/* Charts Row */}
      <section className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <AdminSectionCard
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
            <div className="h-[320px]">
              {activeEmploymentData.length === 0 ? (
                <AdminEmptyState
                  icon={Briefcase}
                  title={loading ? 'Loading employment rates…' : 'No employment data yet'}
                  description="Rates appear when alumni profiles include employment status."
                  className="h-full border-0 bg-transparent py-8"
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeEmploymentData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
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
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
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
              )}
            </div>
          </AdminSectionCard>
        </div>

        <div className="xl:col-span-2">
          <AdminSectionCard
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
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
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
          </AdminSectionCard>
        </div>
      </section>

      <AdminSectionCard
        title="System Health"
        subtitle="Live latency, database, and completeness signals."
        action={
          <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: systemStatus.status === 'healthy' ? '#059669' : systemStatus.status === 'warning' ? '#d97706' : '#dc2626' }}>
            <StatusDot status={systemStatus.status} />
            {systemStatus.label}
          </span>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'API Response Time',
              value: metrics?.systemHealth?.apiLatency || (loading ? '…' : '—'),
              status: (metrics?.systemHealth?.apiLatencyNum ?? 0) < 300 ? ('healthy' as const) : ('warning' as const),
              trend: metrics?.systemHealth?.latencyTrend || (loading ? 'Measuring' : 'No sample yet'),
            },
            {
              label: 'Database Status',
              value: metrics?.systemHealth?.dbStatus || metrics?.headerInfo?.totalRecords || (loading ? '…' : '0 records'),
              status: metrics ? ('healthy' as const) : ('warning' as const),
              trend: metrics ? 'Prisma connected' : 'Awaiting metrics',
            },
            {
              label: 'Profile Completeness',
              value: metrics?.systemHealth?.completeness || metrics?.commandCenter?.completeness || '0%',
              status: 'healthy' as const,
              trend: 'Alumni sample score',
            },
            {
              label: 'Registered Users',
              value: metrics?.systemHealth?.activeSessions || metrics?.headerInfo?.activeSessions || (loading ? '…' : '0 registered users'),
              status: 'healthy' as const,
              trend: 'Accounts in database',
            },
          ].map((metric) => (
            <div key={metric.label} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4 transition-all duration-200 hover:bg-[var(--bg-card)] hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{metric.label}</span>
                <StatusDot status={metric.status} />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{metric.value}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)] font-medium">{metric.trend}</p>
            </div>
          ))}
        </div>
      </AdminSectionCard>

      {/* Bottom Row */}
      <section className="grid gap-4 xl:grid-cols-3">
        <AdminSectionCard
          title="Recent System Activity"
          subtitle="Latest administrative actions and sync events."
          action={<AdminBadge variant="neutral">Live Feed</AdminBadge>}
        >
          <div className="space-y-3">
            {activeSystemActivities.length === 0 ? (
              <AdminEmptyState
                icon={Activity}
                title={loading ? 'Loading activity…' : 'No audit events yet'}
                description="Administrative actions will appear here as they are logged."
                className="py-8 border-0 bg-transparent"
              />
            ) : (
              activeSystemActivities.map((entry: any, index: number) => {
                const Icon = entry.icon;
                return (
                  <div key={index} className="flex gap-3 group">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-page)] group-hover:bg-[#003580]/8 dark:group-hover:bg-[var(--bg-hover)] transition-colors">
                      <Icon className="h-4 w-4" style={{ color: entry.tone }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{entry.text}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-muted)] font-medium">{entry.time}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title="Pending Actions"
          subtitle="Tasks waiting for administrative review."
          action={
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#003580] dark:text-[#22D3EE] hover:underline cursor-pointer"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="space-y-3">
            {activePendingActions.length === 0 ? (
              <AdminEmptyState
                icon={ClipboardCheck}
                title={loading ? 'Checking queue…' : 'Queue clear'}
                description="No pending verifications, employer approvals, draft jobs, or document requests."
                className="py-8 border-0 bg-transparent"
              />
            ) : (
              activePendingActions.map((task: any, index: number) => (
                <div
                  key={index}
                  className="group rounded-xl border border-[var(--border-color)] border-l-4 bg-[var(--bg-page)] p-3.5 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                  style={{ borderLeftColor: task.tone }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{task.label}</p>
                    <button
                      type="button"
                      onClick={() => navigate(task.path || '/admin/users')}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all hover:brightness-110 cursor-pointer"
                      style={{ backgroundColor: task.tone }}
                    >
                      {task.action} →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title="Skill Gap Alert"
          subtitle="Top missing skills reported by employers."
          action={<AdminBadge variant="warning">Curriculum Input</AdminBadge>}
        >
          <div className="space-y-3">
            {activeSkillGaps.length > 0 ? activeSkillGaps.map((item) => (
              <div key={item.skill} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-[var(--text-primary)]">{item.skill}</span>
                  <span className="font-bold text-[var(--text-secondary)]">{item.value}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg-page)]">
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-[#003580] via-[#5B7FB8] to-[#E8A020] transition-all duration-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            )) : (
              <AdminEmptyState
                icon={Layers}
                title="No skill gap data yet"
                description="Skill gaps will appear as employer feedback is collected."
                className="py-8 border-0 bg-transparent"
              />
            )}
          </div>

          <div className="mt-4 border-t border-[var(--border-color)] pt-3 flex items-center justify-between text-xs font-medium">
            <span className="text-[var(--text-muted)]">Based on employer feedback</span>
            <button
              type="button"
              onClick={() => navigate('/admin/analytics')}
              className="font-bold text-[#003580] dark:text-[#22D3EE] hover:underline cursor-pointer"
            >
              View Details
            </button>
          </div>
        </AdminSectionCard>
      </section>

      <AdminSectionCard
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
        <div className="h-[280px] cursor-pointer" onClick={() => setIsHiringModalOpen(true)}>
          {activeHiringCompanies.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeHiringCompanies} layout="vertical" margin={{ top: 12, right: 24, left: 12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
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
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="hires" radius={[0, 8, 8, 0]} fill="#003580">
                  <LabelList dataKey="hires" position="right" fill="#334155" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <AdminEmptyState
              icon={Building2}
              title="No hiring data yet"
              description="Hiring volume appears as employers submit placement records."
              className="h-full border-0 bg-transparent py-8"
            />
          )}
        </div>
      </AdminSectionCard>

      {/* Top Hiring Companies Detailed Modal */}
      {isHiringModalOpen && createPortal(
        <div
          onClick={() => setIsHiringModalOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-[95vw] lg:max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-[var(--border-color)] text-[var(--text-primary)]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-page)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#003580]/10 dark:bg-[#15294A] flex items-center justify-center text-[#003580] dark:text-[#22D3EE]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] flex flex-wrap items-center gap-2">
                    Top Hiring Companies &amp; Employer Market Analytics
                    <AdminBadge variant="success">Verified Placement Analytics</AdminBadge>
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Comprehensive graduate hiring statistics, market percentage share, and active job postings across registered organizations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHiringModalOpen(false)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#15294A] border border-blue-100 dark:border-[#22D3EE]/30">
                  <div className="text-xs font-semibold text-blue-800 dark:text-[#22D3EE]">Total System Hires</div>
                  <div className="text-2xl font-black text-[#003580] dark:text-[var(--text-primary)] mt-1">{totalSystemHires}</div>
                  <div className="text-[11px] text-blue-600 dark:text-[#8493A8] mt-1">Verified alumni placements</div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-[#163828] border border-emerald-100 dark:border-[#22C55E]/30">
                  <div className="text-xs font-semibold text-emerald-800 dark:text-[#22C55E]">Registered Companies</div>
                  <div className="text-2xl font-black text-emerald-900 dark:text-[var(--text-primary)] mt-1">{allHiringCompanies.length}</div>
                  <div className="text-[11px] text-emerald-600 dark:text-[#8493A8] mt-1">Active employer profiles</div>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-[#2E1A47] border border-purple-100 dark:border-[#C084FC]/30">
                  <div className="text-xs font-semibold text-purple-800 dark:text-[#C084FC]">Top Hiring Partner</div>
                  <div className="text-lg font-bold text-purple-950 dark:text-[var(--text-primary)] mt-1 truncate">{allHiringCompanies[0]?.name || 'N/A'}</div>
                  <div className="text-[11px] text-purple-700 dark:text-[#8493A8] mt-1">
                    {allHiringCompanies[0]?.percentage || 0}% of all graduate hires
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-[#382B14] border border-amber-100 dark:border-[#F59E0B]/30">
                  <div className="text-xs font-semibold text-amber-800 dark:text-[#F59E0B]">Leading Hiring Sector</div>
                  <div className="text-lg font-bold text-amber-950 dark:text-[var(--text-primary)] mt-1 truncate">{metrics?.leadingSector || allHiringCompanies[0]?.industry || 'Telecommunications'}</div>
                  <div className="text-[11px] text-amber-700 dark:text-[#8493A8] mt-1">Highest employer placement volume</div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8493A8]" />
                  <input
                    type="text"
                    value={hiringSearchQuery}
                    onChange={(e) => setHiringSearchQuery(e.target.value)}
                    placeholder="Search company by name or industry..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-[var(--border-color)] bg-white dark:bg-[var(--bg-card-secondary)] text-slate-900 dark:text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-[#8493A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]/20 focus:border-[#2196F3]"
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-[#8493A8] font-medium">
                  Showing {filteredHiringCompanies.length} of {allHiringCompanies.length} companies
                </div>
              </div>

              {/* Table of Companies */}
              <div className={`${adminPanelClass} overflow-x-auto !shadow-none`}>
                <table className="w-full min-w-[920px] text-left text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className={`${adminTableHeadClass} py-3 px-4 w-14`}>Rank</th>
                      <th className={`${adminTableHeadClass} py-3 px-4`}>Organization Name</th>
                      <th className={`${adminTableHeadClass} py-3 px-4`}>Industry / Sector</th>
                      <th className={`${adminTableHeadClass} py-3 px-4 text-center`}>Hired Alumni Placements</th>
                      <th className={`${adminTableHeadClass} py-3 px-4 w-40`}>Hiring Share (%)</th>
                      <th className={`${adminTableHeadClass} py-3 px-4 text-center`}>Active Jobs</th>
                      <th className={`${adminTableHeadClass} py-3 px-4 text-center`}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHiringCompanies.map((comp, idx) => (
                      <tr
                        key={comp.id || idx}
                        onClick={() => setSelectedCompanyForAlumni(comp)}
                        className={`${adminTableRowClass} cursor-pointer`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-500 dark:text-[#8493A8]">
                          {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-[var(--text-primary)] flex items-center gap-1.5">
                            {comp.name}
                            {comp.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline-block" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-[#8493A8]">{comp.location}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-[var(--text-secondary)] font-medium">
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
                            <div className="flex-1 bg-slate-100 dark:bg-[var(--bg-card-secondary)] rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-[#003580] dark:bg-[#2196F3] h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, Math.max(5, comp.percentage))}%` }}
                              />
                            </div>
                            <span className="font-bold text-[#003580] dark:text-[#22D3EE] w-9 text-right">{comp.percentage}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-[var(--text-secondary)]">
                          {comp.postedJobs > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-[#15294A] text-blue-800 dark:text-[#22D3EE] font-bold text-[11px]">
                              {comp.postedJobs} open
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-[#8493A8] font-normal">0</span>
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
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-[#003580] dark:text-[#22D3EE] bg-blue-50 dark:bg-[#15294A] hover:bg-blue-100 dark:hover:bg-[var(--bg-hover)] rounded-md transition-colors cursor-pointer"
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
            <div className="flex items-center justify-between gap-4 px-6 py-3 border-t border-[var(--border-color)] bg-[var(--bg-page)] text-xs text-[var(--text-muted)]">
              <div>* Placement percentages and market analytics are aggregated from official graduate employment reports and verified partner records.</div>
              <button
                type="button"
                onClick={() => setIsHiringModalOpen(false)}
                className="shrink-0 px-4 py-1.5 bg-[#003580] hover:bg-[#002866] text-white rounded-lg font-semibold transition-colors cursor-pointer"
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
            className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[var(--border-color)] text-[var(--text-primary)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-page)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700 dark:text-[#22C55E] font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                    Hired Alumni at {selectedCompanyForAlumni.name}
                    {selectedCompanyForAlumni.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                    )}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {selectedCompanyForAlumni.industry} • {selectedCompanyForAlumni.location} • {selectedCompanyForAlumni.hires} total placed graduates
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompanyForAlumni(null)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 min-h-0">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8493A8]" />
                  <input
                    type="text"
                    value={alumniSearchQuery}
                    onChange={(e) => setAlumniSearchQuery(e.target.value)}
                    placeholder="Search alumni by name, email, or department..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-[var(--border-color)] bg-white dark:bg-[var(--bg-card-secondary)] text-slate-900 dark:text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-[#8493A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]/20 focus:border-[#2196F3]"
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-[#8493A8] font-medium">
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
                  <div key={alumnus.id || idx} className="p-4 rounded-xl border border-slate-200 dark:border-[var(--border-color)] bg-slate-50/50 dark:bg-[var(--bg-card-secondary)] hover:bg-white dark:hover:bg-[var(--bg-hover)] hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#003580] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {(alumnus.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-[var(--text-primary)] truncate flex items-center gap-1.5">
                            {alumnus.name}
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline-block" />
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 dark:bg-[#15294A] text-blue-800 dark:text-[#22D3EE]">
                            {alumnus.source}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-[var(--text-secondary)] mt-0.5">
                          {alumnus.position || 'Hired Graduate'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-[#8493A8] mt-1 flex items-center gap-2">
                          <span>🎓 {typeof alumnus.department === 'object' ? (alumnus.department?.name || alumnus.department?.code || 'Engineering') : (alumnus.department || 'Engineering')}</span>
                          <span>•</span>
                          <span>{alumnus.graduationYear}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-[#8493A8] mt-1 truncate">
                          ✉️ {alumnus.email} {alumnus.phone && `• 📞 ${alumnus.phone}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(!selectedCompanyForAlumni.alumniList || selectedCompanyForAlumni.alumniList.length === 0) && (
                <AdminEmptyState
                  icon={GraduationCap}
                  title="No alumni profiles recorded"
                  description="Individual placement profiles for this company will appear here when available."
                  className="py-10"
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-3 border-t border-[var(--border-color)] bg-[var(--bg-page)]">
              <button
                type="button"
                onClick={() => setSelectedCompanyForAlumni(null)}
                className="px-4 py-1.5 bg-[#003580] hover:bg-[#002866] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
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
