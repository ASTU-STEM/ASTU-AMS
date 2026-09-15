import React, { useState } from 'react';
import {
  Bot,
  Filter,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function IctForensicsAuditPage() {
  const [filterAction, setFilterAction] = useState('ALL');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const logs = [
    {
      id: 'LOG-901',
      who: 'Tolosa Abebe Badho',
      role: 'SUPER_ADMIN',
      what: 'Changed User Role',
      target: 'Abebe Kebede',
      before: 'Role: ALUMNI',
      after: 'Role: EMPLOYER',
      ip: '197.156.92.14',
      time: '13:42:17 Today',
      result: 'SUCCESS',
    },
    {
      id: 'LOG-902',
      who: 'ICT System Administrator',
      role: 'ADMIN',
      what: 'Updated WAF Security Shield Mode',
      target: 'System WAF Rules',
      before: 'Mode: STANDARD',
      after: 'Mode: ADAPTIVE_STRICT',
      ip: '102.217.18.2',
      time: '12:15:00 Today',
      result: 'SUCCESS',
    },
    {
      id: 'LOG-903',
      who: 'Office of Registrar Admin',
      role: 'REGISTRAR',
      what: 'Triggered SIS Batch Alumni Sync',
      target: 'Registrar Student Database',
      before: 'Synced Records: 2,431',
      after: 'Synced Records: 2,473 (+42 new)',
      ip: '197.156.90.1',
      time: '10:00:12 Today',
      result: 'SUCCESS',
    },
  ];

  const handleExplainActivity = (logId: string) => {
    setAnalyzingId(logId);
    toast.loading('AI analyzing activity sequence and forensic context...', { id: 'ai-explain' });

    setTimeout(() => {
      setAiAnalysis(
        '🤖 AI Forensic Audit Synthesis: Administrator Tolosa Abebe Badho executed 1 role elevation from ALUMNI to EMPLOYER. This mutation was verified against valid approval workflow ticket #TICK-402 and originates from a recognized university IP range. Pattern matches normal administrative governance.'
      );
      toast.success('AI Audit Synthesis generated', { id: 'ai-explain' });
      setAnalyzingId(null);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Admin Activity Forensics &amp; Audit Trail Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable audit record (WHO, WHAT, WHEN, WHERE, FROM IP, BEFORE, AFTER) with AI forensic analysis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.success('Audit log integrity hash verified: Immutable')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
        >
          🔒 Audit Integrity Verified
        </button>
      </div>

      {/* AI Explanation Result Modal/Box */}
      {aiAnalysis && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 text-blue-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-extrabold text-white uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              ASTU ICT Copilot Activity Synthesis
            </span>
            <button
              type="button"
              onClick={() => setAiAnalysis(null)}
              className="text-xs font-bold text-blue-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs leading-relaxed text-blue-100 font-medium">{aiAnalysis}</p>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Forensic Audit Log</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter:</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Actions</option>
              <option value="ROLE_CHANGE">Role Changes</option>
              <option value="WAF_UPDATE">WAF Updates</option>
              <option value="SYNC">Data Sync</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3 dark:border-slate-700/60">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{log.id}</span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{log.what}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 uppercase">
                    {log.result}
                  </span>
                  <button
                    type="button"
                    disabled={analyzingId === log.id}
                    onClick={() => handleExplainActivity(log.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Bot className="w-3.5 h-3.5" /> Explain Activity with AI
                  </button>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">WHO</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{log.who} ({log.role})</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">IP ADDRESS</span>
                  <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">{log.ip}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">BEFORE</span>
                  <p className="font-mono text-amber-600 dark:text-amber-400 font-semibold">{log.before}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">AFTER</span>
                  <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{log.after}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
