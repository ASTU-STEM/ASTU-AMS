import React, { useState } from 'react';
import {
  Bot,
  Layers,
  Server,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import IctPageHeader from '../components/IctPageHeader';
import IctSection from '../components/IctSection';
import IctStatusBadge from '../components/IctStatusBadge';
import IctKeyValueGrid from '../components/IctKeyValue';
import { ictBtnPrimary, ictInput } from '../components/ictUi';

interface ArchitectureNode {
  id: string;
  name: string;
  type: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latency: string;
  detail: string;
}

const architectureNodes: ArchitectureNode[] = [
  { id: 'node-1', name: 'ASTU-AMS Frontend', type: 'Vite React App', status: 'HEALTHY', latency: '2ms', detail: 'Edge UI delivery & state management' },
  { id: 'node-2', name: 'API Gateway Server', type: 'Express API Server', status: 'HEALTHY', latency: '18ms', detail: 'JWT middleware, rate limiters & router' },
  { id: 'node-3', name: 'ASTU AI Multi-Agent Engine', type: 'LangChain / Graph', status: 'HEALTHY', latency: '120ms', detail: 'Tracer analytics & root cause agent' },
  { id: 'node-4', name: 'Prisma ORM Client', type: 'Database Abstraction', status: 'HEALTHY', latency: '3.8ms', detail: 'Type-safe SQL query generator' },
  { id: 'node-5', name: 'Redis Cache & Queue', type: 'In-Memory Cache', status: 'HEALTHY', latency: '0.7ms', detail: 'Session tokens & async tracer queues' },
  { id: 'node-6', name: 'PostgreSQL Database', type: 'Neon Postgres DB', status: 'HEALTHY', latency: '3.8ms', detail: 'Primary relational data store' },
  { id: 'node-7', name: 'External Integrations Gateway', type: 'SIS / Mail / SMS', status: 'DEGRADED', latency: '145ms', detail: 'Registrar API, SMTP & Ethio Telecom SMS' },
];

const SUGGESTED_PROMPTS = [
  'Why is the system slow?',
  'Show failed API requests',
  'Perform root cause analysis',
];

export default function IctArchitecturePage() {
  const [selectedNode, setSelectedNode] = useState<string | null>('PostgreSQL Database');
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotResponse, setCopilotResponse] = useState<string | null>(
    'Hello ICT Administrator. I am ASTU AI. Ask me questions such as "Why is the system slow?", "Show failed API requests", or "Perform root cause analysis".'
  );
  const [loadingCopilot, setLoadingCopilot] = useState(false);

  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotPrompt.trim()) return;

    setLoadingCopilot(true);
    const userQ = copilotPrompt.trim();
    setCopilotPrompt('');

    setTimeout(() => {
      let ans = `ASTU AI: I analyzed telemetry and traces for "${userQ}". `;
      if (userQ.toLowerCase().includes('slow') || userQ.toLowerCase().includes('latency')) {
        ans += 'The primary latency bottleneck is the Registrar SIS API endpoint (P95 response time 145ms) and a PostgreSQL query on AlumniProfile. Target index recommendation: CREATE INDEX idx_alumni_search ON "AlumniProfile"("fullName", "graduationYear").';
      } else if (userQ.toLowerCase().includes('failed') || userQ.toLowerCase().includes('error')) {
        ans += 'Today there were 7 total 4xx errors (invalid credentials) and 24 failed SMS delivery attempts due to Ethio Telecom SMS Center gateway timeout. Rerouted to email backup.';
      } else {
        ans += 'All 15 core ASTU-AMS services are operating within normal SLA thresholds. Health score is 98.7%. Zero active security breaches detected.';
      }
      setCopilotResponse(ans);
      setLoadingCopilot(false);
    }, 1200);
  };

  const currentNode = architectureNodes.find((n) => n.name === selectedNode);
  const degradedCount = architectureNodes.filter((n) => n.status === 'DEGRADED').length;

  return (
    <div className="space-y-4 lg:space-y-5">
      <IctPageHeader
        icon={Layers}
        title="Architecture & ASTU AI"
        description="Interactive system topology for the ASTU-AMS platform with the built-in diagnostics copilot."
        meta={
          <>
            <IctStatusBadge status="operational" label={`${architectureNodes.length} NODES`} />
            {degradedCount > 0 && <IctStatusBadge status="degraded" label={`${degradedCount} DEGRADED`} />}
          </>
        }
      />

      {/* ── Node map ──────────────────────────────────────────────── */}
      <IctSection
        icon={Server}
        title="System Node Map"
        description="Select a node to inspect its role, health and current latency"
        actions={<IctStatusBadge status="active" label="LIVE TOPOLOGY" size="xs" />}
        bodyClassName="space-y-3"
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {architectureNodes.map((node) => {
            const active = selectedNode === node.name;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNode(node.name)}
                aria-pressed={active}
                className={`ict-card relative overflow-hidden p-3 text-left transition-[border-color,box-shadow] duration-150 ict-focus ${
                  active ? 'ict-bd-accent ict-shadow-sm' : 'ict-hover-accent'
                }`}
              >
                <span
                  className="absolute inset-y-0 left-0 w-[3px]"
                  style={{
                    background:
                      node.status === 'DEGRADED'
                        ? 'var(--ict-warn)'
                        : node.status === 'DOWN'
                          ? 'var(--ict-crit)'
                          : 'var(--ict-ok)',
                  }}
                  aria-hidden
                />
                <span
                  className="absolute inset-0 bg-[var(--ict-accent-soft)]"
                  style={{ opacity: active ? 1 : 0 }}
                  aria-hidden
                />

                <span className="relative block">
                  <span className="flex items-center justify-between gap-2">
                    <span className="ict-clamp-1 text-[9.5px] font-extrabold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                      {node.type}
                    </span>
                    <span className="ict-mono ict-num shrink-0 text-[10px] font-extrabold text-[var(--text-secondary)] ">
                      {node.latency}
                    </span>
                  </span>

                  <span className="ict-clamp-1 mt-1 block text-[12px] font-extrabold text-[var(--text-primary)] ">
                    {node.name}
                  </span>
                  <span className="ict-clamp-2 mt-0.5 block text-[10.5px] text-[var(--text-muted)]">{node.detail}</span>

                  <span className="mt-2 block">
                    <IctStatusBadge status={node.status.toLowerCase()} size="xs" />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {currentNode && (
          <div className="ict-inset ict-rise p-3">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <p className="ict-label">Selected node</p>
              <IctStatusBadge status={currentNode.status.toLowerCase()} size="xs" />
            </div>
            <h3 className="text-[13px] font-extrabold text-[var(--text-primary)] ">{currentNode.name}</h3>
            <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] ">{currentNode.detail}</p>
            <div className="mt-3">
              <IctKeyValueGrid
                columns={3}
                items={[
                  { label: 'Type', value: currentNode.type },
                  { label: 'Latency', value: currentNode.latency, mono: true },
                  { label: 'Node ID', value: currentNode.id, mono: true },
                ]}
              />
            </div>
          </div>
        )}
      </IctSection>

      {/* ── ASTU AI copilot ───────────────────────────────────────── */}
      <section className="ict-card ict-bd-ai overflow-hidden">
        {/* AI header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ict-ai-line)] bg-[var(--ict-ai-bg)] px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="ict-bg-ai inline-flex h-7 w-7 items-center justify-center rounded-[5px] text-[var(--ict-ai)]">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-[13px] font-extrabold tracking-tight text-[var(--text-primary)] ">
                ASTU AI Diagnostics Copilot
              </h2>
              <p className="text-[10.5px] text-[var(--text-muted)]">
                Root-cause assistance over the platform topology
              </p>
            </div>
          </div>
          <IctStatusBadge status="ai" label="ASTU AI" />
        </div>

        {/* Conversation area */}
        <div className="space-y-2.5 p-3.5">
          {copilotResponse && (
            <div className="flex items-start gap-2.5">
              <span className="ict-bg-ai inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--ict-ai)]">
                <Bot className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div className="ict-inset max-w-3xl p-3 text-[11.5px] leading-relaxed text-[var(--text-secondary)] ">
                {copilotResponse}
              </div>
            </div>
          )}

          {loadingCopilot && (
            <div className="flex items-center gap-2.5" aria-live="polite">
              <span className="ict-bg-ai inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--ict-ai)]">
                <Bot className="h-3.5 w-3.5 ict-pulse" aria-hidden />
              </span>
              <div className="ict-inset flex items-center gap-2 px-3 py-2">
                <span className="flex gap-1" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[var(--ict-ai)]/60"
                      style={{ animation: `ict-pulse 1.2s ease-in-out ${i * 0.18}s infinite` }}
                    />
                  ))}
                </span>
                <span className="text-[11px] font-semibold text-[var(--text-muted)]">Analysing telemetry…</span>
              </div>
            </div>
          )}

          {/* Suggested actions */}
          {!loadingCopilot && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="ict-label">Suggested</span>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setCopilotPrompt(prompt)}
                  className="ict-bd-ai ict-bg-ai rounded-full border px-2.5 py-1 text-[10.5px] font-bold text-[var(--ict-ai)] transition-colors duration-150 ict-focus"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prompt area */}
        <form onSubmit={handleCopilotSubmit} className="flex flex-col gap-2 border-t border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] p-3 sm:flex-row ">
          <label htmlFor="astu-ai-prompt" className="sr-only">
            Ask ASTU AI a diagnostics question
          </label>
          <input
            id="astu-ai-prompt"
            type="text"
            value={copilotPrompt}
            onChange={(e) => setCopilotPrompt(e.target.value)}
            placeholder="Ask ASTU AI (e.g. 'Why is the system slow?', 'Show failed API calls', 'Perform root cause analysis')…"
            className={ictInput}
          />
          <button type="submit" disabled={loadingCopilot} className={`${ictBtnPrimary} shrink-0`}>
            {loadingCopilot ? 'Analysing…' : 'Ask ASTU AI'}
          </button>
        </form>
      </section>

      <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-[var(--text-muted)]">
        <TriangleAlert className="mt-px h-3 w-3 shrink-0" aria-hidden />
        <span>
          This copilot responds from the workspace's topology reference. It does not query production telemetry. For
          live diagnostics open the ICT AI Assistant from the sidebar.
        </span>
      </p>
    </div>
  );
}
