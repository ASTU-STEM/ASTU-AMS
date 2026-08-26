import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Briefcase,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import type { AdminNavItem } from '../features/admin/types/admin.types';
import AdminBadge from '../features/admin/components/AdminBadge';
import { adminService } from '../features/admin/services/admin.service';
import { useAuth } from '../contexts/AuthContext';

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
  { label: 'Super Admin Modules', path: '/admin/modules', icon: Shield, section: 'system', tooltip: 'Advanced system modules' },
  { label: 'Reports Center', path: '/admin/reports', icon: FileBarChart, section: 'system', tooltip: 'Generate & export reports' },
  { label: 'User Management', path: '/admin/users', icon: Users, section: 'system', badge: '142', tooltip: '142 pending verifications' },
  { label: 'Role Management', path: '/admin/roles', icon: ShieldCheck, section: 'system', tooltip: 'Manage roles & permissions' },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, section: 'system', tooltip: 'View platform analytics' },
  { label: 'Survey Management', path: '/admin/surveys', icon: ClipboardList, section: 'system', badge: '3', tooltip: '3 active surveys' },
  { label: 'Jobs Management', path: '/admin/jobs', icon: Briefcase, section: 'system', badge: '47', tooltip: '47 active job posts' },
  { label: 'Departments', path: '/admin/departments', icon: GraduationCap, section: 'system', tooltip: 'Manage departments' },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell, section: 'settings', badge: '5', tooltip: '5 unread notifications' },
  { label: 'System Logs', path: '/admin/logs', icon: ScrollText, section: 'settings', tooltip: 'Audit trail & system logs' },
  { label: 'Backup & Security', path: '/admin/backup', icon: Shield, section: 'settings', tooltip: 'Backup & security settings' },
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

  const [stats, setStats] = React.useState({
    users: 0,
    surveys: 0,
    jobs: 0,
    notifications: 0,
  });

  React.useEffect(() => {
    adminService.getSidebarStats().then(res => {
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

  const dynamicNavItems = navItems.map(item => {
    if (item.label === 'User Management') return { ...item, badge: stats.users > 0 ? stats.users.toString() : undefined, tooltip: `${stats.users} pending verifications` };
    if (item.label === 'Survey Management') return { ...item, badge: stats.surveys > 0 ? stats.surveys.toString() : undefined, tooltip: `${stats.surveys} active surveys` };
    if (item.label === 'Jobs Management') return { ...item, badge: stats.jobs > 0 ? stats.jobs.toString() : undefined, tooltip: `${stats.jobs} active job posts` };
    if (item.label === 'Notifications') return { ...item, badge: stats.notifications > 0 ? stats.notifications.toString() : undefined, tooltip: `${stats.notifications} unread notifications` };
    return item;
  });

  const getSectionItems = (sectionKey: string) =>
    dynamicNavItems.filter(item => item.section === sectionKey);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200/80 text-slate-800 shadow-xs transition-all duration-300 lg:translate-x-0 ${
          collapsed ? 'w-20' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar Logo Header */}
        <div className="relative px-4 py-4 border-b border-slate-100">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="group/logo relative shrink-0 flex items-center justify-center h-10 w-10">
              <img
                src="/images/astu-seal-logo.png"
                alt="ASTU Logo"
                className="h-full w-full object-contain scale-110"
              />
            </div>
            {!collapsed && (
              <div>
                <div className="font-bold tracking-tight text-slate-900 text-[18px] leading-tight">ASTU Admin</div>
                <p className="text-[9px] text-[#003580] uppercase tracking-widest font-extrabold truncate">Management System</p>
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
                  <div className="flex items-center justify-between px-3 mb-2">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{section.label}</p>
                    <span className="text-[8px] text-slate-500 font-extrabold px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                      {items.length} items
                    </span>
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
                        onClick={onNavigate}
                        title={collapsed ? item.tooltip || item.label : undefined}
                        className={`nav-btn w-full flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 text-left group relative ${
                          collapsed ? 'justify-center' : 'gap-2.5'
                        } ${
                          isActive
                            ? 'bg-[#003580]/10 text-[#003580] font-bold shadow-2xs ring-1 ring-[#003580]/20'
                            : 'text-slate-600 hover:text-[#003580] hover:bg-slate-50'
                        }`}
                      >
                        <span className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isActive ? 'bg-[#003580] text-white shadow-xs' : 'bg-slate-100 text-slate-500 group-hover:text-[#003580]'
                        }`}>
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        {!collapsed && <span className="text-sm font-medium flex-1 truncate text-left">{item.label}</span>}
                        {item.badge && !collapsed && (
                          <span className={`flex items-center justify-center min-w-[20px] h-4.5 px-1.5 rounded-full text-[10px] font-bold shadow-xs ${
                            isActive
                              ? 'bg-rose-500 text-white'
                              : 'bg-rose-100 text-rose-700'
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
                          <div className="ml-1 w-1.5 h-1.5 rounded-full bg-[#003580] shrink-0" />
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
        <div className="relative border-t border-slate-100 p-3 space-y-2">
          {!collapsed ? (
            <>
              {/* AI Copilot Launch Button */}
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="flex w-full items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 px-3.5 py-2.5 text-sm font-medium text-amber-900 transition-all hover:bg-amber-500/15 shadow-2xs group"
              >
                <Sparkles className="h-4.5 w-4.5 text-amber-600 animate-pulse shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700">ASTU AI Copilot</div>
                  <div className="text-[9px] text-amber-600/80 truncate">Tracer &amp; Analytics Assistant</div>
                </div>
              </button>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200/60 p-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003580] text-xs font-bold text-white shrink-0">
                  {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'SA'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">{user ? `${user.firstName} ${user.lastName}` : 'System Administrator'}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Root Admin</span>
                  </div>
                </div>
              </div>

              <button type="button" onClick={onLogout}
                className="flex w-full items-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2 text-xs font-bold text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700">
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
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 border border-amber-200 text-amber-700 hover:bg-amber-200 transition-all group relative shrink-0 shadow-xs"
                title="ASTU AI Copilot"
              >
                <Sparkles className="h-4.5 w-4.5 text-amber-600 animate-pulse" />
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003580] text-xs font-bold text-white" title={user ? `${user.firstName} ${user.lastName}` : 'System Administrator'}>
                {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'SA'}
              </div>
              <button type="button" onClick={onLogout}
                className="flex items-center justify-center w-8 h-8 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all ${collapsed ? 'w-full py-1.5' : 'w-full py-2 gap-2'}`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wider">Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
