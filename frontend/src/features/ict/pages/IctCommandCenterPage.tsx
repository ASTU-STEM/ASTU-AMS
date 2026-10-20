import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  HardDrive,
  Info,
  RefreshCw,
  Server,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Telemetry = {
  cpuUsagePct?: number | null;
  cpuCount?: number | null;
  memoryUsagePct?: number | null;
  memoryUsedMB?: number | null;
  memoryTotalMB?: number | null;
  uptimeFormatted?: string | null;
  registeredUsers?: number | null;
  activeSessions?: number | null;
  hostname?: string | null;
  platform?: string | null;
};

const dash = (value: string | number | null | undefined, suffix = '') => {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}${suffix}`;
};

export default function IctCommandCenterPage() {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/technical-ops/telemetry', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTelemetry(data.data);
      } else {
        setTelemetry(null);
      }
    } catch {
      setTelemetry(null);
      toast.error('Unable to load live telemetry');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  const memLabel =
    telemetry?.memoryUsedMB != null && telemetry?.memoryTotalMB != null
      ? `${(telemetry.memoryUsedMB / 1024).toFixed(1)}GB / ${(telemetry.memoryTotalMB / 1024).toFixed(1)}GB`
      : 'Awaiting host metrics';

  const metricCards = [
    {
      label: 'Registered users',
      value: dash(telemetry?.registeredUsers),
      status: 'From database',
      icon: Activity,
      tone: 'text-[#003580] bg-[#003580]/10',
    },
    {
      label: 'Active sessions',
      value: dash(telemetry?.activeSessions),
      status: telemetry?.activeSessions == null ? 'Not instrumented' : 'Live sessions',
      icon: ShieldAlert,
      tone: 'text-slate-600 bg-slate-100',
    },
    {
      label: 'CPU load',
      value: dash(telemetry?.cpuUsagePct, '%'),
      status: telemetry?.cpuCount ? `${telemetry.cpuCount} cores` : 'Host CPU',
      icon: Cpu,
      tone: 'text-[#003580] bg-[#003580]/10',
    },
    {
      label: 'Memory usage',
      value: dash(telemetry?.memoryUsagePct, '%'),
      status: memLabel,
      icon: HardDrive,
      tone: 'text-[#B87900] bg-[#E8A020]/15',
    },
  ];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden border border-[#003580]/20 bg-gradient-to-r from-[#001a41] via-[#003580] to-[#002866] text-white">
        <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">
                ASTU-AMS System Status
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                <span className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${loading ? 'animate-pulse' : ''}`} />
                {loading ? 'Refreshing…' : 'Host telemetry'}
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm text-blue-100/85">
              Live host metrics from the application server. Fabricated service matrices and alert counts have been removed.
            </p>
            {(telemetry?.hostname || telemetry?.platform) && (
              <p className="mt-2 text-[11px] font-medium text-blue-100/70">
                {[telemetry.hostname, telemetry.platform].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>

          <div className="flex items-stretch gap-0 border border-white/10 bg-black/25">
            <div className="px-5 py-3 text-center">
              <div className="text-3xl font-extrabold tracking-tight text-emerald-400">
                {dash(telemetry?.cpuUsagePct, '%')}
              </div>
              <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">CPU Load</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="space-y-2 px-5 py-3 text-xs">
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-400">Uptime</span>
                <span className="font-bold text-white">{dash(telemetry?.uptimeFormatted)}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-400">Memory</span>
                <span className="font-bold text-white">{dash(telemetry?.memoryUsagePct, '%')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{stat.label}</span>
                <span className={`flex h-8 w-8 items-center justify-center ${stat.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{stat.status}</p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-12">
        <section className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 xl:col-span-8">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-[#003580] dark:text-blue-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Service Health Matrix</h2>
                <p className="text-[11px] text-slate-500">No simulated service statuses — connect probes to populate this grid</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                toast.success('Refreshing host telemetry…');
                fetchTelemetry();
              }}
              className="inline-flex items-center gap-1.5 border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#003580] transition hover:bg-white cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <CheckCircle2 className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No service probe data yet</p>
            <p className="max-w-md text-xs text-slate-500">
              Static latency and status rows were removed. This panel will show real integration health once monitoring endpoints are wired.
            </p>
          </div>
        </section>

        <aside className="flex flex-col border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 xl:col-span-4">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">What Needs Attention</h2>
              <p className="text-[11px] text-slate-500">0 open items</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <Info className="h-7 w-7 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No active alerts</p>
            <p className="text-xs text-slate-500">Demo warnings and fake incident banners have been cleared.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
