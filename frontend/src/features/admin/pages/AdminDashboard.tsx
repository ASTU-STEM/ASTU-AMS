import React, { useMemo, useState } from 'react';
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
} from 'recharts';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';

type TrendTone = 'success' | 'warning';
type TimeRange = '7d' | '30d' | '90d' | '1y';

const statCards = [
  {
    label: 'Total Alumni',
    value: '4,827',
    trend: '+124 this year',
    icon: GraduationCap,
    accent: '#003580',
    chip: 'success' as TrendTone,
  },
  {
    label: 'Total Employers',
    value: '312',
    trend: '+18 this month',
    icon: Building2,
    accent: '#E8A020',
    chip: 'success' as TrendTone,
  },
  {
    label: 'Survey Completion',
    value: '68.4%',
    trend: '+5.2% vs last year',
    icon: ClipboardCheck,
    accent: '#1D9E75',
    chip: 'success' as TrendTone,
  },
  {
    label: 'Active Jobs',
    value: '47',
    trend: '12 expiring soon',
    icon: Briefcase,
    accent: '#7C3AED',
    chip: 'warning' as TrendTone,
  },
];

const employmentData = [
  { department: 'SE', value: 92 },
  { department: 'ME', value: 84 },
  { department: 'CE', value: 89 },
  { department: 'EE', value: 77 },
  { department: 'CHE', value: 95 },
  { department: 'IE', value: 81 },
];

const surveyData = [
  { name: 'Completed', value: 68, color: '#1D9E75' },
  { name: 'Pending', value: 22, color: '#E8A020' },
  { name: 'Never Responded', value: 10, color: '#E24B4A' },
];

const employmentTrendData = [
  { year: '2020', employed: 61, selfEmployed: 14 },
  { year: '2021', employed: 65, selfEmployed: 16 },
  { year: '2022', employed: 70, selfEmployed: 18 },
  { year: '2023', employed: 74, selfEmployed: 20 },
  { year: '2024', employed: 79, selfEmployed: 23 },
];

const hiringCompanies = [
  { name: 'Ethio Telecom', hires: 34 },
  { name: 'Safaricom', hires: 29 },
  { name: 'INSA', hires: 25 },
  { name: 'Ethiopian Airlines', hires: 21 },
  { name: 'Huawei', hires: 18 },
  { name: 'UN Ethiopia', hires: 15 },
  { name: 'CBE', hires: 12 },
].sort((a, b) => b.hires - a.hires);

const systemActivities = [
  { icon: FileSpreadsheet, tone: '#1D9E75', text: 'CSV import completed - 245 records', time: '2 minutes ago' },
  { icon: UserPlus, tone: '#003580', text: 'New employer registered: Safaricom', time: '17 minutes ago' },
  { icon: MessageSquareText, tone: '#E8A020', text: 'Survey #3 sent to 2024 batch', time: '41 minutes ago' },
  { icon: CheckCircle2, tone: '#1D9E75', text: 'Role permissions updated for registrar staff', time: '1 hour ago' },
  { icon: AlertTriangle, tone: '#E8A020', text: 'Backup queue rescheduled for midnight', time: '3 hours ago' },
  { icon: ShieldAlert, tone: '#E24B4A', text: 'Suspicious login attempt blocked', time: '5 hours ago' },
];

const pendingActions = [
  { label: '142 alumni accounts pending verification', action: 'Verify', tone: '#003580' },
  { label: '8 document requests awaiting approval', action: 'Review', tone: '#E8A020' },
  { label: '3 new employer registrations', action: 'Approve', tone: '#1D9E75' },
  { label: 'Survey Wave 3 due in 5 days', action: 'Manage', tone: '#7C3AED' },
];

const skillGaps = [
  { skill: 'Cloud Computing', value: 78 },
  { skill: 'DevOps', value: 71 },
  { skill: 'AI/ML', value: 65 },
  { skill: 'Cyber Security', value: 58 },
  { skill: 'Data Engineering', value: 52 },
];

