import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
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

// Logs will be fetched from API
// ActionType now matches backend or is mapped to it

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

import { adminService } from '../services/admin.service';

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [stats, setStats] = useState({ totalToday: 0, errorsToday: 0, failedLogins: 0 });
  const [loading, setLoading] = useState(true);
  
  const [actionType, setActionType] = useState<ActionType>('All');
  const [userSearch, setUserSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [severity, setSeverity] = useState<Severity>('All');
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogRow | null>(null);
  const [health, setHealth] = useState({
    cpu: 34,
    memoryUsed: 2.1,
    memoryTotal: 8,
    sessions: 47,
    uptime: 99.8,
  });

  useEffect(() => {
    const updateHealth = () => {
      setHealth((current) => {
        const nextCpu = clamp(current.cpu + randomDelta(), 18, 72);
        const nextMemory = clamp(roundOne(current.memoryUsed + randomDelta() * 0.08), 1.4, 6.8);
        const nextSessions = clamp(Math.round(current.sessions + randomDelta()), 38, 66);
        const nextUptime = clamp(roundOne(current.uptime + randomDelta() * 0.02), 99.1, 99.99);

        return {
          cpu: nextCpu,
          memoryUsed: nextMemory,
          memoryTotal: current.memoryTotal,
          sessions: nextSessions,
          uptime: nextUptime,
        };
      });
    };

    const interval = window.setInterval(updateHealth, 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [actionType, userSearch, dateFrom, dateTo, severity]);

  const fetchLogs = async () => {
    setLoading(true);
    const result = await adminService.getLogs({
      query: userSearch,
      action: actionType !== 'All' ? actionType : undefined,
      dateFrom,
      dateTo,
    });
    if (result.ok) {
      // Backend filtering is applied, but severity might need local filter if backend didn't implement severity filter
      let fetchedLogs = result.data.logs;
      if (severity !== 'All') {
        fetchedLogs = fetchedLogs.filter((log: any) => log.severity === severity);
      }
      setLogs(fetchedLogs);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const result = await adminService.getLogStats();
    if (result.ok) {
      setStats(result.data);
    }
  };

  const filteredLogs = logs;

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
        breadcrumb={[{ label: 'Admin' }, { label: 'System Logs' }]}
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
          <span className="rounded-full bg-white/10 px-3 py-1">Sessions: {health.sessions}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Uptime: {health.uptime.toFixed(1)}%</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total events today', value: stats.totalToday.toLocaleString(), icon: History, hint: 'All system events logged in the last 24 hours' },
          { label: 'Errors today', value: stats.errorsToday.toLocaleString(), icon: X, hint: 'Critical failures requiring attention' },
          { label: 'Active sessions', value: health.sessions.toString(), icon: Wifi, hint: 'Currently authenticated and active sessions' },
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
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
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
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    No logs found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/70"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-4 py-4 text-slate-600" title={format(new Date(log.timestamp), 'PPpp')}>
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900">{log.userEmail}</div>
                        <AdminBadge variant="neutral">{log.role}</AdminBadge>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <AdminBadge variant="default" className={actionBadge(log.action)}>
                        {log.action}
                      </AdminBadge>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{log.details}</td>
                    <td className="px-4 py-4 text-slate-600">{log.ipAddress}</td>
                    <td className="px-4 py-4">
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
