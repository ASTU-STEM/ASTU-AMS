import React, { useState, useEffect, useMemo } from 'react';
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
import { adminApi } from '../features/admin/api/adminApi';

interface AdminSidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenAiAssistant?: () => void;
}

interface EnhancedNavItem extends Omit<AdminNavItem, 'path'> {
  path?: string;
  badge?: string | number;
  section?: string;
  tooltip?: string;
  children?: EnhancedNavItem[];
}

const navItems: EnhancedNavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, exact: true, section: 'main' },
  { 
    label: 'System', 
    icon: Shield, 
    section: 'system',
    children: [
      { label: 'Modules', path: '/admin/modules', icon: Shield },
      { label: 'Reports', path: '/admin/reports', icon: FileBarChart },
      { label: 'Users', path: '/admin/users', icon: Users },
      { label: 'Roles', path: '/admin/roles', icon: ShieldCheck },
      { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      { label: 'Surveys', path: '/admin/surveys', icon: ClipboardList },
      { label: 'Jobs', path: '/admin/jobs', icon: Briefcase },
      { label: 'Departments', path: '/admin/departments', icon: GraduationCap },
    ]
  },
  { 
    label: 'Configuration', 
    icon: Settings, 
    section: 'settings',
    children: [
      { label: 'Notifications', path: '/admin/notifications', icon: Bell },
      { label: 'System Logs', path: '/admin/logs', icon: ScrollText },
      { label: 'Backup & Security', path: '/admin/backup', icon: Shield },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
    ]
  },
];

