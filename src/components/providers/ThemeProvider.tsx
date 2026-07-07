import type { ReactNode } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Initialises the theme system on mount.
 *
 * - Restores persisted theme from localStorage
 * - Sets the `data-theme` attribute on `<html>`
 * - Ensures smooth light/dark/high-contrast switching
 *
 * Must be placed inside `<AppProviders>` so the
 * `useTheme` hook can read from the Zustand store.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // The hook handles all side-effects (localStorage, data-theme attr)
  useTheme();

  // No wrapper DOM node — theme is applied via attribute
  return <>{children}</>;
}
