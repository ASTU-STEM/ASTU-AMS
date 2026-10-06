import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Flame, Server, Siren } from 'lucide-react';
import toast from 'react-hot-toast';
import IctPageHeader from '../components/IctPageHeader';
import IctMetricCard from '../components/IctMetricCard';
import IctSection from '../components/IctSection';
import IctStatusBadge from '../components/IctStatusBadge';
import IctTabs, { IctTabItem } from '../components/IctTabs';
import IctEmptyState from '../components/IctEmptyState';
import IctKeyValueGrid from '../components/IctKeyValue';
import { ictBtnDanger } from '../components/ictUi';

type IncidentTab = 'incidents' | 'dr-simulation';

const LIFECYCLE = ['Detected', 'Investigating', 'Identified', 'Mitigating', 'Resolved', 'Postmortem'] as const;

export default function IctIncidentsPage() {
  const [activeTab, setActiveTab] = useState<IncidentTab>('incidents');
  const [drSimulating, setDrSimulating] = useState(false);

  const [incidents] = useState([
    {
      id: 'INC-2026-0042',
      title: 'Registrar SIS Integration API Response Degradation',
      severity: 'Critical',
      status: 'Investigating',
      started: '14:32 Today',
      affectedUsers: 4281,
      affectedServices: ['Registrar API', 'Alumni Sync Engine'],
      timeline: [
        { time: '14:32', text: 'Auto-detected: Registrar API latency exceeded 1,200ms threshold.' },
        { time: '14:35', text: 'ICT Admin started investigation and enabled diagnostic trace.' },
        { time: '14:40', text: 'Identified connection bottleneck at Registrar SIS gateway.' },
      ],
    },
    {
      id: 'INC-2026-0039',
      title: 'SMS Provider Gateway Intermittent Timeout',
      severity: 'High',
      status: 'Mitigating',
      started: '11:15 Today',
      affectedUsers: 142,
      affectedServices: ['SMS Service', '2FA Mobile OTP'],
      timeline: [
        { time: '11:15', text: 'SMS gateway dropped 24 consecutive delivery attempts.' },
        { time: '11:20', text: 'Rerouted 2FA mobile OTP to email backup channel.' },
      ],
    },
    {
      id: 'INC-2026-0035',
      title: 'PostgreSQL Read-Replica Lag During Batch Import',
      severity: 'Medium',
      status: 'Resolved',
      started: 'Yesterday 18:00',
      affectedUsers: 0,
      affectedServices: ['Database Read-Replica'],
      timeline: [
        { time: '18:00', text: 'Replication delay reached 45 seconds.' },
        { time: '18:15', text: 'Auto-healed: Replica caught up after batch import finished.' },
      ],
    },
  ]);

  const handleRunDRSimulation = () => {
    setDrSimulating(true);
    toast.loading('Simulating PostgreSQL primary database node outage...', { id: 'dr-sim' });

    setTimeout(() => {
      toast.success('DR Simulation Complete: Failover to Secondary Node verified in 1.4s! zero data loss.', { id: 'dr-sim' });
      setDrSimulating(false);
    }, 2500);
  };

  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved' && i.status !== 'Closed');
  const resolvedIncidents = incidents.length - activeIncidents.length;
  const affectedUsers = incidents.reduce((sum, i) => sum + i.affectedUsers, 0);

  const tabs: IctTabItem<IncidentTab>[] = [
    { key: 'incidents', label: 'Incidents', count: activeIncidents.length, dot: activeIncidents.length > 0 ? 'danger' : 'ok' },
    { key: 'dr-simulation', label: 'Disaster Recovery' },
  ];

  return (
    <div className="space-y-4 lg:space-y-5">
      <IctPageHeader
        icon={AlertCircle}
        title="Incidents & Disaster Recovery"
        description="Incident lifecycle tracking, recovery status and disaster recovery readiness."
        meta={
          activeIncidents.length > 0 ? (
            <IctStatusBadge status="critical" label={`${activeIncidents.length} ACTIVE`} />
          ) : (
            <IctStatusBadge status="operational" label="NO ACTIVE INCIDENTS" />
          )
        }
        actions={
          <IctTabs<IncidentTab> items={tabs} value={activeTab} onChange={setActiveTab} ariaLabel="Incident views" />
        }
      />

      {activeTab === 'incidents' ? (
        <>
          {/* Incident overview */}
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <IctMetricCard
              label="Active incidents"
              value={activeIncidents.length}
              icon={Siren}
              tone={activeIncidents.length > 0 ? 'danger' : 'success'}
              hint="Investigating or mitigating"
            />
            <IctMetricCard label="Recovered" value={resolvedIncidents} icon={CheckCircle2} tone="success" />
            <IctMetricCard label="Affected users" value={affectedUsers.toLocaleString()} icon={AlertCircle} tone="warning" hint="Across all tracked incidents" />
            <IctMetricCard label="Tracked incidents" value={incidents.length} icon={Server} tone="info" hint="Current reporting window" />
          </div>

          {incidents.length === 0 ? (
            <IctSection icon={AlertCircle} title="Incident Register" description="Active and recovered incidents">
              <IctEmptyState
                icon={CheckCircle2}
                tone="success"
                title="No active incidents"
                description="No service interruption is currently being tracked. New incidents appear here with their full lifecycle timeline."
              />
            </IctSection>
          ) : (
            <div className="space-y-3">
              {incidents.map((inc) => {
                const statusIndex = Math.max(
                  0,
                  LIFECYCLE.findIndex((s) => s.toLowerCase() === inc.status.toLowerCase())
                );
                const currentStep = statusIndex <= 0 ? 1 : statusIndex;
                const isCritical = inc.severity.toLowerCase() === 'critical';

                return (
                  <IctSection
                    key={inc.id}
                    icon={AlertCircle}
                    title={inc.title}
                    description={`Started ${inc.started} · ${inc.affectedUsers.toLocaleString()} affected users`}
                    className={isCritical ? 'border-[var(--ict-crit-line)]' : ''}
                    actions={
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="ict-mono ict-num font-extrabold text-[var(--ict-accent-text)]">{inc.id}</span>
                        <IctStatusBadge status={inc.severity} label={`SEVERITY: ${inc.severity.toUpperCase()}`} size="xs" />
                        <IctStatusBadge status={inc.status} size="xs" />
                      </div>
                    }
                    bodyClassName="space-y-3.5"
                  >
                    {/* Affected scope */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="ict-label">Affected services</span>
                      {inc.affectedServices.map((svc) => (
                        <span
                          key={svc}
                          className="rounded-[4px] border border-[var(--border-color)] bg-[var(--ict-surface-inset)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]  "
                        >
                          {svc}
                        </span>
                      ))}
                    </div>

                    {/* Lifecycle */}
                    <div>
                      <p className="ict-label mb-1.5">Lifecycle progress</p>
                      <ol className="grid grid-cols-3 gap-1 sm:grid-cols-6">
                        {LIFECYCLE.map((step, idx) => {
                          const isCurrent = idx === currentStep;
                          const isPassed = idx < currentStep;
                          return (
                            <li
                              key={step}
                              aria-current={isCurrent ? 'step' : undefined}
                              className={`rounded-[4px] border px-1.5 py-1.5 text-center text-[9.5px] font-extrabold uppercase tracking-[0.04em] ${
                                isCurrent
                                  ? 'border-[var(--ict-warn)] bg-[var(--ict-warn-bg)] text-[var(--ict-warn)]'
                                  : isPassed
                                    ? 'border-[var(--ict-ok-line)] bg-[var(--ict-ok-bg)] text-[var(--ict-ok)]'
                                    : 'border-[var(--border-color)] bg-[var(--ict-surface-inset)] text-[var(--text-muted)]'
                              }`}
                            >
                              {step}
                            </li>
                          );
                        })}
                      </ol>
                    </div>

                    {/* Timeline */}
                    <div className="ict-inset p-3">
                      <p className="ict-label mb-2">Incident timeline</p>
                      <ol className="space-y-2">
                        {inc.timeline.map((event, i) => (
                          <li key={`${event.time}-${i}`} className="flex items-start gap-2.5">
                            <span className="ict-mono ict-num shrink-0 font-extrabold text-[var(--ict-accent-text)]">
                              {event.time}
                            </span>
                            <span className="relative flex flex-col">
                              <span
                                className="absolute -left-[1.05rem] top-1 h-1.5 w-1.5 rounded-full bg-[var(--ict-accent)] ring-2 ring-[var(--ict-surface)]"
                                aria-hidden
                              />
                              <span className="text-[11px] leading-relaxed text-[var(--text-secondary)] ">
                                {event.text}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </IctSection>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <IctSection
            icon={Flame}
            title="Disaster Recovery Simulation Center"
            description="Exercise failover of the primary database node without destroying production data"
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <IctStatusBadge status="info" label="SAFETY GUARD ACTIVE" size="xs" />
                <button type="button" disabled={drSimulating} onClick={handleRunDRSimulation} className={ictBtnDanger}>
                  <Flame className="h-3.5 w-3.5" aria-hidden />
                  {drSimulating ? 'Simulating…' : 'Run DR Outage Simulation'}
                </button>
              </div>
            }
            bodyClassName="space-y-3.5"
          >
            <div className="grid gap-2.5 md:grid-cols-3">
              <IctMetricCard
                label="Primary system node"
                value="ONLINE"
                icon={Server}
                tone="success"
                hint="ASTU Core Neon Postgres primary"
                status={<IctStatusBadge status="operational" size="xs" />}
              />
              <IctMetricCard
                label="Failover replica"
                value="READY"
                icon={Server}
                tone="info"
                hint="Replication lag under 1.2s"
                status={<IctStatusBadge status="active" label="READY" size="xs" />}
              />
              <IctMetricCard label="Recovery targets" value="RTO <15s" icon={Server} tone="default" hint="RPO 0s · zero data loss target" />
            </div>

            <IctKeyValueGrid
              columns={3}
              items={[
                { label: 'Recovery time objective', value: 'Under 15 seconds', mono: true },
                { label: 'Recovery point objective', value: '0 seconds', mono: true },
                { label: 'Failover node', value: 'Secondary Postgres replica', mono: true },
              ]}
            />

            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              The simulation runs entirely in the browser and reports a simulated failover result. It does not touch the
              production database.
            </p>
          </IctSection>
        </div>
      )}
    </div>
  );
}
