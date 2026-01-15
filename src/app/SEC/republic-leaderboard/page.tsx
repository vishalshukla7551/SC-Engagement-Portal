'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Star,
    Award,
    Crown,
    ChevronRight,
    TrendingUp,
    RefreshCcw,
    Lock,
    Medal,
    Trophy,
    Menu
} from 'lucide-react';
import FestiveFooter from '@/components/FestiveFooter';
import { useRouter } from 'next/navigation';

// Rank Configuration
const RANKS = [
    { id: 'cadet', title: 'Cadet', color: 'from-stone-400 to-stone-600', icon: Shield, min: '₹0' },
    { id: 'lieutenant', title: 'Lieutenant', color: 'from-emerald-400 to-emerald-600', icon: Star, min: '₹50k' },
    { id: 'captain', title: 'Captain', color: 'from-blue-400 to-blue-600', icon: Award, min: '₹1L' },
    { id: 'major', title: 'Major', color: 'from-indigo-400 to-indigo-600', icon: Award, min: '₹2L' },
    { id: 'colonel', title: 'Colonel', color: 'from-purple-400 to-purple-600', icon: Award, min: '₹4L' },
    { id: 'brigadier', title: 'Brigadier', color: 'from-orange-400 to-orange-600', icon: Star, min: '₹6L' },
    { id: 'general', title: 'General', color: 'from-red-500 to-rose-700', icon: Crown, min: '₹10L' },
];

const IndianFlag = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={(size * 2) / 3} viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-sm rounded-[1px]">
        <rect width="30" height="20" fill="white" />
        <rect width="30" height="6.66" fill="#FF9933" />
        <rect y="13.33" width="30" height="6.67" fill="#138808" />
        <circle cx="15" cy="10" r="3" stroke="#000080" strokeWidth="1" />
        <path d="M15 10L15 7M15 10L15 13M15 10L18 10M15 10L12 10M15 10L17.12 7.88M15 10L12.88 12.12M15 10L17.12 12.12M15 10L12.88 7.88" stroke="#000080" strokeWidth="0.5" />
    </svg>
);

