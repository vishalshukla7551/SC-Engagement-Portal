'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function RepublicLanding() {
    const router = useRouter();

    useEffect(() => {
        // Redirect logic - keep the flow moving after a short delay
        const timer = setTimeout(() => {
            router.push('/login/sec');
        }, 8000); // 8 seconds to enjoy the animation

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center overflow-hidden">

            {/* Tricolor Ambient Background */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{
                        x: [-100, 100, -100],
                        y: [-50, 50, -50],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] bg-orange-400/20 rounded-full blur-[100px] mix-blend-multiply"
                />
                <motion.div
                    animate={{
                        x: [100, -100, 100],
                        y: [50, -50, 50],
                        scale: [1.2, 1, 1.2]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-1/2 -right-1/4 w-[70vw] h-[70vw] bg-green-400/20 rounded-full blur-[120px] mix-blend-multiply"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-300/20 rounded-full blur-[100px] mix-blend-multiply"
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Ashoka Chakra Rotating softly in background of text */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-5 pointer-events-none"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-blue-800">
                        <circle cx="12" cy="12" r="10" strokeWidth="0.5" />
                        <path d="M12 2L12 22" strokeWidth="0.5" />
                        <path d="M2 12L22 12" strokeWidth="0.5" />
                        <path d="M4.93 4.93L19.07 19.07" strokeWidth="0.5" />
                        <path d="M19.07 4.93L4.93 19.07" strokeWidth="0.5" />
                    </svg>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="relative"
                >
                    <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter text-center">
                        <span className="bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] bg-clip-text text-transparent">
                            SalesDost
                        </span>
                    </h1>

                    {/* Tagline */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="mt-4 text-slate-500 font-medium tracking-widest uppercase text-xs sm:text-sm text-center"
                    >
                        Empowering India's Sales Force
                    </motion.p>
                </motion.div>
            </div>

            {/* Loading Bar */}
            <motion.div
                className="absolute bottom-10 left-0 right-0 max-w-xs mx-auto h-1 bg-slate-100 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 via-blue-600 to-green-600"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 8, ease: "linear" }}
                />
            </motion.div>

        </div>
    );
}
