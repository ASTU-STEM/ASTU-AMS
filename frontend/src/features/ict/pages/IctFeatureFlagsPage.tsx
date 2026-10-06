import React, { useMemo, useState } from 'react';
import { RotateCcw, Sliders, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import IctPageHeader from '../components/IctPageHeader';
import IctMetricCard from '../components/IctMetricCard';
import IctSection from '../components/IctSection';
import IctStatusBadge, { IctEnvironmentBadge } from '../components/IctStatusBadge';
import IctTabs, { IctTabItem } from '../components/IctTabs';
import IctToggle from '../components/IctToggle';
import IctEmptyState from '../components/IctEmptyState';
import IctActionMenu from '../components/IctActionMenu';
import { IctMeter } from '../components/IctHealthIndicator';
import { ictBtnSecondary } from '../components/ictUi';

type Environment = 'Production' | 'Staging' | 'Sandbox';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPct: number;
  audience: string;
}

const BASE_FLAGS: FeatureFlag[] = [
  { id: 'f-1', name: 'ASTU AI & Assistant', description: 'In-portal diagnostics and guided ICT assistant', enabled: true, rolloutPct: 100, audience: 'All Users' },
  { id: 'f-2', name: 'AI Job Matching Engine', description: 'Personalized job recommendations for alumni', enabled: true, rolloutPct: 25, audience: 'Alumni cohort' },
  { id: 'f-3', name: 'Employer Talent Pipeline', description: 'Employer sourcing and shortlist workflows', enabled: true, rolloutPct: 100, audience: 'All Employers' },
  { id: 'f-4', name: 'Tracer Study Multi-Channel Notifications', description: 'Email, in-app, and SMS tracer reminders', enabled: true, rolloutPct: 100, audience: 'All Batches' },
  { id: 'f-5', name: 'SMS Mobile 2FA Verification', description: 'OTP delivery via Ethio Telecom SMS Center', enabled: false, rolloutPct: 0, audience: 'Admin & Alumni logins' },
  { id: 'f-6', name: 'Experimental AI Root Cause Agent', description: 'Automated incident root-cause suggestions', enabled: true, rolloutPct: 10, audience: 'ICT Admins' },
];

function targetLabel(flag: FeatureFlag): string {
  if (!flag.enabled || flag.rolloutPct <= 0) return 'Disabled';
  if (flag.rolloutPct >= 100) return flag.audience.startsWith('All') ? flag.audience : `All · ${flag.audience}`;
  return `${flag.rolloutPct}% of ${flag.audience}`;
}

