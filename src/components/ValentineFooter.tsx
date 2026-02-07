'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ValentineFooter() {
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const getActiveTab = () => {
        if (!pathname) return 'home';
        if (pathname.includes('/incentive-form')) return 'form';
        if (pathname.includes('/passbook') || pathname.includes('/incentive-passbook')) return 'passbook';
        if (pathname.includes('/training')) return 'training';
        if (pathname.includes('/love-submissions') || pathname.includes('/sales-submissions')) return 'submissions';
        if (pathname.includes('/valentine-day')) return 'customer-honour';
        if (pathname.includes('/romance-merit-board')) return 'love-index';
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
            label: 'Sales\nForm',
            href: '/SEC/incentive-form',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
            ),
        },
        {
            id: 'customer-honour',
            label: 'Customer\nHonour',
            href: '/SEC/valentine-day',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
            ),
        },
        {
            id: 'love-index',
            label: 'Customer\nLove Index',
            href: '/SEC/romance-merit-board',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
            ),
        },
        {
            id: 'submissions',
            label: 'My\nSubmissions',
            href: '/SEC/love-submissions',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75V17.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
            ),
        },
    ];

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50">
            {/* Top Border Gradient */}
            <div className="h-[2px] w-full bg-gradient-to-r from-rose-500 via-pink-400 to-rose-500 shadow-[0_0_10px_rgba(251,113,133,0.8)]"></div>

            {/* Main Footer Body */}
            <div className="bg-[#1a1a2e] pb-safe pt-2 relative z-10 overflow-hidden">
                {/* Floating Hearts Background */}
                {isClient && (
                    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-rose-500/10 text-xl"
                                initial={{ y: 50, x: Math.random() * 100 + "%", opacity: 0, scale: 0.5 }}
                                animate={{
                                    y: -20,
                                    x: [(Math.random() * 100) + "%", (Math.random() * 100) + "%"],
                                    opacity: [0, 0.8, 0],
                                    scale: 1.2
                                }}
                                transition={{
                                    duration: 4 + Math.random() * 3,
                                    repeat: Infinity,
                                    delay: i * 0.8,
                                    ease: "easeInOut"
                                }}
                            >
                                ❤️
                            </motion.div>
                        ))}
                    </div>
                )}

                <nav className="flex justify-around items-center px-2 pb-2 relative z-10">
                    {navItems.map((item) => {
                        const isActive = active === item.id;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all duration-300 relative group ${isActive
                                    ? 'text-rose-400'
                                    : 'text-gray-400 hover:text-rose-200'
                                    }`}
                            >
                                {/* Active Indicator Glow (Heart Pulse) */}
                                {isActive && (
                                    <motion.div
                                        className="absolute inset-0 bg-rose-500/10 rounded-xl blur-md -z-10"
                                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                )}

                                <motion.div
                                    className={`transition-transform duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]' : 'group-hover:-translate-y-1'}`}
                                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                    transition={isActive ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
                                >
                                    {item.icon}
                                </motion.div>
                                <span className={`text-[10px] mobile-s:text-[8px] font-medium text-center whitespace-pre-line leading-tight transition-all ${isActive ? 'font-bold' : ''}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Powered By */}
                <div className="text-center pb-2 opacity-30 text-[10px] text-white relative z-10">
                    <p className="flex items-center justify-center gap-1">
                        Powered by Zopper
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            ❤️
                        </motion.span>
                    </p>
                    <p>salesdost.com</p>
                </div>
            </div>
        </footer>
    );
}
