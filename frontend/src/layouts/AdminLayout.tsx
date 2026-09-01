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
import { notificationService } from '../features/notifications/services/notification.service';

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
  '/admin/messages': { title: 'ASTU_AMS Hub', breadcrumb: [{ label: 'Admin' }, { label: 'Messages' }] },
  '/admin/support-tickets': { title: 'Support Desk', breadcrumb: [{ label: 'Admin' }, { label: 'Support Desk' }] },
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

  // Sync real admin profile name into AuthContext once on layout mount
  useEffect(() => {
    import('../features/admin/services/admin.service').then(({ adminService }) => {
      adminService.getAdminProfile().then((result) => {
        if (result.ok && result.data) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              if (parsed.firstName !== result.data.firstName || parsed.lastName !== result.data.lastName) {
                parsed.firstName = result.data.firstName;
                parsed.lastName = result.data.lastName;
                localStorage.setItem('user', JSON.stringify(parsed));
                window.dispatchEvent(new Event('astu-auth-changed'));
              }
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
    });
  }, []);

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

  const [realNotifications, setRealNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchRealNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      if (Array.isArray(data)) {
        setRealNotifications(data);
        const unread = data.filter((n: any) => !n.isRead && !n.read).length;
        setUnreadCount(unread);
      }
    } catch (_) {
      // Fallback fallback notifications if database has 0 items
    }
  };

  useEffect(() => {
    fetchRealNotifications();
  }, []);

  const handleToggleNotifications = async () => {
    const nextState = !notificationOpen;
    setNotificationOpen(nextState);
    if (nextState) {
      await fetchRealNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setRealNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
      toast.success('All notifications marked as read');
    } catch (err: any) {
      setUnreadCount(0);
    }
  };

  const displayNotifications = realNotifications.length > 0 ? realNotifications : [
    { id: '1', tone: '#1D9E75', title: 'Survey Dispatched', text: 'Survey Wave 3 sent to 2024 alumni batch', time: '6 min ago', isRead: false },
    { id: '2', tone: '#003580', title: 'Employer Registration', text: 'New employer Safaricom registration approved', time: '18 min ago', isRead: false },
    { id: '3', tone: '#E8A020', title: 'SIS Batch Sync', text: 'CSV import completed: 245 alumni records', time: '1 hour ago', isRead: false },
    { id: '4', tone: '#E24B4A', title: 'Security Alert', text: 'Two failed login attempts blocked', time: '3 hours ago', isRead: false },
  ];

  const menu = (
    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="px-3 py-3">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{user ? `${user.firstName} ${user.lastName}` : 'System Administrator'}</div>
        <div className="mt-2">
          <AdminBadge variant="danger" className="bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15">
            Super Admin
          </AdminBadge>
        </div>
      </div>
      <div className="my-1 h-px bg-[var(--border-color)]" />
      <NavLink
        to="/admin/profile"
        onClick={() => setMenuOpen(false)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
      >
        <User className="h-4 w-4" />
        My Profile
      </NavLink>
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
        collapsed={sidebarCollapsed && !mobileSidebarOpen}
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
            {/* Desktop Hamburger / Collapse Toggle */}
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="hidden h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] lg:inline-flex transition-all duration-200 active:scale-95"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className={`h-5 w-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-90' : 'rotate-0'}`} />
            </button>

            {/* Mobile Hamburger / Toggle Open Drawer */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] lg:hidden transition-all duration-200 active:scale-95"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
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
                onClick={handleToggleNotifications}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
                title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-bold leading-none text-white shadow-xs animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {notificationOpen && (
                <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">Notifications</div>
                      <div className="text-[11px] font-medium text-slate-500">{unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}</div>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-[#003580] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1 p-1">
                    {displayNotifications.map((item: any, idx: number) => {
                      const isUnread = !item.isRead && !item.read;
                      return (
                        <div
                          key={item.id || idx}
                          onClick={() => {
                            if (item.id) notificationService.markAsRead(item.id).catch(() => {});
                            setRealNotifications((prev) => prev.map((n) => n.id === item.id ? { ...n, isRead: true, read: true } : n));
                            setUnreadCount((prev) => Math.max(0, prev - 1));
                          }}
                          className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors cursor-pointer ${isUnread ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-slate-50'}`}
                        >
                          <span
                            className="mt-1 h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.tone || (isUnread ? '#003580' : '#94A3B8') }}
                          />
                          <div className="min-w-0 flex-1">
                            {item.title && <p className="text-xs font-extrabold text-slate-900">{item.title}</p>}
                            <p className="text-xs font-medium text-slate-700 leading-snug">{item.message || item.text || item.content}</p>
                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                              {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : item.time || 'Recently'}
                            </p>
                          </div>
                          {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-[#003580] shrink-0 mt-1.5" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-slate-100 px-3 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationOpen(false);
                        navigate('/admin/notifications');
                      }}
                      className="text-xs font-extrabold text-[#003580] hover:underline"
                    >
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
                  {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'SA'}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{user ? `${user.firstName} ${user.lastName}` : 'System Administrator'}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Super Admin</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {menuOpen && menu}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100dvh-4rem)] overflow-y-auto bg-slate-50/60 p-6 lg:p-8 space-y-6" style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}>
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
