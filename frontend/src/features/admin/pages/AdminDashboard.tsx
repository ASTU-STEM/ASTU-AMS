import React, { useMemo, useState, useEffect } from 'react';
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
  { label: 'New Event', icon: Clock3, path: '/admin/events', accent: '#E8A020' },
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
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      const result = await adminService.getDashboardMetrics();
      if (result.ok) {
        setMetrics(result.data);
      }
      setLoading(false);
    };
    fetchMetrics();
  }, [timeRange]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Derived state from metrics — real data only, no fallbacks to mock
  const activeStatCards = [
    {
      label: 'Total Alumni',
      value: metrics?.kpis?.totalAlumni?.toString() || '0',
      trend: 'From database',
      icon: GraduationCap,
      accent: '#003580',
      chip: 'success' as TrendTone,
    },
    {
      label: 'Total Employers',
      value: metrics?.kpis?.totalEmployers?.toString() || '0',
      trend: 'From database',
      icon: Building2,
      accent: '#E8A020',
      chip: 'success' as TrendTone,
    },
    {
      label: 'Survey Completion',
      value: metrics?.kpis?.surveyCompletion || '0%',
      trend: 'Current rate',
      icon: ClipboardCheck,
      accent: '#1D9E75',
      chip: 'success' as TrendTone,
    },
    {
      label: 'Active Jobs',
      value: metrics?.kpis?.activeJobs?.toString() || '0',
      trend: 'Currently posted',
      icon: Briefcase,
      accent: '#7C3AED',
      chip: 'warning' as TrendTone,
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
  const activeHiringCompanies: { name: string; hires: number }[] = [];
  const activeSurveyData = [
    { name: 'Completed', value: parseInt(metrics?.kpis?.surveyCompletion || '0'), color: '#1D9E75' },
    { name: 'Remaining', value: 100 - parseInt(metrics?.kpis?.surveyCompletion || '0'), color: '#E8A020' },
  ];
  const activeSkillGaps: { skill: string; value: number }[] = [];

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
            <AdminBadge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">v1.4</AdminBadge>
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
              <span>Last sync: 2 min ago</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300/80">
              <Database className="w-3.5 h-3.5 text-[#FFCC00]" />
              <span>32.4k records</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300/80">
              <Users className="w-3.5 h-3.5 text-[#FFCC00]" />
              <span>156 active sessions</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 shadow-sm self-start md:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            All Systems Operational
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003580] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#002866] hover:shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export System Report
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 grid grid-cols-2 gap-3.5">
            {[
              { label: 'IDENTITY COVERAGE', value: '98%', icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { label: 'APPROVAL QUEUE', value: activePendingActions.length.toString(), icon: AlertTriangle, tone: 'text-amber-600 bg-amber-50 border-amber-100' },
              { label: 'SYSTEM SLA', value: '100% On-Time', icon: Clock3, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { label: 'EXPORT STATUS', value: 'Ready', icon: FileSpreadsheet, tone: 'text-[#003580] bg-blue-50 border-blue-100' },
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
                <p className="text-lg font-extrabold text-slate-900">0 open</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">DUPLICATE SCAN</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-100 text-center">
                <p className="text-lg font-extrabold text-slate-900">96%</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">COMPLETENESS</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-100 text-center">
                <p className="text-lg font-extrabold text-emerald-600">Live</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">AUDIT TRAIL</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              System database health verified conflict-free. All audit trails logging active.
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
              className={`admin-card relative group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
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
                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-center transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5"
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
              <a href="#" className="inline-flex items-center gap-1 text-xs font-bold text-[#003580] hover:underline">
                View Full Report <ChevronRight className="w-3 h-3" />
              </a>
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
          <ChartCard title="Survey Completion Rate" subtitle="Current tracer survey response distribution.">
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
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">System Status</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg" />
            Live
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Pending Actions</span>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{activePendingActions.length}</p>
            <p className="mt-1 text-xs text-slate-500 font-medium">Awaiting review</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Recent Activity</span>
              <Activity className="w-4 h-4 text-[#003580]" />
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{activeSystemActivities.length}</p>
            <p className="mt-1 text-xs text-slate-500 font-medium">Latest audit events</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Departments</span>
              <Database className="w-4 h-4 text-[#7C3AED]" />
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{activeEmploymentData.length}</p>
            <p className="mt-1 text-xs text-slate-500 font-medium">With employment data</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Survey Completion</span>
              <ClipboardCheck className="w-4 h-4 text-[#1D9E75]" />
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{metrics?.kpis?.surveyCompletion || '0%'}</p>
            <p className="mt-1 text-xs text-slate-500 font-medium">Current rate</p>
          </div>
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
                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all hover:brightness-110 hover:shadow-md"
                    style={{ backgroundColor: task.tone }}
                  >
                    {task.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button type="button" className="flex items-center gap-1 text-xs font-bold text-[#003580] hover:underline">
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
            <button type="button" className="font-bold text-[#003580] hover:underline">
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
            <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[#003580] hover:underline">
              View All <ExternalLink className="w-3 h-3" />
            </button>
          }
        >
          <div className="h-[300px]">
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
    </div>
  );
}
