import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isSystemPreference: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'theme-preference';

function safeGetStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail (private browsing)
  }
}

function getInitialTheme(): { theme: Theme; isSystem: boolean } {
  const stored = safeGetStorage(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return { theme: stored, isSystem: false };
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return { theme: prefersDark ? 'dark' : 'dark', isSystem: true };
  }

  return { theme: 'dark', isSystem: true };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme().theme);
  const [isSystemPreference, setIsSystemPreference] = useState(() => getInitialTheme().isSystem);

  const applyTheme = useCallback((newTheme: Theme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.setAttribute('data-theme-transitioning', '');
    setTimeout(() => {
      document.documentElement.removeAttribute('data-theme-transitioning');
    }, 200);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setIsSystemPreference(false);
    safeSetStorage(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Sync on mount (ensure React state matches DOM)
  useEffect(() => {
    const currentAttr = document.documentElement.getAttribute('data-theme');
    if (currentAttr === 'light' || currentAttr === 'dark') {
      setThemeState(currentAttr);
    }
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (!isSystemPreference) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setThemeState(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [isSystemPreference]);

  // Multi-tab sync via storage events
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (newTheme === 'light' || newTheme === 'dark') {
          setThemeState(newTheme);
          setIsSystemPreference(false);
          document.documentElement.setAttribute('data-theme', newTheme);
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isSystemPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeContext };
