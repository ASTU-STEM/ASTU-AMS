import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  Layers,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function IctFeatureFlagsPage() {
  const [environment, setEnvironment] = useState<'Production' | 'Staging' | 'Sandbox'>('Production');

  const [features, setFeatures] = useState([
    { id: 'f-1', name: 'ASTU AI & Assistant', enabled: true, rolloutPct: 100, target: 'All Users' },
    { id: 'f-2', name: 'AI Job Matching Engine', enabled: true, rolloutPct: 25, target: '25% of Alumni' },
    { id: 'f-3', name: 'Employer Talent Pipeline', enabled: true, rolloutPct: 100, target: 'All Employers' },
    { id: 'f-4', name: 'Tracer Study Multi-Channel Notifications', enabled: true, rolloutPct: 100, target: 'All Batches' },
    { id: 'f-5', name: 'SMS Mobile 2FA Verification', enabled: false, rolloutPct: 0, target: 'Disabled' },
    { id: 'f-6', name: 'Experimental AI Root Cause Agent', enabled: true, rolloutPct: 10, target: '10% of Admins' },
  ]);

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
    toast.success('Feature toggle updated in real-time');
  };

  const updateRollout = (id: string, pct: number) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, rolloutPct: pct } : f))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Feature Flags, Sandbox &amp; Release Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Toggle platform features without redeploying code, configure percentage rollouts, and manage releases.
          </p>
        </div>

        {/* Environment Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
          {(['Production', 'Staging', 'Sandbox'] as const).map((env) => (
            <button
              key={env}
              type="button"
              onClick={() => {
                setEnvironment(env);
                toast.success(`Switched active workspace to ${env} mode`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                environment === env
                  ? env === 'Production'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : env === 'Staging'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Flag List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Feature Flag Control Center ({environment} Environment)
            </h2>
          </div>
          <span className="text-xs text-slate-500">Live Config Engine</span>
        </div>

        <div className="space-y-4">
          {features.map((f) => (
            <div
              key={f.id}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{f.name}</h3>
                  <p className="text-[11px] text-slate-500">Targeting: {f.target}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {f.enabled ? `${f.rolloutPct}% ROLLOUT` : 'DISABLED'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFeature(f.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      f.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        f.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {f.enabled && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Rollout Percentage</span>
                    <span>{f.rolloutPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={f.rolloutPct}
                    onChange={(e) => updateRollout(f.id, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Release & Rollback Control */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-bold text-emerald-600">CURRENT LIVE RELEASE: v2.8.1</span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              Deployment Release &amp; One-Click Rollback
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Previous stable release: <strong>v2.8.0</strong> (Deployed 3 days ago). All database migrations verified.
            </p>
          </div>

          <button
            type="button"
            onClick={() => toast.success('Rolled back release v2.8.1 -> v2.8.0 successfully')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 shadow-md cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Rollback to v2.8.0
          </button>
        </div>
      </div>
    </div>
  );
}
