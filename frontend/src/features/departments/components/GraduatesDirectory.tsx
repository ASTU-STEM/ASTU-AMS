import React, { Fragment, useMemo, useState } from 'react';
import {
  Search,
  X,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Users,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Mail,
  Phone,
  IdCard,
  GraduationCap,
  Banknote,
  MapPin,
  Sparkles,
  Briefcase,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { StatusBadge, formatSalary, statusConfig, STATUS_ORDER, normalizeEmploymentStatus } from './employmentStatus';
import type { DepartmentDerivedData } from '../hooks/useDepartmentData';
import type { DepartmentAlumniRecord } from '../services/department.service';

interface GraduatesDirectoryProps {
  data?: DepartmentDerivedData;
  isLoading?: boolean;
  error?: string | null;
  darkMode?: boolean;
  initialSearch?: string;
  onRefresh?: () => Promise<void>;
  onMessageGraduate?: (alumni: DepartmentAlumniRecord) => void;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-[var(--bg-page)] dark:bg-slate-700/50 ${className}`} />
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

export const GraduatesDirectory: React.FC<GraduatesDirectoryProps> = ({
  data,
  isLoading = false,
  error = null,
  darkMode = false,
  initialSearch = '',
  onRefresh,
  onMessageGraduate,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState<keyof DepartmentAlumniRecord>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  React.useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const years = useMemo(() => {
    const set = new Set<string>();
    (data?.alumni ?? []).forEach((a) => {
      if (a.graduationYear) set.add(String(a.graduationYear));
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [data?.alumni]);

  const statusCounts = useMemo(() => {
    const alumni = data?.alumni ?? [];
    const counts: Record<string, number> = { All: alumni.length };
    alumni.forEach((a) => {
      const key = normalizeEmploymentStatus(a.employmentStatus);
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [data?.alumni]);

  const statusTabs: Array<[string, string]> = [
    ['All', 'All'],
    ...STATUS_ORDER.map((s) => [s, statusConfig(s).label] as [string, string]),
  ];

  const salarySummary = useMemo(() => {
    const salaries = (data?.alumni ?? [])
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
  }, [data?.alumni]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (data?.alumni ?? []).filter((record) => {
      const matchesSearch =
        !q ||
        (record.fullName || '').toLowerCase().includes(q) ||
        (record.studentId || '').toLowerCase().includes(q) ||
        (record.email || '').toLowerCase().includes(q) ||
        (record.company || '').toLowerCase().includes(q) ||
        (record.jobTitle || '').toLowerCase().includes(q);
      const matchesYear = yearFilter === 'All' || String(record.graduationYear) === yearFilter;
      const matchesStatus =
        statusFilter === 'All' || normalizeEmploymentStatus(record.employmentStatus) === statusFilter;
      return matchesSearch && matchesYear && matchesStatus;
    });
  }, [data?.alumni, searchTerm, yearFilter, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDirection === 'asc' ? av - bv : bv - av;
      }
      const as = String(av ?? '');
      const bs = String(bv ?? '');
      return sortDirection === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
    });
  }, [filtered, sortField, sortDirection]);

  const handleSort = (field: keyof DepartmentAlumniRecord) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    if (sorted.length === 0 || exporting) return;
    setExporting(true);
    try {
      const header = ['studentId', 'fullName', 'email', 'graduationYear', 'employmentStatus', 'company', 'jobTitle', 'location', 'salary'];
      const escape = (value: string | number | null | undefined) => {
        const s = String(value ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csv = [
        header.join(','),
        ...sorted.map((r) =>
          [r.studentId, r.fullName, r.email, r.graduationYear, r.employmentStatus, r.company, r.jobTitle, r.location, r.salary]
            .map(escape)
            .join(',')
        ),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${(data?.department?.code || 'department').toLowerCase()}-graduates.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-2xl border p-10 text-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
        <AlertCircle className={`h-8 w-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
        <h3 className={`mt-4 text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Unable to load graduates</h3>
        <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{error}</p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#003580] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Try again
        </button>
      </div>
    );
  }

  const SortIcon = ({ field }: { field: keyof DepartmentAlumniRecord }) =>
    sortField === field ? (
      sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
    ) : null;

  const columns: Array<[keyof DepartmentAlumniRecord, string]> = [
    ['fullName', 'Name'],
    ['studentId', 'Student ID'],
    ['graduationYear', 'Year'],
    ['employmentStatus', 'Status'],
    ['company', 'Company'],
    ['jobTitle', 'Role'],
    ['salary', 'Salary'],
    ['location', 'Location'],
  ];
  const colSpan = columns.length + 1;

  return (
    <div className="space-y-5">
      <div className={`rounded-[10px] border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Graduates</h2>
            <p className={`mt-1.5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {data?.department
                ? `${data.department.name} (${data.department.code}) · ${data.alumni.length} alumni`
                : `${data?.alumni.length ?? 0} alumni`}
              {salarySummary && (
                <span className="font-medium text-[#003580]">
                  {' '}· Avg {formatSalary(salarySummary.avg)} · Range {formatSalary(salarySummary.min)}–{formatSalary(salarySummary.max)}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Reload graduate records"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60 ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || sorted.length === 0}
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
              placeholder="Search name, student ID, email, company..."
              className={`w-full rounded-xl border py-2.5 pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/30 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className={`rounded-xl border px-3 py-2.5 text-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
          >
            <option value="All">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {statusTabs.map(([key, label]) => {
            const active = statusFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#003580] text-white'
                    : darkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
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
        {(searchTerm || yearFilter !== 'All' || statusFilter !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setYearFilter('All');
              setStatusFilter('All');
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#003580]"
          >
            <X className="h-4 w-4" /> Reset filters
          </button>
        )}
      </div>

      <div className={`overflow-hidden rounded-[10px] border shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60'}`}>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-[#003580]/8'}`}>
              <Users className={`h-7 w-7 ${darkMode ? 'text-slate-400' : 'text-[#003580]'}`} />
            </div>
            <p className={`mt-4 text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {(data?.alumni.length ?? 0) === 0 ? 'No alumni linked yet' : 'No graduates match your filters'}
            </p>
            <p className={`mt-1 max-w-sm text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {(data?.alumni.length ?? 0) === 0
                ? 'Graduate records will appear here once alumni are linked to your department.'
                : 'Try clearing search or adjusting year and employment status filters.'}
            </p>
            {(searchTerm || yearFilter !== 'All' || statusFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setYearFilter('All');
                  setStatusFilter('All');
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#003580] px-4 py-2 text-xs font-semibold text-white"
              >
                <X className="h-3.5 w-3.5" /> Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[68rem] text-sm">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/80'}`}>
                  <th className="w-10 px-2 py-3 text-left">
                    <span className="sr-only">Details</span>
                  </th>
                  {columns.map(([field, label]) => (
                    <th
                      key={field}
                      onClick={() => handleSort(field)}
                      className={`cursor-pointer select-none px-4 py-3 text-left font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {label}
                        <SortIcon field={field} />
                      </span>
                    </th>
                  ))}
                  <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((record) => {
                  const isOpen = expandedId === record.id;
                  return (
                    <Fragment key={record.id}>
                      <tr className={`border-b last:border-0 ${darkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-100 hover:bg-slate-50'}`}>
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
                        <td className="px-4 py-3">
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{record.fullName}</div>
                          <div className={`mt-0.5 flex items-center gap-1.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {record.email || 'No email'}
                            {record.isVerified && (
                              <span className="inline-flex items-center gap-0.5 text-emerald-600">
                                <CheckCircle2 className="h-3 w-3" /> Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`px-4 py-3 tabular-nums ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{record.studentId}</td>
                        <td className={`px-4 py-3 tabular-nums ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{record.graduationYear || '—'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={record.employmentStatus} />
                        </td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{record.company || '—'}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{record.jobTitle || '—'}</td>
                        <td className={`whitespace-nowrap px-4 py-3 tabular-nums ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{formatSalary(record.salary)}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{record.location || '—'}</td>
                        <td className="px-4 py-3">
                          {onMessageGraduate && record.userId ? (
                            <button
                              type="button"
                              onClick={() => onMessageGraduate(record)}
                              title="Message graduate"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#003580]/20 bg-[#003580]/5 px-2.5 py-1.5 text-xs font-semibold text-[#003580] transition hover:bg-[#003580] hover:text-white"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              Message
                            </button>
                          ) : (
                            <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>—</span>
                          )}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className={`${darkMode ? 'bg-slate-800/30' : 'bg-slate-50/60'}`}>
                          <td colSpan={colSpan + 1} className="px-5 py-4">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                              <DetailItem icon={Mail} label="Email" value={record.email ?? '—'} darkMode={darkMode} />
                              <DetailItem icon={Phone} label="Phone" value={record.phone ?? '—'} darkMode={darkMode} />
                              <DetailItem icon={IdCard} label="Student ID" value={record.studentId} darkMode={darkMode} />
                              <DetailItem icon={GraduationCap} label="Graduation Year" value={record.graduationYear ? String(record.graduationYear) : '—'} darkMode={darkMode} />
                              <DetailItem icon={Banknote} label="Salary" value={formatSalary(record.salary)} darkMode={darkMode} />
                              <DetailItem icon={MapPin} label="Location" value={record.location ?? '—'} darkMode={darkMode} />
                              <div>
                                <div className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                  <Briefcase className="h-3.5 w-3.5" />
                                  Status
                                </div>
                                <div className="mt-1.5">
                                  <StatusBadge status={record.employmentStatus} />
                                </div>
                              </div>
                              <div>
                                <div className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Verification
                                </div>
                                <div className={`mt-1 text-sm font-medium ${record.isVerified ? 'text-emerald-600' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {record.isVerified ? 'Verified alumni' : 'Not verified'}
                                </div>
                              </div>
                              <div className="sm:col-span-2 lg:col-span-4">
                                <div className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                  <Sparkles className="h-3.5 w-3.5" />
                                  Skills
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {(record.skills?.length ? record.skills : []).map((skill) => (
                                    <span
                                      key={skill}
                                      className="rounded-full bg-[#003580]/10 px-2.5 py-1 text-xs font-medium text-[#003580] dark:bg-[#003580]/20 dark:text-blue-300"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {!(record.skills?.length) && (
                                    <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>—</span>
                                  )}
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
          </div>
        )}
        <div className={`border-t px-4 py-3 text-xs ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
          Showing {sorted.length} of {data?.alumni.length ?? 0} graduates
        </div>
      </div>
    </div>
  );
};

export default GraduatesDirectory;