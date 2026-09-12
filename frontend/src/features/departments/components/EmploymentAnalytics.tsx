import React, { Fragment, useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  Target,
  RefreshCw,
  Download,
  Search,
  X,
  AlertCircle,
  Building2,
  MapPin,
  Loader2,
  ChevronDown,
  Mail,
  Phone,
  IdCard,
  GraduationCap,
  Banknote,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { AnalyticsChart } from '../../../components/AnalyticsChart';
import { StatusBadge, formatSalary, STATUS_CONFIG, statusConfig, STATUS_ORDER } from './employmentStatus';
import type { DepartmentDerivedData } from '../hooks/useDepartmentData';

interface EmploymentAnalyticsProps {
  data?: DepartmentDerivedData;
  isLoading?: boolean;
  error?: string | null;
  darkMode?: boolean;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-700/50 ${className}`} />
);

const DetailItem = ({
  icon: Icon,
  label,
  value,
  darkMode,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  darkMode: boolean;
}) => (
  <div>
    <div className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <div className={`mt-1 text-sm font-medium break-words ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{value}</div>
  </div>
);

export const EmploymentAnalytics: React.FC<EmploymentAnalyticsProps> = ({
  data,
  isLoading = false,
  error = null,
  darkMode = false,
}) => {
  const stats = data?.stats;
  const [batch, setBatch] = useState('All');
  const [employmentStatus, setEmploymentStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    (data?.alumni ?? []).forEach((record) => {
      if (record.graduationYear) years.add(String(record.graduationYear));
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [data?.alumni]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (data?.alumni ?? []).forEach((a) => {
      const key = STATUS_CONFIG[a.employmentStatus] ? a.employmentStatus : 'UNKNOWN';
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [data?.alumni]);

  const statusTabs: Array<[string, string]> = [
    ['All', 'All'],
    ...STATUS_ORDER.map((s) => [s, statusConfig(s).label] as [string, string]),
    ...(statusCounts.UNKNOWN ? [['UNKNOWN', 'Unknown'] as [string, string]] : []),
  ];

  const filteredAlumni = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (data?.alumni ?? []).filter((record) => {
      const matchesSearch =
        !q ||
        record.fullName.toLowerCase().includes(q) ||
        (record.company || '').toLowerCase().includes(q) ||
        (record.jobTitle || '').toLowerCase().includes(q);
      const matchesBatch = batch === 'All' || String(record.graduationYear) === batch;
      const matchesStatus = employmentStatus === 'All' || record.employmentStatus === employmentStatus;
      return matchesSearch && matchesBatch && matchesStatus;
    });
  }, [data?.alumni, searchTerm, batch, employmentStatus]);

  const filteredStats = useMemo(() => {
    const total = filteredAlumni.length;
    const employed = filteredAlumni.filter((a) => a.employmentStatus === 'EMPLOYED').length;
    const selfEmployed = filteredAlumni.filter((a) => a.employmentStatus === 'SELF_EMPLOYED').length;
    const unemployed = filteredAlumni.filter((a) => a.employmentStatus === 'UNEMPLOYED').length;
    const placed = employed + selfEmployed;
    return {
      total,
      employed,
      selfEmployed,
      unemployed,
      employmentRate: total > 0 ? (placed / total) * 100 : 0,
      unemploymentRate: total > 0 ? (unemployed / total) * 100 : 0,
      selfEmploymentRate: total > 0 ? (selfEmployed / total) * 100 : 0,
    };
  }, [filteredAlumni]);

  const salarySummary = useMemo(() => {
    const salaries = filteredAlumni
      .map((a) => a.salary)
      .filter((s): s is number => typeof s === 'number' && s > 0);
    if (salaries.length === 0) return null;
    const total = salaries.reduce((acc, s) => acc + s, 0);
    return {
      count: salaries.length,
      avg: Math.round(total / salaries.length),
      min: Math.min(...salaries),
      max: Math.max(...salaries),
    };
  }, [filteredAlumni]);

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
    if (filteredAlumni.length === 0 || exporting) return;
    setExporting(true);
    try {
      const header = ['fullName', 'graduationYear', 'employmentStatus', 'company', 'jobTitle', 'industry', 'location', 'salary'];
      const escape = (value: string | number | null | undefined) => {
        const s = String(value ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csv = [
        header.join(','),
        ...filteredAlumni.map((r) =>
          [r.fullName, r.graduationYear, r.employmentStatus, r.company, r.jobTitle, r.industry, r.location, r.salary]
            .map(escape)
            .join(',')
        ),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${(data?.department?.code || 'department').toLowerCase()}-employment.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-2xl border p-10 text-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
        <AlertCircle className={`h-8 w-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
        <h3 className={`mt-4 text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Unable to load employment analytics</h3>
        <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{error}</p>
        <button type="button" onClick={handleRefresh} disabled={refreshing} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#003580] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Try again
        </button>
      </div>
    );
  }

  const kpis = [
    { label: 'Employment Rate', value: `${filteredStats.employmentRate.toFixed(1)}%`, hint: 'Employed + self-employed', icon: TrendingUp },
    { label: 'Unemployment Rate', value: `${filteredStats.unemploymentRate.toFixed(1)}%`, hint: `${filteredStats.unemployed} graduates`, icon: TrendingDown },
    { label: 'Self-Employment', value: `${filteredStats.selfEmploymentRate.toFixed(1)}%`, hint: `${filteredStats.selfEmployed} graduates`, icon: Briefcase },
    { label: 'In View', value: filteredStats.total.toLocaleString(), hint: stats ? `${stats.totalAlumni} total alumni` : 'Filtered alumni', icon: Target },
    {
      label: 'Average Salary',
      value: salarySummary ? formatSalary(salarySummary.avg) : 'N/A',
      hint: salarySummary
        ? `${salarySummary.count} salary reports · ${formatSalary(salarySummary.min)}–${formatSalary(salarySummary.max)}`
        : 'No salary data reported',
      icon: Banknote,
    },
  ];

  const hasFilters = batch !== 'All' || employmentStatus !== 'All' || searchTerm.trim() !== '';

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Employment Analytics</h2>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {data?.department
                ? `${data.department.name} outcomes from live alumni records`
                : 'Graduate employment performance from verified alumni data'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Reload employment records"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60 ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || filteredAlumni.length === 0}
              title="Download current results as CSV"
              className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? 'Exporting…' : 'Export'}
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search graduate, company, or role..."
              className={`w-full rounded-xl border py-2.5 pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className={`rounded-xl border px-3 py-2.5 text-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
          >
            <option value="All">All cohorts</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {statusTabs.map(([key, label]) => {
            const active = employmentStatus === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setEmploymentStatus(key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#003580] text-white'
                    : darkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none tabular-nums ${active ? 'bg-white/20' : darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  {statusCounts[key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setBatch('All');
              setEmploymentStatus('All');
              setSearchTerm('');
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#003580]"
          >
            <X className="h-4 w-4" /> Reset filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`rounded-2xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
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
          type="line"
          data={(data?.employmentTrend ?? []) as any}
          xKey="year"
          series={[{ key: 'employmentRate', label: 'Employment Rate (%)', color: '#003580' }]}
          title="Employment Trend"
          subtitle="Placement rate by graduation year"
          height={280}
          darkMode={darkMode}
        />
        <AnalyticsChart
          type="pie"
          data={(data?.employmentStatusDistribution ?? []) as any}
          xKey="status"
          series={[{ key: 'count', label: 'Graduates' }]}
          title="Status Distribution"
          subtitle="Current employment status"
          height={280}
          darkMode={darkMode}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#003580]" />
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Top Employers</h3>
          </div>
          {(data?.topCompanies ?? []).length === 0 ? (
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No employer data reported yet.</p>
          ) : (
            <ul className="space-y-3">
              {(data?.topCompanies ?? []).map((item) => (
                <li key={item.name} className="flex items-center justify-between text-sm">
                  <span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>{item.name}</span>
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{item.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#003580]" />
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Locations</h3>
          </div>
          {(data?.locations ?? []).length === 0 ? (
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No location data reported yet.</p>
          ) : (
            <ul className="space-y-3">
              {(data?.locations ?? []).map((item) => (
                <li key={item.name} className="flex items-center justify-between text-sm">
                  <span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>{item.name}</span>
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{item.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
        <div className="px-5 py-4">
          <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Filtered employment records</h3>
          <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {filteredAlumni.length} graduate(s)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[60rem] text-sm">
            <thead>
              <tr className={`border-y ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/80'}`}>
                <th className="w-10 px-2 py-3 text-left">
                  <span className="sr-only">Details</span>
                </th>
                {['Name', 'Year', 'Status', 'Company', 'Role', 'Industry', 'Salary', 'Location'].map((label) => (
                  <th key={label} className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAlumni.map((record) => {
                const isOpen = expandedId === record.id;
                return (
                  <Fragment key={record.id}>
                    <tr className={`border-b last:border-0 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isOpen ? null : record.id)}
                          aria-label={isOpen ? 'Hide details' : 'Show details'}
                          aria-expanded={isOpen}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                      <td className={`px-4 py-3 font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{record.fullName}</td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{record.graduationYear || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={record.employmentStatus} />
                      </td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{record.company || '—'}</td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{record.jobTitle || '—'}</td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{record.industry || '—'}</td>
                      <td className={`px-4 py-3 whitespace-nowrap tabular-nums ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{formatSalary(record.salary)}</td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{record.location || '—'}</td>
                    </tr>
                    {isOpen && (
                      <tr className={`${darkMode ? 'bg-slate-800/30' : 'bg-slate-50/60'}`}>
                        <td colSpan={9} className="px-5 py-4">
                          <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <DetailItem icon={Mail} label="Email" value={record.email ?? '—'} darkMode={darkMode} />
                            <DetailItem icon={Phone} label="Phone" value={record.phone ?? '—'} darkMode={darkMode} />
                            <DetailItem icon={IdCard} label="Student ID" value={record.studentId} darkMode={darkMode} />
                            <DetailItem icon={GraduationCap} label="Graduation Year" value={record.graduationYear ? String(record.graduationYear) : '—'} darkMode={darkMode} />
                            <DetailItem icon={Banknote} label="Salary" value={formatSalary(record.salary)} darkMode={darkMode} />
                            <DetailItem icon={MapPin} label="Location" value={record.location ?? '—'} darkMode={darkMode} />
                            <div>
                              <div className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Verification
                              </div>
                              <div className={`mt-1 text-sm font-medium ${record.isVerified ? 'text-emerald-600' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {record.isVerified ? 'Verified alumni' : 'Not verified'}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          {filteredAlumni.length === 0 && (
            <p className={`px-5 py-10 text-center text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              No employment records match the current filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmploymentAnalytics;