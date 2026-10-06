import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import IctSidebar from './IctSidebar';
import HelpCenter from '../components/HelpCenter';
import AdminAiAssistant from '../components/AdminAiAssistant';
import IctCommandPalette from '../components/IctCommandPalette';
import IctEmergencyBanner from '../components/IctEmergencyBanner';
import { useTheme } from '../hooks/useTheme';
import IctErrorState from '../features/ict/components/IctErrorState';
import IctBreadcrumbs from '../features/ict/components/IctBreadcrumbs';
import { ictBtnIcon, ictKbd } from '../features/ict/components/ictUi';

const ICT_BANNER_KEY = 'ictEmergencyBanner';

type BannerState = { message: string; type: 'emergency' | 'maintenance' | 'info' } | null;

function readBannerFromStorage(): BannerState {
  try {
    const raw = localStorage.getItem(ICT_BANNER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BannerState;
    if (parsed?.message) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

/** Per-route chrome for the top bar. Titles feed the breadcrumb, never the page heading. */
const routeMeta: Record<string, { title: string; section: string; sectionTo: string }> = {
  '/ict/dashboard': { title: 'Command Center', section: 'Operations', sectionTo: '/ict/dashboard' },
  '/ict/support-tickets': { title: 'Escalated Support Desk', section: 'Operations', sectionTo: '/ict/support-tickets' },
  '/ict/incidents': { title: 'Incidents & DR', section: 'Operations', sectionTo: '/ict/incidents' },
  '/ict/logs': { title: 'Universal Logs & Diffs', section: 'Observability', sectionTo: '/ict/logs' },
  '/ict/observability': { title: 'Observability & Traces', section: 'Observability', sectionTo: '/ict/observability' },
  '/ict/api-gateway': { title: 'External API Gateway', section: 'Observability', sectionTo: '/ict/api-gateway' },
  '/ict/security': { title: 'Security SOC & OWASP', section: 'Security', sectionTo: '/ict/security' },
  '/ict/audit': { title: 'Forensic Audit Trail', section: 'Security', sectionTo: '/ict/audit' },
  '/ict/policies': { title: 'Policies & Sessions', section: 'Security', sectionTo: '/ict/policies' },
  '/ict/integrations': { title: 'Integrations & Data Sync', section: 'Data & Releases', sectionTo: '/ict/integrations' },
  '/ict/feature-flags': { title: 'Feature Flags & Sandbox', section: 'Data & Releases', sectionTo: '/ict/feature-flags' },
  '/ict/architecture': { title: 'Architecture & ASTU AI', section: 'Intelligence', sectionTo: '/ict/architecture' },
};

class IctRouteBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('ICT route render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <IctErrorState
          title="Unable to render this ICT module"
          description="The workspace hit an unexpected rendering fault. Reload the module to continue — if it persists, contact the ICT Systems Directorate."
          detail={this.state.message}
          onRetry={() => this.setState({ hasError: false, message: '' })}
          retryLabel="Retry rendering"
        />
      );
    }

    return this.props.children;
  }
}

