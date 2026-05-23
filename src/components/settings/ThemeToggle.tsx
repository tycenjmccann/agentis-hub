import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-3">
      <span id="theme-toggle-label" className="text-sm font-medium text-text-primary">
        {isDark ? 'Dark' : 'Light'} mode
      </span>
      <button
        role="switch"
        aria-checked={isDark}
        aria-labelledby="theme-toggle-label"
        aria-describedby="theme-toggle-description"
        onClick={toggleTheme}
        className="relative inline-flex h-7 w-14 items-center rounded-full
          focus-visible:shadow-focus focus-visible:outline-none
          active:scale-95
          motion-reduce:transition-none"
        style={{
          backgroundColor: isDark ? 'var(--toggle-track-active)' : 'var(--toggle-track-bg)',
          transition: 'background-color 200ms ease',
        }}
      >
        <span
          className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full
            hover:brightness-110 hover:scale-105
            active:scale-95
            motion-reduce:transition-none"
          style={{
            backgroundColor: 'var(--toggle-thumb-bg)',
            transform: isDark ? 'translateX(30px)' : 'translateX(3px)',
            transition: 'transform 300ms cubic-bezier(0.68, -0.2, 0.27, 1.2)',
          }}
        >
          {isDark ? (
            <Moon size={14} style={{ color: 'var(--toggle-track-active)' }} />
          ) : (
            <Sun size={14} style={{ color: 'var(--toggle-icon-inactive)' }} />
          )}
        </span>
      </button>
      <span id="theme-toggle-description" className="sr-only">
        Toggle between light and dark color themes
      </span>
    </div>
  );
}