export default function IctFeatureFlagsPage() {
  const [environment, setEnvironment] = useState<Environment>('Sandbox');
  const [featuresByEnv, setFeaturesByEnv] = useState<Record<Environment, FeatureFlag[]>>({
    Production: BASE_FLAGS.map((f) => ({ ...f })),
    Staging: BASE_FLAGS.map((f) => (f.id === 'f-2' ? { ...f, rolloutPct: 50, enabled: true } : { ...f })),
    Sandbox: BASE_FLAGS.map((f) => (f.id === 'f-6' ? { ...f, rolloutPct: 100, enabled: true } : { ...f })),
  });

  const features = featuresByEnv[environment];

  const stats = useMemo(() => {
    const enabled = features.filter((f) => f.enabled && f.rolloutPct > 0).length;
    const partial = features.filter((f) => f.enabled && f.rolloutPct > 0 && f.rolloutPct < 100).length;
    const disabled = features.length - enabled;
    return { enabled, partial, disabled, total: features.length, full: enabled - partial };
  }, [features]);

  const updateFlag = (id: string, patch: Partial<FeatureFlag>) => {
    setFeaturesByEnv((prev) => ({
      ...prev,
      [environment]: prev[environment].map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  };

  const toggleFeature = (id: string) => {
    const current = features.find((f) => f.id === id);
    if (!current) return;
    const nextEnabled = !current.enabled;
    updateFlag(id, {
      enabled: nextEnabled,
      rolloutPct: nextEnabled ? (current.rolloutPct > 0 ? current.rolloutPct : 25) : 0,
    });
    toast.success(
      nextEnabled ? `${current.name} enabled in ${environment}` : `${current.name} disabled in ${environment}`
    );
  };

  const updateRollout = (id: string, pct: number) => {
    updateFlag(id, { rolloutPct: pct, enabled: pct > 0 });
  };

  const envTabs: IctTabItem<Environment>[] = [
    { key: 'Production', label: 'Production' },
    { key: 'Staging', label: 'Staging' },
    { key: 'Sandbox', label: 'Sandbox' },
  ];

  return (
    <div className="space-y-4 lg:space-y-5">
      <IctPageHeader
        icon={Sliders}
        title="Feature Flags & Sandbox"
        description="Toggle features, control rollouts and manage releases per environment."
        meta={
          <>
            <IctEnvironmentBadge environment={environment} />
            <span className="ict-label">Workspace configuration</span>
          </>
        }
        actions={
          <IctTabs<Environment>
            items={envTabs}
            value={environment}
            onChange={(env) => {
              setEnvironment(env);
              toast.success(`Switched to ${env}`);
            }}
            ariaLabel="Deployment environment"
          />
        }
      />

      {/* Rollout summary */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <IctMetricCard
          label="Enabled"
          value={stats.enabled}
          tone="success"
          hint={`${stats.total} flags currently available in ${environment}`}
          status={<IctStatusBadge status="enabled" size="xs" />}
        />
        <IctMetricCard
          label="Partial rollout"
          value={stats.partial}
          tone="warning"
          hint="Canary percentage below 100%"
          status={<IctStatusBadge status="partial" label="PARTIAL" size="xs" />}
        />
        <IctMetricCard
          label="Disabled"
          value={stats.disabled}
          tone="default"
          hint="Flags off in this environment"
          status={<IctStatusBadge status="disabled" size="xs" />}
        />
        <IctMetricCard
          label="Full coverage"
          value={stats.full}
          tone="info"
          hint="Flags at 100% rollout"
          status={<IctStatusBadge status="enabled" label="FULL" size="xs" />}
        />
      </div>

      {/* Flag register */}
      <IctSection
        icon={Sparkles}
        title={`${environment} feature flags`}
        description={`${stats.total} flags · toggle or drag the rollout slider to change coverage`}
        actions={<IctStatusBadge status={environment} size="xs" />}
        bodyClassName="space-y-2"
      >
        {features.length === 0 ? (
          <IctEmptyState
            icon={Sliders}
            title="No feature flags configured"
            description="Flags created for this environment will appear here with their rollout percentage and target audience."
          />
        ) : (
          features.map((f) => {
            const isLive = f.enabled && f.rolloutPct > 0;
            const isPartial = isLive && f.rolloutPct < 100;
            return (
              <article
                key={f.id}
                className={`ict-tile p-3.5 transition-colors duration-150 ${
                  isLive ? 'hover:border-[var(--ict-accent)]/40' : 'border-dashed opacity-90'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[13.5px] font-extrabold tracking-tight text-[var(--text-primary)] ">
                        {f.name}
                      </h3>
                      <IctStatusBadge
                        status={isLive ? (f.rolloutPct >= 100 ? 'enabled' : 'partial') : 'disabled'}
                        label={isLive ? (f.rolloutPct >= 100 ? 'FULL' : 'CANARY') : 'OFF'}
                        size="xs"
                      />
                      <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                        Owner · ICT Systems Directorate
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--text-secondary)]">{f.description}</p>
                    <p className="mt-1.5 text-[11px] font-medium text-[var(--text-muted)]">
                      Targeting:{' '}
                      <span className="font-semibold text-[var(--text-secondary)]">{targetLabel(f)}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                    <span
                      className={`ict-mono ict-num text-[14px] font-extrabold ${
                        isLive ? 'text-[var(--ict-accent-text)]' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {isLive ? `${f.rolloutPct}%` : 'OFF'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <IctToggle
                        checked={isLive}
                        onChange={() => toggleFeature(f.id)}
                        label={`Toggle ${f.name}`}
                        size="sm"
                      />
                      <IctActionMenu
                        label={`Actions for ${f.name}`}
                        items={[
                          {
                            label: isLive ? 'Disable flag' : 'Enable flag',
                            danger: isLive,
                            onSelect: () => toggleFeature(f.id),
                          },
                          {
                            label: 'Set rollout to 100%',
                            disabled: !isLive,
                            disabledReason: 'Enable the flag first',
                            onSelect: () => updateRollout(f.id, 100),
                          },
                          { label: 'Set rollout to 0%', onSelect: () => updateRollout(f.id, 0) },
                          { divider: true },
                          {
                            label: 'Edit definition',
                            disabled: true,
                            disabledReason: 'Flag definitions are managed by the release pipeline',
                            onSelect: () => {},
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* Rollout control */}
                <div className="mt-3.5 border-t border-[var(--ict-hairline)] pt-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="ict-label">Rollout</span>
                    <span className="ict-mono ict-num text-[11px] font-bold text-[var(--text-secondary)]">
                      {f.rolloutPct}%
                      {isPartial && <span className="ml-1.5 font-semibold text-[var(--ict-warn)]">canary</span>}
                    </span>
                  </div>
                  <IctMeter
                    value={f.rolloutPct}
                    tone={isLive ? (isPartial ? 'warning' : 'success') : 'neutral'}
                    label={`${f.name} rollout ${f.rolloutPct} percent`}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={f.rolloutPct}
                    onChange={(e) => updateRollout(f.id, Number(e.target.value))}
                    aria-label={`${f.name} rollout percentage`}
                    className="ict-range mt-2.5 w-full cursor-pointer"
                  />
                  <div className="mt-1 flex justify-between text-[9.5px] font-medium text-[var(--text-muted)]">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </IctSection>

      {/* Release control */}
      <IctSection
        icon={RotateCcw}
        title="Deployment & One-Click Rollback"
        description="Previous stable release available for immediate restore"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="ict-mono ict-num rounded-[4px] bg-[var(--ict-ok-bg)] px-1.5 py-0.5 font-extrabold text-[var(--ict-ok)] ring-1 ring-inset ring-[var(--ict-ok-line)]">
              LIVE · v2.8.1
            </span>
            <button
              type="button"
              onClick={() => toast.success('Rolled back release v2.8.1 → v2.8.0')}
              className={ictBtnSecondary}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Rollback to v2.8.0
            </button>
          </div>
        }
      >
        <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
          Rollback restores the previous verified release package for the active environment. Migrations applied by the
          current release are retained.
        </p>
      </IctSection>
    </div>
  );
}
