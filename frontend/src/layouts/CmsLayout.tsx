import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Plus, Search, Sun, User, UserCircle2, Sparkles, Command, Clock, X } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import CmsSidebar from './CmsSidebar';
import type { AdminBreadcrumbItem } from '../features/admin/types/admin.types';
import {
  NotificationCenterModal,
  NotificationDetailModal,
  type ShellNotification,
} from '../components/dashboard/NotificationModals';
import { useTheme } from '../hooks/useTheme';
import { SHELL_TOPBAR_CLASS, sidebarContentMarginClass } from './sidebarShared';
import { notificationService } from '../features/notifications/services/notification.service';

class CmsRouteBoundary extends React.Component<
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
    console.error('CMS route render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-rose-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Something went wrong loading this CMS page.</h2>
          <p className="mt-2 text-sm text-slate-500">
            {this.state.message || 'A render error occurred in the content manager.'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const routeMeta: Record<string, { title: string; breadcrumb: AdminBreadcrumbItem[] }> = {
  '/cms/dashboard': { title: 'Dashboard', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Dashboard' }] },
  '/cms/alumni-directory': { title: 'Alumni Directory', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Alumni Directory' }] },
  '/cms/users': { title: 'User Management', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Users' }] },
  '/cms/surveys': { title: 'Tracer Studies & Surveys', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Tracer Surveys' }] },
  '/cms/tracer-studies': { title: 'Tracer Studies & Surveys', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Tracer Surveys' }] },
  '/cms/analytics': { title: 'Analytics & Insights', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Analytics' }] },
  '/cms/reports': { title: 'Reports Center', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Reports' }] },
  '/cms/registrations': { title: 'Registrations', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Registrations' }] },
  '/cms/events': { title: 'Events & Workshops', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Events' }] },
  '/cms/jobs': { title: 'Jobs & Placement Hub', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Jobs & Careers' }] },
  '/cms/careers': { title: 'Jobs & Placement Hub', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Jobs & Careers' }] },
  '/cms/donations': { title: 'Donations & Giving', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Donations & Giving' }] },
  '/cms/messages': { title: 'Messages', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Messages' }] },
  '/cms/notifications': { title: 'Notifications', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Notifications' }] },
  '/cms/homepage': { title: 'Pages & Homepage CMS', breadcrumb: [{ label: 'Content Management' }, { label: 'Pages & Homepage CMS' }] },
  '/cms/partners': { title: 'Partners & Employers', breadcrumb: [{ label: 'Content Management' }, { label: 'Partners & Employers' }] },
  '/cms/employers': { title: 'Partners & Employers', breadcrumb: [{ label: 'Content Management' }, { label: 'Partners & Employers' }] },
  '/cms/institutional-pages': { title: 'Institutional Pages Manager', breadcrumb: [{ label: 'Content Management' }, { label: 'Institutional Pages' }] },
  '/cms/content': { title: 'Announcements', breadcrumb: [{ label: 'Content Management' }, { label: 'Announcements' }] },
  '/cms/announcements': { title: 'Announcements', breadcrumb: [{ label: 'Content Management' }, { label: 'Announcements' }] },
  '/cms/community': { title: 'Community', breadcrumb: [{ label: 'Content Management' }, { label: 'Community' }] },
  '/cms/community-members': { title: 'Community', breadcrumb: [{ label: 'Content Management' }, { label: 'Community' }] },
  '/cms/media-gallery': { title: 'Media & Gallery Hub', breadcrumb: [{ label: 'Content Management' }, { label: 'Media & Gallery' }] },
  '/cms/gallery': { title: 'Media & Gallery Hub', breadcrumb: [{ label: 'Content Management' }, { label: 'Media & Gallery' }] },
  '/cms/media': { title: 'Media & Gallery Hub', breadcrumb: [{ label: 'Content Management' }, { label: 'Media & Gallery' }] },
  '/cms/seo': { title: 'SEO Management', breadcrumb: [{ label: 'Content Management' }, { label: 'SEO' }] },
  '/cms/approvals': { title: 'Approval Workflow', breadcrumb: [{ label: 'Content Management' }, { label: 'Approvals' }] },
  '/cms/templates': { title: 'Content Templates', breadcrumb: [{ label: 'Content Management' }, { label: 'Templates' }] },
  '/cms/settings': { title: 'Settings', breadcrumb: [{ label: 'Content Management' }, { label: 'Settings' }] },
  '/cms/profile': { title: 'My Profile', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Profile' }] },
};

const searchSuggestions = [
  { label: 'Search verified alumni directory', path: '/cms/alumni-directory' },
  { label: 'Schedule & monitor tracer surveys', path: '/cms/surveys' },
  { label: 'View employment analytics & skill gaps', path: '/cms/analytics' },
  { label: 'Generate ETA accreditation reports', path: '/cms/reports' },
  { label: 'View registrations & roster', path: '/cms/registrations' },
  { label: 'Moderate jobs & career listings', path: '/cms/jobs' },
  { label: 'Fundraising campaigns & donors', path: '/cms/donations' },
  { label: 'Manage homepage content', path: '/cms/homepage' },
  { label: 'Create announcement', path: '/cms/content' },
  { label: 'Manage events & workshops', path: '/cms/events' },
  { label: 'Manage community content', path: '/cms/community' },
  { label: 'Manage gallery images', path: '/cms/gallery' },
  { label: 'Upload & browse media library', path: '/cms/media' },
  { label: 'Manage SEO & metadata', path: '/cms/seo' },
  { label: 'Review pending approvals', path: '/cms/approvals' },
  { label: 'Open messages hub', path: '/cms/messages' },
  { label: 'Notification center', path: '/cms/notifications' },
  { label: 'Community members roster', path: '/cms/community?tab=members' },
  { label: 'Partners & employers portal', path: '/cms/partners' },
  { label: 'Content templates', path: '/cms/templates' },
  { label: 'CMS settings', path: '/cms/settings' },
];

function formatHeaderDate() {
  const now = new Date();
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(now);
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(now);
  return { date, time };
}

export default function CmsLayout() {
  const { theme, toggleTheme } = useTheme();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('cmsSidebarCollapsed') === 'true');
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [headerTime, setHeaderTime] = useState(formatHeaderDate());
  const [notifications, setNotifications] = useState<ShellNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<ShellNotification | null>(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setHeaderTime(formatHeaderDate()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const items = await notificationService.getMyNotifications();
        if (cancelled) return;
        const mapped: ShellNotification[] = (Array.isArray(items) ? items : []).map((n: any, idx: number) => ({
          id: String(n.id ?? n._id ?? idx),
          title: n.title || n.subject || 'Notification',
          text: n.message || n.body || n.text || n.content || 'Notification update',
          content: n.content || n.message || n.body || n.text || '',
          subject: n.subject || n.title,
          unread: !(n.read || n.isRead),
          time: n.createdAt
            ? new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }).format(new Date(n.createdAt))
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
      } finally {
        if (!cancelled) setNotificationsLoading(false);
      }
    };
    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('cmsSidebarCollapsed', String(next));
      return next;
    });
  };
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
    setNotificationOpen(false);
    setMobileSidebarOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const existing = document.getElementById('astu-cms-inter-font');
    if (existing) return;
    const link = document.createElement('link');
    link.id = 'astu-cms-inter-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest('[data-cms-menu]')) setMenuOpen(false);
      if (target && !target.closest('[data-cms-notifications]')) setNotificationOpen(false);
      if (searchRef.current && !searchRef.current.contains(target as Node)) setSearchOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const meta = useMemo(() => {
    return routeMeta[location.pathname] || routeMeta['/cms/dashboard'];
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const filteredSuggestions = searchQuery.trim()
    ? searchSuggestions.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchSuggestions;

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  const markAllNotificationsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch {
      // local fallback below
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

  const menu = (
    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-lg shadow-slate-200/50 dark:shadow-black/30">
      <div className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#F4B400] to-[#E8A020] text-sm font-bold text-[#0B1A2E] shadow-sm">
            {user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` : 'CM'}
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">{user ? `${user.firstName ?? ''} ${user.lastName ?? ''}` : 'Content Manager'}</div>
            <div className="text-xs text-[var(--text-secondary)]">CMS Editor</div>
          </div>
        </div>
      </div>
      <div className="h-px bg-[var(--border-color)]" />
      <NavLink to="/cms/profile" onClick={() => setMenuOpen(false)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]">
        <User className="h-4 w-4" /> My Profile
      </NavLink>
      <NavLink to="/cms/settings" onClick={() => setMenuOpen(false)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]">
        <UserCircle2 className="h-4 w-4" /> CMS Settings
      </NavLink>
      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          toggleTheme();
          toast.success(theme === 'dark' ? 'Light theme activated' : 'Dark theme activated');
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
      <button type="button" onClick={() => { setMenuOpen(false); setHelpOpen(true); }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]">
        <HelpCircle className="h-4 w-4" /> Help
      </button>
      <div className="h-px bg-[var(--border-color)]" />
      <button type="button" onClick={() => { setMenuOpen(false); handleLogout(); }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );

  return (
    <>
    <div className="admin-shell app-shell min-h-screen bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">
      {mobileSidebarOpen && (
        <button type="button" aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm lg:hidden" />
      )}

      <CmsSidebar
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onNavigate={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed && !mobileSidebarOpen}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <div className={sidebarContentMarginClass(sidebarCollapsed)}>
        {/* Top header — shared admin chrome tokens */}
        <header className={SHELL_TOPBAR_CLASS}>
          <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
            {/* Left: mobile hamburger + page title */}
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex min-w-0 items-center gap-3">
                <h1 className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">{meta.title}</h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-page)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
                  <Clock className="h-3 w-3" />
                  {headerTime.date} · {headerTime.time}
                </span>
              </div>
            </div>

            {/* Center: Search input */}
            <div className="relative hidden md:block" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(true)}
                className="flex h-9 w-[340px] items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/80 px-3.5 text-xs text-slate-400 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
              >
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <span>Search pages, media, announcements...</span>
                <span className="ml-auto flex items-center gap-0.5 rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-300 shadow-xs">
                  <Command className="h-3 w-3" />K
                </span>
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-11 z-50 w-[420px] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xl dark:shadow-black/50">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search pages, posts, media..."
                      className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>
                  <div className="p-2">
                    {filteredSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(s.path);
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Quick Create */}
              <button type="button" onClick={() => navigate('/cms/content')}
                className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#003366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#002a55] transition-all shadow-sm">
                <Plus className="h-4 w-4" /> Create
              </button>

              {/* Theme toggle */}
              <button type="button" onClick={toggleTheme}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-page)] transition-all" aria-label="Toggle dark mode">
                {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              {/* Notifications */}
              <div className="relative" data-cms-notifications>
                <button type="button" onClick={() => setNotificationOpen(v => !v)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-page)] transition-all"
                  title={unreadNotifCount > 0 ? `${unreadNotifCount} unread notifications` : 'Notifications'}
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-bold leading-none text-white animate-pulse">
                      {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                    </span>
                  )}
                </button>
                {notificationOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2 shadow-xl">
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
                          className="text-[11px] font-bold text-[#003580] hover:underline dark:text-sky-400"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 space-y-1 overflow-y-auto p-1">
                      {notificationsLoading ? (
                        <p className="px-3 py-8 text-center text-sm text-[var(--text-secondary)]">Loading…</p>
                      ) : notifications.length === 0 ? (
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
                                item.unread ? 'bg-[#003580]' : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-extrabold text-[var(--text-primary)]">
                                {item.title || 'Notification'}
                              </p>
                              <p className="line-clamp-2 text-xs font-medium leading-snug text-[var(--text-secondary)]">
                                {item.text}
                              </p>
                              <p className="mt-1 text-[10px] font-semibold text-slate-400">{item.time}</p>
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
                        className="text-xs font-extrabold text-[#003580] hover:underline dark:text-sky-400"
                      >
                        View all notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative" data-cms-menu>
                <button type="button" onClick={() => setMenuOpen(v => !v)}
                  className="flex items-center gap-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 hover:shadow transition-all">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#003366] to-[#002244] dark:from-[#004080] dark:to-[#002855] text-xs font-bold text-[#FFCC00] shadow-sm border border-white/10">
                    {user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` : 'AO'}
                  </div>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'Alumni Office Officer'}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                      Online
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                </button>
                {menuOpen && menu}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content — shared admin chrome spacing */}
        <main
          className="h-[calc(100dvh-4rem)] overflow-y-auto bg-[var(--bg-page)] p-4 text-[var(--text-primary)] sm:p-6 lg:p-8"
          style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}
        >
          <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-6">
            <CmsRouteBoundary key={location.pathname}>
              <Outlet />
            </CmsRouteBoundary>
          </div>
        </main>
      </div>
    </div>

    {selectedNotification && (
      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onNavigateLink={(link) => {
          if (link.startsWith('/')) navigate(link);
          else if (link.startsWith('http://') || link.startsWith('https://')) window.open(link, '_blank');
          else navigate('/cms/notifications');
        }}
        onNavigateTab={() => navigate('/cms/notifications')}
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
