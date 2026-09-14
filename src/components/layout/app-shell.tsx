'use client';

import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { SidebarProvider, useSidebar } from './sidebar-context';
import { ThemeProvider } from './theme-context';

type AppShellProps = {
  children: React.ReactNode;
  user: {
    displayName: string;
    email: string;
    role: 'ADMIN' | 'MEMBER';
  };
};

function ShellContent({ children, user }: AppShellProps) {
  const { isExpanded, isHovered, isMobileOpen, toggleMobileSidebar } =
    useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      {isMobileOpen ? (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-9998 bg-gray-900/50 lg:hidden"
          onClick={toggleMobileSidebar}
          type="button"
        />
      ) : null}
      <div
        className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
        }`}
      >
        <AppHeader user={user} />
        <main className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <ShellContent {...props} />
      </SidebarProvider>
    </ThemeProvider>
  );
}
