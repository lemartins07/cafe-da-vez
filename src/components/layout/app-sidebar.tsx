'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavIcon } from './nav-icon';
import { useSidebar } from './sidebar-context';

const navigation = [
  { href: '/' as Route, icon: 'home' as const, label: 'Início' },
  { href: '/filas' as Route, icon: 'queues' as const, label: 'Filas' },
  {
    href: '/integrantes' as Route,
    icon: 'members' as const,
    label: 'Integrantes',
  },
  { href: '/historico' as Route, icon: 'history' as const, label: 'Histórico' },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const {
    closeMobileSidebar,
    isExpanded,
    isHovered,
    isMobileOpen,
    setIsHovered,
  } = useSidebar();
  const showLabels = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed top-0 left-0 z-9999 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:translate-x-0 dark:border-gray-800 dark:bg-gray-900 ${
        showLabels ? 'w-[290px]' : 'w-[90px]'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        className={`flex py-8 ${showLabels ? 'justify-start' : 'justify-center'}`}
        href="/"
        onClick={closeMobileSidebar}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-xl text-white">
          ☕
        </span>
        {showLabels ? (
          <span className="ml-3 self-center text-xl font-semibold text-gray-900 dark:text-white">
            Café da Vez
          </span>
        ) : null}
      </Link>

      <nav className="flex flex-1 flex-col overflow-y-auto">
        {showLabels ? (
          <p className="mb-4 text-xs font-medium text-gray-400 uppercase">
            Menu
          </p>
        ) : null}
        <ul className="flex flex-col gap-2">
          {navigation.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  aria-current={active ? 'page' : undefined}
                  aria-label={item.label}
                  className={`group menu-item ${
                    active ? 'menu-item-active' : 'menu-item-inactive'
                  } ${showLabels ? 'justify-start' : 'justify-center'}`}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  title={showLabels ? undefined : item.label}
                >
                  <span
                    className={
                      active
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive'
                    }
                  >
                    <NavIcon name={item.icon} />
                  </span>
                  {showLabels ? <span>{item.label}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
