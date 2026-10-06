import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Database,
  Layers,
  Timer,
  TriangleAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import IctPageHeader from '../components/IctPageHeader';
import IctMetricCard from '../components/IctMetricCard';
import IctSection from '../components/IctSection';
import IctStatusBadge from '../components/IctStatusBadge';
import IctTabs, { IctTabItem } from '../components/IctTabs';
import IctEmptyState from '../components/IctEmptyState';
import IctCodeBlock from '../components/IctCodeBlock';
import IctModal from '../components/IctModal';
import { IctMeter } from '../components/IctHealthIndicator';
import { ictBtnPrimary, ictBtnSecondary, ictBtnXs } from '../components/ictUi';

interface Span {
  layer: string;
  duration: string;
  pct: number;
  color: string;
  isBottleneck?: boolean;
}

interface Trace {
  id: string;
  endpoint: string;
  user: string;
  totalDuration: string;
  status: string;
  timestamp: string;
  spans: Span[];
}

const traces: Trace[] = [
  {
    id: 'REQ-8F21A',
    endpoint: 'GET /api/alumni/dashboard',
    user: 'Abebe Kebede (Alumni)',
    totalDuration: '3.2s',
    status: '200 OK',
    timestamp: '2 mins ago',
    spans: [
      { layer: 'Frontend React Client', duration: '120ms', pct: 3.7, color: 'bg-blue-500' },
      { layer: 'API Gateway', duration: '180ms', pct: 5.6, color: 'bg-violet-500' },
      { layer: 'Auth Middleware', duration: '210ms', pct: 6.5, color: 'bg-amber-500' },
      { layer: 'Alumni Service Layer', duration: '90ms', pct: 2.8, color: 'bg-emerald-500' },
      { layer: 'Prisma ORM Binding', duration: '80ms', pct: 2.5, color: 'bg-cyan-500' },
      { layer: 'PostgreSQL Database Query', duration: '2,520ms', pct: 78.9, color: 'bg-rose-500', isBottleneck: true },
    ],
  },
  {
    id: 'REQ-9102B',
    endpoint: 'POST /api/auth/login',
    user: 'Tolosa Abebe Badho (Super Admin)',
    totalDuration: '142ms',
    status: '200 OK',
    timestamp: '5 mins ago',
    spans: [
      { layer: 'Frontend React Client', duration: '10ms', pct: 7, color: 'bg-blue-500' },
      { layer: 'API Gateway', duration: '22ms', pct: 15, color: 'bg-violet-500' },
      { layer: 'Bcrypt Hash Verification', duration: '95ms', pct: 67, color: 'bg-amber-500' },
      { layer: 'PostgreSQL Database Query', duration: '15ms', pct: 11, color: 'bg-emerald-500' },
    ],
  },
];

const slowQueries = [
  { query: 'SELECT * FROM "AlumniProfile" WHERE "fullName" ILIKE \'%Abebe%\' ORDER BY "graduationYear" DESC;', duration: '2,520ms', calls: 142, impact: 'HIGH' as const },
  { query: 'SELECT "id", "role", COUNT(*) FROM "User" GROUP BY "role";', duration: '480ms', calls: 320, impact: 'MEDIUM' as const },
  { query: 'SELECT * FROM "TracerSurvey" WHERE "dueDate" < NOW() AND "status" = \'ACTIVE\';', duration: '310ms', calls: 88, impact: 'LOW' as const },
];

