'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, UserCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import ValentineFooter from '@/components/ValentineFooter';

// Reuse the Ranks configuration
const RANKS = [
    {
        id: 6,
        name: 'ProtectMax Titan',
        threshold: 999,
        emoji: '👑',
        color: 'from-rose-600 to-red-900',
        textColor: 'text-rose-100'
    },
    {
        id: 5,
        name: 'Diamond',
        threshold: 90,
        emoji: '💎',
        color: 'from-cyan-500 to-blue-700',
        textColor: 'text-cyan-50'
    },
    {
        id: 4,
        name: 'Platinum',
        threshold: 70,
        emoji: '💠',
        color: 'from-zinc-400 to-slate-600',
        textColor: 'text-zinc-50'
    },
    {
        id: 3,
        name: 'Gold',
        threshold: 50,
        emoji: '⚜️',
        color: 'from-amber-400 to-yellow-600',
        textColor: 'text-amber-50'
    },
    {
        id: 2,
        name: 'Silver',
        threshold: 35,
        emoji: '⚔️',
        color: 'from-slate-400 to-gray-500',
        textColor: 'text-slate-50'
    },
    {
        id: 1,
        name: 'Bronze',
        threshold: 20,
        emoji: '🛡️',
        color: 'from-orange-700 to-amber-900',
        textColor: 'text-orange-100'
    },
    {
        id: 0,
        name: 'Entry Level',
        threshold: 1,
        emoji: '🌱',
        color: 'from-green-600 to-emerald-800',
        textColor: 'text-green-100'
    }
];

interface RomanceMeritBoardProps {
    showFooter?: boolean;
}

