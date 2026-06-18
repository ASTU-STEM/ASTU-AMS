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
  Activity,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import AdminBadge from '../components/AdminBadge';
import AdminModal from '../components/AdminModal';
import { adminApi } from '../api/adminApi';

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

function summaryCard({ label, value, icon: Icon, hint, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; hint: string; color?: string }) {
  const iconColor = color || '#003580';
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,51,128,0.15)] hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow" style={{ background: `linear-gradient(135deg, ${iconColor}15 0%, ${iconColor}25 100%)`, color: iconColor }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);
        const logsData = await adminApi.listLogs({ limit: 100 });
        const rawLogs = logsData?.logs || [];
        const mappedLogs = rawLogs.map((log: any) => {
          let normalizedAction: ActionType = 'User Action';
          const actionUpper = String(log.action).toUpperCase();
          if (actionUpper === 'LOGIN') normalizedAction = 'Login';
          else if (actionUpper === 'DATA IMPORT' || actionUpper === 'DATA_IMPORT') normalizedAction = 'Data Import';
          else if (actionUpper === 'ERROR') normalizedAction = 'Error';
          else if (actionUpper === 'SYSTEM') normalizedAction = 'System';
          else if (actionUpper === 'API') normalizedAction = 'API';
          else if (actionUpper === 'ALL') normalizedAction = 'All';
          else normalizedAction = 'User Action';

          let normalizedSeverity: Exclude<Severity, 'All'> = 'Info';
          const sevUpper = String(log.severity).toUpperCase();
          if (sevUpper === 'INFO') normalizedSeverity = 'Info';
          else if (sevUpper === 'WARNING') normalizedSeverity = 'Warning';
          else if (sevUpper === 'ERROR') normalizedSeverity = 'Error';
          else if (sevUpper === 'SUCCESS') normalizedSeverity = 'Success';

          return {
            id: log.id,
            timestamp: log.timestamp || log.createdAt || new Date().toISOString(),
            userEmail: log.userEmail || (log.user ? log.user.email : '') || 'System',
            role: log.role || (log.user ? log.user.role : '') || 'System',
            action: normalizedAction,
            details: log.details || '',
            ipAddress: log.ipAddress || '',
            severity: normalizedSeverity,
            requestId: log.requestId || '',
            payload: log.payload || '',
          };
        });
        setLogs(mappedLogs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

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

  const logStats = useMemo(() => {
    const totalEvents = logs.length;
    const errorsCount = logs.filter((l) => l.severity === 'Error').length;
    const loginsCount = logs.filter((l) => l.action === 'Login').length;
    const failedLogins = logs.filter((l) => l.action === 'Login' && l.severity === 'Error').length;

    return [
      { label: 'Total events', value: String(totalEvents), icon: History, hint: 'Total logs currently loaded in this set', color: '#003580' },
      { label: 'Errors recorded', value: String(errorsCount), icon: X, hint: 'Critical log failures in this set', color: '#E24B4A' },
      { label: 'Logins logged', value: String(loginsCount), icon: Wifi, hint: 'Authentication events in this set', color: '#1D9E75' },
      { label: 'Failed logins', value: String(failedLogins), icon: KeyRound, hint: 'Failed login attempts in this set', color: '#E8A020' },
    ];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction = actionType === 'All' || log.action === actionType;
      const matchesUser = !userSearch || [log.userEmail, log.role].join(' ').toLowerCase().includes(userSearch.toLowerCase());
      const matchesSeverity = severity === 'All' || log.severity === severity;
      const timestamp = new Date(log.timestamp).getTime();
      const matchesFrom = !dateFrom || timestamp >= new Date(dateFrom).getTime();
      const matchesTo = !dateTo || timestamp <= new Date(`${dateTo}T23:59:59`).getTime();
      return matchesAction && matchesUser && matchesSeverity && matchesFrom && matchesTo;
    });
  }, [actionType, userSearch, dateFrom, dateTo, severity]);

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
      {/* Hero Banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #001f4d 0%, #003580 50%, #00508a 100%)', boxShadow: '0 8px 30px rgba(0,53,128,0.35)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 85% -5%, rgba(29,158,117,0.30), transparent)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 70% at -5% 70%, rgba(232,160,32,0.10), transparent)' }} />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(29,158,117,0.15)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
                <Activity className="h-5 w-5" style={{ color: '#E8A020' }} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>System Logs</h1>
                <p className="mt-0.5 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  Audit administrative actions and system events.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#ffffff', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ animation: 'blink 1.5s ease-in-out infinite' }} />
                Live
              </span>
            </div>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', color: '#ffffff', backdropFilter: 'blur(8px)' }}
            >
              <Download className="h-3.5 w-3.5" />
              Export Logs
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-14 z-20 w-48 overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                {(['CSV', 'JSON'] as const).map((exportFormat) => (
                  <button
                    key={exportFormat}
                    type="button"
                    onClick={() => exportLogs(exportFormat)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-white hover:bg-white/20 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    {exportFormat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="px-2 py-4">
        <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-white">
          <span>CPU: {health.cpu}%</span>
          <span>
            Memory: {health.memoryUsed.toFixed(1)}GB / {health.memoryTotal}GB
          </span>
          <span>Sessions: {health.sessions}</span>
          <span>Uptime: {health.uptime.toFixed(1)}%</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {logStats.map((card) => (
          <React.Fragment key={card.label}>{summaryCard(card)}</React.Fragment>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="grid gap-4 xl:grid-cols-12">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-3 hover:border-slate-300 transition-all">
            <Filter className="h-4.5 w-4.5 text-slate-400" />
            <select value={actionType} onChange={(event) => setActionType(event.target.value as ActionType)} className="w-full bg-transparent outline-none">
              {['All', 'Login', 'Data Import', 'User Action', 'Error', 'System', 'API'].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-3 hover:border-slate-300 transition-all">
            <Search className="h-4.5 w-4.5 text-slate-400" />
            <input
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search by user email..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-3">
            <CalendarDays className="h-4.5 w-4.5 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-3">
            <CalendarDays className="h-4.5 w-4.5 text-slate-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm xl:col-span-3 hover:border-slate-300 transition-all">
            <Shield className="h-4.5 w-4.5 text-slate-400" />
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

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
              <tr>
                {['Timestamp', 'User', 'Action', 'Details', 'IP Address', 'Severity'].map((head) => (
                  <th key={head} className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50/80 transition-all"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-5 py-4 text-slate-600" title={format(new Date(log.timestamp), 'PPpp')}>
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1.5">
                      <div className="font-semibold text-slate-900">{log.userEmail}</div>
                      <AdminBadge variant="neutral">{log.role}</AdminBadge>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <AdminBadge variant="default" className={actionBadge(log.action)}>
                      {log.action}
                    </AdminBadge>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{log.details}</td>
                  <td className="px-5 py-4 text-slate-600">{log.ipAddress}</td>
                  <td className="px-5 py-4">
                    <AdminBadge variant="default" className={severityClass(log.severity)}>
                      {log.severity}
                    </AdminBadge>
                  </td>
                </tr>
              ))}
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
              className="rounded-xl bg-gradient-to-r from-[#003580] to-[#004499] px-5 py-3 text-sm font-semibold shadow-[0_4px_12px_rgba(0,51,128,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(0,51,128,0.35)] hover:scale-105" style={{ color: '#ffffff' }}
            >
              Close
            </button>
          </div>
        }
      >
        {selectedLog && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
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
              <pre className="mt-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 text-xs text-slate-700">
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
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-800">{value}</p>
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
