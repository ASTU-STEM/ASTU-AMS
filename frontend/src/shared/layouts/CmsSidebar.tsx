import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  ChevronDown,
  GalleryHorizontal,
  Globe,
  Image as ImageIcon,
  Layers3,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { AdminNavItem } from '../../domains/admin/types/admin.types';

interface CmsSidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavChild {
  label: string;
  path: string;
  badge?: number;
  exact?: boolean;
}

interface NavGroup {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavChild[];
}

interface NavSingle {
  key: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: number;
}

type NavEntry = ({ type: 'single' } & NavSingle) | ({ type: 'group' } & NavGroup);

const navEntries: NavEntry[] = [
  {
    type: 'single',
    key: 'dashboard',
    label: 'Dashboard',
    path: '/cms/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    type: 'group',
    key: 'content',
    label: 'Content',
    icon: Newspaper,
    children: [
      { label: 'All Content', path: '/cms/content' },
      { label: 'Homepage CMS', path: '/cms/homepage' },
      { label: 'Community', path: '/cms/community' },
      { label: 'Gallery', path: '/cms/gallery' },
      { label: 'Events & Workshops', path: '/cms/events' },
    ],
  },
  {
    type: 'group',
    key: 'workflow',
    label: 'Workflow',
    icon: ShieldCheck,
    children: [
      { label: 'Approvals', path: '/cms/approvals', badge: 5 },
    ],
  },
  {
    type: 'group',
    key: 'assets',
    label: 'Assets',
    icon: GalleryHorizontal,
    children: [
      { label: 'Media Library', path: '/cms/media' },
      { label: 'SEO', path: '/cms/seo' },
      { label: 'Templates', path: '/cms/templates' },
    ],
  },
  {
    type: 'single',
    key: 'settings',
    label: 'Settings',
    path: '/cms/settings',
    icon: Settings,
  },
];

// Icon map for children
const childIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'All Content': Newspaper,
  'Homepage CMS': Layers3,
  'Community': MessageSquareText,
  'Gallery': GalleryHorizontal,
  'Events & Workshops': CalendarDays,
  'Approvals': ShieldCheck,
  'Media Library': ImageIcon,
  'SEO': Globe,
  'Templates': Sparkles,
};

