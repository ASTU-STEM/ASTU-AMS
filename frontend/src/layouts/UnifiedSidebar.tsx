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
  CalendarDays,
  Globe,
  Image as ImageIcon,
  Layers3,
  Newspaper,
  Plus,
  Users,
  ClipboardCheck,
} from 'lucide-react';
import type { AdminNavItem } from '../features/admin/types/admin.types';
import { adminService } from '../features/admin/services/admin.service';
import { useAuth } from '../contexts/AuthContext';
import { useSystemSettings } from '../context/SystemSettingsContext';

interface UnifiedSidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenAiAssistant?: () => void;
}

type BadgeVariant = 'action' | 'info';

interface EnhancedNavItem extends AdminNavItem {
  badge?: string | number;
  badgeVariant?: BadgeVariant;
  badgeLabel?: string;
  section?: string;
  tooltip?: string;
  roleAccess?: 'admin' | 'cms' | 'both';
}

const STATS_REFRESH_MS = 60_000;

const navItems: EnhancedNavItem[] = [
  // Alumni Office / CMS Section
  { label: 'Dashboard', path: '/cms/dashboard', icon: LayoutDashboard, exact: true, section: 'alumni-office', tooltip: 'Alumni Office overview & statistics', roleAccess: 'both' },
  { label: 'Registrations', path: '/cms/registrations', icon: ClipboardCheck, section: 'alumni-office', tooltip: 'Tracer study & event registrations', roleAccess: 'both' },
  { label: 'Events & Workshops', path: '/cms/events', icon: CalendarDays, section: 'alumni-office', tooltip: 'Manage alumni reunions & workshops', roleAccess: 'both' },
  { label: 'Messages', path: '/cms/messages', icon: MessageSquareText, section: 'alumni-office', tooltip: 'Internal messaging & communication', roleAccess: 'both' },
  { label: 'Notifications', path: '/cms/notifications', icon: Bell, section: 'alumni-office', tooltip: 'System notifications & alerts', roleAccess: 'both' },

  // Content Management Section
  { label: 'Pages & Homepage CMS', path: '/cms/homepage', icon: Layers3, section: 'content-management', tooltip: 'Manage homepage sections, Overview, Contact Us & institutional pages', roleAccess: 'both' },
  { label: 'Partners & Employers', path: '/cms/partners', icon: Briefcase, section: 'content-management', tooltip: 'Manage /partners portal, employer benefits & logos', roleAccess: 'both' },
  { label: 'Announcements', path: '/cms/content', icon: Newspaper, section: 'content-management', tooltip: 'Alumni announcements & public notices', roleAccess: 'both' },
  { label: 'Community', path: '/cms/community', icon: Users, section: 'content-management', tooltip: 'Alumni community & member profiles', roleAccess: 'both' },
  { label: 'Media & Gallery', path: '/cms/media-gallery', icon: ImageIcon, section: 'content-management', tooltip: 'Unified media library, asset uploads & campus photo gallery', roleAccess: 'both' },
  { label: 'SEO', path: '/cms/seo', icon: Globe, section: 'content-management', tooltip: 'Search engine optimization & indexing', roleAccess: 'both' },
  { label: 'Approvals', path: '/cms/approvals', icon: ShieldCheck, section: 'content-management', tooltip: 'Pending reviews & approvals', roleAccess: 'both' },
  { label: 'Settings', path: '/cms/settings', icon: Settings, section: 'content-management', tooltip: 'CMS & office configurations', roleAccess: 'both' },

  // System Administration Section
  { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, exact: true, section: 'system-admin', tooltip: 'Operational command center', roleAccess: 'admin' },
  { label: 'Messages', path: '/admin/messages', icon: MessageSquareText, section: 'system-admin', tooltip: 'Direct messaging hub', roleAccess: 'admin' },
  { label: 'Support Desk', path: '/admin/support-tickets', icon: LifeBuoy, section: 'system-admin', tooltip: 'User support tickets & help desk', roleAccess: 'admin' },
  { label: 'Super Admin Modules', path: '/admin/modules', icon: Shield, section: 'system-admin', tooltip: 'Advanced system modules', roleAccess: 'admin' },
  { label: 'Knowledge Hub', path: '/admin/knowledge-hub', icon: BookOpen, section: 'system-admin', tooltip: 'RAG knowledge base & FAQ corpus', roleAccess: 'admin' },
  { label: 'Reports Center', path: '/admin/reports', icon: FileBarChart, section: 'system-admin', tooltip: 'Generate & export reports', roleAccess: 'admin' },
  { label: 'User Management', path: '/admin/users', icon: Users, section: 'system-admin', tooltip: 'Accounts & pending verifications', roleAccess: 'admin' },
  { label: 'Role Management', path: '/admin/roles', icon: ShieldCheck, section: 'system-admin', tooltip: 'Manage roles & permissions', roleAccess: 'admin' },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, section: 'system-admin', tooltip: 'Platform analytics overview', roleAccess: 'admin' },
  { label: 'Survey Management', path: '/admin/surveys', icon: ClipboardList, section: 'system-admin', tooltip: 'Active surveys & tracer studies', roleAccess: 'admin' },
  { label: 'Jobs Management', path: '/admin/jobs', icon: Briefcase, section: 'system-admin', tooltip: 'Published job posts', roleAccess: 'admin' },
  { label: 'Departments', path: '/admin/departments', icon: GraduationCap, section: 'system-admin', tooltip: 'Academic departments', roleAccess: 'admin' },
  { label: 'Donations & Giving', path: '/admin/donations', icon: Heart, section: 'system-admin', tooltip: 'Fundraising causes & donors', roleAccess: 'admin' },

  // Configuration Section
  { label: 'Notification Center', path: '/admin/notifications', icon: Bell, section: 'configuration', tooltip: 'Compose alerts & track delivery', roleAccess: 'admin' },
  { label: 'System Logs', path: '/admin/logs', icon: ScrollText, section: 'configuration', tooltip: 'Audit trail, auth events & platform activity', roleAccess: 'admin' },
  { label: 'Backup & Security', path: '/admin/backup', icon: LockKeyhole, section: 'configuration', tooltip: 'Backup & security settings', roleAccess: 'admin' },
  { label: 'System Settings', path: '/admin/settings', icon: Settings, section: 'configuration', tooltip: 'University, email, integrations & branding', roleAccess: 'admin' },
];

