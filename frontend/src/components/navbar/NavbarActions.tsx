import React from 'react';
import { Bell, Moon, Sun } from 'lucide-react';

interface NavbarActionsProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  unreadNotifications: number;
  onToggleNotifications: () => void;
  profileName?: string;
  profileInitials?: string;
  onProfileClick?: () => void;
}

export default function NavbarActions({
  darkMode,
  onToggleDarkMode,
  unreadNotifications,
  onToggleNotifications,
  profileName,
  profileInitials,
  onProfileClick,
}: NavbarActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onToggleDarkMode}
        className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={onToggleNotifications}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:bg-black/5"
        >
          <Bell className="h-4 w-4" />
          {unreadNotifications > 0 && (
            <span className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E24B4A] text-[9px] font-semibold leading-none text-white">
              {unreadNotifications}
            </span>
          )}
        </button>
      </div>

      {profileInitials && (
        <button
          type="button"
          onClick={onProfileClick}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#003580] to-[#004d99] text-xs font-semibold text-white shadow-sm"
        >
          {profileInitials}
        </button>
      )}
    </div>
  );
}
