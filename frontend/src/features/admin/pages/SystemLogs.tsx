import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  History,
  KeyRound,
  Search,
  Shield,
  Sparkles,
  UserCog,
  Users,
  Wifi,
  X,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
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

function summaryCard({ label, value, icon: Icon, hint }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; hint: string }) {
  return (
    <div className="admin-card rounded-[10px] border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003580]/10 text-[#003580]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function PaginationFooter({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems <= itemsPerPage) return null;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-600">
      <div>
        Showing <span className="font-semibold text-slate-800">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-800">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-800">{totalItems}</span> log entries
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-[6px] border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>
        <span className="px-2 font-medium text-slate-500">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-[6px] border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
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
              className="inline-flex items-center gap-2 rounded-[8px] bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-inner backdrop-blur-sm"
            >
              <Download className="h-4 w-4 text-[#FFCC00]" />
              Export Logs
              <ChevronDown className="h-4 w-4 text-[#FFCC00]" />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                {(['CSV', 'JSON'] as const).map((exportFormat) => (
                  <button
                    key={exportFormat}
                    type="button"
                    onClick={() => exportLogs(exportFormat)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5"
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

      <section className="rounded-[10px] bg-[#0A1628] px-5 py-3 text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
          <span className="rounded-full bg-white/10 px-3 py-1">CPU: {health.cpu}%</span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            Memory: {health.memoryUsed.toFixed(1)}GB / {health.memoryTotal}GB
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1">Sessions: {stats.activeSessions || health.sessions}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Uptime: {health.uptime.toFixed(1)}%</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total events today', value: stats.totalToday.toLocaleString(), icon: History, hint: 'All system events logged in the last 24 hours' },
          { label: 'Errors today', value: stats.errorsToday.toLocaleString(), icon: X, hint: 'Critical failures requiring attention' },
          { label: 'Active sessions', value: (stats.activeSessions || health.sessions).toString(), icon: Wifi, hint: 'Currently authenticated and active sessions' },
          { label: 'Failed logins (24h)', value: stats.failedLogins.toLocaleString(), icon: KeyRound, hint: 'Blocked or invalid authentication attempts' },
        ].map((card) => (
          <React.Fragment key={card.label}>{summaryCard(card)}</React.Fragment>
        ))}
      </section>

      <section className="admin-card rounded-[10px] border border-slate-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="grid gap-3 xl:grid-cols-12">
          <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-3">
            <Filter className="h-4 w-4 text-slate-400" />
            <select value={actionType} onChange={(event) => setActionType(event.target.value as ActionType)} className="w-full bg-transparent outline-none">
              {['All', 'Login', 'Data Import', 'User Action', 'Error', 'System', 'API'].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search by user email..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-3">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-3">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm xl:col-span-3">
            <Shield className="h-4 w-4 text-slate-400" />
            <select value={severity} onChange={(event) => setSeverity(event.target.value as Severity)} className="w-full bg-transparent outline-none">
              {['All', 'Info', 'Warning', 'Error', 'Success'].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="admin-card overflow-hidden rounded-[10px] border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="max-h-[520px] overflow-x-auto overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 shadow-sm z-10">
              <tr>
                {['Timestamp', 'User', 'Action', 'Details', 'IP Address', 'Severity'].map((head) => (
                  <th key={head} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    Loading logs...
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    No logs found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/70"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap" title={format(new Date(log.timestamp), 'PPpp')}>
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900">{log.userEmail}</div>
                        <AdminBadge variant="neutral">{log.role}</AdminBadge>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <AdminBadge variant="default" className={actionBadge(log.action)}>
                        {log.action}
                      </AdminBadge>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{log.details}</td>
                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{log.ipAddress}</td>
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
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLogs.length}
          itemsPerPage={LOGS_PER_PAGE}
          onPageChange={setCurrentPage}
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
              className="rounded-[8px] bg-[#003580] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Details</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selectedLog.details}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Payload</p>
              <pre className="mt-2 overflow-x-auto rounded-[10px] border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
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
    <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function randomDelta() {
  return Math.floor(Math.random() * 5) - 2;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
