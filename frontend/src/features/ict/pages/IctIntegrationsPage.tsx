import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Database,
  Globe,
  Layers,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import IctPageHeader from '../components/IctPageHeader';
import IctMetricCard from '../components/IctMetricCard';
import IctSection from '../components/IctSection';
import IctStatusBadge from '../components/IctStatusBadge';
import IctTabs, { IctTabItem } from '../components/IctTabs';
import IctEmptyState from '../components/IctEmptyState';
import IctIntegrationCard from '../components/IctIntegrationCard';
import IctActionMenu from '../components/IctActionMenu';
import IctKeyValueGrid from '../components/IctKeyValue';
import { IctMeter, IctStatusBar } from '../components/IctHealthIndicator';
import { ictBtnPrimary, ictBtnSecondary, ictBtnSuccess, ictTh, ictTd, ictTrHover } from '../components/ictUi';

type TabKey = 'integrations' | 'registrar-sync' | 'data-quality';

/** Connector records already carried by this module — unchanged. */
const integrations = [
  {
    name: 'ASTU Registrar SIS API',
    category: 'Registrar',
    status: 'HEALTHY' as const,
    endpoint: 'https://sis.astu.edu.et/api/v1/alumni',
    latency: '145ms',
    failuresToday: 0,
  },
  {
    name: 'Nodemailer SMTP Email Provider',
    category: 'Email',
    status: 'HEALTHY' as const,
    endpoint: 'smtp.astu.edu.et:587',
    latency: '45ms',
    failuresToday: 2,
  },
  {
    name: 'Ethio Telecom SMS Gateway',
    category: 'SMS',
    status: 'DOWN' as const,
    endpoint: 'https://sms-gw.ethionet.et/api/send',
    latency: 'Timeout',
    failuresToday: 24,
  },
  {
    name: 'ASTU AI Multi-Agent Engine',
    category: 'AI',
    status: 'HEALTHY' as const,
    endpoint: 'https://api.deepmind.com/v1/agents',
    latency: '120ms',
    failuresToday: 0,
  },
  {
    name: 'Chapa Payment Gateway',
    category: 'Payments',
    status: 'HEALTHY' as const,
    endpoint: 'https://api.chapa.co/v1/transaction/verify',
    latency: '95ms',
    failuresToday: 0,
  },
];

const dataQualityItems = [
  { type: 'Duplicate Alumni', count: 12, fixAction: 'Merge Duplicate Profiles', severity: 'WARNING' as const, field: 'fullName + email' },
  { type: 'Missing Phone Number', count: 43, fixAction: 'Send Profile Update Prompt', severity: 'WARNING' as const, field: 'phone' },
  { type: 'Invalid Email Address', count: 7, fixAction: 'Mark for Verification', severity: 'ERROR' as const, field: 'email' },
  { type: 'Missing Department ID', count: 2, fixAction: 'Assign via Registrar Code', severity: 'CRITICAL' as const, field: 'departmentId' },
];

const SYNC_TOTALS = {
  processed: 2431,
  newAlumni: 42,
  updated: 183,
  rejected: 7,
  failed: 3,
  lastSuccessful: 'Today 14:30',
};

