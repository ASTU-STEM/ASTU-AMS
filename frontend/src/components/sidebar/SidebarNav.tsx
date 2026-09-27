import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  /** Lucide icon component, or Material Symbols ligature name as fallback string */
  icon: LucideIcon | string;
  badge?: string | null;
}

interface SidebarNavProps {
  items: NavItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  collapsed?: boolean;
}

export default function SidebarNav({ items, activeItem, onItemClick, collapsed }: SidebarNavProps) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => {
        const Icon = typeof item.icon === 'string' ? null : item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onItemClick(item.id)}
            title={collapsed ? item.label : undefined}
            className={`nav-btn group flex w-full items-center rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
              collapsed ? 'justify-center' : 'gap-3'
            } ${
              activeItem === item.id
                ? 'bg-white/15 font-bold text-white shadow-lg shadow-black/10 backdrop-blur-sm'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm transition-all ${
                activeItem === item.id
                  ? 'bg-emerald-400/20 text-emerald-400'
                  : 'bg-white/5 text-white/40 group-hover:text-white/70'
              }`}
            >
              {Icon ? (
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <span className="material-symbols-outlined !text-sm">{item.icon as string}</span>
              )}
            </span>
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            {item.badge && !collapsed && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#CC0033] text-[9px] font-extrabold text-white shadow-md">
                {item.badge}
              </span>
            )}
            {activeItem === item.id && !collapsed && (
              <div className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