export default function IctObservabilityPage() {
  const [selectedTrace, setSelectedTrace] = useState<string>(traces[0]?.id ?? '');
  const [explainQuery, setExplainQuery] = useState<string | null>(null);

  const currentTrace = traces.find((t) => t.id === selectedTrace);

  const traceTabs: IctTabItem<string>[] = traces.map((t) => ({
    key: t.id,
    label: t.id,
    dot: t.id === 'REQ-8F21A' ? 'warning' : 'none',
  }));

  return (
    <div className="space-y-4 lg:space-y-5">
      <IctPageHeader
        icon={Activity}
        title="Observability & Traces"
        description="Request waterfalls, latency percentiles and distributed tracing."
        meta={
          <>
            <IctStatusBadge status="info" label="P95 · 183ms" showDot={false} />
            <span className="ict-label">{traces.length} traces sampled</span>
          </>
        }
      />

      {/* Latency & capacity KPIs */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <IctMetricCard
          label="P50 latency"
          value="42ms"
          icon={Timer}
          tone="success"
          hint="Median response"
          meter={<IctMeter value={42} max={300} tone="success" label="P50 latency 42 milliseconds" />}
        />
        <IctMetricCard
          label="P95 latency"
          value="183ms"
          icon={Activity}
          tone="info"
          hint="95% of requests under this"
          meter={<IctMeter value={183} max={300} tone="info" label="P95 latency 183 milliseconds" />}
        />
        <IctMetricCard
          label="P99 latency"
          value="820ms"
          icon={TriangleAlert}
          tone="warning"
          hint="Includes cold queries"
          meter={<IctMeter value={300} max={300} tone="warning" label="P99 latency 820 milliseconds, above the 300 millisecond target" />}
        />
        <IctMetricCard label="DB pool" value="14 / 100" icon={Database} tone="default" hint="Active connections" meter={<IctMeter value={14} tone="info" label="14 of 100 database connections in use" />} />
      </div>

      {/* Trace waterfall */}
      <IctSection
        icon={Layers}
        title="Request Trace Waterfall"
        description="Bottlenecks across Frontend → Gateway → Auth → Services → ORM → PostgreSQL"
        actions={<IctTabs items={traceTabs} value={selectedTrace} onChange={setSelectedTrace} ariaLabel="Available traces" />}
      >
        {!currentTrace ? (
          <IctEmptyState
            icon={Activity}
            title="No traces available"
            description="Distributed traces appear here once request tracing is connected to the API gateway."
          />
        ) : (
          <>
            {/* Trace identity strip */}
            <div className="ict-inset mb-3.5 flex flex-col gap-1.5 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="ict-mono ict-num font-extrabold text-[var(--ict-accent-text)]">{currentTrace.id}</span>
                <IctStatusBadge status="success" label={currentTrace.status} showDot={false} />
              </div>
              <p className="ict-mono ict-num text-[13px] font-bold text-[var(--text-primary)] ">
                {currentTrace.endpoint}
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[10.5px] text-[var(--text-muted)]">
                <span>
                  User <strong className="text-[var(--text-secondary)] ">{currentTrace.user}</strong>
                </span>
                <span>
                  Total{' '}
                  <strong className="ict-mono text-[var(--ict-warn)]">{currentTrace.totalDuration}</strong>
                </span>
                <span>{currentTrace.timestamp}</span>
              </div>
            </div>

            {/* Spans */}
            <div className="space-y-2.5">
              {currentTrace.spans.map((span) => (
                <div key={span.layer}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-[11px] font-bold text-[var(--text-primary)] ">
                      {span.isBottleneck && <TriangleAlert className="h-3 w-3 shrink-0 text-[var(--ict-crit)]" aria-hidden />}
                      <span className="ict-clamp-1">{span.layer}</span>
                      {span.isBottleneck && <IctStatusBadge status="critical" label="BOTTLENECK" size="xs" />}
                    </span>
                    <span className="ict-mono ict-num shrink-0 text-[11px] text-[var(--text-muted)]">
                      {span.duration} · {span.pct}%
                    </span>
                  </div>
                  <div
                    className="ict-meter-track"
                    role="meter"
                    aria-valuenow={Math.round(span.pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${span.layer} consumed ${span.pct} percent of the request`}
                  >
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${span.color}`}
                      style={{ width: `${Math.max(span.pct, 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </IctSection>

      {/* Slow queries */}
      <IctSection
        icon={Database}
        title="Slow Query Inspector"
        description="High-impact PostgreSQL queries by duration and call volume"
        actions={
          <button type="button" onClick={() => toast.success('Analyzing slow query log…')} className={ictBtnPrimary}>
            Explain Queries
          </button>
        }
        bodyClassName="space-y-2"
      >
        {slowQueries.length === 0 ? (
          <IctEmptyState
            icon={Database}
            tone="success"
            title="No slow queries detected"
            description="Every statement in the current window is inside the configured statement timeout."
          />
        ) : (
          slowQueries.map((q) => (
            <article key={q.query} className="ict-tile overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5">
                <IctStatusBadge status={q.impact.toLowerCase()} label={`${q.impact} IMPACT`} size="xs" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="ict-mono ict-num text-[11px] font-extrabold text-[var(--text-primary)] ">
                    {q.duration}
                  </span>
                  <span className="text-[10.5px] text-[var(--text-muted)]">{q.calls} executions today</span>
                  <button type="button" onClick={() => setExplainQuery(q.query)} className={ictBtnXs}>
                    Inspect
                  </button>
                </div>
              </div>
              <IctCodeBlock
                language="SQL"
                copyable
                maxHeight="9rem"
                code={q.query}
                className="rounded-none border-0 border-t"
              />
            </article>
          ))
        )}
      </IctSection>

      {/* Query inspector */}
      <IctModal
        isOpen={Boolean(explainQuery)}
        onClose={() => setExplainQuery(null)}
        width="lg"
        icon={<Database className="h-3.5 w-3.5" aria-hidden />}
        title="Query inspector"
        description="Slow statement recorded by the PostgreSQL query inspector"
        footer={
          <>
            <button type="button" onClick={() => setExplainQuery(null)} className={ictBtnSecondary}>
              Close
            </button>
            <button type="button" onClick={() => toast.success('Index recommendation queued for review')} className={ictBtnPrimary}>
              Recommend index
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          </>
        }
      >
        {explainQuery && (
          <div className="space-y-3">
            <IctCodeBlock language="SQL" code={explainQuery} maxHeight="14rem" />
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              Duration, call volume and impact are taken from the sampled slow-query log for this workspace. No live
              execution plan is attached to the ASTU-AMS observability API yet.
            </p>
          </div>
        )}
      </IctModal>
    </div>
  );
}