const sections = [
  { key: 'alumni-office', label: 'Alumni Office', roleAccess: 'both' },
  { key: 'content-management', label: 'Content Management', roleAccess: 'both' },
  { key: 'system-admin', label: 'System Administration', roleAccess: 'admin' },
  { key: 'configuration', label: 'Configuration', roleAccess: 'admin' },
];

function formatCount(count: number): string {
  if (count > 999) return '999+';
  return String(count);
}

function badgeClasses(variant: BadgeVariant, isActive: boolean, collapsed: boolean): string {
  if (collapsed) {
    return variant === 'action'
      ? 'absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[7px] font-extrabold text-white shadow-lg'
      : 'absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-slate-500 text-[7px] font-extrabold text-white shadow-lg';
  }

  if (variant === 'action') {
    return isActive
      ? 'ml-1.5 shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs'
      : 'ml-1.5 shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 shadow-xs';
  }

  return isActive
    ? 'ml-1.5 shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-[#003580] text-white shadow-xs'
    : 'ml-1.5 shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80 shadow-xs';
}

export default function UnifiedSidebar({ onLogout, isOpen = false, onNavigate, collapsed = false, onToggleCollapse, onOpenAiAssistant }: UnifiedSidebarProps) {
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

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const isCms = true;

  const fetchStats = React.useCallback(() => {
    if (!isAdmin) return;
    adminService.getSidebarStats().then((res) => {
      if (res.ok) {
        setStats({
          users: res.data.pendingVerifications || 0,
          surveys: res.data.activeSurveys || 0,
          jobs: res.data.activeJobs || 0,
          notifications: res.data.unreadNotifications || 0,
          supportTickets: res.data.openSupportTickets || 0,
        });
      }
    }).catch(() => {
      /* keep last known counts */
    });
  }, [isAdmin]);

  React.useEffect(() => {
    fetchStats();
    if (!isAdmin) return undefined;
    const intervalId = window.setInterval(fetchStats, STATS_REFRESH_MS);
    const onFocus = () => fetchStats();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchStats, isAdmin]);

  React.useEffect(() => {
    fetchStats();
  }, [location.pathname, fetchStats]);

  const dynamicNavItems = navItems.map((item) => {
    // Only decorate admin-side items with sidebar stats
    if (item.roleAccess !== 'admin') return item;

    if (item.label === 'User Management') {
      const count = stats.users;
      return {
        ...item,
        badge: count > 0 ? formatCount(count) : undefined,
        badgeVariant: 'action' as BadgeVariant,
        badgeLabel: `${count} pending verifications`,
        tooltip: count > 0 ? `${count} pending verifications` : item.tooltip,
      };
    }
    if (item.label === 'Support Desk') {
      const count = stats.supportTickets;
      return {
        ...item,
        badge: count > 0 ? formatCount(count) : undefined,
        badgeVariant: 'action' as BadgeVariant,
        badgeLabel: `${count} open support tickets`,
        tooltip: count > 0 ? `${count} open support tickets` : item.tooltip,
      };
    }
    if (item.label === 'Survey Management') {
      const count = stats.surveys;
      return {
        ...item,
        badge: count > 0 ? formatCount(count) : undefined,
        badgeVariant: 'info' as BadgeVariant,
        badgeLabel: `${count} active surveys`,
        tooltip: count > 0 ? `${count} active surveys` : item.tooltip,
      };
    }
    if (item.label === 'Jobs Management') {
      const count = stats.jobs;
      return {
        ...item,
        badge: count > 0 ? formatCount(count) : undefined,
        badgeVariant: 'info' as BadgeVariant,
        badgeLabel: `${count} active job posts`,
        tooltip: count > 0 ? `${count} active job posts` : item.tooltip,
      };
    }
    if (item.path === '/admin/notifications') {
      const count = stats.notifications;
      return {
        ...item,
        badge: count > 0 ? formatCount(count) : undefined,
        badgeVariant: 'action' as BadgeVariant,
        badgeLabel: `${count} unread notifications`,
        tooltip: count > 0 ? `${count} unread notifications` : item.tooltip,
      };
    }
    return item;
  });

  const getSectionItems = (sectionKey: string) => {
    const section = sections.find((s) => s.key === sectionKey);
    if (!section) return [];
    return dynamicNavItems.filter((item) => {
      if (item.section !== sectionKey) return false;
      if (item.roleAccess === 'admin' && !isAdmin) return false;
      if (item.roleAccess === 'both' && !isAdmin && !isCms) return false;
      return true;
    });
  };

  const visibleSections = sections.filter((section) => {
    if (section.roleAccess === 'admin' && !isAdmin) return false;
    if (section.roleAccess === 'both' && !isAdmin && !isCms) return false;
    return getSectionItems(section.key).length > 0;
  });

  const userDisplayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : isAdmin ? 'System Administrator' : 'Alumni Relations Officer';
  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : isAdmin ? 'SA' : 'AO';

  return (
    <aside
      aria-label="Workspace sidebar"
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] text-[var(--text-primary)] shadow-xs transition-all duration-300 lg:translate-x-0 ${
        collapsed ? 'w-20' : 'w-72'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Sidebar Logo Header */}
      <div className="relative shrink-0 px-4 py-4 border-b border-[var(--border-color)] bg-[var(--bg-sidebar)]">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative shrink-0 flex items-center justify-center h-10 w-10">
            <img
              src={
                settings.appearance?.logoUrl && !settings.appearance.logoUrl.includes('googleusercontent')
                  ? settings.appearance.logoUrl
                  : '/images/astu-seal-logo.png'
              }
              alt={`${settings.general?.abbreviation || 'ASTU'} Logo`}
              className="h-full w-full object-contain scale-105"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold tracking-tight text-[var(--text-primary)] text-[18px] leading-tight truncate">
                {settings.general?.abbreviation || 'ASTU'} {isAdmin ? 'Admin' : 'CMS'}
              </div>
              <p className="text-[9.5px] text-[#003580] dark:text-[#22D3EE] uppercase tracking-wider font-extrabold leading-snug truncate">
                {isAdmin ? 'System Administration' : 'Alumni Relations Office'}
              </p>
            </div>
          )}
        </div>

        {!collapsed && isCms && (
          <NavLink
            to="/cms/content"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#003366] hover:bg-[#002855] px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-sm shadow-[#003366]/15 group cursor-pointer"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" aria-hidden="true" />
            <span>Broadcast Notice</span>
          </NavLink>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="relative flex-1 overflow-y-auto px-3 py-4 scrollbar-thin space-y-5" aria-label="Workspace navigation">
        {visibleSections.map((section) => {
          const items = getSectionItems(section.key);
          if (items.length === 0) return null;
          return (
            <div key={section.key} role="group" aria-label={section.label}>
              {!collapsed && (
                <div className="px-3 mb-2">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{section.label}</p>
                </div>
              )}
              {collapsed && (
                <div className="mx-auto mb-2 h-px w-8 bg-slate-200" aria-hidden="true" />
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);
                  const variant = item.badgeVariant || 'action';
                  const ariaLabel = item.badge
                    ? `${item.label}, ${item.badgeLabel || item.badge}`
                    : item.label;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      onClick={() => {
                        if (onNavigate) onNavigate();
                      }}
                      title={collapsed ? item.tooltip || item.label : item.tooltip}
                      aria-label={ariaLabel}
                      className={`nav-btn w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 text-left group relative ${
                        collapsed ? 'justify-center' : 'gap-2.5'
                      } ${
                        isActive
                          ? 'bg-[#003580]/10 text-[#003580] font-bold shadow-2xs ring-1 ring-[#003580]/20'
                          : 'text-slate-600 hover:text-[#003580] hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                          isActive ? 'bg-[#003580] text-white shadow-xs' : 'bg-slate-100 text-slate-500 group-hover:text-[#003580]'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                        {item.badge && collapsed && (
                          <span className={badgeClasses(variant, isActive, true)} aria-hidden="true">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      {!collapsed && (
                        <span className="text-sm font-medium flex-1 truncate text-left min-w-0">
                          {item.label}
                        </span>
                      )}
                      {item.badge && !collapsed && (
                        <span
                          className={badgeClasses(variant, isActive, false)}
                          aria-label={item.badgeLabel || String(item.badge)}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && !item.badge && !collapsed && (
                        <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-[#003580] shrink-0" aria-hidden="true" />
                      )}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                          {item.label}
                          {item.badge && (
                            <span className={`ml-1.5 font-bold ${variant === 'action' ? 'text-rose-400' : 'text-slate-300'}`}>
                              ({item.badge})
                            </span>
                          )}
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
      <div className="relative shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-sidebar)] p-3 space-y-2">
        {!collapsed ? (
          <>
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="flex w-full items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 px-3.5 py-2.5 text-sm font-medium text-amber-900 transition-all hover:bg-amber-500/15 shadow-2xs"
              >
                <Sparkles className="h-4.5 w-4.5 text-amber-600 animate-pulse shrink-0" aria-hidden="true" />
                <div className="text-left flex-1 min-w-0">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700">ASTU AI</div>
                  <div className="text-[9px] text-amber-600/80 truncate">Tracer &amp; Analytics Assistant</div>
                </div>
              </button>
            )}

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200/60 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003580] text-xs font-bold text-white shrink-0" aria-hidden="true">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900">{userDisplayName}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {user?.role === 'SUPER_ADMIN' ? 'Super Admin'
                      : user?.role === 'ADMIN' ? 'Administrator'
                      : user?.role === 'CMS_MANAGER' ? 'CMS Manager'
                      : user?.role === 'ALUMNI_OFFICE' ? 'Alumni Office'
                      : user?.role === 'REGISTRAR' ? 'Registrar Officer'
                      : 'Alumni Affairs Officer'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2 text-xs font-bold text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Logout</span>
              <span className="ml-auto text-[8px] text-rose-400 font-medium">Alt+L</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 border border-amber-200 text-amber-700 hover:bg-amber-200 transition-all shrink-0 shadow-xs"
                title="ASTU AI"
                aria-label="Open ASTU AI assistant"
              >
                <Sparkles className="h-4.5 w-4.5 text-amber-600 animate-pulse" aria-hidden="true" />
              </button>
            )}

            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003580] text-xs font-bold text-white"
              title={userDisplayName}
              aria-label={userDisplayName}
            >
              {userInitials}
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center justify-center w-8 h-8 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          className={`flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all ${collapsed ? 'w-full py-1.5' : 'w-full py-2 gap-2'}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
