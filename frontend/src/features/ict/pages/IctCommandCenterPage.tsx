import React, { useState, useEffect } from 'react';
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

import api from '../../../services/api';
import { IctTopHeaderCard } from '../components/IctTopHeaderCard';

export default function IctCommandCenterPage() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTelemetryData();
  }, []);

  const fetchTelemetryData = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: any }>('/admin/technical-ops/telemetry');
      const telemetryObj = res.data?.data || res.data;
      if (telemetryObj) {
        setTelemetry(telemetryObj);
      }
    } catch (err) {
      console.error('Failed to fetch command center telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const isInitialLoading = loading && !telemetry;
  const servicesStatus = telemetry?.servicesStatus || [];
  const attentionAlerts = telemetry?.attentionAlerts || [];

  const requestsVal = (telemetry?.requestsPerMin ?? 0).toLocaleString();
  const errorsVal = (telemetry?.errorsPerMin ?? 0).toLocaleString();
  const errorRateStr = `${telemetry?.errorRatePct ?? 0}% error rate`;
  const cpuLoadVal = `${telemetry?.cpuUsagePct ?? 0}%`;
  const cpuCoresStr = telemetry?.cpuModel || 'CPU Hardware Engine';
  const ramUsageVal = `${telemetry?.memoryUsagePct ?? 0}%`;
  const ramFormattedStr = telemetry?.ramUsageFormatted || 'System Memory';

  return (
    <div className="space-y-6">
      {/* Top ICT Command Center Header Card */}
      <IctTopHeaderCard
        title="ICT Command Center"
        subtitle="Real-time institutional health matrix, infrastructure diagnostics, and critical alert governance."
      />

      {/* Top Stat Cards Section */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {isInitialLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 animate-pulse space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
            ))
          : [
              { label: 'REQUESTS / MIN', value: requestsVal, note: 'Stable', icon: Activity, tone: 'text-blue-600 dark:text-blue-400' },
              { label: 'ERRORS / MIN', value: errorsVal, note: errorRateStr, icon: ShieldAlert, tone: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'CPU ENGINE LOAD', value: cpuLoadVal, note: cpuCoresStr, icon: Cpu, tone: 'text-blue-600 dark:text-blue-400' },
              { label: 'RAM MEMORY USAGE', value: ramUsageVal, note: ramFormattedStr, icon: HardDrive, tone: 'text-purple-600 dark:text-purple-400' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{stat.label}</span>
                    <Icon className={`w-4 h-4 ${stat.tone}`} />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">{stat.note}</p>
                </div>
              );
            })}
      </div>

      {/* Main Grid: Health Matrix (Left) + What Needs Attention (Right) */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* 15 Services Matrix */}
        <div className="xl:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                System Health Matrix ({isInitialLoading ? 'Loading...' : `${servicesStatus.length} Core Services`})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                fetchTelemetryData();
                toast.success('Re-scanned system matrix from database telemetry');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline cursor-pointer dark:text-blue-400"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Re-scan Matrix
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {isInitialLoading
              ? Array.from({ length: 15 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 animate-pulse space-y-2 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-3.5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                ))
              : servicesStatus.map((service: any) => {
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
              {isInitialLoading
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 animate-pulse space-y-2 dark:border-slate-800 dark:bg-slate-800/30"
                    >
                      <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                      </div>
                    </div>
                  ))
                : attentionAlerts.map((alert: any, idx: number) => (
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
                      <div className="mt-2.5 flex items-center justify-between border-t border-black/5 pt-2 dark:border-white/5">
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
    </div>
  );
}

