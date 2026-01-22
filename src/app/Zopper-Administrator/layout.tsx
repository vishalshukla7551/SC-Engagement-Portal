'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRequireAuth } from '@/lib/clientAuth';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ZopperAdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { loading } = useRequireAuth(['ZOPPER_ADMINISTRATOR']);

  // Sidebar state with localStorage persistence
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zopperAdminSidebarOpen');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('zopperAdminSidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  if (loading) {
    return null; // or a loading spinner
  }

  const isActive = (path: string) => pathname === path;

  // Navigation Groups
  const navGroups = [
    {
      title: 'Overview',
      items: [
        { name: 'Home', path: '/Zopper-Administrator', icon: '🏠' },
        { name: 'Hall of Fame', path: '/Zopper-Administrator/hall-of-fame', icon: '🏅' },
        { name: 'Regiments', path: '/Zopper-Administrator/regiments', icon: '⚔️' },
      ]
    },
    {
      title: 'Incentives & Reports',
      items: [
        { name: 'Monthly Incentive', path: '/Zopper-Administrator/monthly-incentive-report', icon: '📄' },
        { name: 'Spot Incentive', path: '/Zopper-Administrator/spot-incentive-report', icon: '📘' },
        { name: 'Referrals', path: '/Zopper-Administrator/referral', icon: '🤝' },
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'User Validation', path: '/Zopper-Administrator/validate-user', icon: '👤' },
        { name: 'Store Requests', path: '/Zopper-Administrator/store-change-requests', icon: '🏪' },
        { name: 'Help Requests', path: '/Zopper-Administrator/help-requests', icon: '🆘' },
      ]
    },
    {
      title: 'Data Operations',
      items: [
        { name: 'Voucher Excel', path: '/Zopper-Administrator/process-voucher-excel', icon: '📊' },
        { name: 'Store Attach Rate', path: '/Zopper-Administrator/import-store-attach-rate', icon: '📈' },
        { name: 'Daily Reports', path: '/Zopper-Administrator/import-daily-reports', icon: '📋' },
        { name: 'Invalid IMEIs', path: '/Zopper-Administrator/process-invalid-imeis', icon: '❌' },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Test Panel', path: '/Zopper-Administrator/test', icon: '🔧' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-[#0B1120] text-slate-300 flex flex-col border-r border-slate-800 h-full transition-all duration-300 ease-in-out overflow-hidden shrink-0 z-30`}
      >
        {/* Logo Area */}
        <div className="relative h-[80px] bg-[#0B1120] border-b border-slate-800 flex items-center px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/20">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg leading-tight tracking-tight">SalesDost</span>
              <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">Administrator</span>
            </div>
          </div>

          {/* Close Button (Mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3 font-mono">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.path) || (item.path !== '/Zopper-Administrator' && pathname?.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`
                        w-full flex items-center gap-3 rounded-xl py-2.5 px-3 transition-all duration-200 group
                        ${active
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 font-medium'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        }
                      `}
                    >
                      <span className={`text-lg transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      <span className="text-sm">{item.name}</span>
                      {active && (
                        <motion.div
                          layoutId="active-pill"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin User Profile Snippet */}
        <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@zopper.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto relative bg-slate-50 transition-all duration-300 ${!sidebarOpen ? '' : ''}`}>
        {/* Hamburger button when sidebar is hidden */}
        {!sidebarOpen && (
          <div className="absolute top-4 left-4 z-40">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 rounded-xl bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-lg border border-slate-200"
              title="Expand Menu"
            >
              <FaBars size={18} />
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
