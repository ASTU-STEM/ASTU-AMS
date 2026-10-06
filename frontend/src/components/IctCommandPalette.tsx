import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bot,
  CornerDownLeft,
  Database,
  Globe,
  Key,
  LifeBuoy,
  RefreshCw,
  ScrollText,
  Search,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface IctCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Navigation' | 'Quick Action';
  keywords: string;
  action: () => void;
}

/**
 * ICT command palette.
 * Same navigation targets and same quick actions as before — only the
 * presentation and keyboard affordances are improved.
 */
export default function IctCommandPalette({ isOpen, onClose }: IctCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const actions = useMemo<CommandAction[]>(
    () => [
      { label: 'Go to Command Center', icon: Terminal, category: 'Navigation', keywords: 'dashboard home overview health', action: () => { navigate('/ict/dashboard'); onClose(); } },
      { label: 'Escalated Support Desk', icon: LifeBuoy, category: 'Navigation', keywords: 'tickets support desk queue', action: () => { navigate('/ict/support-tickets'); onClose(); } },
      { label: 'Universal Logs & Diffs', icon: ScrollText, category: 'Navigation', keywords: 'logs audit stream diffs', action: () => { navigate('/ict/logs'); onClose(); } },
      { label: 'External API Gateway', icon: Globe, category: 'Navigation', keywords: 'api keys gateway partners rate limit', action: () => { navigate('/ict/api-gateway'); onClose(); } },
      { label: 'View Observability & Request Tracing', icon: Activity, category: 'Navigation', keywords: 'observability traces latency waterfall', action: () => { navigate('/ict/observability'); onClose(); } },
      { label: 'Manage Incidents & Disaster Recovery', icon: AlertTriangle, category: 'Navigation', keywords: 'incidents dr outage failover', action: () => { navigate('/ict/incidents'); onClose(); } },
      { label: 'Security Operations Center (SOC)', icon: ShieldAlert, category: 'Navigation', keywords: 'security soc owasp threats waf', action: () => { navigate('/ict/security'); onClose(); } },
      { label: 'Inspect Forensic Audit Trail', icon: Shield, category: 'Navigation', keywords: 'forensic audit trail who what', action: () => { navigate('/ict/audit'); onClose(); } },
      { label: 'Integrations & Registrar Sync', icon: Database, category: 'Navigation', keywords: 'integrations sync registrar sis', action: () => { navigate('/ict/integrations'); onClose(); } },
      { label: 'Feature Flags & Release Control', icon: Sliders, category: 'Navigation', keywords: 'feature flags rollout sandbox release', action: () => { navigate('/ict/feature-flags'); onClose(); } },
      { label: 'Security Policies & Active Sessions', icon: Key, category: 'Navigation', keywords: 'policies sessions keys emergency', action: () => { navigate('/ict/policies'); onClose(); } },
      { label: 'System Architecture & ASTU AI', icon: Bot, category: 'Navigation', keywords: 'architecture topology ai copilot', action: () => { navigate('/ict/architecture'); onClose(); } },
      { label: 'Run Full System Diagnostics', icon: Zap, category: 'Quick Action', keywords: 'diagnostics scan health check', action: () => { toast.success('Running 37 system diagnostic checks...'); onClose(); navigate('/ict/dashboard'); } },
      { label: 'Trigger Registrar Data Sync', icon: RefreshCw, category: 'Quick Action', keywords: 'sync registrar trigger now', action: () => { toast.success('Registrar synchronization initialized'); onClose(); navigate('/ict/integrations'); } },
    ],
    [navigate, onClose]
  );

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.keywords.toLowerCase().includes(q)
    );
  }, [actions, query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(0);
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, filteredActions.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filteredActions[activeIndex]?.action();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, filteredActions, activeIndex]);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  if (!isOpen) return null;

  const grouped: { category: string; items: CommandAction[] }[] = [];
  filteredActions.forEach((item) => {
    const bucket = grouped.find((g) => g.category === item.category);
    if (bucket) bucket.items.push(item);
    else grouped.push({ category: item.category, items: [item] });
  });

  return createPortal(
    <div
      className="ict-shell ict-veil fixed inset-0 z-[9999] flex items-start justify-center bg-slate-950/50 p-3 pt-[8vh] backdrop-blur-[2px] sm:p-4 sm:pt-[10vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ICT command palette"
        className="ict-card ict-drop flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden bg-[var(--bg-elevated)] shadow-[var(--ict-shadow-lg)]"
      >
        {/* Search field */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-[var(--border-color)] px-3.5 py-3">
          <Search className="h-4 w-4 shrink-0 text-[var(--ict-accent-text)]" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search ICT or type a command..."
            aria-label="Command search"
            aria-controls="ict-command-results"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
            autoFocus
          />
          <kbd className="ict-mono hidden rounded border border-[var(--border-color)] bg-[var(--ict-surface-inset)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)] sm:inline">
            Esc
          </kbd>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)] ict-focus"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} id="ict-command-results" role="listbox" className="ict-scroll min-h-0 flex-1 overflow-y-auto p-1.5">
          {filteredActions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--ict-accent-soft)] text-[var(--ict-accent-text)]" aria-hidden>
                <Search className="h-5 w-5" />
              </span>
              <p className="text-xs font-extrabold text-[var(--text-primary)]">
                No ICT commands match “{query}”
              </p>
              <p className="max-w-xs text-[11px] leading-relaxed text-[var(--text-muted)]">
                Try a module name such as “incidents”, “security”, or “registrar sync”.
              </p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.category} className="mb-1 last:mb-0">
                <p className="px-2.5 pb-1 pt-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {group.category}
                </p>
                <ul>
                  {group.items.map((item) => {
                    const index = filteredActions.indexOf(item);
                    const active = index === activeIndex;
                    const Icon = item.icon;
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          data-active={active}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={item.action}
                          className={`flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left transition-colors duration-100 ${
                            active
                              ? 'bg-[var(--ict-accent-soft)] text-[var(--ict-accent-text)]'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <span
                            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] transition-colors ${
                              active
                                ? 'bg-[var(--ict-accent)] text-white'
                                : 'bg-[var(--ict-surface-inset)] text-[var(--ict-accent-text)]'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.label}</span>
                          {active && (
                            <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-[var(--ict-accent-text)]" aria-hidden />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[var(--border-color)] bg-[var(--ict-surface-inset)] px-3.5 py-2 text-[10px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="h-3 w-3 text-[var(--ict-accent-text)]" aria-hidden />
            ASTU ICT Command Palette
          </span>
          <span className="flex items-center gap-2.5">
            <span className="ict-mono">↑↓ Navigate</span>
            <span className="ict-mono">↵ Run</span>
            <span className="ict-mono">Esc Close</span>
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
