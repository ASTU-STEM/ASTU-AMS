import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import IctSidebar from './IctSidebar';
import AdminBadge from '../features/admin/components/AdminBadge';
import HelpCenter from '../components/HelpCenter';
import AdminAiAssistant from '../components/AdminAiAssistant';
import IctCommandPalette from '../components/IctCommandPalette';
import IctEmergencyBanner from '../components/IctEmergencyBanner';

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
        <div className="rounded-xl border border-rose-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Something went wrong loading this ICT page.</h2>
          <p className="mt-2 text-sm text-slate-600">
            {this.state.message || 'A render error occurred in the ICT Portal workspace.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

const routeMeta: Record<string, { title: string; subtitle: string }> = {
  '/ict/dashboard': { title: 'ICT Command Center', subtitle: '360° System Health Matrix & Live Operations' },
  '/ict/support-tickets': { title: 'Escalated Technical Support Desk', subtitle: 'Review & resolve support tickets transferred by Super Admin' },
  '/ict/logs': { title: 'Universal System Logs & Data Diffs', subtitle: 'Cross-portal log stream, logins, background tasks & mutation diffs' },
  '/ict/api-gateway': { title: 'External API Gateway & Health Hub', subtitle: 'API key provisioning, scope credentials, rate limits & health checking' },
  '/ict/observability': { title: 'Real-Time Observability', subtitle: 'Latency P50/P95/P99 & Distributed Request Tracing' },
  '/ict/incidents': { title: 'Incident Management & DR', subtitle: 'Incident lifecycle, auto triggers & DR simulation' },
  '/ict/security': { title: 'Security Operations Center (SOC)', subtitle: 'OWASP Top 10 A01–A10 protection matrix, threat monitor & Break Glass' },
  '/ict/audit': { title: 'Activity Forensics & Audit', subtitle: 'Immutable audit logs with AI activity analysis' },
  '/ict/integrations': { title: 'Integrations & Data Sync', subtitle: 'Registrar SIS sync & institutional data quality' },
  '/ict/feature-flags': { title: 'Feature Flags & Releases', subtitle: 'Percentage feature rollouts & release rollback' },
  '/ict/policies': { title: 'Policies & Active Sessions', subtitle: 'Security policies, session revocation & Red Button' },
  '/ict/architecture': { title: 'Architecture & AI Copilot', subtitle: 'Interactive node topology & ICT Copilot' },
};

export default function IctLayout() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'));
  const [calendarMode, setCalendarMode] = useState<'GC' | 'EC'>('GC');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('ictSidebarCollapsed') === 'true');
  const [helpOpen, setHelpOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('ictSidebarCollapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    setMenuOpen(false);
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleOpenPalette = () => setCommandPaletteOpen(true);
    window.addEventListener('open-ict-command-palette', handleOpenPalette);
    return () => window.removeEventListener('open-ict-command-palette', handleOpenPalette);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest('[data-ict-menu]')) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const meta = useMemo(() => {
    return routeMeta[location.pathname] || { title: 'ICT Technical Portal', subtitle: 'ASTU Infrastructure Management System' };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <div className="ict-shell min-h-screen bg-slate-100 font-['Inter',sans-serif] text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs lg:hidden"
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
          className={`min-h-screen transition-[margin-left] duration-200 ease-in-out ${
            sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          {/* Top Header Bar */}
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 shadow-xs sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="hidden h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:inline-flex dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Menu className={`h-5 w-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-90' : 'rotate-0'}`} />
              </button>

              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 dark:text-white">{meta.title}</h1>
                <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">{meta.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Command Palette Trigger */}
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="group hidden h-10 w-[300px] max-w-[28vw] items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 shadow-inner md:flex dark:border-slate-800 dark:bg-slate-800 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <span>Search ICT or type command...</span>
                </span>
                <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  Ctrl+K
                </kbd>
              </button>

              {/* Ethiopian Calendar Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = calendarMode === 'GC' ? 'EC' : 'GC';
                  setCalendarMode(next);
                  toast.success(`Calendar mode set to ${next === 'EC' ? 'Ethiopian (2018 E.C.)' : 'Gregorian (2026 G.C.)'}`);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 cursor-pointer"
                title="Toggle Ethiopian / Gregorian Calendar"
              >
                <span>🇪🇹 {calendarMode === 'EC' ? '2018 E.C.' : '2026 G.C.'}</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* User Dropdown */}
              <div className="relative" data-ict-menu>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80 cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'IA'}
                  </div>
                  <div className="hidden text-left sm:block">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {user ? `${user.firstName} ${user.lastName}` : 'ICT Administrator'}
                    </div>
                    <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">ICT Administrator</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {user ? `${user.firstName} ${user.lastName}` : 'ICT Administrator'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{user?.email || 'admin@astu.edu.et'}</div>
                    </div>
                    <div className="py-1">
                      <NavLink
                        to="/ict/policies"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        Security Policies &amp; Sessions
                      </NavLink>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setHelpOpen(true);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <HelpCircle className="h-4 w-4 text-slate-400" />
                        Help &amp; Guides
                      </button>
                    </div>
                    <div className="border-t border-slate-100 p-1 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="min-h-[calc(100vh-4rem)] p-6 lg:p-8 space-y-6">
            <IctRouteBoundary key={location.pathname}>
              <Outlet />
            </IctRouteBoundary>
          </main>
        </div>
      </div>

      <IctCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <AdminAiAssistant isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </>
  );
}
