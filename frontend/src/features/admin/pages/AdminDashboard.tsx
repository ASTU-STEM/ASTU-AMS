import React, { useMemo, useState, useEffect } from 'react';
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
  TrendingUp,
  Sparkles,
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
import useAdminAnalytics from '../hooks/useAdminAnalytics';
import { adminApi } from '../api/adminApi';

type TrendTone = 'success' | 'warning';
type TimeRange = '7d' | '30d' | '90d' | '1y';

// Quick actions remain static as they are navigation links
const quickActions = [
  { label: 'Add User', icon: UserPlus, path: '/admin/users', accent: '#003580' },
  { label: 'Post Job', icon: Briefcase, path: '/admin/jobs', accent: '#7C3AED' },
  { label: 'Create Survey', icon: ClipboardCheck, path: '/admin/surveys', accent: '#1D9E75' },
  { label: 'New Event', icon: Clock3, path: '/admin/events', accent: '#E8A020' },
  { label: 'System Backup', icon: Database, path: '/admin/backup', accent: '#E24B4A' },
  { label: 'Analytics', icon: Activity, path: '/admin/analytics', accent: '#0284C7' },
];

// System health metrics remain static as they are system monitoring data
const systemHealthMetrics = [
  { label: 'API Response Time', value: '124ms', status: 'healthy' as const, trend: '12ms ↓' },
  { label: 'Database Queries', value: '2.4k/min', status: 'healthy' as const, trend: 'Stable' },
  { label: 'Error Rate', value: '0.02%', status: 'healthy' as const, trend: '0.01% ↓' },
  { label: 'Active Sessions', value: '156', status: 'healthy' as const, trend: '+8 today' },
];

const statToneClasses: Record<string, { 
  circle: string; 
  label: string; 
  border: string; 
  gradient: string;
  bgGradient: string;
}> = {
  '#003580': { 
    circle: 'bg-gradient-to-br from-[#003580]/20 to-[#003580]/5 text-[#003580]', 
    label: 'text-[#003580]', 
    border: 'border-[#003580]',
    gradient: 'from-[#003580] via-[#004499] to-[#003580]',
    bgGradient: 'bg-gradient-to-br from-[#003580]/5 via-white to-[#003580]/5'
  },
  '#E8A020': { 
    circle: 'bg-gradient-to-br from-[#E8A020]/20 to-[#E8A020]/5 text-[#B87900]', 
    label: 'text-[#B87900]', 
    border: 'border-[#E8A020]',
    gradient: 'from-[#E8A020] via-[#F5B942] to-[#E8A020]',
    bgGradient: 'bg-gradient-to-br from-[#E8A020]/5 via-white to-[#E8A020]/5'
  },
  '#1D9E75': { 
    circle: 'bg-gradient-to-br from-[#1D9E75]/20 to-[#1D9E75]/5 text-[#1D9E75]', 
    label: 'text-[#1D9E75]', 
    border: 'border-[#1D9E75]',
    gradient: 'from-[#1D9E75] via-[#24C495] to-[#1D9E75]',
    bgGradient: 'bg-gradient-to-br from-[#1D9E75]/5 via-white to-[#1D9E75]/5'
  },
  '#7C3AED': { 
    circle: 'bg-gradient-to-br from-violet-500/20 to-violet-500/5 text-violet-600', 
    label: 'text-violet-600', 
    border: 'border-violet-500',
    gradient: 'from-violet-500 via-violet-400 to-violet-500',
    bgGradient: 'bg-gradient-to-br from-violet-500/5 via-white to-violet-500/5'
  },
};

