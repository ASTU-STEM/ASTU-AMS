import React, { useEffect, useState } from 'react';
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AppSidebar, type SidebarNavItem, type SidebarNavSection } from './AppSidebar';
import HelpCenter from '../components/HelpCenter';
import {
  NotificationCenterModal,
  NotificationDetailModal,
  type ShellNotification,
} from '../components/dashboard/NotificationModals';
import { useTheme } from '../hooks/useTheme';
import { SHELL_TOPBAR_CLASS } from './sidebarShared';

export type DashboardNotification = ShellNotification;

export interface DashboardMenuAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

export interface DashboardShellProps {
  children: React.ReactNode;
  /** Flat nav items (used when sections are not provided) */
  sidebarItems?: SidebarNavItem[];
  /** Grouped nav sections (preferred for role dashboards) */
  sidebarSections?: SidebarNavSection[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  title: string;
  subtitle: string;
  brand: string;
  userName: string;
  userRole: string;
  userInitials: string;
  onLogout: () => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  searchValue?: string;
  headerChildren?: React.ReactNode;
  notifications?: DashboardNotification[];
  /** Mark all as read (Alumni-style) */
  onClearNotifications?: () => void;
  /** Mark a single notification as read */
  onMarkNotificationRead?: (notification: DashboardNotification) => void;
  onNotificationClick?: (notification: DashboardNotification) => void;
  onViewAllNotifications?: () => void;
  /** When true (default), shell owns detail + "view all" modals like Alumni */
  builtInNotificationModals?: boolean;
  menuActions?: DashboardMenuAction[];
  logoSrc?: string;
}

/**
 * Shared role-dashboard chrome used by Alumni / Registrar / Employer / Department.
 * Matches the Alumni + Admin white shell: sidebar, header, theme, notifications, logout.
 */
export function DashboardShell({
  children,
  sidebarItems = [],
  sidebarSections,
  activeTab,
  onTabChange,
  title,
  subtitle,
  brand,
  userName,
  userRole,
  userInitials,
  onLogout,
  searchPlaceholder = 'Search resources...',
  onSearch,
  searchValue,
  headerChildren,
  notifications: notificationsProp,
  onClearNotifications,
  onMarkNotificationRead,
  onNotificationClick,
  onViewAllNotifications,
  builtInNotificationModals = true,
  menuActions,
  logoSrc,
}: DashboardShellProps) {
  const { darkMode, toggleTheme } = useTheme();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(`dashboard_shell_${brand}_collapsed`) === 'true'
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [internalNotifications, setInternalNotifications] = useState<DashboardNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<DashboardNotification | null>(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const notifications = notificationsProp ?? internalNotifications;

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

  useEffect(() => {
    setNotificationOpen(false);
    setMenuOpen(false);
    setMobileSidebarOpen(false);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(`dashboard_shell_${brand}_collapsed`, String(sidebarCollapsed));
  }, [brand, sidebarCollapsed]);

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  const markAllRead = () => {
    if (onClearNotifications) onClearNotifications();
    else setInternalNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('All notifications marked as read.');
  };

  const markOneRead = (n: DashboardNotification) => {
    if (onMarkNotificationRead) onMarkNotificationRead(n);
    else if (!notificationsProp) {
      setInternalNotifications((prev) =>
        prev.map((item) => (String(item.id) === String(n.id) ? { ...item, unread: false } : item))
      );
    }
  };

  const openNotification = (n: DashboardNotification) => {
    setNotificationOpen(false);
    if (n.unread) markOneRead(n);
    if (onNotificationClick) onNotificationClick(n);
    if (builtInNotificationModals) setSelectedNotification(n);
  };

  const openAllNotifications = () => {
    setNotificationOpen(false);
    if (onViewAllNotifications) onViewAllNotifications();
    if (builtInNotificationModals) setShowAllNotifications(true);
  };

  const unreadNotifCount = notifications.filter((n) => n.unread).length;
  const sidebarDisplayCollapsed = sidebarCollapsed && !mobileSidebarOpen;
  const pageTitle =
    activeTab === 'dashboard'
      ? 'Dashboard'
      : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/_/g, ' ');

  const defaultMenuActions: DashboardMenuAction[] = menuActions ?? [
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User className="h-4 w-4" />,
      onClick: () => toast('Profile panel coming soon'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      onClick: () => toast('Settings coming soon'),
    },
  ];

  return (
    <>
      <div className="role-shell flex h-dvh w-full overflow-hidden bg-[var(--bg-page)] font-['Inter',sans-serif] text-[var(--text-primary)] antialiased">

        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-40 h-dvh w-64 flex-shrink-0 overflow-hidden transition-all duration-300 md:relative md:z-20 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } ${sidebarCollapsed ? 'md:w-[72px]' : 'md:w-64'}`}
        >
          <AppSidebar
            items={sidebarItems}
            sections={sidebarSections}
            activeTab={activeTab}
            onTabChange={onTabChange}
            collapsed={sidebarDisplayCollapsed}
            title={title}
            subtitle={subtitle}
            logoSrc={logoSrc}
            onLogout={handleLogout}
            onHelp={() => setHelpOpen(true)}
          />
        </div>

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <header className={`${SHELL_TOPBAR_CLASS} relative z-20 flex-shrink-0 px-4 sm:px-6`}>
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
                onClick={() => {
                  setSidebarCollapsed(false);
                  setMobileSidebarOpen(true);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 md:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
                  <span>{brand}</span>
                  <span>/</span>
                  <span className="truncate">{pageTitle}</span>
                </div>
                <h1 className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">
                  {pageTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label
                className="group hidden h-11 w-[420px] max-w-[36vw] items-center rounded-full border bg-[var(--bg-input)] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus-within:border-[var(--brand-navy)] focus-within:ring-2 focus-within:ring-[var(--brand-navy)]/10 md:flex"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-[#8FA3BF]">
                  <Search className="h-4 w-4 flex-none" />
                </span>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  className="w-full bg-transparent outline-none placeholder:text-[#7C879D] dark:placeholder:text-[#97A0B8]"
                  onChange={(e) => onSearch?.(e.target.value)}
                />
              </label>

              {headerChildren}

              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  toast.success(darkMode ? 'Light theme activated' : 'Dark theme activated');
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Toggle theme"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              </button>

              <div className="relative">
                <button
                  type="button"
                  data-notif-btn
                  onClick={() => setNotificationOpen((v) => !v)}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10"
                  title={unreadNotifCount > 0 ? `${unreadNotifCount} unread notifications` : 'Notifications'}
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-semibold leading-none text-white animate-pulse">
                      {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div
                    data-notif-panel
                    className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2 shadow-xl"
                  >
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
                          onClick={markAllRead}
                          className="text-[11px] font-bold text-[#003580] hover:underline dark:text-sky-400"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 space-y-1 overflow-y-auto p-1">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => openNotification(n)}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors ${
                              n.unread
                                ? 'bg-blue-50/60 hover:bg-blue-50 dark:bg-sky-950/40 dark:hover:bg-sky-950/60'
                                : 'hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                          >
                            <span
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                n.unread ? 'bg-[#003580]' : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-extrabold text-[var(--text-primary)]">
                                {n.title || 'Notification'}
                              </p>
                              <p className="line-clamp-2 text-xs font-medium leading-snug text-[var(--text-secondary)]">
                                {n.text}
                              </p>
                              <p className="mt-1 text-[10px] font-semibold text-slate-400">{n.time}</p>
                            </div>
                            {n.unread && (
                              <button
                                type="button"
                                title="Mark as read"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markOneRead(n);
                                }}
                                className="shrink-0 rounded p-1 text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="px-3 py-8 text-center text-sm text-[var(--text-secondary)]">
                          No notifications yet
                        </p>
                      )}
                    </div>
                    <div className="border-t border-[var(--border-color)] px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={openAllNotifications}
                        className="text-xs font-extrabold text-[#003580] hover:underline dark:text-sky-400"
                      >
                        View all notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  data-menu-btn
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-3 rounded-[8px] border bg-[var(--bg-card)] px-2.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#004d99] text-xs font-semibold text-white shadow-sm">
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
                        <span className="inline-flex items-center rounded-md border border-[#003366]/15 bg-[#003366]/10 px-2 py-0.5 text-xs font-medium text-[#003366] dark:border-sky-500/20 dark:bg-sky-950/40 dark:text-sky-300">
                          {userRole}
                        </span>
                      </div>
                    </div>
                    <div className="my-1 h-px bg-[var(--border-color)]" />
                    {defaultMenuActions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          action.onClick();
                        }}
                        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 ${
                          action.danger
                            ? 'text-[#E24B4A] hover:bg-rose-50'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                    <div className="my-1 h-px bg-[var(--border-color)]" />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        toggleTheme();
                        toast.success(darkMode ? 'Light theme activated' : 'Dark theme activated');
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/5"
                    >
                      {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                      {darkMode ? 'Light mode' : 'Dark mode'}
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
                      Help
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#E24B4A] hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main
            className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--bg-page)] p-4 sm:p-6 lg:p-8"
            style={{ animation: 'astu-admin-fade-in 150ms ease-out' }}
          >
            <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-6">{children}</div>
          </main>
        </div>
      </div>

      <HelpCenter isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {builtInNotificationModals && selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onNavigateTab={onTabChange}
        />
      )}

      {builtInNotificationModals && showAllNotifications && (
        <NotificationCenterModal
          notifications={notifications}
          unreadCount={unreadNotifCount}
          onClose={() => setShowAllNotifications(false)}
          onMarkAllRead={markAllRead}
          onSelect={(n) => {
            setShowAllNotifications(false);
            openNotification(n);
          }}
        />
      )}
    </>
  );
}

export default DashboardShell;
