import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, X } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import IctSidebar from './IctSidebar';
import HelpCenter from '../components/HelpCenter';
import AdminAiAssistant from '../components/AdminAiAssistant';
import IctCommandPalette from '../components/IctCommandPalette';
import {
  NotificationCenterModal,
  NotificationDetailModal,
  type ShellNotification,
} from '../components/dashboard/NotificationModals';
import { notificationService } from '../features/notifications/services/notification.service';
import { useTheme } from '../hooks/useTheme';
import { SHELL_TOPBAR_CLASS, sidebarContentMarginClass } from './sidebarShared';

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
        <div className="rounded-xl border border-rose-200 bg-white p-6 shadow-sm dark:border-rose-900/50 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Something went wrong loading this ICT page.</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
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
  '/ict/architecture': { title: 'Architecture & ASTU AI', subtitle: 'Interactive node topology & ICT ASTU AI' },
};

export default function IctLayout() {
  const { theme, toggleTheme } = useTheme();
  const [calendarMode, setCalendarMode] = useState<'GC' | 'EC'>('GC');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('ictSidebarCollapsed') === 'true');
  const [helpOpen, setHelpOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [notifications, setNotifications] = useState<ShellNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<ShellNotification | null>(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('ictSidebarCollapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    setMenuOpen(false);
    setNotificationOpen(false);
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    const loadNotifications = async () => {
      try {
        const items = await notificationService.getMyNotifications();
        if (cancelled) return;
        const mapped: ShellNotification[] = (Array.isArray(items) ? items : []).map((n: any, idx: number) => ({
          id: String(n.id ?? n._id ?? idx),
          title: n.title || n.subject || 'Notification',
          text: n.message || n.body || n.text || n.content || 'System update',
          content: n.content || n.message || n.body || n.text || '',
          subject: n.subject || n.title,
          unread: !(n.read || n.isRead),
          time: n.createdAt
            ? new Date(n.createdAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recently',
          type: n.type,
          priority: n.priority,
          category: n.category,
          imageUrl: n.imageUrl,
          ctaLink: n.ctaLink || n.link,
          ctaText: n.ctaText || n.actionLabel,
          details: n.details || n.message || n.content,
        }));
        setNotifications(mapped);
      } catch {
        if (!cancelled) setNotifications([]);
      }
    };
    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

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
      if (target && !target.closest('[data-ict-notifications]')) {
        setNotificationOpen(false);
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

  const markAllNotificationsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch {
      // local fallback
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('All notifications marked as read');
  };

  const openNotification = (item: ShellNotification) => {
    setNotificationOpen(false);
    if (item.unread) {
      notificationService.markAsRead(String(item.id)).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (String(n.id) === String(item.id) ? { ...n, unread: false } : n))
      );
    }
    setSelectedNotification({ ...item, unread: false });
  };

  return (
    <>
      <div className="ict-shell admin-shell app-shell min-h-screen bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased transition-colors duration-200">
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

        <div className={sidebarContentMarginClass(sidebarCollapsed)}>
          {/* Top Header Bar — aligned with Admin / DashboardShell tokens */}
          <header className={`${SHELL_TOPBAR_CLASS} px-4 sm:px-6`}>
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="hidden h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] lg:inline-flex dark:hover:bg-white/10"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Menu className={`h-5 w-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-90' : 'rotate-0'}`} />
              </button>

              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 lg:hidden dark:hover:bg-white/10"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <h1 className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">{meta.title}</h1>
                <p className="hidden text-xs text-[var(--text-secondary)] sm:block">{meta.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Command Palette Trigger */}
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="group hidden h-10 w-[280px] max-w-[28vw] items-center justify-between border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 shadow-inner md:flex dark:border-slate-800 dark:bg-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <span>Search ICT or type command...</span>
                </span>
                <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  Ctrl+K
                </kbd>
              </button>

              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Open command palette"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Ethiopian Calendar Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = calendarMode === 'GC' ? 'EC' : 'GC';
                  setCalendarMode(next);
                  toast.success(`Calendar mode set to ${next === 'EC' ? 'Ethiopian (2018 E.C.)' : 'Gregorian (2026 G.C.)'}`);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 cursor-pointer"
                title="Toggle Ethiopian / Gregorian Calendar"
              >
                <span>{calendarMode === 'EC' ? '2018 E.C.' : '2026 G.C.'}</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              </button>

              <div className="relative" data-ict-notifications>
                <button
                  type="button"
                  onClick={() => setNotificationOpen((v) => !v)}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                  title={unreadNotifCount > 0 ? `${unreadNotifCount} unread notifications` : 'Notifications'}
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-bold leading-none text-white animate-pulse">
                      {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                    </span>
                  )}
                </button>
                {notificationOpen && (
                  <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2 shadow-xl">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] px-3 py-2.5">
                      <div>
                        <div className="text-sm font-extrabold text-[var(--text-primary)]">Notifications</div>
                        <div className="text-[11px] font-medium text-[var(--text-secondary)]">
                          {unreadNotifCount > 0 ? `${unreadNotifCount} unread updates` : 'All caught up'}
                        </div>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={() => { void markAllNotificationsRead(); }}
                          className="text-[11px] font-bold text-[var(--brand-navy)] hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 space-y-1 overflow-y-auto p-1">
                      {notifications.length === 0 ? (
                        <p className="px-3 py-8 text-center text-sm text-[var(--text-secondary)]">No notifications yet</p>
                      ) : (
                        notifications.slice(0, 8).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => openNotification(item)}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors ${
                              item.unread
                                ? 'bg-blue-50/60 hover:bg-blue-50 dark:bg-sky-950/40 dark:hover:bg-sky-950/60'
                                : 'hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                          >
                            <span
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                item.unread ? 'bg-[var(--brand-navy)]' : 'bg-[var(--text-muted)]'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-extrabold text-[var(--text-primary)]">
                                {item.title || 'Notification'}
                              </p>
                              <p className="line-clamp-2 text-xs font-medium leading-snug text-[var(--text-secondary)]">
                                {item.text}
                              </p>
                              <p className="mt-1 text-[10px] font-semibold text-[var(--text-muted)]">{item.time}</p>
                            </div>
                            {item.unread && (
                              <button
                                type="button"
                                title="Mark as read"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notificationService.markAsRead(String(item.id)).catch(() => {});
                                  setNotifications((prev) =>
                                    prev.map((n) =>
                                      String(n.id) === String(item.id) ? { ...n, unread: false } : n
                                    )
                                  );
                                }}
                                className="shrink-0 rounded p-1 text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="border-t border-[var(--border-color)] px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationOpen(false);
                          setShowAllNotifications(true);
                        }}
                        className="text-xs font-extrabold text-[var(--brand-navy)] hover:underline"
                      >
                        View all notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" data-ict-menu>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#004d99] text-xs font-bold text-white shadow-sm">
                    {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'IA' : 'IA'}
                  </div>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {user
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'ICT User'
                        : 'ICT User'}
                    </div>
                    <div className="text-[11px] font-medium text-[var(--brand-navy)]">
                      {user?.email || 'ICT Administrator'}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <div className="border-b border-[var(--border-color)] px-3 py-2.5">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        {user
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'ICT User'
                          : 'ICT User'}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[var(--text-secondary)]">{user?.email || 'ict@astu.edu.et'}</div>
                      <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[var(--brand-navy)]">
                        ICT Administrator
                      </div>
                    </div>
                    <div className="py-1">
                      <NavLink
                        to="/ict/policies"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5"
                      >
                        <Settings className="h-4 w-4" />
                        Security Policies &amp; Sessions
                      </NavLink>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          toggleTheme();
                          toast.success(theme === 'dark' ? 'Light theme activated' : 'Dark theme activated');
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5"
                      >
                        {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setHelpOpen(true);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5"
                      >
                        <HelpCircle className="h-4 w-4" />
                        Help &amp; Guides
                      </button>
                    </div>
                    <div className="border-t border-[var(--border-color)] p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-[var(--danger)] hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
          <main
            className="min-h-[calc(100vh-4rem)] space-y-6 bg-[var(--bg-page)] p-4 sm:p-6 lg:p-8"
            style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}
          >
            <div className="mx-auto w-full max-w-[1600px] space-y-6">
              <IctRouteBoundary key={location.pathname}>
                <Outlet />
              </IctRouteBoundary>
            </div>
          </main>
        </div>
      </div>

      <IctCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <AdminAiAssistant isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />

      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onNavigateLink={(link) => {
            if (link.startsWith('/')) navigate(link);
            else if (link.startsWith('http://') || link.startsWith('https://')) window.open(link, '_blank');
          }}
        />
      )}

      {showAllNotifications && (
        <NotificationCenterModal
          notifications={notifications}
          unreadCount={unreadNotifCount}
          onClose={() => setShowAllNotifications(false)}
          onMarkAllRead={() => {
            void markAllNotificationsRead();
          }}
          onSelect={(n) => {
            setShowAllNotifications(false);
            openNotification(n);
          }}
        />
      )}
    </>
  );
}
