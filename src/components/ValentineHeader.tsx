'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { clientLogout } from '@/lib/clientLogout';

interface ValentineHeaderProps {
    userName?: string;
    hideGreeting?: boolean;
}


import { useRouter } from 'next/navigation';

export default function ValentineHeader({ userName = 'Dreamer', hideGreeting = false }: ValentineHeaderProps) {
    const router = useRouter(); // Initialize hook
    const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
    const [userPhoto, setUserPhoto] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Initialize state from local storage or props
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const raw = window.localStorage.getItem('authUser');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed?.otherProfileInfo?.photoUrl) {
                        setUserPhoto(parsed.otherProfileInfo.photoUrl);
                    }
                }
            } catch (e) {
                // ignore
            }
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const addHeart = (x: number, y: number) => {
        const id = Date.now();
        setHearts((prev) => [...prev, { id, x, y }]);
        setTimeout(() => {
            setHearts((prev) => prev.filter((h) => h.id !== id));
        }, 1000);
    };

    return (
        <div className="relative z-30 w-full shrink-0 mb-2 group">
            {/* Background Layer - Clipped */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff7a9a] via-[#ec255a] to-[#c21e4e] rounded-b-[30px] shadow-[0_10px_30px_-10px_rgba(236,37,90,0.6),inset_0_-5px_10px_rgba(0,0,0,0.1),inset_0_2px_5px_rgba(255,255,255,0.2)] overflow-hidden">
                {/* Background Pattern/Texture */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

                {/* Twinkling Sparkles Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={`sparkle-${i}`}
                            className="absolute text-yellow-200 text-xs"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        >
                            ✨
                        </motion.div>
                    ))}
                </div>

                {/* Hearts PNG Decoration */}
                <div className="absolute -top-14 -right-16 w-60 h-32 opacity-50 pointer-events-none z-0 overflow-hidden">
                    <motion.img
                        src="/hearts.png"
                        alt="Hearts Decoration"
                        className="absolute top-0 left-0 w-full h-60 max-w-none object-contain object-top origin-bottom"
                        animate={{ rotate: [0, -2, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute top-20 -left-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>

                {/* Right Side Floating White Hearts (Weaving Effect) */}
                <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden pointer-events-none z-0">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-white/40 filter drop-shadow-sm"
                            style={{
                                fontSize: `${Math.random() * 25 + 10}px`,
                                right: `${Math.random() * 60}%`,
                                bottom: -20
                            }}
                            animate={{
                                y: [-20, -150],
                                x: [0, Math.sin(i) * 25, 0],
                                opacity: [0, 0.8, 0],
                                rotate: [0, 20, -20]
                            }}
                            transition={{
                                duration: 4 + Math.random() * 3,
                                repeat: Infinity,
                                delay: i * 0.5,
                                ease: "easeInOut"
                            }}
                        >
                            🤍
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Content Layer - Unclipped */}
            <div className="relative px-6 pt-8 pb-4">
                {/* Interactive Burst Hearts */}
                <AnimatePresence>
                    {hearts.map((heart) => (
                        <motion.div
                            key={heart.id}
                            initial={{ opacity: 1, scale: 0, x: heart.x, y: heart.y }}
                            animate={{ opacity: 0, scale: 2, y: heart.y - 100 }}
                            exit={{ opacity: 0 }}
                            className="absolute text-2xl pointer-events-none z-50"
                        >
                            ❤️
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Combined Top Row: Name Left, Profile Right */}
                <div className="flex justify-between items-end relative z-10">
                    {/* Personalized Name Section */}
                    {!hideGreeting ? (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col"
                        >
                            <p className="text-rose-200 text-[10px] font-bold uppercase tracking-widest mb-0.5 ml-0.5">Welcome</p>
                            <div className="flex items-center gap-2">
                                <h2 className="text-4xl font-black text-white drop-shadow-xl tracking-tighter">
                                    {userName}
                                </h2>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-2xl filter drop-shadow-lg cursor-pointer active:scale-95"
                                    onClick={(e) => {
                                        // Get click position relative to the header container
                                        const headerRect = e.currentTarget.closest('.group')?.getBoundingClientRect();
                                        if (headerRect) {
                                            const x = e.clientX - headerRect.left;
                                            const y = e.clientY - headerRect.top;
                                            addHeart(x, y);
                                        }
                                    }}
                                >
                                    ❤️
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Heart Pulse ECG Metaphor for Sales + Love */
                        <div className="flex items-center gap-2 -translate-y-1">
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    filter: ["drop-shadow(0 0 0px #fff)", "drop-shadow(0 0 8px #fff)", "drop-shadow(0 0 0px #fff)"]
                                }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                                className="text-2xl"
                            >
                                ❤️
                            </motion.div>
                            <div className="relative w-32 h-10 overflow-hidden">
                                <svg width="120" height="40" viewBox="0 0 120 40" fill="none" className="drop-shadow-sm">
                                    <motion.path
                                        d="M0 20H20L25 5L35 35L42 15L48 20H70L75 2L85 38L95 20H120"
                                        stroke="white"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{
                                            pathLength: [0, 1, 1],
                                            opacity: [0, 1, 0],
                                            pathOffset: [0, 0, 0.2]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            times: [0, 0.8, 1]
                                        }}
                                    />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Profile Icon with Dropdown */}
                    <div ref={dropdownRef} className="relative z-50">
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-10 h-10 translate-y-2 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg cursor-pointer hover:bg-white/30 transition-colors overflow-hidden"
                        >
                            {userPhoto ? (
                                <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg">👤</span>
                            )}
                        </div>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 top-full mt-4 w-48 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/40 overflow-hidden"
                                >
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                router.push('/SEC/profile');
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-rose-50 flex items-center gap-3 transition-colors group"
                                        >
                                            <span className="bg-rose-100 p-1.5 rounded-lg group-hover:bg-rose-200 transition-colors">👤</span>
                                            <span className="font-medium text-sm">Profile</span>
                                        </button>

                                        <div className="h-px bg-gray-100 mx-2"></div>

                                        <button
                                            onClick={() => {
                                                router.push('/SEC/support');
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-rose-50 flex items-center gap-3 transition-colors group"
                                        >
                                            <span className="bg-rose-100 p-1.5 rounded-lg group-hover:bg-rose-200 transition-colors">❓</span>
                                            <span className="font-medium text-sm">Help & Support</span>
                                        </button>

                                        <div className="h-px bg-gray-100 mx-2"></div>

                                        <button
                                            onClick={() => {
                                                clientLogout('/login/sec');
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors group"
                                        >
                                            <span className="bg-red-100 p-1.5 rounded-lg group-hover:bg-red-200 transition-colors">🚪</span>
                                            <span className="font-medium text-sm">Logout</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