function TrendChip({ text, tone }: { text: string; tone: TrendTone }) {
  const classes =
    tone === 'success'
      ? 'bg-gradient-to-r from-[#1D9E75]/10 to-[#1D9E75]/5 text-[#1D9E75] border-[#1D9E75]/20'
      : 'bg-gradient-to-r from-[#EF9F27]/10 to-[#EF9F27]/5 text-[#B86D00] border-[#EF9F27]/20';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-sm ${classes}`}>
      <TrendingUp className="w-3 h-3" />
      {text}
    </span>
  );
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
    <div className="admin-card rounded-[16px] border border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-slate-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
          </div>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
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
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useAdminAnalytics();
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [weeklyRegistrations, setWeeklyRegistrations] = useState<any[]>([]);
  const [systemActivities, setSystemActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Fetch additional dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);

        // Fetch pending actions, weekly registrations, and system activities in parallel
        const [pendingActionsData, weeklyRegistrationsData, systemLogsData] = await Promise.all([
          adminApi.getPendingActions(),
          adminApi.getWeeklyRegistrations(),
          adminApi.listLogs({ limit: 10 })
        ]);

        setPendingActions(pendingActionsData?.pendingActions || []);
        setWeeklyRegistrations(weeklyRegistrationsData?.weeklyRegistrations || []);
        setSystemActivities(systemLogsData?.logs || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const weeklyTotal = useMemo(() =>
    weeklyRegistrations.reduce((sum: number, d: any) => sum + (d.alumni || 0) + (d.employers || 0), 0),
  [weeklyRegistrations]);

  // Derive stat cards from analytics data
  const statCards = useMemo(() => {
    if (!analyticsData) {
      // Fallback to default values while loading
      return [
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
    }

    // Use real analytics data when available
    const surveyCompletion = analyticsData.surveyCompletion?.overall || 0;
    return [
      {
        label: 'Total Alumni',
        value: analyticsData.employmentRate?.totalAlumni?.toLocaleString() || '4,827',
        trend: '+124 this year',
        icon: GraduationCap,
        accent: '#003580',
        chip: 'success' as TrendTone,
      },
      {
        label: 'Total Employers',
        value: analyticsData.topEmployers?.length?.toLocaleString() || '312',
        trend: '+18 this month',
        icon: Building2,
        accent: '#E8A020',
        chip: 'success' as TrendTone,
      },
      {
        label: 'Survey Completion',
        value: `${surveyCompletion}%`,
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
  }, [analyticsData]);

  // Derive employment data from analytics
  const employmentData = useMemo(() => {
    if (!analyticsData?.employmentRate) {
      return [
        { department: 'SE', value: 92 },
        { department: 'ME', value: 84 },
        { department: 'CE', value: 89 },
        { department: 'EE', value: 77 },
        { department: 'CHE', value: 95 },
        { department: 'IE', value: 81 },
      ];
    }
    return analyticsData.employmentRate || [];
  }, [analyticsData]);

  // Derive survey data from analytics
  const surveyData = useMemo(() => {
    if (!analyticsData?.surveyCompletion) {
      return [
        { name: 'Completed', value: 68, color: '#1D9E75' },
        { name: 'Pending', value: 22, color: '#E8A020' },
        { name: 'Never Responded', value: 10, color: '#E24B4A' },
      ];
    }
    const completion = analyticsData.surveyCompletion;
    return [
      { name: 'Completed', value: completion.completed || 68, color: '#1D9E75' },
      { name: 'Pending', value: completion.pending || 22, color: '#E8A020' },
      { name: 'Never Responded', value: completion.neverResponded || 10, color: '#E24B4A' },
    ];
  }, [analyticsData]);

  // Derive employment trend data from analytics
  const employmentTrendData = useMemo(() => {
    if (!analyticsData?.hiringTrend) {
      return [
        { year: '2020', employed: 61, selfEmployed: 14 },
        { year: '2021', employed: 65, selfEmployed: 16 },
        { year: '2022', employed: 70, selfEmployed: 18 },
        { year: '2023', employed: 74, selfEmployed: 20 },
        { year: '2024', employed: 79, selfEmployed: 23 },
      ];
    }
    return analyticsData.hiringTrend || [];
  }, [analyticsData]);

  // Derive hiring companies from analytics
  const hiringCompanies = useMemo(() => {
    if (!analyticsData?.topEmployers) {
      return [
        { name: 'Ethio Telecom', hires: 34 },
        { name: 'Safaricom', hires: 29 },
        { name: 'INSA', hires: 25 },
        { name: 'Ethiopian Airlines', hires: 21 },
        { name: 'Huawei', hires: 18 },
        { name: 'UN Ethiopia', hires: 15 },
        { name: 'CBE', hires: 12 },
      ].sort((a, b) => b.hires - a.hires);
    }
    return (analyticsData.topEmployers || []).map((emp: any) => ({
      name: emp.companyName || emp.name,
      hires: emp.hiresCount || emp.hires || 0,
    })).sort((a, b) => b.hires - a.hires);
  }, [analyticsData]);

  // Derive skill gaps from analytics
  const skillGaps = useMemo(() => {
    if (!analyticsData?.skillGaps) {
      return [
        { skill: 'Cloud Computing', value: 78 },
        { skill: 'DevOps', value: 71 },
        { skill: 'AI/ML', value: 65 },
        { skill: 'Cyber Security', value: 58 },
        { skill: 'Data Engineering', value: 52 },
      ];
    }
    return (analyticsData.skillGaps || []).slice(0, 5).map((gap: any) => ({
      skill: gap.skill || gap.name,
      value: gap.value || gap.percentage || 0,
    }));
  }, [analyticsData]);

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

      {/* Unified Header */}
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#003580] via-[#004499] to-[#003580] px-10 py-8 shadow-lg">
          {/* ASTU brand pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          </div>
          
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-5 mb-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-white">
                    {greeting}, System Administrator
                  </h1>
                  <p className="text-base text-white/80 mt-1">{today} · Adama Science and Technology University</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <div className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm p-0.5">
                {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    className={`rounded-md px-5 py-2.5 text-sm font-semibold transition-all ${
                      timeRange === range
                        ? 'bg-white text-[#003580] shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </div>
            </div>
          </div>
          
          {/* System Stats Bar */}
          <div className="relative mt-6 pt-5 border-t border-white/20 flex items-center gap-8 text-base text-white/80">
            <span className="flex items-center gap-2 font-medium"><RefreshCw className="w-4.5 h-4.5" /> Last sync: 2 min ago</span>
            <span className="flex items-center gap-2 font-medium"><Database className="w-4.5 h-4.5" /> 32.4k records</span>
            <span className="flex items-center gap-2 font-medium"><Users className="w-4.5 h-4.5" /> 156 active sessions</span>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mt-4">
          <span className="font-medium text-slate-900">Admin</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-900">Dashboard</span>
        </nav>
      </div>

      {/* KPI Stats Cards */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const styles = statToneClasses[card.accent];

          return (
            <div
              key={card.label}
              onClick={() => {
                // Navigate to relevant page based on card type
                if (card.label === 'Total Alumni') {
                  navigate('/admin/users');
                } else if (card.label === 'Total Employers') {
                  navigate('/admin/jobs');
                } else if (card.label === 'Survey Completion') {
                  navigate('/admin/surveys');
                } else if (card.label === 'Active Jobs') {
                  navigate('/admin/jobs');
                }
              }}
              className={`admin-card relative group overflow-hidden rounded-[16px] border border-slate-200/60 ${styles.bgGradient} p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] hover:border-slate-300 cursor-pointer`}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Glow effect */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${styles.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
              
              <div className="relative flex items-start justify-between gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${styles.circle} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                  <Icon className={`h-6 w-6 ${styles.label}`} />
                </div>
                <TrendChip text={card.trend} tone={card.chip} />
              </div>
              <div className="relative mt-5 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
                <p className="text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quick Actions Bar */}
      <section className="admin-card rounded-[16px] border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Actions</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="group flex flex-col items-center gap-2.5 rounded-[14px] border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white px-4 py-4 text-center transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gradient-to-br hover:from-white hover:to-slate-50 cursor-pointer"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${action.accent}15 0%, ${action.accent}25 100%)`,
                    color: action.accent 
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{action.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Charts Row */}
      <section className="grid gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3 admin-card">
          <ChartCard
            title="Employment Rate by Department"
            subtitle="Percentage of alumni employed within each department group."
            action={
              <button 
                onClick={() => navigate('/admin/analytics')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003580] hover:underline transition-all hover:gap-2 cursor-pointer"
              >
                View Full Report <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employmentData} margin={{ top: 24, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E8EDF5" opacity={0.6} />
                  <XAxis dataKey="department" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
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
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={36}>
                    {employmentData.map((entry, index) => (
                      <Cell key={`cell-${entry.department}`} fill={index === 4 ? '#E8A020' : '#003580'} />
                    ))}
                    <LabelList dataKey="value" position="top" formatter={(value: number) => `${value}%`} fill="#334155" fontSize={12} fontWeight={600} />
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
                onClick={() => navigate('/admin/surveys')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003580] hover:underline transition-all hover:gap-2 cursor-pointer"
              >
                View Surveys <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={surveyData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={78}
                    outerRadius={115}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {surveyData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                    <Label
                      value="68%"
                      position="center"
                      className="text-3xl font-bold fill-slate-900"
                    />
                    <Label
                      value="Overall Completion"
                      position="center"
                      dy={26}
                      className="text-[11px] font-medium fill-slate-500"
                    />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E8EDF5',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 20, fontSize: 12, fontWeight: 500, color: '#475569' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </section>

      {/* Weekly Registrations & Hiring Trends */}
      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title={`Weekly Registrations (${weeklyTotal} total)`}
          subtitle="New alumni and employer registrations over the past 7 days."
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRegistrations} margin={{ top: 24, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E8EDF5" opacity={0.6} />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E8EDF5',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, fontWeight: 500, color: '#475569' }} />
                <Bar dataKey="alumni" name="Alumni" radius={[8, 8, 0, 0]} fill="#003580" barSize={24} />
                <Bar dataKey="employers" name="Employers" radius={[8, 8, 0, 0]} fill="#E8A020" barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Graduate Employment Trends (2020-2024)"
          subtitle="Employment distribution by career path across recent graduating cohorts."
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={employmentTrendData} margin={{ top: 24, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="employedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003580" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#003580" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="selfEmployedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8A020" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E8A020" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#E8EDF5" opacity={0.6} />
                <XAxis dataKey="year" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E8EDF5',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, fontWeight: 500, color: '#475569' }} />
                <Line 
                  type="monotone" 
                  dataKey="employed" 
                  name="Employed" 
                  stroke="#003580" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#003580', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#003580', strokeWidth: 2, stroke: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="selfEmployed" 
                  name="Self-Employed" 
                  stroke="#E8A020" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#E8A020', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#E8A020', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      {/* System Health */}
      <section className="admin-card rounded-[16px] border border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg">
            <Activity className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">System Health</span>
          </div>
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <StatusDot status="healthy" />
            All systems operational
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemHealthMetrics.map((metric) => (
            <div key={metric.label} className="rounded-[14px] border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-5 transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{metric.label}</span>
                <StatusDot status={metric.status} />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{metric.value}</p>
              <p className="mt-1.5 text-xs text-slate-500 font-medium">{metric.trend}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Row */}
      <section className="grid gap-5 xl:grid-cols-3">
        <div className="admin-card rounded-[16px] border border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-slate-300">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Recent System Activity</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">Latest administrative actions and sync events.</p>
            </div>
            <AdminBadge variant="neutral">Live Feed</AdminBadge>
          </div>

          <div className="mt-6 space-y-4">
            {systemActivities.map((entry) => {
              const Icon = entry.icon;
              return (
                <div key={entry.text} className="flex gap-3 group">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 group-hover:from-slate-200 group-hover:to-slate-100 transition-all duration-300">
                    <Icon className="h-5 w-5" style={{ color: entry.tone }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700 font-medium">{entry.text}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{entry.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-card rounded-[16px] border border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-slate-300">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Pending Actions</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">Tasks waiting for administrative review.</p>
          </div>

          <div className="mt-6 space-y-3">
            {pendingActions.map((task) => (
              <div
                key={task.label}
                className="group rounded-[12px] border border-slate-200/60 border-l-4 bg-gradient-to-r from-white to-slate-50/50 p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300"
                style={{ borderLeftColor: task.tone }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-700">{task.label}</p>
                  <button
                    type="button"
                    onClick={() => {
                      // Handle pending action - will integrate with backend later
                      console.log(`Pending action clicked: ${task.label}`);
                      // Navigate to appropriate page based on action type
                      if (task.action === 'Review') {
                        navigate('/admin/users');
                      } else if (task.action === 'Approve') {
                        navigate('/admin/jobs');
                      }
                    }}
                    className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-110 hover:shadow-md cursor-pointer"
                    style={{ backgroundColor: task.tone }}
                  >
                    {task.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200/60">
            <button 
              type="button" 
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#003580] hover:underline transition-all hover:gap-2 cursor-pointer"
            >
              View All Tasks <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="admin-card rounded-[16px] border border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-slate-300">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Skill Gap Alert</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">Top Missing Skills Reported by Employers</p>
            </div>
            <AdminBadge variant="warning">Curriculum Input</AdminBadge>
          </div>

          <div className="mt-6 space-y-4">
            {skillGaps.map((item) => (
              <div key={item.skill} className="space-y-2.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{item.skill}</span>
                  <span className="font-semibold text-slate-500">{item.value}%</span>
                </div>
                <div className="h-3.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="relative h-full rounded-full bg-gradient-to-r from-[#003580] via-[#5B7FB8] to-[#E8A020] transition-all duration-700 ease-out"
                    style={{ width: `${item.value}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-200/60 pt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Based on 94 employer feedback submissions</span>
            <button 
              type="button" 
              onClick={() => navigate('/admin/analytics')}
              className="font-semibold text-[#003580] hover:underline transition-all cursor-pointer"
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
              onClick={() => navigate('/admin/analytics')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003580] hover:underline transition-all hover:gap-2 cursor-pointer"
            >
              View All <ExternalLink className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hiringCompanies} layout="vertical" margin={{ top: 16, right: 28, left: 16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E8EDF5" opacity={0.6} horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [value, 'Hires']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E8EDF5',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                />
                <Bar dataKey="hires" radius={[0, 10, 10, 0]} fill="#003580" barSize={28}>
                  <LabelList dataKey="hires" position="right" fill="#334155" fontSize={12} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>
    </div>
  );
}
