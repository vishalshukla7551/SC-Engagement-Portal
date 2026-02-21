'use client';

import { useAuth } from '@/context/AuthContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isUatUser } from '@/lib/uatRestriction';

// SVG Icons
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor" />
  </svg>
);

const CampaignIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1h2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h2V7c0-1.1-.9-2-2-2zm-2 14H7V8h10v11zm-4-8h-2v6h2v-6z" fill="currentColor" />
  </svg>
);

const ReportIcon = () => (
  <svg width="21" height="19" viewBox="0 0 21 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.125 1.58325H7.875C7.39175 1.58325 7 1.93769 7 2.37492V3.95825C7 4.39548 7.39175 4.74992 7.875 4.74992H13.125C13.6082 4.74992 14 4.39548 14 3.95825V2.37492C14 1.93769 13.6082 1.58325 13.125 1.58325Z" stroke="currentColor" strokeWidth="1.875" />
    <path d="M14 3.16675H15.75C16.2141 3.16675 16.6592 3.33356 16.9874 3.6305C17.3156 3.92743 17.5 4.33016 17.5 4.75008V15.8334C17.5 16.2533 17.3156 16.6561 16.9874 16.953C16.6592 17.2499 16.2141 17.4167 15.75 17.4167H5.25C4.78587 17.4167 4.34075 17.2499 4.01256 16.953C3.68437 16.6561 3.5 16.2533 3.5 15.8334V4.75008C3.5 4.33016 3.68437 3.92743 4.01256 3.6305C4.34075 3.33356 4.78587 3.16675 5.25 3.16675H7" stroke="currentColor" strokeWidth="1.875" />
    <path d="M10.5 8.70825H14" stroke="currentColor" strokeWidth="1.875" />
    <path d="M10.5 12.6667H14" stroke="currentColor" strokeWidth="1.875" />
    <path d="M7 8.70825H7.00875" stroke="currentColor" strokeWidth="1.875" />
    <path d="M7 12.6667H7.00875" stroke="currentColor" strokeWidth="1.875" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_3962_107307)">
      <path d="M10 1C12.2091 1 14 2.79087 14 5C14 7.20913 12.2091 9 10 9C7.79086 9 6 7.20914 6 5C6 2.79086 7.79086 1 10 1Z" stroke="currentColor" strokeWidth="2" />
      <path d="M10 12.5C4.47715 12.5 0 16.9772 0 22.5H20C20 16.9772 15.5228 12.5 10 12.5Z" stroke="currentColor" strokeWidth="2" />
    </g>
    <defs>
      <clipPath id="clip0_3962_107307">
        <rect width="20" height="20" fill="currentColor" />
      </clipPath>
    </defs>
  </svg>
);

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l1.72-1.35c.15-.12.19-.34.1-.51l-1.63-2.83c-.12-.22-.37-.29-.59-.22l-2.03.81c-.42-.32-.9-.6-1.44-.81l-.3-2.16c-.04-.24-.24-.41-.5-.41h-3.26c-.26 0-.46.17-.49.41l-.3 2.16c-.54.21-1.02.49-1.44.81l-2.03-.81c-.22-.09-.47 0-.59.22L2.74 8.87c-.12.22-.08.44.1.51l1.72 1.35c-.05.3-.07.62-.07.94s.02.64.07.94l-1.72 1.35c-.15.12-.19.34-.1.51l1.63 2.83c.12.22.37.29.59.22l2.03-.81c.42.32.9.6 1.44.81l.3 2.16c.04.24.24.41.5.41h3.26c.26 0 .46-.17.49-.41l.3-2.16c.54-.21 1.02-.49 1.44-.81l2.03.81c.22.09.47 0 .59-.22l1.63-2.83c.12-.22.08-.44-.1-.51l-1.72-1.35zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor" />
  </svg>
);

const LoveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" fill="currentColor" />
  </svg>
);

const IncentiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11Z" stroke="currentColor" strokeWidth="2" />
    <path d="M13 2v9h8" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const ReferralsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const HelpRequestsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 16v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 8a2 2 0 0 0-2 2c0 1 1 2 2 3s2 1 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const VoucherIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
  </svg>
);

const AttachRateIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const DailyReportsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
    <path d="M9 15h6M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const InvalidIMEIsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TestPanelIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" />
    <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" stroke="currentColor" strokeWidth="2" fill="currentColor" />
  </svg>
);

