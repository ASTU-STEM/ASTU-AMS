import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Cpu,
  Download,
  Filter,
  History,
  KeyRound,
  MemoryStick,
  RefreshCw,
  Search,
  Server,
  Shield,
  Wifi,
  X,
} from 'lucide-react';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminEmptyState from '../components/AdminEmptyState';
import AdminStatGrid from '../components/AdminStatGrid';
import AdminSectionCard, {
  adminFilterShellClass,
  adminHeroGhostBtnClass,
  adminHeroPrimaryBtnClass,
  adminPanelClass,
  adminTableHeadClass,
  adminTableRowClass,
} from '../components/AdminSectionCard';
import { adminService } from '../services/admin.service';

type ActionFilter = 'All' | 'Login' | 'Data Import' | 'User Action' | 'Error' | 'System' | 'API';
type Severity = 'All' | 'Info' | 'Warning' | 'Error' | 'Success';
type SeverityValue = Exclude<Severity, 'All'>;

type LogRow = {
  id: string;
  timestamp: string;
  userEmail: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
  severity: SeverityValue;
  requestId: string;
  payload: string;
};

const LIVE_POLL_MS = 45_000;
const ACTION_OPTIONS: ActionFilter[] = ['All', 'Login', 'Data Import', 'User Action', 'Error', 'System', 'API'];
const SEVERITY_OPTIONS: Severity[] = ['All', 'Info', 'Warning', 'Error', 'Success'];

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function parseTimestamp(value: string) {
  const iso = parseISO(value);
  if (isValid(iso)) return iso;
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
}

function formatRelative(value: string) {
  const date = parseTimestamp(value);
  if (!date) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
}

function formatAbsolute(value: string) {
  const date = parseTimestamp(value);
  if (!date) return value || '—';
  return format(date, 'PPpp');
}

function normalizeSeverity(value: unknown): SeverityValue {
  const raw = String(value || 'Info');
  if (raw === 'Warning' || raw === 'Error' || raw === 'Success' || raw === 'Info') return raw;
  return 'Info';
}

function normalizeLog(raw: any): LogRow {
  return {
    id: String(raw.id || `${raw.timestamp || Date.now()}-${raw.action || 'log'}`),
    timestamp: raw.timestamp || raw.createdAt || new Date().toISOString(),
    userEmail: raw.userEmail || raw.user?.email || 'system',
    role: raw.role || raw.user?.role || 'System',
    action: raw.action || 'System',
    details: raw.details || '',
    ipAddress: raw.ipAddress || '::1',
    severity: normalizeSeverity(raw.severity),
    requestId: raw.requestId || `REQ-${String(raw.id || 'unknown').slice(0, 8)}`,
    payload:
      typeof raw.payload === 'string'
        ? raw.payload
        : JSON.stringify(
            {
              action: raw.action,
              details: raw.details,
              ip: raw.ipAddress || '::1',
              timestamp: raw.timestamp || raw.createdAt,
            },
            null,
            2
          ),
  };
}

function actionBadge(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes('login')) return 'bg-[#003580]/10 text-[#003580] border-[#003580]/15';
  if (lower.includes('import') || lower.includes('sync')) return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
  if (lower.includes('error') || lower.includes('fail')) return 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15';
  if (lower.includes('api')) return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10';
  if (lower.includes('system')) return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20';
  return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
}

function severityVariant(severity: SeverityValue): 'info' | 'warning' | 'danger' | 'success' {
  switch (severity) {
    case 'Warning':
      return 'warning';
    case 'Error':
      return 'danger';
    case 'Success':
      return 'success';
    default:
      return 'info';
  }
}

