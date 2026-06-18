import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, User, UserCircle2 } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import type { AdminBreadcrumbItem } from '../../domains/admin/types/admin.types';
import AdminBadge from '../../domains/admin/components/AdminBadge';
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
  '/admin/profile': { title: 'My Profile', breadcrumb: [{ label: 'Admin' }, { label: 'Profile' }] },
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
    
    return () => {
      // Restore standard light mode classes on root document if we leave admin page
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    };
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
    { tone: '#003580', text: 'Survey Wave 3 sent to 2024 alumni batch', time: '6 min ago' },
    { tone: '#003580', text: 'New employer Safaricom registration approved', time: '18 min ago' },
    { tone: '#E8A020', text: 'CSV import completed: 245 alumni records', time: '1 hour ago' },
    { tone: '#E24B4A', text: 'Two failed login attempts blocked', time: '3 hours ago' },
  ];

  const menu = (
    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-3 py-3">
        <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user ? `${user.firstName} ${user.lastName}` : 'System Administrator'}</div>
        <div className="mt-2.5">
          <AdminBadge variant="danger" className="bg-[#E24B4A]/10 dark:bg-rose-500/10 text-[#E24B4A] dark:text-rose-400 border-[#E24B4A]/15 dark:border-rose-500/20">
            Super Admin
          </AdminBadge>
        </div>
      </div>
      <div className="my-1.5 h-px bg-slate-200 dark:bg-slate-800" />
      <NavLink
        to="/admin/profile"
        onClick={() => setMenuOpen(false)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        My Profile
      </NavLink>
      <NavLink
        to="/admin/settings"
        onClick={() => setMenuOpen(false)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <Settings className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        Settings
      </NavLink>
      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          setHelpOpen(true);
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <HelpCircle className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        Help Center
      </button>
      <div className="my-1.5 h-px bg-slate-200 dark:bg-slate-800" />
      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          handleLogout();
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#E24B4A] dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );

  return (
    <>
    <div className="admin-shell min-h-screen bg-slate-50 dark:bg-[#090d16] font-['Inter',sans-serif] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200">
      <style>{`
        @keyframes astu-admin-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

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
          className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md px-4 shadow-sm sm:px-6 transition-colors duration-200"
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 lg:hidden animate-in fade-in"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900 dark:text-white tracking-tight">{meta.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-80 max-w-[36vw] items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 md:flex focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 dark:focus-within:border-blue-450 transition-all duration-200">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent border-none outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white ml-2"
              />
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-500 hover:rotate-45 transition-transform duration-300" /> : <Moon className="h-4.5 w-4.5 text-slate-650 hover:-rotate-12 transition-transform duration-300" />}
            </button>

            <div className="relative" data-admin-notifications>
              <button
                type="button"
                onClick={() => setNotificationOpen((value) => !value)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-bold leading-none text-white animate-pulse">
                  5
                </span>
              </button>
              {notificationOpen && (
                <div className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131b2e] shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 bg-white dark:bg-[#131b2e]">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Recent updates</div>
                  </div>
                  <div className="space-y-1 p-2 max-h-80 overflow-y-auto bg-white dark:bg-[#131b2e]">
                    {notifications.map((item) => (
                      <div key={item.text} className="flex items-start gap-3 rounded-lg px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <span className="mt-1.5 h-2 w-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: item.tone }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 leading-relaxed">{item.text}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800/80 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/30 flex justify-center">
                    <button type="button" className="text-xs font-semibold text-[#003580] dark:text-blue-400 hover:underline">
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
                className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] px-2.5 py-1.5 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#004499] text-xs font-semibold text-white">
                  SA
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user ? `${user.firstName} ${user.lastName}` : 'System Administrator'}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Super Admin</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </button>
              {menuOpen && menu}
            </div>
          </div>
        </header>

        <main className="h-[calc(100dvh-4rem)] overflow-y-auto bg-slate-50 dark:bg-[#090d16] p-4 sm:p-6 transition-colors duration-200" style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}>
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
