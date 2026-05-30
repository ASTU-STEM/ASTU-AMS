import React from 'react';
import { LogOut } from 'lucide-react';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface AppSidebarProps {
  items: SidebarNavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  collapsed?: boolean;
  logo?: React.ReactNode;
  title: string;
  subtitle: string;
  onLogout: () => void;
}

export function AppSidebar({
  items,
  activeTab,
  onTabChange,
  collapsed = false,
  logo,
  title,
  subtitle,
  onLogout,
}: AppSidebarProps) {
  return (
    <aside
      className={`h-screen flex-shrink-0 flex-col bg-[#002244] shadow-2xl overflow-hidden transition-all duration-300 ${collapsed ? 'w-20' : 'w-full'}`}
      style={{
        background: 'linear-gradient(180deg, #003366 0%, #002a55 50%, #001a3a 100%)',
      }}
    >
      {/* Logo Section */}
      <div className="flex shrink-0 items-center justify-center border-b border-white/10 px-4 py-5">
        {logo ? (
          logo
        ) : (
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg">
              <svg className="h-6 w-6 text-[#FFCC00]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
              </svg>
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="truncate text-base font-extrabold tracking-tight text-white whitespace-nowrap">{title}</h1>
                <p className="truncate text-[9px] uppercase tracking-[0.2em] text-emerald-400 font-extrabold whitespace-nowrap">{subtitle}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 scrollbar-thin">
        <div className="space-y-1">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={`group relative flex w-full items-center rounded-xl px-3 py-2.5 transition-all duration-200 text-left ${collapsed ? 'justify-center' : 'gap-3'} ${isActive
                    ? 'bg-white/15 font-bold text-white shadow-lg shadow-black/10 backdrop-blur-sm'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${isActive
                      ? 'bg-emerald-400/20 text-emerald-400'
                      : 'text-white/40 group-hover:text-white/70'
                    }`}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="truncate text-sm font-medium whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
                {item.badge && !collapsed && (
                  <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#CC0033] text-[9px] font-extrabold text-white shadow-md">
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 px-4 py-4">
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex w-full items-center rounded-xl px-3 py-2.5 text-red-400/80 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 ${collapsed ? 'justify-center' : 'gap-3'}`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <LogOut className="h-4 w-4" />
          </span>
          {!collapsed && <span className="text-sm font-medium whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
