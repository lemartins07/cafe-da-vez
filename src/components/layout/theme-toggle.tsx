'use client';

import { useTheme } from './theme-context';

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      aria-label="Alternar tema"
      className="flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      onClick={toggleTheme}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="hidden dark:block"
        fill="none"
        height="20"
        stroke="currentColor"
        viewBox="0 0 24 24"
        width="20"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
      </svg>
      <svg
        aria-hidden="true"
        className="dark:hidden"
        fill="none"
        height="20"
        stroke="currentColor"
        viewBox="0 0 24 24"
        width="20"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
    </button>
  );
}
