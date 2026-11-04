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

const THEME_KEY = 'theme';
const MODE_KEY = 'themeMode';

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveTheme(mode: ThemeMode): Theme {
  if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return mode;
}

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const mode = window.localStorage.getItem(MODE_KEY);
  if (mode === 'light' || mode === 'dark' || mode === 'system') return mode;
  const legacy = window.localStorage.getItem(THEME_KEY);
  if (legacy === 'dark' || legacy === 'light') return legacy;
  return 'system';
}

export function readStoredTheme(): Theme {
  return resolveTheme(readStoredMode());
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
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Single source of truth for light/dark across public pages and every dashboard.
 * Supports explicit light/dark plus system preference (used by System Settings).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => readStoredMode());
  const [theme, setThemeState] = useState<Theme>(() => resolveTheme(readStoredMode()));

  useEffect(() => {
    const resolved = resolveTheme(themeMode);
    setThemeState(resolved);
    applyTheme(resolved);
    window.localStorage.setItem(MODE_KEY, themeMode);
    window.localStorage.setItem(THEME_KEY, resolved);
  }, [themeMode]);

  useEffect(() => {
    if (themeMode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const resolved = resolveTheme('system');
      setThemeState(resolved);
      applyTheme(resolved);
      window.localStorage.setItem(THEME_KEY, resolved);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [themeMode]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === MODE_KEY) {
        const next =
          e.newValue === 'dark' || e.newValue === 'light' || e.newValue === 'system'
            ? e.newValue
            : 'light';
        setThemeModeState(next);
        return;
      }
      if (e.key === THEME_KEY && e.newValue === 'dark') {
        setThemeModeState('dark');
      } else if (e.key === THEME_KEY && e.newValue === 'light') {
        setThemeModeState('light');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeModeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      const current = resolveTheme(prev);
      return current === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      darkMode: theme === 'dark',
      setTheme,
      setThemeMode,
      toggleTheme,
    }),
    [theme, themeMode, setTheme, setThemeMode, toggleTheme]
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
