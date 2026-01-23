'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import Image from 'next/image';

// Pre-calculate Ashok Chakra spokes to avoid hydration mismatch
const ASHOK_CHAKRA_SPOKES = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    const x1 = 12 + 2 * Math.cos(angle);
    const y1 = 12 + 2 * Math.sin(angle);
    const x2 = 12 + 10 * Math.cos(angle);
    const y2 = 12 + 10 * Math.sin(angle);
    return `M${x1} ${y1}L${x2} ${y2}`;
});

export default function RepublicLanding() {
    const router = useRouter();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        // Only start redirect logic after user has clicked to start
        if (hasStarted) {
            const timer = setTimeout(() => {
                router.push('/login/sec');
            }, 8000); // 8 seconds to enjoy the animation

            return () => clearTimeout(timer);
        }
    }, [hasStarted, router]);

    const handlePageClick = () => {
        if (audioRef.current) {
            if (!hasStarted) {
                // First click - start everything
                setHasStarted(true);
                audioRef.current.play();
                setIsPlaying(true);
            } else {
                // Subsequent clicks - toggle play/pause
                if (isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                } else {
                    audioRef.current.play();
                    setIsPlaying(true);
                }
            }
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center overflow-hidden">
            {/* Audio Element */}
            <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                preload="auto"
            >
                <source src="/audio track/Sare_Jahan_Se_Acha_Full_Song_-_Piano_-_Instrumental_128k.mp3" type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>

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
                        {/* 24 spokes for authentic Ashok Chakra */}
                        {ASHOK_CHAKRA_SPOKES.map((d, i) => (
                            <path key={i} d={d} strokeWidth="0.5" />
                        ))}
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
                        className="mt-4 text-slate-500 font-medium tracking-widest uppercase text-xs sm:text-sm text-center flex items-center justify-center gap-2"
                    >
                        Powered By Zopper
                        <Image
                            src="/zopper-icon.png"
                            alt="Zopper Logo"
                            width={20}
                            height={20}
                            className="inline-block"
                        />
                    </motion.p>

                    {/* Click to Start Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="mt-32 flex justify-center"
                    >
                        <motion.button
                            onClick={handlePageClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-orange-500 via-blue-600 to-green-600 text-white px-8 py-3 rounded-full font-semibold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                        >
                            <motion.div
                                animate={{
                                    scale: isPlaying ? [1, 1.2, 1] : 1,
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: isPlaying ? Infinity : 0,
                                    ease: "easeInOut"
                                }}
                                className="w-4 h-4"
                            >
                                {isPlaying ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </motion.div>
                            <span>
                                {!hasStarted ? 'Click to Start' : (isPlaying ? 'Playing...' : 'Play Audio')}
                            </span>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Loading Bar - Only show when started */}
            {hasStarted && (
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
            )}

        </div>
    );
}
