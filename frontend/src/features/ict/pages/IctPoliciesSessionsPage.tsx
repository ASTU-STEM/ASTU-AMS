import React, { useState } from 'react';
import { Flame, Key, Megaphone, ShieldOff, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import IctPageHeader from '../components/IctPageHeader';
import IctSection from '../components/IctSection';
import IctStatusBadge from '../components/IctStatusBadge';
import IctDataTable, { IctColumn } from '../components/IctDataTable';
import IctEmptyState from '../components/IctEmptyState';
import IctToggle from '../components/IctToggle';
import { ictBtnDanger, ictBtnGhost, ictBtnPrimary, ictBtnXs, ictInput } from '../components/ictUi';

interface AdminSession {
  id: string;
  user: string;
  ip: string;
  device: string;
  status: string;
}

/**
 * Policy cards mirror the platform's real enforcement posture.
 * Values are descriptive labels only — no policy logic lives in the UI.
 */
const POLICY_CARDS = [
  {
    title: 'Authentication policies',
    description: 'Credential and factor requirements for administrative access',
    icon: Key,
    items: [
      { label: 'Multi-factor authentication', value: 'Required for all administrative roles' },
      { label: 'Password hashing', value: 'Bcrypt · 10 salt rounds' },
      { label: 'Token lifetime', value: 'Short-lived JWT with active rotation' },
      { label: 'Brute-force protection', value: 'Lockout after 5 failed attempts' },
    ],
  },
  {
    title: 'Session policies',
    description: 'Lifetime and termination rules for authenticated sessions',
    icon: ShieldOff,
    items: [
      { label: 'Idle timeout', value: 'Enforced by token expiry' },
      { label: 'Concurrent sessions', value: 'Visible and individually revocable' },
      { label: 'Emergency revocation', value: 'Terminate every administrative session' },
      { label: 'Break Glass elevation', value: 'Timed 30-minute privileged window' },
    ],
  },
  {
    title: 'Access rules',
    description: 'Route and resource guards applied across every portal',
    icon: UserX,
    items: [
      { label: 'Role-based guards', value: 'Enforced per protected route' },
      { label: 'Tenant boundary check', value: 'Applied on every data access' },
      { label: 'Maintenance mode', value: 'Locks portals for non-admin users' },
      { label: 'Emergency broadcast', value: 'Portal-wide operator notice' },
    ],
  },
];

export default function IctPoliciesSessionsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);

  const [sessions, setSessions] = useState<AdminSession[]>([
    { id: 'sess-1', user: 'Tolosa Abebe Badho (Super Admin)', ip: '197.156.92.14', device: 'Chrome / Windows 11', status: 'Active Now' },
    { id: 'sess-2', user: 'ICT System Administrator', ip: '102.217.18.2', device: 'Firefox / macOS', status: 'Active 12m ago' },
    { id: 'sess-3', user: 'Abebe Assefa (Registrar Admin)', ip: '197.156.90.1', device: 'Chrome / Windows 10', status: 'Active 1h ago' },
  ]);

  const handlePublishBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    const message = broadcastMessage.trim();
    setActiveBroadcast(message);
    window.dispatchEvent(
      new CustomEvent('ict-emergency-broadcast', {
        detail: { message, type: 'emergency' as const },
      })
    );
    toast.success('System Emergency Broadcast Published across all portals!');
  };

  const clearBroadcast = () => {
    setActiveBroadcast(null);
    window.dispatchEvent(new CustomEvent('ict-emergency-broadcast', { detail: { message: '' } }));
    toast.success('Broadcast cleared');
  };

  const toggleMaintenance = () => {
    setMaintenanceMode((prev) => {
      const next = !prev;
      window.dispatchEvent(new CustomEvent('ict-maintenance-mode', { detail: { enabled: next } }));
      toast.success(`Maintenance Mode ${next ? 'ENABLED' : 'DISABLED'}`);
      return next;
    });
  };

  const sessionColumns: IctColumn<AdminSession>[] = [
    {
      key: 'user',
      header: 'Administrator',
      cell: (s) => (
        <div className="flex items-center gap-2.5">
          <span
            className="ict-avatar-brand inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold"
            aria-hidden
          >
            {s.user
              .split(/[\s(]/)[0]
              .slice(0, 1)
              .toUpperCase()}
          </span>
          <span className="ict-clamp-1 min-w-0 text-[12px] font-bold text-[var(--text-primary)] " title={s.user}>
            {s.user}
          </span>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Device',
      cell: (s) => <span className="ict-clamp-1 text-[11px] text-[var(--text-secondary)] ">{s.device}</span>,
    },
    {
      key: 'ip',
      header: 'Source IP',
      width: '14%',
      cell: (s) => <span className="ict-mono ict-num whitespace-nowrap">{s.ip}</span>,
    },
    {
      key: 'lastActivity',
      header: 'Last activity',
      width: '14%',
      cell: (s) => (
        <IctStatusBadge status="active" label={s.status} size="xs" />
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (s) => (
        <button
          type="button"
          onClick={() => {
            setSessions((prev) => prev.filter((x) => x.id !== s.id));
            toast.success(`Revoked session for ${s.user}`);
          }}
          className={ictBtnDanger}
          aria-label={`Revoke session for ${s.user}`}
        >
          Revoke
        </button>
      ),
    },
  ];

  const activeSessionCount = sessions.length;

  return (
    <div className="space-y-4 lg:space-y-5">
      <IctPageHeader
        icon={Key}
        title="Policies & Sessions"
        description="Authentication policies, session controls and emergency operational actions."
        meta={
          maintenanceMode ? (
            <IctStatusBadge status="warning" label="MAINTENANCE ACTIVE" />
          ) : (
            <IctStatusBadge status="operational" label="PLATFORMS ONLINE" />
          )
        }
      />

      {/* ── Emergency control panel ──────────────────────────────── */}
      <IctSection
        icon={Flame}
        title="Emergency Control Panel"
        description="Institutional controls for maintenance, session revocation and traffic shielding"
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {/* Maintenance mode */}
          <div
            className={`ict-card relative overflow-hidden p-3 transition-colors duration-150 ${
              maintenanceMode ? 'ict-bd-warning ict-bg-warning' : 'ict-hover-accent'
            }`}
          >
            {maintenanceMode && (
              <span className="absolute inset-y-0 left-0 w-[3px] bg-[var(--ict-warn)]" aria-hidden />
            )}
            <div className="flex items-start justify-between gap-2 pl-1">
              <div className="min-w-0">
                <p className="ict-label">Maintenance Mode</p>
                <p className="mt-1 text-[11px] font-bold text-[var(--text-primary)] ">
                  {maintenanceMode ? 'ACTIVE — site locked' : 'OFF — standard operation'}
                </p>
                <p className="mt-0.5 text-[10.5px] text-[var(--text-muted)]">
                  Locks all portals for non-administrator users.
                </p>
              </div>
              <IctToggle
                checked={maintenanceMode}
                onChange={toggleMaintenance}
                label="Toggle maintenance mode"
              />
            </div>
            <div className="mt-2.5 flex items-center gap-2 pl-1">
              <IctStatusBadge status={maintenanceMode ? 'warning' : 'operational'} size="xs" />
            </div>
          </div>

          {/* Revoke all sessions */}
          <button
            type="button"
            onClick={() => {
              setSessions([]);
              toast.success('All administrative and user sessions terminated!');
            }}
            disabled={activeSessionCount === 0}
            className="ict-card ict-hover-critical relative overflow-hidden p-3 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55 ict-focus"
          >
            <span className="absolute inset-y-0 left-0 w-[3px] bg-[var(--ict-crit)] opacity-70" aria-hidden />
            <div className="pl-1">
              <p className="ict-label">Revoke All Admin Sessions</p>
              <p className="mt-1 text-[11px] font-bold text-[var(--text-primary)] ">
                Force immediate logout
              </p>
              <p className="mt-0.5 text-[10.5px] text-[var(--text-muted)]">
                Terminates {activeSessionCount} active administrative session{activeSessionCount === 1 ? '' : 's'}.
              </p>
            </div>
            <div className="mt-2.5 pl-1">
              <IctStatusBadge status={activeSessionCount > 0 ? 'critical' : 'disabled'} size="xs" />
            </div>
          </button>

          {/* Block suspicious traffic */}
          <button
            type="button"
            onClick={() => toast.success('Suspicious traffic IP ranges blocked automatically')}
            className="ict-card ict-hover-critical relative overflow-hidden p-3 text-left transition-colors duration-150 ict-focus"
          >
            <span className="absolute inset-y-0 left-0 w-[3px] bg-[var(--ict-crit)] opacity-70" aria-hidden />
            <div className="pl-1">
              <p className="ict-label">Block Suspicious Traffic</p>
              <p className="mt-1 text-[11px] font-bold text-[var(--text-primary)] ">
                Apply emergency IP shield
              </p>
              <p className="mt-0.5 text-[10.5px] text-[var(--text-muted)]">
                Applies the emergency egress and ingress deny policy.
              </p>
            </div>
            <div className="mt-2.5 pl-1">
              <IctStatusBadge status="pending" label="ARMED" size="xs" />
            </div>
          </button>
        </div>
      </IctSection>

      {/* ── Emergency broadcast ───────────────────────────────────── */}
      <IctSection
        icon={Megaphone}
        title="System-Wide Emergency Broadcast"
        description="Publish a portal-wide operator notice to every ASTU-AMS surface"
      >
        <form onSubmit={handlePublishBroadcast} className="space-y-2.5">
          <div>
            <label htmlFor="broadcast-message" className="sr-only">
              Emergency broadcast message
            </label>
            <input
              id="broadcast-message"
              type="text"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="e.g. ASTU-AMS scheduled database maintenance tonight 23:00 – 23:30."
              className={ictInput}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {activeBroadcast ? (
              <p className="flex min-w-0 items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <IctStatusBadge status="warning" label="BROADCAST ACTIVE" size="xs" />
                <span className="ict-clamp-1 min-w-0" title={activeBroadcast}>
                  &ldquo;{activeBroadcast}&rdquo;
                </span>
              </p>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)]">No active global broadcast</p>
            )}

            <div className="flex shrink-0 items-center gap-2">
              {activeBroadcast && (
                <button type="button" onClick={clearBroadcast} className={ictBtnGhost}>
                  Clear
                </button>
              )}
              <button type="submit" className={ictBtnPrimary} disabled={!broadcastMessage.trim()}>
                Publish Broadcast
              </button>
            </div>
          </div>
        </form>
      </IctSection>

      {/* ── Active sessions ───────────────────────────────────────── */}
      <IctSection
        icon={UserX}
        title={`Active Administrative Sessions (${activeSessionCount})`}
        description="Revoke an individual session or terminate every administrative session at once"
        flush
        actions={
          activeSessionCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                setSessions([]);
                toast.success('All administrative and user sessions terminated!');
              }}
              className={ictBtnXs}
            >
              Terminate all
            </button>
          ) : undefined
        }
      >
        <div className="p-3.5">
          <IctDataTable
            columns={sessionColumns}
            rows={sessions}
            rowKey={(s) => s.id}
            caption="Active administrative sessions"
            summary={`${activeSessionCount} administrative sessions currently open`}
            className="ict-bd-none ict-shadow-none"
            empty={
              <IctEmptyState
                icon={UserX}
                tone="success"
                title="No active administrative sessions"
                description="Every administrative session has been revoked. New logins appear here automatically."
              />
            }
          />
        </div>
      </IctSection>

      {/* ── Policy reference ──────────────────────────────────────── */}
      <IctSection
        icon={Key}
        title="Policy Reference"
        description="Enforcement posture enforced by the platform — review only, no policy changes from this screen"
        bodyClassName="grid gap-2.5 lg:grid-cols-3"
      >
        {POLICY_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="ict-tile p-3">
              <div className="flex items-start gap-2">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-[var(--ict-accent-soft)] text-[var(--ict-accent-text)]">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[12px] font-extrabold text-[var(--text-primary)] ">
                    {card.title}
                  </h3>
                  <p className="text-[10.5px] text-[var(--text-muted)]">{card.description}</p>
                </div>
              </div>

              <dl className="mt-2.5 space-y-1.5 border-t border-[var(--ict-hairline)] pt-2.5">
                {card.items.map((item) => (
                  <div key={item.label} className="min-w-0">
                    <dt className="ict-label">{item.label}</dt>
                    <dd className="text-[11px] font-semibold text-[var(--text-secondary)] ">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </IctSection>
    </div>
  );
}
