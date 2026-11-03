import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Globe,
  HardDrive,
  Layers,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function IctIntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'integrations' | 'registrar-sync' | 'data-quality'>('integrations');

  const integrations: {
    name: string;
    status: string;
    endpoint: string;
    latency: string;
    failuresToday: number;
  }[] = [];

  const dataQualityItems: { type: string; count: number; fixAction: string }[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Integrations, Data Sync &amp; Data Quality Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized hub for ASTU external integrations, Registrar synchronization, and automated data quality audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['integrations', 'registrar-sync', 'data-quality'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'integrations' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                External Integrations Status
              </h2>
            </div>
            <button
              type="button"
              onClick={() => toast.success('Pinged all 5 integration endpoints')}
              className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
            >
              Ping Endpoints
            </button>
          </div>

          <div className="space-y-3">
            {integrations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No integrations configured</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  External partner endpoints will appear here once integration health probes are connected.
                </p>
              </div>
            ) : (
              integrations.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          item.status === 'HEALTHY'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-slate-500">{item.endpoint}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span>Latency: <strong>{item.latency}</strong></span>
                    <span>Failures: <strong>{item.failuresToday}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'registrar-sync' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">LAST SYNC: Today 14:30</span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  ASTU Registrar SIS Synchronization Center
                </h2>
              </div>

              <button
                type="button"
                onClick={() => toast.success('Registrar SIS Synchronization Started!')}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Trigger Immediate Sync
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 text-center">
              {[
                { label: 'Retrieved', val: '2,431', color: 'text-slate-900 dark:text-white' },
                { label: 'New Alumni', val: '42', color: 'text-emerald-600' },
                { label: 'Updated Profiles', val: '183', color: 'text-blue-600' },
                { label: 'Rejected Records', val: '7', color: 'text-amber-600' },
                { label: 'Failed Items', val: '3', color: 'text-rose-600' },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                  <p className={`text-2xl font-extrabold tracking-tight ${s.color}`}>{s.val}</p>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'data-quality' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400">INSTITUTIONAL METRIC</span>
                <h2 className="text-xl font-extrabold text-emerald-600">
                  94.7% Data Quality Score
                </h2>
              </div>
              <button
                type="button"
                onClick={() => toast.success('Auto-fixing data quality issues...')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md hover:bg-emerald-700 cursor-pointer"
              >
                Execute Auto-Fix Routine
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {dataQualityItems.length === 0 ? (
                <div className="sm:col-span-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-800/40">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No data-quality issues detected</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Duplicate, incomplete, or invalid institutional records will show here when audits run.
                  </p>
                </div>
              ) : (
                dataQualityItems.map((item) => (
                  <div
                    key={item.type}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.type}</h3>
                      <p className="text-xs text-amber-600 font-semibold">{item.count} items detected</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success(`Auto-fixed: ${item.type}`)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer dark:text-blue-400"
                    >
                      {item.fixAction} →
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
