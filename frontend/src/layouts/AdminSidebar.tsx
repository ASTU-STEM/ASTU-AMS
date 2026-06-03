import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  GalleryHorizontal,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  LogOut,
  Newspaper,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { AdminNavItem } from '../features/admin/types/admin.types';
import AdminBadge from '../features/admin/components/AdminBadge';

interface AdminSidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onNavigate?: () => void;
}

interface EnhancedNavItem extends AdminNavItem {
  badge?: string | number;
  section?: string;
  tooltip?: string;
}

const navItems: EnhancedNavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, exact: true, section: 'main', tooltip: 'Operational command center' },
  { label: 'Homepage CMS', path: '/admin/homepage', icon: Layers3, section: 'content', tooltip: 'Manage homepage content' },
  { label: 'News & Community', path: '/admin/content', icon: Newspaper, section: 'content', tooltip: 'News, announcements & community' },
  { label: 'Gallery', path: '/admin/gallery', icon: GalleryHorizontal, section: 'content', tooltip: 'Photo & media gallery' },
  { label: 'Events & Workshops', path: '/admin/events', icon: CalendarDays, section: 'content', tooltip: 'Manage events & workshops' },
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
  { key: 'content', label: 'Content Management' },
  { key: 'system', label: 'System Administration' },
  { key: 'settings', label: 'Configuration' },
];

export default function AdminSidebar({ onLogout, isOpen = false, onNavigate }: AdminSidebarProps) {
  const location = useLocation();
  const isCollapsed = false;

  const getSectionItems = (sectionKey: string) =>
    navItems.filter(item => item.section === sectionKey);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#003366] text-slate-200 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Header */}
        <div className="relative px-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg"
                alt="ASTU Logo"
                className="h-10 w-10 shrink-0 rounded-xl bg-white/5 object-contain p-0.5 ring-1 ring-white/10"
              />
              <div>
                <div className="font-semibold tracking-[0.08em] text-[#E8A020] text-[20px] leading-none">ASTU</div>
                <p className="mt-1 text-[11px] text-slate-300">Management System</p>
              </div>
            </div>
          </div>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#E8A020]/70 to-transparent" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-5 scrollbar-thin">
          {sections.map(section => {
            const items = getSectionItems(section.key);
            if (items.length === 0) return null;
            return (
              <div key={section.key} className="mb-4">
                <div className="flex items-center justify-between px-3 mb-1.5">
                  <p className="text-[9px] font-extrabold text-white/30 uppercase tracking-[0.2em]">{section.label}</p>
                  <span className="text-[8px] text-white/20 font-bold px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
                    {items.length}
                  </span>
                </div>
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
                        title={item.tooltip || item.label}
                        className={`group relative flex items-center gap-3 rounded-[10px] py-2.5 px-4 text-[13px] font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-[rgba(232,160,32,0.12)] text-[#E8A020] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ring-1 ring-[#E8A020]/20'
                            : 'text-[#8FA3BF] hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-extrabold shadow-lg ${
                            isActive
                              ? 'bg-[#E8A020]/20 text-[#E8A020] ring-1 ring-[#E8A020]/30'
                              : 'bg-white/10 text-white/70'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && !item.badge && (
                          <span className="w-1 h-1 rounded-full bg-[#E8A020] animate-pulse" />
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
        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 rounded-[10px] bg-white/5 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003580] text-sm font-semibold text-white ring-2 ring-[#E8A020]/30">
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

          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              onLogout();
            }}
            className="mt-3 flex w-full items-center gap-2 rounded-[8px] border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
            <span className="ml-auto text-[8px] text-white/10 font-medium">Alt+L</span>
          </button>
        </div>
      </aside>
    </>
  );
}
