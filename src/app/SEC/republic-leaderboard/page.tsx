'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Star,
    Award,
    Crown,
    ChevronRight,
    RefreshCcw,
    Lock,
    User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import RepublicFooter from '@/components/RepublicFooter';

// Rank Configuration (Updated Titles matching Backend)
const RANKS = [
    { id: 'brigadier', title: 'Sales Chief Marshal', color: 'from-orange-500 to-orange-700', icon: Star, min: '₹1.5L' },
    { id: 'colonel', title: 'Sales Commander', color: 'from-purple-500 to-purple-700', icon: Award, min: '₹1.2L' },
    { id: 'major', title: 'Sales Major', color: 'from-indigo-500 to-indigo-700', icon: Award, min: '₹90k' },
    { id: 'captain', title: 'Sales Captain', color: 'from-blue-500 to-blue-700', icon: Award, min: '₹51k' },
    { id: 'lieutenant', title: 'Sales Lieutenant', color: 'from-emerald-500 to-emerald-700', icon: Star, min: '₹21k' },
    { id: 'cadet', title: 'Salesveer', color: 'from-stone-400 to-stone-600', icon: Shield, min: '₹0' },
];

const IndianFlag = ({ size = 24 }: { size?: number }) => (
    <div className="relative overflow-hidden rounded-[2px] shadow-sm border border-black/5 bg-white isolate" style={{ width: size, height: (size * 2) / 3 }}>
        <motion.div
            className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
        />
        <svg width="100%" height="100%" viewBox="0 0 45 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-0">
            <defs>
                <linearGradient id="saffron" x1="0" y1="0" x2="45" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF9933" />
                    <stop offset="0.5" stopColor="#FFB366" />
                    <stop offset="1" stopColor="#FF9933" />
                </linearGradient>
                <linearGradient id="green" x1="0" y1="0" x2="45" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#138808" />
                    <stop offset="0.5" stopColor="#33CC33" />
                    <stop offset="1" stopColor="#138808" />
                </linearGradient>
            </defs>
            <rect width="45" height="30" fill="white" />
            <rect width="45" height="10" fill="url(#saffron)" />
            <rect y="20" width="45" height="10" fill="url(#green)" />
            <g transform="translate(22.5, 15)">
                <circle r="4.5" stroke="#000080" strokeWidth="0.8" />
                <circle r="1" fill="#000080" />
                {[...Array(24)].map((_, i) => (
                    <line key={i} x1="0" y1="0" x2="0" y2="-4.5" transform={`rotate(${i * 15})`} stroke="#000080" strokeWidth="0.3" strokeLinecap="round" />
                ))}
            </g>
        </svg>
    </div>
);

