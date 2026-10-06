import React, { useState } from 'react';
import {
  Check,
  Copy,
  Globe,
  Key,
  Plus,
  Radio,
  Terminal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import IctPageHeader from '../components/IctPageHeader';
import IctSection from '../components/IctSection';
import IctStatusBadge, { IctMethodBadge } from '../components/IctStatusBadge';
import IctTabs, { IctTabItem } from '../components/IctTabs';
import IctDataTable, { IctColumn } from '../components/IctDataTable';
import IctEmptyState from '../components/IctEmptyState';
import IctModal from '../components/IctModal';
import IctKeyValueGrid from '../components/IctKeyValue';
import { IctMeter, IctStatusBar } from '../components/IctHealthIndicator';
import {
  ictBtnDangerGhost,
  ictBtnPrimary,
  ictBtnSecondary,
  ictBtnXs,
  ictInput,
  ictSelect,
} from '../components/ictUi';

interface ApiKeyItem {
  id: string;
  clientName: string;
  service: string;
  keyPrefix: string;
  scopes: string[];
  rateLimit: string;
  ipWhitelist: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  created: string;
  lastUsed: string;
  requestCount: number;
}

interface EndpointHealth {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status2xx: number;
  status4xx: number;
  status5xx: number;
  p95LatencyMs: number;
  health: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}

type GatewayTab = 'KEYS' | 'HEALTH' | 'STREAM';

const mockApiKeys: ApiKeyItem[] = [
  {
    id: 'key-901',
    clientName: 'ASTU Main Registrar SIS',
    service: 'Student Sync Service',
    keyPrefix: 'astu_live_sis_98a...',
    scopes: ['read:alumni', 'write:graduate_batch', 'verify:documents'],
    rateLimit: '2,000 req/min',
    ipWhitelist: '10.0.4.15, 10.0.4.16',
    status: 'ACTIVE',
    created: '2026-01-10',
    lastUsed: '2 mins ago',
    requestCount: 1420800,
  },
  {
    id: 'key-902',
    clientName: 'Ministry of Education (MoE)',
    service: 'National Tracer Portal Sync',
    keyPrefix: 'astu_live_moe_77f...',
    scopes: ['read:tracer', 'read:alumni_employment'],
    rateLimit: '500 req/min',
    ipWhitelist: '197.156.10.0/24',
    status: 'ACTIVE',
    created: '2026-03-15',
    lastUsed: '14 mins ago',
    requestCount: 389200,
  },
  {
    id: 'key-903',
    clientName: 'Chapa Payment Gateway',
    service: 'Alumni Card Fee Webhook',
    keyPrefix: 'astu_live_chapa_31c...',
    scopes: ['write:payments', 'read:card_status'],
    rateLimit: '100 req/min',
    ipWhitelist: '18.134.90.11',
    status: 'ACTIVE',
    created: '2026-05-01',
    lastUsed: '1 hour ago',
    requestCount: 45100,
  },
  {
    id: 'key-904',
    clientName: 'Ethio Telecom Career Portal',
    service: 'Job Board External Feed',
    keyPrefix: 'astu_live_ethio_99d...',
    scopes: ['read:jobs', 'write:applicant'],
    rateLimit: '200 req/min',
    ipWhitelist: '213.55.76.10',
    status: 'REVOKED',
    created: '2025-11-20',
    lastUsed: '30 days ago',
    requestCount: 12050,
  },
];

const mockEndpoints: EndpointHealth[] = [
  { endpoint: '/api/v1/external/sis/graduates', method: 'POST', status2xx: 99.8, status4xx: 0.2, status5xx: 0.0, p95LatencyMs: 42, health: 'HEALTHY' },
  { endpoint: '/api/v1/external/moe/tracer-sync', method: 'GET', status2xx: 96.5, status4xx: 3.2, status5xx: 0.3, p95LatencyMs: 185, health: 'HEALTHY' },
  { endpoint: '/api/v1/external/chapa/verify', method: 'POST', status2xx: 99.9, status4xx: 0.1, status5xx: 0.0, p95LatencyMs: 65, health: 'HEALTHY' },
  { endpoint: '/api/v1/external/jobs/feed', method: 'GET', status2xx: 88.0, status4xx: 9.5, status5xx: 2.5, p95LatencyMs: 340, health: 'DEGRADED' },
];

const STREAM_LINES = [
  { text: '[2026-09-13T21:24:12Z] 200 OK POST /api/v1/external/sis/graduates - Client: ASTU Main Registrar SIS (IP: 10.0.4.15) - 34ms', tone: 'ok' as const },
  { text: '[2026-09-13T21:24:10Z] 200 OK GET /api/v1/external/moe/tracer-sync - Client: Ministry of Education (IP: 197.156.10.4) - 120ms', tone: 'ok' as const },
  { text: '[2026-09-13T21:23:55Z] 429 TOO MANY REQUESTS POST /api/v1/external/jobs/feed - Client: Unknown Client (IP: 197.156.92.14) - Rate Limit 100/min Exceeded', tone: 'warn' as const },
  { text: '[2026-09-13T21:23:40Z] 200 OK POST /api/v1/external/chapa/verify - Client: Chapa Payment Gateway (IP: 18.134.90.11) - 58ms', tone: 'ok' as const },
  { text: '[2026-09-13T21:23:12Z] 401 UNAUTHORIZED GET /api/v1/external/alumni/export - Invalid API Key Signature', tone: 'err' as const },
];

const STREAM_TONE: Record<string, string> = {
  ok: 'text-emerald-300',
  warn: 'text-amber-300',
  err: 'text-rose-300',
};

export default function IctApiGatewayPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(mockApiKeys);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<GatewayTab>('KEYS');
  const [detailKey, setDetailKey] = useState<ApiKeyItem | null>(null);

  const [clientName, setClientName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [rateLimit, setRateLimit] = useState('500 req/min');
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:alumni']);

  const availableScopes = [
    { id: 'read:alumni', label: 'Read Alumni Profiles' },
    { id: 'write:graduate_batch', label: 'Import SIS Graduate Batches' },
    { id: 'read:tracer', label: 'Read Tracer Survey Analytics' },
    { id: 'write:tracer', label: 'Submit External Tracer Responses' },
    { id: 'verify:documents', label: 'Verify Degree & Transcript Hashes' },
    { id: 'write:payments', label: 'Process Chapa Payment Webhooks' },
  ];

  const handleToggleScope = (scopeId: string) => {
    if (selectedScopes.includes(scopeId)) {
      setSelectedScopes((prev) => prev.filter((s) => s !== scopeId));
    } else {
      setSelectedScopes((prev) => [...prev, scopeId]);
    }
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error('Client name is required');
      return;
    }

    const newKey: ApiKeyItem = {
      id: `key-${Date.now().toString().slice(-4)}`,
      clientName: clientName.trim(),
      service: serviceName.trim() || 'External Partner Service',
      keyPrefix: `astu_live_${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.random().toString(36).substring(2, 5)}...`,
      scopes: selectedScopes,
      rateLimit,
      ipWhitelist: ipWhitelist.trim() || '0.0.0.0/0 (Any IP)',
      status: 'ACTIVE',
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Just now',
      requestCount: 0,
    };

    setApiKeys((prev) => [newKey, ...prev]);
    setIsModalOpen(false);
    setClientName('');
    setServiceName('');
    setIpWhitelist('');
    toast.success(`API Key provisioned for ${newKey.clientName}! Key prefix: ${newKey.keyPrefix}`);
  };

  const handleRevokeKey = (keyId: string) => {
    setApiKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, status: 'REVOKED' } : k)));
    toast.success('API Key revoked successfully');
  };

  const tabs: IctTabItem<GatewayTab>[] = [
    { key: 'KEYS', label: 'Partner API credentials', count: apiKeys.length },
    { key: 'HEALTH', label: 'Endpoint health', count: mockEndpoints.length },
    { key: 'STREAM', label: 'Live traffic stream' },
  ];

  const activeKeys = apiKeys.filter((k) => k.status === 'ACTIVE').length;

  const columns: IctColumn<ApiKeyItem>[] = [
    {
      key: 'client',
      header: 'Client & service',
      cell: (key) => (
        <div className="min-w-0">
          <p className="ict-clamp-1 text-[12px] font-bold text-[var(--text-primary)] " title={key.clientName}>
            {key.clientName}
          </p>
          <p className="ict-clamp-1 text-[10.5px] text-[var(--text-muted)]">{key.service}</p>
        </div>
      ),
    },
    {
      key: 'key',
      header: 'API key prefix',
      width: '15%',
      cell: (key) => (
        <div className="flex items-center gap-1.5">
          <span className="ict-mono ict-num font-bold text-[var(--ict-accent-text)]">{key.keyPrefix}</span>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(key.keyPrefix);
                toast.success('API Key Prefix copied');
              } catch {
                toast.error('Unable to copy API key prefix');
              }
            }}
            className="rounded p-0.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] ict-focus"
            aria-label={`Copy API key prefix for ${key.clientName}`}
            title="Copy key prefix"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ),
    },
    {
      key: 'scopes',
      header: 'Scopes',
      cell: (key) => (
        <div className="flex flex-wrap gap-1">
          {key.scopes.map((s) => (
            <span
              key={s}
              className="ict-mono rounded-[4px] border border-[var(--border-color)] bg-[var(--ict-surface-inset)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]  "
            >
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'rate',
      header: 'Rate limit',
      width: '11%',
      cell: (key) => <span className="ict-mono ict-num whitespace-nowrap">{key.rateLimit}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '10%',
      cell: (key) => <IctStatusBadge status={key.status === 'REVOKED' ? 'failed' : key.status} label={key.status} />,
    },
    {
      key: 'requests',
      header: 'Total requests',
      align: 'right',
      width: '11%',
      cell: (key) => <span className="ict-mono ict-num whitespace-nowrap">{key.requestCount.toLocaleString()}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (key) => (
        <div className="flex items-center justify-end gap-1.5">
          <button type="button" onClick={() => setDetailKey(key)} className={ictBtnXs}>
            Details
          </button>
          {key.status === 'ACTIVE' && (
            <button type="button" onClick={() => handleRevokeKey(key.id)} className={ictBtnDangerGhost}>
              Revoke
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-5">
      <IctPageHeader
        icon={Globe}
        title="External API Gateway"
        description="Provision partner API keys, inspect route health, and monitor gateway traffic."
        meta={
          <>
            <IctStatusBadge status="operational" label={`${activeKeys} ACTIVE KEYS`} />
            <span className="ict-label">{mockEndpoints.length} partner routes monitored</span>
          </>
        }
        actions={
          <button type="button" onClick={() => setIsModalOpen(true)} className={ictBtnPrimary}>
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Provision Partner API Key
          </button>
        }
      />

      <IctTabs<GatewayTab>
        items={tabs}
        value={activeTab}
        onChange={setActiveTab}
        ariaLabel="API gateway views"
      />

      {/* ── Credentials ─────────────────────────────────────────── */}
      {activeTab === 'KEYS' && (
        <IctDataTable
          columns={columns}
          rows={apiKeys}
          rowKey={(key) => key.id}
          caption="Partner API credentials"
          summary={`${apiKeys.length} partner API keys, ${activeKeys} currently active`}
          empty={
            <IctEmptyState
              icon={Key}
              title="No API credentials provisioned"
              description="Provision a partner API key to grant an external system scoped, rate-limited access to ASTU-AMS services."
              action={
                <button type="button" onClick={() => setIsModalOpen(true)} className={ictBtnPrimary}>
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Provision Partner API Key
                </button>
              }
            />
          }
          footer={
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] px-3 py-2 text-[11px] text-[var(--text-muted)] ">
              <span>
                <strong className="text-[var(--text-primary)] ">{apiKeys.length}</strong> credentials ·{' '}
                <strong className="text-[var(--ict-ok)]">{activeKeys}</strong> active ·{' '}
                <strong className="text-[var(--ict-crit)]">{apiKeys.length - activeKeys}</strong> inactive
              </span>
              <span className="ict-label">Revoked keys keep their request history</span>
            </div>
          }
        />
      )}

      {/* ── Endpoint health ─────────────────────────────────────── */}
      {activeTab === 'HEALTH' && (
        <IctSection
          icon={Globe}
          title="Endpoint Health"
          description="HTTP status distribution and P95 latency by partner route"
          actions={<IctStatusBadge status="healthy" label={`${mockEndpoints.filter((e) => e.health === 'HEALTHY').length}/${mockEndpoints.length} HEALTHY`} />}
          bodyClassName="space-y-2"
        >
          {mockEndpoints.length === 0 ? (
            <IctEmptyState
              icon={Globe}
              title="No endpoints monitored"
              description="Partner routes appear here once they are registered against a provisioned API key."
            />
          ) : (
            <div className="grid gap-2.5 md:grid-cols-2">
              {mockEndpoints.map((ep) => (
                <article key={ep.endpoint} className="ict-card relative overflow-hidden p-3">
                  <span
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{
                      background:
                        ep.health === 'HEALTHY'
                          ? 'var(--ict-ok)'
                          : ep.health === 'DEGRADED'
                            ? 'var(--ict-warn)'
                            : 'var(--ict-crit)',
                    }}
                    aria-hidden
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 pl-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <IctMethodBadge method={ep.method} />
                      <span className="ict-mono ict-num ict-clamp-1 font-bold text-[var(--text-primary)] " title={ep.endpoint}>
                        {ep.endpoint}
                      </span>
                    </div>
                    <IctStatusBadge status={ep.health} />
                  </div>

                  <div className="mt-3 space-y-1.5 pl-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-[var(--text-muted)]">
                      <span>
                        2xx <strong className="text-[var(--ict-ok)]">{ep.status2xx}%</strong>
                      </span>
                      <span>
                        4xx <strong className="text-[var(--ict-warn)]">{ep.status4xx}%</strong>
                      </span>
                      <span>
                        5xx <strong className="text-[var(--ict-crit)]">{ep.status5xx}%</strong>
                      </span>
                    </div>
                    <IctStatusBar
                      ariaLabel={`HTTP status mix: ${ep.status2xx}% success, ${ep.status4xx}% client error, ${ep.status5xx}% server error`}
                      segments={[
                        { value: ep.status2xx, tone: 'success', label: '2xx' },
                        { value: ep.status4xx, tone: 'warning', label: '4xx' },
                        { value: ep.status5xx, tone: 'danger', label: '5xx' },
                      ]}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--ict-hairline)] pl-1 pt-2.5 text-[10.5px] text-[var(--text-muted)]">
                    <span>
                      P95 latency{' '}
                      <strong className="ict-mono ict-num text-[var(--text-primary)] ">{ep.p95LatencyMs} ms</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IctStatusBadge status="operational" label="RATE LIMIT ENFORCED" size="xs" />
                    </span>
                  </div>

                  <div className="mt-2 pl-1">
                    <IctMeter
                      value={Math.min(ep.p95LatencyMs, 500)}
                      max={500}
                      tone={ep.p95LatencyMs > 250 ? 'warning' : 'success'}
                      label={`P95 latency ${ep.p95LatencyMs} milliseconds of a 500 millisecond budget`}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </IctSection>
      )}

      {/* ── Live stream ─────────────────────────────────────────── */}
      {activeTab === 'STREAM' && (
        <IctSection
          icon={Terminal}
          title="Live API Gateway Request Stream"
          description="HTTP traffic sample for partner integrations"
          actions={<IctStatusBadge status="healthy" label="STREAM SAMPLE (demo)" />}
        >
          <div className="mb-2.5 flex items-center gap-1.5 text-[10.5px] text-[var(--text-muted)]">
            <Radio className="h-3 w-3 text-[var(--ict-ok)]" aria-hidden />
            <span>
              This panel shows a fixed traffic sample. A live socket feed is not connected to the gateway.
            </span>
          </div>
          <div className="ict-card overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] px-2.5 py-1.5">
              <span className="ict-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                HTTP · access log
              </span>
              <span className="ict-mono text-[10px] text-[var(--text-muted)]">{STREAM_LINES.length} entries</span>
            </div>
            <div className="ict-scroll max-h-80 overflow-auto bg-[var(--ict-surface-inset)] p-3">
              <ul className="space-y-1">
                {STREAM_LINES.map((line, i) => (
                  <li key={line.text} className={`ict-mono flex gap-2 text-[11px] leading-[1.65] ${STREAM_TONE[line.tone]}`}>
                    <span className="select-none text-[var(--text-muted)]">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 break-all">{line.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            {[
              { label: '2xx OK', cls: 'bg-[var(--ict-ok)]' },
              { label: '4xx Client', cls: 'bg-[var(--ict-warn)]' },
              { label: '4xx/5xx Error', cls: 'bg-[var(--ict-crit)]' },
            ].map((k) => (
              <span key={k.label} className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                <span className={`h-1.5 w-1.5 rounded-full ${k.cls}`} aria-hidden />
                {k.label}
              </span>
            ))}
          </div>
        </IctSection>
      )}

      {/* ── Credential detail ───────────────────────────────────── */}
      <IctModal
        isOpen={Boolean(detailKey)}
        onClose={() => setDetailKey(null)}
        width="md"
        icon={<Key className="h-3.5 w-3.5" aria-hidden />}
        title={detailKey?.clientName || 'API credential'}
        description={detailKey?.service}
        footer={
          <button type="button" onClick={() => setDetailKey(null)} className={ictBtnSecondary}>
            Close
          </button>
        }
      >
        {detailKey && (
          <div className="space-y-3.5">
            <IctKeyValueGrid
              columns={3}
              items={[
                { label: 'Key prefix', value: detailKey.keyPrefix, mono: true },
                { label: 'Status', value: detailKey.status },
                { label: 'Total requests', value: detailKey.requestCount.toLocaleString(), mono: true },
                { label: 'Rate limit', value: detailKey.rateLimit, mono: true },
                { label: 'Created', value: detailKey.created, mono: true },
                { label: 'Last used', value: detailKey.lastUsed, mono: true },
              ]}
            />
            <div>
              <p className="ict-label mb-1.5">Granted scopes</p>
              <div className="flex flex-wrap gap-1">
                {detailKey.scopes.map((s) => (
                  <span
                    key={s}
                    className="ict-mono rounded-[4px] border border-[var(--border-color)] bg-[var(--ict-surface-inset)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]  "
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="ict-label mb-1.5">IP whitelist</p>
              <p className="ict-mono ict-break text-[11px] text-[var(--text-secondary)] ">
                {detailKey.ipWhitelist}
              </p>
            </div>
          </div>
        )}
      </IctModal>

      {/* ── Provision form ──────────────────────────────────────── */}
      <IctModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="lg"
        icon={<Key className="h-3.5 w-3.5" aria-hidden />}
        title="Provision Partner API Key"
        description="Grant an external system scoped, rate-limited access to ASTU-AMS services."
        footer={
          <>
            <button type="button" onClick={() => setIsModalOpen(false)} className={ictBtnSecondary}>
              Cancel
            </button>
            <button type="submit" form="ict-provision-key" className={ictBtnPrimary}>
              Generate Credentials
            </button>
          </>
        }
      >
        <form id="ict-provision-key" onSubmit={handleCreateApiKey} className="space-y-3.5">
          <div>
            <label htmlFor="api-client-name" className="ict-label mb-1 block">
              External partner client name *
            </label>
            <input
              id="api-client-name"
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Ministry of Innovation & Tech (MInT)"
              className={ictInput}
            />
          </div>

          <div>
            <label htmlFor="api-service-purpose" className="ict-label mb-1 block">
              Service / application purpose
            </label>
            <input
              id="api-service-purpose"
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. National Graduate Verification Portal"
              className={ictInput}
            />
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="api-rate-limit" className="ict-label mb-1 block">
                Rate limit threshold
              </label>
              <select id="api-rate-limit" value={rateLimit} onChange={(e) => setRateLimit(e.target.value)} className={ictSelect}>
                <option value="100 req/min">100 req/min (Standard Partner)</option>
                <option value="500 req/min">500 req/min (Elevated Partner)</option>
                <option value="2,000 req/min">2,000 req/min (Registrar SIS Sync)</option>
                <option value="10,000 req/min">10,000 req/min (Internal Subsystem)</option>
              </select>
            </div>

            <div>
              <label htmlFor="api-ip-whitelist" className="ict-label mb-1 block">
                Allowed IP whitelist (optional)
              </label>
              <input
                id="api-ip-whitelist"
                type="text"
                value={ipWhitelist}
                onChange={(e) => setIpWhitelist(e.target.value)}
                placeholder="e.g. 197.156.10.0/24 or comma separated IPs"
                className={ictInput}
              />
            </div>
          </div>

          <fieldset>
            <legend className="ict-label mb-1.5">Grant scope permissions</legend>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {availableScopes.map((scope) => {
                const checked = selectedScopes.includes(scope.id);
                return (
                  <button
                    key={scope.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => handleToggleScope(scope.id)}
                    className={`flex items-center gap-2 rounded-[6px] border p-2 text-left transition-colors duration-150 ict-focus ${
                      checked
                        ? 'border-[var(--ict-accent)] bg-[var(--ict-accent-soft)]'
                        : 'border-[var(--border-color)] hover:border-[var(--ict-accent)]'
                    }`}
                  >
                    <span
                      className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${
                        checked ? 'border-[var(--ict-accent)] bg-[var(--ict-accent)] text-white' : 'border-[var(--border-color)]'
                      }`}
                    >
                      {checked && <Check className="h-2.5 w-2.5 stroke-[3]" aria-hidden />}
                    </span>
                    <span className="min-w-0">
                      <span className="ict-mono block font-bold text-[var(--ict-accent-text)]">{scope.id}</span>
                      <span className="block text-[10px] text-[var(--text-muted)]">{scope.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
              {selectedScopes.length} of {availableScopes.length} scopes selected
            </p>
          </fieldset>
        </form>
      </IctModal>
    </div>
  );
}