const quickActions = [
  { label: 'Add User', icon: UserPlus, path: '/admin/users', accent: '#003580' },
  { label: 'Post Job', icon: Briefcase, path: '/admin/jobs', accent: '#7C3AED' },
  { label: 'Create Survey', icon: ClipboardCheck, path: '/admin/surveys', accent: '#1D9E75' },
  { label: 'New Event', icon: Clock3, path: '/admin/events', accent: '#E8A020' },
  { label: 'System Backup', icon: Database, path: '/admin/backup', accent: '#E24B4A' },
  { label: 'Analytics', icon: Activity, path: '/admin/analytics', accent: '#0284C7' },
];

const weeklyRegistrations = [
  { day: 'Mon', alumni: 12, employers: 3 },
  { day: 'Tue', alumni: 8, employers: 5 },
  { day: 'Wed', alumni: 15, employers: 2 },
  { day: 'Thu', alumni: 10, employers: 4 },
  { day: 'Fri', alumni: 6, employers: 1 },
  { day: 'Sat', alumni: 3, employers: 0 },
  { day: 'Sun', alumni: 1, employers: 0 },
];

const systemHealthMetrics = [
  { label: 'API Response Time', value: '124ms', status: 'healthy' as const, trend: '12ms ↓' },
  { label: 'Database Queries', value: '2.4k/min', status: 'healthy' as const, trend: 'Stable' },
  { label: 'Error Rate', value: '0.02%', status: 'healthy' as const, trend: '0.01% ↓' },
  { label: 'Active Sessions', value: '156', status: 'healthy' as const, trend: '+8 today' },
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

function StatusDot({ status }: { status: 'healthy' | 'warning' | 'critical' }) {
  const colors = {
    healthy: 'bg-emerald-400',
    warning: 'bg-amber-400',
    critical: 'bg-rose-400',
  };

  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[status]} shadow-lg ${status === 'healthy' ? 'animate-pulse' : ''}`} />
  );
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const weeklyTotal = useMemo(() =>
    weeklyRegistrations.reduce((sum, d) => sum + d.alumni + d.employers, 0),
  []);

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
        title="Dashboard"
        subtitle="Operational command center for ASTU alumni administration, reporting, and system governance."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
              {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`rounded-md px-2.5 py-1.5 font-semibold transition-all ${
                    timeRange === range
                      ? 'bg-[#003580] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <AdminBadge variant="success">Production Ready</AdminBadge>
          </div>
        }
      />

      {/* Greeting Banner */}
      <section className="pb-2">
        <div className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-gradient-to-br from-[#003580]/8 via-[#E8A020]/5 to-white px-6 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#003580]/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Daily briefing</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {greeting}, System Administrator
              </h2>
              <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
                <span>{today}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>Adama Science and Technology University</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-500/20 bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
              <span className="text-emerald-400 text-[10px] font-normal ml-1">v1.4</span>
            </div>
          </div>
          <div className="relative mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Last sync: 2 min ago</span>
            <span className="flex items-center gap-1"><Database className="w-3 h-3" /> 32.4k records</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 156 active sessions</span>
          </div>
        </div>
      </section>

      {/* KPI Stats Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const styles = statToneClasses[card.accent];

          return (
            <div
              key={card.label}
              className={`admin-card relative group rounded-[12px] border-l-[4px] border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.1)] ${styles.border}`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${styles.circle} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`h-5 w-5 ${styles.label}`} />
                </div>
                <TrendChip text={card.trend} tone={card.chip} />
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-slate-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quick Actions Bar */}
      <section className="admin-card rounded-[12px] border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Quick Actions</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                className="group flex flex-col items-center gap-1.5 rounded-[10px] border border-slate-100 bg-slate-50/50 px-3 py-3 text-center transition-all duration-200 hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: `${action.accent}12`, color: action.accent }}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 group-hover:text-slate-900">{action.label}</span>
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
              <a href="#" className="inline-flex items-center gap-1 text-xs font-semibold text-[#003580] hover:underline">
                View Full Report <ChevronRight className="w-3 h-3" />
              </a>
            }
          >
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employmentData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
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
                      borderRadius: 10,
                      border: '1px solid #E8EDF5',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {employmentData.map((entry, index) => (
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
                    data={surveyData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {surveyData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                    <Label
                      value="68%"
                      position="center"
                      className="text-2xl font-semibold fill-slate-900"
                    />
                    <Label
                      value="Overall Completion"
                      position="center"
                      dy={22}
                      className="text-[11px] font-medium fill-slate-500"
                    />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
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

      {/* Weekly Registrations & Hiring Trends */}
      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title={`Weekly Registrations (${weeklyTotal} total)`}
          subtitle="New alumni and employer registrations over the past 7 days."
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRegistrations} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E8EDF5',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, color: '#475569' }} />
                <Bar dataKey="alumni" name="Alumni" radius={[6, 6, 0, 0]} fill="#003580" />
                <Bar dataKey="employers" name="Employers" radius={[6, 6, 0, 0]} fill="#E8A020" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Graduate Employment Trends (2020-2024)"
          subtitle="Employment distribution by career path across recent graduating cohorts."
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={employmentTrendData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="employedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003580" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#003580" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="selfEmployedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8A020" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#E8A020" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
                <XAxis dataKey="year" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E8EDF5',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, color: '#475569' }} />
                <Line type="monotone" dataKey="employed" name="Employed" stroke="#003580" strokeWidth={3} dot={{ r: 4, fill: '#003580' }} />
                <Line type="monotone" dataKey="selfEmployed" name="Self-Employed" stroke="#E8A020" strokeWidth={3} dot={{ r: 4, fill: '#E8A020' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      {/* System Health */}
      <section className="admin-card rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">System Health</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <StatusDot status="healthy" />
            All systems operational
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemHealthMetrics.map((metric) => (
            <div key={metric.label} className="rounded-[10px] border border-slate-100 bg-slate-50/50 p-4 transition-all duration-200 hover:border-slate-200 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{metric.label}</span>
                <StatusDot status={metric.status} />
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-500">{metric.trend}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Row */}
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="admin-card rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent System Activity</h3>
              <p className="mt-1 text-xs text-slate-500">Latest administrative actions and sync events.</p>
            </div>
            <AdminBadge variant="neutral">Live Feed</AdminBadge>
          </div>

          <div className="mt-5 space-y-4">
            {systemActivities.map((entry) => {
              const Icon = entry.icon;
              return (
                <div key={entry.text} className="flex gap-3 group">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors">
                    <Icon className="h-4 w-4" style={{ color: entry.tone }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">{entry.text}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{entry.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-card rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Pending Actions</h3>
            <p className="mt-1 text-xs text-slate-500">Tasks waiting for administrative review.</p>
          </div>

          <div className="mt-5 space-y-3">
            {pendingActions.map((task) => (
              <div
                key={task.label}
                className="group rounded-[10px] border border-slate-200 border-l-4 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                style={{ borderLeftColor: task.tone }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-700">{task.label}</p>
                  <button
                    type="button"
                    className="rounded-md px-3 py-1 text-xs font-semibold text-white transition-all hover:brightness-110 hover:shadow-md"
                    style={{ backgroundColor: task.tone }}
                  >
                    {task.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button type="button" className="flex items-center gap-1 text-xs font-semibold text-[#003580] hover:underline">
              View All Tasks <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="admin-card rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Skill Gap Alert</h3>
              <p className="mt-1 text-xs text-slate-500">Top Missing Skills Reported by Employers</p>
            </div>
            <AdminBadge variant="warning">Curriculum Input</AdminBadge>
          </div>

          <div className="mt-5 space-y-4">
            {skillGaps.map((item) => (
              <div key={item.skill} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{item.skill}</span>
                  <span className="font-semibold text-slate-500">{item.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="relative h-full rounded-full bg-gradient-to-r from-[#003580] via-[#5B7FB8] to-[#E8A020] transition-all duration-500"
                    style={{ width: `${item.value}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Based on 94 employer feedback submissions</span>
            <button type="button" className="font-semibold text-[#003580] hover:underline">
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
              <BarChart data={hiringCompanies} layout="vertical" margin={{ top: 12, right: 24, left: 12, bottom: 0 }}>
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
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>
    </div>
  );
}
