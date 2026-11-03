import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Download,
  Filter,
  History,
  KeyRound,
  Search,
  Shield,
  Wifi,
  X,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import AdminPagination from '../components/AdminPagination';
import AdminEmptyState from '../components/AdminEmptyState';
import AdminStatGrid from '../components/AdminStatGrid';
import AdminSectionCard, {
  adminFilterShellClass,
  adminHeroGhostBtnClass,
  adminPanelClass,
  adminTableHeadClass,
  adminTableRowClass,
} from '../components/AdminSectionCard';
import { adminService } from '../services/admin.service';

type ActionType = 'All' | 'Login' | 'Data Import' | 'User Action' | 'Error' | 'System' | 'API';
type Severity = 'All' | 'Info' | 'Warning' | 'Error' | 'Success';

type LogRow = {
  id: string;
  timestamp: string;
  userEmail: string;
  role: string;
  action: ActionType;
  details: string;
  ipAddress: string;
  severity: Exclude<Severity, 'All'>;
  requestId: string;
  payload: string;
};

function actionBadge(action: ActionType) {
  switch (action) {
    case 'Login':
      return 'bg-[#003580]/10 text-[#003580] border-[#003580]/15';
    case 'Data Import':
      return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
    case 'User Action':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    case 'Error':
      return 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15';
    case 'System':
      return 'bg-violet-100 text-violet-700 border-violet-200';
    case 'API':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function severityClass(severity: Exclude<Severity, 'All'>) {
  switch (severity) {
    case 'Info':
      return 'bg-[#003580]/10 text-[#003580] border-[#003580]/15';
    case 'Warning':
      return 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20';
    case 'Error':
      return 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15';
    case 'Success':
      return 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [stats, setStats] = useState({ totalToday: 0, errorsToday: 0, failedLogins: 0, activeSessions: 0 });
  const [loading, setLoading] = useState(true);

  const [actionType, setActionType] = useState<ActionType>('All');
  const [userSearch, setUserSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [severity, setSeverity] = useState<Severity>('All');
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogRow | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const LOGS_PER_PAGE = 10;

  const [health, setHealth] = useState({
    cpu: 0,
    memoryUsed: 0,
    memoryTotal: 0,
    sessions: 0,
    uptime: 100,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const result = await adminService.getLogs({
      query: userSearch,
      action: actionType !== 'All' ? actionType : undefined,
      dateFrom,
      dateTo,
    });
    if (result.ok) {
      let fetchedLogs = result.data.logs;
      if (severity !== 'All') {
        fetchedLogs = fetchedLogs.filter((log: any) => log.severity === severity);
      }
      setLogs(fetchedLogs);
    }
    setLoading(false);
  }, [actionType, userSearch, dateFrom, dateTo, severity]);

  const fetchStats = useCallback(async () => {
    const result = await adminService.getLogStats();
    if (result.ok && result.data) {
      setStats({
        totalToday: result.data.totalToday ?? 0,
        errorsToday: result.data.errorsToday ?? 0,
        failedLogins: result.data.failedLogins ?? 0,
        activeSessions: result.data.activeSessions ?? result.data.health?.sessions ?? 0,
      });
      if (result.data.health) {
        setHealth(result.data.health);
      }
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
    const interval = window.setInterval(fetchStats, 10000);
    return () => window.clearInterval(interval);
  }, [fetchLogs, fetchStats]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [actionType, userSearch, dateFrom, dateTo, severity]);

  const filteredLogs = logs;
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / LOGS_PER_PAGE));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * LOGS_PER_PAGE;
    return filteredLogs.slice(start, start + LOGS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const exportLogs = (format: 'CSV' | 'JSON') => {
    const payload = format === 'CSV'
      ? [
          ['Timestamp', 'User Email', 'Role', 'Action', 'Details', 'IP Address', 'Severity'],
          ...filteredLogs.map((log) => [log.timestamp, log.userEmail, log.role, log.action, log.details, log.ipAddress, log.severity]),
        ]
          .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
          .join('\n')
      : JSON.stringify(filteredLogs, null, 2);

    const blob = new Blob([payload], { type: format === 'CSV' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astu-logs.${format.toLowerCase()}`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const summaryStats = [
    {
      title: 'Total events today',
      value: stats.totalToday.toLocaleString(),
      icon: History,
      tone: 'blue' as const,
      description: 'Logged in the last 24 hours',
    },
    {
      title: 'Errors today',
      value: stats.errorsToday.toLocaleString(),
      icon: X,
      tone: 'red' as const,
      description: 'Critical failures needing attention',
    },
    {
      title: 'Active sessions',
      value: (stats.activeSessions || health.sessions).toString(),
      icon: Wifi,
      tone: 'green' as const,
      description: 'Currently authenticated sessions',
    },
    {
      title: 'Failed logins (24h)',
      value: stats.failedLogins.toLocaleString(),
      icon: KeyRound,
      tone: 'amber' as const,
      description: 'Blocked or invalid auth attempts',
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="System Logs"
        subtitle="Audit administrative actions and system events in real-time."
        breadcrumbs={[{ label: 'Admin' }, { label: 'System Logs' }]}
        actions={
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((current) => !current)}
              className={adminHeroGhostBtnClass}
            >
              <Download className="h-4 w-4 text-[#FFCC00]" />
              Export Logs
              <ChevronDown className="h-4 w-4 text-[#FFCC00]" />
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
        }
      />

      <section className="rounded-2xl bg-gradient-to-r from-[#001F4D] via-[#003366] to-[#004080] px-5 py-3.5 text-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
          <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">CPU: {health.cpu}%</span>
          <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
            Memory: {health.memoryUsed.toFixed(1)}GB / {health.memoryTotal}GB
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
            Sessions: {stats.activeSessions || health.sessions}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">Uptime: {health.uptime.toFixed(1)}%</span>
        </div>
      </section>

      <AdminStatGrid stats={summaryStats} cols={4} compact />

      <AdminSectionCard title="Filters" subtitle="Narrow the audit trail by action, user, date, or severity.">
        <div className="grid gap-3 xl:grid-cols-12">
          <label className={`${adminFilterShellClass} xl:col-span-3`}>
            <Filter className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <select
              value={actionType}
              onChange={(event) => setActionType(event.target.value as ActionType)}
              className="w-full bg-transparent outline-none"
            >
              {['All', 'Login', 'Data Import', 'User Action', 'Error', 'System', 'API'].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className={`${adminFilterShellClass} xl:col-span-3`}>
            <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search by user email..."
              className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
            />
          </label>

          <div className={`${adminFilterShellClass} xl:col-span-2`}>
            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className={`${adminFilterShellClass} xl:col-span-2`}>
            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <label className={`${adminFilterShellClass} xl:col-span-2`}>
            <Shield className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value as Severity)}
              className="w-full bg-transparent outline-none"
            >
              {['All', 'Info', 'Warning', 'Error', 'Success'].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </AdminSectionCard>

      <section className={`${adminPanelClass} overflow-hidden`}>
        <div className="max-h-[520px] overflow-x-auto overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {['Timestamp', 'User', 'Action', 'Details', 'IP Address', 'Severity'].map((head) => (
                  <th key={head} className={`${adminTableHeadClass} px-4 py-3`}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10">
                    <AdminEmptyState title="Loading logs..." description="Fetching the latest audit events." />
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10">
                    <AdminEmptyState
                      icon={History}
                      title="No matching logs"
                      description="Try adjusting filters or expanding the date range."
                    />
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`cursor-pointer ${adminTableRowClass}`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <td
                      className="px-4 py-4 whitespace-nowrap text-[var(--text-secondary)]"
                      title={format(new Date(log.timestamp), 'PPpp')}
                    >
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-[var(--text-primary)]">{log.userEmail}</div>
                        <AdminBadge variant="neutral">{log.role}</AdminBadge>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <AdminBadge variant="default" className={actionBadge(log.action)}>
                        {log.action}
                      </AdminBadge>
                    </td>
                    <td className="px-4 py-4 text-[var(--text-secondary)]">{log.details}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-[var(--text-secondary)]">{log.ipAddress}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <AdminBadge variant="default" className={severityClass(log.severity)}>
                        {log.severity}
                      </AdminBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLogs.length}
          itemsPerPage={LOGS_PER_PAGE}
          onPageChange={setCurrentPage}
          label="log entries"
        />
      </section>

      <AdminModal
        open={Boolean(selectedLog)}
        title={selectedLog?.requestId ?? 'Log Detail'}
        onClose={() => setSelectedLog(null)}
        footer={
          <div className="flex justify-end">
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
            <div className="grid gap-3 md:grid-cols-2">
              <Detail label="Timestamp" value={new Date(selectedLog.timestamp).toLocaleString()} />
              <Detail label="User" value={selectedLog.userEmail} />
              <Detail label="Role" value={selectedLog.role} />
              <Detail label="Action" value={selectedLog.action} />
              <Detail label="IP Address" value={selectedLog.ipAddress} />
              <Detail label="Severity" value={selectedLog.severity} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Details</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{selectedLog.details}</p>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

