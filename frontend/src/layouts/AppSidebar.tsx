import React from 'react';
import { HelpCircle, LogOut } from 'lucide-react';
import {
  SidebarBrand,
  SidebarCollapsedTooltip,
  SidebarFooter,
  SidebarNav,
  SidebarSectionLabel,
  formatSidebarBadge,
  sidebarNavItemClass,
} from './sidebarShared';

export interface SidebarNavItem {
  id: string;
  label: string;
  /** Material Symbols name */
  icon?: string;
  /** Optional React icon node (overrides material icon) */
  iconNode?: React.ReactNode;
  badge?: string | number | null;
  tooltip?: string;
}

export interface SidebarNavSection {
  id: string;
  label: string;
  items: SidebarNavItem[];
}

interface AppSidebarProps {
  items?: SidebarNavItem[];
  sections?: SidebarNavSection[];
  activeTab: string;
  onTabChange: (id: string) => void;
  collapsed?: boolean;
  logoSrc?: string;
  title: string;
  subtitle: string;
  onLogout: () => void;
  onHelp?: () => void;
}

function NavButton({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: SidebarNavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? item.label : item.tooltip || item.label}
      aria-current={active ? 'page' : undefined}
      className={sidebarNavItemClass(collapsed, active)}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#003580] dark:bg-sky-400"
          aria-hidden
        />
      )}
      <span
        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
          active
            ? 'bg-[#003580] text-white shadow-sm shadow-[#003580]/25 dark:bg-sky-600'
            : 'bg-slate-100 text-slate-500 group-hover:bg-[#003580]/10 group-hover:text-[#003580] dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-sky-950/40 dark:group-hover:text-sky-300'
        }`}
      >
        {item.iconNode ? (
          item.iconNode
        ) : (
          <span className="material-symbols-outlined text-[19px]">{item.icon || 'circle'}</span>
        )}
        {item.badge != null && item.badge !== '' && collapsed && (
          <span className="absolute -right-1 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-rose-500 px-1 text-[7px] font-extrabold text-white shadow-sm ring-2 ring-white dark:ring-slate-950">
            {formatSidebarBadge(item.badge)}
          </span>
        )}
      </span>
      {!collapsed && (
        <>
          <span className={`flex-1 truncate text-left text-[13px] ${active ? 'font-semibold' : 'font-medium'}`}>
            {item.label}
          </span>
          {item.badge != null && item.badge !== '' ? (
            <span
              className={`ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                active
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
              }`}
            >
              {formatSidebarBadge(item.badge)}
            </span>
          ) : active ? (
            <span className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#003580] dark:bg-sky-400" aria-hidden />
          ) : null}
        </>
      )}
      {collapsed && <SidebarCollapsedTooltip label={item.label} badge={item.badge ?? undefined} />}
    </button>
  );
}

/**
 * Shared white/dark role sidebar (Alumni / Registrar / Employer / Department).
 */
export function AppSidebar({
  items = [],
  sections,
  activeTab,
  onTabChange,
  collapsed = false,
  logoSrc = '/images/astu-seal-logo.png',
  title,
  subtitle,
  onLogout,
  onHelp,
}: AppSidebarProps) {
  const resolvedSections: SidebarNavSection[] =
    sections && sections.length > 0
      ? sections
      : [{ id: 'main', label: 'Navigation', items }];

  return (
    <aside
      className={`flex h-dvh w-full flex-shrink-0 flex-col overflow-hidden border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] text-[var(--text-primary)] shadow-[1px_0_0_rgba(15,23,42,0.03)] transition-all duration-300 ${
        collapsed ? 'md:w-[72px]' : 'md:w-64'
      }`}
      aria-label={`${title} navigation`}
    >
      <SidebarBrand
        collapsed={collapsed}
        logoSrc={logoSrc}
        logoAlt="ASTU Logo"
        title={title}
        subtitle={subtitle}
      />

      <SidebarNav>
        {resolvedSections.map((section) => (
          <div key={section.id}>
            {!collapsed && <SidebarSectionLabel>{section.label}</SidebarSectionLabel>}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  active={activeTab === item.id}
                  collapsed={collapsed}
                  onClick={() => onTabChange(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </SidebarNav>

      <SidebarFooter>
        {onHelp && (
          <button
            type="button"
            onClick={onHelp}
            title={collapsed ? 'Help Center' : undefined}
            className={`group relative flex w-full items-center rounded-xl text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100/80 hover:text-[#003580] dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-sky-300 ${
              collapsed ? 'mx-auto h-10 w-10 justify-center' : 'gap-2.5 px-2.5 py-2'
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#003580] dark:bg-slate-800 dark:text-sky-400">
              <HelpCircle className="h-4 w-4" />
            </span>
            {!collapsed && <span className="text-[13px] font-medium">Help Center</span>}
            {collapsed && <SidebarCollapsedTooltip label="Help Center" />}
          </button>
        )}
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`group relative flex w-full items-center rounded-xl border border-rose-100 bg-rose-50/70 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 ${
            collapsed ? 'mx-auto h-9 w-9 justify-center' : 'gap-2.5 px-3 py-2'
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
          {collapsed && <SidebarCollapsedTooltip label="Logout" />}
        </button>
      </SidebarFooter>
    </aside>
  );
}
