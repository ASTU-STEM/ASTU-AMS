import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  CalendarDays,
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
  Settings,
  ShieldCheck,
  Sparkles,
  Plus,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import type { AdminNavItem } from '../features/admin/types/admin.types';

interface CmsSidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface EnhancedNavItem extends AdminNavItem {
  badge?: string | number;
  section?: string;
  tooltip?: string;
}

const navItems: EnhancedNavItem[] = [
  { label: 'Dashboard', path: '/cms/dashboard', icon: LayoutDashboard, exact: true, section: 'overview', tooltip: 'CMS overview & stats' },
  { label: 'All Content', path: '/cms/content', icon: Newspaper, section: 'content', tooltip: 'Pages, posts, announcements' },
  { label: 'Homepage CMS', path: '/cms/homepage', icon: Layers3, section: 'content', tooltip: 'Manage homepage content' },
  { label: 'Community', path: '/cms/community', icon: MessageSquareText, section: 'content', tooltip: 'News, announcements & community' },
  { label: 'Gallery', path: '/cms/gallery', icon: GalleryHorizontal, section: 'content', tooltip: 'Photo & media gallery' },
  { label: 'Events & Workshops', path: '/cms/events', icon: CalendarDays, section: 'content', tooltip: 'Manage events & workshops' },
  { label: 'Approvals', path: '/cms/approvals', icon: ShieldCheck, section: 'workflow', tooltip: 'Pending reviews & approvals', badge: 1 },
  { label: 'Media Library', path: '/cms/media', icon: ImageIcon, section: 'assets', tooltip: 'All media files' },
  { label: 'SEO', path: '/cms/seo', icon: Globe, section: 'assets', tooltip: 'SEO management' },
  { label: 'Templates', path: '/cms/templates', icon: Sparkles, section: 'assets', tooltip: 'Reusable content templates' },
  { label: 'Settings', path: '/cms/settings', icon: Settings, section: 'settings', tooltip: 'CMS configuration' },
];

const sections = [
  { key: 'overview', label: 'Dashboard' },
  { key: 'content', label: 'Content' },
  { key: 'workflow', label: 'Workflow' },
  { key: 'assets', label: 'Assets' },
  { key: 'settings', label: 'System' },
];

export default function CmsSidebar({ onLogout, isOpen = false, onNavigate, collapsed = false, onToggleCollapse }: CmsSidebarProps) {
  const location = useLocation();

  const getSectionItems = (sectionKey: string) =>
    navItems.filter(item => item.section === sectionKey);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white text-slate-800 border-r border-slate-200/80 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${collapsed ? 'w-[76px]' : 'w-72'
          } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Header */}
        <div className="relative px-5 pt-6 pb-4 border-b border-slate-100">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0 flex items-center justify-center h-10 w-10 ">
                <img
                  src="/images/astu-seal-logo.png"
                  alt="ASTU Logo"
                  className="h-full w-full object-contain scale-110"
                />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-slate-900 tracking-tight">ASTU CMS</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 truncate">Content Engine</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                PRO
              </span>
            )}
          </div>

          {!collapsed && (
            <NavLink
              to="/cms/content"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#003366] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#002855] transition-all shadow-sm shadow-[#003366]/15 group"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              <span>Create Content</span>
            </NavLink>
          )}
        </div>

        {/* Navigation Section List */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 scrollbar-thin space-y-4">
          {sections.map(section => {
            const items = getSectionItems(section.key);
            if (items.length === 0) return null;
            return (
              <div key={section.key} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 py-1 flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {section.label}
                    </p>
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
                        className={`group relative flex items-center rounded-xl text-sm font-medium transition-all duration-150 ${collapsed ? 'justify-center py-2.5 px-0 mx-auto w-11' : 'gap-3 py-2.5 px-3'
                          } ${isActive
                            ? 'bg-sky-50/90 text-[#003366] font-semibold border-r-2 border-[#003366]'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                      >
                        <span className={`shrink-0 flex items-center justify-center transition-colors ${isActive ? 'text-[#003366]' : 'text-slate-400 group-hover:text-slate-600'
                          }`}>
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}

                        {item.badge && !collapsed && (
                          <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#003366] text-white' : 'bg-rose-100 text-rose-700'
                            }`}>
                            {item.badge}
                          </span>
                        )}

                        {item.badge && collapsed && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white shadow-sm ring-1 ring-white">
                            {item.badge}
                          </span>
                        )}

                        {collapsed && (
                          <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none">
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

        {/* Footer / User Profile Area */}
        <div className="border-t border-slate-100 p-3.5 bg-slate-50/50">
          {!collapsed ? (
            <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003366] text-xs font-bold text-white shrink-0">
                  CM
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">Content Manager</p>
                  <p className="text-[10px] text-slate-400 truncate">CMS Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003366] text-xs font-bold text-white shadow-xs" title="Content Manager">
                CM
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="mt-2 flex w-full items-center justify-center rounded-lg py-1.5 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors gap-1.5"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /><span className="text-[11px] font-medium">Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
