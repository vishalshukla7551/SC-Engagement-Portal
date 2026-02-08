'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const FloatingHeart = ({ delay, duration, initialX, scale }: { delay: number; duration: number; initialX: number; scale: number }) => (
    <motion.div
        initial={{ y: "110vh", x: `${initialX}vw`, opacity: 0, scale: 0 }}
        animate={{
            y: "-10vh",
            opacity: [0, 1, 1, 0],
            scale: scale,
            x: `${initialX + (Math.random() * 10 - 5)}vw` // Slight horizontal wobble
        }}
        transition={{
            duration: duration,
            delay: delay,
            repeat: Infinity,
            ease: "linear"
        }}
        className="absolute text-pink-300/40 pointer-events-none"
    >
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8 md:w-16 md:h-16">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    </motion.div>
);

const ClickSparkle = ({ x, y }: { x: number; y: number }) => {
    return (
        <AnimatePresence>
            {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 200,
                        scale: [0, 1, 0],
                        opacity: 0
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute text-rose-500 pointer-events-none"
                    style={{ left: x, top: y }}
                >
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </motion.div>
            ))}
        </AnimatePresence>
    );
};

export default function ValentineLanding() {
    const router = useRouter();
    const [hasStarted, setHasStarted] = useState(false);
    const [hearts, setHearts] = useState<{ id: number; delay: number; duration: number; initialX: number; scale: number }[]>([]);
    const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [trailHearts, setTrailHearts] = useState<{ id: number; x: number; y: number }[]>([]);
    const audioRef = React.useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // Generate hearts only on client-side to prevent hydration mismatch
        setHearts(Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            delay: Math.random() * 5,
            duration: 10 + Math.random() * 10,
            initialX: Math.random() * 100,
            scale: 0.5 + Math.random() * 1
        })));
    }, []);

    useEffect(() => {
        if (hasStarted) {
            const timer = setTimeout(() => {
                router.push('/login/sec');
            }, 15000); // 15 seconds duration for redirect

            return () => clearTimeout(timer);
        }
    }, [hasStarted, router]);



    const handleClick = (e: React.MouseEvent) => {
        if (!hasStarted) {
            const newSparkle = { id: Date.now(), x: e.clientX, y: e.clientY };
            setSparkles(prev => [...prev, newSparkle]);
            setTimeout(() => {
                setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
            }, 1000);
        }
    };




    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });

        // Throttled trail creation
        if (Math.random() > 0.8) {
            const newTrailHeart = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY };
            setTrailHearts(prev => [...prev.slice(-20), newTrailHeart]);
            setTimeout(() => {
                setTrailHearts(prev => prev.filter(h => h.id !== newTrailHeart.id));
            }, 1000);
        }
    };

    const handleStart = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent duplicate sparkles on button click logic
        setHasStarted(true);
        if (audioRef.current) {
            audioRef.current.play().catch(err => console.error("Audio play failed", err));
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col items-center justify-center overflow-hidden cursor-none"
            onClick={handleClick}
            onMouseMove={handleMouseMove}
        >

            {/* Custom Cursor Heart */}
            <motion.div
                className="fixed pointer-events-none z-50 text-rose-500 hidden sm:block"
                animate={{ x: mousePosition.x - 12, y: mousePosition.y - 12 }}
                transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.1 }}
            >
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-lg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            </motion.div>

            {/* Mouse Trail */}
            <div className="fixed inset-0 pointer-events-none z-40">
                <AnimatePresence>
                    {trailHearts.map(heart => (
                        <motion.div
                            key={heart.id}
                            initial={{ x: heart.x, y: heart.y, opacity: 0.8, scale: 0.5 }}
                            animate={{ y: heart.y - 50, opacity: 0, scale: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute text-pink-400"
                        >
                            <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Click Sparkles */}
            {sparkles.map(sparkle => (
                <ClickSparkle key={sparkle.id} x={sparkle.x} y={sparkle.y} />
            ))}

            {/* Ambient Background Blobs */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{
                        x: [-50, 50, -50],
                        y: [-25, 25, -25],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-0 w-[70vw] h-[70vw] bg-pink-300/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        x: [50, -50, 50],
                        y: [25, -25, 25],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-0 right-0 w-[80vw] h-[80vw] bg-rose-300/20 rounded-full blur-[120px]"
                />
            </div>

            {/* Floating Hearts */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {hearts.map((heart) => (
                    <FloatingHeart
                        key={heart.id}
                        delay={heart.delay}
                        duration={heart.duration}
                        initialX={heart.initialX}
                        scale={heart.scale}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center pointer-events-none">

                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative text-center"
                >
                    <motion.h1
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter"
                    >
                        <span className="bg-gradient-to-r from-rose-500 via-pink-600 to-rose-500 bg-clip-text text-transparent bg-300% animate-gradient drop-shadow-sm">
                            SalesDost
                        </span>
                    </motion.h1>

                    {/* Tagline */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="mt-6 text-rose-800/60 font-medium tracking-widest uppercase text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                        Powered By Zopper
                        <Image
                            src="/zopper-icon.png"
                            alt="Zopper Logo"
                            width={20}
                            height={20}
                            className="inline-block opacity-80"
                        />
                    </motion.p>

                    {/* Start Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="mt-20 flex justify-center pointer-events-auto"
                    >
                        <motion.button
                            onClick={handleStart}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="group relative px-12 py-5 rounded-full font-bold text-white shadow-xl hover:shadow-2xl hover:shadow-rose-400/50 transition-all duration-300 overflow-hidden cursor-none"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-600 group-hover:scale-110 transition-transform duration-500"></div>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 to-transparent"></div>

                            <span className="relative z-10 flex items-center gap-3 text-lg">
                                {hasStarted ? 'Starting...' : 'Click to Start'}
                                <motion.span
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.5 }}
                                    className="text-2xl"
                                >
                                    ❤️
                                </motion.span>
                            </span>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
            {/* Loading Bar when started */}
            {hasStarted && (
                <motion.div
                    className="absolute bottom-10 left-0 right-0 max-w-xs mx-auto h-1.5 bg-rose-100 rounded-full overflow-hidden z-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-rose-400 to-pink-600"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 15, ease: "easeInOut" }}
                    />
                </motion.div>
            )}

            {/* Background Audio */}
            <audio ref={audioRef} src="/audio track/valentinfirstpage.mp3" />
        </div>
    );
}
