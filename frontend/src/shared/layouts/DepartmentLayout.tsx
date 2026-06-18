import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import DepartmentSidebar from './DepartmentSidebar';
import HelpCenter from '../components/HelpCenter';

class DepartmentRouteBoundary extends React.Component<
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
    console.error('Department route render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-[10px] border border-[#E24B4A]/20 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Something went wrong loading this department page.</h2>
          <p className="mt-2 text-sm text-slate-600">
            {this.state.message || 'A render error occurred in the department workspace.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

const routeMeta: Record<string, { title: string }> = {
  '/department/dashboard': { title: 'Dashboard Overview' },
  '/department/management': { title: 'Management Hub' },
  '/department/employment-analytics': { title: 'Employment Analytics' },
  '/department/skill-gap': { title: 'Skill Gap Reports' },
  '/department/employer-feedback': { title: 'Employer Feedback' },
  '/department/tracer-reports': { title: 'Tracer Reports' },
  '/department/curriculum': { title: 'Curriculum Insights' },
  '/department/accreditation': { title: 'Accreditation Reports' },
  '/department/export': { title: 'Export Center' },
};

export default function DepartmentLayout() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'));
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('deptSidebarCollapsed') === 'true');
  const [helpOpen, setHelpOpen] = useState(false);
  const location = useLocation();

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('deptSidebarCollapsed', String(next));
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
    const existing = document.getElementById('astu-dept-inter-font');
    if (existing) return;

    const link = document.createElement('link');
    link.id = 'astu-dept-inter-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
    
    return () => {
      // Restore standard light mode classes on root document if we leave department page
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    };
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest('[data-dept-menu]')) {
        setMenuOpen(false);
      }
      if (target && !target.closest('[data-dept-notifications]')) {
        setNotificationOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const meta = useMemo(() => {
    const current = routeMeta[location.pathname] || routeMeta['/department/dashboard'];
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
    { tone: '#003580', text: 'New tracer survey responses from 2024 graduates', time: '2h ago' },
    { tone: '#003580', text: 'Employer feedback report generated for Computer Science', time: '1d ago' },
    { tone: '#64748b', text: 'Accreditation evidence audit completed successfully', time: '3d ago' },
  ];

  const menu = (
    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-3 py-3">
        <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">
          {user ? `${user.firstName} ${user.lastName}` : 'Department Head'}
        </div>
        <div className="mt-2.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#003580]/10 px-2 py-1 text-xs font-semibold text-[#003580] dark:text-[#2dd4bf] ring-1 ring-inset ring-[#003580]/20">
            Computer Science
          </span>
        </div>
      </div>
      <div className="my-1.5 h-px bg-slate-200 dark:bg-slate-800" />
      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          navigate('/department/profile');
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <Settings className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        Profile Settings
      </button>
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
    <div className="dept-shell min-h-screen bg-slate-50 dark:bg-[#090d16] font-['Inter',sans-serif] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200">
      <style>{`
        @keyframes astu-dept-fade-in {
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

      <DepartmentSidebar
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onNavigate={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        onOpenHelp={() => setHelpOpen(true)}
      />

       <div
         className={`flex flex-col h-[100dvh] w-full overflow-hidden transition-[margin-left] duration-[250ms] ease-in-out ${sidebarCollapsed ? 'lg:ml-20 lg:w-[calc(100%-5rem)]' : 'lg:ml-64 lg:w-[calc(100%-16rem)]'}`}
       >
        <header
          className="shrink-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] px-3 sm:px-6 shadow-sm transition-colors duration-200"
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
              <h1 className="truncate text-base font-bold text-slate-900 dark:text-white tracking-tight">{meta?.title || 'Department Dashboard'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden h-10 w-80 max-w-[36vw] items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 md:flex focus-within:ring-2 focus-within:ring-[#003580]/20 focus-within:border-[#003580] dark:focus-within:border-[#2dd4bf] transition-all duration-200">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 transition-colors" />
              <input
                type="text"
                placeholder="Search reports and analytics..."
                className="w-full bg-transparent border-none outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white ml-2"
              />
            </div>

            <LanguageSwitcher variant="minimal" />

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-500 hover:rotate-45 transition-transform duration-300" /> : <Moon className="h-4.5 w-4.5 text-slate-650 hover:-rotate-12 transition-transform duration-300" />}
            </button>

            <div className="relative" data-dept-notifications>
              <button
                type="button"
                onClick={() => setNotificationOpen((value) => !value)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-bold leading-none text-white animate-pulse">
                  2
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
                    <button type="button" className="text-xs font-semibold text-[#003580] dark:text-[#2dd4bf] hover:underline">
                      View all notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" data-dept-menu>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-2 sm:gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] px-2 py-1.5 sm:px-2.5 sm:py-1.5 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#0a4fa6] text-xs font-semibold text-white">
                  DH
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user ? `${user.firstName} ${user.lastName}` : 'Department Head'}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Computer Science</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </button>
              {menuOpen && menu}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-slate-50 dark:bg-[#090d16] p-4 sm:p-6 transition-colors duration-200" style={{ animation: 'astu-dept-fade-in 150ms ease-out' }}>
          <DepartmentRouteBoundary key={location.pathname}>
            <Outlet />
          </DepartmentRouteBoundary>
        </main>
      </div>
    </div>

    <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
