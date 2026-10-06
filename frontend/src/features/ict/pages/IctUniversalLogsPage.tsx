import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Download,
  FileJson,
  RefreshCw,
  ScrollText,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import IctPageHeader from '../components/IctPageHeader';
import IctMetricCard from '../components/IctMetricCard';
import IctSection from '../components/IctSection';
import IctStatusBadge from '../components/IctStatusBadge';
import IctToolbar, { IctFilterSelect } from '../components/IctToolbar';
import IctSearchInput from '../components/IctSearchInput';
import IctDataTable, { IctColumn } from '../components/IctDataTable';
import IctEmptyState from '../components/IctEmptyState';
import IctDiffView from '../components/IctDiffView';
import IctModal from '../components/IctModal';
import { ictBtnPrimary, ictBtnSecondary, ictBtnXs, ictTableFooter } from '../components/ictUi';

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

/** Existing log stream retained verbatim. */
const mockLogs: LogItem[] = [
  {
    id: 'LOG-88421',
    timestamp: '2026-09-13 21:14:02',
    portal: 'ICT',
    category: 'SECURITY',
    severity: 'CRITICAL',
    action: 'BREAK_GLASS_ELEVATION',
    actor: 'System Admin',
    actorEmail: 'admin@astu.edu.et',
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
    actorEmail: 'admin@astu.edu.et',
    ipAddress: '197.156.90.12',
    details: 'User account role changed from ADMIN to SUPER_ADMIN',
    beforeState: { id: 'usr-9012', email: 'admin@astu.edu.et', role: 'ADMIN', permissions: ['manage_users'] },
    afterState: { id: 'usr-9012', email: 'admin@astu.edu.et', role: 'SUPER_ADMIN', permissions: ['ALL_PERMISSIONS'] },
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

const PORTAL_LABELS: Record<LogItem['portal'], string> = {
  ALUMNI: 'Alumni',
  EMPLOYER: 'Employer',
  REGISTRAR: 'Registrar',
  DEPT_HEAD: 'Dept Head',
  SUPER_ADMIN: 'Super Admin',
  ICT: 'ICT',
};

function severityStatus(severity: LogItem['severity']): string {
  switch (severity) {
    case 'CRITICAL':
      return 'critical';
    case 'ERROR':
      return 'error';
    case 'WARN':
      return 'warning';
    default:
      return 'info';
  }
}

const LOGS_PER_PAGE = 10;

export default function IctUniversalLogsPage() {
  const [logs] = useState<LogItem[]>(mockLogs);
  const [selectedPortal, setSelectedPortal] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDiffLog, setSelectedDiffLog] = useState<LogItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        if (selectedPortal !== 'ALL' && log.portal !== selectedPortal) return false;
        if (selectedCategory !== 'ALL' && log.category !== selectedCategory) return false;
        if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            log.action.toLowerCase().includes(q) ||
            log.actor.toLowerCase().includes(q) ||
            log.actorEmail.toLowerCase().includes(q) ||
            log.ipAddress.includes(q) ||
            log.details.toLowerCase().includes(q) ||
            log.id.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [logs, selectedPortal, selectedCategory, selectedSeverity, searchQuery]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPortal, selectedCategory, selectedSeverity, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / LOGS_PER_PAGE));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * LOGS_PER_PAGE;
    return filteredLogs.slice(start, start + LOGS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const resetFilters = () => {
    setSelectedPortal('ALL');
    setSelectedCategory('ALL');
    setSelectedSeverity('ALL');
    setSearchQuery('');
  };

  const filtersActive =
    selectedPortal !== 'ALL' || selectedCategory !== 'ALL' || selectedSeverity !== 'ALL' || searchQuery.trim() !== '';

  const startItem = filteredLogs.length === 0 ? 0 : (currentPage - 1) * LOGS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * LOGS_PER_PAGE, filteredLogs.length);

  const columns: IctColumn<LogItem>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      width: '13%',
      cell: (log) => (
        <span className="ict-mono ict-num flex items-center gap-1.5 whitespace-nowrap text-[var(--text-muted)]">
          <Clock className="h-3 w-3 shrink-0" aria-hidden />
          {log.timestamp}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      width: '10%',
      cell: (log) => (
        <IctStatusBadge status="neutral" label={PORTAL_LABELS[log.portal]} showDot={false} className="ict-mono" />
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      width: '10%',
      cell: (log) => (
        <div className="flex flex-wrap items-center gap-1">
          <IctStatusBadge status={severityStatus(log.severity)} label={log.severity} />
          <span className="ict-label">{log.category}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action & actor',
      cell: (log) => (
        <div className="min-w-0">
          <p className="ict-mono ict-num text-[11px] font-extrabold text-[var(--text-primary)] ">
            {log.action}
          </p>
          <p className="ict-clamp-1 text-[10.5px] text-[var(--text-muted)]" title={`${log.actor} (${log.actorEmail})`}>
            {log.actor} · {log.actorEmail}
          </p>
        </div>
      ),
    },
    {
      key: 'ip',
      header: 'Source IP',
      width: '11%',
      cell: (log) => <span className="ict-mono ict-num whitespace-nowrap">{log.ipAddress}</span>,
    },
    {
      key: 'details',
      header: 'Details',
      cell: (log) => (
        <p className="ict-clamp-2 max-w-sm text-[11px]" title={log.details}>
          {log.details}
        </p>
      ),
    },
    {
      key: 'diff',
      header: <span className="sr-only">State diff</span>,
      align: 'right',
      width: '1%',
      cell: (log) =>
        log.beforeState || log.afterState ? (
          <button type="button" onClick={() => setSelectedDiffLog(log)} className={ictBtnXs}>
            <Code2 className="h-3 w-3" aria-hidden />
            Diff
          </button>
        ) : (
          <span className="text-[10.5px] italic text-[var(--text-muted)]">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-5">
      <IctPageHeader
        icon={ScrollText}
        title="Universal Logs & Diffs"
        description="Cross-portal log stream with mutations and before/after state diffs."
        meta={
          <>
            <IctStatusBadge status="operational" label="STREAMING" />
            <span className="ict-label">6 portals · 5 categories</span>
          </>
        }
        actions={
          <>
            <button type="button" onClick={() => toast.success('Exporting logs to CSV archive...')} className={ictBtnSecondary}>
              <Download className="h-3.5 w-3.5" aria-hidden />
              Export Audit Logs
            </button>
            <button
              type="button"
              onClick={() => toast.success('Logs refreshed from central Elasticsearch pipeline')}
              className={ictBtnPrimary}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              Live Refresh
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <IctMetricCard label="Total system logs (24h)" value="28,410" hint="100% ingestion integrity" icon={ScrollText} />
        <IctMetricCard label="Logins & auth stream" value="4,892" hint="Across 6 portals" tone="info" />
        <IctMetricCard label="Background & sync tasks" value="1,240" hint="Cron jobs & SIS syncs" tone="info" />
        <IctMetricCard label="State mutation diffs" value="854" hint="With before/after snapshots" icon={Code2} />
      </div>

      {/* Filter bar */}
      <IctSection
        icon={Search}
        title="Search & Filters"
        description="Narrow the immutable log stream by portal, category, severity or free text"
      >
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <IctSearchInput
            label="Search logs by action, actor, email, IP or details"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Action, actor, email, IP address, request ID or details…"
            resultCount={filteredLogs.length}
            className="w-full lg:max-w-md"
          />

          <div className="flex flex-wrap items-center gap-2">
            <IctFilterSelect
              label="Portal"
              value={selectedPortal}
              onChange={setSelectedPortal}
              options={[
                { value: 'ALL', label: 'All portals (6)' },
                { value: 'ALUMNI', label: 'Alumni Portal' },
                { value: 'EMPLOYER', label: 'Employer Portal' },
                { value: 'REGISTRAR', label: 'Registrar Portal' },
                { value: 'DEPT_HEAD', label: 'Dept Head Portal' },
                { value: 'SUPER_ADMIN', label: 'Super Admin Portal' },
                { value: 'ICT', label: 'ICT Technical Portal' },
              ]}
            />
            <IctFilterSelect
              label="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { value: 'ALL', label: 'All categories' },
                { value: 'AUTH', label: 'Authentication & logins' },
                { value: 'TASK', label: 'Background tasks & jobs' },
                { value: 'MUTATION', label: 'Data mutations & diffs' },
                { value: 'SECURITY', label: 'Security & WAF' },
                { value: 'SYSTEM', label: 'System infrastructure' },
              ]}
            />
            <IctFilterSelect
              label="Severity"
              value={selectedSeverity}
              onChange={setSelectedSeverity}
              options={[
                { value: 'ALL', label: 'All severities' },
                { value: 'INFO', label: 'INFO' },
                { value: 'WARN', label: 'WARN' },
                { value: 'ERROR', label: 'ERROR' },
                { value: 'CRITICAL', label: 'CRITICAL' },
              ]}
            />
            {filtersActive && (
              <button type="button" onClick={resetFilters} className={ictBtnXs}>
                Reset filters
              </button>
            )}
          </div>
        </div>

        {filtersActive && (
          <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-[var(--text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ict-info)]" aria-hidden />
            Filtered view · {filteredLogs.length} matching log entries
          </p>
        )}
      </IctSection>

      {/* Log stream */}
      <IctDataTable
        columns={columns}
        rows={paginatedLogs}
        rowKey={(log) => log.id}
        caption="Cross-portal immutable log stream"
        summary={`Page ${currentPage} of ${totalPages}. ${filteredLogs.length} log entries match the active filters.`}
        maxHeight="34rem"
        empty={
          <IctEmptyState
            icon={filtersActive ? Search : ScrollText}
            title={filtersActive ? 'No audit events found' : 'No audit events recorded'}
            description={
              filtersActive
                ? 'No log entries match the current filters. Widen the portal, category or severity selection, or clear the search term.'
                : 'The immutable log stream is empty. Events appear here as soon as portals, workers and background jobs emit them.'
            }
            action={
              filtersActive ? (
                <button type="button" onClick={resetFilters} className={ictBtnSecondary}>
                  Reset filters
                </button>
              ) : undefined
            }
          />
        }
        footer={
          <div className={ictTableFooter}>
            <span>
              Showing <strong className="text-[var(--text-primary)] ">{startItem}</strong>–
              <strong className="text-[var(--text-primary)] ">{endItem}</strong> of{' '}
              <strong className="text-[var(--text-primary)] ">{filteredLogs.length}</strong> log entries
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={ictBtnXs}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3 w-3" aria-hidden />
                Prev
              </button>
              <span className="ict-mono px-1">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={ictBtnXs}
                aria-label="Next page"
              >
                Next
                <ChevronRight className="h-3 w-3" aria-hidden />
              </button>
            </div>
          </div>
        }
      />

      {/* ── Diff inspector ──────────────────────────────────────── */}
      <IctModal
        isOpen={Boolean(selectedDiffLog)}
        onClose={() => setSelectedDiffLog(null)}
        width="xl"
        icon={<FileJson className="h-3.5 w-3.5" aria-hidden />}
        title={
          selectedDiffLog ? (
            <span className="flex flex-wrap items-center gap-2">
              <span className="ict-mono text-[var(--ict-accent-text)]">{selectedDiffLog.id}</span>
              <span className="ict-mono text-[var(--text-muted)]">{selectedDiffLog.action}</span>
            </span>
          ) : null
        }
        description={
          selectedDiffLog && (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-muted)]">
              <span>
                Actor <strong className="text-[var(--text-primary)] ">{selectedDiffLog.actor}</strong>{' '}
                ({selectedDiffLog.actorEmail})
              </span>
              <span className="ict-mono">{selectedDiffLog.timestamp}</span>
              <span className="ict-mono">IP {selectedDiffLog.ipAddress}</span>
            </span>
          )
        }
        footer={
          <button type="button" onClick={() => setSelectedDiffLog(null)} className={ictBtnSecondary}>
            Close inspector
          </button>
        }
      >
        {selectedDiffLog && (
          <div className="space-y-3.5">
            <p className="text-[11px] leading-relaxed text-[var(--text-secondary)] ">
              {selectedDiffLog.details}
            </p>
            <IctDiffView before={selectedDiffLog.beforeState} after={selectedDiffLog.afterState} />
          </div>
        )}
      </IctModal>
    </div>
  );
}