// Logo Component
const ZopperLogo = () => (
  <div className="relative w-full h-[69px] bg-black border-b border-[#353535] overflow-hidden flex items-center px-4">
    <div 
      className="absolute w-[72.83px] h-[69px] top-[-1px] left-[6px] rounded-[20px]"
      style={{
        background: 'url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-14/N8vfr4GWX8.png) no-repeat center',
        backgroundSize: 'cover'
      }}
    />
    
    <div 
      className="absolute flex items-center justify-center h-[26px] top-[21px] left-[23px] text-white font-bold text-[20px] leading-[26px] whitespace-nowrap z-[1]"
      style={{ 
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        width: '36px'
      }}
    >
      S
    </div>
    
    <div 
      className="absolute flex items-start justify-start h-[31px] top-[10px] left-[75px] font-bold text-[18px] leading-[31px] whitespace-nowrap z-[3]"
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: 'rgba(0, 0, 0, 0)',
        background: 'linear-gradient(90deg, #1d4ed8, #2563eb)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}
    >
      SalesDost
    </div>
    
    <div 
      className="absolute flex items-start justify-start h-[25px] top-[32px] left-[75px] text-white font-medium text-[11px] leading-[25px] whitespace-nowrap z-[2]"
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      Safalta ka Sathi
    </div>
  </div>
);

// Restricted routes that UAT users cannot access
const RESTRICTED_ROUTES = [
  '/Zopper-Administrator',
  '/Zopper-Administrator/past-campaigns',
  '/Zopper-Administrator/customer-love-index',
  '/Zopper-Administrator/monthly-incentive-report',
  '/Zopper-Administrator/referral',
  '/Zopper-Administrator/validate-user',
  '/Zopper-Administrator/store-change-requests',
  '/Zopper-Administrator/help-requests',
  '/Zopper-Administrator/process-voucher-excel',
  '/Zopper-Administrator/import-store-attach-rate',
  '/Zopper-Administrator/import-daily-reports',
  '/Zopper-Administrator/process-invalid-imeis',
  '/Zopper-Administrator/test',
  '/Zopper-Administrator/referrals',
];

export default function ZopperAdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const uatUserFlag = isUatUser(user);

  // Redirect UAT users to spot-incentive-report on any restricted route
  useEffect(() => {
    if (!loading && uatUserFlag && RESTRICTED_ROUTES.includes(pathname)) {
      router.replace('/Zopper-Administrator/spot-incentive-report');
    }
  }, [loading, uatUserFlag, pathname, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  // Show loading screen while redirecting UAT users from restricted routes
  if (uatUserFlag && RESTRICTED_ROUTES.includes(pathname)) {
    return <LoadingScreen />;
  }

  // Navigation links - filtered based on UAT status
  const allNavLinks = [
    // OVERVIEW
    { href: '/Zopper-Administrator', label: 'Home', icon: <HomeIcon /> },
    { href: '/Zopper-Administrator/past-campaigns', label: 'Past Campaigns', icon: <CampaignIcon /> },
    { href: '/Zopper-Administrator/customer-love-index', label: 'Customer Love Index', icon: <LoveIcon /> },
    
    // INCENTIVES & REPORTS
    { href: '/Zopper-Administrator/monthly-incentive-report', label: 'Monthly Incentive', icon: <IncentiveIcon /> },
    { href: '/Zopper-Administrator/spot-incentive-report', label: 'Spot Incentive', icon: <ReportIcon /> },
    { href: '/Zopper-Administrator/referrals', label: 'Referrals', icon: <ReferralsIcon /> },
    
    // MANAGEMENT
    { href: '/Zopper-Administrator/validate-user', label: 'User Validation', icon: <UserIcon /> },
    { href: '/Zopper-Administrator/store-change-requests', label: 'Store Requests', icon: <SettingsIcon /> },
    { href: '/Zopper-Administrator/help-requests', label: 'Help Requests', icon: <HelpRequestsIcon /> },
    
    // DATA OPERATIONS
    { href: '/Zopper-Administrator/process-voucher-excel', label: 'Voucher Excel', icon: <VoucherIcon /> },
    { href: '/Zopper-Administrator/import-store-attach-rate', label: 'Store Attach Rate', icon: <AttachRateIcon /> },
    { href: '/Zopper-Administrator/import-daily-reports', label: 'Daily Reports', icon: <DailyReportsIcon /> },
    { href: '/Zopper-Administrator/process-invalid-imeis', label: 'Invalid IMEIs', icon: <InvalidIMEIsIcon /> },
    
    // SYSTEM
    { href: '/Zopper-Administrator/test', label: 'Test Panel', icon: <TestPanelIcon /> },
  ];

  // Filter nav links for UAT users - only show spot-incentive-report
  const navLinks = uatUserFlag
    ? allNavLinks.filter(link => link.href === '/Zopper-Administrator/spot-incentive-report')
    : allNavLinks;

  return (
    <div className="flex h-screen bg-slate-50">
      <CollapsibleSidebar
        logo={<ZopperLogo />}
        navLinks={navLinks}
        storageKey="zopper-admin-sidebar-open"
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
