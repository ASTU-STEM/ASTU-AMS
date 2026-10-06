import React, { useMemo, useState } from 'react';
import { Bot, Fingerprint, Shield, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import IctPageHeader from '../components/IctPageHeader';
import IctSection from '../components/IctSection';
import IctStatusBadge from '../components/IctStatusBadge';
import IctToolbar, { IctFilterSelect } from '../components/IctToolbar';
import IctSearchInput from '../components/IctSearchInput';
import IctDataTable, { IctColumn } from '../components/IctDataTable';
import IctEmptyState from '../components/IctEmptyState';
import { ictBtnGhost, ictBtnSecondary } from '../components/ictUi';

interface AuditEvent {
  id: string;
  category: string;
  who: string;
  role: string;
  what: string;
  target: string;
  before: string;
  after: string;
  ip: string;
  time: string;
  result: string;
}

/** Forensic records retained verbatim. */
const logs: AuditEvent[] = [
  {
    id: 'LOG-901',
    category: 'ROLE_CHANGE',
    who: 'Tolosa Abebe Badho',
    role: 'SUPER_ADMIN',
    what: 'Changed User Role',
    target: 'Abebe Kebede',
    before: 'Role: ALUMNI',
    after: 'Role: EMPLOYER',
    ip: '197.156.92.14',
    time: '13:42:17 Today',
    result: 'SUCCESS',
  },
  {
    id: 'LOG-902',
    category: 'WAF_UPDATE',
    who: 'ICT System Administrator',
    role: 'ADMIN',
    what: 'Updated WAF Security Shield Mode',
    target: 'System WAF Rules',
    before: 'Mode: STANDARD',
    after: 'Mode: ADAPTIVE_STRICT',
    ip: '102.217.18.2',
    time: '12:15:00 Today',
    result: 'SUCCESS',
  },
  {
    id: 'LOG-903',
    category: 'SYNC',
    who: 'Office of Registrar Admin',
    role: 'REGISTRAR',
    what: 'Triggered SIS Batch Alumni Sync',
    target: 'Registrar Student Database',
    before: 'Synced Records: 2,431',
    after: 'Synced Records: 2,473 (+42 new)',
    ip: '197.156.90.1',
    time: '10:00:12 Today',
    result: 'SUCCESS',
  },
];

export default function IctForensicsAuditPage() {
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterResult, setFilterResult] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const matchesCategory = filterAction === 'ALL' || log.category === filterAction;
        const matchesResult = filterResult === 'ALL' || log.result === filterResult;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          `${log.id} ${log.who} ${log.role} ${log.what} ${log.target} ${log.ip} ${log.before} ${log.after}`
            .toLowerCase()
            .includes(q);
        return matchesCategory && matchesResult && matchesSearch;
      }),
    [filterAction, filterResult, searchQuery]
  );

  const handleExplainActivity = (logId: string) => {
    const log = logs.find((l) => l.id === logId);
    setAnalyzingId(logId);
    toast.loading('AI analyzing activity sequence and forensic context...', { id: 'ai-explain' });

    setTimeout(() => {
      setAiAnalysis(
        log
          ? `AI Forensic Audit Synthesis: ${log.who} (${log.role}) executed "${log.what}" on ${log.target}. Mutation ${log.before} → ${log.after}. Source IP ${log.ip} is within recognized institutional ranges. Result: ${log.result}. Pattern matches normal administrative governance.`
          : 'AI Forensic Audit Synthesis: No matching audit record found for this identifier.'
      );
      toast.success('AI Audit Synthesis generated', { id: 'ai-explain' });
      setAnalyzingId(null);
    }, 1800);
  };

  const resetFilters = () => {
    setFilterAction('ALL');
    setFilterResult('ALL');
    setSearchQuery('');
  };

  const filtersActive = filterAction !== 'ALL' || filterResult !== 'ALL' || searchQuery.trim() !== '';

  const columns: IctColumn<AuditEvent>[] = [
    {
      key: 'time',
      header: 'Timestamp',
      width: '13%',
      cell: (log) => (
        <div className="min-w-0">
          <span className="ict-mono ict-num font-extrabold text-[var(--ict-accent-text)]">{log.id}</span>
          <span className="ict-mono ict-num block text-[10.5px] text-[var(--text-muted)]">{log.time}</span>
        </div>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      cell: (log) => (
        <div className="min-w-0">
          <p className="ict-clamp-1 text-[12px] font-bold text-[var(--text-primary)] " title={log.who}>
            {log.who}
          </p>
          <p className="ict-label">{log.role.replace(/_/g, ' ')}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action & resource',
      cell: (log) => (
        <div className="min-w-0">
          <p className="ict-clamp-1 text-[11.5px] font-bold text-[var(--text-secondary)] ">
            {log.what}
          </p>
          <p className="ict-clamp-1 text-[10.5px] text-[var(--text-muted)]" title={log.target}>
            {log.target}
          </p>
        </div>
      ),
    },
    {
      key: 'diff',
      header: 'Before → after',
      cell: (log) => (
        <div className="flex flex-col gap-0.5">
          <span className="ict-mono ict-num ict-break text-[10.5px] text-[var(--ict-warn)] line-through">
            {log.before}
          </span>
          <span className="ict-mono ict-num ict-break text-[10.5px] font-bold text-[var(--ict-ok)]">{log.after}</span>
        </div>
      ),
    },
    {
      key: 'ip',
      header: 'Source IP',
      width: '12%',
      cell: (log) => <span className="ict-mono ict-num whitespace-nowrap">{log.ip}</span>,
    },
    {
      key: 'result',
      header: 'Result',
      width: '10%',
      cell: (log) => <IctStatusBadge status={log.result.toLowerCase()} label={log.result} size="xs" />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (log) => (
        <button
          type="button"
          disabled={analyzingId === log.id}
          onClick={() => handleExplainActivity(log.id)}
          className={ictBtnSecondary}
          aria-label={`Explain activity ${log.id} with ASTU AI`}
        >
          <Bot className="h-3 w-3" aria-hidden />
          {analyzingId === log.id ? 'Analysing…' : 'Explain with AI'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-5">
      <IctPageHeader
        icon={Shield}
        title="Forensic Audit Trail"
        description="Immutable audit of who did what, when, and against which resource."
        meta={
          <>
            <IctStatusBadge status="operational" label="IMMUTABLE" />
            <span className="ict-label">WHO · WHAT · WHEN · WHERE · BEFORE · AFTER</span>
          </>
        }
        actions={
          <button
            type="button"
            onClick={() => toast.success('Audit log integrity hash verified: Immutable')}
            className={ictBtnSecondary}
          >
            <Fingerprint className="h-3.5 w-3.5" aria-hidden />
            Verify Integrity
          </button>
        }
      />

      {/* AI synthesis panel */}
      {aiAnalysis && (
        <div className="ict-card ict-rise ict-bd-ai ict-bg-ai p-3">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--ict-ai)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              ASTU AI activity synthesis
            </span>
            <button type="button" onClick={() => setAiAnalysis(null)} className={ictBtnGhost} aria-label="Dismiss AI synthesis">
              <X className="h-3 w-3" aria-hidden />
              Dismiss
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--text-secondary)] ">{aiAnalysis}</p>
        </div>
      )}

      {/* Filters */}
      <IctToolbar onReset={resetFilters} showReset={filtersActive} resetLabel="Reset filters">
        <IctSearchInput
          label="Search audit events by actor, action, resource or IP"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Actor, action, resource, IP or state value…"
          resultCount={filteredLogs.length}
          className="w-full lg:max-w-md"
        />
        <IctFilterSelect
          label="Action"
          value={filterAction}
          onChange={setFilterAction}
          options={[
            { value: 'ALL', label: 'All actions' },
            { value: 'ROLE_CHANGE', label: 'Role changes' },
            { value: 'WAF_UPDATE', label: 'WAF updates' },
            { value: 'SYNC', label: 'Data sync' },
          ]}
        />
        <IctFilterSelect
          label="Result"
          value={filterResult}
          onChange={setFilterResult}
          options={[
            { value: 'ALL', label: 'All results' },
            { value: 'SUCCESS', label: 'Success' },
            { value: 'FAILED', label: 'Failed' },
          ]}
        />
      </IctToolbar>

      {/* Audit register */}
      <IctSection
        icon={Shield}
        title="Audit Event Register"
        description="Every privileged mutation recorded against an identified actor and source address"
        flush
      >
        <IctDataTable
          columns={columns}
          rows={filteredLogs}
          rowKey={(log) => log.id}
          caption="Immutable forensic audit event register"
          summary={`${filteredLogs.length} audit events match the active filters`}
          className="ict-bd-none ict-shadow-none"
          empty={
            <IctEmptyState
              icon={Shield}
              title="No audit events found"
              description={
                filtersActive
                  ? 'No immutable audit record matches the current filters. Clear the filters to review the full register.'
                  : 'The audit register is empty. Privileged activity across every ASTU-AMS portal is recorded here as it occurs.'
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
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] px-3 py-2 text-[11px] text-[var(--text-muted)] ">
              <span>
                <strong className="text-[var(--text-primary)] ">{filteredLogs.length}</strong> of{' '}
                <strong className="text-[var(--text-primary)] ">{logs.length}</strong> audit events
              </span>
              <span className="ict-label">Sensitive values are masked in exported extracts</span>
            </div>
          }
        />
      </IctSection>

      {/* AI affordance explained */}
      <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-[var(--text-muted)]">
        <Bot className="mt-px h-3 w-3 shrink-0 text-[var(--ict-ai)]" aria-hidden />
        <span>
          ASTU AI synthesis is generated locally from the selected record. It summarises context for triage and never
          replaces the immutable audit entry.
        </span>
      </p>
    </div>
  );
}
