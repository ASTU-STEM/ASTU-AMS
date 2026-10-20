import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';

/** Shared shell rules for Admin / CMS / ICT sidebars */
export const SIDEBAR_WIDTH = {
  expanded: 'w-64',
  collapsed: 'w-[72px]',
  marginExpanded: 'lg:ml-64',
  marginCollapsed: 'lg:ml-[72px]',
} as const;

export function sidebarShellClass(collapsed: boolean, isOpen: boolean) {
  return [
    'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white text-slate-800',
    'transition-all duration-300 ease-in-out lg:translate-x-0',
    'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100',
    collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
    isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full',
  ].join(' ');
}

export function sidebarContentMarginClass(collapsed: boolean) {
  return [
    'min-h-screen transition-[margin-left] duration-300 ease-in-out',
    collapsed ? SIDEBAR_WIDTH.marginCollapsed : SIDEBAR_WIDTH.marginExpanded,
  ].join(' ');
}

export function SidebarBrand({
  collapsed,
  logoSrc,
  logoAlt,
  title,
  subtitle,
  badge,
  children,
}: {
  collapsed: boolean;
  logoSrc: string;
  logoAlt: string;
  title: string;
  subtitle: string;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="shrink-0 border-b border-slate-200 px-3 py-4 dark:border-slate-800">
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center">
          <img src={logoSrc} alt={logoAlt} className="h-full w-full object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
                {title}
              </span>
              {badge && (
                <span className="shrink-0 border border-[#003580]/20 bg-[#003580]/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#003580] dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
                  {badge}
                </span>
              )}
            </div>
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[#003580] dark:text-sky-400">
              {subtitle}
            </p>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
      {children}
    </p>
  );
}

export function sidebarNavItemClass(collapsed: boolean, isActive: boolean) {
  return [
    'group relative flex items-center transition-colors duration-150',
    collapsed ? 'mx-auto h-10 w-10 justify-center' : 'gap-2.5 px-2.5 py-2',
    isActive
      ? 'bg-[#003580]/10 text-[#003580] dark:bg-sky-950/50 dark:text-sky-300'
      : 'text-slate-600 hover:bg-slate-50 hover:text-[#003580] dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-sky-300',
  ].join(' ');
}

export function SidebarNavIcon({
  icon: Icon,
  isActive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  return (
    <>
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 bg-[#003580] dark:bg-sky-400" />
      )}
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center transition-colors ${
          isActive
            ? 'bg-[#003580] text-white dark:bg-sky-600'
            : 'bg-slate-100 text-slate-500 group-hover:text-[#003580] dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
    </>
  );
}

export function SidebarBadge({
  value,
  isActive,
  collapsed,
}: {
  value: string | number;
  isActive: boolean;
  collapsed: boolean;
}) {
  if (collapsed) {
    return (
      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center bg-rose-500 px-1 text-[7px] font-extrabold text-white">
        {value}
      </span>
    );
  }
  return (
    <span
      className={`flex h-5 min-w-[20px] items-center justify-center px-1.5 text-[10px] font-bold ${
        isActive
          ? 'bg-rose-500 text-white'
          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
      }`}
    >
      {value}
    </span>
  );
}

export function SidebarCollapsedTooltip({
  label,
  badge,
}: {
  label: string;
  badge?: string | number;
}) {
  return (
    <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
      {label}
      {badge != null && badge !== '' && (
        <span className="ml-1.5 font-bold text-rose-400">({badge})</span>
      )}
    </div>
  );
}

export function SidebarNavLink({
  to,
  end,
  collapsed,
  isActive,
  icon,
  label,
  tooltip,
  badge,
  onClick,
}: {
  to: string;
  end?: boolean;
  collapsed: boolean;
  isActive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tooltip?: string;
  badge?: string | number;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      title={collapsed ? tooltip || label : undefined}
      className={sidebarNavItemClass(collapsed, isActive)}
    >
      <SidebarNavIcon icon={icon} isActive={isActive} />
      {!collapsed && (
        <span className="flex-1 truncate text-left text-[13px] font-medium">{label}</span>
      )}
      {badge != null && badge !== '' && (
        <SidebarBadge value={badge} isActive={isActive} collapsed={collapsed} />
      )}
      {collapsed && <SidebarCollapsedTooltip label={label} badge={badge} />}
    </NavLink>
  );
}

export function SidebarAiButton({
  collapsed,
  onClick,
  title,
  subtitle,
  tone = 'navy',
}: {
  collapsed: boolean;
  onClick?: () => void;
  title: string;
  subtitle: string;
  tone?: 'navy' | 'amber';
}) {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/15 text-amber-800 dark:text-amber-300'
      : 'border-[#003580]/20 bg-[#003580]/8 hover:bg-[#003580]/12 text-[#003580] dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300';

  const iconClass =
    tone === 'amber'
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-[#003580] dark:text-sky-400';

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={`${title} — ${subtitle}`}
        className={`group relative mx-auto flex h-9 w-9 items-center justify-center border transition-colors cursor-pointer ${toneClass}`}
      >
        <Sparkles className={`h-4 w-4 ${iconClass}`} />
        <SidebarCollapsedTooltip label={title} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 border px-3 py-2.5 text-left transition-colors cursor-pointer ${toneClass}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center ${
          tone === 'amber' ? 'bg-amber-500/15' : 'bg-[#003580]/10 dark:bg-sky-900/40'
        }`}
      >
        <Sparkles className={`h-4 w-4 ${iconClass}`} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-extrabold uppercase tracking-wider">{title}</div>
        <div className="truncate text-[10px] opacity-80">{subtitle}</div>
      </div>
    </button>
  );
}

export function SidebarUserCard({
  collapsed,
  initials,
  name,
  role,
  email,
  onLogout,
  accentInitials = false,
}: {
  collapsed: boolean;
  initials: string;
  name: string;
  role: string;
  email?: string;
  onLogout: () => void;
  /** CMS-style yellow initials on navy */
  accentInitials?: boolean;
}) {
  const nameMatchesRole = name.trim().toLowerCase() === role.trim().toLowerCase();
  const secondary = nameMatchesRole
    ? email || 'Signed in'
    : role;

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className={`group relative flex h-8 w-8 items-center justify-center bg-[#003580] text-[11px] font-bold ${
            accentInitials ? 'text-[#FFCC00]' : 'text-white'
          }`}
          title={`${name} · ${role}`}
        >
          {initials}
          <SidebarCollapsedTooltip label={`${name} · ${role}`} />
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="group relative flex h-8 w-8 items-center justify-center border border-rose-100 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 cursor-pointer dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
          <SidebarCollapsedTooltip label="Logout" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2.5 border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center bg-[#003580] text-[11px] font-bold ${
            accentInitials ? 'text-[#FFCC00]' : 'text-white'
          }`}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">{name}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
            <span className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {secondary}
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-2 border border-rose-100 bg-rose-50/60 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 cursor-pointer dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </>
  );
}

export function SidebarCollapseButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group flex items-center justify-center border border-transparent text-slate-400 transition-colors hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700 cursor-pointer dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200 ${
        collapsed ? 'mx-auto h-9 w-9' : 'w-full gap-2 px-2.5 py-2'
      }`}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed ? (
        <PanelLeftOpen className="h-4 w-4" />
      ) : (
        <>
          <PanelLeftClose className="h-4 w-4 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Collapse</span>
        </>
      )}
    </button>
  );
}

export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 space-y-2 border-t border-slate-200 p-2.5 dark:border-slate-800">
      {children}
    </div>
  );
}

export function SidebarNav({ children }: { children: React.ReactNode }) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4 scrollbar-thin">
      {children}
    </nav>
  );
}
