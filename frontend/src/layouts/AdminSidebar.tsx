import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Briefcase,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  MessageSquareText,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { AdminNavItem } from '../features/admin/types/admin.types';
import { adminService } from '../features/admin/services/admin.service';
import { useAuth } from '../contexts/AuthContext';
import { useSystemSettings } from '../context/SystemSettingsContext';
import {
  SidebarAiButton,
  SidebarBrand,
  SidebarCollapseButton,
  SidebarFooter,
  SidebarNav,
  SidebarNavLink,
  SidebarSectionLabel,
  SidebarUserCard,
  sidebarShellClass,
} from './sidebarShared';

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
  { label: 'Backup & Security', path: '/admin/backup', icon: Shield, section: 'settings', tooltip: 'Backup & security settings' },
  { label: 'Settings', path: '/admin/settings', icon: Settings, section: 'settings', tooltip: 'System configuration' },
];

const sections = [
  { key: 'main', label: 'Main' },
  { key: 'system', label: 'Administration' },
  { key: 'settings', label: 'Configuration' },
];

export default function AdminSidebar({
  onLogout,
  isOpen = false,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  onOpenAiAssistant,
}: AdminSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { settings } = useSystemSettings();

  const [stats, setStats] = React.useState({
    users: 0,
    surveys: 0,
    jobs: 0,
    notifications: 0,
  });

  const [seenPaths, setSeenPaths] = React.useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('astu_admin_seen_sidebar_badges');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

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
    adminService.getSidebarStats().then((res) => {
      if (res.ok) {
        setStats({
          users: res.data.pendingVerifications || 0,
          surveys: res.data.activeSurveys || 0,
          jobs: res.data.activeJobs || 0,
          notifications: res.data.unreadNotifications || 0,
        });
      }
    });
  }, []);

  const dynamicNavItems = navItems.map((item) => {
    const isCurrentlyActive = item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

    const isSeen = seenPaths[item.path] || isCurrentlyActive;

    if (item.label === 'User Management') {
      const count = stats.users;
      return {
        ...item,
        badge: !isSeen && count > 0 ? count.toString() : undefined,
        tooltip: `${count} pending verifications`,
      };
    }
    if (item.label === 'Survey Management') {
      const count = stats.surveys;
      return {
        ...item,
        badge: !isSeen && count > 0 ? count.toString() : undefined,
        tooltip: `${count} active surveys`,
      };
    }
    if (item.label === 'Jobs Management') {
      const count = stats.jobs;
      return {
        ...item,
        badge: !isSeen && count > 0 ? count.toString() : undefined,
        tooltip: `${count} active job posts`,
      };
    }
    if (item.label === 'Notifications') {
      const count = stats.notifications;
      return {
        ...item,
        badge: !isSeen && count > 0 ? count.toString() : undefined,
        tooltip: `${count} unread notifications`,
      };
    }
    return item;
  });

  const getSectionItems = (sectionKey: string) =>
    dynamicNavItems.filter((item) => item.section === sectionKey);

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'System Administrator';
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'SA';
  const roleLabel = user?.role === 'SUPER_ADMIN' ? 'Root Admin' : 'Administrator';

  const logoSrc =
    settings.appearance?.logoUrl && !settings.appearance.logoUrl.includes('googleusercontent')
      ? settings.appearance.logoUrl
      : '/images/astu-seal-logo.png';

  return (
    <aside className={sidebarShellClass(collapsed, isOpen)} aria-label="Admin navigation">
      <SidebarBrand
        collapsed={collapsed}
        logoSrc={logoSrc}
        logoAlt={`${settings.general?.abbreviation || 'ASTU'} Logo`}
        title={`${settings.general?.abbreviation || 'ASTU'} Admin`}
        subtitle={(settings.general?.portalTitle || 'Alumni Management').replace(/^ASTU\s+/i, '')}
      />

      <SidebarNav>
        {sections.map((section) => {
          const items = getSectionItems(section.key);
          if (items.length === 0) return null;
          return (
            <div key={section.key}>
              {!collapsed && <SidebarSectionLabel>{section.label}</SidebarSectionLabel>}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);
                  return (
                    <SidebarNavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      collapsed={collapsed}
                      isActive={isActive}
                      icon={item.icon}
                      label={item.label}
                      tooltip={item.tooltip}
                      badge={item.badge}
                      onClick={() => {
                        markAsSeen(item.path);
                        onNavigate?.();
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </SidebarNav>

      <SidebarFooter>
        <SidebarAiButton
          collapsed={collapsed}
          onClick={onOpenAiAssistant}
          title="ASTU AI"
          subtitle="Tracer & Analytics Assistant"
          tone="amber"
        />
        <SidebarUserCard
          collapsed={collapsed}
          initials={initials}
          name={displayName}
          role={roleLabel}
          email={user?.email}
          onLogout={onLogout}
        />
        <SidebarCollapseButton collapsed={collapsed} onToggle={onToggleCollapse} />
      </SidebarFooter>
    </aside>
  );
}
