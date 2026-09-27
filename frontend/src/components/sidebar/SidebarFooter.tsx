import React from 'react';
import { HelpCircle, LogOut } from 'lucide-react';

interface SidebarFooterProps {
  collapsed?: boolean;
  onHelp?: () => void;
  onLogout?: () => void;
}

export default function SidebarFooter({ collapsed, onHelp, onLogout }: SidebarFooterProps) {
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onHelp}
        className={`nav-btn group flex w-full items-center rounded-xl px-3 py-2.5 text-left text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-white ${
          collapsed ? 'justify-center' : 'gap-3'
        }`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/40 group-hover:text-white/70">
          <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
        </span>
        {!collapsed && <span className="text-sm font-medium">Help Center</span>}
      </button>
      <button
        type="button"
        onClick={onLogout}
        className={`nav-btn group flex w-full items-center rounded-xl px-3 py-2.5 text-left text-red-400/80 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 ${
          collapsed ? 'justify-center' : 'gap-3'
        }`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 group-hover:bg-red-500/20">
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
        </span>
        {!collapsed && <span className="text-sm font-medium">Logout</span>}
      </button>
    </div>
  );
}
