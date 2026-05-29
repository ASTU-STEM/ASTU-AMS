import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Briefcase,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { AdminNavItem } from '../features/admin/types/admin.types';
import AdminBadge from '../features/admin/components/AdminBadge';

interface AdminSidebarProps {
  compact: boolean;
  onToggleCompact: () => void;
  onClose: () => void;
  onLogout: () => void;
}

const navItems: AdminNavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'User Management', path: '/admin/users', icon: Users },
  { label: 'Role Management', path: '/admin/roles', icon: ShieldCheck },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Survey Management', path: '/admin/surveys', icon: ClipboardList },
  { label: 'Jobs Management', path: '/admin/jobs', icon: Briefcase },
  { label: 'Departments', path: '/admin/departments', icon: GraduationCap },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'System Logs', path: '/admin/logs', icon: ScrollText },
  { label: 'Backup & Security', path: '/admin/backup', icon: Shield },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ compact, onToggleCompact, onClose, onLogout }: AdminSidebarProps) {
  return (
    <>
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-[#003366] text-slate-200 transition-[width,transform] duration-[250ms] ease-in-out',
          compact ? 'w-16' : 'w-[240px]',
        ].join(' ')}
      >
        <div className="relative px-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg"
                alt="ASTU Logo"
                className={`shrink-0 rounded-xl bg-white/5 object-contain p-0.5 ${compact ? 'h-9 w-9' : 'h-10 w-10'}`}
              />
              {!compact && (
                <div>
                  <div className="font-semibold tracking-[0.08em] text-[#E8A020] text-[20px] leading-none">ASTU</div>
                  <p className="mt-1 text-[11px] text-slate-300">Management System</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#E8A020]/70 to-transparent" />
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-5">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={onClose}
                  title={compact ? item.label : undefined}
                  className={({ isActive }) =>
                    [
                      'group relative flex items-center rounded-[10px] py-3 text-[14px] font-medium transition-all duration-200',
                      compact ? 'justify-center px-0' : 'gap-3 px-4',
                      isActive
                        ? 'border-l-[3px] border-[#E8A020] bg-[rgba(232,160,32,0.12)] text-[#E8A020] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
                        : 'border-l-[3px] border-transparent text-[#8FA3BF] hover:bg-white/5 hover:text-white',
                    ].join(' ')
                  }
                >
                  <Icon className={compact ? 'h-5 w-5 shrink-0' : 'h-4.5 w-4.5 shrink-0'} />
                  {!compact && <span>{item.label}</span>}
                  {compact && (
                    <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#0A1628] px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className={`flex items-center rounded-[10px] bg-white/5 ${compact ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-3'}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003580] text-sm font-semibold text-white">
              SA
            </div>
            {!compact && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">System Administrator</p>
                <div className="mt-1">
                  <AdminBadge variant="neutral" className="bg-white/10 text-slate-200 border-white/10">
                    Root Admin
                  </AdminBadge>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onLogout}
            title={compact ? 'Logout' : undefined}
            className={`mt-3 flex w-full items-center justify-center rounded-[8px] border border-white/10 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5 hover:text-white ${
              compact ? 'px-0' : 'gap-2 px-4'
            }`}
          >
            <LogOut className="h-4 w-4" />
            {!compact && 'Logout'}
          </button>
        </div>
      </aside>
    </>
  );
}
