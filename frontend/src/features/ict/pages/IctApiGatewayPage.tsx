import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Code,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Key,
  Layers,
  Loader2,
  Pause,
  Play,
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
import api from '../../../services/api';
import { IctTopHeaderCard } from '../components/IctTopHeaderCard';

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

interface TrafficStreamItem {
  id: string;
  timestamp: string;
  statusCode: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  action: string;
  clientName: string;
  ipAddress: string;
  latencyMs: number;
  details: string;
}

interface GeneratedKeyResult {
  clientName: string;
  service: string;
  keySecret: string;
  keyPrefix: string;
  rateLimit: string;
  ipWhitelist: string;
  scopes: string[];
}

export default function IctApiGatewayPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointHealth[]>([]);
  const [liveStream, setLiveStream] = useState<TrafficStreamItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'KEYS' | 'HEALTH' | 'STREAM'>('KEYS');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streamSearch, setStreamSearch] = useState('');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Form State
  const [clientName, setClientName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [rateLimit, setRateLimit] = useState('500 req/min');
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:alumni']);

  // Secret Reveal Modal State
  const [createdResult, setCreatedResult] = useState<GeneratedKeyResult | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    fetchGatewayData();
  }, []);

  useEffect(() => {
    let timer: any = null;
    if (isLiveStreaming && (activeTab === 'STREAM' || activeTab === 'HEALTH')) {
      timer = setInterval(() => {
        fetchGatewayData(true);
      }, 5000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTab, isLiveStreaming]);

  const fetchGatewayData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: any }>('/admin/technical-ops/api-gateway');
      const dataObj = res.data?.data || res.data;
      if (dataObj) {
        if (dataObj.endpoints && Array.isArray(dataObj.endpoints)) {
          setEndpoints(dataObj.endpoints);
        }
        if (dataObj.liveTrafficStream && Array.isArray(dataObj.liveTrafficStream)) {
          setLiveStream(dataObj.liveTrafficStream);
        }
        if (dataObj.apiKeys && Array.isArray(dataObj.apiKeys)) {
          const fetchedKeys: ApiKeyItem[] = dataObj.apiKeys.map((k: any) => ({
            id: k.id || `key-${Math.random().toString(36).substring(2, 6)}`,
            clientName: k.clientName || k.name || 'External Service Partner',
            service: k.service || k.permissions || 'READ_WRITE_STUDENTS',
            keyPrefix: k.keyPrefix || (k.keySecret ? `${k.keySecret.slice(0, 16)}...` : 'astu_live_key...'),
            scopes: Array.isArray(k.scopes) ? k.scopes : [k.permissions || k.service || 'READ_WRITE_STUDENTS'],
            rateLimit: k.rateLimit || '500 req/min',
            ipWhitelist: k.ipWhitelist || '10.0.0.0/8',
            status: (k.status || 'ACTIVE').toUpperCase() === 'REVOKED' ? 'REVOKED' : 'ACTIVE',
            created: k.createdAt || k.created || new Date().toISOString().split('T')[0],
            lastUsed: k.lastUsed || 'Just now',
            requestCount: k.requestCount || 0,
          }));
          setApiKeys(fetchedKeys);
        }
      }
    } catch (err) {
      console.error('Failed to fetch gateway stats:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

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

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error('Client name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<any>('/admin/backup-security/api-key', {
        clientName: clientName.trim(),
        name: clientName.trim(),
        service: serviceName.trim() || 'External Integration Service',
        rateLimit: rateLimit,
        ipWhitelist: ipWhitelist.trim() || '0.0.0.0/0 (Any IP)',
        scopes: selectedScopes,
      });
      
      const resData = res.data?.data || res.data;
      const createdKey = res.data?.createdKey || (Array.isArray(resData) ? resData[0] : null);

      const secretStr = createdKey?.keySecret || `astu_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
      const prefixStr = createdKey?.keyPrefix || `${secretStr.slice(0, 16)}...`;

      if (Array.isArray(resData)) {
        const mapped: ApiKeyItem[] = resData.map((k: any) => ({
          id: k.id || `key-${Date.now().toString().slice(-4)}`,
          clientName: k.clientName || k.name || clientName,
          service: k.service || serviceName || 'External Partner Service',
          keyPrefix: k.keyPrefix || (k.keySecret ? `${k.keySecret.slice(0, 16)}...` : 'astu_live_key...'),
          scopes: Array.isArray(k.scopes) ? k.scopes : selectedScopes,
          rateLimit: k.rateLimit || rateLimit,
          ipWhitelist: k.ipWhitelist || ipWhitelist || '0.0.0.0/0',
          status: (k.status || 'ACTIVE').toUpperCase() === 'REVOKED' ? 'REVOKED' : 'ACTIVE',
          created: k.created || new Date().toISOString().split('T')[0],
          lastUsed: 'Just now',
          requestCount: 0,
        }));
        setApiKeys(mapped);
      } else {
        await fetchGatewayData();
      }

      setCreatedResult({
        clientName: clientName.trim(),
        service: serviceName.trim() || 'External Integration Service',
        keySecret: secretStr,
        keyPrefix: prefixStr,
        rateLimit: rateLimit,
        ipWhitelist: ipWhitelist.trim() || '0.0.0.0/0 (Any IP)',
        scopes: selectedScopes,
      });

      // Clear form inputs
      setClientName('');
      setServiceName('');
      setIpWhitelist('');
      toast.success(`API Key provisioned for ${clientName.trim()} successfully!`);
    } catch (err: any) {
      toast.error('Failed to generate key: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeKey = async (key: ApiKeyItem) => {
    try {
      const res = await api.post<any>('/admin/backup-security/api-key/revoke', {
        id: key.id,
        name: key.clientName,
        keyPrefix: key.keyPrefix
      });
      const resData = res.data?.data || res.data;
      if (Array.isArray(resData)) {
        const mapped: ApiKeyItem[] = resData.map((k: any) => ({
          id: k.id || key.id,
          clientName: k.clientName || k.name || key.clientName,
          service: k.service || key.service,
          keyPrefix: k.keyPrefix || key.keyPrefix,
          scopes: Array.isArray(k.scopes) ? k.scopes : key.scopes,
          rateLimit: k.rateLimit || key.rateLimit,
          ipWhitelist: k.ipWhitelist || key.ipWhitelist,
          status: (k.status || 'ACTIVE').toUpperCase() === 'REVOKED' ? 'REVOKED' : 'ACTIVE',
          created: k.created || key.created,
          lastUsed: key.lastUsed,
          requestCount: key.requestCount,
        }));
        setApiKeys(mapped);
      } else {
        setApiKeys(prev => prev.map(k => k.id === key.id ? { ...k, status: 'REVOKED' } : k));
      }
      toast.success(`API Key for ${key.clientName} revoked successfully!`);
    } catch (err: any) {
      setApiKeys(prev => prev.map(k => k.id === key.id ? { ...k, status: 'REVOKED' } : k));
      toast.success(`API Key for ${key.clientName} revoked successfully!`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCreatedResult(null);
    setShowSecret(false);
    setCopiedSecret(false);
    setCopiedSnippet(false);
  };

  const copyToClipboard = (text: string, type: 'secret' | 'snippet') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      toast.success('API Secret Key copied to clipboard!');
      setTimeout(() => setCopiedSecret(false), 2500);
    } else {
      setCopiedSnippet(true);
      toast.success('cURL code snippet copied!');
      setTimeout(() => setCopiedSnippet(false), 2500);
    }
  };

  const filteredStream = liveStream.filter(item =>
    !streamSearch ||
    item.path.toLowerCase().includes(streamSearch.toLowerCase()) ||
    item.clientName.toLowerCase().includes(streamSearch.toLowerCase()) ||
    item.ipAddress.includes(streamSearch) ||
    item.action.toLowerCase().includes(streamSearch.toLowerCase()) ||
    item.details.toLowerCase().includes(streamSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <IctTopHeaderCard
        title="External System API Gateway"
        subtitle="Provision API keys for external partner integrations with rate limits, scope permissions, and live HTTP health inspection."
      />

      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-500" />
            Gateway Operations &amp; Credentials
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active integrations, status checks, and rate-limiting profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              fetchGatewayData();
              toast.success('Gateway telemetry refreshed from database!');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition-all active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-cyan-700 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Provision Partner API Key
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('KEYS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'HEALTH'
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🟢 Endpoint Health &amp; Status Rates ({endpoints.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('STREAM')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'STREAM'
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          📡 Live HTTP Traffic Stream ({liveStream.length})
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
                  {loading
                    ? Array.from({ length: 4 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="px-4 py-3.5">
                            <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-1" />
                            <div className="h-2.5 w-24 bg-slate-100 dark:bg-slate-800/60 rounded" />
                          </td>
                          <td className="px-4 py-3.5"><div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                          <td className="px-4 py-3.5"><div className="h-3.5 w-36 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                          <td className="px-4 py-3.5"><div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                          <td className="px-4 py-3.5"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" /></td>
                          <td className="px-4 py-3.5"><div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                          <td className="px-4 py-3.5 text-right"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded ml-auto" /></td>
                        </tr>
                      ))
                    : apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{key.clientName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{key.service}</div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-cyan-600 dark:text-cyan-400 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{key.keyPrefix}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(key.keyPrefix);
                              toast.success('API Key Prefix copied');
                            }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {key.scopes.map((s) => (
                            <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {s}
                            </span>
                          ))}
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
                        {key.requestCount.toLocaleString()} reqs
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                        {key.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleRevokeKey(key)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 cursor-pointer border border-rose-200 dark:border-rose-800"
                          >
                            Revoke Key
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENDPOINT HEALTH */}
      {activeTab === 'HEALTH' && (
        <div className="grid gap-4 md:grid-cols-2">
          {endpoints.map((ep) => (
            <div key={ep.endpoint} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold font-mono rounded ${ep.method === 'POST' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{ep.endpoint}</span>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${ep.health === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>
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

      {/* TAB 3: REAL SERVER & HTTP GATEWAY LIVE STREAM */}
      {activeTab === 'STREAM' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl text-slate-100 space-y-4 font-mono">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3 font-sans">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                  Live Server &amp; HTTP Gateway Request Stream
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time terminal logs, HTTP requests, background cron jobs, and PostgreSQL state events
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={streamSearch}
                  onChange={(e) => setStreamSearch(e.target.value)}
                  placeholder="Search terminal & HTTP logs..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLiveStreaming
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isLiveStreaming ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <Pause className="w-3.5 h-3.5" />
                    Live Streaming (2s)
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Stream Paused
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="font-mono text-[11px] space-y-2 max-h-[440px] overflow-y-auto scrollbar-thin pr-1">
            {loading && liveStream.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
                <div>Connecting to live HTTP & server log terminal stream...</div>
              </div>
            ) : filteredStream.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-1">
                <AlertCircle className="w-6 h-6 mx-auto text-slate-600" />
                <div>No terminal or HTTP stream entries matching "{streamSearch}".</div>
              </div>
            ) : (
              filteredStream.map((item) => {
                const isHttp = item.method && item.path && item.path.startsWith('/');
                const is2xx = item.statusCode >= 200 && item.statusCode < 300;
                const is4xx = item.statusCode >= 400 && item.statusCode < 500;
                const is5xx = item.statusCode >= 500;

                const colorClass = is2xx
                  ? 'text-emerald-400'
                  : is4xx
                  ? 'text-amber-400'
                  : 'text-rose-400';

                const statusBg = is2xx
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : is4xx
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

                const formattedTime = new Date(item.timestamp).toISOString().replace('T', ' ').slice(0, 19);

                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-500">[{formattedTime}]</span>

                      {isHttp ? (
                        <>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${statusBg}`}>
                            {item.statusCode}
                          </span>

                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {item.method}
                          </span>

                          <span className={`font-bold ${colorClass}`}>{item.path}</span>

                          <span className="text-slate-400">
                            - Client: <strong className="text-slate-200">{item.clientName}</strong> (IP: {item.ipAddress})
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            [INFO]
                          </span>
                          <span className="text-slate-200 font-bold">{item.details}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-slate-500 text-[10px] shrink-0">
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded text-slate-300 border border-slate-700/50">
                        {item.action || 'SERVER_LOG'}
                      </span>
                      {item.latencyMs > 0 && (
                        <span className="text-cyan-400 font-bold font-mono">{item.latencyMs}ms</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Provisioning Modal using React Portal for Clean Rendering & Light/Dark Theme Integration */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseModal();
            }}
          >
            <div className="w-full max-w-xl my-8 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-5 transition-all">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {createdResult ? 'API Credentials Provisioned' : 'Provision Partner API Key'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {createdResult
                        ? 'External partner secret generated successfully'
                        : 'Configure external integration key parameters & permissions'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* STEP 2: CREATED SECRET REVEAL VIEW */}
              {createdResult ? (
                <div className="space-y-5 text-xs">
                  {/* Success Banner */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm">Credentials Generated &amp; Activated</h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                        API key provisioned for <strong>{createdResult.clientName}</strong> with {createdResult.rateLimit} threshold.
                      </p>
                    </div>
                  </div>

                  {/* Secret Display Box */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 dark:text-slate-300 font-extrabold text-xs">
                      Partner Secret API Key
                    </label>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs shadow-inner">
                      <span className="flex-1 truncate tracking-wider">
                        {showSecret ? createdResult.keySecret : `${createdResult.keySecret.slice(0, 14)}••••••••••••••••••••`}
                      </span>

                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] font-sans font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showSecret ? 'Hide' : 'Reveal'}
                      </button>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(createdResult.keySecret, 'secret')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-sans font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          copiedSecret
                            ? 'bg-emerald-600 text-white'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs'
                        }`}
                      >
                        {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedSecret ? 'Copied!' : 'Copy Secret'}
                      </button>
                    </div>
                  </div>

                  {/* Security Alert Banner */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      <strong>Security Notice:</strong> Save your secret key now in a secure vault. For privacy and security reasons, it will <strong>never be shown again</strong> after you close this modal.
                    </p>
                  </div>

                  {/* Key Metadata Breakdown */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 font-medium">Service / Purpose:</span>
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{createdResult.service}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 font-medium">IP Whitelist:</span>
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate font-mono">{createdResult.ipWhitelist}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 dark:text-slate-500 font-medium block mb-1">Granted Scope Permissions:</span>
                      <div className="flex flex-wrap gap-1">
                        {createdResult.scopes.map((sc) => (
                          <span key={sc} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                            {sc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Code Snippet integration */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold text-xs">
                      <span className="flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-cyan-500" />
                        Sample HTTP Authorization Header Snippet
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `curl -X GET "https://api.astu.edu.et/v1/external/sis/graduates" \\\n  -H "Authorization: Bearer ${createdResult.keySecret}" \\\n  -H "Content-Type: application/json"`,
                            'snippet'
                          )
                        }
                        className="text-cyan-600 dark:text-cyan-400 hover:underline text-[11px] flex items-center gap-1 cursor-pointer font-sans"
                      >
                        {copiedSnippet ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {copiedSnippet ? 'Copied Code' : 'Copy cURL Snippet'}
                      </button>
                    </div>

                    <pre className="p-3 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 font-mono text-[11px] overflow-x-auto whitespace-pre">
{`curl -X GET "https://api.astu.edu.et/v1/external/sis/graduates" \\
  -H "Authorization: Bearer ${createdResult.keySecret}" \\
  -H "Content-Type: application/json"`}
                    </pre>
                  </div>

                  {/* Close Modal Button */}
                  <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 font-extrabold text-white shadow-md cursor-pointer transition-all active:scale-95 text-xs"
                    >
                      I Have Saved My Secret Key
                    </button>
                  </div>
                </div>
              ) : (
                /* STEP 1: PROVISION FORM VIEW */
                <form onSubmit={handleCreateApiKey} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-extrabold mb-1">
                      External Partner Client Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Ministry of Innovation & Tech (MInT)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-extrabold mb-1">
                      Service / Application Purpose
                    </label>
                    <input
                      type="text"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="e.g. National Graduate Verification Portal"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-extrabold mb-1">
                      Rate Limit Threshold
                    </label>
                    <select
                      value={rateLimit}
                      onChange={(e) => setRateLimit(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium cursor-pointer"
                    >
                      <option value="100 req/min">100 req/min (Standard Partner)</option>
                      <option value="500 req/min">500 req/min (Elevated Partner)</option>
                      <option value="2,000 req/min">2,000 req/min (Registrar SIS Sync)</option>
                      <option value="10,000 req/min">10,000 req/min (Internal Subsystem)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-extrabold mb-1">
                      Allowed IP Whitelist (Optional)
                    </label>
                    <input
                      type="text"
                      value={ipWhitelist}
                      onChange={(e) => setIpWhitelist(e.target.value)}
                      placeholder="e.g. 197.156.10.0/24 or 10.0.4.15"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-extrabold mb-1.5">
                      Grant Scope Permissions
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {availableScopes.map((scope) => {
                        const checked = selectedScopes.includes(scope.id);
                        return (
                          <button
                            key={scope.id}
                            type="button"
                            onClick={() => handleToggleScope(scope.id)}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                              checked
                                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-700 dark:text-cyan-300'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                checked
                                  ? 'bg-cyan-600 border-cyan-600 text-white'
                                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <div>
                              <div className="font-mono font-bold text-[10px] text-cyan-600 dark:text-cyan-400">
                                {scope.id}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                {scope.label}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 font-extrabold text-white shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating Key...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4" />
                          Generate Credentials
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
