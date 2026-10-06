import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Globe,
  Key,
  Layers,
  LifeBuoy,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  shortLabel: string;
  path: string;
  icon: any;
  exact?: boolean;
  section: string;
  tooltip: string;
  description: string;
}

/**
 * Navigation model — paths and handlers are unchanged.
 * Visual grouping only: Operations → Observability → Security → Data & Releases → Intelligence.
 */
const navItems: NavItem[] = [
  {
    label: 'Command Center',
    shortLabel: 'Command',
    path: '/ict/dashboard',
    icon: Terminal,
    exact: true,
    section: 'operations',
    tooltip: '360° System Health Matrix',
    description: 'Operational overview',
  },
  {
    label: 'Escalated Support Desk',
    shortLabel: 'Support',
    path: '/ict/support-tickets',
    icon: LifeBuoy,
    section: 'operations',
    tooltip: 'Review & Resolve Support Tickets Transferred by Super Admin',
    description: 'Escalated ICT tickets',
  },
  {
    label: 'Incidents & DR',
    shortLabel: 'Incidents',
    path: '/ict/incidents',
    icon: AlertTriangle,
    section: 'operations',
    tooltip: 'Incident Lifecycle & DR Simulation',
    description: 'Response & recovery',
  },

  {
    label: 'Universal Logs & Diffs',
    shortLabel: 'Logs',
    path: '/ict/logs',
    icon: ScrollText,
    section: 'observability',
    tooltip: 'Cross-Portal Logs & State Mutation Diffs',
    description: 'Cross-portal audit logs',
  },
  {
    label: 'Observability & Traces',
    shortLabel: 'Traces',
    path: '/ict/observability',
    icon: Activity,
    section: 'observability',
    tooltip: 'Latency & Distributed Tracing',
    description: 'Latency & tracing',
  },
  {
    label: 'External API Gateway',
    shortLabel: 'API',
    path: '/ict/api-gateway',
    icon: Globe,
    section: 'observability',
    tooltip: 'API Provisioning, Rate Limits & Health',
    description: 'Keys, routes & health',
  },

  {
    label: 'Security SOC & OWASP',
    shortLabel: 'SOC',
    path: '/ict/security',
    icon: ShieldAlert,
    section: 'security',
    tooltip: 'Security SOC & OWASP Top 10 — Threats, A01–A10 & Break Glass',
    description: 'Threats & OWASP posture',
  },
  {
    label: 'Forensic Audit Trail',
    shortLabel: 'Audit',
    path: '/ict/audit',
    icon: Shield,
    section: 'security',
    tooltip: 'Immutable Audit & AI Forensics',
    description: 'Immutable event trail',
  },
  {
    label: 'Policies & Sessions',
    shortLabel: 'Policies',
    path: '/ict/policies',
    icon: Key,
    section: 'security',
    tooltip: 'Active Sessions & Red Button',
    description: 'Auth & active sessions',
  },

  {
    label: 'Integrations & Sync',
    shortLabel: 'Integrations',
    path: '/ict/integrations',
    icon: Layers,
    section: 'data',
    tooltip: 'Registrar Sync & Data Quality',
    description: 'Connectors & SIS sync',
  },
  {
    label: 'Feature Flags & Sandbox',
    shortLabel: 'Flags',
    path: '/ict/feature-flags',
    icon: Sliders,
    section: 'data',
    tooltip: 'Rollouts & Release Rollback',
    description: 'Feature controls & sandbox',
  },

  {
    label: 'Architecture & ASTU AI',
    shortLabel: 'Topology',
    path: '/ict/architecture',
    icon: Sparkles,
    section: 'intelligence',
    tooltip: 'Interactive Topology & AI',
    description: 'Topology & diagnostics',
  },
];

