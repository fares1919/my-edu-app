import { useCallback, useEffect, useMemo } from 'react';
import { useUiStore } from '../stores/ui.store';

export type Theme = 'light' | 'dark' | 'high-contrast';

const THEME_STORAGE_KEY = 'my-edu-app-theme';

/**
 * Get the persisted theme from localStorage, falling back to 'light'.
 */
function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'high-contrast') {
      return stored;
    }
  } catch {
    // localStorage unavailable (private browsing, quota, etc.)
  }
  return 'light';
}

/**
 * Persist theme to localStorage.
 */
function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Silently fail
  }
}

/**
 * Custom hook for theme management.
 *
 * - Reads initial theme from localStorage
 * - Syncs theme to `data-theme` attribute on `<html>`
 * - Persists changes to localStorage
 * - Provides `toggleTheme` to switch between light/dark
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme, isDark } = useTheme();
 * ```
 */
export function useTheme() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const animationsEnabled = useUiStore((s) => s.animationsEnabled);

  // ── Bootstrap from localStorage on mount ──────────────
  useEffect(() => {
    const stored = getStoredTheme();
    const current = document.documentElement.getAttribute('data-theme') as Theme | null;

    // If nothing stored yet, check what the DOM currently has
    if (!stored && current) {
      if (current === 'light' || current === 'dark' || current === 'high-contrast') {
        storeTheme(current);
        return;
      }
    }

    // Apply stored theme if different from current
    if (stored && stored !== current) {
      setTheme(stored);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync data-theme attribute + localStorage ──────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storeTheme(theme);
  }, [theme]);

  // ── Toggle between light ↔ dark ───────────────────────
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // ── Derived state ─────────────────────────────────────
  const isDark = theme === 'dark';
  const isHighContrast = theme === 'high-contrast';

  return useMemo(
    () => ({
      /** Current active theme */
      theme,
      /** Toggle between light and dark (skips high-contrast) */
      toggleTheme,
      /** Set any specific theme */
      setTheme,
      /** `true` when dark mode is active */
      isDark,
      /** `true` when high-contrast is active */
      isHighContrast,
    }),
    [theme, toggleTheme, setTheme, isDark, isHighContrast],
  );
}
