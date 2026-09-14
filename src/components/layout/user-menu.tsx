'use client';

import { useEffect, useRef, useState } from 'react';
import { logout } from '@/app/(cafe)/auth-actions';

type UserMenuProps = {
  displayName: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
};

export function UserMenu({ displayName, email, role }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node))
        setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        className="flex items-center text-gray-700 dark:text-gray-400"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="mr-3 flex size-11 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
          {initials}
        </span>
        <span className="mr-2 hidden max-w-40 truncate text-sm font-medium sm:block">
          {displayName}
        </span>
        <svg
          aria-hidden="true"
          fill="none"
          height="18"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="18"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-4 w-[280px] rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark">
          <div className="border-b border-gray-200 px-3 pb-3 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {displayName}
            </p>
            <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
              {email}
            </p>
            <span className="mt-2 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              {role === 'ADMIN' ? 'Administrador' : 'Integrante'}
            </span>
          </div>
          <form action={logout} className="mt-3">
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              type="submit"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="20"
                stroke="currentColor"
                viewBox="0 0 24 24"
                width="20"
              >
                <path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              </svg>
              Sair
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
