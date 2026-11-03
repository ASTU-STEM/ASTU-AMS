import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
} from 'lucide-react';
import type { AdminNavItem } from '../features/admin/types/admin.types';
import AdminBadge from '../features/admin/components/AdminBadge';
import { adminService } from '../features/admin/services/admin.service';
import { useAuth } from '../contexts/AuthContext';
import { useSystemSettings } from '../context/SystemSettingsContext';
import { resolveLogoUrl } from '../config';

interface AdminSidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenAiAssistant?: () => void;
}

interface EnhancedNavItem extends AdminNavItem {
  badge?: string | number;
  section?: string;
  tooltip?: string;
}

const navItems: EnhancedNavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, exact: true, section: 'main', tooltip: 'Operational command center' },
  { label: 'Messages', path: '/admin/messages', icon: MessageSquareText, section: 'main', tooltip: 'ASTU_AMS direct messaging hub' },
  { label: 'Support Desk', path: '/admin/support-tickets', icon: LifeBuoy, section: 'system', tooltip: 'User support tickets & help desk' },
  { label: 'Super Admin Modules', path: '/admin/modules', icon: Shield, section: 'system', tooltip: 'Advanced system modules' },
  { label: 'Knowledge Hub', path: '/admin/knowledge-hub', icon: BookOpen, section: 'system', tooltip: 'RAG knowledge base & FAQ corpus' },
  { label: 'Reports Center', path: '/admin/reports', icon: FileBarChart, section: 'system', tooltip: 'Generate & export reports' },
  { label: 'User Management', path: '/admin/users', icon: Users, section: 'system', tooltip: 'Pending verifications' },
  { label: 'Role Management', path: '/admin/roles', icon: ShieldCheck, section: 'system', tooltip: 'Manage roles & permissions' },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, section: 'system', tooltip: 'View platform analytics' },
  { label: 'Survey Management', path: '/admin/surveys', icon: ClipboardList, section: 'system', tooltip: 'Active surveys' },
  { label: 'Jobs Management', path: '/admin/jobs', icon: Briefcase, section: 'system', tooltip: 'Active job posts' },
  { label: 'Departments', path: '/admin/departments', icon: GraduationCap, section: 'system', tooltip: 'Manage departments' },
  { label: 'Donations & Giving', path: '/admin/donations', icon: Heart, section: 'system', tooltip: 'Fundraising causes & Chapa donors' },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell, section: 'settings', tooltip: 'Unread notifications' },
  { label: 'System Logs', path: '/admin/logs', icon: ScrollText, section: 'settings', tooltip: 'Audit trail & system logs' },
  { label: 'Backup & Security', path: '/admin/backup', icon: LockKeyhole, section: 'settings', tooltip: 'Backup & security settings' },
  { label: 'Settings', path: '/admin/settings', icon: Settings, section: 'settings', tooltip: 'System configuration' },
];

const sections = [
  { key: 'main', label: 'Main Navigation' },
  { key: 'system', label: 'System Administration' },
  { key: 'settings', label: 'Configuration' },
];

