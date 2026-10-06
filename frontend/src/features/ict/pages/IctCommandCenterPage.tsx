import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  HardDrive,
  RefreshCw,
  Server,
  ShieldAlert,
  Terminal,
  Ticket,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import IctPageHeader from '../components/IctPageHeader';
import IctMetricCard from '../components/IctMetricCard';
import IctSection from '../components/IctSection';
import IctStatusBadge from '../components/IctStatusBadge';
import IctEmptyState from '../components/IctEmptyState';
import { IctMeter } from '../components/IctHealthIndicator';
import { ictBtnPrimary, ictBtnSecondary } from '../components/ictUi';

type ServiceStatus = 'healthy' | 'degraded' | 'down';

interface ServiceItem {
  name: string;
  status: ServiceStatus;
  latency: string;
  note: string;
}

interface AttentionAlert {
  type: 'warning' | 'error' | 'info';
  text: string;
  action: string;
  link: string;
}

const STORAGE_USED_GB = 142;
const STORAGE_TOTAL_GB = 500;
const STORAGE_USED_PCT = Math.round((STORAGE_USED_GB / STORAGE_TOTAL_GB) * 100);

const SERVICES_STATUS: ServiceItem[] = [
  { name: 'API Gateway', status: 'healthy', latency: '18ms', note: '100% operational' },
  { name: 'PostgreSQL Database', status: 'healthy', latency: '3.8ms', note: 'Conn pool 14/100' },
  { name: 'Authentication Service', status: 'healthy', latency: '12ms', note: 'JWT & OAuth active' },
  { name: 'Registrar SIS Integration API', status: 'degraded', latency: '145ms', note: 'Response delay +42%' },
  { name: 'Email Dispatcher', status: 'healthy', latency: '45ms', note: 'SMTP Gateway connected' },
  { name: 'SMS Notification Gateway', status: 'down', latency: 'Timeout', note: 'Provider gateway offline' },
  { name: 'Redis Cache & Queue', status: 'healthy', latency: '0.7ms', note: 'Hit ratio 94.2%' },
  { name: 'NVMe File Storage', status: 'healthy', latency: '5ms', note: `${STORAGE_TOTAL_GB - STORAGE_USED_GB}GB free · ${STORAGE_USED_PCT}% used` },
  { name: 'Frontend React Server', status: 'healthy', latency: '2ms', note: 'Vite edge routing' },
  { name: 'Employer Job Board', status: 'healthy', latency: '14ms', note: 'All jobs indexable' },
  { name: 'Tracer Study Engine', status: 'healthy', latency: '22ms', note: 'Cron triggers scheduled' },
  { name: 'ASTU AI Services & Matching', status: 'healthy', latency: '120ms', note: 'LangChain node active' },
  { name: 'Notification Service', status: 'healthy', latency: '10ms', note: 'In-app websockets live' },
  { name: 'Chapa Payment Gateway', status: 'healthy', latency: '95ms', note: 'Webhook listener ready' },
  { name: 'University ERP Connector', status: 'degraded', latency: '210ms', note: 'Sync queue pending' },
];

const THROUGHPUT = [
  { label: 'Requests / min', value: '2,841', hint: 'Stable throughput', icon: Activity, tone: 'info' as const },
  { label: 'Errors / min', value: '7', hint: '0.02% error rate', icon: ShieldAlert, tone: 'success' as const },
  { label: 'CPU Load', value: '43%', hint: '16 Cores Xeon', icon: Cpu, tone: 'default' as const },
  {
    label: 'NVMe Storage',
    value: `${STORAGE_USED_PCT}%`,
    hint: `${STORAGE_USED_GB}GB / ${STORAGE_TOTAL_GB}GB`,
    icon: HardDrive,
    tone: 'default' as const,
  },
];

