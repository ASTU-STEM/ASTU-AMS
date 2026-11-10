import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Sun, User, UserCircle2, Sparkles, Command } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import CmsSidebar from './CmsSidebar';
import type { AdminBreadcrumbItem } from '../features/admin/types/admin.types';
import Footer from '../components/Footer';

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
  '/cms/registrations': { title: 'Registrations', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Registrations' }] },
  '/cms/events': { title: 'Events & Workshops', breadcrumb: [{ label: 'Alumni Office' }, { label: 'Events' }] },
  '/cms/homepage': { title: 'Homepage CMS', breadcrumb: [{ label: 'Content Management' }, { label: 'Homepage' }] },
  '/cms/partners': { title: 'Partners & Employers', breadcrumb: [{ label: 'Content Management' }, { label: 'Partners & Employers' }] },
  '/cms/institutional-pages': { title: 'Institutional Pages Manager', breadcrumb: [{ label: 'Content Management' }, { label: 'Institutional Pages' }] },
  '/cms/content': { title: 'Announcements', breadcrumb: [{ label: 'Content Management' }, { label: 'Announcements' }] },
  '/cms/community': { title: 'Community', breadcrumb: [{ label: 'Content Management' }, { label: 'Community' }] },
  '/cms/media-gallery': { title: 'Media & Gallery Hub', breadcrumb: [{ label: 'Content Management' }, { label: 'Media & Gallery' }] },
  '/cms/gallery': { title: 'Campus Gallery', breadcrumb: [{ label: 'Content Management' }, { label: 'Media & Gallery' }] },
  '/cms/media': { title: 'Media Library', breadcrumb: [{ label: 'Content Management' }, { label: 'Media & Gallery' }] },
  '/cms/seo': { title: 'SEO Management', breadcrumb: [{ label: 'Content Management' }, { label: 'SEO' }] },
  '/cms/approvals': { title: 'Approval Workflow', breadcrumb: [{ label: 'Content Management' }, { label: 'Approvals' }] },
  '/cms/templates': { title: 'Content Templates', breadcrumb: [{ label: 'Content Management' }, { label: 'Templates' }] },
  '/cms/settings': { title: 'Settings', breadcrumb: [{ label: 'Content Management' }, { label: 'Settings' }] },
};

const searchSuggestions = [
  { label: 'View registrations & roster', path: '/cms/registrations' },
  { label: 'Manage homepage content', path: '/cms/homepage' },
  { label: 'Create announcement', path: '/cms/content' },
  { label: 'Manage events & workshops', path: '/cms/events' },
  { label: 'Manage community content', path: '/cms/community' },
  { label: 'Manage gallery images', path: '/cms/gallery' },
  { label: 'Upload & browse media library', path: '/cms/media' },
  { label: 'Manage SEO & metadata', path: '/cms/seo' },
  { label: 'Review pending approvals', path: '/cms/approvals' },
  { label: 'CMS settings', path: '/cms/settings' },
];

export default function CmsLayout() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'));
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('cmsSidebarCollapsed') === 'true');
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

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
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const notifications = [
    { color: 'bg-emerald-500', text: 'Homepage hero updated and published', time: '4 min ago' },
    { color: 'bg-blue-500', text: 'New gallery album "Graduation 2026" created', time: '15 min ago' },
    { color: 'bg-amber-500', text: 'Event "Career Fair" awaiting approval', time: '1 hour ago' },
    { color: 'bg-rose-500', text: 'Community report flagged for review', time: '2 hours ago' },
  ];

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
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        <div className={`min-h-screen transition-[margin-left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
          {/* Clean, Comfortable Top Navbar */}
          <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              {/* Left: Mobile Toggle & Page Title */}
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {meta.title}
                </h1>
              </div>

              {/* Center: Sleek, Well-Proportioned Search */}
              <div className="relative hidden sm:block" ref={searchRef}>
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex h-10 w-72 lg:w-80 items-center gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 dark:border-slate-700/80 dark:bg-slate-800/70 px-3.5 text-sm text-slate-400 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
                >
                  <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">Search portal...</span>
                  <kbd className="ml-auto flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-medium text-slate-500 bg-white dark:bg-slate-700 border border-slate-200/90 dark:border-slate-600 shadow-2xs">
                    ⌘K
                  </kbd>
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-11 z-50 w-[380px] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xl dark:shadow-black/50">
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
                    <div className="p-2 max-h-72 overflow-y-auto">
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

              {/* Right: Actions */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Theme toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  aria-label="Toggle dark mode"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                {/* Notifications */}
                <div className="relative" data-cms-notifications>
                  <button
                    type="button"
                    onClick={() => setNotificationOpen(v => !v)}
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-2xs">
                      4
                    </span>
                  </button>
                  {notificationOpen && (
                    <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/30">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notifications</div>
                          <div className="text-[11px] text-slate-400">Recent portal alerts</div>
                        </div>
                        <span className="rounded-full bg-rose-100 dark:bg-rose-950/40 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400">4 new</span>
                      </div>
                      <div className="py-1">
                        {notifications.map((item) => (
                          <div key={item.text} className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer">
                            <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${item.color}`} />
                            <div className="min-w-0">
                              <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug">{item.text}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative ml-1" data-cms-menu>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(v => !v)}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003366] text-xs font-bold text-white shrink-0 shadow-2xs">
                      {user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` : 'CM'}
                    </div>
                    <span className="hidden sm:inline-block text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[130px] truncate">
                      {user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'CMS Manager'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                  {menuOpen && menu}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="h-[calc(100dvh-4rem)] overflow-y-auto p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors text-slate-900 dark:text-slate-100" style={{ animation: 'cms-fade-in 150ms ease-out' }}>
            <style>{`@keyframes cms-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <CmsRouteBoundary key={location.pathname}>
              <Outlet />
            </CmsRouteBoundary>
          </main>
          <Footer variant="minimal" />
        </div>
      </div>

      {/* HelpCenter is loaded via the existing component */}
    </>
  );
}
