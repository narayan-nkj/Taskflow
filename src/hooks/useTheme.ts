import { useState, useEffect, useCallback } from 'react';
import { loadThemeFromStorage, saveThemeToStorage, ThemePreference } from '../utils/storage';

export function useTheme() {
  const [theme, setTheme] = useState<ThemePreference>(() => loadThemeFromStorage());
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = loadThemeFromStorage();
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const applyTheme = useCallback((currentTheme: ThemePreference) => {
    if (typeof window === 'undefined') return;

    let resolveDark = false;
    if (currentTheme === 'dark') {
      resolveDark = true;
    } else if (currentTheme === 'light') {
      resolveDark = false;
    } else {
      // system
      resolveDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDark(resolveDark);
    if (resolveDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', resolveDark ? 'dark' : 'light');
    }
  }, []);

  // Update DOM when theme state changes
  useEffect(() => {
    applyTheme(theme);
    saveThemeToStorage(theme);
  }, [theme, applyTheme]);

  // Listen for system changes when preference is 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  // Listen for storage changes from other browser tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'taskflow:theme:v1') {
        const newTheme = loadThemeFromStorage();
        setTheme(newTheme);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    // Simple two-way toggle that flips current visual state
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark]);

  const setSpecificTheme = useCallback((newTheme: ThemePreference) => {
    setTheme(newTheme);
  }, []);

  return {
    theme,
    isDark,
    toggleTheme,
    setSpecificTheme,
  };
}