export default function AdminSidebar({ onLogout, isOpen = false, onNavigate, collapsed = false, onToggleCollapse, onOpenAiAssistant }: AdminSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { settings } = useSystemSettings();

  const [stats, setStats] = React.useState({
    users: 0,
    surveys: 0,
    jobs: 0,
    notifications: 0,
    supportTickets: 0,
  });

  const [seenPaths, setSeenPaths] = React.useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('astu_admin_seen_sidebar_badges');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  // Mark current route as seen automatically
  React.useEffect(() => {
    if (location.pathname) {
      setSeenPaths((prev) => {
        if (prev[location.pathname]) return prev;
        const updated = { ...prev, [location.pathname]: true };
        try {
          localStorage.setItem('astu_admin_seen_sidebar_badges', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    }
  }, [location.pathname]);

  const markAsSeen = (path: string) => {
    setSeenPaths((prev) => {
      const updated = { ...prev, [path]: true };
      try {
        localStorage.setItem('astu_admin_seen_sidebar_badges', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  React.useEffect(() => {
    adminService.getSidebarStats().then(res => {
      if (res.ok) {
        setStats({
          users: res.data.pendingVerifications || 0,
          surveys: res.data.activeSurveys || 0,
          jobs: res.data.activeJobs || 0,
          notifications: res.data.unreadNotifications || 0,
          supportTickets: res.data.openSupportTickets || 0,
        });
      }
    });
  }, []);

  const dynamicNavItems = navItems.map(item => {
    const isCurrentlyActive = item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

    const isSeen = seenPaths[item.path] || isCurrentlyActive;

    if (item.label === 'User Management') {
      const count = stats.users;
      return {
        ...item,
        badge: (!isSeen && count > 0) ? count.toString() : undefined,
        tooltip: `${count} pending verifications`,
      };
    }
    if (item.label === 'Support Desk') {
      const count = stats.supportTickets;
      return {
        ...item,
        badge: (!isSeen && count > 0) ? count.toString() : undefined,
        tooltip: `${count} open support tickets`,
      };
    }
    if (item.label === 'Survey Management') {
      const count = stats.surveys;
      return {
        ...item,
        badge: (!isSeen && count > 0) ? count.toString() : undefined,
        tooltip: `${count} active surveys`,
      };
    }
    if (item.label === 'Jobs Management') {
      const count = stats.jobs;
      return {
        ...item,
        badge: (!isSeen && count > 0) ? count.toString() : undefined,
        tooltip: `${count} active job posts`,
      };
    }
    if (item.label === 'Notifications') {
      const count = stats.notifications;
      return {
        ...item,
        badge: (!isSeen && count > 0) ? count.toString() : undefined,
        tooltip: `${count} unread notifications`,
      };
    }
    return item;
  });

  const getSectionItems = (sectionKey: string) =>
    dynamicNavItems.filter(item => item.section === sectionKey);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] text-[var(--text-primary)] shadow-xs transition-all duration-300 lg:translate-x-0 ${
          collapsed ? 'w-20' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar Logo Header */}
        <div className="relative px-4 py-4 border-b border-[var(--border-color)] bg-[var(--bg-sidebar)]">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="group/logo relative shrink-0 flex items-center justify-center h-10 w-10">
              <img
                src={resolveLogoUrl(settings.appearance?.logoUrl)}
                alt={`${settings.general?.abbreviation || 'ASTU'} Logo`}
                className="h-full w-full object-contain scale-105"
              />
            </div>
            {!collapsed && (
              <div>
                <div className="font-bold tracking-tight text-[var(--text-primary)] text-[18px] leading-tight">
                  {settings.general?.abbreviation || 'ASTU'} Admin
                </div>
                <p className="text-[9.5px] text-[#003580] dark:text-[#22D3EE] uppercase tracking-wider font-extrabold leading-snug">
                  {(settings.general?.portalTitle || 'Alumni Management System').replace(/^ASTU\s+/i, '')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="relative flex-1 overflow-y-auto px-3 py-4 scrollbar-thin space-y-4">
          {sections.map(section => {
            const items = getSectionItems(section.key);
            if (items.length === 0) return null;
            return (
              <div key={section.key}>
                {!collapsed && (
                  <div className="px-3 mb-2">
                    <p className="text-[9px] font-extrabold text-slate-400 dark:text-[var(--text-muted)] uppercase tracking-widest">{section.label}</p>
                  </div>
                )}
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? location.pathname === item.path
                      : location.pathname.startsWith(item.path);
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        onClick={() => {
                          markAsSeen(item.path);
                          if (onNavigate) onNavigate();
                        }}
                        title={collapsed ? item.tooltip || item.label : undefined}
                        className={`nav-btn w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 text-left group relative ${
                          collapsed ? 'justify-center' : 'gap-2.5'
                        } ${
                          isActive
                            ? 'bg-[#003580]/10 text-[#003580] dark:bg-[#2196F3] dark:text-white font-bold shadow-2xs ring-1 ring-[#003580]/20 dark:ring-[#2196F3]/40'
                            : 'text-slate-600 dark:text-[var(--text-secondary)] hover:text-[#003580] dark:hover:text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-[var(--bg-card)]'
                        }`}
                      >
                        <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-[#003580] dark:bg-[var(--bg-card-secondary)] dark:text-[#22D3EE] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-500 dark:bg-[var(--bg-card)] dark:text-[var(--text-muted)] group-hover:text-[#003580] dark:group-hover:text-[var(--accent-cyan)] dark:group-hover:bg-[var(--bg-card-secondary)]'
                        }`}>
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        {!collapsed && <span className="text-sm font-medium flex-1 truncate text-left">{item.label}</span>}
                        {item.badge && !collapsed && (
                          <span className={`flex items-center justify-center min-w-[20px] h-4.5 px-1.5 rounded-full text-[10px] font-bold shadow-xs ${
                            isActive
                              ? 'bg-rose-500 text-white'
                              : 'bg-rose-100 text-rose-700 dark:bg-[#3B1A22] dark:text-[#F87171] dark:border dark:border-[#F87171]/20'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {item.badge && collapsed && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[7px] font-extrabold text-white shadow-lg">
                            {item.badge}
                          </span>
                        )}
                        {isActive && !item.badge && !collapsed && (
                          <div className="ml-1 w-1.5 h-1.5 rounded-full bg-[#003580] dark:bg-[#22D3EE] shrink-0" />
                        )}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                            {item.label}
                            {item.badge && <span className="ml-1.5 text-rose-400 font-bold">({item.badge})</span>}
                          </div>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative border-t border-[var(--border-color)] bg-[var(--bg-sidebar)] p-3 space-y-2">
          {!collapsed ? (
            <>
              {/* AI Copilot Launch Button */}
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="flex w-full items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 px-3.5 py-2.5 text-sm font-medium text-amber-900 dark:text-amber-200 dark:bg-[var(--bg-card)] dark:border-[var(--border-color)] dark:hover:bg-[var(--bg-card-secondary)] transition-all hover:bg-amber-500/15 shadow-2xs group"
              >
                <Sparkles className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">ASTU AI</div>
                  <div className="text-[9px] text-amber-600/80 dark:text-[var(--text-muted)] truncate">Tracer &amp; Analytics Assistant</div>
                </div>
              </button>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-[var(--bg-card)] border border-slate-200/60 dark:border-[var(--border-color)] p-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003580] text-xs font-bold text-white shrink-0">
                  {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'SA'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-[var(--text-primary)]">{user ? `${user.firstName} ${user.lastName}` : 'System Administrator'}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 dark:text-[var(--text-muted)] uppercase">{user?.role === 'SUPER_ADMIN' ? 'Root Admin' : 'ICT Administrator'}</span>
                  </div>
                </div>
              </div>

              <button type="button" onClick={onLogout}
                className="flex w-full items-center gap-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/50 dark:bg-[#251419] px-3 py-2 text-xs font-bold text-rose-600 dark:text-[#F87171] transition-all hover:bg-rose-100 dark:hover:bg-[#331720] hover:text-rose-700">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
                <span className="ml-auto text-[8px] text-rose-400 font-medium">Alt+L</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-[var(--bg-card)] border border-amber-200 dark:border-[var(--border-color)] text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-[var(--bg-card-secondary)] transition-all group relative shrink-0 shadow-xs"
                title="ASTU AI"
              >
                <Sparkles className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 animate-pulse" />
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003580] text-xs font-bold text-white" title={user ? `${user.firstName} ${user.lastName}` : 'System Administrator'}>
                {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'SA'}
              </div>
              <button type="button" onClick={onLogout}
                className="flex items-center justify-center w-8 h-8 rounded-xl border border-rose-100 dark:border-rose-900/40 bg-rose-50 dark:bg-[#251419] text-rose-600 dark:text-[#F87171] hover:bg-rose-100 dark:hover:bg-[#331720] transition-all"
                title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`flex items-center justify-center rounded-xl text-slate-400 dark:text-[var(--text-muted)] hover:text-slate-600 dark:hover:text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-[var(--bg-card)] transition-all ${collapsed ? 'w-full py-1.5' : 'w-full py-2 gap-2'}`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wider">Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
