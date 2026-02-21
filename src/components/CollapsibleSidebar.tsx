'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface CollapsibleSidebarProps {
  logo?: React.ReactNode;
  navLinks: NavLink[];
  storageKey?: string;
}

export function CollapsibleSidebar({
  logo,
  navLinks,
  storageKey = 'sidebar-open',
}: CollapsibleSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage and detect mobile
  useEffect(() => {
    setMounted(true);
    
    // Check mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Load from localStorage
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      setIsOpen(JSON.parse(saved));
    } else {
      // Default: closed on mobile, open on desktop
      setIsOpen(window.innerWidth >= 768);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [storageKey]);

  // Persist to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(storageKey, JSON.stringify(isOpen));
    }
  }, [isOpen, storageKey, mounted]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const isActive = (href: string) => pathname === href;

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative
          top-0 left-0 h-screen
          bg-black text-white
          border-r border-neutral-700
          flex flex-col
          transition-all duration-300 ease-in-out
          z-40
          ${isOpen ? 'w-72' : 'w-0 md:w-20'}
          ${isMobile ? 'shadow-lg' : ''}
        `}
      >
        {/* Logo Section */}
        <div
          className={`
            flex items-center justify-between
            h-[69px] px-4
            border-b border-neutral-700
            flex-shrink-0
            overflow-hidden
          `}
        >
          {/* Hamburger Button - Always visible */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-neutral-800 transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          
          <div className={`flex-1 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {logo}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-4 overflow-y-auto">
          <div className="space-y-1 px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3
                  rounded-lg py-2 px-3
                  transition-all duration-200
                  select-none whitespace-nowrap
                  ${
                    isActive(link.href)
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }
                `}
              >
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {link.icon}
                </span>
                <span
                  className={`
                    text-sm font-medium
                    transition-opacity duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}
                  `}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Toggle Button - Bottom */}
        <div className="md:hidden border-t border-neutral-700 p-3">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        </div>
      </aside>

      {/* Hamburger Button - Mobile Only (when sidebar closed) */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-black border border-neutral-700 text-white hover:bg-neutral-900 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
      )}
    </>
  );
}
