'use client';

import { useAuth } from '@/context/AuthContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';

// SVG Icons
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor" />
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

const ProfileIcon = () => (
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

// Logo Component
const SamsungLogo = () => (
  <div className="relative w-full h-[69px] bg-black border-b border-[#353535] overflow-hidden flex items-center px-4">
    <div 
      className="absolute w-[72.83px] h-[69px] top-[-1px] left-[6px] rounded-[20px]"
      style={{
        background: 'url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-14/N8vfr4GWX8.png) no-repeat center',
        backgroundSize: 'cover'
      }}
    />
    
    <div 
      className="absolute flex items-center justify-center h-[26px] top-[21px] left-[23px] text-white font-bold text-[28px] leading-[26px] whitespace-nowrap z-[1]"
      style={{ 
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        width: '36px'
      }}
    >
      S
    </div>
    
    <div 
      className="absolute flex items-start justify-start h-[31px] top-[7px] left-[87.938px] font-bold text-[26px] leading-[31px] whitespace-nowrap z-[3]"
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
      className="absolute flex items-start justify-start h-[25px] top-[38px] left-[92.938px] text-white font-medium text-[16px] leading-[25px] whitespace-nowrap z-[2]"
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      Safalta ka Sathi
    </div>
  </div>
);

export default function SamsungAdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  const navLinks = [
    { href: '/Samsung-Administrator', label: 'Home', icon: <HomeIcon /> },
    { href: '/Samsung-Administrator/report', label: 'Report', icon: <ReportIcon /> },
    { href: '/Samsung-Administrator/profile', label: 'Profile', icon: <ProfileIcon /> },
  ];

  return (
    <div className="flex h-screen bg-[#1a1d2e]">
      <CollapsibleSidebar
        logo={<SamsungLogo />}
        navLinks={navLinks}
        storageKey="samsung-admin-sidebar-open"
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

