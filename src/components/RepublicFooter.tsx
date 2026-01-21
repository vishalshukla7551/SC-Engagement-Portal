'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function RepublicFooter() {
    const pathname = usePathname();

    const getActiveTab = () => {
        if (!pathname) return 'home';
        if (pathname.includes('/incentive-form')) return 'form';
        if (pathname.includes('/passbook') || pathname.includes('/incentive-passbook')) return 'passbook';
        if (pathname.includes('/training')) return 'training';
        if (pathname.includes('/republic-day-hero')) return 'ranking';
        if (pathname.includes('/leaderboard')) return 'leaderboard';
        if (pathname.includes('/republic-leaderboard')) return 'hall-of-fame';
        if (pathname.includes('/home')) return 'home';
        return 'home';
    };

    const active = getActiveTab();

    const navItems = [
        {
            id: 'home',
            label: 'Home',
            href: '/SEC/home',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            id: 'form',
            label: 'Incentive\nForm',
            href: '/SEC/incentive-form',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
            ),
        },
        {
            id: 'ranking',
            label: 'Battle\nStandings',
            href: '/SEC/republic-day-hero',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
            ),
        },
        {
            id: 'hall-of-fame',
            label: 'Hall of\nFame',
            href: '/SEC/republic-leaderboard',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172V5.25a7.454 7.454 0 005.656 2.664M9.497 14.25a7.454 7.454 0 00.981-3.172V5.25a7.454 7.454 0 01-5.656 2.664M13.5 10.5h-3" />
                </svg>
            ),
        },
        {
            id: 'passbook',
            label: 'Incentive\nPassbook',
            href: '/SEC/passbook',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
        },
    ];

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-40">
            {/* Footer Top Decoration - Tricolor Wave/Strip with Shimmer */}
            <div className="h-1.5 w-full flex overflow-hidden relative">
                <div className="h-full w-1/3 bg-[#FF9933] relative">
                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] skew-x-12 translate-x-[-100%]"></div>
                </div>
                <div className="h-full w-1/3 bg-white relative">
                    <div className="absolute inset-0 bg-gray-100/30 animate-[shimmer_2s_infinite_0.5s] skew-x-12 translate-x-[-100%]"></div>
                </div>
                <div className="h-full w-1/3 bg-[#138808] relative">
                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite_1s] skew-x-12 translate-x-[-100%]"></div>
                </div>
            </div>

            {/* Dark Footer Content */}
            <div className="bg-[#1a1a2e] pb-safe pt-2">
                <nav className="flex justify-around items-center px-2 pb-2">
                    {navItems.map((item) => {
                        const isActive = active === item.id;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all duration-300 ${isActive
                                    ? 'text-[#FF9933]'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                <div className={`transition-transform duration-300 ${isActive ? 'animate-bounce' : 'hover:-translate-y-1'}`}>
                                    {item.icon}
                                </div>
                                <span className={`text-[10px] mobile-s:text-[8px] font-medium text-center whitespace-pre-line leading-tight transition-all ${isActive ? 'font-bold scale-105' : ''}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Powered By */}
                <div className="text-center pb-2 opacity-30 text-[10px] text-white">
                    <p>Powered by Zopper</p>
                    <p>salesdost.com</p>
                </div>
            </div>

            {/* Duplicate keyframes if they are not loaded globally from Header (Safety measure) */}
            <style jsx global>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%) skewX(-12deg); }
                    100% { transform: translateX(200%) skewX(-12deg); }
                }
            `}</style>
        </footer>
    );
}