export default function IctIntegrationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('integrations');
  const [expanded, setExpanded] = useState<string | null>(null);

  const tabs: IctTabItem<TabKey>[] = [
    { key: 'integrations', label: 'Integrations', count: integrations.length },
    { key: 'registrar-sync', label: 'Registrar Sync' },
    { key: 'data-quality', label: 'Data Quality', count: dataQualityItems.length, dot: 'warning' },
  ];

  const healthyCount = integrations.filter((i) => i.status === 'HEALTHY').length;
  const downCount = integrations.filter((i) => i.status === 'DOWN').length;
  const degradedCount = 0;

  const totalFailures = useMemo(
    () => integrations.reduce((sum, i) => sum + i.failuresToday, 0),
    []
  );

  const totalSyncRecords = SYNC_TOTALS.newAlumni + SYNC_TOTALS.updated;
  const syncRejectionRate = ((SYNC_TOTALS.rejected + SYNC_TOTALS.failed) / SYNC_TOTALS.processed) * 100;

  return (
    <div className="space-y-4 lg:space-y-5">
      <IctPageHeader
        icon={Globe}
        title="Integrations & Data Sync"
        description="Manage external connectors, Registrar SIS synchronization, and institutional data quality."
        actions={
          <button
            type="button"
            className={ictBtnPrimary}
            onClick={() => toast.success('Pinged all integration endpoints')}
          >
            <CircleDot className="h-3.5 w-3.5" aria-hidden />
            Ping Endpoints
          </button>
        }
      />

      <IctTabs<TabKey>
        items={tabs}
        value={activeTab}
        onChange={setActiveTab}
        ariaLabel="Integration views"
      />

      {/* ── Summary row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        <IctMetricCard
          label="Total Integrations"
          value={integrations.length}
          icon={Layers}
          tone="info"
          hint="External connectors"
        />
        <IctMetricCard
          label="Healthy"
          value={healthyCount}
          icon={CheckCircle2}
          tone="success"
          status={<IctStatusBadge status="healthy" size="xs" />}
        />
        <IctMetricCard
          label="Degraded"
          value={degradedCount}
          icon={AlertTriangle}
          tone="warning"
          hint={degradedCount === 0 ? 'None reported' : undefined}
        />
        <IctMetricCard
          label="Down"
          value={downCount}
          icon={XCircle}
          tone="danger"
          hint={downCount > 0 ? `${totalFailures} failed calls` : 'None reported'}
        />
        <IctMetricCard
          label="Last Sync"
          value="14:30"
          icon={RefreshCw}
          tone="default"
          hint="Today · Registrar SIS"
          aside={<span className="ict-label">G.C.</span>}
        />
      </div>

      {/* ════════════════════════════════════════════════════════
          TAB 1 — EXTERNAL INTEGRATIONS
          ════════════════════════════════════════════════════════ */}
      {activeTab === 'integrations' && (
        <IctSection
          icon={Layers}
          title="External Integrations"
          description="Connector health, latency and failure counts for every outbound dependency"
        >
          {/* Health distribution strip — reads before the list does */}
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <IctStatusBadge status="healthy" label={`${healthyCount} HEALTHY`} />
              <IctStatusBadge status="degraded" label={`${degradedCount} DEGRADED`} />
              <IctStatusBadge status="down" label={`${downCount} DOWN`} />
            </div>
            <p className="ict-label">
              {totalFailures > 0
                ? `${totalFailures} failed calls today across all connectors`
                : 'No failed calls recorded today'}
            </p>
          </div>

          {integrations.length === 0 ? (
            <IctEmptyState
              icon={Layers}
              title="No integrations configured"
              description="External connectors for the Registrar SIS, email, SMS, payments and AI services will appear here once they are provisioned."
            />
          ) : (
            <div className="space-y-2">
              {integrations.map((item) => {
                const isDown = item.status === 'DOWN';
                return (
                  <div key={item.name} className="space-y-2">
                    <IctIntegrationCard
                      integration={item}
                      actions={
                        <>
                          <button
                            type="button"
                            className={ictBtnSecondary}
                            onClick={() =>
                              toast.success(
                                isDown
                                  ? `Retry queued for ${item.name}`
                                  : `Ping completed · ${item.name}`
                              )
                            }
                          >
                            <CircleDot className="h-3.5 w-3.5" aria-hidden />
                            {isDown ? 'Retry' : 'Ping'}
                          </button>
                          <button
                            type="button"
                            className={ictBtnSecondary}
                            aria-expanded={expanded === item.name}
                            onClick={() => setExpanded((prev) => (prev === item.name ? null : item.name))}
                          >
                            Details
                          </button>
                          <IctActionMenu
                            label={`Actions for ${item.name}`}
                            items={[
                              {
                                label: 'View connector details',
                                onSelect: () => setExpanded(item.name),
                              },
                              {
                                label: isDown ? 'Retry failed calls' : 'Ping this connector',
                                onSelect: () =>
                                  toast.success(
                                    isDown
                                      ? `Retry queued for ${item.name}`
                                      : `Ping completed · ${item.name}`
                                  ),
                              },
                              { divider: true },
                              {
                                label: 'Disable connector',
                                danger: true,
                                disabled: true,
                                disabledReason: 'No disable action is implemented for this connector',
                                onSelect: () => {},
                              },
                            ]}
                          />
                        </>
                      }
                    />

                    {expanded === item.name && (
                      <IctKeyValueGrid
                        columns={5}
                        className="ict-drop"
                        items={[
                          { label: 'Connector', value: item.name },
                          { label: 'Category', value: item.category },
                          { label: 'Endpoint', value: item.endpoint, mono: true },
                          { label: 'Latency', value: item.latency, mono: true },
                          { label: 'Failed calls today', value: String(item.failuresToday), mono: true },
                        ]}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </IctSection>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB 2 — REGISTRAR SYNC
          ════════════════════════════════════════════════════════ */}
      {activeTab === 'registrar-sync' && (
        <div className="space-y-4">
          <IctSection
            icon={Database}
            title="Registrar SIS Synchronization"
            description="Status of the graduate batch pipeline and record processing summary"
            actions={
              <button
                type="button"
                className={ictBtnPrimary}
                onClick={() => toast.success('Registrar SIS synchronization started')}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                Trigger Sync
              </button>
            }
          >
            {/* Current state, stated plainly first */}
            <div className="mb-4 flex flex-col gap-3 rounded-[6px] border border-[var(--ict-ok-line)] bg-[var(--ict-ok-bg)] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ict-ok)]" aria-hidden />
                <div>
                  <p className="text-xs font-extrabold text-[var(--ict-ok)]">Synchronization complete</p>
                  <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] ">
                    Last successful run <strong>{SYNC_TOTALS.lastSuccessful}</strong> · no sync currently in progress
                  </p>
                </div>
              </div>
              <IctStatusBadge status="synced" />
            </div>

            <IctKeyValueGrid
              columns={6}
              items={[
                { label: 'Records processed', value: SYNC_TOTALS.processed.toLocaleString(), mono: true },
                { label: 'New alumni', value: SYNC_TOTALS.newAlumni.toLocaleString(), mono: true },
                { label: 'Updated', value: SYNC_TOTALS.updated.toLocaleString(), mono: true },
                { label: 'Rejected', value: SYNC_TOTALS.rejected.toLocaleString(), mono: true },
                { label: 'Failed', value: SYNC_TOTALS.failed.toLocaleString(), mono: true },
                { label: 'Rejection rate', value: `${syncRejectionRate.toFixed(1)}%`, mono: true },
              ]}
            />

            {/* Outcome split */}
            <div className="mt-4 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="ict-label">Record outcome split</p>
                <p className="ict-mono text-[10px] text-[var(--text-muted)]">
                  {totalSyncRecords.toLocaleString()} records written
                </p>
              </div>
              <IctStatusBar
                ariaLabel={`Sync outcome: ${SYNC_TOTALS.newAlumni} new, ${SYNC_TOTALS.updated} updated, ${SYNC_TOTALS.rejected} rejected, ${SYNC_TOTALS.failed} failed`}
                segments={[
                  { value: SYNC_TOTALS.newAlumni, tone: 'success', label: 'New' },
                  { value: SYNC_TOTALS.updated, tone: 'neutral', label: 'Updated' },
                  { value: SYNC_TOTALS.rejected, tone: 'warning', label: 'Rejected' },
                  { value: SYNC_TOTALS.failed, tone: 'danger', label: 'Failed' },
                ]}
              />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--ict-ok)]" aria-hidden />New {SYNC_TOTALS.newAlumni}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--ict-mute)]" aria-hidden />Updated {SYNC_TOTALS.updated}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--ict-warn)]" aria-hidden />Rejected {SYNC_TOTALS.rejected}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--ict-crit)]" aria-hidden />Failed {SYNC_TOTALS.failed}
                </span>
              </div>
            </div>
          </IctSection>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB 3 — DATA QUALITY
          ════════════════════════════════════════════════════════ */}
      {activeTab === 'data-quality' && (
        <div className="space-y-4">
          {/* Validation score */}
          <IctSection
            icon={ShieldCheck}
            title="Institutional Data Quality"
            description="Record validation state across the alumni master dataset"
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <IctStatusBadge status="pass" label="PASS" />
                <button
                  type="button"
                  className={ictBtnSuccess}
                  onClick={() => toast.success('Auto-fixing data quality issues…')}
                >
                  Run Auto-Fix
                </button>
              </div>
            }
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="shrink-0">
                <p className="ict-label">Data quality score</p>
                <p className="ict-num text-[34px] font-extrabold leading-none tracking-[-0.03em] text-[var(--ict-ok)]">
                  94.7<span className="text-base">%</span>
                </p>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <IctMeter value={94.7} tone="success" label="Data quality score: 94.7 percent" />
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[var(--text-muted)]">
                  <span>Validated against registrar schema, uniqueness and referential rules</span>
                  <span className="ict-mono">Last validation · today 14:32</span>
                </div>
              </div>
            </div>
          </IctSection>

          {/* Issue register */}
          <IctSection
            icon={AlertTriangle}
            title="Quality Issues Detected"
            description="Records failing validation, grouped by issue type"
            flush
          >
            {dataQualityItems.length === 0 ? (
              <div className="p-3.5">
                <IctEmptyState
                  icon={ShieldCheck}
                  tone="success"
                  title="No data quality issues detected"
                  description="Every alumni record currently satisfies the registrar schema, uniqueness and completeness rules."
                />
              </div>
            ) : (
              <div className="ict-table-scroll">
                <table className="w-full min-w-[620px] border-collapse text-xs">
                  <caption className="sr-only">Data quality issues by type with severity and remediation action</caption>
                  <thead>
                    <tr>
                      <th scope="col" className={ictTh}>Issue</th>
                      <th scope="col" className={ictTh}>Field</th>
                      <th scope="col" className={`${ictTh} text-right`}>Records</th>
                      <th scope="col" className={ictTh}>Severity</th>
                      <th scope="col" className={`${ictTh} text-right`}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataQualityItems.map((item) => (
                      <tr key={item.type} className={ictTrHover}>
                        <td className={`${ictTd} text-[12px] font-extrabold text-[var(--text-primary)] `}>
                          {item.type}
                        </td>
                        <td className={ictTd}>
                          <span className="ict-mono text-[var(--text-muted)]">{item.field}</span>
                        </td>
                        <td className={`${ictTd} ict-num text-right text-[12px] font-extrabold text-[var(--text-primary)] `}>
                          {item.count}
                        </td>
                        <td className={ictTd}>
                          <IctStatusBadge status={item.severity} />
                        </td>
                        <td className={`${ictTd} text-right`}>
                          <button
                            type="button"
                            onClick={() => toast.success(`Queued: ${item.fixAction}`)}
                            className={ictBtnSecondary}
                          >
                            {item.fixAction}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </IctSection>
        </div>
      )}
    </div>
  );
}