export default function RepublicLeaderboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [selectedRank, setSelectedRank] = useState('cadet'); // Default to lowest or user's rank? We'll set to user's rank on load
    const [refreshing, setRefreshing] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        try {
            setRefreshing(true);
            const res = await fetch('/api/sec/republic-day-leaderboard');
            const json = await res.json();

            if (json.success) {
                setData(json);
                // If first load, set selected rank to user's current rank
                if (loading && json.currentUser?.rankId) {
                    setSelectedRank(json.currentUser.rankId);
                }
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Optional: Auto-refresh every 30s
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const getRankConfig = (id: string) => RANKS.find(r => r.id === id) || RANKS[0];

    const currentLeaderboard = data?.leaderboards?.[selectedRank] || [];
    const user = data?.currentUser;

    // Rank Color Helper
    const getRankColor = (rankId: string) => {
        const config = getRankConfig(rankId);
        return config.color;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans mb-16">
            {/* Custom Republic Day Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <ChevronRight className="rotate-180" size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <IndianFlag size={28} />
                        <span className="font-black tracking-tight text-lg bg-gradient-to-r from-orange-500 via-blue-600 to-green-600 bg-clip-text text-transparent">SalesDost</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
                        <Menu size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 pb-24">
                {/* Hero Section */}
                {/* Hero Section - White Background + Tri-color Animation */}
                <div className="bg-white pt-6 pb-12 px-4 rounded-b-[2.5rem] relative overflow-hidden shadow-xl border-b border-slate-100">

                    {/* Animated Tricolor Mesh Background */}
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                        <motion.div
                            animate={{ x: [-50, 50, -50], y: [-20, 20, -20] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-32 -left-32 w-96 h-96 bg-orange-400 rounded-full blur-[100px] mix-blend-multiply"
                        />
                        <motion.div
                            animate={{ x: [50, -50, 50], y: [20, -20, 20] }}
                            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-[100px] mix-blend-multiply"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full blur-[80px] mix-blend-multiply"
                        />
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm mb-3"
                        >
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Live Rankings</span>
                        </motion.div>

                        <h1 className="text-3xl font-black text-slate-900 mb-1">
                            Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-blue-600 to-green-600">Fame</span>
                        </h1>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">
                            Compete with the best. Rise through the ranks.
                        </p>

                        {/* User Quick Stats (if loaded) */}
                        {!loading && user && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="mt-6 w-full max-w-sm bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-lg ring-1 ring-black/5 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRankColor(user.rankId)} flex items-center justify-center shadow-md`}>
                                        <Crown size={24} className="text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Your Rank</p>
                                        <p className="text-lg font-black text-slate-800 leading-none mt-1">{user.rankTitle}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-800">#{user.positionInRank}</p>
                                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Global</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Rank Navigation Tabs */}
                <div className="sticky top-[60px] z-30 bg-slate-50/95 backdrop-blur-sm py-4 border-b border-slate-200 shadow-sm transition-all">
                    <div className="flex overflow-x-auto px-4 gap-3 hide-scrollbar snap-x">
                        {RANKS.map((rank) => {
                            const isActive = selectedRank === rank.id;
                            const Icon = rank.icon;
                            return (
                                <button
                                    key={rank.id}
                                    onClick={() => setSelectedRank(rank.id)}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 snap-center
                    ${isActive
                                            ? `bg-gradient-to-r ${rank.color} text-white shadow-md scale-105`
                                            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}
                  `}
                                >
                                    <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                                    <span className="text-xs font-bold">{rank.title}</span>
                                    {isActive && <span className="ml-1 text-[10px] opacity-80 bg-black/20 px-1.5 rounded-full">{rank.min}+</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Leaderboard Content */}
                <div className="px-4 py-6 max-w-2xl mx-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 text-sm font-medium">Loading contents...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedRank}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {/* Header for Selected Rank */}
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${getRankColor(selectedRank)}`}></span>
                                        Top Performers
                                    </h3>
                                    <button
                                        onClick={fetchData}
                                        disabled={refreshing}
                                        className={`p-2 rounded-full hover:bg-slate-200 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                                    >
                                        <RefreshCcw size={14} className="text-slate-400" />
                                    </button>
                                </div>

                                {/* Empty State */}
                                {currentLeaderboard.length === 0 && (
                                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Lock className="text-slate-300" size={32} />
                                        </div>
                                        <p className="text-slate-800 font-semibold">No Champions Yet</p>
                                        <p className="text-slate-500 text-xs mt-1">Be the first to reach {getRankConfig(selectedRank).title}!</p>
                                    </div>
                                )}

                                {/* Top 3 Cards */}
                                {currentLeaderboard.map((player: any, index: number) => {
                                    const isFirst = index === 0;
                                    // const MedalIcon = index === 0 ? Trophy : index === 1 ? Medal : Medal;

                                    return (
                                        <motion.div
                                            key={player.secId}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`
                        relative overflow-hidden rounded-2xl p-4 flex items-center gap-4
                        ${isFirst ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-amber-100' : 'bg-white border border-slate-100 shadow-sm'}
                      `}
                                        >
                                            {/* Rank Number / Medal */}
                                            <div className={`
                        w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-lg
                        ${index === 0 ? 'bg-amber-100 text-amber-600' :
                                                    index === 1 ? 'bg-slate-100 text-slate-500' :
                                                        'bg-orange-50 text-orange-600'}
                      `}>
                                                {index + 1}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-slate-800 truncate text-sm sm:text-base">
                                                        {player.name || 'Unknown Warrior'}
                                                    </h4>
                                                    {isFirst && <Crown size={14} className="text-amber-500 fill-amber-500" />}
                                                </div>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    {player.city || 'India'}
                                                </p>
                                            </div>

                                            {/* Sales Stats */}
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400 font-medium">Total Sales</p>
                                                <p className={`font-black text-base sm:text-lg ${index === 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                                                    ₹{player.salesAmount?.toLocaleString('en-IN')}
                                                </p>
                                            </div>

                                            {/* Decorative Gradient for 1st Place */}
                                            {isFirst && (
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/50 to-transparent -mr-8 -mt-8 rounded-full pointer-events-none" />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </main>

            {/* Fixed Bottom User Stats Card */}
            {!loading && user && (
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 pb-6 z-40">
                    <div className="max-w-2xl mx-auto">
                        {/* Next Rank Progress */}
                        {user.nextRank ? (
                            <div className="mb-3">
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                                    <span>Current: ₹{user.salesAmount.toLocaleString('en-IN')}</span>
                                    <span className="text-blue-600">Goal: ₹{user.nextRank.targetSales.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (user.salesAmount / user.nextRank.targetSales) * 100)}%` }}
                                        className="h-full bg-gradient-to-r from-orange-500 via-white to-green-500 relative"
                                    >
                                        {/* Shimmer */}
                                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                                    </motion.div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 text-center">
                                    Only <span className="text-slate-800 font-bold">₹{user.nextRank.remaining.toLocaleString('en-IN')}</span> more to reach {user.nextRank.title}
                                </p>
                            </div>
                        ) : (
                            <div className="mb-3 text-center">
                                <p className="text-sm font-bold text-green-600">Legendary Status Achieved! 🇮🇳</p>
                            </div>
                        )}

                        <button
                            onClick={() => router.push('/SEC/home')}
                            className="w-full bg-[#000080] text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                        >
                            Back to Dashboard <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Styles for scrollbar hiding */}
            <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
}
