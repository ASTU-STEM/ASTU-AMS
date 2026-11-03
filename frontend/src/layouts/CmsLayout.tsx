import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Plus, Search, Sun, User, UserCircle2, Sparkles, Command, Clock } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import CmsSidebar from './CmsSidebar';
import type { AdminBreadcrumbItem } from '../features/admin/types/admin.types';
import { useTheme } from '../hooks/useTheme';
import { sidebarContentMarginClass } from './sidebarShared';
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
  '/cms/homepage': { title: 'Homepage CMS', breadcrumb: [{ label: 'Content Management' }, { label: 'Homepage' }] },
  '/cms/knowledge-hub': { title: 'RAG Knowledge Hub', breadcrumb: [{ label: 'Content Management' }, { label: 'RAG Knowledge Hub' }] },
  '/cms/rag-knowledge': { title: 'RAG Knowledge Hub', breadcrumb: [{ label: 'Content Management' }, { label: 'RAG Knowledge Hub' }] },
  '/cms/partners': { title: 'Partners & Employers', breadcrumb: [{ label: 'Content Management' }, { label: 'Partners & Employers' }] },
  '/cms/employers': { title: 'Partners & Employers', breadcrumb: [{ label: 'Content Management' }, { label: 'Partners & Employers' }] },
  '/cms/institutional-pages': { title: 'Institutional Pages Manager', breadcrumb: [{ label: 'Content Management' }, { label: 'Institutional Pages' }] },
  '/cms/content': { title: 'Announcements', breadcrumb: [{ label: 'Content Management' }, { label: 'Announcements' }] },
  '/cms/announcements': { title: 'Announcements', breadcrumb: [{ label: 'Content Management' }, { label: 'Announcements' }] },
  '/cms/community': { title: 'Community', breadcrumb: [{ label: 'Content Management' }, { label: 'Community' }] },
  '/cms/community-members': { title: 'Community Members', breadcrumb: [{ label: 'Content Management' }, { label: 'Community Members' }] },
  '/cms/media-gallery': { title: 'Media & Gallery Hub', breadcrumb: [{ label: 'Content Management' }, { label: 'Media & Gallery' }] },
  '/cms/gallery': { title: 'Campus Gallery', breadcrumb: [{ label: 'Content Management' }, { label: 'Media & Gallery' }] },
  '/cms/media': { title: 'Media Library', breadcrumb: [{ label: 'Content Management' }, { label: 'Media & Gallery' }] },
  '/cms/seo': { title: 'SEO Management', breadcrumb: [{ label: 'Content Management' }, { label: 'SEO' }] },
  '/cms/approvals': { title: 'Approval Workflow', breadcrumb: [{ label: 'Content Management' }, { label: 'Approvals' }] },
  '/cms/templates': { title: 'Content Templates', breadcrumb: [{ label: 'Content Management' }, { label: 'Templates' }] },
  '/cms/menu-controls': { title: 'Portal Page Controls', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Portal Page Controls' }] },
  '/cms/portal-controls': { title: 'Portal Page Controls', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Portal Page Controls' }] },
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
  { label: 'Manage community & leaders roster', path: '/cms/community' },
  { label: 'Manage gallery images', path: '/cms/gallery' },
  { label: 'Upload & browse media library', path: '/cms/media' },
  { label: 'Manage SEO & metadata', path: '/cms/seo' },
  { label: 'Review pending approvals', path: '/cms/approvals' },
  { label: 'Open messages hub', path: '/cms/messages' },
  { label: 'Notification center', path: '/cms/notifications' },
  { label: 'Community members roster', path: '/cms/community-members' },
  { label: 'Partners & employers portal', path: '/cms/partners' },
  { label: 'Content templates', path: '/cms/templates' },
  { label: 'Control & toggle actor dashboard menu pages', path: '/cms/menu-controls' },
  { label: 'CMS settings', path: '/cms/settings' },
];

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
  const [notifications, setNotifications] = useState<{ id: string; color: string; text: string; time: string }[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const items = await notificationService.getMyNotifications();
        if (cancelled) return;
        const mapped = (Array.isArray(items) ? items : [])
          .slice(0, 5)
          .map((n: any, idx: number) => ({
            id: String(n.id ?? n._id ?? idx),
            color: n.read || n.isRead ? 'bg-slate-300' : 'bg-emerald-500',
            text: n.title || n.message || n.body || 'Notification update',
            time: n.createdAt
              ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(n.createdAt))
              : 'Recently',
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
    <div className="admin-shell min-h-screen bg-[var(--bg-page)] font-['Inter',sans-serif] text-slate-900 antialiased">
      {mobileSidebarOpen && (
        <button type="button" aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/45 backdrop-blur-sm lg:hidden" />
      )}

      <CmsSidebar
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onNavigate={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed && !mobileSidebarOpen}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <div className={sidebarContentMarginClass(sidebarCollapsed)}>
        {/* Clean Minimalist Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
          <div className="flex h-14 items-center justify-between px-3 sm:px-6">
            {/* Left: mobile hamburger + clean page title */}
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden cursor-pointer transition-colors"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {meta.title}
              </h1>
            </div>

            {/* Center: Search input */}
            <div className="relative" ref={searchRef}>
              {/* Desktop search bar */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex h-9 w-[220px] lg:w-[280px] items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/60 px-3 text-xs text-slate-400 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
              >
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Search pages, media...</span>
                <span className="ml-auto flex items-center gap-0.5 rounded border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-300 shadow-2xs">
                  <Command className="h-2.5 w-2.5" />K
                </span>
              </button>

              {/* Mobile search icon trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>

              {searchOpen && (
                <div className="fixed inset-x-3 top-16 md:absolute md:inset-auto md:right-0 md:top-11 z-50 md:w-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xl dark:shadow-black/60">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                    <Search className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search pages, posts, media..."
                      className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      ESC
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {filteredSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(s.path);
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all cursor-pointer text-left"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: clean utilities */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              {/* Notifications */}
              <div className="relative" data-cms-notifications>
                <button
                  type="button"
                  onClick={() => setNotificationOpen((v) => !v)}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {notifications.some((n) => n.color === 'bg-emerald-500') && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>
                {notificationOpen && (
                  <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xl dark:shadow-black/40">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Notifications</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Your latest content updates</div>
                      </div>
                    </div>
                    <div className="py-1 max-h-72 overflow-y-auto">
                      {notificationsLoading ? (
                        <p className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">Loading…</p>
                      ) : notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">No notifications yet</p>
                      ) : (
                        notifications.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate('/cms/notifications');
                            }}
                            className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-[var(--bg-page)] transition-all cursor-pointer"
                          >
                            <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${item.color}`} />
                            <div className="min-w-0">
                              <p className="text-sm text-[var(--text-primary)] line-clamp-2">{item.text}</p>
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.time}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="border-t border-[var(--border-color)] px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationOpen(false);
                          navigate('/cms/notifications');
                        }}
                        className="text-sm font-semibold text-[#003366] dark:text-[#3b82f6] hover:text-[#002a55] dark:hover:text-[#60a5fa] transition-colors cursor-pointer"
                      >
                        View all notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User menu button - simple and clean */}
              <div className="relative" data-cms-menu>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#003366] dark:bg-sky-600 text-xs font-bold text-white shadow-2xs">
                    {user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` : 'CM'}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'CMS Manager'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
                {menuOpen && menu}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className="min-h-[calc(100dvh-3.5rem)] overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors text-slate-900 dark:text-slate-100"
          style={{ animation: 'cms-fade-in 150ms ease-out' }}
        >
          <style>{`@keyframes cms-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          <CmsRouteBoundary key={location.pathname}>
            <Outlet />
          </CmsRouteBoundary>
        </main>
      </div>
    </div>

    {/* HelpCenter is loaded via the existing component */}
    </>
  );
}
