import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  FileSpreadsheet,
  Globe,
  HardDrive,
  Key,
  Layers,
  Lock,
  MessageSquareText,
  RefreshCw,
  Server,
  ShieldAlert,
  Users,
  Wifi,
  XCircle,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function IctCommandCenterPage() {
  const [healthScore] = useState(98.7);

  const servicesStatus = [
    { name: 'API Gateway', status: 'healthy', latency: '18ms', note: '100% operational' },
    { name: 'PostgreSQL Database', status: 'healthy', latency: '3.8ms', note: 'Conn pool 14/100' },
    { name: 'Authentication Service', status: 'healthy', latency: '12ms', note: 'JWT & OAuth active' },
    { name: 'Registrar SIS Integration API', status: 'degraded', latency: '145ms', note: 'Response delay +42%' },
    { name: 'Email Dispatcher', status: 'healthy', latency: '45ms', note: 'SMTP Gateway connected' },
    { name: 'SMS Notification Gateway', status: 'down', latency: 'Timeout', note: 'Provider gateway offline' },
    { name: 'Redis Cache & Queue', status: 'healthy', latency: '0.7ms', note: 'Hit ratio 94.2%' },
    { name: 'NVMe File Storage', status: 'healthy', latency: '5ms', note: '358GB free capacity' },
    { name: 'Frontend React Server', status: 'healthy', latency: '2ms', note: 'Vite edge routing' },
    { name: 'Employer Job Board', status: 'healthy', latency: '14ms', note: 'All jobs indexable' },
    { name: 'Tracer Study Engine', status: 'healthy', latency: '22ms', note: 'Cron triggers scheduled' },
    { name: 'AI Services (Copilot & Matching)', status: 'healthy', latency: '120ms', note: 'LangChain node active' },
    { name: 'Notification Service', status: 'healthy', latency: '10ms', note: 'In-app websockets live' },
    { name: 'Chapa Payment Gateway', status: 'healthy', latency: '95ms', note: 'Webhook listener ready' },
    { name: 'University ERP Connector', status: 'degraded', latency: '210ms', note: 'Sync queue pending' },
  ];

  const attentionAlerts = [
    { type: 'warning', text: 'Registrar API response time increased by 42% over last 30 minutes', action: 'Inspect Traces', link: '/ict/observability' },
    { type: 'error', text: 'SMS Notification Gateway is unreachable (Gateway timeout on Ethio Telecom SMS C)', action: 'View Integrations', link: '/ict/integrations' },
    { type: 'warning', text: 'Database storage reached 78% capacity (NVMe Array Pool 142GB / 500GB used)', action: 'View Storage', link: '/ict/db-diagnostics' },
    { type: 'info', text: 'SSL certificate for *.astu.edu.et expires in 18 days', action: 'Renew Cert', link: '/ict/security' },
    { type: 'warning', text: '5 suspicious login attempts detected from IP 197.156.92.14', action: 'Inspect SOC', link: '/ict/security' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#003580] to-slate-900 p-6 text-white shadow-lg border border-blue-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest">
                ASTU-AMS SYSTEM STATUS
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Monitoring
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight">ICT Command Center</h1>
            <p className="mt-1 text-xs text-blue-200/80">
              Real-time institutional health matrix, infrastructure diagnostics, and critical alert governance.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">{healthScore}%</div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300 mt-0.5">HEALTH SCORE</div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Active Users:</span>
                <span className="font-bold text-white">1,248</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Requests/min:</span>
                <span className="font-bold text-white">2,841</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Health Matrix (Left) + What Needs Attention (Right) */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* 15 Services Matrix */}
        <div className="xl:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                System Health Matrix (15 Core Services)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => toast.success('Re-checking health of all 15 services...')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline cursor-pointer dark:text-blue-400"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-scan Matrix
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {servicesStatus.map((service) => {
              const isHealthy = service.status === 'healthy';
              const isDegraded = service.status === 'degraded';
              const dotColor = isHealthy ? 'bg-emerald-500' : isDegraded ? 'bg-amber-500' : 'bg-rose-500';
              const badgeStyle = isHealthy
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : isDegraded
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';

              return (
                <div
                  key={service.name}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all hover:border-slate-200 hover:bg-white hover:shadow-xs dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate dark:text-white">{service.name}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${badgeStyle}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isHealthy ? 'animate-pulse' : ''}`} />
                      {service.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{service.note}</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{service.latency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What Needs Attention Panel */}
        <div className="xl:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                ⚠ What Needs Attention?
              </h2>
            </div>

            <div className="space-y-3">
              {attentionAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3.5 transition-all ${
                    alert.type === 'error'
                      ? 'border-rose-200 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/20'
                      : alert.type === 'warning'
                      ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20'
                      : 'border-blue-200 bg-blue-50/60 dark:border-blue-900/50 dark:bg-blue-950/20'
                  }`}
                >
                  <p className="text-xs font-medium text-slate-800 leading-snug dark:text-slate-200">{alert.text}</p>
                  <div className="mt-2.5 flex items-center justify-between border-t border-black/5 pt-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Action Required</span>
                    <a
                      href={alert.link}
                      className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {alert.action} →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 font-medium">All attention items synced with AI Root Cause Engine</span>
          </div>
        </div>
      </div>

      {/* Live System Metrics Strip */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Requests / min', value: '2,841', status: 'Stable', icon: Activity, tone: 'text-blue-600' },
          { label: 'Errors / min', value: '7', status: '0.02% error rate', icon: ShieldAlert, tone: 'text-emerald-600' },
          { label: 'CPU Engine Load', value: '43%', status: '16 Cores Xeon', icon: Cpu, tone: 'text-blue-600' },
          { label: 'RAM Memory Usage', value: '61%', status: '19.8GB / 32GB', icon: HardDrive, tone: 'text-violet-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.tone}`} />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500 font-medium">{stat.status}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
