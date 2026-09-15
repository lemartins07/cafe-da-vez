'use client';

import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';
import { useSidebar } from './sidebar-context';

type AppHeaderProps = {
  user: {
    displayName: string;
    email: string;
    role: 'ADMIN' | 'MEMBER' | 'SYSTEM_ADMIN';
    systemAdmin: boolean;
  };
};

export function AppHeader({ user }: AppHeaderProps) {
  const { isMobileOpen, toggleMobileSidebar, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-999 flex w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex w-full items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex items-center gap-3">
          <button
            aria-label={isMobileOpen ? 'Fechar menu' : 'Abrir menu'}
            className="flex size-11 items-center justify-center rounded-lg border border-gray-200 text-gray-500 lg:hidden dark:border-gray-800 dark:text-gray-400"
            onClick={toggleMobileSidebar}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="20"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="20"
            >
              {isMobileOpen ? (
                <path d="M6 6l12 12M18 6 6 18" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <button
            aria-label="Recolher ou expandir menu"
            className="hidden size-11 items-center justify-center rounded-lg border border-gray-200 text-gray-500 lg:flex dark:border-gray-800 dark:text-gray-400"
            onClick={toggleSidebar}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="20"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="20"
            >
              <path d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900 lg:hidden dark:text-white">
            Café da Vez
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu {...user} />
        </div>
      </div>
    </header>
  );
}
