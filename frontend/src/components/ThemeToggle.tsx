import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import useTheme from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  /** Renders an icon-only circle (default) or a labelled pill. */
  showLabel?: boolean;
  labelClassName?: string;
}

/**
 * Universal 3-way theme switch (Light -> Dark -> System).
 * Synchronizes across marketing pages, dashboards, and OS daylight preferences.
 */
export default function ThemeToggle({ className = '', showLabel = false, labelClassName = '' }: ThemeToggleProps) {
  const { themeMode, darkMode, cycleThemeMode } = useTheme();

  const getLabel = () => {
    if (themeMode === 'system') return `System (${darkMode ? 'Dark' : 'Light'})`;
    if (themeMode === 'dark') return 'Dark Mode';
    return 'Light Mode';
  };

  const getTooltip = () => {
    if (themeMode === 'light') return 'Current: Light (Click for Dark)';
    if (themeMode === 'dark') return 'Current: Dark (Click for System Auto)';
    return 'Current: System Auto (Click for Light)';
  };

  const renderIcon = () => {
    if (themeMode === 'system') {
      return <Monitor className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
    }
    if (themeMode === 'dark') {
      return <Moon className="h-4 w-4 text-indigo-400" />;
    }
    return <Sun className="h-4 w-4 text-amber-500" />;
  };

  return (
    <button
      type="button"
      onClick={cycleThemeMode}
      aria-label={`Theme switch. Current: ${getLabel()}. Click to cycle theme.`}
      title={getTooltip()}
      className={
        showLabel
          ? `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-astu-navy/5 dark:hover:bg-white/10 ${className}`
          : `inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-astu-navy/5 dark:hover:bg-white/10 ${className}`
      }
    >
      {renderIcon()}
      {showLabel && <span className={labelClassName}>{getLabel()}</span>}
    </button>
  );
}