export default function AdminSidebar({ onLogout, isOpen = false, onNavigate, collapsed = false, onToggleCollapse, onOpenAiAssistant }: AdminSidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({
    Users: 0,
    Surveys: 0,
    Jobs: 0,
    Notifications: 0
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [docsRes, surveysRes, jobsRes, notifsRes] = await Promise.allSettled([
          adminApi.getDocumentRequests(),
          adminApi.listSurveys(),
          adminApi.listJobs(),
          adminApi.getNotifications()
        ]);

        const newCounts: Record<string, number> = {
          Users: 0,
          Surveys: 0,
          Jobs: 0,
          Notifications: 0
        };

        if (docsRes.status === 'fulfilled' && docsRes.value?.success) {
          const list = docsRes.value.data || [];
          newCounts.Users = list.filter((r: any) => r.status === 'PENDING').length;
        }

        if (surveysRes.status === 'fulfilled' && surveysRes.value?.success) {
          newCounts.Surveys = (surveysRes.value.data || []).length;
        }

        if (jobsRes.status === 'fulfilled' && jobsRes.value?.success) {
          const jobsData = jobsRes.value.data;
          newCounts.Jobs = jobsData?.total ?? (Array.isArray(jobsData) ? jobsData.length : (jobsData?.data ? jobsData.data.length : 0));
        }

        if (notifsRes.status === 'fulfilled' && notifsRes.value?.success) {
          const list = notifsRes.value.data || [];
          newCounts.Notifications = list.filter((n: any) => !n.isRead).length;
        }

        setCounts(newCounts);
      } catch (error) {
        console.error('Failed to load sidebar counts:', error);
      }
    }
    fetchCounts();
  }, []);

  const dynamicNavItems = useMemo(() => {
    return navItems.map(item => {
      const copy = { ...item };
      if (copy.children) {
        copy.children = copy.children.map(child => {
          const childCopy = { ...child };
          if (childCopy.label === 'Users' && counts.Users > 0) {
            childCopy.badge = counts.Users;
          } else if (childCopy.label === 'Surveys' && counts.Surveys > 0) {
            childCopy.badge = counts.Surveys;
          } else if (childCopy.label === 'Jobs' && counts.Jobs > 0) {
            childCopy.badge = counts.Jobs;
          } else if (childCopy.label === 'Notifications' && counts.Notifications > 0) {
            childCopy.badge = counts.Notifications;
          }
          return childCopy;
        });
      }
      return copy;
    });
  }, [counts]);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 ease-out lg:translate-x-0 ${collapsed ? 'w-20' : 'w-64'} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="relative px-5 pt-6">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#003580]/10 to-[#003580]/5 dark:from-[#3b82f6]/20 dark:to-transparent rounded-xl blur-sm" />
              <img
                src="/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg"
                alt="ASTU Logo"
                className="relative h-10 w-10 rounded-lg object-contain ring-1 ring-slate-200/50 dark:ring-slate-800"
              />
            </div>
            {!collapsed && (
              <div>
                <div className="font-bold text-[#003580] dark:text-blue-400 text-lg leading-none tracking-tight">ASTU</div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">Admin Portal</p>
              </div>
            )}
          </div>
          <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800/80 to-transparent" />
        </div>

        <nav className="relative flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <div className="space-y-2">
            {dynamicNavItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.has(item.label);
              const isActive = item.path ? (item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path)) : false;

              if (hasChildren) {
                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.label)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-650 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                    >
                      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <svg className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-550'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                    {isExpanded && !collapsed && (
                      <div className="mt-2 ml-4 space-y-1 border-l border-slate-200 dark:border-slate-800/80 pl-2">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive = child.exact
                            ? location.pathname === child.path
                            : location.pathname.startsWith(child.path);
                          return (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              end={child.exact}
                              onClick={onNavigate}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isChildActive 
                                  ? 'bg-[#003580] dark:bg-blue-600/20 text-white dark:text-blue-400 shadow-sm border-l-2 border-transparent dark:border-blue-500' 
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 dark:hover:text-slate-200'
                              }`}
                            >
                              <ChildIcon className="h-4 w-4" />
                              <span className="flex-1">{child.label}</span>
                              {child.badge && (
                                <span className="flex items-center justify-center min-w-[18px] h-5 px-1.5 rounded-full bg-gradient-to-r from-[#003580] to-[#004499] dark:from-blue-600 dark:to-indigo-500 text-[10px] font-bold shadow-sm" style={{ color: '#ffffff' }}>
                                  {child.badge}
                                </span>
                              )}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  end={item.exact}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold border-l-2 border-transparent transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#003580] to-[#004499] dark:from-blue-600/20 dark:to-[#131b2e]/10 text-white dark:text-blue-400 dark:border-blue-500 shadow-md shadow-blue-500/5' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="flex items-center justify-center min-w-[18px] h-5 px-1.5 rounded-full bg-gradient-to-r from-[#003580] to-[#004499] dark:from-blue-600 dark:to-indigo-500 text-[10px] font-bold shadow-sm" style={{ color: '#ffffff' }}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="relative border-t border-slate-200 dark:border-slate-800/80 px-5 py-4">
          {!collapsed ? (
            <>
              {onOpenAiAssistant && (
                <button
                  type="button"
                  onClick={onOpenAiAssistant}
                  className="mb-4 flex w-full items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 to-white dark:from-blue-950/20 dark:to-[#131b2e]/10 px-4 py-3 text-sm font-bold text-slate-700 dark:text-blue-350 hover:border-[#003580]/30 dark:hover:border-blue-500/35 hover:shadow-sm transition-all duration-200"
                >
                  <Sparkles className="h-4 w-4 text-[#003580] dark:text-blue-450" />
                  <span className="flex-1 text-left">ASTU AI Assistant</span>
                </button>
              )}

              <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/60 dark:to-[#131b2e]/40 border border-slate-200 dark:border-slate-800/80">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#004499] text-sm font-semibold text-white shadow-sm">
                  SA
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">System Admin</p>
                  <p className="text-xs text-slate-550 dark:text-slate-400 font-medium mt-1">Root Admin</p>
                </div>
              </div>
              <button type="button" onClick={onLogout}
                className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white transition-all duration-200">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {onOpenAiAssistant && (
                <button
                  type="button"
                  onClick={onOpenAiAssistant}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 to-white dark:from-blue-950/20 dark:to-[#131b2e]/10 text-slate-600 dark:text-blue-350 hover:border-[#003580]/30 dark:hover:border-blue-500/35 hover:shadow-sm transition-all duration-200"
                  title="AI Assistant"
                >
                  <Sparkles className="h-4 w-4 text-[#003580] dark:text-blue-450" />
                </button>
              )}

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#004499] text-sm font-semibold text-white shadow-sm" title="System Admin">
                SA
              </div>
              <button type="button" onClick={onLogout}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white transition-all duration-200" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`mt-3 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all duration-200 ${collapsed ? 'w-full py-2' : 'w-full py-2 gap-2'}`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /><span className="text-xs font-semibold">Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
