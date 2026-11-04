import React from 'react';
import { LogOut } from 'lucide-react';

interface SidebarFooterProps {
  collapsed?: boolean;
  onHelp?: () => void;
  onLogout?: () => void;
}

export default function SidebarFooter({ collapsed, onHelp, onLogout }: SidebarFooterProps) {
  return (
    <div className="space-y-1">
      <button
        onClick={onHelp}
        className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 text-left group ${
          collapsed ? 'justify-center' : 'gap-3'
        }`}
      >
        <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white/40 group-hover:text-white/70 material-symbols-outlined !text-sm">
          help
        </span>
        {!collapsed && <span className="text-sm font-medium">Help Center</span>}
      </button>
      <button
        onClick={onLogout}
        className={`nav-btn w-full flex items-center px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-left group ${
          collapsed ? 'justify-center' : 'gap-3'
        }`}
      >
        <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 material-symbols-outlined !text-sm">
          logout
        </span>
        {!collapsed && <span className="text-sm font-medium">Logout</span>}
      </button>
    </div>
  );
}
