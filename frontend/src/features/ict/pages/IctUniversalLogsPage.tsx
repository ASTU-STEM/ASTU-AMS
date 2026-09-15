import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Code,
  Download,
  Eye,
  Filter,
  Globe,
  Key,
  Layers,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Terminal,
  UserCheck,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LogItem {
  id: string;
  timestamp: string;
  portal: 'ALUMNI' | 'EMPLOYER' | 'REGISTRAR' | 'DEPT_HEAD' | 'SUPER_ADMIN' | 'ICT';
  category: 'AUTH' | 'TASK' | 'MUTATION' | 'SECURITY' | 'SYSTEM';
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  action: string;
  actor: string;
  actorEmail: string;
  ipAddress: string;
  details: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
}

const mockLogs: LogItem[] = [
  {
    id: 'LOG-88421',
    timestamp: '2026-09-13 21:14:02',
    portal: 'ICT',
    category: 'SECURITY',
    severity: 'CRITICAL',
    action: 'BREAK_GLASS_ELEVATION',
    actor: 'System Admin',
    actorEmail: 'admin@astust.edu.et',
    ipAddress: '197.156.90.12',
    details: 'Break Glass emergency privilege elevation invoked for 30 minutes. Reason: High database latency diagnosis.',
    beforeState: { role: 'ICT_ADMIN', elevatedPermissions: false, sessionDuration: '1h' },
    afterState: { role: 'ICT_ADMIN', elevatedPermissions: true, sessionDuration: '30m', elevatedAt: '2026-09-13T21:14:02Z' },
  },
  {
    id: 'LOG-88420',
    timestamp: '2026-09-13 21:05:44',
    portal: 'SUPER_ADMIN',
    category: 'MUTATION',
    severity: 'WARN',
    action: 'USER_ROLE_CHANGE',
    actor: 'Executive Admin',
    actorEmail: 'admin@astust.edu.et',
    ipAddress: '197.156.90.12',
    details: 'User account role changed from ADMIN to SUPER_ADMIN',
    beforeState: { id: 'usr-9012', email: 'admin@astust.edu.et', role: 'ADMIN', permissions: ['manage_users'] },
    afterState: { id: 'usr-9012', email: 'admin@astust.edu.et', role: 'SUPER_ADMIN', permissions: ['ALL_PERMISSIONS'] },
  },
  {
    id: 'LOG-88419',
    timestamp: '2026-09-13 20:52:11',
    portal: 'REGISTRAR',
    category: 'TASK',
    severity: 'INFO',
    action: 'SIS_BATCH_GRADUATE_SYNC',
    actor: 'SIS Integration Worker',
    actorEmail: 'system-worker@astu.edu.et',
    ipAddress: '10.0.4.15',
    details: 'Automated background sync imported 450 new graduate records from ASTU Main Registrar DB.',
    beforeState: { importedCount: 14200, lastSyncStatus: 'IDLE' },
    afterState: { importedCount: 14650, lastSyncStatus: 'SUCCESS', syncedRecords: 450 },
  },
  {
    id: 'LOG-88418',
    timestamp: '2026-09-13 20:30:19',
    portal: 'ALUMNI',
    category: 'AUTH',
    severity: 'INFO',
    action: 'USER_LOGIN_SUCCESS',
    actor: 'Abebe Bikila',
    actorEmail: 'abebe.b@alumni.astu.edu.et',
    ipAddress: '197.156.88.22',
    details: 'Alumni user successfully authenticated via standard MFA password flow.',
  },
  {
    id: 'LOG-88417',
    timestamp: '2026-09-13 20:12:05',
    portal: 'EMPLOYER',
    category: 'MUTATION',
    severity: 'INFO',
    action: 'JOB_POSTING_CREATED',
    actor: 'Ethio Telecom HR',
    actorEmail: 'careers@ethiotelecom.et',
    ipAddress: '213.55.76.10',
    details: 'New job posting published: Senior Fullstack Engineer (Adama Campus preferred)',
    beforeState: { jobCount: 14 },
    afterState: { jobCount: 15, lastPostedJobId: 'job-9941', status: 'ACTIVE' },
  },
  {
    id: 'LOG-88416',
    timestamp: '2026-09-13 19:45:30',
    portal: 'DEPT_HEAD',
    category: 'MUTATION',
    severity: 'INFO',
    action: 'TRACER_SURVEY_DISPATCHED',
    actor: 'Dr. Alemu Tadesse (CSE)',
    actorEmail: 'alemu.t@astu.edu.et',
    ipAddress: '10.0.12.89',
    details: 'Dispatched 2024 Computer Science & Engineering Graduate Exit Tracer Survey to 180 alumni.',
    beforeState: { surveyStatus: 'DRAFT', targetAlumni: 0 },
    afterState: { surveyStatus: 'DISPATCHED', targetAlumni: 180, dispatchedAt: '2026-09-13T19:45:30Z' },
  },
  {
    id: 'LOG-88415',
    timestamp: '2026-09-13 19:10:00',
    portal: 'ICT',
    category: 'SECURITY',
    severity: 'WARN',
    action: 'WAF_IP_BLACKLISTED',
    actor: 'Automated Threat Mitigation',
    actorEmail: 'waf@astu.edu.et',
    ipAddress: '45.133.1.88',
    details: 'IP 45.133.1.88 automatically blocked due to 12 SQL injection signatures detected.',
  },
  {
    id: 'LOG-88414',
    timestamp: '2026-09-13 18:30:00',
    portal: 'SUPER_ADMIN',
    category: 'SYSTEM',
    severity: 'INFO',
    action: 'DATABASE_BACKUP_COMPLETED',
    actor: 'Cron Backup Service',
    actorEmail: 'backup-cron@astu.edu.et',
    ipAddress: '127.0.0.1',
    details: 'Postgres DB full backup completed. Archive size: 1.42 GB encrypted with AES-256.',
  },
];

