import { useCallback, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import '../../styles/theme.css';

interface ThemeToggleProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Glass-morphism variant */
  glass?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Optional label for assistive tech (default: 'تغيير السمة') */
  label?: string;
}

/**
 * Premium ThemeToggle button.
 *
 * Switches between light ↔ dark modes with a smooth
 * sun → moon icon morph animation.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * <ThemeToggle size="sm" glass />
 * ```
 */
export function ThemeToggle({
  size = 'md',
  glass = false,
  className = '',
  label = 'تغيير السمة',
}: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [pressed, setPressed] = useState(false);

  const handleClick = useCallback(() => {
    setPressed(true);
    toggleTheme();
    // Reset pressed state after animation completes
    setTimeout(() => setPressed(false), 500);
  }, [toggleTheme]);

  const sizeClass = size === 'sm' ? 'theme-toggle--sm' : size === 'lg' ? 'theme-toggle--lg' : '';
  const glassClass = glass ? 'theme-toggle--glass' : '';
  const pressedAttr = pressed ? 'true' : undefined;

  return (
    <button
      type="button"
      className={`theme-toggle ${sizeClass} ${glassClass} ${className}`.trim()}
      data-pressed={pressedAttr}
      onClick={handleClick}
      aria-label={label}
      title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {/* Sun icon */}
        <svg
          className="theme-toggle__sun"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>

        {/* Moon icon */}
        <svg
          className="theme-toggle__moon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  );
}
