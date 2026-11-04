import React from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: string;
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
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          title={collapsed ? item.label : undefined}
          className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-left group ${
            collapsed ? 'justify-center' : 'gap-3'
          } ${
            activeItem === item.id
              ? 'bg-white/15 text-white font-bold shadow-lg shadow-black/10 backdrop-blur-sm'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
              activeItem === item.id
                ? 'bg-emerald-400/20 text-emerald-400'
                : 'bg-white/5 text-white/40 group-hover:text-white/70'
            }`}
          >
            <span className="material-symbols-outlined !text-sm">{item.icon}</span>
          </span>
          {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          {item.badge && !collapsed && (
            <span className="ml-auto w-5 h-5 rounded-full bg-[#CC0033] flex items-center justify-center text-[9px] font-extrabold text-white shadow-md">
              {item.badge}
            </span>
          )}
          {activeItem === item.id && !collapsed && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
}
