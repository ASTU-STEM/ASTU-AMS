import React from 'react';
import { Clock, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface SlaTelemetryProps {
  avgFulfillmentHours?: number;
  adherence24hPercent?: number;
  adherence48hPercent?: number;
  breachCount?: number;
  totalRequests?: number;
}

export const SlaTelemetryCard: React.FC<SlaTelemetryProps> = ({
  avgFulfillmentHours = 31.4,
  adherence24hPercent = 68.2,
  adherence48hPercent = 94.6,
  breachCount = 4,
  totalRequests = 128,
}) => {
  return (
    <div
      data-testid="sla-telemetry-card"
      className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-[var(--text-primary)] shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Document Fulfillment SLA Telemetry</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              University official turnaround threshold: 24–48 hours for transcript & certificate issuance.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            SLA HEALTH: 94.6% ON TRACK
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Avg Fulfillment Time</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[var(--text-primary)]">{avgFulfillmentHours}</span>
            <span className="text-xs text-[var(--text-muted)]">hours</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-400">Target: &lt; 48.0 hours</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">24h Express SLA</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-400">{adherence24hPercent}%</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">Completed same/next day</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">48h Standard SLA</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{adherence48hPercent}%</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">Completed within mandate</p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Active Breaches</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${breachCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {breachCount}
            </span>
            <span className="text-xs text-[var(--text-muted)]">/ {totalRequests} total</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-300">Requires expedited escalation</p>
        </div>
      </div>
    </div>
  );
};
