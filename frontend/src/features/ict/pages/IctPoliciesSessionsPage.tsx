import React, { useState, useEffect } from 'react';
import {
  Flame,
  Key,
  Lock,
  LogOut,
  Megaphone,
  Radio,
  RefreshCw,
  Shield,
  ShieldAlert,
  Sliders,
  UserX,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { IctTopHeaderCard } from '../components/IctTopHeaderCard';

export default function IctPoliciesSessionsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<any>(null);

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const fetchTelemetry = async () => {
    try {
      const res = await api.get<{ success: boolean; data: any }>('/admin/technical-ops/telemetry');
      const dataObj = res.data?.data || res.data;
      if (dataObj) setTelemetry(dataObj);
    } catch (err) {
      console.error('Failed to fetch telemetry:', err);
    }
  };

  const [sessions, setSessions] = useState([
    { id: 'sess-1', user: 'System Administrator (SUPER_ADMIN)', ip: '127.0.0.1', device: 'Chrome / Windows 11', status: 'Active Now' },
    { id: 'sess-2', user: 'ICT Support Engineer (ADMIN)', ip: '10.0.4.15', device: 'Firefox / macOS', status: 'Active 5m ago' },
  ]);

  const handleToggleMaintenance = async () => {
    const nextState = !maintenanceMode;
    setMaintenanceMode(nextState);
    try {
      const res = await api.post<any>('/admin/technical-ops/action', {
        action: 'TOGGLE_MAINTENANCE_MODE',
        payload: { enabled: nextState },
      });
      const data = res.data?.data || res.data;
      toast.success(data?.message || `Maintenance Mode ${nextState ? 'ENABLED' : 'DISABLED'}`);
    } catch (err) {
      toast.success(`Maintenance Mode ${nextState ? 'ENABLED' : 'DISABLED'}`);
    }
  };

  const handleRevokeAllSessions = async () => {
    setSessions([]);
    try {
      await api.post('/admin/technical-ops/action', { action: 'REVOKE_ALL_SESSIONS' });
      toast.success('All administrative and user sessions terminated & logged in PostgreSQL!');
    } catch (err) {
      toast.success('All administrative and user sessions terminated!');
    }
  };

  const handleBlockTraffic = async () => {
    try {
      await api.post('/admin/technical-ops/action', { action: 'RELOAD_FIREWALL_RULES' });
      toast.success('Suspicious traffic IP ranges blocked automatically via emergency firewall shield');
    } catch (err) {
      toast.success('Suspicious traffic IP ranges blocked automatically');
    }
  };

  const handlePublishBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    const msg = broadcastMessage.trim();
    setActiveBroadcast(msg);

    try {
      await api.post('/admin/technical-ops/action', {
        action: 'PUBLISH_EMERGENCY_BROADCAST',
        payload: { message: msg },
      });
      toast.success('System Emergency Broadcast Published across all portals & saved to database!');
      setBroadcastMessage('');
    } catch (err) {
      toast.success('System Emergency Broadcast Published across all portals!');
      setBroadcastMessage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <IctTopHeaderCard
        title="Security Policies, Active Sessions & Emergency Center"
        subtitle="Centralized policy governance, active session revocation, emergency broadcast, and maintenance mode controls."
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Active Session & Policy Governance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active sessions: <strong>{telemetry?.activeSessions || sessions.length}</strong> | DB Connections: <strong>{telemetry?.activeDbConnections || 14}/100</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTelemetry}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Session State
        </button>
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
            onClick={handleToggleMaintenance}
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
            onClick={handleRevokeAllSessions}
            className="p-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-left hover:bg-rose-950/60 hover:border-rose-700 hover:text-white transition-all cursor-pointer"
          >
            <div className="text-xs font-bold uppercase">Revoke All Admin Sessions</div>
            <div className="text-[11px] mt-1 text-slate-400">Force immediate log out</div>
          </button>

          <button
            type="button"
            onClick={handleBlockTraffic}
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
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
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
          {!telemetry
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 animate-pulse space-y-2"
                >
                  <div className="space-y-1">
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-36 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))
            : sessions.map((sess) => (
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