export default function IctLayout() {
  const { theme, toggleTheme } = useTheme();
  const [calendarMode, setCalendarMode] = useState<'GC' | 'EC'>('GC');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('ictSidebarCollapsed') === 'true');
  const [helpOpen, setHelpOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [emergencyBanner, setEmergencyBanner] = useState<BannerState>(() => readBannerFromStorage());
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('ictSidebarCollapsed', String(next));
      return next;
    });
  }, []);

  const closeProfile = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOpenPalette = () => setCommandPaletteOpen(true);
    window.addEventListener('open-ict-command-palette', handleOpenPalette);

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((open) => !open);
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('open-ict-command-palette', handleOpenPalette);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    const syncBanner = () => setEmergencyBanner(readBannerFromStorage());

    const onBroadcast = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string; type?: 'emergency' | 'maintenance' | 'info' }>).detail;
      if (!detail?.message) {
        localStorage.removeItem(ICT_BANNER_KEY);
        setEmergencyBanner(null);
        return;
      }
      const next: BannerState = { message: detail.message, type: detail.type || 'emergency' };
      localStorage.setItem(ICT_BANNER_KEY, JSON.stringify(next));
      setEmergencyBanner(next);
    };

    const onMaintenance = (event: Event) => {
      const enabled = Boolean((event as CustomEvent<{ enabled: boolean }>).detail?.enabled);
      if (enabled) {
        const next: BannerState = {
          message: 'MAINTENANCE MODE ACTIVE — ASTU-AMS portals are locked for non-admin users.',
          type: 'maintenance',
        };
        localStorage.setItem(ICT_BANNER_KEY, JSON.stringify(next));
        setEmergencyBanner(next);
      } else {
        const current = readBannerFromStorage();
        if (current?.type === 'maintenance') {
          localStorage.removeItem(ICT_BANNER_KEY);
          setEmergencyBanner(null);
        }
      }
    };

    window.addEventListener('storage', syncBanner);
    window.addEventListener('ict-emergency-broadcast', onBroadcast as EventListener);
    window.addEventListener('ict-maintenance-mode', onMaintenance as EventListener);
    return () => {
      window.removeEventListener('storage', syncBanner);
      window.removeEventListener('ict-emergency-broadcast', onBroadcast as EventListener);
      window.removeEventListener('ict-maintenance-mode', onMaintenance as EventListener);
    };
  }, []);

  // Click-outside + Escape close for the administrator menu
  useEffect(() => {
    if (!menuOpen) return;

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest('[data-ict-menu]')) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        profileRef.current?.querySelector<HTMLButtonElement>('[data-ict-menu-trigger]')?.focus();
      }
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileSidebarOpen]);

  const meta = useMemo(
    () => routeMeta[location.pathname] || { title: 'ICT Technical Portal', section: 'ASTU ICT Portal', sectionTo: '/ict/dashboard' },
    [location.pathname]
  );

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const dismissBanner = () => {
    localStorage.removeItem(ICT_BANNER_KEY);
    setEmergencyBanner(null);
  };

  const toggleCalendar = () => {
    setCalendarMode((prev) => {
      const next = prev === 'GC' ? 'EC' : 'GC';
      toast.success(
        `Calendar mode set to ${next === 'EC' ? 'Ethiopian (2018 E.C.)' : 'Gregorian (2026 G.C.)'}`
      );
      return next;
    });
  };

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'IA';
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'ICT Administrator';

  return (
    <div className="ict-shell app-shell min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] antialiased">
      {/* Mobile drawer scrim */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="ict-veil fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <IctSidebar
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onNavigate={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed && !mobileSidebarOpen}
        onToggleCollapse={toggleSidebarCollapse}
        onOpenAiAssistant={() => setAiAssistantOpen(true)}
      />

      <div
        className={`min-h-screen transition-[margin] duration-200 ease-out ${
          sidebarCollapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-[15rem]'
        }`}
      >
        {emergencyBanner?.message && (
          <IctEmergencyBanner message={emergencyBanner.message} type={emergencyBanner.type} onDismiss={dismissBanner} />
        )}

        {/* ── Global top header ──────────────────────────────── */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-[var(--ict-nav-border)] bg-[var(--bg-navbar)] px-3 sm:gap-3 sm:px-5">
          {/* Left: navigation controls + breadcrumb */}
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className={`${ictBtnIcon} hidden h-9 w-9 lg:inline-flex`}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={`${sidebarCollapsed ? 'Expand' : 'Collapse'} sidebar  ·  [`}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" aria-hidden /> : <PanelLeftClose className="h-4 w-4" aria-hidden />}
            </button>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className={`${ictBtnIcon} h-9 w-9 lg:hidden`}
              aria-label="Open navigation"
              aria-expanded={mobileSidebarOpen}
            >
              <Menu className="h-4 w-4" aria-hidden />
            </button>

            <div className="ml-1 hidden min-w-0 items-center border-l border-[var(--ict-nav-border)] pl-3 sm:flex">
              <IctBreadcrumbs
                items={[
                  { label: 'ICT Systems Directorate', to: '/ict/dashboard' },
                  { label: meta.section, to: meta.sectionTo },
                  { label: meta.title },
                ]}
              />
            </div>

            <span className="ict-clamp-1 text-[13px] font-extrabold tracking-tight sm:hidden">{meta.title}</span>
          </div>

          {/* Right: command search, calendar, theme, administrator */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Command search — Alumni-quality chrome, ICT density */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="group hidden h-9 w-[min(340px,32vw)] items-center justify-between gap-2 rounded-[7px] border border-[var(--ict-nav-border)] bg-[var(--bg-card)] px-3 text-left transition-all duration-150 hover:border-[var(--ict-accent)] hover:bg-[var(--ict-accent-soft)] focus-visible:border-[var(--ict-accent)] focus-visible:ring-2 focus-visible:ring-[var(--ict-accent-ring)] ict-focus md:flex"
              aria-label="Search ICT or type command. Keyboard shortcut Control or Command plus K."
            >
              <span className="flex min-w-0 items-center gap-2">
                <Search className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--ict-accent-text)]" aria-hidden />
                <span className="ict-clamp-1 text-[12px] text-[var(--text-muted)]">Search ICT or type a command...</span>
              </span>
              <kbd className={`${ictKbd} shrink-0`}>Ctrl K</kbd>
            </button>

            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className={`${ictBtnIcon} h-9 w-9 md:hidden`}
              aria-label="Open command search"
            >
              <Search className="h-4 w-4" aria-hidden />
            </button>

            {/* Academic year / calendar mode */}
            <button
              type="button"
              onClick={toggleCalendar}
              className="hidden h-9 items-center gap-1.5 rounded-[7px] border border-[var(--ict-nav-border)] bg-[var(--bg-card)] px-2.5 transition-colors duration-150 hover:border-[var(--ict-accent)] hover:bg-[var(--ict-accent-soft)] ict-focus sm:inline-flex"
              title="Toggle Ethiopian / Gregorian calendar"
            >
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden />
              <span className="ict-mono ict-num text-[11px] font-extrabold text-[var(--text-primary)]">
                {calendarMode === 'EC' ? '2018 E.C.' : '2026 G.C.'}
              </span>
            </button>

            {/* Theme */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`${ictBtnIcon} h-9 w-9 bg-transparent`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
            </button>

            {/* Administrator profile */}
            <div className="relative" data-ict-menu ref={profileRef}>
              <button
                type="button"
                data-ict-menu-trigger
                onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 items-center gap-2 rounded-[7px] border border-[var(--ict-nav-border)] bg-[var(--bg-card)] pl-1 pr-1.5 transition-colors duration-150 hover:border-[var(--ict-accent)] hover:bg-[var(--ict-accent-soft)] ict-focus sm:pr-2"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label={`Administrator menu for ${displayName}`}
              >
                <span
                  className="ict-avatar-brand inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold"
                  aria-hidden
                >
                  {initials}
                </span>
                <span className="hidden min-w-0 text-left sm:block">
                  <span className="ict-clamp-1 block max-w-[9rem] text-[11px] font-extrabold leading-tight text-[var(--text-primary)]">
                    {displayName}
                  </span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--ict-accent-text)]">
                    ICT Administrator
                  </span>
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform duration-150 ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="ict-card ict-shadow-md ict-drop absolute right-0 top-11 z-50 w-64 overflow-hidden bg-[var(--bg-card)] p-1"
                >
                  {/* Identity card */}
                  <div className="rounded-[6px] border border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] p-3">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="ict-avatar-brand inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold"
                        aria-hidden
                      >
                        {initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="ict-clamp-1 text-xs font-extrabold text-[var(--text-primary)]">
                          {displayName}
                        </p>
                        <p className="ict-clamp-1 mt-0.5 text-[10px] text-[var(--text-muted)]">
                          {user?.email || 'admin@astu.edu.et'}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-2.5 grid grid-cols-2 gap-2 border-t border-[var(--ict-hairline)] pt-2.5">
                      <div>
                        <dt className="ict-label">Role</dt>
                        <dd className="text-[10px] font-bold text-[var(--text-primary)]">
                          ICT Administrator
                        </dd>
                      </div>
                      <div>
                        <dt className="ict-label">Department</dt>
                        <dd className="text-[10px] font-bold text-[var(--text-primary)]">
                          ICT Systems Directorate
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-[var(--ict-ok-bg)] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.06em] text-[var(--ict-ok)] ring-1 ring-inset ring-[var(--ict-ok-line)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--ict-ok)]" aria-hidden />
                        Account active
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[var(--text-muted)]">
                        <ShieldCheck className="h-3 w-3" aria-hidden />
                        SSO
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <NavLink
                      to="/ict/policies"
                      onClick={closeProfile}
                      role="menuitem"
                      className="flex items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--ict-accent-soft)] hover:text-[var(--ict-accent-text)] ict-focus"
                    >
                      <Settings className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden />
                      Security Policies &amp; Sessions
                    </NavLink>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        closeProfile();
                        setHelpOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-left text-[11px] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--ict-accent-soft)] hover:text-[var(--ict-accent-text)] ict-focus"
                    >
                      <HelpCircle className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden />
                      Help &amp; Guides
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        closeProfile();
                        setAiAssistantOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-left text-[11px] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--ict-accent-soft)] hover:text-[var(--ict-accent-text)] ict-focus"
                    >
                      <HelpCircle className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden />
                      Open ICT AI Assistant
                    </button>
                  </div>

                  <div className="border-t border-[var(--ict-hairline)] p-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        closeProfile();
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-[5px] px-2.5 py-1.5 text-left text-[11px] font-bold text-[var(--ict-crit)] transition-colors hover:bg-[var(--ict-crit-bg)] ict-focus"
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Module content ──────────────────────────────────── */}
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6 lg:space-y-6 lg:px-8 lg:py-7"
        >
          <IctRouteBoundary key={location.pathname}>
            <Outlet />
          </IctRouteBoundary>
        </main>
      </div>

      <IctCommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <AdminAiAssistant isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </div>
  );
}
