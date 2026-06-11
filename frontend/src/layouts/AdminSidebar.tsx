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
  Mail,
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
  { label: 'Email Center', path: '/admin/email', icon: Mail, section: 'settings', badge: '12', tooltip: 'Create targeted email campaigns' },
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

  const getSectionItems = (sectionKey: string) =>
    navItems.filter(item => item.section === sectionKey);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gradient-to-b from-[#003366] via-[#002a55] to-[#001a3a] text-slate-200 transition-all duration-300 lg:translate-x-0 ${collapsed ? 'w-20' : 'w-64'} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.02)_0%,transparent_40%,rgba(232,160,32,0.03)_60%,transparent_100%)] pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-[#E8A020]/20 sidebar-particle" />
          <div className="absolute top-[45%] right-[25%] w-1.5 h-1.5 rounded-full bg-[#E8A020]/15 sidebar-particle" />
          <div className="absolute bottom-[30%] left-[30%] w-2.5 h-2.5 rounded-full bg-[#E8A020]/10 sidebar-particle" />
        </div>

        <div className="relative px-4 pt-5">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="group/logo relative shrink-0">
              <img
                src="/images/astu-logo-modified.png"
                alt="ASTU Logo"
                className="h-11 w-11 rounded-full object-contain transition-all duration-300"
              />
              {!collapsed && (
                <div className="absolute -top-1 -right-1 px-1 py-0.5 bg-[#E8A020]/20 text-[#E8A020] text-[7px] font-extrabold rounded border border-[#E8A020]/30 uppercase tracking-wider opacity-0 group-hover/logo:opacity-100 transition-opacity">Beta</div>
              )}
            </div>
            {!collapsed && (
              <div>
                <div className="font-semibold tracking-[0.08em] text-[#E8A020] text-[20px] leading-none">ASTU</div>
                <p className="mt-1 text-[11px] text-slate-300">Management System</p>
              </div>
            )}
          </div>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#E8A020]/50 to-transparent" />
        </div>

        <nav className="relative flex-1 overflow-y-auto px-2 py-5 scrollbar-thin">
          {sections.map(section => {
            const items = getSectionItems(section.key);
            if (items.length === 0) return null;
            return (
              <div key={section.key} className="mb-4">
                {!collapsed && (
                  <div className="flex items-center justify-between px-3 mb-1.5">
                    <p className="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em]">{section.label}</p>
                    <span className="text-[8px] text-white/20 font-bold px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
                      {items.length}
                    </span>
                  </div>
                )}
                <div className="space-y-0.5">
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
                        className={`group relative flex items-center rounded-[10px] text-[13px] font-medium transition-all duration-200 ${
                          collapsed ? 'justify-center py-3 px-0 mx-1' : 'gap-3 py-2.5 px-4'
                        } ${
                          isActive
                            ? 'bg-[rgba(232,160,32,0.12)] text-[#E8A020] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ring-1 ring-[#E8A020]/20'
                            : 'text-[#8FA3BF] hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="shrink-0">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {item.badge && !collapsed && (
                          <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-extrabold shadow-lg ${
                            isActive
                              ? 'bg-[#E8A020]/20 text-[#E8A020] ring-1 ring-[#E8A020]/30'
                              : 'bg-white/10 text-white/70'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {item.badge && collapsed && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[7px] font-extrabold text-white shadow-lg ring-1 ring-white/20">
                            {item.badge}
                          </span>
                        )}
                        {isActive && !item.badge && !collapsed && (
                          <span className="w-1 h-1 rounded-full bg-[#E8A020] animate-pulse" />
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

        <div className="relative border-t border-white/10 px-4 py-4">
          {!collapsed ? (
            <>
              {/* AI Copilot Launch Button */}
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="mb-4 flex w-full items-center gap-3 rounded-[12px] bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 border border-[#E8A020]/30 hover:border-[#E8A020]/50 px-4 py-3 text-sm font-medium text-slate-200 transition-all hover:from-amber-500/20 hover:to-orange-500/20 shadow-[0_0_12px_rgba(232,160,32,0.08)] group"
              >
                <Sparkles className="h-4.5 w-4.5 text-[#E8A020] animate-pulse shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#E8A020]">ASTU AI Copilot</div>
                  <div className="text-[9px] text-slate-400 truncate">Tracer &amp; Analytics Assistant</div>
                </div>
              </button>

              <div className="flex items-center gap-3 rounded-[10px] bg-white/5 px-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003580] text-sm font-semibold text-white ring-2 ring-[#E8A020]/30 shrink-0">
                  SA
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">System Administrator</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <AdminBadge variant="neutral" className="border-white/10 bg-white/10 text-slate-200 text-[10px]">
                      Root Admin
                    </AdminBadge>
                  </div>
                </div>
              </div>

              <button type="button" onClick={onLogout}
                className="mt-3 flex w-full items-center gap-2 rounded-[8px] border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
                <span className="ml-auto text-[8px] text-white/10 font-medium">Alt+L</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {/* AI Copilot Launch Button Collapsed */}
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-[#E8A020]/30 hover:border-[#E8A020]/50 text-slate-200 transition-all group relative shrink-0 shadow-[0_0_10px_rgba(232,160,32,0.1)]"
                title="ASTU AI Copilot"
              >
                <Sparkles className="h-4.5 w-4.5 text-[#E8A020] animate-pulse" />
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  ASTU AI Copilot
                </div>
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003580] text-sm font-semibold text-white ring-2 ring-[#E8A020]/30" title="System Administrator">
                SA
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Online" />
              <button type="button" onClick={onLogout}
                className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-white/10 text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
                title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`mt-2 flex items-center justify-center rounded-[8px] text-white/40 hover:text-white hover:bg-white/5 transition-all ${collapsed ? 'w-full py-1.5' : 'w-full py-2 gap-2'}`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /><span className="text-[10px] font-medium">Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
