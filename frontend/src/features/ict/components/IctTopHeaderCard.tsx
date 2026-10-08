import React, { useEffect, useState } from 'react';
import api from '../../../services/api';

interface IctTopHeaderCardProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  statusText?: string;
  actionButton?: React.ReactNode;
}

export const IctTopHeaderCard: React.FC<IctTopHeaderCardProps> = ({
  title,
  subtitle,
  badgeText = 'ASTU-AMS SYSTEM STATUS',
  statusText = 'Live Monitoring',
  actionButton,
}) => {
  const [telemetry, setTelemetry] = useState<{
    healthScore: number;
    activeUsers: number;
    requestsPerMin: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const res = await api.get<{ success: boolean; data: any }>('/admin/technical-ops/telemetry');
        const telemetryObj = res.data?.data || res.data;
        if (telemetryObj && isMounted) {
          setTelemetry({
            healthScore: typeof telemetryObj.healthScore === 'number' ? telemetryObj.healthScore : 100,
            activeUsers: telemetryObj.activeUsers ?? 0,
            requestsPerMin: telemetryObj.requestsPerMin ?? 0,
          });
        }
      } catch {
        // Handle fetch error
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#003580] to-slate-900 p-6 text-white shadow-lg border border-blue-500/20">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest">
              {badgeText}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {statusText}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1 text-xs text-blue-200/80 max-w-2xl">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          {actionButton}

          <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/10 backdrop-blur-xs min-w-[240px]">
            {loading || !telemetry ? (
              <div className="flex items-center gap-4 w-full animate-pulse">
                <div className="text-center flex-1">
                  <div className="h-7 w-16 bg-white/20 rounded mx-auto mb-1" />
                  <div className="h-3 w-16 bg-white/10 rounded mx-auto" />
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 bg-white/20 rounded" />
                  <div className="h-3 w-24 bg-white/20 rounded" />
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">{telemetry.healthScore}%</div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300 mt-0.5">HEALTH SCORE</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Active Users:</span>
                    <span className="font-bold text-white">{telemetry.activeUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Requests/min:</span>
                    <span className="font-bold text-white">{telemetry.requestsPerMin.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
