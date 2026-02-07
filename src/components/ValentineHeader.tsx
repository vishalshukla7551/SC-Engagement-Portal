'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ValentineHeaderProps {
    userName?: string;
    hideGreeting?: boolean;
}


import { useRouter } from 'next/navigation';

export default function ValentineHeader({ userName = 'Dreamer', hideGreeting = false }: ValentineHeaderProps) {
    const router = useRouter(); // Initialize hook
    const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

    const addHeart = (x: number, y: number) => {
        const id = Date.now();
        setHearts((prev) => [...prev, { id, x, y }]);
        setTimeout(() => {
            setHearts((prev) => prev.filter((h) => h.id !== id));
        }, 1000);
    };

    return (
        <div className="bg-gradient-to-br from-[#ff7a9a] via-[#ec255a] to-[#c21e4e] rounded-b-[30px] shadow-[0_10px_30px_-10px_rgba(236,37,90,0.6),inset_0_-5px_10px_rgba(0,0,0,0.1),inset_0_2px_5px_rgba(255,255,255,0.2)] pb-4 mb-2 px-6 pt-8 relative overflow-hidden shrink-0 z-30 w-full group">
            {/* Background Pattern/Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

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

                {/* Profile Icon */}
                <div
                    onClick={() => router.push('/SEC/profile')}
                    className="w-10 h-10 translate-y-2 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg cursor-pointer hover:bg-white/30 transition-colors"
                >
                    <span className="text-lg">👤</span>
                </div>
            </div>
        </div>
    );
}
