import React, { useState } from 'react';
import {
  Activity,
  Clock,
  Database,
  Layers,
  Search,
  Server,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function IctObservabilityPage() {
  const [selectedTrace, setSelectedTrace] = useState<string>('');

  const traces: {
    id: string;
    endpoint: string;
    user: string;
    totalDuration: string;
    status: string;
    timestamp: string;
    spans: { layer: string; duration: string; pct: number; color: string; isBottleneck?: boolean }[];
  }[] = [];

  const slowQueries: { query: string; duration: string; calls: number; impact: string }[] = [];

  const currentTrace = traces.find((t) => t.id === selectedTrace) || traces[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Real-Time Observability &amp; Distributed Tracing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            End-to-end request waterfall traces, P50/P95/P99 latency metrics, and database slow query diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            Latency P95: —
          </span>
        </div>
      </div>

      {/* Latency Percentiles Cards */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {[
          { label: 'P50 Latency (Median)', value: '—', note: 'No live percentile data' },
          { label: 'P95 Latency (95th %)', value: '—', note: 'No live percentile data' },
          { label: 'P99 Latency (Tail)', value: '—', note: 'No live percentile data' },
          { label: 'Active DB Pool', value: '—', note: 'Pool metrics not instrumented' },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{m.label}</span>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{m.value}</p>
            <p className="mt-1 text-xs text-slate-500 font-medium">{m.note}</p>
          </div>
        ))}
      </div>

      {/* Distributed Tracing Waterfall */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Distributed Request Tracing Waterfall
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pinpoint exact bottlenecks across Frontend, Auth, Services, ORM, and PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {traces.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTrace(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedTrace === t.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {t.id}
              </button>
            ))}
          </div>
        </div>

        {!currentTrace ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-800/40">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No request traces available</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Distributed tracing data will appear here once instrumentation is collecting live spans.
            </p>
          </div>
        ) : (
          <>
            {/* Selected Trace Header */}
            <div className="rounded-xl bg-slate-900 p-4 text-white mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400">{currentTrace.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentTrace.status}
                </span>
              </div>
              <p className="text-base font-mono font-bold text-white">{currentTrace.endpoint}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-300">
                <span>User: <strong>{currentTrace.user}</strong></span>
                <span>Total Time: <strong className="text-amber-400">{currentTrace.totalDuration}</strong></span>
                <span>Time: <strong>{currentTrace.timestamp}</strong></span>
              </div>
            </div>

            {/* Waterfall Visualizer */}
            <div className="space-y-3">
              {(currentTrace.spans ?? []).map((span, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-2">
                      {span.layer}
                      {span.isBottleneck && (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold bg-rose-100 text-rose-700 rounded dark:bg-rose-950/60 dark:text-rose-300">
                          ⚠ BOTTLENECK ({span.duration})
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{span.duration} ({span.pct}%)</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${span.color} transition-all duration-500`}
                      style={{ width: `${Math.max(span.pct, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Database Slow Query Inspector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Database Slow Query Inspector
            </h2>
          </div>
          <button
            type="button"
            onClick={() => toast.success('Analyzing slow query log...')}
            className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
          >
            Explain Queries
          </button>
        </div>

        <div className="space-y-3">
          {slowQueries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-800/40">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No slow queries recorded</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                High-latency database statements will show up here when query logging is enabled.
              </p>
            </div>
          ) : (
            slowQueries.map((q, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300">
                    {q.impact} IMPACT ({q.duration})
                  </span>
                  <span className="text-xs font-medium text-slate-500">{q.calls} executions today</span>
                </div>
                <code className="block text-xs font-mono bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto">
                  {q.query}
                </code>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
