import React from 'react';
import { Moon, Sun } from 'lucide-react';
import useTheme from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  /** Renders an icon-only circle (default) or a labelled pill. */
  showLabel?: boolean;
  labelClassName?: string;
}

/**
 * Public-site light/dark switch.
 *
 * Public pages previously had no way to change the theme at all — only the
 * dashboards exposed a toggle — so the stored preference from a dashboard
 * silently decided how the marketing pages looked. This is the single control
 * the public navbar uses.
 */
export default function ThemeToggle({ className = '', showLabel = false, labelClassName = '' }: ThemeToggleProps) {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Light mode' : 'Dark mode'}
      className={
        showLabel
          ? `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-astu-navy/5 dark:hover:bg-white/10 ${className}`
          : `inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-astu-navy/5 dark:hover:bg-white/10 ${className}`
      }
    >
      {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
      {showLabel && <span className={labelClassName}>{darkMode ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
}
