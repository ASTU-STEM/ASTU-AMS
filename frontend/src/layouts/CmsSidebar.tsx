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
  GraduationCap,
  Users,
  ClipboardCheck,
  ClipboardList,
  BarChart3,
  FileBarChart,
  HeartHandshake,
  SlidersHorizontal,
  Building2,
  Bell,
  Briefcase,
  FileText,
} from 'lucide-react';
import type { AdminNavItem } from '../features/admin/types/admin.types';
import { useAuth } from '../contexts/AuthContext';

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
  { label: 'Dashboard', path: '/cms/dashboard', icon: LayoutDashboard, exact: true, section: 'alumni-office', tooltip: 'Alumni Office overview & statistics' },
  { label: 'Tracer Surveys', path: '/cms/surveys', icon: ClipboardList, section: 'alumni-office', tooltip: 'Longitudinal tracer study engine & cohorts' },
  { label: 'Analytics & Insights', path: '/cms/analytics', icon: BarChart3, section: 'alumni-office', tooltip: 'Employment rate, time-to-hire & skill gaps' },
  { label: 'Reports Center', path: '/cms/reports', icon: FileBarChart, section: 'alumni-office', tooltip: 'Official ETA & accreditation export dossiers' },
  { label: 'Registrations', path: '/cms/registrations', icon: ClipboardCheck, section: 'alumni-office', tooltip: 'Tracer study & event registrations' },
  { label: 'Events & Workshops', path: '/cms/events', icon: CalendarDays, section: 'alumni-office', tooltip: 'Manage alumni reunions & workshops' },
  { label: 'Jobs & Careers', path: '/cms/jobs', icon: Briefcase, section: 'alumni-office', tooltip: 'Job board moderation & placement tracking' },
  { label: 'Donations & Giving', path: '/cms/donations', icon: HeartHandshake, section: 'alumni-office', tooltip: 'Fundraising causes, Telebirr/Chapa campaigns & donor tracking' },
  { label: 'Messages', path: '/cms/messages', icon: MessageSquareText, section: 'alumni-office', tooltip: 'Internal messaging & communication' },
  { label: 'Notifications', path: '/cms/notifications', icon: Bell, section: 'alumni-office', tooltip: 'System notifications & alerts' },
  { label: 'Pages & Homepage CMS', path: '/cms/homepage', icon: Layers3, section: 'content-management', tooltip: 'Manage homepage sections, Overview, Contact Us & institutional pages' },
  { label: 'Partners & Employers', path: '/cms/partners', icon: Building2, section: 'content-management', tooltip: 'Manage /partners portal, employer benefits & logos' },
  { label: 'Announcements', path: '/cms/content', icon: Newspaper, section: 'content-management', tooltip: 'Alumni announcements & public notices' },
  { label: 'RAG Knowledge Hub', path: '/cms/knowledge-hub', icon: Sparkles, section: 'content-management', tooltip: 'Institutional RAG documents & FAQs for Homepage AI Chatbot' },
  { label: 'Dashboard Menu Controls', path: '/cms/portal-controls', icon: SlidersHorizontal, section: 'content-management', tooltip: 'Manage menu visibility & maintenance state for all actor dashboards' },
  { label: 'Community', path: '/cms/community', icon: Users, section: 'content-management', tooltip: 'Alumni community, detail pages & homepage sections' },
  { label: 'Media & Gallery', path: '/cms/media-gallery', icon: ImageIcon, section: 'content-management', tooltip: 'Unified media library, asset uploads & campus photo gallery' },
  { label: 'SEO', path: '/cms/seo', icon: Globe, section: 'content-management', tooltip: 'Search engine optimization & indexing' },
  { label: 'Templates', path: '/cms/templates', icon: FileText, section: 'content-management', tooltip: 'Reusable content templates' },
  { label: 'Approvals', path: '/cms/approvals', icon: ShieldCheck, section: 'content-management', tooltip: 'Pending reviews & approvals', badge: 1 },
  { label: 'Settings', path: '/cms/settings', icon: Settings, section: 'content-management', tooltip: 'CMS & office configurations' },
];

const sections = [
  { key: 'alumni-office', label: 'Alumni Office' },
  { key: 'content-management', label: 'Content Management' },
];

export default function CmsSidebar({ onLogout, isOpen = false, onNavigate, collapsed = false, onToggleCollapse }: CmsSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const getSectionItems = (sectionKey: string) =>
    navItems.filter(item => item.section === sectionKey);

  const officerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Alumni Relations Officer';
  const officerInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : 'AO';

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white text-slate-800 border-r border-slate-200/80 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${collapsed ? 'w-[76px]' : 'w-72'
          } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Header */}
        <div className="relative px-5 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
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
                    <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">ASTU Alumni</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">Relations & Affairs Office</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <span className="inline-flex items-center rounded-md bg-[#003366]/10 dark:bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-[#003366] dark:text-[#FFCC00] ring-1 ring-inset ring-[#003366]/20 dark:ring-amber-400/30">
                OFFICER
              </span>
            )}
          </div>

          {!collapsed && (
            <NavLink
              to="/cms/content"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#003366] dark:bg-[#004080] hover:bg-[#002855] dark:hover:bg-[#003366] px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-sm shadow-[#003366]/15 group cursor-pointer"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              <span>Broadcast Notice</span>
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
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                            ? 'bg-sky-50/90 dark:bg-sky-950/50 text-[#003366] dark:text-sky-300 font-semibold border-r-2 border-[#003366] dark:border-[#FFCC00]'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        <span className={`shrink-0 flex items-center justify-center transition-colors ${isActive ? 'text-[#003366] dark:text-[#FFCC00]' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                          }`}>
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}

                        {item.badge && !collapsed && (
                          <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#003366] dark:bg-[#FFCC00] text-white dark:text-[#003366]' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                            }`}>
                            {item.badge}
                          </span>
                        )}

                        {item.badge && collapsed && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-slate-900">
                            {item.badge}
                          </span>
                        )}

                        {collapsed && (
                          <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none">
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
        <div className="border-t border-slate-100 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-900/50">
          {!collapsed ? (
            <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-800/80 p-2.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#003366] to-[#002244] dark:from-[#004080] dark:to-[#002855] text-xs font-bold text-[#FFCC00] shrink-0 shadow-xs border border-white/10">
                  {officerInitials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{officerName}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Alumni Affairs Officer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#003366] to-[#002244] dark:from-[#004080] dark:to-[#002855] text-xs font-bold text-[#FFCC00] shadow-xs" title={officerName}>
                {officerInitials}
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="mt-2 flex w-full items-center justify-center rounded-lg py-1.5 text-xs text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-1.5 cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /><span className="text-[11px] font-medium">Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