export default function IctUniversalLogsPage() {
  const [logs] = useState<LogItem[]>(mockLogs);
  const [selectedPortal, setSelectedPortal] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDiffLog, setSelectedDiffLog] = useState<LogItem | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (selectedPortal !== 'ALL' && log.portal !== selectedPortal) return false;
    if (selectedCategory !== 'ALL' && log.category !== selectedCategory) return false;
    if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchActor = log.actor.toLowerCase().includes(q);
      const matchEmail = log.actorEmail.toLowerCase().includes(q);
      const matchIp = log.ipAddress.includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      return matchAction || matchActor || matchEmail || matchIp || matchDetails;
    }
    return true;
  });

  const getPortalBadge = (portal: LogItem['portal']) => {
    const map = {
      ALUMNI: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', label: '🎓 Alumni Portal' },
      EMPLOYER: { bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', label: '🏢 Employer Portal' },
      REGISTRAR: { bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20', label: '🏛️ Registrar Portal' },
      DEPT_HEAD: { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', label: '🎓 Dept Head Portal' },
      SUPER_ADMIN: { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', label: '👑 Super Admin' },
      ICT: { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', label: '⚡ ICT Tech Portal' },
    };
    return map[portal] || { bg: 'bg-slate-100 text-slate-700', label: portal };
  };

  const getSeverityBadge = (severity: LogItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold border-rose-500/30';
      case 'ERROR':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 font-bold border-red-500/20';
      case 'WARN':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-500" />
            Universal System &amp; Cross-Portal Log Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized immutable audit stream capturing logins, background tasks, portal activities, and before/after data state mutation diffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.success('Exporting logs to CSV archive...')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Audit Logs
          </button>
          <button
            type="button"
            onClick={() => toast.success('Logs refreshed from central Elasticsearch pipeline')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Live Refresh
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total System Logs (24h)</span>
          <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">28,410</p>
          <p className="mt-0.5 text-[11px] text-emerald-600 font-semibold">100% Ingestion Integrity</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Logins &amp; Auth Stream</span>
          <p className="mt-1 text-2xl font-extrabold text-blue-600 tracking-tight">4,892</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Across 6 Portals</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Background &amp; Sync Tasks</span>
          <p className="mt-1 text-2xl font-extrabold text-cyan-600 tracking-tight">1,240</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Cron Jobs &amp; SIS Syncs</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Data State Mutation Diffs</span>
          <p className="mt-1 text-2xl font-extrabold text-purple-600 tracking-tight">854</p>
          <p className="mt-0.5 text-[11px] text-purple-500 font-medium">With Before/After Snapshots</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, actor, email, IP address, or details..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Portal Filter */}
            <select
              value={selectedPortal}
              onChange={(e) => setSelectedPortal(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">All Portals (6)</option>
              <option value="ALUMNI">Alumni Portal</option>
              <option value="EMPLOYER">Employer Portal</option>
              <option value="REGISTRAR">Registrar Portal</option>
              <option value="DEPT_HEAD">Department Head Portal</option>
              <option value="SUPER_ADMIN">Super Admin Portal</option>
              <option value="ICT">ICT Technical Portal</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="AUTH">Authentication &amp; Logins</option>
              <option value="TASK">Background Tasks &amp; Jobs</option>
              <option value="MUTATION">Data Mutations &amp; Diffs</option>
              <option value="SECURITY">Security &amp; WAF</option>
              <option value="SYSTEM">System Infrastructure</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Portal</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Action &amp; Actor</th>
                <th className="px-4 py-3.5">IP Address</th>
                <th className="px-4 py-3.5">Details</th>
                <th className="px-4 py-3.5 text-right">Data Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No system logs found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const portalMeta = getPortalBadge(log.portal);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${portalMeta.bg}`}>
                          {portalMeta.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${getSeverityBadge(log.severity)}`}>
                          {log.category} • {log.severity}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{log.action}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {log.actor} ({log.actorEmail})
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {log.ipAddress}
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="truncate text-slate-600 dark:text-slate-300">{log.details}</p>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {log.beforeState || log.afterState ? (
                          <button
                            type="button"
                            onClick={() => setSelectedDiffLog(log)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/60 cursor-pointer border border-blue-200 dark:border-blue-800"
                          >
                            <Code className="w-3.5 h-3.5" />
                            View Diff
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No Diff</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* State Diff Modal */}
      {selectedDiffLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-extrabold text-white">
                  State Mutation Diff — {selectedDiffLog.id} ({selectedDiffLog.action})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDiffLog(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Triggered by <span className="text-white font-bold">{selectedDiffLog.actor}</span> ({selectedDiffLog.actorEmail}) at {selectedDiffLog.timestamp}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* BEFORE */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  BEFORE STATE (Previous)
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto h-48 scrollbar-thin">
                  {selectedDiffLog.beforeState
                    ? JSON.stringify(selectedDiffLog.beforeState, null, 2)
                    : '// No prior state (Entity created)'}
                </pre>
              </div>

              {/* AFTER */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  AFTER STATE (Mutated)
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto h-48 scrollbar-thin">
                  {selectedDiffLog.afterState
                    ? JSON.stringify(selectedDiffLog.afterState, null, 2)
                    : '// No after state (Entity deleted)'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedDiffLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                Close Diff Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
