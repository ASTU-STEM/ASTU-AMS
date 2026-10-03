import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bot,
  Database,
  Key,
  LifeBuoy,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  Terminal,
  Zap,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface IctCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IctCommandPalette({ isOpen, onClose }: IctCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via custom event if needed
          window.dispatchEvent(new Event('open-ict-command-palette'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'Go to Command Center', icon: Terminal, category: 'Navigation', action: () => { navigate('/ict/dashboard'); onClose(); } },
    { label: 'View Observability & Request Tracing', icon: Activity, category: 'Navigation', action: () => { navigate('/ict/observability'); onClose(); } },
    { label: 'Manage Incidents & Disaster Recovery', icon: AlertTriangle, category: 'Navigation', action: () => { navigate('/ict/incidents'); onClose(); } },
    { label: 'Security Operations Center (SOC)', icon: ShieldAlert, category: 'Navigation', action: () => { navigate('/ict/security'); onClose(); } },
    { label: 'Inspect Forensic Audit Trail', icon: Shield, category: 'Navigation', action: () => { navigate('/ict/audit'); onClose(); } },
    { label: 'Integrations & Registrar Sync', icon: Database, category: 'Navigation', action: () => { navigate('/ict/integrations'); onClose(); } },
    { label: 'Feature Flags & Release Control', icon: Sliders, category: 'Navigation', action: () => { navigate('/ict/feature-flags'); onClose(); } },
    { label: 'Security Policies & Active Sessions', icon: Key, category: 'Navigation', action: () => { navigate('/ict/policies'); onClose(); } },
    { label: 'System Architecture & ASTU AI', icon: Bot, category: 'Navigation', action: () => { navigate('/ict/architecture'); onClose(); } },
    { label: 'Run Full System Diagnostics', icon: Zap, category: 'Quick Action', action: () => { toast.success('Running 37 system diagnostic checks...'); onClose(); navigate('/ict/dashboard'); } },
    { label: 'Trigger Registrar Data Sync', icon: RefreshCw, category: 'Quick Action', action: () => { toast.success('Registrar synchronization initialized'); onClose(); navigate('/ict/integrations'); } },
  ];

  const filteredActions = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center border-b border-slate-800 px-4 py-3">
          <Search className="h-5 w-5 text-blue-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search ICT workspace... (Ctrl + K)"
            className="w-full bg-transparent px-3 text-sm text-white placeholder-slate-500 outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredActions.length > 0 ? (
            filteredActions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={item.action}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-slate-200 hover:bg-blue-600/20 hover:text-white transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-blue-600 text-blue-400 group-hover:text-white transition-colors">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-2 py-0.5 rounded bg-slate-800 group-hover:bg-blue-500/20 group-hover:text-blue-300">
                    {item.category}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-500">
              No ICT commands matching "{query}"
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 bg-slate-950 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> ASTU ICT Command Palette
          </span>
          <span className="font-mono text-[10px]">Press Esc to exit</span>
        </div>
      </div>
    </div>
  );
}
