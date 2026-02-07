'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, UserCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import ValentineFooter from '@/components/ValentineFooter';

// Reuse the Ranks configuration
const RANKS = [
    {
        id: 7,
        name: 'ProtectMax Titan',
        threshold: 36,
        emoji: '👑',
        color: 'from-red-600 to-rose-900',
        textColor: 'text-rose-100'
    },
    {
        id: 6,
        name: 'Supreme',
        threshold: 31,
        emoji: '🌟',
        color: 'from-orange-500 to-amber-600',
        textColor: 'text-amber-100'
    },
    {
        id: 5,
        name: 'Diamond',
        threshold: 26,
        emoji: '💓',
        color: 'from-rose-500 to-red-600',
        textColor: 'text-red-100'
    },
    {
        id: 4,
        name: 'Platinum',
        threshold: 21,
        emoji: '🏹',
        color: 'from-pink-500 to-rose-600',
        textColor: 'text-pink-100'
    },
    {
        id: 3,
        name: 'Gold',
        threshold: 16,
        emoji: '💌',
        color: 'from-purple-500 to-violet-600',
        textColor: 'text-purple-100'
    },
    {
        id: 2,
        name: 'Silver',
        threshold: 1,
        emoji: '🎸',
        color: 'from-blue-500 to-indigo-600',
        textColor: 'text-blue-100'
    },
    {
        id: 1,
        name: 'Bronze',
        threshold: 0,
        emoji: '🌹',
        color: 'from-slate-500 to-slate-700',
        textColor: 'text-slate-100'
    }
];

// Mock User Data
const MOCK_USERS = [
    // ProtectMax Titan (36+)
    { id: 101, name: "Rahul S.", hearts: 42, avatar: "👨‍✈️", store: "Delhi Central" },
    { id: 109, name: "Karan J.", hearts: 45, avatar: "🎥", store: "Mumbai West" },
    { id: 112, name: "Aditya R.", hearts: 39, avatar: "🦸‍♂️", store: "Bangalore North" },

    // Supreme (31-35)
    { id: 103, name: "Amit K.", hearts: 33, avatar: "🦸‍♂️", store: "Pune City" },
    { id: 110, name: "Simran", hearts: 35, avatar: "👰", store: "Chandigarh Hub" },
    { id: 113, name: "Pooja H.", hearts: 32, avatar: "💃", store: "Jaipur Main" },

    // Diamond (26-30)
    { id: 104, name: "Sneha G.", hearts: 29, avatar: "🧚‍♀️", store: "Kolkata South" },
    { id: 111, name: "Raj M.", hearts: 28, avatar: "🤵", store: "Hydrebad Tech" },
    { id: 114, name: "Vikas D.", hearts: 27, avatar: "🕴️", store: "Noida Sec 18" },

    // Platinum (21-25)
    { id: 105, name: "Vikram R.", hearts: 24, avatar: "🕵️‍♂️", store: "Gurgaon Cyber" },
    { id: 115, name: "Tina T.", hearts: 22, avatar: "🧘‍♀️", store: "Chennal OMR" },
    { id: 116, name: "Kabir S.", hearts: 25, avatar: "🏍️", store: "Delhi South" },

    // Gold (16-20)
    { id: 106, name: "Anjali P.", hearts: 19, avatar: "👩‍🎤", store: "Mumbai South" },
    { id: 117, name: "Geet K.", hearts: 17, avatar: "🚆", store: "Bhatinda" },
    { id: 118, name: "Bunny", hearts: 18, avatar: "🎒", store: "Manali" },

    // Silver (1-15)
    { id: 102, name: "Priya M.", hearts: 14, avatar: "👩‍💼", store: "Lucknow" },
    { id: 107, name: "Rohit V.", hearts: 12, avatar: "👷", store: "Patna" },
    { id: 108, name: "Neha S.", hearts: 5, avatar: "👩‍🎨", store: "Indore" },
    { id: 119, name: "Sid M.", hearts: 9, avatar: "📷", store: "Goa" },
    { id: 120, name: "Aisha", hearts: 8, avatar: "✍️", store: "Mumbai Bandra" },

    // Bronze (0)
    { id: 121, name: "Rohan", hearts: 0, avatar: "👶", store: "Mumbai Dadar" },
    { id: 122, name: "Shanaya", hearts: 0, avatar: "👗", store: "Dehradun" }
];

export default function RomanceMeritBoard() {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        // Initial Load - Force reset with new data
        const timeout = setTimeout(() => {
            const sorted = [...MOCK_USERS].sort((a, b) => b.hearts - a.hearts);
            console.log("Loading users:", sorted); // Debug log
            setUsers(sorted);
        }, 500);

        // Simulation: Every 3 seconds, pick a random user and give them +5 hearts
        const interval = setInterval(() => {
            setUsers(prevUsers => {
                const newUsers = [...prevUsers];
                const randomIndex = Math.floor(Math.random() * newUsers.length);
                const user = { ...newUsers[randomIndex] };
                user.hearts += 5; // boost score
                newUsers[randomIndex] = user;
                return newUsers.sort((a, b) => b.hearts - a.hearts); // Re-sort
            });
        }, 3000);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, []);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100 flex flex-col items-center py-10 overflow-hidden relative font-sans text-slate-900">

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
                                    <span className="text-xs text-white/80 font-medium tracking-wide">Min {rank.threshold} Hearts</span>
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
                                        rankUsers.map((user, i) => (
                                            <motion.div
                                                key={user.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                                className={`flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group`}
                                            >
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
                                                        <span className="font-bold text-sm md:text-base tracking-wide flex items-center gap-2 text-white truncate group-hover:text-rose-200 transition-colors">
                                                            {user.name}
                                                        </span>
                                                        <span className="text-[10px] text-white/60 flex items-center gap-1 truncate">
                                                            <span className="opacity-50">📍</span> {user.store}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Hearts Score */}
                                                <div className="flex items-center gap-1.5 font-mono text-xs md:text-sm bg-white/10 px-3 py-1 rounded-full border border-white/5 ml-2 flex-shrink-0 group-hover:bg-white/20 transition-colors">
                                                    <span className="font-bold text-white">{user.hearts}</span>
                                                    <span className="text-[10px] text-rose-200">❤️</span>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center text-white/40 italic text-sm py-8 flex flex-col items-center gap-2">
                                            <span className="text-2xl opacity-50">💨</span>
                                            <span>No lovers here yet...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            <ValentineFooter />
        </div>
    );
}
