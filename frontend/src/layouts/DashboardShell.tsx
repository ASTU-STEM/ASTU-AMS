import React, { useEffect, useState } from 'react';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';
import { AppSidebar, SidebarNavItem } from './AppSidebar';
import HelpCenter from './HelpCenter';
import toast from 'react-hot-toast';
import { useTheme } from '../hooks/useTheme';

export interface DashboardShellProps {
  children: React.ReactNode;
  sidebarItems: SidebarNavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  title: string;
  subtitle: string;
  brand: string;
  userName: string;
  userRole: string;
  userInitials: string;
  sidebarLogo?: React.ReactNode;
  onLogout: () => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  headerChildren?: React.ReactNode;
}

interface Notification {
  id: number;
  text: string;
  unread: boolean;
  time: string;
}

export function DashboardShell({
   children,
   sidebarItems,
   activeTab,
   onTabChange,
   title,
   subtitle,
   brand,
   userName,
   userRole,
   userInitials,
   sidebarLogo,
   onLogout,
   searchPlaceholder = 'Search resources...',
   onSearch,
   headerChildren,
 }: DashboardShellProps) {
  const { darkMode, toggleTheme } = useTheme();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(`dashboard_shell_${brand}_collapsed`) === 'true'
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, text: 'New system update available', unread: true, time: '2 hours ago' },
    { id: 2, text: '3 pending approval requests', unread: true, time: '1 day ago' },
    { id: 3, text: 'Database backup completed', unread: false, time: '3 days ago' },
  ]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notif-panel]') && !target.closest('[data-notif-btn]')) {
        setNotificationOpen(false);
      }
      if (!target.closest('[data-menu-panel]') && !target.closest('[data-menu-btn]')) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on tab change
  useEffect(() => {
    setNotificationOpen(false);
    setMenuOpen(false);
    setMobileSidebarOpen(false);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(`dashboard_shell_${brand}_collapsed`, String(sidebarCollapsed));
  }, [brand, sidebarCollapsed]);

// Sync theme

   // Logout handler
  const handleLocalLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  const unreadNotifCount = notifications.filter((n) => n.unread).length;
  const sidebarDisplayCollapsed = sidebarCollapsed && !mobileSidebarOpen;

  return (
    <>
    <div className="app-shell flex h-dvh w-full overflow-hidden bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"
        />
      )}
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 h-dvh w-64 flex-shrink-0 overflow-hidden transition-all duration-300 md:relative md:z-20 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <AppSidebar
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={onTabChange}
          collapsed={sidebarDisplayCollapsed}
          title={title}
          subtitle={subtitle}
          logo={sidebarDisplayCollapsed ? undefined : sidebarLogo}
          onLogout={handleLocalLogout}
        />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header
          className="flex h-16 flex-shrink-0 items-center justify-between border-b px-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-6"
          style={{
            background: 'var(--bg-navbar)',
            borderColor: 'var(--border-color)',
          }}
        >
          {/* Left: Breadcrumb */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="hidden h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:inline-flex"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
                <span>{brand}</span>
                <span>/</span>
                <span className="truncate">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/_/g, ' ')}
                </span>
              </div>
              <h1 className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">
                {activeTab === 'dashboard'
                  ? 'Dashboard'
                  : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/_/g, ' ')}
              </h1>
            </div>
          </div>

          {/* Right: Search + Theme + Notif + Profile */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <label
              className="group hidden h-11 w-[420px] max-w-[36vw] items-center rounded-full border bg-[#F3F5FA] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 md:flex focus-within:border-[#003580] focus-within:ring-2 focus-within:ring-[#003580]/10 dark:bg-[#1E2130]"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[#8FA3BF]">
                <Search className="h-4.5 w-4.5 flex-none" />
              </span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full bg-transparent outline-none placeholder:text-[#7C879D] dark:placeholder:text-[#97A0B8]"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </label>

            {headerChildren}

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                toast.success(darkMode ? 'Light theme activated' : 'Dark theme activated');
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                data-notif-btn
                onClick={() => setNotificationOpen((v) => !v)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-semibold leading-none text-white">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div
                  data-notif-panel
                className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                >
                  <div className="border-b border-[var(--border-color)] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">Notifications</div>
                        <div className="text-xs text-[var(--text-secondary)]">Recent updates</div>
                      </div>
                      <button
                        onClick={() => setNotifications([])}
                        className="text-xs font-semibold text-[#E24B4A] hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-60 space-y-1 overflow-y-auto p-2">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, unread: false } : x));
                            setNotificationOpen(false);
                            const lower = n.text.toLowerCase();
                            if (lower.includes('job')) onTabChange('jobs');
                            else if (lower.includes('survey')) onTabChange('surveys');
                            else if (lower.includes('mentor')) onTabChange('mentorship');
                            else if (lower.includes('document')) onTabChange('documents');
                          }}
                          className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-black/5"
                        >
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${n.unread ? 'bg-[#003580]' : 'bg-gray-300'
                              }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-[var(--text-primary)]">{n.text}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{n.time}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifications((prev) => prev.filter((x) => x.id !== n.id));
                            }}
                            className="shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="px-2 py-6 text-center text-sm text-[var(--text-secondary)]">
                        No notifications
                      </p>
                    )}
                  </div>
                  <div className="border-t border-[var(--border-color)] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationOpen(false);
                        onTabChange('jobs');
                      }}
                      className="text-sm font-semibold text-[#003580] hover:underline"
                    >
                      View all →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                data-menu-btn
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-3 rounded-[8px] border bg-[var(--bg-card)] px-2.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#003580] text-xs font-semibold text-white">
                  {userInitials}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{userName}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{userRole}</div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              </button>

              {menuOpen && (
                <div
                  data-menu-panel
                  className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                >
                  <div className="px-3 py-3">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{userName}</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-md bg-[#003366]/10 px-2 py-0.5 text-xs font-medium text-[#003366] border border-[#003366]/15">
                        {userRole}
                      </span>
                    </div>
                  </div>
                  <div className="my-1 h-px bg-[var(--border-color)]" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      toast('Profile panel coming soon');
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      toast('Settings coming soon');
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
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
                    onClick={handleLocalLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#E24B4A] hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto bg-[var(--bg-page)] p-6 lg:p-8 outline-none"
          style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}
        >
          {children}
        </main>
      </div>
    </div>

    <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
