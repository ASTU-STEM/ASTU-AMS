import React from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Target,
  Building2,
  MapPin,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Banknote,
  BadgeCheck,
  CalendarRange,
  UserCheck,
} from 'lucide-react';
import { AnalyticsChart } from '../../../components/AnalyticsChart';
import { StatusBadge, formatSalary } from './employmentStatus';
import type { DepartmentDerivedData } from '../hooks/useDepartmentData';

interface DashboardOverviewProps {
  data?: DepartmentDerivedData;
  isLoading?: boolean;
  error?: string | null;
  darkMode?: boolean;
  onNavigate?: (tab: string) => void;
  onRefresh?: () => Promise<void>;
  lastUpdated?: number | null;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-700/50 ${className}`} />
);

function formatLastUpdated(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  return new Date(timestamp).toLocaleString();
}

const Card = ({
  darkMode,
  className = '',
  children,
}: {
  darkMode: boolean;
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} ${className}`}
  >
    {children}
  </div>
);

const PanelHeader = ({
  icon: Icon,
  title,
  darkMode,
}: {
  icon: React.ElementType;
  title: string;
  darkMode: boolean;
}) => (
  <div className="mb-4 flex items-center gap-2">
    <Icon className="h-4 w-4 text-[#003580]" />
    <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
  </div>
);

const EmptyHint = ({ text, darkMode }: { text: string; darkMode: boolean }) => (
  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{text}</p>
);

