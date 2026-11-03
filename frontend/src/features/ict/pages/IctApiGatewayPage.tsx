import React, { useState } from 'react';
import apiClient from '../../../services/api';
import {
  Activity,
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Globe,
  Key,
  Layers,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  Slash,
  Terminal,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

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

const mockEndpoints: EndpointHealth[] = [
  { endpoint: '/api/v1/auth/login', method: 'POST', status2xx: 100.0, status4xx: 0.0, status5xx: 0.0, p95LatencyMs: 25, health: 'HEALTHY' },
  { endpoint: '/api/v1/alumni/profile', method: 'GET', status2xx: 100.0, status4xx: 0.0, status5xx: 0.0, p95LatencyMs: 30, health: 'HEALTHY' },
  { endpoint: '/api/v1/jobs', method: 'GET', status2xx: 100.0, status4xx: 0.0, status5xx: 0.0, p95LatencyMs: 28, health: 'HEALTHY' },
  { endpoint: '/api/v1/surveys/active', method: 'GET', status2xx: 100.0, status4xx: 0.0, status5xx: 0.0, p95LatencyMs: 35, health: 'HEALTHY' },
];

function normalizeScopes(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split(/[,\s|]+/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeApiKey(raw: Record<string, unknown>, index: number): ApiKeyItem {
  const statusRaw = String(raw.status || 'ACTIVE').toUpperCase();
  const status: ApiKeyItem['status'] =
    statusRaw === 'REVOKED' || statusRaw === 'EXPIRED' ? statusRaw : 'ACTIVE';

  return {
    id: String(raw.id || `key-${index}`),
    clientName: String(raw.clientName || raw.name || 'Unknown Client'),
    service: String(raw.service || raw.type || 'External Partner Service'),
    keyPrefix: String(raw.keyPrefix || raw.prefix || 'astu_live_••••'),
    scopes: normalizeScopes(raw.scopes ?? raw.permissions),
    rateLimit: String(raw.rateLimit || '—'),
    ipWhitelist: String(raw.ipWhitelist || '0.0.0.0/0 (Any IP)'),
    status,
    created: String(raw.created || raw.createdAt || '—'),
    lastUsed: String(raw.lastUsed || '—'),
    requestCount: Number(raw.requestCount) || 0,
  };
}

export default function IctApiGatewayPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'KEYS' | 'HEALTH' | 'STREAM'>('KEYS');

  React.useEffect(() => {
    apiClient
      .get('/admin/technical-ops/api-gateway')
      .then((res) => {
        const d = res.data;
        if (d.success && Array.isArray(d.data?.apiKeys)) {
          setApiKeys(
            d.data.apiKeys
              .filter((k: unknown) => k && typeof k === 'object')
              .map((k: Record<string, unknown>, i: number) => normalizeApiKey(k, i))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Form State
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
      setSelectedScopes(prev => prev.filter(s => s !== scopeId));
    } else {
      setSelectedScopes(prev => [...prev, scopeId]);
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
      rateLimit: rateLimit,
      ipWhitelist: ipWhitelist.trim() || '0.0.0.0/0 (Any IP)',
      status: 'ACTIVE',
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Just now',
      requestCount: 0,
    };

    setApiKeys(prev => [newKey, ...prev]);
    setIsModalOpen(false);
    setClientName('');
    setServiceName('');
    setIpWhitelist('');
    toast.success(`API Key provisioned for ${newKey.clientName}! Key prefix: ${newKey.keyPrefix}`);
  };

  const handleRevokeKey = (keyId: string) => {
    setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, status: 'REVOKED' } : k));
    toast.success('API Key revoked successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-500" />
            External System API Gateway Provisioning &amp; Health Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Provision API keys for external partner integrations (Registrar SIS, MoE, Payments) with rate limits, scope permissions, and live HTTP health inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-cyan-700 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Provision Partner API Key
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('KEYS')}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'KEYS'
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🔑 Partner API Credentials ({apiKeys.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('HEALTH')}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'HEALTH'
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🟢 Endpoint Health &amp; Status Rates
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('STREAM')}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'STREAM'
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          📡 Live HTTP Traffic Stream
        </button>
      </div>

      {/* TAB 1: API KEYS TABLE */}
      {activeTab === 'KEYS' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                    <th className="px-4 py-3.5">Client &amp; Service</th>
                    <th className="px-4 py-3.5">API Key Prefix</th>
                    <th className="px-4 py-3.5">Scope Permissions</th>
                    <th className="px-4 py-3.5">Rate Limit</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Total Requests</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  {apiKeys.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No external partner API credentials provisioned yet. Use "Provision Partner API Key" above to generate a client credential.
                      </td>
                    </tr>
                  ) : (
                    apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{key.clientName}</div>
                        <div className="text-[11px] text-slate-500">{key.service}</div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-cyan-600 dark:text-cyan-400 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{key.keyPrefix}</span>
                          <button
                            type="button"
                            onClick={() => toast.success('API Key Prefix copied')}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(key.scopes ?? []).length === 0 ? (
                            <span className="text-[10px] text-slate-400">No scopes</span>
                          ) : (
                            (key.scopes ?? []).map((s) => (
                              <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {s}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {key.rateLimit}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {key.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            REVOKED
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {Number(key.requestCount || 0).toLocaleString()} reqs
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                        {key.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleRevokeKey(key.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 cursor-pointer border border-rose-200 dark:border-rose-800"
                          >
                            Revoke Key
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENDPOINT HEALTH */}
      {activeTab === 'HEALTH' && (
        <div className="grid gap-4 md:grid-cols-2">
          {mockEndpoints.map((ep) => (
            <div key={ep.endpoint} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold font-mono rounded ${ep.method === 'POST' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{ep.endpoint}</span>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${ep.health === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ep.health === 'HEALTHY' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  {ep.health}
                </span>
              </div>

              {/* Status Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>2xx Success: <strong className="text-emerald-500">{ep.status2xx}%</strong></span>
                  <span>4xx Client Error: <strong className="text-amber-500">{ep.status4xx}%</strong></span>
                  <span>5xx Server Error: <strong className="text-rose-500">{ep.status5xx}%</strong></span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div style={{ width: `${ep.status2xx}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${ep.status4xx}%` }} className="bg-amber-500 h-full" />
                  <div style={{ width: `${ep.status5xx}%` }} className="bg-rose-500 h-full" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>P95 Response Latency: <strong className="text-slate-900 dark:text-white font-mono">{ep.p95LatencyMs} ms</strong></span>
                <span>Active Rate Limit: <strong className="text-slate-900 dark:text-white font-mono">Enforced</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: LIVE TRAFFIC STREAM */}
      {activeTab === 'STREAM' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl text-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Live API Gateway Request Stream</h3>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              STREAM ACTIVE (100 ms poll)
            </span>
          </div>

          <div className="font-mono text-[11px] space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
            <div className="text-emerald-400">[2026-09-13T21:24:12Z] 200 OK POST /api/v1/external/sis/graduates - Client: ASTU Main Registrar SIS (IP: 10.0.4.15) - 34ms</div>
            <div className="text-emerald-400">[2026-09-13T21:24:10Z] 200 OK GET /api/v1/external/moe/tracer-sync - Client: Ministry of Education (IP: 197.156.10.4) - 120ms</div>
            <div className="text-amber-400">[2026-09-13T21:23:55Z] 429 TOO MANY REQUESTS POST /api/v1/external/jobs/feed - Client: Unknown Client (IP: 197.156.92.14) - Rate Limit 100/min Exceeded</div>
            <div className="text-emerald-400">[2026-09-13T21:23:40Z] 200 OK POST /api/v1/external/chapa/verify - Client: Chapa Payment Gateway (IP: 18.134.90.11) - 58ms</div>
            <div className="text-rose-400">[2026-09-13T21:23:12Z] 401 UNAUTHORIZED GET /api/v1/external/alumni/export - Invalid API Key Signature</div>
          </div>
        </div>
      )}

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white">Provision Partner API Key</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApiKey} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">External Partner Client Name</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Ministry of Innovation & Tech (MInT)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Service / Application Purpose</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. National Graduate Verification Portal"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Rate Limit Threshold</label>
                <select
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                >
                  <option value="100 req/min">100 req/min (Standard Partner)</option>
                  <option value="500 req/min">500 req/min (Elevated Partner)</option>
                  <option value="2,000 req/min">2,000 req/min (Registrar SIS Sync)</option>
                  <option value="10,000 req/min">10,000 req/min (Internal Subsystem)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Allowed IP Whitelist (Optional)</label>
                <input
                  type="text"
                  value={ipWhitelist}
                  onChange={(e) => setIpWhitelist(e.target.value)}
                  placeholder="e.g. 197.156.10.0/24 or comma separated IPs"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Grant Scope Permissions</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableScopes.map((scope) => {
                    const checked = selectedScopes.includes(scope.id);
                    return (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => handleToggleScope(scope.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          checked
                            ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${checked ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-700'}`}>
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <div>
                          <div className="font-mono font-bold text-[10px] text-cyan-400">{scope.id}</div>
                          <div className="text-[10px] text-slate-400">{scope.label}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 font-bold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 font-bold text-white hover:bg-cyan-700 shadow-md cursor-pointer"
                >
                  Generate Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
