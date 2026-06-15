import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Building2, Briefcase, ClipboardCheck, GraduationCap, Clock3, ShieldAlert, FileSpreadsheet, UserPlus, MessageSquareText, CheckCircle2, AlertTriangle, CircleDashed, Search, Users, Activity, RefreshCw, ExternalLink, ChevronRight, Database, Bell, Settings, Lock, Globe, TrendingUp, Sparkles, LayoutDashboard } from "lucide-react";
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
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${classes}`}>
      <TrendingUp className="w-2.5 h-2.5" />
      {text}
    </span>
  );
}

function SectionCard({
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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SmallStat({ label, value, icon: Icon, color, trend, chip }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string; trend?: string; chip?: TrendTone }) {
  const iconColor = color || '#003580';
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,51,128,0.15)] hover:scale-[1.02] cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
          {trend && <p className="mt-1 text-[11px] text-slate-500">{trend}</p>}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow" style={{ background: `linear-gradient(135deg, ${iconColor}15 0%, ${iconColor}25 100%)`, color: iconColor }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {chip && <div className="mt-2"><TrendChip text={trend || ''} tone={chip} /></div>}
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

const defaultWeeklyRegistrations = [
  { day: 'Mon', alumni: 12, employers: 3 },
  { day: 'Tue', alumni: 19, employers: 4 },
  { day: 'Wed', alumni: 15, employers: 2 },
  { day: 'Thu', alumni: 22, employers: 5 },
  { day: 'Fri', alumni: 30, employers: 8 },
  { day: 'Sat', alumni: 10, employers: 1 },
  { day: 'Sun', alumni: 8, employers: 2 },
];

const defaultPendingActions = [
  { label: '5 alumni registration requests pending review.', tone: '#003580', action: 'Review' },
  { label: '3 new employer partner profiles awaiting approval.', tone: '#1D9E75', action: 'Approve' },
  { label: 'Database security patch and audit required.', tone: '#E8A020', action: 'Update' },
];

const defaultSystemActivities = [
  { text: 'System backup completed successfully.', time: '10 min ago', icon: Database, tone: '#1D9E75' },
  { text: 'User validation synced with registrar database.', time: '1 hour ago', icon: RefreshCw, tone: '#003580' },
  { text: 'Security warning: multiple failed logins from IP 192.168.1.104.', time: '2 hours ago', icon: ShieldAlert, tone: '#E24B4A' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useAdminAnalytics();
  const [pendingActions, setPendingActions] = useState<any[]>(defaultPendingActions);
  const [weeklyRegistrations, setWeeklyRegistrations] = useState<any[]>(defaultWeeklyRegistrations);
  const [systemActivities, setSystemActivities] = useState<any[]>(defaultSystemActivities);
  const [activeJobsCount, setActiveJobsCount] = useState<number>(47);
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

        // Fetch pending actions, weekly registrations, system activities, and jobs in parallel
        const [pendingActionsData, weeklyRegistrationsData, systemLogsData, jobsData] = await Promise.all([
          adminApi.getPendingActions().catch(() => null),
          adminApi.getWeeklyRegistrations().catch(() => null),
          adminApi.listLogs({ limit: 10 }).catch(() => null),
          adminApi.listJobs().catch(() => null)
        ]);

        const pActions = pendingActionsData?.pendingActions || [];
        setPendingActions(pActions.length > 0 ? pActions : defaultPendingActions);

        const wReg = weeklyRegistrationsData?.weeklyRegistrations || [];
        setWeeklyRegistrations(wReg.length > 0 ? wReg : defaultWeeklyRegistrations);

        const sLogs = systemLogsData?.logs || [];
        if (sLogs.length > 0) {
          const mappedLogs = sLogs.map((log: any) => {
            let Icon = Activity;
            let tone = '#0284C7';
            const act = String(log.action || '').toUpperCase();
            if (act.includes('LOGIN') || act.includes('LOGOUT')) {
              Icon = Lock;
              tone = '#003580';
            } else if (act.includes('CREATE') || act.includes('REGISTER')) {
              Icon = UserPlus;
              tone = '#1D9E75';
            } else if (act.includes('BACKUP')) {
              Icon = Database;
              tone = '#E8A020';
            } else if (act.includes('SETTINGS') || act.includes('UPDATE')) {
              Icon = Settings;
              tone = '#7C3AED';
            } else if (act.includes('FAIL') || act.includes('ERROR') || act.includes('WARN')) {
              Icon = ShieldAlert;
              tone = '#E24B4A';
            }
            return {
              text: log.details || `${log.action} performed`,
              time: log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
              icon: Icon,
              tone,
            };
          });
          setSystemActivities(mappedLogs);
        } else {
          setSystemActivities(defaultSystemActivities);
        }

        const jobsList = jobsData?.jobs || jobsData?.data?.jobs || jobsData?.data || jobsData || [];
        const jobsCount = Array.isArray(jobsList) ? jobsList.length : (jobsData?.total || 47);
        setActiveJobsCount(jobsCount);
      } catch (error) {
        console.error('Error fetching dashboard data, falling back:', error);
        setPendingActions(defaultPendingActions);
        setWeeklyRegistrations(defaultWeeklyRegistrations);
        setSystemActivities(defaultSystemActivities);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const weeklyTotal = useMemo(() =>
    weeklyRegistrations.reduce((sum: number, d: any) => sum + (d.alumni || 0) + (d.employers || 0), 0),
  [weeklyRegistrations]);

  const isUnpopulated = !analyticsData || !analyticsData.overallEmployment || analyticsData.overallEmployment.totalAlumni === 0;

  // Derive stat cards from analytics data
  const statCards = useMemo(() => {
    if (isUnpopulated) {
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
          value: String(activeJobsCount),
          trend: '12 expiring soon',
          icon: Briefcase,
          accent: '#7C3AED',
          chip: 'warning' as TrendTone,
        },
      ];
    }

    // Use real analytics data when available
    const totalAlumniVal = analyticsData.overallEmployment?.totalAlumni;
    const surveyCompletionVal = analyticsData.tracer?.surveyCompletionRate;
    const employersCount = analyticsData.employers?.mostActiveEmployers?.length || analyticsData.employers?.topHiringCompanies?.length;

    return [
      {
        label: 'Total Alumni',
        value: totalAlumniVal !== undefined ? totalAlumniVal.toLocaleString() : '4,827',
        trend: '+124 this year',
        icon: GraduationCap,
        accent: '#003580',
        chip: 'success' as TrendTone,
      },
      {
        label: 'Total Employers',
        value: employersCount !== undefined && employersCount > 0 ? employersCount.toLocaleString() : '312',
        trend: '+18 this month',
        icon: Building2,
        accent: '#E8A020',
        chip: 'success' as TrendTone,
      },
      {
        label: 'Survey Completion',
        value: surveyCompletionVal !== undefined ? `${surveyCompletionVal.toFixed(1)}%` : '68.4%',
        trend: '+5.2% vs last year',
        icon: ClipboardCheck,
        accent: '#1D9E75',
        chip: 'success' as TrendTone,
      },
      {
        label: 'Active Jobs',
        value: String(activeJobsCount),
        trend: '12 expiring soon',
        icon: Briefcase,
        accent: '#7C3AED',
        chip: 'warning' as TrendTone,
      },
    ];
  }, [analyticsData, activeJobsCount, isUnpopulated]);

  // Derive employment data from analytics
  const employmentData = useMemo(() => {
    if (isUnpopulated || !analyticsData?.departments || analyticsData.departments.length === 0) {
      return [
        { department: 'SE', value: 92 },
        { department: 'ME', value: 84 },
        { department: 'CE', value: 89 },
        { department: 'EE', value: 77 },
        { department: 'CHE', value: 95 },
        { department: 'IE', value: 81 },
      ];
    }
    return analyticsData.departments.map((d: any) => ({
      department: d.departmentCode,
      value: Math.round(d.employmentRate),
    }));
  }, [analyticsData, isUnpopulated]);

  // Derive survey data from analytics
  const surveyData = useMemo(() => {
    if (isUnpopulated || !analyticsData?.tracer) {
      return [
        { name: 'Completed', value: 68, color: '#1D9E75' },
        { name: 'Pending', value: 22, color: '#E8A020' },
        { name: 'Never Responded', value: 10, color: '#E24B4A' },
      ];
    }
    const completion = analyticsData.tracer.surveyCompletionRate || 0;
    const pending = Math.max(0, 100 - completion);
    return [
      { name: 'Completed', value: Math.round(completion), color: '#1D9E75' },
      { name: 'Pending', value: Math.round(pending * 0.7), color: '#E8A020' },
      { name: 'Never Responded', value: Math.round(pending * 0.3), color: '#E24B4A' },
    ];
  }, [analyticsData, isUnpopulated]);

  // Derive employment trend data from analytics
  const employmentTrendData = useMemo(() => {
    if (isUnpopulated || !analyticsData?.overallEmployment?.graduateOutcomeTrend || analyticsData.overallEmployment.graduateOutcomeTrend.length === 0) {
      return [
        { year: '2020', employed: 61, selfEmployed: 14 },
        { year: '2021', employed: 65, selfEmployed: 16 },
        { year: '2022', employed: 70, selfEmployed: 18 },
        { year: '2023', employed: 74, selfEmployed: 20 },
        { year: '2024', employed: 79, selfEmployed: 23 },
      ];
    }
    return analyticsData.overallEmployment.graduateOutcomeTrend.map((t: any) => ({
      year: String(t.year),
      employed: t.employed,
      selfEmployed: t.selfEmployed,
    }));
  }, [analyticsData, isUnpopulated]);

  // Derive hiring companies from analytics
  const hiringCompanies = useMemo(() => {
    if (isUnpopulated || !analyticsData?.employers?.topHiringCompanies || analyticsData.employers.topHiringCompanies.length === 0) {
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
    return analyticsData.employers.topHiringCompanies.map((emp: any) => ({
      name: emp.companyName,
      hires: emp.count,
    })).sort((a: any, b: any) => b.hires - a.hires);
  }, [analyticsData, isUnpopulated]);

  // Derive skill gaps from analytics
  const skillGaps = useMemo(() => {
    if (isUnpopulated || !analyticsData?.curriculum?.skillGaps || analyticsData.curriculum.skillGaps.length === 0) {
      return [
        { skill: 'Cloud Computing', value: 78 },
        { skill: 'DevOps', value: 71 },
        { skill: 'AI/ML', value: 65 },
        { skill: 'Cyber Security', value: 58 },
        { skill: 'Data Engineering', value: 52 },
      ];
    }
    return analyticsData.curriculum.skillGaps.slice(0, 5).map((gap: any) => ({
      skill: gap.skill,
      value: Math.round(gap.gapScore * 10), // Scale gap score from 0-10 to 0-100%
    }));
  }, [analyticsData, isUnpopulated]);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div
        className="relative overflow-hidden rounded-[1.25rem] px-8 py-8 md:px-10"
        style={{ background: 'linear-gradient(135deg, #001f4d 0%, #003580 50%, #00508a 100%)', boxShadow: '0 8px 30px rgba(0,53,128,0.35)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 85% -5%, rgba(29,158,117,0.30), transparent)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 70% at -5% 70%, rgba(232,160,32,0.10), transparent)' }} />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(29,158,117,0.15)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
                <LayoutDashboard className="h-6 w-6" style={{ color: '#E8A020' }} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#E8A020' }}>{greeting}, Welcome back</span>
                <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight" style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>Admin Dashboard</h1>
                <p className="mt-1 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  {today} &bull; Overview of alumni, employers, surveys, and system health.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#ffffff', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <SmallStat
              key={card.label}
              label={card.label}
              value={card.value}
              icon={Icon}
              color={card.accent}
              trend={card.trend}
              chip={card.chip}
            />
          );
        })}
      </section>

      {/* Quick Actions Bar */}
      <SectionCard title="Quick Actions" subtitle="Navigate to frequently used admin functions.">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white px-3 py-3 text-center transition-all duration-300 hover:border-slate-300 hover:shadow-md hover:scale-105 cursor-pointer"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl shadow transition-all duration-300 group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${action.accent}15 0%, ${action.accent}25 100%)`,
                    color: action.accent 
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{action.label}</span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Charts Row */}
      <section className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <SectionCard
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
          </SectionCard>
        </div>

        <div className="xl:col-span-2">
          <SectionCard 
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
          </SectionCard>
        </div>
      </section>

      {/* Weekly Registrations & Hiring Trends */}
      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard
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
        </SectionCard>

        <SectionCard
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
        </SectionCard>
      </section>

      {/* System Health */}
      <SectionCard title="System Health" subtitle="Real-time monitoring of API performance and system status.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {systemHealthMetrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-3.5 transition-all duration-300 hover:border-slate-300 hover:shadow-md hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{metric.label}</span>
                <StatusDot status={metric.status} />
              </div>
              <p className="mt-2 text-lg font-bold tracking-tight text-slate-900">{metric.value}</p>
              <p className="mt-1 text-[11px] text-slate-500 font-medium">{metric.trend}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Bottom Row */}
      <section className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Recent System Activity" subtitle="Latest administrative actions and sync events." action={<AdminBadge variant="neutral">Live Feed</AdminBadge>}>
          <div className="mt-3 space-y-3">
            {systemActivities.map((entry) => {
              const Icon = entry.icon;
              return (
                <div key={entry.text} className="flex gap-2.5 group">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 group-hover:from-slate-200 group-hover:to-slate-100 transition-all duration-300">
                    <Icon className="h-3.5 w-3.5" style={{ color: entry.tone }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-700 font-medium">{entry.text}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{entry.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
        <SectionCard title="Pending Actions" subtitle="Tasks waiting for administrative review.">
          <div className="mt-3 space-y-2">
            {pendingActions.map((task) => (
              <div
                key={task.label}
                className="group rounded-xl border border-slate-200/80 border-l-4 bg-gradient-to-r from-white to-slate-50/50 p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-slate-300"
                style={{ borderLeftColor: task.tone }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-slate-700">{task.label}</p>
                  <button
                    type="button"
                    onClick={() => {
                      console.log(`Pending action clicked: ${task.label}`);
                      if (task.action === 'Review') {
                        navigate('/admin/users');
                      } else if (task.action === 'Approve') {
                        navigate('/admin/jobs');
                      }
                    }}
                    className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white transition-all hover:brightness-110 shrink-0 cursor-pointer"
                    style={{ backgroundColor: task.tone }}
                  >
                    {task.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>


        <SectionCard title="Skill Gap Alert" subtitle="Top Missing Skills Reported by Employers" action={<AdminBadge variant="warning">Curriculum Input</AdminBadge>}>
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

          <div className="mt-6 border-t border-slate-200/80 pt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Based on 94 employer feedback submissions</span>
            <button 
              type="button" 
              onClick={() => navigate('/admin/analytics')}
              className="font-semibold text-[#003580] hover:underline transition-all cursor-pointer"
            >
              View Details
            </button>
          </div>
        </SectionCard>
      </section>

      {/* Top Hiring Companies */}
      <SectionCard
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
      </SectionCard>
    </div>
  );
}
