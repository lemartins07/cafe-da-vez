'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type SidebarContextValue = {
  closeMobileSidebar: () => void;
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  setIsHovered: (value: boolean) => void;
  toggleMobileSidebar: () => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setIsMobileOpen(false);
    };

    window.addEventListener('resize', closeOnDesktop);
    return () => window.removeEventListener('resize', closeOnDesktop);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        closeMobileSidebar: () => setIsMobileOpen(false),
        isExpanded,
        isHovered,
        isMobileOpen,
        setIsHovered,
        toggleMobileSidebar: () => setIsMobileOpen((value) => !value),
        toggleSidebar: () => setIsExpanded((value) => !value),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error('useSidebar must be used inside SidebarProvider');
  return context;
}