const RankRow = ({
  name,
  count,
  total,
  darkMode,
}: {
  name: string;
  count: number;
  total: number;
  darkMode: boolean;
}) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <li>
      <div className="flex items-center justify-between text-sm">
        <span className={`truncate pr-3 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{name}</span>
        <span className={`shrink-0 tabular-nums ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {count} · {percentage}%
        </span>
      </div>
      <div className={`mt-1.5 h-1.5 w-full overflow-hidden rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <div
          className="h-full rounded-full bg-[#003580]/80"
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </li>
  );
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  data,
  isLoading = false,
  error = null,
  darkMode = false,
  onNavigate,
  onRefresh,
  lastUpdated = null,
}) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-2xl border p-10 text-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
        <AlertCircle className={`h-8 w-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
        <h3 className={`mt-4 text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Unable to load dashboard</h3>
        <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{error}</p>
        <button type="button" onClick={handleRefresh} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#003580] px-5 py-2.5 text-sm font-semibold text-white">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Try again
        </button>
      </div>
    );
  }

  const stats = data?.stats ?? {
    totalAlumni: 0,
    employed: 0,
    unemployed: 0,
    selfEmployed: 0,
    employmentRate: 0,
    unemploymentRate: 0,
    selfEmploymentRate: 0,
  };

  const alumni = data?.alumni ?? [];
  const totalAlumni = stats.totalAlumni || alumni.length;

  const kpis = [
    {
      label: 'Total Alumni',
      value: totalAlumni.toLocaleString(),
      hint: `${alumni.length} in view`,
      icon: GraduationCap,
    },
    {
      label: 'Employment Rate',
      value: `${(stats.employmentRate ?? 0).toFixed(1)}%`,
      hint: 'Employed + self-employed',
      icon: TrendingUp,
    },
    {
      label: 'Employed',
      value: (stats.employed ?? 0).toLocaleString(),
      hint: `${(stats.selfEmployed ?? 0).toLocaleString()} self-employed`,
      icon: Briefcase,
    },
    {
      label: 'Average Salary',
      value: formatSalary(data?.averageSalary ?? null),
      hint:
        data && data.salaryCount > 0
          ? `${data.salaryCount} salary report${data.salaryCount === 1 ? '' : 's'}`
          : 'No salary data reported',
      icon: Banknote,
    },
    {
      label: 'Unemployment Rate',
      value: `${(stats.unemploymentRate ?? 0).toFixed(1)}%`,
      hint: `${(stats.unemployed ?? 0).toLocaleString()} graduates`,
      icon: TrendingDown,
    },
  ];

  const quickActions = [
    { tab: 'graduates', label: 'Browse graduates', desc: 'Search the alumni directory', icon: Users },
    { tab: 'employment', label: 'Employment analytics', desc: 'Placement trends and employers', icon: Target },
    { tab: 'surveys', label: 'Tracer surveys', desc: 'Dispatch surveys to alumni', icon: GraduationCap },
  ];

  const trendReversed = [...(data?.employmentTrend ?? [])].reverse();
  const verificationPercent =
    totalAlumni > 0 ? Math.round(((data?.verifiedCount ?? 0) / totalAlumni) * 100) : 0;
  const recentGraduates = alumni
    .filter((a) => a.fullName)
    .slice()
    .sort((a, b) => (b.graduationYear || 0) - (a.graduationYear || 0) || a.fullName.localeCompare(b.fullName))
    .slice(0, 6);
  const hasDistribution = (data?.employmentStatusDistribution ?? []).length > 0;

  return (
    <div className="space-y-6">
      <section className={`relative overflow-hidden rounded-2xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(0,53,128,0.12),transparent_60%)]" />
        <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${darkMode ? 'text-slate-400' : 'text-[#003580]'}`}>
              Graduate outcomes overview
            </p>
            <h2 className={`mt-2 text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Department Dashboard
            </h2>
            <p className={`mt-2 text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Live employment outcomes, average salary, cohort trends, and skills from verified alumni records.
              Your department's data supports accreditation and tracer reporting.
            </p>
            {lastUpdated && (
              <p className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${refreshing ? 'animate-pulse' : ''}`} />
                Data refreshed {formatLastUpdated(lastUpdated)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('graduates')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-4 py-2.5 text-sm font-medium text-white"
            >
              <GraduationCap className="h-4 w-4" />
              View graduates
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.tab}
              type="button"
              onClick={() => onNavigate?.(action.tab)}
              className={`group flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                darkMode
                  ? 'border-slate-800 bg-slate-900 hover:bg-slate-800'
                  : 'border-slate-200/80 bg-white hover:bg-slate-50'
              }`}
            >
              <span className={`shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-[#003580]/10 text-[#003580]'}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{action.label}</span>
                <span className={`block truncate text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{action.desc}</span>
              </span>
              <ArrowRight className={`h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`card-hover rounded-2xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-[#003580]/10 text-[#003580]'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.label}</p>
              <p className={`mt-1.5 text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{kpi.value}</p>
              <p className={`mt-1.5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsChart
          type="pie"
          data={(data?.employmentStatusDistribution ?? []) as any}
          xKey="status"
          series={[{ key: 'count', label: 'Graduates' }]}
          title="Employment Status Distribution"
          subtitle="Breakdown of graduate outcomes"
          height={280}
          darkMode={darkMode}
        />
        <AnalyticsChart
          type="line"
          data={(data?.employmentTrend ?? []) as any}
          xKey="year"
          series={[{ key: 'employmentRate', label: 'Employment Rate (%)', color: '#003580' }]}
          title="Employment Trend by Cohort"
          subtitle="Placement rate per graduation year"
          height={280}
          darkMode={darkMode}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsChart
          type="bar"
          data={(data?.topSkills ?? []) as any}
          xKey="name"
          series={[{ key: 'count', label: 'Graduates' }]}
          title="Top Skills"
          subtitle="Most-reported skills by alumni"
          height={280}
          darkMode={darkMode}
        />
        <AnalyticsChart
          type="bar"
          data={(data?.topIndustries ?? []) as any}
          xKey="name"
          series={[{ key: 'count', label: 'Graduates' }]}
          title="Top Industries"
          subtitle="Sectors where graduates work"
          height={280}
          darkMode={darkMode}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card darkMode={darkMode}>
          <div className="p-5">
            <PanelHeader icon={CalendarRange} title="Cohort Performance" darkMode={darkMode} />
            {trendReversed.length === 0 ? (
              <EmptyHint text="No cohort data available yet." darkMode={darkMode} />
            ) : (
              <ul className="space-y-3.5">
                {trendReversed.map((cohort) => (
                  <RankRow
                    key={cohort.year}
                    name={`Class of ${cohort.year}`}
                    count={cohort.employed}
                    total={cohort.graduates}
                    darkMode={darkMode}
                  />
                ))}
              </ul>
            )}
            <p className={`mt-4 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Employed graduates per graduation cohort (incl. self-employment)
            </p>
          </div>
        </Card>

        <Card darkMode={darkMode}>
          <div className="p-5">
            <PanelHeader icon={Building2} title="Top Employers" darkMode={darkMode} />
            {(data?.topCompanies ?? []).length === 0 ? (
              <EmptyHint text="No employer data reported yet." darkMode={darkMode} />
            ) : (
              <ul className="space-y-3.5">
                {(data?.topCompanies ?? []).map((item) => (
                  <RankRow
                    key={item.name}
                    name={item.name}
                    count={item.count}
                    total={totalAlumni}
                    darkMode={darkMode}
                  />
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card darkMode={darkMode}>
          <div className="p-5">
            <PanelHeader icon={MapPin} title="Top Locations" darkMode={darkMode} />
            {(data?.locations ?? []).length === 0 ? (
              <EmptyHint text="No location data reported yet." darkMode={darkMode} />
            ) : (
              <ul className="space-y-3.5">
                {(data?.locations ?? []).map((item) => (
                  <RankRow
                    key={item.name}
                    name={item.name}
                    count={item.count}
                    total={totalAlumni}
                    darkMode={darkMode}
                  />
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card darkMode={darkMode} className="lg:col-span-2">
          <div className="p-5">
            <PanelHeader icon={UserCheck} title="Recent Graduates" darkMode={darkMode} />
            {recentGraduates.length === 0 ? (
              <EmptyHint text="No graduate records found." darkMode={darkMode} />
            ) : (
              <ul className="divide-y">
                {recentGraduates.map((record) => (
                  <li key={record.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('graduates')}
                      className="group flex w-full items-center gap-3 py-3 text-left transition"
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs ${darkMode ? 'bg-slate-700 text-white' : 'bg-[#003580]/10 text-[#003580]'}`}>
                        {record.fullName
                          .split(' ')
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {record.fullName}
                        </span>
                        <span className={`block truncate text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {record.company
                            ? `${record.company}${record.jobTitle ? ` · ${record.jobTitle}` : ''}`
                            : 'No employer reported'}
                        </span>
                      </span>
                      <span className={`hidden shrink-0 text-xs tabular-nums sm:block ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {record.graduationYear || '—'}
                      </span>
                      <StatusBadge status={record.employmentStatus} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card darkMode={darkMode}>
          <div className="p-5">
            <PanelHeader icon={BadgeCheck} title="Profile Verification" darkMode={darkMode} />
            <p className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {verificationPercent}%
            </p>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {(data?.verifiedCount ?? 0).toLocaleString()} of {totalAlumni.toLocaleString()} alumni verified
            </p>
            <div className={`mt-4 h-2 w-full overflow-hidden rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div
                className={`h-full rounded-full ${verificationPercent >= 90 ? 'bg-emerald-500' : verificationPercent >= 50 ? 'bg-[#003580]' : 'bg-amber-500'}`}
                style={{ width: `${verificationPercent}%` }}
              />
            </div>
            {data && data.unverifiedCount > 0 && (
              <p className={`mt-4 rounded-xl p-3 text-xs ${darkMode ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
                {(data.unverifiedCount).toLocaleString()} graduate{data.unverifiedCount === 1 ? '' : 's'} still
                need their alumni profile verified.
              </p>
            )}
          </div>
        </Card>
      </div>

      {!hasDistribution && alumni.length > 0 && (
        <div className={`rounded-2xl border p-5 text-sm ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200/80 text-slate-500'}`}>
          Alumni records are available, but employment status data has not been reported yet.
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;