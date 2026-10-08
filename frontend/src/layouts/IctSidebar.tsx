import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bot,
  Database,
  Globe,
  Key,
  Layers,
  LifeBuoy,
  LogOut,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Settings,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  Terminal,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSystemSettings } from '../context/SystemSettingsContext';

interface IctSidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenAiAssistant?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: any;
  exact?: boolean;
  section: string;
  tooltip?: string;
  badge?: string | number;
}

const navItems: NavItem[] = [
  { label: 'Command Center', path: '/ict/dashboard', icon: Terminal, exact: true, section: 'ops', tooltip: '360° System Health Matrix' },
  { label: 'User Directory & CRUD', path: '/ict/users', icon: Users, section: 'ops', tooltip: 'Full CRUD User Management & Account Governance' },
  { label: 'Escalated Support Desk', path: '/ict/support-tickets', icon: LifeBuoy, section: 'ops', tooltip: 'Review & Resolve Support Tickets Transferred by Super Admin' },
  { label: 'Universal Logs & Diffs', path: '/ict/logs', icon: ScrollText, section: 'ops', tooltip: 'Cross-Portal Logs & State Mutation Diffs' },
  { label: 'External API Gateway', path: '/ict/api-gateway', icon: Globe, section: 'ops', tooltip: 'API Provisioning, Rate Limits & Health' },
  { label: 'Security SOC & OWASP Top 10', path: '/ict/security', icon: ShieldAlert, section: 'ops', tooltip: 'Threats, OWASP A01–A10 & Break Glass' },
  { label: 'Observability & Traces', path: '/ict/observability', icon: Activity, section: 'ops', tooltip: 'Latency & Distributed Tracing' },
  { label: 'Incidents & DR', path: '/ict/incidents', icon: AlertTriangle, section: 'ops', tooltip: 'Incident Lifecycle & DR Simulation' },

  { label: 'Forensic Audit Trail', path: '/ict/audit', icon: Shield, section: 'governance', tooltip: 'Immutable Audit & AI Forensics' },
  { label: 'Integrations & Sync', path: '/ict/integrations', icon: Layers, section: 'governance', tooltip: 'Registrar Sync & Data Quality' },
  { label: 'Feature Flags & Sandbox', path: '/ict/feature-flags', icon: Sliders, section: 'governance', tooltip: 'Rollouts & Release Rollback' },
  { label: 'Policies & Sessions', path: '/ict/policies', icon: Key, section: 'governance', tooltip: 'Active Sessions & Red Button' },
  { label: 'Architecture & ASTU AI', path: '/ict/architecture', icon: Sparkles, section: 'governance', tooltip: 'Interactive Topology & AI' },
];

const sections = [
  { key: 'ops', label: 'Core Technical Operations' },
  { key: 'governance', label: 'Security, Data & Releases' },
];

export default function IctSidebar({
  onLogout,
  isOpen = false,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  onOpenAiAssistant,
}: IctSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { settings } = useSystemSettings();

  const getSectionItems = (sectionKey: string) =>
    navItems.filter((item) => item.section === sectionKey);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200/80 text-slate-800 shadow-xs transition-all duration-300 lg:translate-x-0 ${
        collapsed ? 'w-20' : 'w-64'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
        {/* Header Logo */}
        <div className="relative px-4 py-4 border-b border-slate-100">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="group/logo relative shrink-0 flex items-center justify-center h-10 w-10">
              <img
                src={settings.appearance?.logoUrl || '/images/astu-seal-logo.png'}
                alt={`${settings.general?.abbreviation || 'ASTU'} Seal`}
                className="h-full w-full object-contain scale-110"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-bold tracking-tight text-slate-900 text-[18px] leading-tight flex items-center gap-1.5">
                  <span>{settings.general?.abbreviation || 'ASTU'} ICT</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-blue-50 text-[#003580] border border-blue-200/60 rounded">PORTAL</span>
                </div>
                <p className="text-[9px] text-[#003580] uppercase tracking-widest font-extrabold truncate">Systems Directorate</p>
              </div>
            )}
          </div>
        </div>

      {/* Navigation */}
      <nav className="relative flex-1 overflow-y-auto px-3 py-4 scrollbar-thin space-y-4">
        {sections.map((section) => {
          const items = getSectionItems(section.key);
          if (items.length === 0) return null;
          return (
            <div key={section.key}>
              {!collapsed && (
                <div className="px-3 mb-2">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{section.label}</p>
                </div>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      onClick={() => {
                        if (onNavigate) onNavigate();
                      }}
                      title={collapsed ? item.tooltip || item.label : undefined}
                      className={`nav-btn w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 text-left group relative ${
                        collapsed ? 'justify-center' : 'gap-2.5'
                      } ${
                        isActive
                          ? 'bg-[#003580]/10 text-[#003580] font-bold shadow-2xs ring-1 ring-[#003580]/20'
                          : 'text-slate-600 hover:text-[#003580] hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-[#003580] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-500 group-hover:text-[#003580]'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      {!collapsed && <span className="text-sm font-medium flex-1 truncate text-left">{item.label}</span>}
                      {isActive && !collapsed && (
                        <div className="ml-1 w-1.5 h-1.5 rounded-full bg-[#003580] shrink-0" />
                      )}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                          {item.label}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative border-t border-slate-100 p-3 space-y-2">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200/60 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003580] text-xs font-bold text-white shrink-0">
                {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'IA'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900">{user ? `${user.firstName} ${user.lastName}` : 'ICT Administrator'}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">ICT Administrator</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2 text-xs font-bold text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003580] text-xs font-bold text-white"
              title={user ? `${user.firstName} ${user.lastName}` : 'ICT Administrator'}
            >
              {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'IA'}
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center justify-center w-8 h-8 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          className={`flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer ${
            collapsed ? 'w-full py-1.5' : 'w-full py-2 gap-2'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
