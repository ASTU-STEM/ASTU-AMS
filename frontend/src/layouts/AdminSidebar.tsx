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

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  return (
    <>
      <aside
        className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#003366] text-slate-200"
      >
        <div className="relative px-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg"
                alt="ASTU Logo"
                className="h-10 w-10 shrink-0 rounded-xl bg-white/5 object-contain p-0.5"
              />
              <div>
                <div className="font-semibold tracking-[0.08em] text-[#E8A020] text-[20px] leading-none">ASTU</div>
                <p className="mt-1 text-[11px] text-slate-300">Management System</p>
              </div>
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
                  className={({ isActive }) =>
                    [
                      'group relative flex items-center gap-3 rounded-[10px] py-3 px-4 text-[14px] font-medium transition-all duration-200',
                      isActive
                        ? 'border-l-[3px] border-[#E8A020] bg-[rgba(232,160,32,0.12)] text-[#E8A020] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
                        : 'border-l-[3px] border-transparent text-[#8FA3BF] hover:bg-white/5 hover:text-white',
                    ].join(' ')
                  }
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 rounded-[10px] bg-white/5 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003580] text-sm font-semibold text-white">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">System Administrator</p>
              <div className="mt-1">
                <AdminBadge variant="neutral" className="border-white/10 bg-white/10 text-slate-200">
                  Root Admin
                </AdminBadge>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-[8px] border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}