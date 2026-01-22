'use client';

import { useState, useEffect, useRef } from 'react';
import { clientLogout } from '@/lib/clientLogout';
import confetti from 'canvas-confetti';

interface RepublicHeaderProps {
    userName?: string;
    hideGreeting?: boolean;
}

export default function RepublicHeader({ userName = 'Guest', hideGreeting = false }: RepublicHeaderProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [greetingText, setGreetingText] = useState('');
    const fullGreeting = `Jai Hind, ${userName}`;

    const handleLogout = () => {
        clientLogout('/login/sec', false);
    };

    const handleConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.2 }, // Top area
            colors: ['#FF9933', '#FFFFFF', '#138808'] // Tricolor
        });
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Typing effect for greeting
    useEffect(() => {
        if (hideGreeting) return;

        let i = 0;
        const speed = 100; // Typing speed
        const timer = setInterval(() => {
            if (i < fullGreeting.length) {
                setGreetingText(fullGreeting.substring(0, i + 1));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [fullGreeting, hideGreeting]);

    // Redirect SEC users without a full name to the name capture screen
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const pathname = window.location.pathname || '';

        if (!pathname.startsWith('/SEC') || pathname === '/SEC/onboarding') {
            return;
        }

        try {
            const raw = window.localStorage.getItem('authUser');
            if (!raw) return;

            const auth = JSON.parse(raw);
            const fullName = (auth?.fullName || '').trim();

            if (!fullName) {
                window.location.href = '/SEC/onboarding';
            }
        } catch {
            // ignore JSON parse errors
        }
    }, []);

    return (
        <header className="relative bg-white shadow-sm pb-1 pt-4">
            {/* Animated Tricolor Top Border with Shimmer */}
            <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden">
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

            {/* Background Animations Container (Isolated to prevent scrollbars) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Enhanced Floating Kites Animation */}
                <div className="absolute top-2 right-10 w-8 h-8 opacity-40 animate-[float_6s_ease-in-out_infinite]">
                    <svg viewBox="0 0 24 24" fill="url(#kiteGradient1)">
                        <defs>
                            <linearGradient id="kiteGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF9933" />
                                <stop offset="100%" stopColor="#FF7700" />
                            </linearGradient>
                        </defs>
                        <path d="M12 2L2 12l10 10 10-10L12 2z" />
                    </svg>
                </div>

                <div className="absolute top-8 left-40 w-5 h-5 opacity-30 animate-[float_5s_ease-in-out_infinite_1s]">
                    <svg viewBox="0 0 24 24" fill="url(#kiteGradient2)">
                        <defs>
                            <linearGradient id="kiteGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#138808" />
                                <stop offset="100%" stopColor="#0E6005" />
                            </linearGradient>
                        </defs>
                        <path d="M12 2L2 12l10 10 10-10L12 2z" />
                    </svg>
                </div>

                <div className="absolute -top-2 right-1/3 w-4 h-4 opacity-20 animate-[float_7s_ease-in-out_infinite_2s]">
                    <svg viewBox="0 0 24 24" fill="#000080">
                        <path d="M12 2L2 12l10 10 10-10L12 2z" />
                    </svg>
                </div>

                {/* Jet Flypast Silhouette (Subtle) */}
                <div className="absolute top-1 left-0 w-full h-full opacity-10">
                    <div className="animate-[flypast_15s_linear_infinite] w-8 h-8 text-black flex items-center justify-center transform -rotate-90">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                        </svg>
                    </div>
                </div>

                {/* Drifting Petals - Saffron & Green */}
                <div className="absolute top-0 left-10 w-3 h-3 opacity-0 animate-[petal-fall_4s_linear_infinite_0.5s]">
                    <svg viewBox="0 0 24 24" fill="#FF9933"><circle cx="12" cy="12" r="10" /></svg>
                </div>
                <div className="absolute top-2 left-1/2 w-2 h-2 opacity-0 animate-[petal-fall_6s_linear_infinite_2s]">
                    <svg viewBox="0 0 24 24" fill="#138808"><circle cx="12" cy="12" r="10" /></svg>
                </div>
                <div className="absolute top-1 right-20 w-3 h-3 opacity-0 animate-[petal-fall_5s_linear_infinite_1.5s]">
                    <svg viewBox="0 0 24 24" fill="#FF9933"><circle cx="12" cy="12" r="10" /></svg>
                </div>
            </div>

            {/* Header Content */}
            <div className="px-5 flex justify-between items-start relative z-20">
                {!hideGreeting ? (
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            {/* Spinning Chakra Icon with Glow */}
                            <div className="relative group cursor-pointer" onClick={handleConfetti} title="Click for Celebration!">
                                <span className="text-xl animate-[spin_8s_linear_infinite] block relative z-10 hover:scale-125 transition-transform duration-300">☸️</span>
                                <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full animate-pulse z-0 group-hover:bg-blue-500/40"></div>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 drop-shadow-sm min-h-[28px]">
                                {greetingText}
                                <span className="animate-pulse">|</span>
                            </h1>
                        </div>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-bounce"></span>
                            Republic Day Special • Sales Dost
                            <span className="w-2 h-2 rounded-full bg-[#138808] animate-bounce delay-100"></span>
                        </p>
                    </div>
                ) : (
                    <div className="flex-1">
                        {/* Simplified view when greeting is hidden */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <span className="text-xl animate-[spin_6s_linear_infinite] block relative z-10">☸️</span>
                                <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-full animate-pulse"></div>
                            </div>
                            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] animate-gradient-x bg-[length:200%_auto]">
                                Republic Day
                            </span>
                        </div>
                    </div>
                )}

                {/* Profile Button with Ripple Effect */}
                <div ref={menuRef} className="relative z-50">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="group w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:shadow-md hover:border-[#FF9933]/30 transition-all duration-300 focus:ring-2 focus:ring-[#FF9933]/20 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF9933]/10 to-[#138808]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                        <div
                            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-[slideUpFade_0.3s_ease-out]"
                            style={{ zIndex: 99999 }}
                        >
                            <button
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    window.location.href = '/SEC/profile';
                                }}
                                className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group"
                            >
                                <div className="p-1.5 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">My Account</span>
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    handleLogout();
                                }}
                                className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors group"
                            >
                                <div className="p-1.5 rounded-full bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>


            {/* Global Keyframes for Animations */}
            <style jsx global>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%) skewX(-12deg); }
                    100% { transform: translateX(200%) skewX(-12deg); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(12deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes flypast {
                    0% { transform: translateX(-100px) translateY(10px) rotate(90deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateX(120vw) translateY(-20px) rotate(90deg); opacity: 0; }
                }
                @keyframes petal-fall {
                    0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.8; }
                    100% { transform: translateY(100px) rotate(360deg) translateX(20px); opacity: 0; }
                }
            `}</style>
        </header>
    );
}
