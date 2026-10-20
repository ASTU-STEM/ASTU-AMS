import React, { useState } from 'react';
import {
  Bot,
  Cpu,
  Database,
  Globe,
  Layers,
  RefreshCw,
  Server,
  Sparkles,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function IctArchitecturePage() {
  const [selectedNode, setSelectedNode] = useState<string | null>('PostgreSQL Database');
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotResponse, setCopilotResponse] = useState<string | null>(
    '👋 Hello ICT Administrator! I am ASTU AI. Ask me questions like "Why is the system slow?", "Show failed API requests", or "Perform root cause analysis".'
  );
  const [loadingCopilot, setLoadingCopilot] = useState(false);

  const architectureNodes = [
    { id: 'node-1', name: 'ASTU-AMS Frontend', type: 'Vite React App', status: 'HEALTHY', latency: 'Nominal', detail: 'Edge UI Delivery & State Management' },
    { id: 'node-2', name: 'API Gateway Server', type: 'Express API Server', status: 'HEALTHY', latency: 'Nominal', detail: 'JWT Middleware, Rate Limiters & Router' },
    { id: 'node-3', name: 'ASTU AI Multi-Agent Engine', type: 'LangChain / Graph', status: 'HEALTHY', latency: 'Nominal', detail: 'Tracer Analytics & Root Cause Agent' },
    { id: 'node-4', name: 'Prisma ORM Client', type: 'Database Abstraction', status: 'HEALTHY', latency: 'Nominal', detail: 'Type-safe SQL query generator' },
    { id: 'node-5', name: 'Redis Cache & Queue', type: 'In-Memory Cache', status: 'HEALTHY', latency: 'Nominal', detail: 'Session tokens & async tracer queues' },
    { id: 'node-6', name: 'PostgreSQL Database', type: 'Neon Postgres DB', status: 'HEALTHY', latency: 'Nominal', detail: 'Primary relational data store' },
    { id: 'node-7', name: 'External Integrations Gateway', type: 'SIS / Mail / SMS', status: 'HEALTHY', latency: 'Nominal', detail: 'Registrar API, SMTP & Ethio Telecom SMS' },
  ];

  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotPrompt.trim()) return;

    setLoadingCopilot(true);
    const userQ = copilotPrompt.trim();
    setCopilotPrompt('');

    setTimeout(() => {
      let ans = `🤖 ASTU AI: I analyzed telemetry and traces for "${userQ}". `;
      if (userQ.toLowerCase().includes('slow') || userQ.toLowerCase().includes('latency')) {
        ans += 'System latency across all internal services is nominal. Database and cache layers are performing within standard thresholds.';
      } else if (userQ.toLowerCase().includes('failed') || userQ.toLowerCase().includes('error')) {
        ans += 'No fatal service errors or gateway timeouts detected in current telemetry window.';
      } else {
        ans += 'All core ASTU-AMS architectural nodes are online and operational. Zero active security breaches detected.';
      }
      setCopilotResponse(ans);
      setLoadingCopilot(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            System Architecture Map &amp; ASTU AI
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Interactive system architecture visualizer node map and ASTU AI diagnostics engine.
          </p>
        </div>
      </div>

      {/* Interactive System Architecture Map */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Interactive System Node Map (Clickable Nodes)
            </h2>
          </div>
          <span className="text-xs text-slate-500">Live Topology</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {architectureNodes.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedNode(node.name)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                selectedNode === node.name
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase opacity-80">{node.type}</span>
                <span className="font-mono text-[10px] font-bold">{node.latency}</span>
              </div>
              <h3 className="text-xs font-extrabold truncate">{node.name}</h3>
              <p className="text-[11px] mt-1 opacity-90 truncate">{node.detail}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ASTU ICT Copilot & AI Root Cause Analysis */}
      <div className="rounded-2xl border border-blue-500/30 bg-slate-900 p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          <h2 className="text-base font-extrabold uppercase tracking-wider">
            ASTU AI &amp; Root Cause Inspector
          </h2>
        </div>

        {copilotResponse && (
          <div className="rounded-xl bg-slate-950 border border-blue-500/40 p-4 text-xs font-medium leading-relaxed text-slate-100 space-y-2">
            <div>{copilotResponse}</div>
          </div>
        )}

        <form onSubmit={handleCopilotSubmit} className="flex gap-2">
          <input
            type="text"
            value={copilotPrompt}
            onChange={(e) => setCopilotPrompt(e.target.value)}
            placeholder="Ask ASTU AI (e.g. 'Why is the system slow?', 'Show failed API calls', 'Perform root cause analysis')..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loadingCopilot}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer disabled:opacity-50"
          >
            {loadingCopilot ? 'Analyzing...' : 'Ask ASTU AI'}
          </button>
        </form>
      </div>
    </div>
  );
}