export default function IctCommandCenterPage() {
  const navigate = useNavigate();
  const [healthScore] = useState(98.7);
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(() => new Date());

  const attentionAlerts: AttentionAlert[] = [
    {
      type: 'warning',
      text: 'Registrar API response time increased by 42% over last 30 minutes',
      action: 'Inspect Traces',
      link: '/ict/observability',
    },
    {
      type: 'error',
      text: 'SMS Notification Gateway is unreachable (timeout on Ethio Telecom SMS Center)',
      action: 'View Integrations',
      link: '/ict/integrations',
    },
    {
      type: 'info',
      text: `NVMe storage at ${STORAGE_USED_PCT}% capacity (${STORAGE_USED_GB}GB / ${STORAGE_TOTAL_GB}GB used · ${STORAGE_TOTAL_GB - STORAGE_USED_GB}GB free)`,
      action: 'View Architecture',
      link: '/ict/architecture',
    },
    {
      type: 'info',
      text: 'SSL certificate for *.astu.edu.et expires in 18 days',
      action: 'Review SOC',
      link: '/ict/security',
    },
    {
      type: 'warning',
      text: '5 suspicious login attempts detected from IP 197.156.92.14',
      action: 'Inspect SOC',
      link: '/ict/security',
    },
  ];

  const statusCounts = {
    healthy: SERVICES_STATUS.filter((s) => s.status === 'healthy').length,
    degraded: SERVICES_STATUS.filter((s) => s.status === 'degraded').length,
    down: SERVICES_STATUS.filter((s) => s.status === 'down').length,
    total: SERVICES_STATUS.length,
  };

  const criticalAlerts = attentionAlerts.filter((a) => a.type === 'error');

  const handleRescan = () => {
    if (scanning) return;
    setScanning(true);
    toast.loading('Re-checking health of all 15 core services...', { id: 'ict-rescan' });
    window.setTimeout(() => {
      setLastScanned(new Date());
      setScanning(false);
      toast.success(
        `Matrix refreshed · ${statusCounts.healthy} healthy · ${statusCounts.degraded} degraded · ${statusCounts.down} down`,
        { id: 'ict-rescan' }
      );
    }, 1400);
  };

  const ALERT_STYLE: Record<AttentionAlert['type'], { card: string; label: string; badge: string }> = {
    error: {
      card: 'border-[var(--ict-crit-line)] bg-[var(--ict-crit-bg)]',
      label: 'Critical',
      badge: 'critical',
    },
    warning: {
      card: 'border-[var(--ict-warn-line)] bg-[var(--ict-warn-bg)]',
      label: 'Warning',
      badge: 'warning',
    },
    info: {
      card: 'border-[var(--ict-info-line)] bg-[var(--ict-info-bg)]',
      label: 'Info',
      badge: 'info',
    },
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <IctPageHeader
        icon={Terminal}
        title="Command Center"
        description="Real-time overview of ASTU ICT infrastructure and services."
        meta={
          <>
            <IctStatusBadge status="operational" label="MONITORING ACTIVE" />
            <span className="ict-label">Last scan {lastScanned.toLocaleTimeString()}</span>
          </>
        }
        actions={
          <button type="button" onClick={handleRescan} disabled={scanning} className={ictBtnPrimary}>
            <RefreshCw className={`h-3.5 w-3.5 ${scanning ? 'animate-spin' : ''}`} aria-hidden />
            {scanning ? 'Scanning…' : 'Re-scan All Services'}
          </button>
        }
      />

      {/* ── System Health ─────────────────────────────────────────── */}
      <div>
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          System Health
        </p>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <IctMetricCard
            label="Healthy Services"
            value={`${statusCounts.healthy}/${statusCounts.total}`}
            icon={Server}
            tone="success"
            hint={`${statusCounts.degraded} degraded · ${statusCounts.down} down`}
            meter={<IctMeter value={statusCounts.healthy} max={statusCounts.total} tone="success" label="Healthy services" />}
          />
          <IctMetricCard
            label="Active Incidents"
            value={criticalAlerts.length}
            icon={AlertTriangle}
            tone={criticalAlerts.length > 0 ? 'danger' : 'success'}
            hint={`${attentionAlerts.length} items need attention`}
            status={criticalAlerts.length > 0 ? <IctStatusBadge status="critical" size="xs" /> : <IctStatusBadge status="ok" label="CLEAR" size="xs" />}
          />
          <IctMetricCard
            label="Open Tickets"
            value="—"
            icon={Ticket}
            tone="info"
            hint="See Escalated Support Desk"
            aside={<span className="ict-label">Live</span>}
            onClick={() => navigate('/ict/support-tickets')}
          />
          <IctMetricCard
            label="System Health Score"
            value={`${healthScore}%`}
            icon={CheckCircle2}
            tone="success"
            hint="Institutional health score"
            status={<IctStatusBadge status="operational" size="xs" />}
          />
        </div>
      </div>

      {/* ── Throughput / capacity ─────────────────────────────────── */}
      <div>
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          Infrastructure Overview
        </p>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {THROUGHPUT.map((stat) => (
            <IctMetricCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
              icon={stat.icon}
              tone={stat.tone}
              meter={
                stat.label === 'CPU Load' ? (
                  <IctMeter value={43} tone="info" label="CPU load 43 percent" />
                ) : stat.label === 'NVMe Storage' ? (
                  <IctMeter value={STORAGE_USED_PCT} tone="info" label="NVMe storage utilisation" />
                ) : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* ── Service matrix + alerts ───────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-12 xl:gap-5">
        <IctSection
          className="xl:col-span-8"
          icon={Server}
          title="Service Health Matrix"
          description={`${statusCounts.total} core institutional services`}
          actions={
            <div className="flex flex-wrap items-center gap-1.5">
              <IctStatusBadge status="healthy" label={`${statusCounts.healthy} HEALTHY`} size="xs" />
              <IctStatusBadge status="degraded" label={`${statusCounts.degraded} DEGRADED`} size="xs" />
              <IctStatusBadge status="down" label={`${statusCounts.down} DOWN`} size="xs" />
            </div>
          }
        >
          {SERVICES_STATUS.length === 0 ? (
            <IctEmptyState
              icon={Server}
              title="No services registered"
              description="Core institutional services will appear here once they are registered in the health matrix."
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES_STATUS.map((service) => (
                <div
                  key={service.name}
                  className={`ict-tile relative flex flex-col gap-1.5 overflow-hidden p-2.5 transition-colors duration-150 ${
                    service.status === 'down'
                      ? 'ict-bd-critical'
                      : service.status === 'degraded'
                        ? 'ict-bd-warning'
                        : 'ict-hover-accent'
                  }`}
                >
                  <span
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{
                      background:
                        service.status === 'down'
                          ? 'var(--ict-crit)'
                          : service.status === 'degraded'
                            ? 'var(--ict-warn)'
                            : 'var(--ict-ok)',
                    }}
                    aria-hidden
                  />

                  <div className="flex items-start justify-between gap-2 pl-1">
                    <span
                      className="ict-clamp-2 min-w-0 text-[12px] font-bold leading-snug text-[var(--text-primary)] "
                      title={service.name}
                    >
                      {service.name}
                    </span>
                    <IctStatusBadge status={service.status} size="xs" />
                  </div>

                  <div className="flex items-end justify-between gap-2 pl-1">
                    <span className="ict-clamp-2 min-w-0 text-[10.5px] text-[var(--text-muted)]">{service.note}</span>
                    <span
                      className={`ict-mono ict-num shrink-0 text-[11px] font-extrabold ${
                        service.status === 'down'
                          ? 'text-[var(--ict-crit)]'
                          : service.status === 'degraded'
                            ? 'text-[var(--ict-warn)]'
                            : 'text-[var(--text-secondary)] '
                      }`}
                    >
                      {service.latency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </IctSection>

        <IctSection
          className="xl:col-span-4"
          icon={AlertTriangle}
          title="Critical Alerts"
          description={`${attentionAlerts.length} items requiring attention`}
          actions={
            <Link
              to="/ict/security"
              className="ict-btn-xs"
              aria-label="Open the Security Operations Center module"
            >
              Open SOC
            </Link>
          }
        >
          {attentionAlerts.length === 0 ? (
            <IctEmptyState
              icon={CheckCircle2}
              tone="success"
              size="sm"
              title="No active incidents"
              description="Every monitored service is inside its operational threshold."
            />
          ) : (
            <div className="space-y-2">
              {attentionAlerts.map((alert) => {
                const style = ALERT_STYLE[alert.type];
                return (
                  <div key={alert.link + alert.text} className={`rounded-[6px] border p-2.5 ${style.card}`}>
                    <div className="flex items-start gap-2">
                      {alert.type === 'error' ? (
                        <XCircle className="mt-px h-3.5 w-3.5 shrink-0 text-[var(--ict-crit)]" aria-hidden />
                      ) : alert.type === 'warning' ? (
                        <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-[var(--ict-warn)]" aria-hidden />
                      ) : (
                        <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-[var(--ict-info)]" aria-hidden />
                      )}
                      <p className="min-w-0 text-[11px] font-semibold leading-snug text-[var(--text-primary)] ">
                        {alert.text}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-black/5 pt-2 ">
                      <IctStatusBadge status={style.badge} label={style.label} size="xs" showDot={false} />
                      <Link
                        to={alert.link}
                        className="text-[11px] font-extrabold text-[var(--ict-accent-text)] hover:underline ict-focus"
                      >
                        {alert.action} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </IctSection>
      </div>

      {/* ── Quick navigation into operational modules ─────────────── */}
      <IctSection
        icon={Activity}
        title="Operational Modules"
        description="Jump straight into the module that owns the work"
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/ict/support-tickets', label: 'Escalated Support Desk', hint: 'Ticket queue and resolution' },
            { to: '/ict/incidents', label: 'Incidents & DR', hint: 'Incident lifecycle and failover' },
            { to: '/ict/observability', label: 'Observability', hint: 'Latency and request traces' },
            { to: '/ict/integrations', label: 'Integrations & Sync', hint: 'Connectors and registrar sync' },
          ].map((mod) => (
            <Link
              key={mod.to}
              to={mod.to}
              className="ict-tile ict-hover-accent ict-shadow-sm group flex flex-col gap-0.5 p-2.5 transition-[border-color,box-shadow] duration-150 ict-focus"
            >
              <span className="text-[12px] font-extrabold text-[var(--text-primary)] ">{mod.label}</span>
              <span className="text-[10.5px] text-[var(--text-muted)]">{mod.hint}</span>
            </Link>
          ))}
        </div>
      </IctSection>

      <p className="flex flex-wrap items-center gap-2 text-[10.5px] text-[var(--text-muted)]">
        <span className="ict-card inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ict-ok)] ict-pulse" aria-hidden />
          Live monitoring active · attention items are linked to Observability, Integrations, Architecture and SOC modules
        </span>
        <button type="button" onClick={handleRescan} className={ictBtnSecondary}>
          <RefreshCw className={`h-3 w-3 ${scanning ? 'animate-spin' : ''}`} aria-hidden />
          Refresh matrix
        </button>
      </p>
    </div>
  );
}
