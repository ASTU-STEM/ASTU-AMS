import React, { useMemo, useState, useEffect } from 'react';
import { Terminal, Search, Clock, RefreshCw, Download, ChevronLeft, ChevronRight, Code } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../../services/api';
import { LogItem, LogDiffModal } from '../components/LogDiffModal';

const DEFAULT_LOGS: LogItem[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-11-04 11:45:20',
    portal: 'REGISTRAR',
    category: 'AUTH',
    severity: 'INFO',
    action: 'STUDENT_RECORDS_IMPORT',
    actor: 'Sara Worku (Registrar Admin)',
    actorEmail: 'sara.registrar@astu.edu.et',
    ipAddress: '192.168.1.104',
    details: 'Batch CSV imported with 142 student graduation records validated.',
    beforeState: { pendingRecords: 0 },
    afterState: { pendingRecords: 142, importBatchId: 'BATCH-2024-001' }
  },
  {
    id: 'LOG-002',
    timestamp: '2026-11-04 11:30:12',
    portal: 'SUPER_ADMIN',
    category: 'SECURITY',
    severity: 'CRITICAL',
    action: 'FAILED_2FA_ATTEMPT',
    actor: 'SEC-ACTOR-991',
    actorEmail: 'unknown.intruder@external.net',
    ipAddress: '197.156.102.44',
    details: 'Consecutive failed MFA challenge tokens exceeding brute-force security threshold.',
  },
  {
    id: 'LOG-003',
    timestamp: '2026-11-04 11:15:00',
    portal: 'EMPLOYER',
    category: 'MUTATION',
    severity: 'WARN',
    action: 'VACANCY_STATUS_CHANGE',
    actor: 'Bethlehem Tadesse (CBE Talent)',
    actorEmail: 'hr@cbe.com.et',
    ipAddress: '10.240.12.18',
    details: 'Vacancy "Junior Backend Software Engineer" state updated from Open to Closed.',
    beforeState: { status: 'Open', applicants: 34 },
    afterState: { status: 'Closed', applicants: 34 }
  },
  {
    id: 'LOG-004',
    timestamp: '2026-11-04 10:50:33',
    portal: 'ALUMNI',
    category: 'TASK',
    severity: 'INFO',
    action: 'DOCUMENT_REQUEST_SUBMITTED',
    actor: 'Abebe Bikila (Alumnus)',
    actorEmail: 'abebe.bikila@alumni.astu.edu.et',
    ipAddress: '196.188.24.110',
    details: 'Official transcript generation request filed with Registrar Hub.',
  },
  {
    id: 'LOG-005',
    timestamp: '2026-11-04 10:12:45',
    portal: 'ICT',
    category: 'SYSTEM',
    severity: 'INFO',
    action: 'DATABASE_SNAPSHOT_COMPLETED',
    actor: 'System Daemon (BackupService)',
    actorEmail: 'backup-cron@astu.edu.et',
    ipAddress: '127.0.0.1',
    details: 'Automated 6-hour differential DB snapshot committed to secure storage volume.',
  }
];

export default function IctUniversalLogsPage() {
  const [logs, setLogs] = useState<LogItem[]>(DEFAULT_LOGS);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDiffLog, setSelectedDiffLog] = useState<LogItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const LOGS_PER_PAGE = 8;

  useEffect(() => {
    apiClient.get('/admin/logs')
      .then(res => {
        const d = res.data;
        if (d.success && Array.isArray(d.data?.logs) && d.data.logs.length > 0) {
          setLogs(d.data.logs.map((l: any, idx: number) => ({
            id: String(l.id || `LOG-${idx + 1}`),
            timestamp: String(l.timestamp || l.createdAt || new Date().toISOString()),
            portal: String(l.portal || 'SYSTEM').toUpperCase(),
            category: String(l.category || 'SYSTEM').toUpperCase(),
            severity: String(l.severity || 'INFO').toUpperCase() as LogItem['severity'],
            action: String(l.action || 'SYSTEM_EVENT'),
            actor: String(l.userName || l.actor || 'System'),
            actorEmail: String(l.userEmail || l.actorEmail || 'system@astu.edu.et'),
            ipAddress: String(l.ipAddress || '127.0.0.1'),
            details: String(l.details || l.description || ''),
            beforeState: l.beforeState,
            afterState: l.afterState,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.actor.toLowerCase().includes(q) ||
          log.actorEmail.toLowerCase().includes(q) ||
          log.ipAddress.includes(q) ||
          log.timestamp.includes(q) ||
          log.details.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, selectedSeverity, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / LOGS_PER_PAGE));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE);

  const getSeverityBadge = (s: LogItem['severity']) => {
    switch (s) {
      case 'CRITICAL': return 'bg-rose-900/30 text-rose-400 border-rose-600/40 font-bold';
      case 'ERROR': return 'bg-red-900/30 text-red-400 border-red-600/40';
      case 'WARN': return 'bg-amber-900/30 text-amber-400 border-amber-600/40';
      default: return 'bg-emerald-900/30 text-emerald-400 border-emerald-600/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#2196F3]" /> ICT Universal System & Security Logs
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Real-time immutable telemetry stream across all 6 campus portals</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => toast.success('Audit log archive downloaded.')} 
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Logs
          </button>
          <button 
            onClick={() => toast.success('Live log stream refreshed.')} 
            className="px-3 py-1.5 rounded-lg bg-[#2196F3] hover:bg-[#1976D2] text-xs font-bold text-white flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Live Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by action, actor ID, IP address, timestamp, or details..."
            className="w-full pl-9 pr-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#2196F3]"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {(['ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => { setSelectedSeverity(sev); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSeverity === sev
                  ? 'bg-[#2196F3] text-white shadow'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Log Stream Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] border-b border-[var(--border-color)] uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor ID / Name</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Data Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]/60 text-[var(--text-primary)]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-secondary)]">
                    No system log records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[var(--bg-hover)]/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#22D3EE]" /> {log.timestamp}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${getSeverityBadge(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-xs text-[#22D3EE]">{log.action}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[var(--text-primary)]">{log.actor}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{log.actorEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{log.ipAddress}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] max-w-xs truncate">{log.details}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {(log.beforeState || log.afterState) ? (
                        <button
                          onClick={() => setSelectedDiffLog(log)}
                          className="px-2.5 py-1 rounded bg-[var(--bg-input)] hover:bg-[#2196F3] text-[#22D3EE] hover:text-white border border-[var(--border-color)] text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <Code className="w-3 h-3" /> Diff
                        </button>
                      ) : (
                        <span className="text-[var(--text-secondary)]/60 text-[11px] italic">No Diff</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-page)]/40 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Page <strong className="text-[var(--text-primary)]">{currentPage}</strong> of <strong className="text-[var(--text-primary)]">{totalPages}</strong></span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <LogDiffModal log={selectedDiffLog} onClose={() => setSelectedDiffLog(null)} />
    </div>
  );
}
