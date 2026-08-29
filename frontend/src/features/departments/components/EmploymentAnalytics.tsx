import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Briefcase, Target,
  RefreshCw, Download, ArrowUp, ArrowDown, Search, X, AlertCircle,
  Users
} from 'lucide-react';
import { AnalyticsChart } from '../../../components/AnalyticsChart';
import type { DepartmentDerivedData } from '../hooks/useDepartmentData';
import {
  EmploymentAnalyticsFilters,
  EmploymentKPIMetric,
  EmploymentTrendData,
  EmploymentStatusData,
  GraduateEmploymentRecord
} from '../types/employmentAnalytics.types';

interface EmploymentAnalyticsProps {
  data?: DepartmentDerivedData;
  isLoading?: boolean;
  error?: string | null;
  darkMode?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  'Employed': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  'Self-Employed': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  'Unemployed': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  'Unknown': 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-700/50 ${className}`} />
);

export const EmploymentAnalytics: React.FC<EmploymentAnalyticsProps> = ({ data, isLoading = false, error = null, darkMode = false }) => {
  const stats = data?.stats;
  const hasData = !!stats && stats.totalAlumni > 0;
  const employmentTrend = (data?.employmentTrend ?? []) as EmploymentTrendData[];
  const employmentStatusDistribution = (data?.employmentStatusDistribution ?? []) as EmploymentStatusData[];
  const [refreshing, setRefreshing] = useState(false);

  const kpiMetrics: EmploymentKPIMetric[] = hasData
    ? [
        {
          id: 'employment-rate',
          label: 'Employment Rate',
          value: `${stats.employmentRate.toFixed(1)}%`,
          comparison: 'Employed + self-employed',
          icon: 'TrendingUp',
          color: 'astu-green',
        },
        {
          id: 'unemployment-rate',
          label: 'Unemployment Rate',
          value: `${stats.unemploymentRate.toFixed(1)}%`,
          comparison: `${stats.unemployed} graduates`,
          icon: 'TrendingDown',
          color: 'astu-red',
        },
        {
          id: 'self-employment-rate',
          label: 'Self-Employment Rate',
          value: `${stats.selfEmploymentRate.toFixed(1)}%`,
          comparison: `${stats.selfEmployed} graduates`,
          icon: 'Briefcase',
          color: 'astu-navy',
        },
        {
          id: 'total-graduates',
          label: 'Total Graduates',
          value: stats.totalAlumni.toLocaleString(),
          comparison: 'Department alumni',
          icon: 'Target',
          color: 'astu-green',
        },
      ]
    : [];

  const [filters, setFilters] = useState<EmploymentAnalyticsFilters>({
    department: 'This Department',
    batch: 'All',
    academicYear: 'All',
    employmentStatus: 'All'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('graduateName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    (data?.alumni ?? []).forEach(record => {
      const year = String(record.graduationYear || '');
      if (year && year !== '0') years.add(year);
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [data]);

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
    if (filteredRecords.length === 0) return;
    const header = ['graduateName', 'graduationYear', 'employmentStatus'];
    const escape = (value: string | number) => {
      const s = String(value ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      header.join(','),
      ...filteredRecords.map(r => [r.graduateName, r.graduationYear, r.employmentStatus].map(escape).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'department-employment-records.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'TrendingUp': TrendingUp,
      'TrendingDown': TrendingDown,
      'Briefcase': Briefcase,
      'Target': Target,
    };
    const Icon = iconMap[iconName] || TrendingUp;
    return <Icon className="h-5 w-5" />;
  };

  const iconColorMap: Record<string, string> = {
    'astu-green': 'text-astu-green bg-[#008C44]/10',
    'astu-navy': 'text-astu-navy bg-[#003580]/10',
    'astu-red': 'text-astu-red bg-[#E31E24]/10',
  };

  const renderKPICard = (kpi: EmploymentKPIMetric) => (
    <div className={`p-5 border rounded-2xl transition-all duration-300 ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200/80 hover:shadow-md hover:border-slate-300'}`}>
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconColorMap[kpi.color] || 'bg-slate-100 text-slate-500'}`}>
        {getIcon(kpi.icon)}
      </div>
      <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.label}</p>
      <p className={`mt-1.5 text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{kpi.value}</p>
      <p className={`mt-1.5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.comparison}</p>
    </div>
  );

  const filteredRecords = useMemo(() => {
    const records: GraduateEmploymentRecord[] = (data?.alumni ?? []).map(record => ({
      id: record.id,
      studentId: '',
      graduateName: record.fullName,
      department: '',
      graduationYear: String(record.graduationYear || ''),
      employmentStatus:
        record.employmentStatus === 'EMPLOYED' ? 'Employed' :
        record.employmentStatus === 'SELF_EMPLOYED' ? 'Self-Employed' :
        record.employmentStatus === 'UNEMPLOYED' ? 'Unemployed' : 'Unknown',
      company: '',
      jobTitle: '',
      country: '',
      salaryRange: '',
      timeToHire: '',
    }));
    return records.filter(record => {
      const matchesSearch = searchTerm.trim() === '' ||
        record.graduateName.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchesBatch = filters.batch === 'All' || record.graduationYear === filters.batch;
      const matchesYear = filters.academicYear === 'All' || record.graduationYear === filters.academicYear;
      const matchesStatus = filters.employmentStatus === 'All' || record.employmentStatus === filters.employmentStatus;
      return matchesSearch && matchesBatch && matchesYear && matchesStatus;
    });
  }, [data, searchTerm, filters.batch, filters.academicYear, filters.employmentStatus]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const aValue = a[sortField as keyof GraduateEmploymentRecord];
      const bValue = b[sortField as keyof GraduateEmploymentRecord];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [filteredRecords, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const hasFilters = filters.batch !== 'All' || filters.academicYear !== 'All' || filters.employmentStatus !== 'All' || searchTerm.trim() !== '';

  const resetFilters = () => {
    setFilters({ department: 'This Department', batch: 'All', academicYear: 'All', employmentStatus: 'All' });
    setSearchTerm('');
  };

  const renderLoading = () => (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/70'}`}>
        <Skeleton className="h-7 w-56" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-10" />)}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`p-5 border rounded-2xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/80'}`}>
            <Skeleton className="mb-4 h-11 w-11" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-8 w-20" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map(i => (
          <div key={i} className={`rounded-2xl border p-5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/70'}`}>
            <Skeleton className="h-4 w-44" />
            <Skeleton className="mt-4 h-52 w-full" />
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
        <h3 className={`mt-4 text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Unable to load employment analytics</h3>
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
      {/* Header + Filters */}
      <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/70'}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Employment Analytics</h2>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Graduate employment performance based on verified alumni data</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl bg-astu-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-astu-navy/90 focus:outline-none focus:ring-2 focus:ring-astu-navy/50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className={`mb-1 block text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Department</label>
            <select
              value={filters.department}
              disabled
              title="Data is scoped to the authenticated department"
              className={`w-full cursor-not-allowed rounded-xl border px-3 py-2.5 text-sm opacity-70 ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
            >
              <option value="This Department">This Department</option>
            </select>
          </div>
          <div>
            <label className={`mb-1 block text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Batch</label>
            <select
              value={filters.batch}
              onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/40 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <option value="All">All Batches</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`mb-1 block text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Graduation Year</label>
            <select
              value={filters.academicYear}
              onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/40 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <option value="All">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`mb-1 block text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</label>
            <select
              value={filters.employmentStatus}
              onChange={(e) => setFilters({ ...filters, employmentStatus: e.target.value })}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/40 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <option value="All">All Status</option>
              <option value="Employed">Employed</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.length > 0 ? kpiMetrics.map(renderKPICard) : (
          <div className={`col-span-full rounded-2xl border p-6 text-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-200 bg-white text-slate-500'}`}>
            No employment metrics available for this department.
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnalyticsChart
          type="line"
          data={employmentTrend as any}
          xKey="year"
          series={[{ key: 'employmentRate', label: 'Employment Rate (%)', color: '#1D3D72' }]}
          title="Employment Trend Over Time"
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

      {/* Honest empty states for scopes not available at department endpoint */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/70'}`}>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Employment by Program</h3>
          <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Program-level breakdown is not available for this department endpoint.
          </p>
        </div>
        <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/70'}`}>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Hiring Industries & Geography</h3>
          <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Industry, company, and location data is not available for this department endpoint.
          </p>
        </div>
      </div>

      {/* Graduate Records Table */}
      <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/70'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Graduate Employment Records</h3>
            <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {sortedRecords.length} of {data?.alumni?.length ?? 0} graduate(s) shown
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search graduates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full rounded-xl border py-2.5 pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-astu-navy/40 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {sortedRecords.length === 0 ? (
          <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
              <Users className="h-6 w-6" />
            </div>
            <p className={`mt-3 text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>No graduate records found</p>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {hasFilters ? 'There are no records matching the selected filters.' : 'There are no graduate records for this department yet.'}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-lg bg-astu-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-astu-navy/90"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-sm">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <th
                    className={`cursor-pointer select-none px-4 py-3 text-left font-semibold ${darkMode ? 'text-white hover:text-slate-300' : 'text-slate-900 hover:text-slate-600'}`}
                    onClick={() => handleSort('graduateName')}
                  >
                    <span className="flex items-center gap-1">
                      Name
                      {sortField === 'graduateName' && (sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />)}
                    </span>
                  </th>
                  <th
                    className={`cursor-pointer select-none px-4 py-3 text-left font-semibold ${darkMode ? 'text-white hover:text-slate-300' : 'text-slate-900 hover:text-slate-600'}`}
                    onClick={() => handleSort('graduationYear')}
                  >
                    <span className="flex items-center gap-1">
                      Graduation Year
                      {sortField === 'graduationYear' && (sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />)}
                    </span>
                  </th>
                  <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((record) => (
                  <tr key={record.id} className={`border-b transition-colors last:border-0 ${darkMode ? 'border-slate-700/60 hover:bg-slate-700/40' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className={`px-4 py-3 font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{record.graduateName}</td>
                    <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{record.graduationYear || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[record.employmentStatus] || STATUS_STYLES['Unknown']}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                        {record.employmentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmploymentAnalytics;