function HealthPill({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/10">
      <Icon className="h-3.5 w-3.5 text-[#FFCC00]" />
      <span className="text-white/70">{label}</span>
      <span className="text-white">{value}</span>
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ totalToday: 0, errorsToday: 0, failedLogins: 0, activeSessions: 0 });
  const [health, setHealth] = useState({
    cpu: 0,
    memoryUsed: 0,
    memoryTotal: 0,
    sessions: 0,
    uptime: 100,
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const [lastSynced, setLastSynced] = useState<string | undefined>();
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogRow | null>(null);

  const [actionType, setActionType] = useState<ActionFilter>('All');
  const [userSearch, setUserSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [severity, setSeverity] = useState<Severity>('All');
  const debouncedSearch = useDebouncedValue(userSearch, 400);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    actionType !== 'All' ||
    userSearch.trim() !== '' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    severity !== 'All';

  const fetchLogs = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setLoadError(null);
      }
      const clientSeverity = severity !== 'All';
      const result = await adminService.getLogs({
        page: clientSeverity ? 1 : currentPage,
        limit: clientSeverity ? 100 : pageLimit,
        query: debouncedSearch || undefined,
        action: actionType !== 'All' ? actionType : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      if (result.ok) {
        let fetchedLogs: LogRow[] = (result.data.logs || []).map(normalizeLog);
        if (clientSeverity) {
          fetchedLogs = fetchedLogs.filter((log) => log.severity === severity);
        }
        setLogs(fetchedLogs);
        setTotal(clientSeverity ? fetchedLogs.length : Number(result.data.total ?? fetchedLogs.length));
      } else if (!silent) {
        setLoadError(result.message || 'Failed to load system logs');
        toast.error(result.message || 'Failed to load system logs');
      }
      if (!silent) setLoading(false);
      setLastSynced(new Date().toLocaleTimeString());
    },
    [actionType, debouncedSearch, dateFrom, dateTo, severity, currentPage, pageLimit]
  );

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setStatsLoading(true);
    const result = await adminService.getLogStats();
    if (result.ok && result.data) {
      setStats({
        totalToday: result.data.totalToday ?? 0,
        errorsToday: result.data.errorsToday ?? 0,
        failedLogins: result.data.failedLogins ?? 0,
        activeSessions: result.data.activeSessions ?? result.data.health?.sessions ?? 0,
      });
      if (result.data.health) setHealth(result.data.health);
    }
    setStatsLoading(false);
    setLastSynced(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      fetchLogs(true);
      fetchStats(true);
    }, LIVE_POLL_MS);
    return () => window.clearInterval(id);
  }, [live, fetchLogs, fetchStats]);

  useEffect(() => {
    setCurrentPage(1);
  }, [actionType, debouncedSearch, dateFrom, dateTo, severity, pageLimit]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!exportMenuRef.current?.contains(event.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageLimit));
  const displayLogs = useMemo(() => {
    // When severity filter is client-side over a larger fetch, paginate locally.
    if (severity !== 'All') {
      const start = (currentPage - 1) * pageLimit;
      return logs.slice(start, start + pageLimit);
    }
    return logs;
  }, [logs, severity, currentPage, pageLimit]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const clearFilters = () => {
    setActionType('All');
    setUserSearch('');
    setDateFrom('');
    setDateTo('');
    setSeverity('All');
    setCurrentPage(1);
    toast.success('Filters cleared');
  };

  const handleRefresh = async () => {
    await Promise.all([fetchLogs(), fetchStats()]);
    toast.success('System logs refreshed');
  };

  const exportLogs = async (exportFormat: 'CSV' | 'JSON') => {
    setExporting(true);
    try {
      const result = await adminService.getLogs({
        page: 1,
        limit: 1000,
        query: debouncedSearch || undefined,
        action: actionType !== 'All' ? actionType : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      let rows: LogRow[] = result.ok ? (result.data.logs || []).map(normalizeLog) : [...logs];
      if (severity !== 'All') rows = rows.filter((log) => log.severity === severity);

      if (rows.length === 0) {
        toast.error('No logs to export.');
        return;
      }

      const payload =
        exportFormat === 'CSV'
          ? [
              ['Timestamp', 'User Email', 'Role', 'Action', 'Details', 'IP Address', 'Severity', 'Request ID'],
              ...rows.map((log) => [
                log.timestamp,
                log.userEmail,
                log.role,
                log.action,
                log.details,
                log.ipAddress,
                log.severity,
                log.requestId,
              ]),
            ]
              .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
              .join('\n')
          : JSON.stringify(rows, null, 2);

      const blob = new Blob([payload], {
        type: exportFormat === 'CSV' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `astu-system-logs.${exportFormat.toLowerCase()}`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} log(s)`);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
      setExportOpen(false);
    }
  };

  const copyRequestId = async () => {
    if (!selectedLog) return;
    try {
      await navigator.clipboard.writeText(selectedLog.requestId);
      toast.success('Request ID copied');
    } catch {
      toast.error('Could not copy request ID');
    }
  };

  const summaryStats = [
    {
      title: 'Events today',
      value: statsLoading ? '…' : stats.totalToday.toLocaleString(),
      icon: History,
      tone: 'blue' as const,
      description: 'Logged in the last 24 hours',
      loading: statsLoading,
      onClick: () => {
        setDateFrom('');
        setDateTo('');
        setActionType('All');
        setSeverity('All');
      },
    },
    {
      title: 'Errors today',
      value: statsLoading ? '…' : stats.errorsToday.toLocaleString(),
      icon: AlertTriangle,
      tone: 'red' as const,
      description: stats.errorsToday > 0 ? 'Needs attention' : 'No critical failures',
      loading: statsLoading,
      onClick: () => setSeverity('Error'),
    },
    {
      title: 'Active sessions',
      value: statsLoading ? '…' : String(stats.activeSessions || health.sessions),
      icon: Wifi,
      tone: 'green' as const,
      description: 'Currently authenticated users',
      loading: statsLoading,
    },
    {
      title: 'Failed logins',
      value: statsLoading ? '…' : stats.failedLogins.toLocaleString(),
      icon: KeyRound,
      tone: 'amber' as const,
      description: 'Blocked or invalid auth (24h)',
      loading: statsLoading,
      onClick: () => {
        setActionType('Login');
        setSeverity('Error');
      },
    },
  ];

  if (loadError && !loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="System Logs"
          subtitle="Audit administrative actions, auth events, and platform activity."
          breadcrumbs={[{ label: 'Admin' }, { label: 'Configuration' }]}
        />
        <AdminEmptyState
          icon={AlertTriangle}
          title="Couldn’t load system logs"
          description={loadError}
          action={
            <button type="button" onClick={() => fetchLogs()} className="rounded-xl bg-[#003580] px-4 py-2 text-xs font-bold text-white">
              Retry
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="System Logs"
        subtitle="Audit administrative actions, auth events, imports, and platform activity in real time."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Configuration' }]}
        lastSynced={lastSynced}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLive((v) => !v)}
              className={`${adminHeroGhostBtnClass} ${live ? 'ring-1 ring-[#FFCC00]/40' : ''}`}
              title={live ? 'Live updates on — click to pause' : 'Live updates paused — click to resume'}
            >
              <span className="relative flex h-2 w-2">
                {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? 'bg-emerald-400' : 'bg-white/40'}`} />
              </span>
              {live ? 'Live' : 'Paused'}
            </button>
            <button type="button" onClick={handleRefresh} className={adminHeroGhostBtnClass}>
              <RefreshCw className="h-4 w-4 text-[#FFCC00]" />
              Refresh
            </button>
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setExportOpen((current) => !current)}
                disabled={exporting}
                className={adminHeroPrimaryBtnClass}
              >
                <Download className="h-4 w-4" />
                {exporting ? 'Exporting…' : 'Export'}
                <ChevronDown className="h-4 w-4" />
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                  {(['CSV', 'JSON'] as const).map((exportFormat) => (
                    <button
                      key={exportFormat}
                      type="button"
                      onClick={() => exportLogs(exportFormat)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Download className="h-4 w-4" />
                      {exportFormat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        }
      />

      <section className="rounded-2xl bg-gradient-to-r from-[#001F4D] via-[#003366] to-[#004080] px-5 py-3.5 text-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#FFCC00]/90">
            <Server className="h-3.5 w-3.5" />
            Runtime health
          </span>
          <HealthPill icon={Cpu} label="CPU" value={`${health.cpu}%`} />
          <HealthPill icon={MemoryStick} label="Memory" value={`${health.memoryUsed.toFixed(1)} / ${health.memoryTotal} GB`} />
          <HealthPill icon={Wifi} label="Sessions" value={String(stats.activeSessions || health.sessions)} />
          <HealthPill icon={Shield} label="Uptime" value={`${health.uptime.toFixed(1)}%`} />
        </div>
      </section>

      <AdminStatGrid stats={summaryStats} cols={4} compact />

      <AdminSectionCard
        title="Audit trail"
        subtitle={`${total.toLocaleString()} matching event${total === 1 ? '' : 's'}. Click a row for payload detail.`}
        headerAction={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          ) : null
        }
      >
        <div className="mb-4 grid gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-2.5 xl:grid-cols-12">
          <label className={`${adminFilterShellClass} bg-[var(--bg-card)] xl:col-span-3`}>
            <Filter className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <select
              value={actionType}
              onChange={(event) => setActionType(event.target.value as ActionFilter)}
              className="w-full bg-transparent outline-none"
            >
              {ACTION_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item === 'All' ? 'All actions' : item}
                </option>
              ))}
            </select>
          </label>

          <label className={`${adminFilterShellClass} bg-[var(--bg-card)] xl:col-span-3`}>
            <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search user, action, or details…"
              className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
            />
          </label>

          <div className={`${adminFilterShellClass} bg-[var(--bg-card)] xl:col-span-2`}>
            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full bg-transparent outline-none"
              aria-label="From date"
            />
          </div>

          <div className={`${adminFilterShellClass} bg-[var(--bg-card)] xl:col-span-2`}>
            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full bg-transparent outline-none"
              aria-label="To date"
            />
          </div>

          <label className={`${adminFilterShellClass} bg-[var(--bg-card)] xl:col-span-2`}>
            <Shield className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value as Severity)}
              className="w-full bg-transparent outline-none"
            >
              {SEVERITY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item === 'All' ? 'All severities' : item}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loadError ? (
          <AdminEmptyState
            icon={AlertTriangle}
            title="Couldn’t refresh audit trail"
            description={loadError}
            action={
              <button type="button" onClick={() => fetchLogs()} className="rounded-xl bg-[#003580] px-4 py-2 text-xs font-bold text-white">
                Retry
              </button>
            }
          />
        ) : (
          <>
            <div className={`${adminPanelClass} overflow-hidden !shadow-none border border-[var(--border-color)]`}>
              <div className="max-h-[560px] overflow-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr>
                      {['Timestamp', 'User', 'Action', 'Details', 'IP Address', 'Severity'].map((head) => (
                        <th key={head} className={`${adminTableHeadClass} px-3.5 py-3 whitespace-nowrap`}>
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="border-t border-[var(--border-color)]">
                          {Array.from({ length: 6 }).map((__, j) => (
                            <td key={j} className="px-3.5 py-3">
                              <div className="h-3.5 animate-pulse rounded bg-[var(--bg-page)]" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : displayLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4">
                          <AdminEmptyState
                            icon={History}
                            title="No matching logs"
                            description="Try adjusting filters or expanding the date range."
                            action={
                              hasActiveFilters ? (
                                <button type="button" onClick={clearFilters} className="rounded-xl bg-[#003580] px-4 py-2 text-xs font-bold text-white">
                                  Clear filters
                                </button>
                              ) : undefined
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      displayLogs.map((log) => (
                        <tr
                          key={log.id}
                          className={`${adminTableRowClass} cursor-pointer ${
                            log.severity === 'Error' ? 'bg-rose-50/40 dark:bg-[#3B1A22]/30' : ''
                          }`}
                          onClick={() => setSelectedLog(log)}
                        >
                          <td className="px-3.5 py-3 whitespace-nowrap text-[var(--text-secondary)]" title={formatAbsolute(log.timestamp)}>
                            {formatRelative(log.timestamp)}
                          </td>
                          <td className="px-3.5 py-3">
                            <div className="space-y-1">
                              <div className="font-semibold text-[var(--text-primary)]">{log.userEmail}</div>
                              <AdminBadge variant="neutral">{log.role}</AdminBadge>
                            </div>
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${actionBadge(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="max-w-[280px] truncate px-3.5 py-3 text-[var(--text-secondary)]" title={log.details}>
                            {log.details || '—'}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap font-mono text-[11px] text-[var(--text-secondary)]">
                            {log.ipAddress}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <AdminBadge variant={severityVariant(log.severity)}>{log.severity}</AdminBadge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-color)] pt-3 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageLimit}
                  onChange={(e) => setPageLimit(Number(e.target.value))}
                  className="rounded border border-[var(--border-color)] px-2 py-1 text-xs outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>per page</span>
              </div>
              <div>
                {total === 0
                  ? '0 records'
                  : `Showing ${(currentPage - 1) * pageLimit + 1}–${Math.min(currentPage * pageLimit, total)} of ${total}`}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded border border-[var(--border-color)] px-2.5 py-1 font-medium disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <span className="px-2 font-semibold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded border border-[var(--border-color)] px-2.5 py-1 font-medium disabled:opacity-40"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </AdminSectionCard>

      <AdminModal
        open={Boolean(selectedLog)}
        title={selectedLog?.requestId ?? 'Log Detail'}
        subtitle="Audit event payload and metadata"
        onClose={() => setSelectedLog(null)}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={copyRequestId}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Copy className="h-4 w-4" />
              Copy ID
            </button>
            <button
              type="button"
              onClick={() => setSelectedLog(null)}
              className="rounded-xl bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${actionBadge(selectedLog.action)}`}>
                {selectedLog.action}
              </span>
              <AdminBadge variant={severityVariant(selectedLog.severity)}>{selectedLog.severity}</AdminBadge>
              <AdminBadge variant="neutral">{selectedLog.role}</AdminBadge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Detail label="Timestamp" value={formatAbsolute(selectedLog.timestamp)} />
              <Detail label="User" value={selectedLog.userEmail} />
              <Detail label="Role" value={selectedLog.role} />
              <Detail label="Action" value={selectedLog.action} />
              <Detail label="IP Address" value={selectedLog.ipAddress} />
              <Detail label="Severity" value={selectedLog.severity} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Details</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{selectedLog.details || 'No details provided.'}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Payload</p>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4 text-xs text-[var(--text-secondary)]">
                {selectedLog.payload}
              </pre>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
