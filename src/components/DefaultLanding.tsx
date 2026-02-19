'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DefaultLanding() {
    const router = useRouter();
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (hasStarted) {
            const timer = setTimeout(() => {
                router.push('/login/sec');
            }, 1000); // Faster redirect for default theme
            return () => clearTimeout(timer);
        }
    }, [hasStarted, router]);

    const handleStart = () => {
        setHasStarted(true);
    };

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center overflow-hidden font-sans">
            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative text-center"
                >
                    <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter text-gray-900">
                        SalesDost
                    </h1>

                    {/* Tagline */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="mt-6 flex items-center justify-center gap-2 text-gray-500 font-medium tracking-widest uppercase text-xs sm:text-sm"
                    >
                        <span>Powered By</span>
                        <div className="flex items-center gap-1 font-bold text-gray-900">
                            <Image
                                src="/zopper-icon.png"
                                alt="Zopper Logo"
                                width={20}
                                height={20}
                                className="inline-block"
                            />
                            <span>Zopper</span>
                        </div>
                    </motion.div>

                    {/* Start Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="mt-16 flex justify-center"
                    >
                        <button
                            onClick={handleStart}
                            className="group relative px-10 py-4 rounded-xl font-bold text-white bg-blue-600 shadow-lg hover:shadow-blue-500/30 hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 active:scale-95"
                        >
                            <span className="flex items-center gap-2 text-lg">
                                {hasStarted ? 'Starting...' : 'Click to Start'}
                                <svg
                                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
