import React from 'react';
import { Code, X } from 'lucide-react';

export interface LogItem {
  id: string;
  timestamp: string;
  portal: string;
  category: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  action: string;
  actor: string;
  actorEmail: string;
  ipAddress: string;
  details: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
}

interface LogDiffModalProps {
  log: LogItem | null;
  onClose: () => void;
}

export const LogDiffModal: React.FC<LogDiffModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-[var(--text-primary)] shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-[#22D3EE]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Mutation Diff — {log.id} ({log.action})
            </h3>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[var(--text-secondary)]">
          Triggered by <span className="text-[var(--text-primary)] font-bold">{log.actor}</span> ({log.actorEmail}) at {log.timestamp} from IP {log.ipAddress}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Before State
            </div>
            <pre className="p-3.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] font-mono text-[11px] text-rose-300 overflow-x-auto h-48">
              {log.beforeState ? JSON.stringify(log.beforeState, null, 2) : '// No prior state (Entity created)'}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              After State
            </div>
            <pre className="p-3.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] font-mono text-[11px] text-emerald-300 overflow-x-auto h-48">
              {log.afterState ? JSON.stringify(log.afterState, null, 2) : '// No after state (Entity deleted)'}
            </pre>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            Close Diff Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