export default function CmsSidebar({
  onLogout,
  isOpen = false,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: CmsSidebarProps) {
  const location = useLocation();

  // Auto-expand groups that contain the active route
  const getInitialExpanded = () => {
    const set = new Set<string>();
    navEntries.forEach((entry) => {
      if (entry.type === 'group') {
        const hasActive = entry.children.some((c) =>
          location.pathname.startsWith(c.path)
        );
        if (hasActive) set.add(entry.key);
      }
    });
    return set;
  };

  const [expanded, setExpanded] = useState<Set<string>>(getInitialExpanded);

  // Re-expand when route changes
  useEffect(() => {
    setExpanded(getInitialExpanded());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const isGroupActive = (entry: NavGroup) =>
    entry.children.some((c) => location.pathname.startsWith(c.path));

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 ease-out lg:translate-x-0 ${
          collapsed ? 'w-[72px]' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* ── Logo ── */}
        <div className="relative px-5 pt-6 pb-2">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#003580]/10 to-[#003580]/5 dark:from-[#F4B400]/20 dark:to-transparent rounded-xl blur-sm" />
              <img
                src="/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg"
                alt="ASTU"
                className="relative h-10 w-10 rounded-lg object-contain ring-1 ring-slate-200/50 dark:ring-slate-800"
              />
              {!collapsed && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F4B400] text-[7px] font-bold text-[#0B1A2E] shadow-sm">
                  C
                </span>
              )}
            </div>
            {!collapsed && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-[#003580] dark:text-white">
                    ASTU
                  </span>
                  <span className="rounded-md bg-[#F4B400]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#b87800] dark:text-[#F4B400] uppercase tracking-wider">
                    CMS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5">
                  Content Manager
                </p>
              </div>
            )}
          </div>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800/80 to-transparent" />
        </div>

        {/* ── Quick Create ── */}
        {!collapsed && (
          <div className="px-4 py-3">
            <button className="flex w-full items-center gap-2 rounded-xl bg-gradient-to-r from-[#003580] to-[#0a4fa6] px-4 py-2.5 text-xs font-bold text-white hover:brightness-110 transition-all shadow-sm shadow-[#003580]/20">
              <Plus className="h-4 w-4" />
              <span>Quick Create</span>
            </button>
          </div>
        )}
        {collapsed && (
          <div className="px-3 py-3">
            <button
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#003580] to-[#0a4fa6] p-2.5 text-white hover:brightness-110 transition-all shadow-sm"
              title="Quick Create"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
          <div className="space-y-1">
            {navEntries.map((entry) => {
              if (entry.type === 'single') {
                const Icon = entry.icon;
                const isActive = entry.exact
                  ? location.pathname === entry.path
                  : location.pathname.startsWith(entry.path);

                return (
                  <NavLink
                    key={entry.key}
                    to={entry.path}
                    end={entry.exact}
                    onClick={onNavigate}
                    title={collapsed ? entry.label : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold border-l-2 border-transparent transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#003580] to-[#0a4fa6] dark:from-blue-600/20 dark:to-[#131b2e]/10 text-white dark:text-blue-400 dark:border-blue-500 shadow-md shadow-blue-500/10'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                    } ${collapsed ? 'justify-center px-0 w-11 mx-auto' : ''}`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-white dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    {!collapsed && <span className="flex-1">{entry.label}</span>}
                    {entry.badge && !collapsed && (
                      <span className="flex items-center justify-center min-w-[18px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm">
                        {entry.badge}
                      </span>
                    )}
                    {entry.badge && collapsed && (
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[7px] font-bold text-white ring-2 ring-white dark:ring-[#0b0f19]">
                        {entry.badge}
                      </span>
                    )}
                    {/* Tooltip for collapsed */}
                    {collapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {entry.label}
                      </div>
                    )}
                  </NavLink>
                );
              }

              // Group entry
              const Icon = entry.icon;
              const isOpen_ = expanded.has(entry.key);
              const groupActive = isGroupActive(entry);

              return (
                <div key={entry.key}>
                  <button
                    type="button"
                    onClick={() => !collapsed && toggle(entry.key)}
                    title={collapsed ? entry.label : undefined}
                    className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      groupActive
                        ? 'text-[#003580] dark:text-blue-400 bg-[#003580]/6 dark:bg-blue-500/10'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                    } ${collapsed ? 'justify-center px-0 w-11 mx-auto' : ''}`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        groupActive ? 'text-[#003580] dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{entry.label}</span>
                        {/* Badge aggregate */}
                        {entry.children.some((c) => c.badge) && (
                          <span className="flex items-center justify-center min-w-[18px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm mr-1">
                            {entry.children.reduce((sum, c) => sum + (c.badge ?? 0), 0)}
                          </span>
                        )}
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-slate-400 dark:text-slate-600 transition-transform duration-200 ${
                            isOpen_ ? 'rotate-180' : ''
                          }`}
                        />
                      </>
                    )}
                    {/* Collapsed badge dot */}
                    {collapsed && entry.children.some((c) => c.badge) && (
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[7px] font-bold text-white ring-2 ring-white dark:ring-[#0b0f19]">
                        {entry.children.reduce((sum, c) => sum + (c.badge ?? 0), 0)}
                      </span>
                    )}
                    {/* Tooltip for collapsed */}
                    {collapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {entry.label}
                      </div>
                    )}
                  </button>

                  {/* Children list — animated */}
                  {isOpen_ && !collapsed && (
                    <div className="mt-1 ml-4 space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                      {entry.children.map((child) => {
                        const ChildIcon = childIconMap[child.label] ?? Newspaper;
                        const isChildActive = child.exact
                          ? location.pathname === child.path
                          : location.pathname.startsWith(child.path);
                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            end={child.exact}
                            onClick={onNavigate}
                            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                              isChildActive
                                ? 'bg-[#003580] dark:bg-blue-600/20 text-white dark:text-blue-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                          >
                            <ChildIcon
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isChildActive
                                  ? 'text-white dark:text-blue-400'
                                  : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                              }`}
                            />
                            <span className="flex-1 truncate">{child.label}</span>
                            {child.badge && (
                              <span
                                className={`flex items-center justify-center min-w-[18px] h-5 px-1.5 rounded-full text-[10px] font-bold shadow-sm ${
                                  isChildActive
                                    ? 'bg-white/20 text-white dark:bg-blue-400/20 dark:text-blue-300'
                                    : 'bg-rose-500 text-white'
                                }`}
                              >
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
            })}
          </div>
        </nav>

        {/* ── User area ── */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 px-5 py-4">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#F4B400] to-[#E8A020] text-xs font-bold text-[#0B1A2E] shrink-0 shadow-sm">
                  CM
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-none">
                    Content Manager
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Online</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#F4B400] to-[#E8A020] text-xs font-bold text-[#0B1A2E] shadow-sm"
                title="Content Manager"
              >
                CM
              </div>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`mt-3 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all duration-200 ${
              collapsed ? 'w-full py-2' : 'w-full py-2 gap-2'
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span className="text-xs font-semibold">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