export default function RomanceMeritBoard({ showFooter = true }: RomanceMeritBoardProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [currentUserPhone, setCurrentUserPhone] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const currentUserRef = useRef<HTMLDivElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hasScrolledToUser = useRef(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Get logged-in user's phone from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const raw = window.localStorage.getItem('authUser');
                if (raw) {
                    const auth = JSON.parse(raw);
                    const phone = auth?.phone || '';
                    setCurrentUserPhone(phone);
                    console.log('Current user phone:', phone);
                }
            } catch (e) {
                console.error('Error loading user phone:', e);
            }
        }
    }, []);

    // Fetch real leaderboard data from API
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/sec/customer-love-index');
                if (res.ok) {
                    const data = await res.json();
                    console.log('Leaderboard data:', data.leaderboard);
                    setUsers(data.leaderboard || []);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();

        // Refresh every 30 seconds
        const interval = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to current user's position when users are loaded
    useEffect(() => {
        if (users.length > 0 && currentUserRef.current && !hasScrolledToUser.current) {
            // Mark as scrolled to prevent repeated scrolls on data updates
            hasScrolledToUser.current = true;

            // Delay to ensure DOM is fully rendered
            setTimeout(() => {
                currentUserRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }, 800);
        }
    }, [users]);

    // Helper to get users for a specific rank
    const getUsersForRank = (rankThreshold: number, nextRankThreshold?: number) => {
        return users.filter(user =>
            user.hearts >= rankThreshold &&
            (nextRankThreshold === undefined || user.hearts < nextRankThreshold)
        );
    };

    const router = useRouter();

    // Trigger Confetti on Load
    useEffect(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // multiple origins to spread out the confetti
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    // Page Visibility API - Pause audio when tab goes to background
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (audioRef.current) {
                if (document.hidden) {
                    // Tab is hidden/in background - pause audio
                    audioRef.current.pause();
                } else {
                    // Tab is visible again - resume audio if user has interacted
                    if (hasInteracted) {
                        audioRef.current.play().catch(e => console.log("Audio resume failed:", e));
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [hasInteracted]);

    // Handle page click to play audio
    const handlePageClick = () => {
        if (audioRef.current) {
            // Set volume if not already set
            if (!hasInteracted) {
                audioRef.current.volume = 0.3;
                setHasInteracted(true);
            }

            // Play audio if it's paused
            if (audioRef.current.paused) {
                audioRef.current.play().catch(e => {
                    console.log("Audio play failed:", e);
                    console.log("Audio element:", audioRef.current);
                });
            }
        } else {
            console.log("Audio ref not available");
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-red-100 flex flex-col items-center py-10 overflow-hidden relative font-sans text-slate-900"
            onClick={handlePageClick}
        >

            {/* Original Falling Hearts Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={`falling-${i}`}
                        className="absolute text-rose-500/20 text-6xl"
                        initial={{
                            top: -100,
                            left: Math.random() * 100 + "%",
                            rotate: Math.random() * 360
                        }}
                        animate={{
                            top: "120vh",
                            rotate: Math.random() * 360
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 10
                        }}
                    >
                        ❤️
                    </motion.div>
                ))}
            </div>

            {/* Floating Hearts Background Animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-rose-200/40 text-4xl"
                        initial={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            scale: 0.5,
                            rotate: Math.random() * 360
                        }}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, Math.random() * 50 - 25, 0],
                            rotate: [0, 10, -10, 0],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 10 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        {['❤️', '💖', '💕', '💗'][Math.floor(Math.random() * 4)]}
                    </motion.div>
                ))}
            </div>

            {/* Back Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.back()}
                className="absolute top-4 left-4 z-50 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-rose-500 border border-rose-100 transition-all hover:bg-rose-50"
            >
                <ChevronLeft size={24} />
            </motion.button>

            {/* Logo/Icon Container */}
            <div className="relative mb-2 mt-4 z-10">
                <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                >
                    <span className="text-6xl filter drop-shadow-lg">🏆</span>
                </motion.div>
            </div>

            {/* Header */}
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 drop-shadow-sm mb-8 text-center z-10"
            >
                Customer Love
                <span className="block text-2xl md:text-3xl mt-2 text-rose-400 font-medium tracking-normal">Index</span>
            </motion.h1>

            {/* Leaderboard Stack */}
            <div className="w-full max-w-2xl px-4 flex flex-col gap-6 z-10 pb-20">
                {RANKS.map((rank, index) => {
                    const nextRank = index > 0 ? RANKS[index - 1] : undefined;
                    const rankUsers = getUsersForRank(rank.threshold, nextRank?.threshold);

                    // Skip ranks with no users if you want cleaner look, currently showing all
                    // if (rankUsers.length === 0) return null;

                    return (
                        <motion.div
                            key={rank.id}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative rounded-3xl border-2 border-white/40 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 backdrop-blur-sm ${index === 0 ? 'ring-2 ring-yellow-400/50 shadow-yellow-500/20' : ''}`}
                        >
                            {/* Rank Header Background */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${rank.color} opacity-90 z-0`} />

                            {/* Shimmer Effect for Top Rank */}
                            {index === 0 && (
                                <motion.div
                                    className="absolute inset-0 z-0 pointer-events-none"
                                    style={{
                                        background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                                        skewX: -20,
                                    }}
                                    animate={{ left: ["-100%", "200%"] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "linear" }}
                                />
                            )}

                            {/* Content */}
                            <div className="relative z-10 p-4 flex flex-col md:flex-row items-center gap-4">
                                {/* Rank Icon & Name */}
                                <div className="flex flex-col items-center md:items-start min-w-[120px] text-center md:text-left">
                                    <motion.span
                                        className="text-4xl mb-1 filter drop-shadow-md"
                                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                                    >
                                        {rank.emoji}
                                    </motion.span>
                                    <h2 className={`font-black text-base md:text-lg uppercase tracking-widest ${rank.textColor} drop-shadow-md`}>
                                        {rank.name}
                                    </h2>
                                    {rank.threshold !== 999 && (
                                        <span className="text-xs text-white/80 font-medium tracking-wide">
                                            Min {rank.threshold} {rank.threshold === 1 ? 'Heart' : 'Hearts'}
                                        </span>
                                    )}
                                </div>

                                {/* Users List (Full Expansion) */}
                                <div className="flex-1 w-full flex flex-col gap-0 bg-black/20 rounded-xl overflow-hidden border border-white/10">
                                    {/* Table Header (Optional, mostly for spacing) */}
                                    {rankUsers.length > 0 && (
                                        <div className="flex items-center px-4 py-2 bg-black/10 text-[10px] text-white/50 uppercase tracking-widest font-bold border-b border-white/5 sticky top-0 backdrop-blur-md z-10">
                                            <div className="w-8 text-center">#</div>
                                            <div className="flex-1 pl-2">Details</div>
                                            <div className="w-16 text-right">Hearts</div>
                                        </div>
                                    )}

                                    {rankUsers.length > 0 ? (
                                        rankUsers.map((user, i) => {
                                            // Check if this is the current logged-in user
                                            const isCurrentUser = user.phone === currentUserPhone;

                                            return (
                                                <motion.div
                                                    key={user.id}
                                                    ref={isCurrentUser ? currentUserRef : null}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                                    className={`relative flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 transition-colors group ${isCurrentUser
                                                        ? 'bg-gradient-to-r from-yellow-500/30 via-amber-500/20 to-yellow-500/30 border-2 !border-yellow-400/60 shadow-[0_0_20px_rgba(251,191,36,0.4)] animate-pulse-slow'
                                                        : 'hover:bg-white/5'
                                                        }`}
                                                >
                                                    {/* "You Are Here" Badge for Current User */}
                                                    {isCurrentUser && (
                                                        <motion.div
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
                                                            className="absolute -left-2 top-1/2 -translate-y-1/2 z-20"
                                                        >
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-yellow-400 blur-md opacity-60 animate-pulse"></div>
                                                                <div className="relative bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white/50 whitespace-nowrap uppercase tracking-wider">
                                                                    👉 You
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                                        {/* Rank # */}
                                                        <span className="font-mono text-xs w-8 text-center font-bold flex-shrink-0">
                                                            {i === 0 ? (
                                                                <span className="text-lg filter drop-shadow-[0_0_8px_rgba(255,20,147,0.8)] animate-pulse">🥇</span>
                                                            ) : i === 1 ? (
                                                                <span className="text-lg filter drop-shadow-md opacity-90">🥈</span>
                                                            ) : i === 2 ? (
                                                                <span className="text-lg opacity-80">🥉</span>
                                                            ) : (
                                                                <span className="text-white/60">#{i + 1}</span>
                                                            )}
                                                        </span>

                                                        {/* Avatar & Name */}
                                                        <div className="flex flex-col min-w-0">
                                                            <span className={`font-bold text-sm md:text-base tracking-wide flex items-center flex-wrap gap-x-2 transition-colors ${isCurrentUser ? 'text-yellow-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-white group-hover:text-rose-200'
                                                                }`}>
                                                                {user.name}
                                                                {isCurrentUser && <span className="text-xs">✨</span>}
                                                            </span>
                                                            <span className="text-[10px] text-white/60 flex items-start gap-1 mt-0.5">
                                                                <span className="opacity-50 shrink-0 mt-0.5">📍</span>
                                                                <span className="leading-tight">
                                                                    {user.store}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Hearts Score */}
                                                    <div className={`flex items-center gap-1.5 font-mono text-xs md:text-sm px-3 py-1 rounded-full border ml-2 flex-shrink-0 transition-colors ${isCurrentUser
                                                        ? 'bg-yellow-500/30 border-yellow-400/60 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                                                        : 'bg-white/10 border-white/5 group-hover:bg-white/20'
                                                        }`}>
                                                        <span className={`font-bold ${isCurrentUser ? 'text-yellow-100' : 'text-white'}`}>{user.hearts}</span>
                                                        <span className="text-[10px] text-rose-200">❤️</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-white/40 italic text-sm py-8 flex flex-col items-center gap-2">
                                            <span className="text-2xl opacity-50">💨</span>
                                            <span>No SECs here yet...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            {showFooter && <ValentineFooter />}

            {/* Background Audio Track */}
            <audio
                ref={audioRef}
                loop
                src="/audio track/goosebumps-music.mp3"
                onError={(e) => console.error("Audio loading error:", e)}
                onLoadedData={() => console.log("Audio loaded successfully")}
            />
        </div>
    );
}