const sections = [
  { key: 'operations', label: 'Operations' },
  { key: 'observability', label: 'Observability' },
  { key: 'security', label: 'Security' },
  { key: 'data', label: 'Data & Releases' },
  { key: 'intelligence', label: 'Intelligence' },
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
  const [hovered, setHovered] = useState<string | null>(null);
  const collapseRef = useRef<HTMLButtonElement>(null);

  const activePath = navItems.find((item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  )?.path;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '[') {
        e.preventDefault();
        onToggleCollapse?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onToggleCollapse]);

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'IA';
  const logoSrc = '/ict/images/astu-seal-logo.png';

  const isActive = (item: NavItem) => activePath === item.path;

  return (
    <aside
      aria-label="ICT modules"
      className={`fixed inset-y-0 left-0 z-40 flex w-[15rem] flex-col border-r bg-[var(--ict-nav-bg)] text-[var(--ict-nav-text)] shadow-xs transition-[transform,width] duration-200 ease-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-[var(--ict-shadow-lg)]' : '-translate-x-full'
      } ${collapsed ? 'lg:w-[4.5rem]' : 'lg:w-[15rem]'}`}
      style={{ borderColor: 'var(--ict-nav-border)' }}
    >
      {/* Brand */}
      <div
        className={`flex h-16 shrink-0 items-center border-b ${collapsed ? 'justify-center px-2' : 'gap-2.5 px-3.5'}`}
        style={{ borderColor: 'var(--ict-nav-border-soft)' }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-[var(--ict-logo-plate)] ring-1 ring-[var(--ict-nav-border)]">
          <img src={logoSrc} alt="ASTU seal" className="h-full w-full object-contain p-0.5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="ict-clamp-1 text-[15px] font-bold tracking-tight text-[var(--ict-nav-text-strong)]">
                ASTU ICT
              </span>
              <span className="shrink-0 rounded-[3px] bg-[var(--ict-nav-active)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--ict-nav-accent)]">
                Ops
              </span>
            </div>
            <p className="ict-clamp-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ict-nav-muted)]">
              Systems Directorate
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="ict-scroll flex-1 overflow-y-auto px-2 py-3" aria-label="ICT modules">
        {sections.map((section) => {
          const items = navItems.filter((item) => item.section === section.key);
          if (items.length === 0) return null;

          return (
            <div key={section.key} className="mb-4 last:mb-0">
              {collapsed ? (
                <div
                  className="mx-auto mb-2 h-px w-5"
                  style={{ background: 'var(--ict-nav-border)' }}
                  aria-hidden
                />
              ) : (
                <p className="mb-2 px-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--ict-nav-muted)]">
                  {section.label}
                </p>
              )}

              <ul className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  const showTooltip = collapsed && hovered === item.path;

                  return (
                    <li key={item.path} className="relative">
                      <NavLink
                        to={item.path}
                        end={item.exact}
                        onClick={() => onNavigate?.()}
                        onMouseEnter={() => setHovered(item.path)}
                        onMouseLeave={() => setHovered((h) => (h === item.path ? null : h))}
                        onFocus={() => setHovered(item.path)}
                        onBlur={() => setHovered((h) => (h === item.path ? null : h))}
                        aria-current={active ? 'page' : undefined}
                        title={collapsed ? item.tooltip : undefined}
                        className={`group relative flex items-center rounded-[7px] text-left transition-all duration-150 ict-focus ${
                          collapsed ? 'justify-center px-1.5 py-2' : 'min-h-12 gap-2 px-2 py-2 pl-2.5'
                        } ${active ? 'bg-[var(--ict-nav-active)] font-semibold text-[var(--ict-nav-accent)]' : 'font-medium text-[var(--ict-nav-text)] hover:bg-[var(--ict-nav-hover)] hover:text-[var(--ict-nav-text-strong)]'}`}
                      >
                        <span
                          className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--ict-nav-accent)] transition-opacity duration-150"
                          style={{ opacity: active ? 1 : 0 }}
                          aria-hidden
                        />

                        <span
                          className={`inline-flex shrink-0 items-center justify-center rounded-[6px] transition-colors duration-150 ${
                            collapsed ? 'h-9 w-9' : 'h-8 w-8'
                          } ${
                            active
                              ? 'bg-[var(--ict-nav-active-strong)] text-[var(--ict-nav-icon-active)]'
                              : 'text-[var(--ict-nav-icon)] group-hover:text-[var(--ict-nav-accent)]'
                          }`}
                          aria-hidden
                        >
                          <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.9} />
                        </span>

                        {!collapsed && (
                          <span className="min-w-0 flex-1">
                            <span className="ict-clamp-1 block text-[14px] font-semibold leading-[1.2]">{item.label}</span>
                            <span
                              className={`ict-clamp-1 mt-0.5 block text-[11px] font-normal leading-[1.3] ${
                                active ? 'text-[var(--ict-nav-accent)]/70' : 'text-[var(--ict-nav-muted)]'
                              }`}
                            >
                              {item.description}
                            </span>
                          </span>
                        )}

                        {active && <span className="sr-only">(current module)</span>}
                      </NavLink>

                      {showTooltip && (
                        <span
                          role="tooltip"
                          className="ict-drop pointer-events-none absolute left-full top-1/2 z-50 ml-2 flex -translate-y-1/2 flex-col gap-0.5 whitespace-nowrap rounded-[6px] border border-[var(--ict-nav-border)] bg-[var(--bg-elevated)] px-2.5 py-1.5 shadow-[var(--ict-shadow-md)]"
                        >
                          <span className="text-[12px] font-semibold text-[var(--ict-nav-text-strong)]">
                            {item.label}
                          </span>
                          <span className="text-[11px] text-[var(--ict-nav-muted)]">{item.tooltip}</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {section.key === 'intelligence' && (
                <button
                  type="button"
                  onClick={onOpenAiAssistant}
                  title="ICT AI Assistant · Diagnostics & security"
                  aria-label="Open ICT AI Assistant"
                  className={`group relative mt-1 flex w-full items-center rounded-[7px] text-left text-[var(--ict-nav-text)] transition-colors duration-150 hover:bg-[var(--ict-nav-hover)] hover:text-[var(--ict-nav-text-strong)] ict-focus ${
                    collapsed ? 'min-h-12 justify-center px-1.5 py-2' : 'min-h-12 gap-2 px-2 py-2 pl-2.5'
                  }`}
                >
                  <span className={`inline-flex shrink-0 items-center justify-center rounded-[6px] text-[var(--ict-ai)] ${collapsed ? 'h-9 w-9' : 'h-8 w-8'}`} aria-hidden>
                    <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  {!collapsed && (
                    <span className="min-w-0 flex-1">
                      <span className="ict-clamp-1 block text-[14px] font-semibold leading-[1.2]">ICT AI Assistant</span>
                      <span className="ict-clamp-1 mt-0.5 block text-[11px] font-normal leading-[1.3] text-[var(--ict-nav-muted)]">
                        Diagnostics &amp; security
                      </span>
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer — Administration + Logout */}
      <div
        className="shrink-0 space-y-2 border-t p-2"
        style={{ borderColor: 'var(--ict-nav-border-soft)', background: 'var(--ict-nav-bg-2)' }}
      >
        {!collapsed ? (
          <>
            <p className="px-2.5 pt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--ict-nav-muted)]">
              Administration
            </p>
            <div className="flex items-center gap-2.5 rounded-[7px] border border-[var(--ict-nav-border)] bg-[var(--bg-elevated)] px-2 py-2">
              <span
                className="ict-avatar-brand inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                aria-hidden
              >
                {initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="ict-clamp-1 block text-[13px] font-semibold text-[var(--ict-nav-text-strong)]">
                  {user ? `${user.firstName} ${user.lastName}` : 'ICT Administrator'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ict-ok)]" aria-hidden />
                  <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--ict-nav-muted)]">
                    ICT Administrator
                  </span>
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] font-semibold text-[var(--ict-crit)] transition-colors duration-150 hover:bg-[var(--ict-crit-bg)] ict-focus"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Logout
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <span
              className="ict-avatar-brand inline-flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold"
              title={user ? `${user.firstName} ${user.lastName}` : 'ICT Administrator'}
              aria-hidden
            >
              {initials}
            </span>
            <button
              type="button"
              onClick={onLogout}
              title="Logout"
              aria-label="Logout"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-[var(--ict-crit)] transition-colors duration-150 hover:bg-[var(--ict-crit-bg)] ict-focus"
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}

        <button
          ref={collapseRef}
          type="button"
          onClick={onToggleCollapse}
          title={`${collapsed ? 'Expand' : 'Collapse'} sidebar  ·  [`}
          aria-label={`${collapsed ? 'Expand' : 'Collapse'} sidebar`}
          aria-expanded={!collapsed}
          className="flex w-full items-center justify-center gap-1.5 rounded-[6px] py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ict-nav-muted)] transition-colors duration-150 hover:bg-[var(--ict-nav-hover)] hover:text-[var(--ict-nav-text-strong)] ict-focus"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" aria-hidden />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
