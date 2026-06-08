import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, User, UserCircle2 } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import type { AdminBreadcrumbItem } from '../features/admin/types/admin.types';
import AdminBadge from '../features/admin/components/AdminBadge';
import HelpCenter from '../components/HelpCenter';
import AdminAiAssistant from '../components/AdminAiAssistant';

class AdminRouteBoundary extends React.Component<
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
    console.error('Admin route render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-[10px] border border-[#E24B4A]/20 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Something went wrong loading this admin page.</h2>
          <p className="mt-2 text-sm text-slate-600">
            {this.state.message || 'A render error occurred in the admin workspace.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

const routeMeta: Record<string, { title: string; breadcrumb: AdminBreadcrumbItem[] }> = {
  '/admin/dashboard': { title: 'Dashboard', breadcrumb: [{ label: 'Admin' }, { label: 'Dashboard' }] },
  '/admin/homepage': { title: 'Homepage CMS', breadcrumb: [{ label: 'Admin' }, { label: 'Homepage' }] },
  '/admin/content': { title: 'News & Community', breadcrumb: [{ label: 'Admin' }, { label: 'Content' }] },
  '/admin/gallery': { title: 'Gallery', breadcrumb: [{ label: 'Admin' }, { label: 'Gallery' }] },
  '/admin/events': { title: 'Events & Workshops', breadcrumb: [{ label: 'Admin' }, { label: 'Events' }] },
  '/admin/modules': { title: 'Super Admin Modules', breadcrumb: [{ label: 'Admin' }, { label: 'Modules' }] },
  '/admin/reports': { title: 'Reports Center', breadcrumb: [{ label: 'Admin' }, { label: 'Reports' }] },
  '/admin/users': { title: 'User Management', breadcrumb: [{ label: 'Admin' }, { label: 'Users' }] },
  '/admin/roles': { title: 'Role Management', breadcrumb: [{ label: 'Admin' }, { label: 'Roles' }] },
  '/admin/analytics': { title: 'Analytics', breadcrumb: [{ label: 'Admin' }, { label: 'Analytics' }] },
  '/admin/surveys': { title: 'Survey Management', breadcrumb: [{ label: 'Admin' }, { label: 'Surveys' }] },
  '/admin/jobs': { title: 'Jobs Management', breadcrumb: [{ label: 'Admin' }, { label: 'Jobs' }] },
  '/admin/departments': { title: 'Departments', breadcrumb: [{ label: 'Admin' }, { label: 'Departments' }] },
  '/admin/notifications': { title: 'Notifications', breadcrumb: [{ label: 'Admin' }, { label: 'Notifications' }] },
  '/admin/logs': { title: 'System Logs', breadcrumb: [{ label: 'Admin' }, { label: 'Logs' }] },
  '/admin/backup': { title: 'Backup & Security', breadcrumb: [{ label: 'Admin' }, { label: 'Backup' }] },
  '/admin/settings': { title: 'Settings', breadcrumb: [{ label: 'Admin' }, { label: 'Settings' }] },
};

export default function AdminLayout() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'));
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true');
  const [helpOpen, setHelpOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const location = useLocation();

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('adminSidebarCollapsed', String(next));
      return next;
    });
  };
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
    setNotificationOpen(false);
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const existing = document.getElementById('astu-admin-inter-font');
    if (existing) return;

    const link = document.createElement('link');
    link.id = 'astu-admin-inter-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
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
      if (target && !target.closest('[data-admin-menu]')) {
        setMenuOpen(false);
      }
      if (target && !target.closest('[data-admin-notifications]')) {
        setNotificationOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const meta = useMemo(() => {
    const current = routeMeta[location.pathname] || routeMeta['/admin/dashboard'];
    return current;
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
    { tone: '#1D9E75', text: 'Survey Wave 3 sent to 2024 alumni batch', time: '6 min ago' },
    { tone: '#003580', text: 'New employer Safaricom registration approved', time: '18 min ago' },
    { tone: '#E8A020', text: 'CSV import completed: 245 alumni records', time: '1 hour ago' },
    { tone: '#E24B4A', text: 'Two failed login attempts blocked', time: '3 hours ago' },
  ];

  const menu = (
    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="px-3 py-3">
        <div className="text-sm font-semibold text-[var(--text-primary)]">System Administrator</div>
        <div className="mt-2">
          <AdminBadge variant="danger" className="bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15">
            Super Admin
          </AdminBadge>
        </div>
      </div>
      <div className="my-1 h-px bg-[var(--border-color)]" />
      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          toast('Profile panel will be expanded in the next module.');
        }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
      >
        <User className="h-4 w-4" />
        My Profile
      </button>
      <NavLink
        to="/admin/settings"
        onClick={() => setMenuOpen(false)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
      >
        <Settings className="h-4 w-4" />
        Settings
      </NavLink>
      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          setHelpOpen(true);
        }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
      >
        <HelpCircle className="h-4 w-4" />
        Help
      </button>
      <div className="my-1 h-px bg-[var(--border-color)]" />
      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          handleLogout();
        }}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#E24B4A] hover:bg-rose-50"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );

  return (
    <>
    <div className="admin-shell min-h-screen bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">
      <style>{`
        @keyframes astu-admin-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <Toaster position="top-right" />

      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm lg:hidden"
        />
      )}

<AdminSidebar
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onNavigate={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        onOpenAiAssistant={() => setAiAssistantOpen(true)}
      />

       <div
         className={`min-h-screen transition-[margin-left] duration-[250ms] ease-in-out ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
       >
        <header
          className="sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-6"
          style={{
            background: 'var(--bg-navbar)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
                <span>Admin</span>
                <span>/</span>
                <span>{meta.breadcrumb[meta.breadcrumb.length - 1]?.label ?? 'Dashboard'}</span>
              </div>
              <h1 className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">{meta.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label
              className="group hidden h-11 w-[420px] max-w-[36vw] items-center rounded-full border bg-[#F3F5FA] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 md:flex focus-within:border-[#003580] focus-within:ring-2 focus-within:ring-[#003580]/10 dark:bg-[#1E2130]"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[#8FA3BF]">
                <Search className="h-4.5 w-4.5 flex-none" />
              </span>
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full bg-transparent outline-none placeholder:text-[#7C879D] dark:placeholder:text-[#97A0B8]"
              />
            </label>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="relative" data-admin-notifications>
              <button
                type="button"
                onClick={() => setNotificationOpen((value) => !value)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-semibold leading-none text-white">
                  5
                </span>
              </button>
              {notificationOpen && (
                <div className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                  <div className="border-b border-[var(--border-color)] px-4 py-3">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">Notifications</div>
                    <div className="text-xs text-[var(--text-secondary)]">Recent updates</div>
                  </div>
                  <div className="space-y-1 p-2">
                    {notifications.map((item) => (
                      <div key={item.text} className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-black/5">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.tone }} />
                        <div className="min-w-0">
                          <p className="text-sm text-[var(--text-primary)]">{item.text}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[var(--border-color)] px-4 py-3">
                    <button type="button" className="text-sm font-semibold text-[#003580] hover:underline">
                      View all notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" data-admin-menu>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-3 rounded-[8px] border bg-[var(--bg-card)] px-2.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#003580] text-xs font-semibold text-white">
                  SA
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{user?.name ?? 'System Administrator'}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Super Admin</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {menuOpen && menu}
            </div>
          </div>
        </header>

        <main className="h-[calc(100dvh-4rem)] overflow-y-auto bg-[var(--bg-page)] p-4 sm:p-6" style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}>
          <AdminRouteBoundary key={location.pathname}>
            <Outlet />
          </AdminRouteBoundary>
        </main>
      </div>
    </div>

    <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    <AdminAiAssistant isOpen={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
    </>
  );
}
