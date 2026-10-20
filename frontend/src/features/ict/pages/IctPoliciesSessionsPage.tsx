import React, { useState } from 'react';
import {
  Flame,
  Key,
  Lock,
  LogOut,
  Megaphone,
  Radio,
  Shield,
  ShieldAlert,
  Sliders,
  UserX,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function IctPoliciesSessionsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);

  const [sessions, setSessions] = useState<
    { id: string; user: string; ip: string; device: string; status: string }[]
  >([]);

  const handlePublishBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setActiveBroadcast(broadcastMessage.trim());
    toast.success('System Emergency Broadcast Published across all portals!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Security Policies, Active Sessions &amp; Emergency Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized policy governance, active session revocation, emergency broadcast, and maintenance mode controls.
          </p>
        </div>
      </div>

      {/* Red Button Emergency Center */}
      <div className="rounded-2xl border border-rose-500/30 bg-slate-900 p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm uppercase tracking-wider">
          <Flame className="w-5 h-5 animate-pulse" />
          <span>🚨 RED BUTTON EMERGENCY CONTROL PANEL</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              setMaintenanceMode((prev) => !prev);
              toast.success(`Maintenance Mode ${!maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              maintenanceMode
                ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <div className="text-xs font-bold uppercase">Maintenance Mode</div>
            <div className="text-[11px] mt-1 opacity-80">
              {maintenanceMode ? 'ACTIVE - Site Locked' : 'OFF - Standard Operation'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSessions([]);
              toast.success('All administrative and user sessions terminated!');
            }}
            className="p-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-left hover:bg-rose-950/60 hover:border-rose-700 hover:text-white transition-all cursor-pointer"
          >
            <div className="text-xs font-bold uppercase">Revoke All Admin Sessions</div>
            <div className="text-[11px] mt-1 text-slate-400">Force immediate log out</div>
          </button>

          <button
            type="button"
            onClick={() => toast.success('Suspicious traffic IP ranges blocked automatically')}
            className="p-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-left hover:bg-rose-950/60 hover:border-rose-700 hover:text-white transition-all cursor-pointer"
          >
            <div className="text-xs font-bold uppercase">Block Suspicious Traffic</div>
            <div className="text-[11px] mt-1 text-slate-400">Apply emergency IP shield</div>
          </button>
        </div>
      </div>

      {/* Emergency Broadcast System */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            System-Wide Emergency Broadcast Generator
          </h2>
        </div>

        <form onSubmit={handlePublishBroadcast} className="space-y-3">
          <input
            type="text"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="e.g. 🚨 ASTU-AMS scheduled database maintenance tonight 11:00 PM – 11:30 PM."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <div className="flex items-center justify-between">
            {activeBroadcast ? (
              <span className="text-xs text-emerald-600 font-bold">
                Active Broadcast: "{activeBroadcast}"
              </span>
            ) : (
              <span className="text-xs text-slate-400">No active global broadcast</span>
            )}

            <div className="flex gap-2">
              {activeBroadcast && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveBroadcast(null);
                    toast.success('Broadcast cleared');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer"
              >
                Publish Broadcast
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Active Sessions Manager */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Active Administrative Sessions ({sessions.length})
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{sess.user}</span>
                <p className="text-[11px] text-slate-500 font-mono">{sess.device} | IP: {sess.ip}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{sess.status}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSessions((prev) => prev.filter((s) => s.id !== sess.id));
                    toast.success(`Revoked session for ${sess.user}`);
                  }}
                  className="px-3 py-1 rounded-lg bg-rose-100 text-rose-700 text-xs font-bold hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-300 cursor-pointer"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
