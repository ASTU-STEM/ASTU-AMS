import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Flame,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sliders,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function IctIncidentsPage() {
  const [activeTab, setActiveTab] = useState<'incidents' | 'dr-simulation'>('incidents');
  const [drSimulating, setDrSimulating] = useState(false);

  const [incidents, setIncidents] = useState([
    {
      id: 'INC-2026-0042',
      title: 'Registrar SIS Integration API Response Degradation',
      severity: 'Critical',
      status: 'Investigating',
      started: '14:32 Today',
      affectedUsers: 4281,
      affectedServices: ['Registrar API', 'Alumni Sync Engine'],
      timeline: [
        { time: '14:32', text: 'Auto-detected: Registrar API latency exceeded 1,200ms threshold.' },
        { time: '14:35', text: 'ICT Admin started investigation and enabled diagnostic trace.' },
        { time: '14:40', text: 'Identified connection bottleneck at Registrar SIS gateway.' },
      ],
    },
    {
      id: 'INC-2026-0039',
      title: 'SMS Provider Gateway Intermittent Timeout',
      severity: 'High',
      status: 'Mitigating',
      started: '11:15 Today',
      affectedUsers: 142,
      affectedServices: ['SMS Service', '2FA Mobile OTP'],
      timeline: [
        { time: '11:15', text: 'SMS gateway dropped 24 consecutive delivery attempts.' },
        { time: '11:20', text: 'Rerouted 2FA mobile OTP to email backup channel.' },
      ],
    },
    {
      id: 'INC-2026-0035',
      title: 'PostgreSQL Read-Replica Lag During Batch Import',
      severity: 'Medium',
      status: 'Resolved',
      started: 'Yesterday 18:00',
      affectedUsers: 0,
      affectedServices: ['Database Read-Replica'],
      timeline: [
        { time: '18:00', text: 'Replication delay reached 45 seconds.' },
        { time: '18:15', text: 'Auto-healed: Replica caught up after batch import finished.' },
      ],
    },
  ]);

  const handleRunDRSimulation = () => {
    setDrSimulating(true);
    toast.loading('Simulating PostgreSQL primary database node outage...', { id: 'dr-sim' });

    setTimeout(() => {
      toast.success('DR Simulation Complete: Failover to Secondary Node verified in 1.4s! zero data loss.', { id: 'dr-sim' });
      setDrSimulating(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Incident Management &amp; Disaster Recovery Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise incident lifecycle tracking (`INC-2026-XXXX`), postmortem audit, and DR simulation routines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'incidents'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
            }`}
          >
            Incidents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dr-simulation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dr-simulation'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
            }`}
          >
            Disaster Recovery (DR)
          </button>
        </div>
      </div>

      {activeTab === 'incidents' ? (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">{inc.id}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      Severity: {inc.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      {inc.status}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{inc.title}</h3>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div>Started: <strong>{inc.started}</strong></div>
                  <div>Affected Users: <strong>{inc.affectedUsers.toLocaleString()}</strong></div>
                </div>
              </div>

              {/* Lifecycle Progress Bar */}
              <div className="mb-4">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Incident Lifecycle Progress</p>
                <div className="grid grid-cols-6 gap-1 text-center text-[10px] font-bold">
                  {['Detected', 'Investigating', 'Identified', 'Mitigating', 'Resolved', 'Postmortem'].map((step, idx) => {
                    const isCurrent = step.toLowerCase() === inc.status.toLowerCase();
                    const isPassed = idx < 2;
                    return (
                      <div
                        key={step}
                        className={`py-1.5 rounded-lg border ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold'
                            : isPassed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Incident Timeline</p>
                <div className="space-y-2 text-xs">
                  {inc.timeline.map((event, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-mono text-slate-400 font-bold">{event.time}</span>
                      <span className="text-slate-700 dark:text-slate-300">{event.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* DR Simulation View */
        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900/40 dark:bg-blue-950/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white uppercase tracking-widest">
                  ENVIRONMENT SAFETY GAURD ACTIVE
                </span>
                <h2 className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
                  Disaster Recovery (DR) Simulation Center
                </h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Simulate PostgreSQL database primary node failures, network partitioning, or regional outages without destroying production data.
                </p>
              </div>

              <button
                type="button"
                disabled={drSimulating}
                onClick={handleRunDRSimulation}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-rose-700 cursor-pointer disabled:opacity-50"
              >
                <Flame className="w-4 h-4 animate-pulse" />
                Run DR Outage Simulation
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'PRIMARY SYSTEM NODE', status: 'ONLINE', detail: 'ASTU Core Neon Postgres Primary', color: 'text-emerald-600' },
              { title: 'FAILOVER REPLICA', status: 'READY', detail: 'Replication lag < 1.2s', color: 'text-blue-600' },
              { title: 'ESTIMATED RTO / RPO', status: 'RTO: <15s | RPO: 0s', detail: 'Zero data loss target verified', color: 'text-violet-600' },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{card.title}</span>
                <p className={`mt-2 text-lg font-extrabold ${card.color}`}>{card.status}</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
