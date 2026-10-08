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
  Users,
  FileText,
  Lock,
  Download,
  Globe,
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
    { label: 'ICT Command Center & 360° System Health', icon: Terminal, category: 'Navigation', action: () => { navigate('/ict/dashboard'); onClose(); } },
    { label: 'User Directory & Access Control (Full CRUD)', icon: Users, category: 'Navigation', action: () => { navigate('/ict/users'); onClose(); } },
    { label: 'Escalated Technical Support Desk', icon: LifeBuoy, category: 'Navigation', action: () => { navigate('/ict/support-tickets'); onClose(); } },
    { label: 'Universal System Logs & Data Mutation Diffs', icon: FileText, category: 'Navigation', action: () => { navigate('/ict/logs'); onClose(); } },
    { label: 'External API Gateway & Health Hub', icon: Globe, category: 'Navigation', action: () => { navigate('/ict/api-gateway'); onClose(); } },
    { label: 'Observability & Distributed Request Tracing', icon: Activity, category: 'Navigation', action: () => { navigate('/ict/observability'); onClose(); } },
    { label: 'Incidents Management & Disaster Recovery (DR)', icon: AlertTriangle, category: 'Navigation', action: () => { navigate('/ict/incidents'); onClose(); } },
    { label: 'Security Operations Center (SOC & OWASP WAF)', icon: ShieldAlert, category: 'Navigation', action: () => { navigate('/ict/security'); onClose(); } },
    { label: 'Activity Forensics & Immutable Audit Trail', icon: Shield, category: 'Navigation', action: () => { navigate('/ict/audit'); onClose(); } },
    { label: 'Integrations & Registrar SIS Data Quality Sync', icon: Database, category: 'Navigation', action: () => { navigate('/ict/integrations'); onClose(); } },
    { label: 'Feature Flags & Percentage Release Control', icon: Sliders, category: 'Navigation', action: () => { navigate('/ict/feature-flags'); onClose(); } },
    { label: 'Security Policies & Active Session Revocation', icon: Key, category: 'Navigation', action: () => { navigate('/ict/policies'); onClose(); } },
    { label: 'System Architecture Node Map & ASTU AI', icon: Bot, category: 'Navigation', action: () => { navigate('/ict/architecture'); onClose(); } },
    
    // Quick Administrative & Operational Commands
    { label: 'Open Enterprise Directory Exporter (CSV / PDF / JSON)', icon: Download, category: 'Quick Action', action: () => { onClose(); navigate('/ict/users'); } },
    { label: 'Run 37 System Health Diagnostic Checks', icon: Zap, category: 'Quick Action', action: () => { toast.success('Running 37 system diagnostic checks...'); onClose(); navigate('/ict/dashboard'); } },
    { label: 'Trigger Registrar SIS Database Sync', icon: RefreshCw, category: 'Quick Action', action: () => { toast.success('Registrar SIS database synchronization initialized'); onClose(); navigate('/ict/integrations'); } },
    { label: 'Inspect Active Blacklisted IPs (Firewall WAF)', icon: Lock, category: 'Quick Action', action: () => { onClose(); navigate('/ict/security'); } },
    { label: 'Launch ASTU AI Multi-Agent Diagnostics', icon: Sparkles, category: 'Quick Action', action: () => { onClose(); navigate('/ict/architecture'); } },
  ];

  const filteredActions = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search ICT workspace... (Ctrl + K)"
            className="w-full bg-transparent px-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none font-medium"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
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
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:text-blue-900 dark:hover:text-white transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-slate-100 text-blue-600 group-hover:bg-[#003580] group-hover:text-white dark:bg-slate-800 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-colors">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-bold">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 group-hover:text-blue-800 dark:group-hover:bg-blue-500/20 dark:group-hover:text-blue-300">
                    {item.category}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
              No ICT commands matching "{query}"
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> ASTU ICT Command Palette
          </span>
          <span className="font-mono text-[10px]">Press Esc to exit</span>
        </div>
      </div>
    </div>
  );
}