const JetFlypast = () => {
    // Jets fly across periodically
    return (
        <div
            className="absolute top-20 left-0 w-full h-40 z-0 pointer-events-none overflow-hidden"
            style={{
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                transform: 'translate3d(0,0,0)'
            }}
        >
            <motion.div
                initial={{ x: '-20vw' }}
                animate={{ x: '120vw' }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "linear"
                }}
                className="relative w-full h-full transform-gpu"
            >
                {/* Formation of 3 Jets */}
                <div className="absolute top-0 left-0 flex flex-col gap-1 not-rotate">
                    {[
                        { color: '#FF9933', top: 0, delay: 0 },
                        { color: '#FFFFFF', top: 20, delay: 0.1 },
                        { color: '#138808', top: 40, delay: 0.2 }
                    ].map((jet, i) => (
                        <div key={i} className="flex items-center" style={{ marginLeft: i === 1 ? '20px' : '0px' }}>
                            {/* Smoke Trail */}
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 200, opacity: [0, 0.8, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ backgroundColor: jet.color, boxShadow: `0 0 10px ${jet.color}` }}
                                className="h-1 rounded-full mr-1"
                            />
                            {/* Jet Icon - Dark for light theme */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-slate-700 transform rotate-90">
                                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                            </svg>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

const BackgroundEffects = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Background Image */}
        <div className="absolute inset-0">
            <Image
                src="/images/bg.png"
                alt="Republic Day Background"
                fill
                className="object-cover opacity-90"
                priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/50" />
        </div>

        {/* Ambient Orbs */}
        <motion.div
            animate={{ x: [-100, 100, -100], y: [-50, 50, -50], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-[600px] bg-orange-500/30 rounded-full blur-[120px]"
        />
        <motion.div
            animate={{ x: [100, -100, 100], y: [50, -50, 50], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
            className="absolute bottom-0 right-0 w-full h-[600px] bg-green-600/30 rounded-full blur-[120px]"
        />
        <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[100px]"
        />

        <JetFlypast />
    </div>
);

export default function RepublicLeaderboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState<Record<string, any[]>>({});
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Refs for Rank Blocks
    const rankRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/sec/republic-day-leaderboard');
                const data = await res.json();
                if (data.success) {
                    setLeaderboardData(data.leaderboards);
                    setCurrentUser(data.currentUser);

                    // Auto-scroll to user's rank after a short delay
                    setTimeout(() => {
                        const userRankId = data.currentUser?.rankId;
                        if (userRankId && rankRefs.current[userRankId]) {
                            rankRefs.current[userRankId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 500);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 640);
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen h-auto relative flex flex-col font-sans mb-0 overflow-x-hidden bg-slate-50">
            <BackgroundEffects />

            {/* Header */}
            <div className="relative z-10 px-4 pt-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 flex items-center justify-center text-stone-600 active:scale-95 transition-transform z-50 relative"
                    >
                        <ChevronRight className="rotate-180 w-6 h-6" />
                    </button>

                    <div className="mx-auto absolute inset-x-0 top-6 flex justify-center pointer-events-none">
                        <div className="bg-white px-4 py-1.5 rounded-full border border-stone-200 shadow-sm flex items-center gap-2">
                            <IndianFlag size={16} />
                            <span className="text-[10px] font-bold text-orange-600 tracking-widest uppercase">Republic Day Special</span>
                            <IndianFlag size={16} />
                        </div>
                    </div>

                    <div className="w-10" /> {/* Spacer */}
                </div>

                <div className="text-center relative mb-6 mt-4 sm:mb-8 sm:mt-6">
                    {/* Tactical Brackets - Scale with screen size */}
                    <div className="absolute top-0 left-0 w-4 h-4 sm:w-8 sm:h-8 border-t-2 border-l-2 border-stone-300"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 sm:w-8 sm:h-8 border-t-2 border-r-2 border-stone-300"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 sm:w-8 sm:h-8 border-b-2 border-l-2 border-stone-300"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-8 sm:h-8 border-b-2 border-r-2 border-stone-300"></div>

                    <div className="py-6 border-x border-stone-100">
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight mb-2 uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            HALL OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-green-600">FAME</span>
                        </h1>
                        <p className="text-xs sm:text-sm font-bold text-stone-500 font-mono tracking-widest uppercase opacity-80">
                            {`>>`} ELITE SALES FORCE RANKINGS
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-1 pb-24 relative z-10 container mx-auto px-4 py-6 max-w-2xl">

                {/* Vertical Hierarchy Stack */}
                <div className="flex flex-col items-center">

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <RefreshCcw className="w-8 h-8 text-orange-500 animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">Loading Ranks...</p>
                        </div>
                    ) : (
                        RANKS.map((rank, rankIndex) => {
                            const players: any[] = leaderboardData[rank.id] || [];
                            const Icon = rank.icon;
                            const isLast = rankIndex === RANKS.length - 1;
                            const isEmpty = players.length === 0;

                            return (
                                <div
                                    key={rank.id}
                                    ref={el => { rankRefs.current[rank.id] = el }}
                                    className="w-full flex flex-col items-center relative transition-all duration-500"
                                >

                                    {/* Connector Line (Top) - except for first item */}
                                    {rankIndex !== 0 && (
                                        <div className="h-8 w-0.5 border-l-2 border-dashed border-slate-300 my-1"></div>
                                    )}

                                    {/* Rank Block */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: rankIndex * 0.1 }}
                                        className={`
                                            w-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative z-10
                                            ${currentUser?.rankId === rank.id ? 'ring-2 ring-orange-500 shadow-orange-100' : ''}
                                            ${isEmpty ? 'opacity-90 grayscale-[0.3]' : ''} 
                                        `}
                                    >
                                        {/* Rank Header */}
                                        <div className={`p-4 bg-gradient-to-r ${rank.color} text-white flex items-center justify-between relative overflow-hidden transition-all duration-500`}>
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                                                    <Icon size={20} className="text-white drop-shadow-sm" />
                                                </div>
                                                <div>
                                                    <h2 className="font-black text-lg uppercase tracking-wider font-poppins text-shadow-sm">{rank.title}</h2>
                                                    <p className="text-[10px] font-medium opacity-90 uppercase tracking-widest">{rank.min}+ Revenue</p>
                                                </div>
                                            </div>

                                            {/* Decorative Background Icon */}
                                            <Icon className="absolute -right-4 -bottom-4 text-white/10 w-24 h-24 rotate-12" />
                                        </div>

                                        {/* Salespersons List or Empty State */}
                                        <div className="p-2 space-y-2 bg-slate-50/50">
                                            {isEmpty ? (
                                                <div className="py-6 text-center text-slate-400 flex flex-col items-center gap-2">
                                                    <Lock size={20} className="opacity-50" />
                                                    <p className="text-xs font-medium italic">No officers at this rank yet.</p>
                                                    <p className="text-[10px] uppercase tracking-wide font-bold text-orange-500/80">Be the first!</p>
                                                </div>
                                            ) : (
                                                players.map((player, pIndex) => {
                                                    const isMe = currentUser && currentUser.secId === player.secId;
                                                    return (
                                                        <motion.div
                                                            key={player.secId || pIndex}
                                                            className={`
                                                                border p-3 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow
                                                                ${isMe
                                                                    ? 'bg-orange-50 border-orange-200 z-20 relative'
                                                                    : 'bg-white border-slate-100'}
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`
                                                                    w-8 h-8 rounded-full flex items-center justify-center border
                                                                    ${isMe ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-slate-100 text-slate-400 border-slate-200'}
                                                                `}>
                                                                    {isMe ? <Crown size={14} /> : <User size={14} />}
                                                                </div>
                                                                <div>
                                                                    <p className={`font-bold text-sm ${isMe ? 'text-orange-900' : 'text-slate-700'}`}>
                                                                        {player.name}
                                                                        {isMe && <span className="ml-2 text-[10px] bg-orange-200 text-orange-800 px-1 rounded">YOU</span>}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400 font-medium uppercase">{player.storeName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className={`font-bold text-sm ${isMe ? 'text-orange-700' : 'text-slate-800'}`}>₹{player.salesAmount.toLocaleString('en-IN')}</p>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Connector Line (Bottom) - To connect to next block */}
                                    {!isLast && (
                                        <div className="h-0" /> // Spacer handled by margin
                                    )}
                                </div>
                            );
                        })
                    )}

                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-400 text-xs italic">
                        Keep climbing the ranks. Your name belongs at the top!
                    </p>
                </div>

            </main>
            <RepublicFooter />
        </div>
    );
}
