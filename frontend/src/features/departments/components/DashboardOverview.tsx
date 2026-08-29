import React, { useState } from 'react';
import {
  GraduationCap, TrendingUp, Clock, Briefcase, RefreshCw, Download,
  Building2, AlertCircle, Users, FileText, MessageSquare
} from 'lucide-react';
import { AnalyticsChart } from '../../../components/AnalyticsChart';
import type { DepartmentDerivedData } from '../hooks/useDepartmentData';
import {
  KPICard,
  EmploymentTrendData,
  TracerCompletionData
} from '../types/dashboardOverview.types';

interface DashboardOverviewProps {
  darkMode?: boolean;
  data?: DepartmentDerivedData;
  isLoading?: boolean;
  error?: string | null;
}

const iconMap: Record<string, React.ElementType> = {
  'GraduationCap': GraduationCap,
  'TrendingUp': TrendingUp,
  'Clock': Clock,
  'Briefcase': Briefcase,
  'Building2': Building2,
  'Users': Users,
  'FileText': FileText,
  'MessageSquare': MessageSquare,
  'AlertCircle': AlertCircle,
};

const iconColorMap: Record<string, string> = {
  'astu-navy': 'text-astu-navy bg-[#003580]/10',
  'astu-green': 'text-astu-green bg-[#008C44]/10',
  'astu-red': 'text-astu-red bg-[#E31E24]/10',
};

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-700/50 ${className}`} />
);

const EmptyStatePanel: React.FC<{
  darkMode: boolean;
  title: string;
  description: string;
  icon: React.ElementType;
}> = ({ darkMode, title, description, icon: Icon }) => (
  <div className={`flex h-full flex-col items-start rounded-2xl border p-6 transition-shadow ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/70'}`}>
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
      <Icon className="h-5 w-5" />
    </div>
    <h3 className={`mt-4 text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
    <p className={`mt-1 text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
  </div>
);

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ darkMode = false, data, isLoading = false, error = null }) => {
  const stats = data?.stats;
  const hasData = !!stats && stats.totalAlumni > 0;
  const employmentTrend = (data?.employmentTrend ?? []) as EmploymentTrendData[];
  const employmentStatusDistribution = (data?.employmentStatusDistribution ?? []) as TracerCompletionData[];
  const [refreshing, setRefreshing] = useState(false);

  const kpiCards: KPICard[] = hasData
    ? [
        {
          id: 'total-graduates',
          label: 'Total Graduates',
          value: stats.totalAlumni.toLocaleString(),
          comparison: 'Verified alumni in this department',
          icon: 'GraduationCap',
          tooltip: 'Total number of graduates in this department',
          color: 'astu-navy',
        },
        {
          id: 'employment-rate',
          label: 'Employment Rate',
          value: `${stats.employmentRate.toFixed(1)}%`,
          comparison: 'Employed graduates',
          icon: 'TrendingUp',
          tooltip: 'Percentage of graduates currently employed',
          color: 'astu-green',
        },
        {
          id: 'employed-graduates',
          label: 'Employed Graduates',
          value: stats.employed.toLocaleString(),
          comparison: `Self-employed: ${stats.selfEmployed}`,
          icon: 'Briefcase',
          tooltip: 'Graduates currently in employment',
          color: 'astu-green',
        },
        {
          id: 'unemployed-graduates',
          label: 'Unemployed Graduates',
          value: stats.unemployed.toLocaleString(),
          comparison: `${stats.unemploymentRate.toFixed(1)}% of graduates`,
          icon: 'Clock',
          tooltip: 'Graduates currently not employed',
          color: 'astu-red',
        },
      ]
    : [];

  const handleRefresh = async () => {
    if (!data?.refetch || refreshing) return;
    setRefreshing(true);
    try {
      await data.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    const records = data?.alumni ?? [];
    if (records.length === 0) return;
    const header = ['fullName', 'graduationYear', 'employmentStatus'];
    const escape = (value: string | number) => {
      const s = String(value ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      header.join(','),
      ...records.map(r => [r.fullName, r.graduationYear, r.employmentStatus].map(escape).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'department-alumni.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || TrendingUp;
    return <Icon className="h-5 w-5" />;
  };

  const renderKPICard = (kpi: KPICard) => (
    <div
      className={`p-5 border rounded-2xl transition-all duration-300 ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200/80 hover:shadow-md hover:border-slate-300'}`}
      title={kpi.tooltip}
    >
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconColorMap[kpi.color] || 'text-slate-500 bg-slate-100'}`}>
        {getIcon(kpi.icon)}
      </div>
      <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.label}</p>
      <p className={`mt-1.5 text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{kpi.value}</p>
      <p className={`mt-1.5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.comparison}</p>
    </div>
  );

  const renderKPISkeleton = () => (
    <div className={`p-5 border rounded-2xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80'}`}>
      <Skeleton className="mb-4 h-11 w-11" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );

  const renderLoading = () => (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80'}`}>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-3 h-8 w-72" />
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map(i => <div key={i}>{renderKPISkeleton()}</div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map(i => (
          <div key={i} className={`rounded-2xl border p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80'}`}>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-56 w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) return renderLoading();

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-2xl border p-10 text-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80'}`}>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className={`mt-4 text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Unable to load department analytics</h3>
        <p className={`mt-2 max-w-md text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{error}</p>
        <button
          type="button"
          onClick={handleRefresh}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-astu-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-astu-navy/90 focus:outline-none focus:ring-2 focus:ring-astu-navy/50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department Command Center Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-[#1D3D72] via-[#1D3D72] to-[#27467b] p-6 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90">
              Department Overview
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Graduate Outcomes</h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-white/85">
              Overview of graduate outcomes and department performance from verified alumni data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/25 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#1D3D72] transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/15 pt-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Total Graduates</span>
            <p className="mt-1 text-3xl font-bold text-white">{stats.totalAlumni.toLocaleString()}</p>
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
              <CircleBadge /> Verified
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Employment Rate</span>
            <p className="mt-1 text-3xl font-bold text-white">{stats.employmentRate.toFixed(1)}%</p>
            <span className="mt-1 inline-block text-xs font-medium text-emerald-300">Employed graduates</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Employed</span>
            <p className="mt-1 text-3xl font-bold text-white">{stats.employed.toLocaleString()}</p>
            <span className="mt-1 inline-block text-xs font-medium text-emerald-300">Currently in work</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Unemployed</span>
            <p className="mt-1 text-3xl font-bold text-white">{stats.unemployed.toLocaleString()}</p>
            <span className="mt-1 inline-block text-xs font-medium text-emerald-300">{stats.unemploymentRate.toFixed(1)}% of graduates</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(renderKPICard)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnalyticsChart
          type="line"
          data={employmentTrend as any}
          xKey="year"
          series={[{ key: 'employmentRate', label: 'Employment Rate (%)', color: '#1D3D72' }]}
          title="Employment Trend"
          subtitle="Graduate employment rate by graduation year"
          height={280}
          darkMode={darkMode}
        />
        <AnalyticsChart
          type="pie"
          data={employmentStatusDistribution as any}
          xKey="status"
          series={[{ key: 'count', label: 'Graduates' }]}
          title="Employment Status Distribution"
          subtitle="Current employment status of graduates"
          height={280}
          darkMode={darkMode}
        />
      </div>

      {/* Additional insights — honest empty states for scopes not available at department endpoint */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EmptyStatePanel
          darkMode={darkMode}
          icon={Building2}
          title="Top Hiring Companies & Industries"
          description="Company and industry-level hiring data is not available for this department endpoint. No fabricated statistics are shown."
        />
        <EmptyStatePanel
          darkMode={darkMode}
          icon={FileText}
          title="Skill Gap & Curriculum Insights"
          description="Skill-gap and curriculum analytics require separate department-scoped endpoints. No fabricated statistics are shown."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EmptyStatePanel
          darkMode={darkMode}
          icon={MessageSquare}
          title="Employer Feedback"
          description="Employer feedback is not exposed for the authenticated department in the current backend."
        />
        <EmptyStatePanel
          darkMode={darkMode}
          icon={Users}
          title="Recent Activity"
          description="There is no recent activity feed for this department endpoint yet."
        />
      </div>
    </div>
  );
};

const CircleBadge = () => <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />;

export default DashboardOverview;
