import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Theme = 'light' | 'dark';
export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';
const MODE_STORAGE_KEY = 'theme_mode';

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function readStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY) as ThemeMode | null;
  if (storedMode === 'dark' || storedMode === 'light' || storedMode === 'system') {
    return storedMode;
  }
  const legacyStored = window.localStorage.getItem(STORAGE_KEY);
  if (legacyStored === 'dark' || legacyStored === 'light') {
    return legacyStored;
  }
  return 'system';
}

export function readStoredTheme(): Theme {
  const mode = readStoredThemeMode();
  return mode === 'system' ? getSystemTheme() : mode;
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  darkMode: boolean;
  setTheme: (theme: Theme) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  cycleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Single source of truth for light / dark / system across public pages and dashboards.
 * Supports OS preferences and dynamic cross-tab synchronization.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => readStoredThemeMode());
  const [systemTheme, setSystemTheme] = useState<Theme>(() => getSystemTheme());

  const effectiveTheme: Theme = themeMode === 'system' ? systemTheme : themeMode;

  useEffect(() => {
    applyTheme(effectiveTheme);
    window.localStorage.setItem(STORAGE_KEY, effectiveTheme);
    window.localStorage.setItem(MODE_STORAGE_KEY, themeMode);
  }, [effectiveTheme, themeMode]);

  // Listen to OS system color scheme changes when in system mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  // Listen to changes across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === MODE_STORAGE_KEY) {
        const nextMode = e.newValue as ThemeMode | null;
        if (nextMode === 'light' || nextMode === 'dark' || nextMode === 'system') {
          setThemeModeState(nextMode);
        }
      } else if (e.key === STORAGE_KEY && !window.localStorage.getItem(MODE_STORAGE_KEY)) {
        if (e.newValue === 'dark' || e.newValue === 'light') {
          setThemeModeState(e.newValue);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeModeState(next);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      if (prev === 'system') {
        return getSystemTheme() === 'dark' ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const cycleThemeMode = useCallback(() => {
    setThemeModeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  const value = useMemo(
    () => ({
      theme: effectiveTheme,
      themeMode,
      darkMode: effectiveTheme === 'dark',
      setTheme,
      setThemeMode,
      toggleTheme,
      cycleThemeMode,
    }),
    [effectiveTheme, themeMode, setTheme, setThemeMode, toggleTheme, cycleThemeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Shared theme hook. Must be used under ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export default useTheme;
