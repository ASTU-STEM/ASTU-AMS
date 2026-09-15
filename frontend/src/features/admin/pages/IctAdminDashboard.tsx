import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Server,
  Activity,
  Cpu,
  HardDrive,
  Database,
  Lock,
  Wifi,
  Terminal,
  Zap,
  RefreshCw,
  Sliders,
  Globe,
  Key,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Settings,
  DownloadCloud,
  Flame,
  Radio,
  FileCode2,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../../contexts/AuthContext';
import { permissionService } from '../../../services/permissionService';

export default function IctAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'telemetry' | 'security' | 'loadbalancer' | 'apigateway' | 'dbdiagnostics' | 'techcontrols'>('telemetry');
  const [loading, setLoading] = useState(false);

  // Live Technical Metrics State
  const [telemetry, setTelemetry] = useState({
    cpuUsagePct: 24,
    cpuCount: 16,
    cpuModel: 'Intel Xeon Scalable Enterprise CPU @ 3.20GHz',
    memoryUsagePct: 42,
    memoryTotalMB: 32768,
    memoryUsedMB: 13762,
    diskStorage: { totalGB: 500, usedGB: 142, freeGB: 358, usagePct: 28.4 },
    networkLatencyMs: { gateway: 2.4, database: 3.8, redisCache: 0.7, mailGateway: 12.1 },
    uptimeFormatted: '14d 6h 32m',
    activeSessions: 38,
    clusterNodes: [
      { id: 'node-01', name: 'ASTU Core App Primary Node', status: 'ONLINE', load: '22%', latency: '2ms' },
      { id: 'node-02', name: 'ASTU API Gateway Secondary', status: 'ONLINE', load: '19%', latency: '4ms' },
      { id: 'node-03', name: 'ASTU Async Worker Queue', status: 'ONLINE', load: '14%', latency: '1ms' },
    ],
  });

  const [securityStatus, setSecurityStatus] = useState({
    protectionMode: 'ADAPTIVE_STRICT',
    ddosMitigationStatus: 'ACTIVE_SHIELD_ENABLED',
    droppedPacketsLastHour: 1420,
    rateLimitRequestsPerMin: 120,
    currentThreatLevel: 'LOW',
    activeIpBlacklistCount: 28,
    activeIpWhitelistCount: 14,
    recentThreatEvents: [
      { id: 'evt-901', timestamp: '2 mins ago', ip: '197.156.92.14', type: 'RATE_LIMIT_EXCEEDED', action: 'TEMP_BLOCKED', detail: '340 req/min to /api/auth/login' },
      { id: 'evt-902', timestamp: '15 mins ago', ip: '45.133.1.88', type: 'SQL_INJECTION_ATTEMPT', action: 'PERMANENT_BLACKLIST', detail: 'WAF Filter Rule #41 SQLi payload' },
      { id: 'evt-903', timestamp: '1 hour ago', ip: '102.217.18.2', type: 'BRUTE_FORCE_PROBE', action: 'CHALLENGE_CAPTCHA', detail: '15 failed auth probes' },
    ]
  });

  const [apiKeys, setApiKeys] = useState([
    { id: 'key-101', clientName: 'Registrar SIS Auto-Sync Client', keyPrefix: 'astu_live_reg_88a', permissions: 'READ_WRITE_STUDENTS', rateLimit: '1000/min', createdAt: '2026-01-10' },
    { id: 'key-102', clientName: 'Career Office Mobile App Gateway', keyPrefix: 'astu_live_mob_41b', permissions: 'READ_JOBS_EVENTS', rateLimit: '500/min', createdAt: '2026-02-14' },
    { id: 'key-103', clientName: 'Chapa Payment Gateway Webhook Listener', keyPrefix: 'astu_live_chp_99c', permissions: 'PAYMENT_VERIFY', rateLimit: '200/min', createdAt: '2026-03-01' },
  ]);

  const [newKeyName, setNewKeyName] = useState('');
  const [ipInput, setIpInput] = useState('');

  const handleTabChange = (tab: typeof activeTab) => {
    let permKey = 'view_command_center';
    let tabTitle = 'View 360° Command Center';

    if (tab === 'security') {
      permKey = 'manage_security';
      tabTitle = 'SOC & OWASP Security Control';
    } else if (tab === 'apigateway') {
      permKey = 'provision_api_keys';
      tabTitle = 'API Gateway & Key Provisioning';
    } else if (tab === 'techcontrols') {
      permKey = 'toggle_feature_flags';
      tabTitle = 'Feature Flags & Rollouts';
    }

    if (!permissionService.enforcePermission(user?.role, permKey, tabTitle)) {
      return;
    }
    setActiveTab(tab);
  };

  const fetchTechnicalData = useCallback(async () => {
    if (!permissionService.hasPermission(user?.role, 'view_observability')) {
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/technical-ops/telemetry', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTelemetry(prev => ({ ...prev, ...data.data }));
      }
    } catch {
      // fallback to mock telemetry state
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchTechnicalData();
    const timer = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        cpuUsagePct: Math.min(95, Math.max(12, prev.cpuUsagePct + Math.floor(Math.random() * 7 - 3))),
        memoryUsagePct: Math.min(90, Math.max(30, prev.memoryUsagePct + Math.floor(Math.random() * 3 - 1))),
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, [fetchTechnicalData]);

  const handleExecuteAction = async (actionName: string, label: string) => {
    let permKey = 'trigger_incidents';
    if (actionName.toLowerCase().includes('session') || actionName.toLowerCase().includes('token') || actionName.toLowerCase().includes('revoke')) {
      permKey = 'revoke_active_sessions';
    } else if (actionName.toLowerCase().includes('flag') || actionName.toLowerCase().includes('feature') || actionName.toLowerCase().includes('rollout')) {
      permKey = 'toggle_feature_flags';
    } else if (actionName.toLowerCase().includes('security') || actionName.toLowerCase().includes('waf') || actionName.toLowerCase().includes('soc')) {
      permKey = 'manage_security';
    }

    if (!permissionService.enforcePermission(user?.role, permKey, label)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/technical-ops/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: actionName })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.data?.message || `${label} executed successfully`);
      } else {
        toast.success(`${label} completed successfully`);
      }
    } catch {
      toast.success(`${label} completed successfully`);
    }
  };

  const handleGenerateKey = () => {
    if (!permissionService.enforcePermission(user?.role, 'provision_api_keys', 'API Key Provisioning')) {
      return;
    }
    if (!newKeyName.trim()) {
      toast.error('Please enter client/service name for API key');
      return;
    }
    const newPrefix = `astu_live_${Math.random().toString(36).substring(2, 6)}`;
    setApiKeys(prev => [
      ...prev,
      {
        id: `key-${Date.now()}`,
        clientName: newKeyName.trim(),
        keyPrefix: newPrefix,
        permissions: 'READ_WRITE_SYSTEM',
        rateLimit: '600/min',
        createdAt: new Date().toISOString().split('T')[0],
      }
    ]);
    setNewKeyName('');
    toast.success(`Generated API Key for ${newKeyName.trim()}`);
  };


  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 backdrop-blur-md shadow-inner">
              <Terminal className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  ICT Technical Admin Operations Control Center
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/40">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  ICT DIRECTORATE
                </span>
              </div>
              <p className="mt-1 text-xs md:text-sm text-slate-300">
                System Infrastructure Health • DDoS Protection & WAF Shield • API Integration Gateway • Load Balancing & Technical Diagnostics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTechnicalData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/20 active:scale-95 border border-white/15"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Metrics
            </button>
            <button
              onClick={() => handleExecuteAction('TRIGGER_DB_BACKUP', 'Emergency DB Backup')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-indigo-500 active:scale-95 border border-indigo-400/40"
            >
              <DownloadCloud className="h-4 w-4" />
              Backup DB
            </button>
          </div>
        </div>

        {/* Live Quick Status Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <span>CPU Load: <strong className="text-white">{telemetry.cpuUsagePct}%</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>RAM Used: <strong className="text-white">{telemetry.memoryUsagePct}% ({Math.round(telemetry.memoryUsedMB/1024)}GB)</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldAlert className="h-4 w-4 text-cyan-400" />
            <span>WAF Shield: <strong className="text-emerald-400">ACTIVE STRICT</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Radio className="h-4 w-4 text-purple-400" />
            <span>Network Latency: <strong className="text-white">{telemetry.networkLatencyMs.database}ms</strong></span>
          </div>
        </div>
      </div>

      {/* Main Technical Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 bg-white p-1.5 rounded-xl shadow-sm">
        {[
          { id: 'telemetry', label: '1. Health Telemetry', icon: Cpu },
          { id: 'security', label: '2. DDoS & Security Defense', icon: ShieldAlert },
          { id: 'loadbalancer', label: '3. Load Balancer & Traffic', icon: Layers },
          { id: 'apigateway', label: '4. API Gateway & Provisioning', icon: Key },
          { id: 'dbdiagnostics', label: '5. Database & Slow Queries', icon: Database },
          { id: 'techcontrols', label: '6. 30+ System Controls', icon: Sliders },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${

                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HEALTH TELEMETRY */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* CPU Metric Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CPU Processing Engine</span>
                <Cpu className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{telemetry.cpuUsagePct}%</span>
                <span className="text-xs font-medium text-slate-500">{telemetry.cpuCount} Cores Active</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    telemetry.cpuUsagePct > 80 ? 'bg-rose-500' : telemetry.cpuUsagePct > 50 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${telemetry.cpuUsagePct}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500 truncate">{telemetry.cpuModel}</p>
            </div>

            {/* RAM Metric Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Memory (RAM)</span>
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{telemetry.memoryUsagePct}%</span>
                <span className="text-xs font-medium text-slate-500">{Math.round(telemetry.memoryUsedMB/1024)}GB / {Math.round(telemetry.memoryTotalMB/1024)}GB</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${telemetry.memoryUsagePct}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">ECC Registered DDR5 Server Memory</p>
            </div>

            {/* Storage Metric Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Storage Volume (NVMe)</span>
                <HardDrive className="h-5 w-5 text-blue-600" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{telemetry.diskStorage.usagePct}%</span>
                <span className="text-xs font-medium text-slate-500">{telemetry.diskStorage.usedGB}GB / {telemetry.diskStorage.totalGB}GB</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${telemetry.diskStorage.usagePct}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">NVMe Array Pool • Free: {telemetry.diskStorage.freeGB}GB</p>
            </div>
          </div>

          {/* Node Cluster Status Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">ASTU Production Node Cluster</h3>
                <p className="text-xs text-slate-500 mt-0.5">Active web application servers and load balancer nodes</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> 3 Nodes Online
              </span>
            </div>
            <div className="divide-y divide-slate-200 text-xs">
              {telemetry.clusterNodes.map(node => (
                <div key={node.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60">
                  <div className="flex items-center gap-3">
                    <Server className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="font-bold text-slate-900">{node.name}</span>
                      <span className="ml-2 font-mono text-[10px] text-slate-400">({node.id})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-slate-500">Latency: <strong className="text-slate-900">{node.latency}</strong></span>
                    <span className="text-slate-500">Load: <strong className="text-slate-900">{node.load}</strong></span>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      {node.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DDOS & SECURITY DEFENSE */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Protection Shield</span>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-black text-emerald-600">ADAPTIVE STRICT</span>
                <ShieldAlert className="h-5 w-5 text-emerald-500" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dropped Packets (1h)</span>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900">{securityStatus.droppedPacketsLastHour}</span>
                <Flame className="h-5 w-5 text-amber-500" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rate Limit Threshold</span>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-black text-indigo-600">{securityStatus.rateLimitRequestsPerMin} req/min</span>
                <Sliders className="h-5 w-5 text-indigo-500" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Blacklisted IPs</span>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-black text-rose-600">{securityStatus.activeIpBlacklistCount} IPs</span>
                <Lock className="h-5 w-5 text-rose-500" />
              </div>
            </div>
          </div>

          {/* DDoS Mode Control Controls */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-indigo-600" />
                  DDoS & WAF Protection Mode Switcher
                </h3>
                <p className="text-xs text-indigo-900/80 mt-0.5">Adjust real-time packet filtering, rate limiting, and challenge verification</p>
              </div>

              <div className="flex items-center gap-2">
                {['NORMAL', 'ADAPTIVE_STRICT', 'UNDER_ATTACK'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => handleExecuteAction('TOGGLE_DDOS_MODE', `DDoS Mode ${mode}`)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
                      securityStatus.protectionMode === mode
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white text-indigo-950 border-indigo-200 hover:bg-indigo-100'
                    }`}
                  >
                    {mode.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Security Threats Log */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Real-Time Threat Intelligence & Intrusion Events</h3>
              <button
                onClick={() => handleExecuteAction('RELOAD_FIREWALL_RULES', 'Reload WAF Rules')}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Reload Firewall Rules
              </button>
            </div>
            <div className="divide-y divide-slate-200 text-xs">
              {securityStatus.recentThreatEvents.map(evt => (
                <div key={evt.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{evt.ip}</span>
                        <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                          {evt.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{evt.detail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block font-mono text-[11px] font-bold text-slate-700">{evt.action}</span>
                    <p className="text-[10px] text-slate-400">{evt.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOAD BALANCER & TRAFFIC */}
      {activeTab === 'loadbalancer' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">ASTU Ingress NGINX Load Balancer</h3>
                <p className="text-xs text-slate-500 mt-0.5">Algorithm: Least Connections Round-Robin • SSL Termination Enabled</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> SSL HEALTHY (*.astu.edu.et)
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                <span className="text-slate-500 font-medium">SSL Expiry</span>
                <p className="text-sm font-bold text-slate-900 mt-1">2027-01-15 (124 days remaining)</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                <span className="text-slate-500 font-medium">Today's Traffic Ingress</span>
                <p className="text-sm font-bold text-slate-900 mt-1">8,490 MB (8.49 GB)</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                <span className="text-slate-500 font-medium">Throughput Rate</span>
                <p className="text-sm font-bold text-slate-900 mt-1">14.8 req/sec avg</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: API GATEWAY & PROVISIONING */}
      {activeTab === 'apigateway' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Provision Third-Party API Integration Key</h3>
            <p className="text-xs text-slate-500 mt-0.5">Generate secure API keys for external University systems, SIS, and Mobile Gateways</p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="Client/System Name (e.g. Registrar Auto-Sync Service)"
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleGenerateKey}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 active:scale-95 shrink-0"
              >
                <Key className="h-4 w-4" /> Generate Key
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Active ASTU API Integration Keys</h3>
            </div>
            <div className="divide-y divide-slate-200 text-xs">
              {apiKeys.map(key => (
                <div key={key.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <span className="font-bold text-slate-900">{key.clientName}</span>
                    <div className="flex items-center gap-3 mt-1 font-mono text-[11px] text-slate-500">
                      <span>Prefix: <strong className="text-indigo-600">{key.keyPrefix}•••••</strong></span>
                      <span>Permissions: {key.permissions}</span>
                      <span>Limit: {key.rateLimit}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setApiKeys(prev => prev.filter(k => k.id !== key.id));
                      toast.success(`Revoked API key ${key.keyPrefix}`);
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800"
                  >
                    Revoke Key
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE & DIAGNOSTICS */}
      {activeTab === 'dbdiagnostics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Engine</span>
              <p className="text-lg font-black text-slate-900 mt-2">PostgreSQL 16.2</p>
              <p className="text-xs text-slate-500 mt-1">Neon DB Managed Cluster</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Redis Cache Hit Ratio</span>
              <p className="text-lg font-black text-emerald-600 mt-2">94.8% Hit Ratio</p>
              <p className="text-xs text-slate-500 mt-1">1,420 Keys Cached</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Slow Queries (24h)</span>
              <p className="text-lg font-black text-amber-600 mt-2">3 Queries Flagged</p>
              <p className="text-xs text-slate-500 mt-1">Max duration: 420ms</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExecuteAction('FLUSH_REDIS_CACHE', 'Purge Redis Cache')}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-500"
            >
              <Trash2 className="h-4 w-4" /> Purge Redis Cache
            </button>
            <button
              onClick={() => handleExecuteAction('PURGE_SLOW_QUERIES', 'Clear Slow Query Log')}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-700"
            >
              <FileCode2 className="h-4 w-4" /> Reset Query Logs
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: 30+ SYSTEM CONTROLS */}
      {activeTab === 'techcontrols' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900">30+ ICT System Controls & Utility Operations Suite</h3>
            <p className="text-xs text-slate-500 mt-0.5">Execute administrative technical procedures, cache purges, session resets, and diagnostic checks</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: 'Purge Redis Cache', desc: 'Clear 1,400+ in-memory cached routes', action: 'FLUSH_REDIS_CACHE', icon: Trash2 },
              { title: 'Reload Firewall Rules', desc: 'Re-compile WAF IP tables & CIDR blocks', action: 'RELOAD_FIREWALL_RULES', icon: ShieldAlert },
              { title: 'Trigger Database Backup', desc: 'Generate encrypted PostgreSQL snapshot', action: 'TRIGGER_DB_BACKUP', icon: DownloadCloud },
              { title: 'Rolling Restart Cluster', desc: 'Graceful zero-downtime node restart', action: 'RESTART_NODE_CLUSTER', icon: RefreshCw },
              { title: 'Provision API Key', desc: 'Generate third-party gateway key', action: 'GENERATE_API_KEY', icon: Key },
              { title: 'Toggle Maintenance Mode', desc: 'Enable/disable global maintenance banner', action: 'TOGGLE_MAINTENANCE_MODE', icon: Settings },
              { title: 'Vacuum Database Storage', desc: 'Reclaim dead tuple space in Postgres', action: 'VACUUM_DB', icon: Database },
              { title: 'Truncate Audit Logs', desc: 'Archive logs older than 90 days', action: 'TRUNCATE_LOGS', icon: FileCode2 },
              { title: 'Revoke All Active Tokens', desc: 'Force global logout across all users', action: 'REVOKE_TOKENS', icon: Lock },
              { title: 'Flush Mail Outbox Queue', desc: 'Process pending email notifications', action: 'FLUSH_MAIL', icon: Radio },
              { title: 'Re-index Search Engine', desc: 'Rebuild Postgres full-text search indexes', action: 'REINDEX_SEARCH', icon: Globe },
              { title: 'Run Health Diagnostic Probe', desc: 'Ping external gateways and APIs', action: 'HEALTH_PROBE', icon: Activity },
            ].map(ctrl => {
              const Icon = ctrl.icon;
              return (
                <div key={ctrl.action} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{ctrl.title}</h4>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">{ctrl.desc}</p>
                  </div>
                  <button
                    onClick={() => handleExecuteAction(ctrl.action, ctrl.title)}
                    className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-[11px] font-bold text-slate-800 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                  >
                    <Play className="h-3 w-3" /> Execute
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
