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
  ChevronDown,
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
  { label: 'Approvals', path: '/cms/approvals', icon: ShieldCheck, section: 'workflow', tooltip: 'Pending reviews & approvals', badge: 5 },
  { label: 'Media Library', path: '/cms/media', icon: ImageIcon, section: 'assets', tooltip: 'All media files' },
  { label: 'SEO', path: '/cms/seo', icon: Globe, section: 'assets', tooltip: 'SEO management' },
  { label: 'Templates', path: '/cms/templates', icon: Sparkles, section: 'assets', tooltip: 'Reusable content templates' },
  { label: 'Settings', path: '/cms/settings', icon: Settings, section: 'settings', tooltip: 'CMS configuration' },
];

const sections = [
  { key: 'overview', label: 'Overview' },
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
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0B1A2E] text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${
          collapsed ? 'w-[72px]' : 'w-72'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1F38] via-[#0B1A2E] to-[#091524] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_30%,rgba(244,180,0,0.02)_70%,transparent_100%)] pointer-events-none" />

        {/* Logo area */}
        <div className="relative px-4 pt-5 pb-3">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative shrink-0">
              <img
                src="/images/AdamaScienceandTechnologyUniversityASTU-logo-350x350.jpg"
                alt="ASTU"
                className="h-9 w-9 rounded-lg bg-white/8 object-contain p-0.5 ring-1 ring-white/10"
              />
              {!collapsed && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F4B400] text-[7px] font-bold text-[#0B1A2E] shadow-sm">C</span>
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-white">ASTU</span>
                  <span className="rounded-md bg-[#F4B400]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#F4B400] uppercase tracking-wider">CMS</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Content Manager</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button className="mt-4 flex w-full items-center gap-2 rounded-lg bg-[#F4B400] px-4 py-3 text-xs font-bold text-[#0B1A2E] hover:brightness-110 transition-all shadow-sm shadow-[#F4B400]/20">
              <Plus className="h-5 w-5" />
              <span>Quick Create</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="relative mx-4 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        {/* Navigation */}
        <nav className="relative flex-1 overflow-y-auto px-3 py-4 scrollbar-thin space-y-2">
          {sections.map(section => {
            const items = getSectionItems(section.key);
            if (items.length === 0) return null;
            return (
              <div key={section.key}>
                {!collapsed && (
                  <div className="px-3 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-px flex-1 bg-white/5" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {section.label}
                      </p>
                      <span className="h-px flex-1 bg-white/5" />
                    </div>
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
                        className={`group relative flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${
                          collapsed ? 'justify-center py-3 px-0 mx-auto w-11' : 'gap-3 py-2.5 px-3'
                        } ${
                          isActive
                            ? 'bg-[rgba(244,180,0,0.1)] text-[#F4B400]'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#F4B400] shadow-[0_0_8px_rgba(244,180,0,0.4)]" />
                        )}
                        <span className="shrink-0 flex items-center justify-center">
                          <Icon className="h-[20px] w-[20px]" />
                        </span>
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {item.badge && !collapsed && (
                          <span className={`flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-[#F4B400]/20 text-[#F4B400]' : 'bg-rose-500/90 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {item.badge && collapsed && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[7px] font-bold text-white shadow-lg ring-1 ring-white/20">
                            {item.badge}
                          </span>
                        )}
                        {collapsed && (
                          <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                            {item.label}
                            {item.badge && <span className="ml-1.5 text-rose-400 font-bold">({item.badge})</span>}
                          </div>
                        )}
                        {isActive && collapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#F4B400] shadow-[0_0_8px_rgba(244,180,0,0.4)]" />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User area */}
        <div className="relative border-t border-white/8 px-4 py-4">
          {!collapsed ? (
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3.5 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#F4B400] to-[#E8A020] text-sm font-bold text-[#0B1A2E] shrink-0 shadow-sm">
                CM
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">Content Manager</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[11px] text-slate-400">Online</span>
                </div>
              </div>
              <button type="button" onClick={onLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#F4B400] to-[#E8A020] text-sm font-bold text-[#0B1A2E] shadow-sm" title="Content Manager">
                CM
              </div>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <button type="button" onClick={onLogout}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`mt-2 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all ${
              collapsed ? 'w-full py-2' : 'w-full py-2 gap-2'
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /><span className="text-[11px] font-medium">Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
