'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Award,
    ChevronRight,
    Star,
    Flag,
    Shield,
    Lock,
    CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Rank Data Configuration
const RANKS = [
    { id: 'cadet', title: 'SALESVEER', minSales: 0, color: 'bg-stone-400', icon: Shield },
    { id: 'lieutenant', title: 'SALES LIEUTENANT', minSales: 21000, color: 'bg-emerald-500', icon: Star },
    { id: 'captain', title: 'SALES CAPTAIN', minSales: 51000, color: 'bg-blue-500', icon: Award },
    { id: 'major', title: 'SALES MAJOR', minSales: 90000, color: 'bg-indigo-600', icon: Award },
    { id: 'colonel', title: 'SALES COMMANDER', minSales: 120000, color: 'bg-purple-600', icon: Award },
    { id: 'brigadier', title: 'SALES CHIEF MARSHAL', minSales: 150000, color: 'bg-orange-500', icon: Star },
];

const IndianFlag = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={(size * 2) / 3} viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-sm rounded-[1px]">
        <rect width="30" height="20" fill="white" />
        <rect width="30" height="6.66" fill="#FF9933" />
        <rect y="13.33" width="30" height="6.67" fill="#138808" />
        <circle cx="15" cy="10" r="3" stroke="#000080" strokeWidth="1" />
        <path d="M15 10L15 7M15 10L15 13M15 10L18 10M15 10L12 10M15 10L17.12 7.88M15 10L12.88 12.12M15 10L17.12 12.12M15 10L12.88 7.88" stroke="#000080" strokeWidth="0.5" />
    </svg>
);

const FloatingKite = ({ delay, duration, startX, scale, color }: { delay: number, duration: number, startX: number, scale: number, color: string }) => (
    <motion.div
        initial={{ x: startX, y: '120vh', rotate: 10, opacity: 0 }}
        animate={{
            y: '-20vh',
            rotate: [10, -5, 10],
            x: startX + 100, // drift slightly
            opacity: [0, 0.8, 0.8, 0]
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: "linear"
        }}
        className={`absolute z-0 text-${color}`}
    >
        {/* Simple Kite SVG */}
        <svg width={50 * scale} height={60 * scale} viewBox="0 0 50 60" className="drop-shadow-sm" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))' }}>
            <path d="M25 0 L50 30 L25 60 L0 30 Z" fill="currentColor" />
            <path d="M25 0 L25 60" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <path d="M0 30 L50 30" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            {/* Tail */}
            <path d="M25 60 Q 35 80 25 100" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
        </svg>
    </motion.div>
);

const AmbientBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Saffron Orb - Moving Top Left - Increased visibility */}
        <motion.div
            animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-orange-500 rounded-full blur-[100px]"
        />

        {/* Green Orb - Moving Bottom Right - Increased visibility */}
        <motion.div
            animate={{
                x: [0, -50, 0],
                y: [0, -30, 0],
                scale: [1, 1.25, 1],
                opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-20 -right-20 w-[700px] h-[700px] bg-green-600 rounded-full blur-[120px]"
        />

        {/* White/Blue Center Glow - Increased visibility */}
        <motion.div
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.3, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-200 rounded-full blur-[150px]"
        />

        {/* Floating Kites Layer */}
        <FloatingKite delay={0} duration={15} startX={10} scale={1.2} color="orange-500" />
        <FloatingKite delay={5} duration={18} startX={200} scale={0.8} color="green-600" />
        <FloatingKite delay={2} duration={20} startX={-100} scale={1.5} color="orange-400" />
        <FloatingKite delay={8} duration={16} startX={300} scale={1.0} color="green-500" />
        <FloatingKite delay={12} duration={22} startX={50} scale={0.7} color="blue-400" />
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
                            {/* Jet Icon */}
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



export default function RepublicDayHeroPage() {
    const router = useRouter();

    const [currentSales, setCurrentSales] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await fetch('/api/sec/republic-hero');
                const data = await res.json();

                if (data.success) {
                    const userRealSales = data.data.totalSales;

                    // Animate count up
                    let start = 0;
                    const duration = 2000;
                    const stepTime = 20;
                    const steps = duration / stepTime;
                    const increment = userRealSales / steps;

                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= userRealSales) {
                            setCurrentSales(userRealSales);
                            clearInterval(timer);
                        } else {
                            setCurrentSales(Math.floor(start));
                        }
                    }, stepTime);
                }
            } catch (error) {
                console.error("Failed to fetch republic hero sales", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, []);

    // Determine Current Rank Index
    const currentRankIndex = RANKS.findLastIndex(rank => currentSales >= rank.minSales);
    const nextRank = RANKS[currentRankIndex + 1];

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        // Initialize audio
        const audioUrl = '/audio%20track/VANDEMATARAM%20%20Instrumental%20%20Indian%20National%20Song.mp3';
        const audio = new Audio(audioUrl);
        audio.loop = true;
        audio.volume = 0.5;
        audio.preload = 'auto'; // Important for mobile
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    // Robust handler for mobile interactions
    const handleGlobalInteraction = () => {
        if (hasInteracted || !audioRef.current || isPlaying) return;

        const p = audioRef.current.play();
        if (p !== undefined) {
            p.then(() => {
                setIsPlaying(true);
                setHasInteracted(true); // Stop trying once successful
            }).catch(e => {
                // Silently fail or just log
                console.log("Interaction play failed", e);
            });
        }
    };

    useEffect(() => {
        if (scrollContainerRef.current && itemsRef.current[currentRankIndex]) {
            const container = scrollContainerRef.current;
            const target = itemsRef.current[currentRankIndex];

            if (target) {
                const scrollLeft = target.offsetLeft - (container.clientWidth / 2) + (target.clientWidth / 2);
                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [currentRankIndex]);

    const handleContinue = () => {
        router.push('/SEC/home');
    };

    return (
        <div
            className="h-screen bg-slate-50 relative overflow-hidden font-sans"
            onClick={handleGlobalInteraction}
        >

            {/* SEPARATE ANIMATION LAYER */}
            {/* This container handles all background animations and jets to isolate repaints */}
            <div className="fixed inset-0 z-0 pointer-events-none transform-gpu" style={{ isolation: 'isolate' }}>
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

                <AmbientBackground />
                <JetFlypast />
            </div>

            {/* SEPARATE CONTENT LAYER */}
            {/* Main Content - Independent stacking context */}

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-4 py-2 flex flex-col h-screen max-w-5xl">

                {/* Header Section */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-6 gap-2 sm:gap-4 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1 bg-orange-50 w-fit px-3 py-1 rounded-full border border-orange-100">
                            <IndianFlag size={18} />
                            <span className="text-xs font-bold tracking-wider text-[#000080] uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>Republic Day Special</span>
                            <IndianFlag size={18} />
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.03em' }}>
                            Honour & Glory <span className="text-[#FF9933]">Path</span>
                        </h1>
                        <p className="text-slate-600 font-medium mt-0.5 text-xs sm:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Rise through the ranks: SALESVEER to SALES GENERAL
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-2 sm:p-3 rounded-2xl border border-white shadow-sm">
                        <div className="text-right">
                            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>Current Sales</p>
                            <motion.p
                                className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-orange-500 via-blue-700 to-green-600 bg-clip-text text-transparent bg-[length:200%_auto]"
                                style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}
                                animate={{
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                    y: [0, -2, 0]
                                }}
                                transition={{
                                    backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
                                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                }}
                            >
                                ₹{currentSales.toLocaleString('en-IN')}
                            </motion.p>
                        </div>
                        <div className="bg-orange-100 p-1.5 sm:p-2 rounded-full">
                            <Award className="text-orange-600" size={20} />
                        </div>
                    </div>
                </header>

                {/* Progression Path Visualization - Ladder Style */}
                <div className="flex-1 flex items-center justify-center relative w-full min-h-0 pt-6 sm:pt-20 pb-4">

                    {/* Scrollable Container */}
                    <div ref={scrollContainerRef} className="w-full overflow-x-auto overflow-y-visible pb-2 pt-28 sm:pt-40 hide-scrollbar">
                        <div className="flex items-end gap-2 md:gap-4 px-2 md:px-6 min-w-max mx-auto justify-center" style={{ paddingBottom: '40px' }}>
                            {RANKS.map((rank, index) => {
                                const isUnlocked = index <= currentRankIndex;
                                const isCurrent = index === currentRankIndex;
                                const isLocked = index > currentRankIndex;

                                // Calculate ladder height - each step goes higher (reduced for compact view)
                                const ladderHeight = index * 24; // 24px increment per level (was 40px)

                                return (
                                    <div
                                        key={rank.id}
                                        className="flex flex-col items-center group relative"
                                        ref={(el) => { itemsRef.current[index] = el; }}
                                        style={{
                                            marginBottom: `${ladderHeight}px`,
                                            transition: 'margin-bottom 0.5s ease-out'
                                        }}
                                    >

                                        {/* Diagonal Connector Line - Ladder Step */}
                                        {index > 0 && (
                                            <div
                                                className={`absolute z-0 transition-all duration-1000`}
                                                style={{
                                                    bottom: '50%',
                                                    right: '100%',
                                                    width: '40px',
                                                    height: '2px',
                                                    transformOrigin: 'right center',
                                                    transform: `rotate(-${Math.atan(24 / 40) * (180 / Math.PI)}deg) translateX(-12px)`,
                                                    background: isUnlocked
                                                        ? 'linear-gradient(90deg, #fb923c, #ffffff, #22c55e)'
                                                        : '#e2e8f0',
                                                    boxShadow: isUnlocked ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                                                    opacity: 0.8
                                                }}
                                            />
                                        )}

                                        {/* Soldier Avatar (Current Level) */}
                                        {isCurrent && (
                                            <motion.div
                                                initial={{ y: -100, opacity: 0, scale: 0.3, rotate: -20 }}
                                                animate={{
                                                    y: [0, -4, 0],
                                                    opacity: 1,
                                                    scale: 1,
                                                    rotate: 0
                                                }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 15,
                                                    y: {
                                                        repeat: Infinity,
                                                        duration: 3,
                                                        ease: "easeInOut"
                                                    }
                                                }}
                                                className="absolute -top-28 z-30 flex flex-col items-center"
                                            >
                                                {/* Avatar Image */}
                                                <motion.div
                                                    whileHover={{
                                                        scale: 1.1,
                                                        rotate: [0, -5, 5, 0],
                                                        transition: { duration: 0.5 }
                                                    }}
                                                    className="relative w-24 h-28 drop-shadow-2xl"
                                                >
                                                    {/* Blue Flicker Glow - Tightened & Sharpened */}
                                                    <motion.div
                                                        animate={{
                                                            opacity: [0.6, 0.9, 0.6],
                                                            scale: [1, 1.1, 1]
                                                        }}
                                                        transition={{
                                                            duration: 1.5,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500 rounded-full blur-[20px]"
                                                        style={{
                                                            boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)'
                                                        }}
                                                    />
                                                    <Image
                                                        src="/images/samsung-salesperson.png"
                                                        alt="Samsung Salesperson Avatar"
                                                        fill
                                                        className="object-contain relative z-10"
                                                        priority
                                                    />
                                                </motion.div>
                                            </motion.div>
                                        )}

                                        {/* Platform Step - Enhanced Attractive Design */}
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{
                                                scale: isCurrent ? 1.12 : 1,
                                                opacity: 1,
                                                y: isCurrent ? -8 : 0
                                            }}
                                            whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`
                                                relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-3xl flex flex-col items-center justify-center
                                                transition-all duration-500 cursor-pointer
                                                ${isUnlocked ? 'shadow-2xl' : 'grayscale opacity-60'}
                                                ${isCurrent ? 'ring-4 ring-orange-400 ring-offset-2' : ''}
                                            `}
                                            style={{
                                                background: isUnlocked
                                                    ? isCurrent
                                                        ? 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)'
                                                        : index % 3 === 0
                                                            ? 'linear-gradient(135deg, #FF9933, #FFB366)'
                                                            : index % 3 === 1
                                                                ? 'linear-gradient(135deg, #FFFFFF, #F0F0F0)'
                                                                : 'linear-gradient(135deg, #138808, #1AAA0A)'
                                                    : 'linear-gradient(135deg, #E5E7EB, #D1D5DB)',
                                                boxShadow: isUnlocked
                                                    ? isCurrent
                                                        ? '0 20px 40px -10px rgba(255, 153, 51, 0.4), 0 0 30px rgba(255, 153, 51, 0.3), inset 0 -4px 8px rgba(0,0,0,0.1)'
                                                        : '0 15px 35px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1), inset 0 -4px 6px -1px rgba(0,0,0,0.08)'
                                                    : 'none'
                                            }}
                                        >
                                            {/* Animated Glow Effect for Current Rank */}
                                            {isCurrent && (
                                                <motion.div
                                                    animate={{
                                                        opacity: [0.3, 0.6, 0.3],
                                                        scale: [1, 1.1, 1]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-400 via-yellow-300 to-green-400 blur-xl"
                                                    style={{ zIndex: -1 }}
                                                />
                                            )}

                                            {/* Decorative Shine Effect */}
                                            {isUnlocked && (
                                                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                                                    <motion.div
                                                        animate={{
                                                            x: ['-100%', '100%']
                                                        }}
                                                        transition={{
                                                            duration: 3,
                                                            repeat: Infinity,
                                                            repeatDelay: 2,
                                                            ease: "easeInOut"
                                                        }}
                                                        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                                        style={{ transform: 'skewX(-20deg)' }}
                                                    />
                                                </div>
                                            )}

                                            {/* Border with Tricolor Theme */}
                                            <div className="absolute inset-0 rounded-3xl border-2"
                                                style={{
                                                    borderColor: isUnlocked
                                                        ? isCurrent
                                                            ? '#FF9933'
                                                            : (index % 3 === 0 ? '#FF9933' : index % 3 === 1 ? '#FFFFFF' : '#138808')
                                                        : '#D1D5DB',
                                                    borderBottomWidth: '4px',
                                                    opacity: 0.9
                                                }}
                                            />

                                            {/* Rank Icon Badge - Medal Style with Animations */}
                                            <motion.div
                                                animate={isCurrent ? {
                                                    rotate: [0, -10, 10, -10, 10, 0],
                                                    scale: [1, 1.1, 1]
                                                } : {}}
                                                transition={isCurrent ? {
                                                    rotate: {
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        repeatDelay: 3,
                                                        ease: "easeInOut"
                                                    },
                                                    scale: {
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }
                                                } : {}}
                                                className={`
                                                    w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-1.5 z-10
                                                    ${isUnlocked ? `bg-gradient-to-tr ${rank.color} to-white` : 'bg-slate-200'}
                                                    relative shadow-lg border-2 border-white ring-2 ring-offset-0
                                                `}
                                                style={{ '--tw-ring-color': isUnlocked ? '#FFD700' : 'transparent' } as React.CSSProperties}
                                            >
                                                {/* Animated Golden Ring for Current */}
                                                {isCurrent && (
                                                    <motion.div
                                                        animate={{
                                                            scale: [1, 1.3, 1],
                                                            opacity: [0.5, 0.8, 0.5]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                        className="absolute inset-0 rounded-full border-2 border-yellow-400"
                                                        style={{ filter: 'blur(2px)' }}
                                                    />
                                                )}

                                                {/* Inner Circle for depth */}
                                                <div className={`absolute inset-1 rounded-full border border-white/30 ${isUnlocked ? rank.color : ''}`}></div>

                                                {/* Animated Icon */}
                                                <motion.div
                                                    animate={isCurrent ? {
                                                        scale: [1, 1.2, 1]
                                                    } : {}}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    {isLocked ? <Lock size={14} className="text-slate-500" /> : <rank.icon size={18} className="text-white drop-shadow-md" />}
                                                </motion.div>

                                                {/* Animated Success Check */}
                                                {isUnlocked && !isCurrent && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 500,
                                                            damping: 15,
                                                            delay: index * 0.15 + 0.3
                                                        }}
                                                        whileHover={{
                                                            scale: 1.3,
                                                            rotate: 360,
                                                            transition: { duration: 0.5 }
                                                        }}
                                                        className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white shadow-sm z-20"
                                                    >
                                                        <CheckCircle size={10} className="text-white" />
                                                    </motion.div>
                                                )}
                                            </motion.div>

                                            {/* Rank Title */}
                                            <p className={`
                                                text-xs md:text-sm font-extrabold text-center px-1 leading-tight z-10
                                                ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}
                                                uppercase tracking-tight
                                            `} style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
                                                {rank.title}
                                            </p>

                                            {/* Sales Milestone */}
                                            <div className={`
                                                mt-1 px-2 py-1 rounded-full text-[9px] md:text-[10px] font-bold z-10
                                                ${isUnlocked ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}
                                            `}>
                                                {rank.minSales === 0 ? 'Start' : `₹${rank.minSales.toLocaleString('en-IN')}+`}
                                            </div>
                                        </motion.div>

                                        {/* Floor Reflection/Shadow */}
                                        <div className={`
                        w-16 h-2 rounded-[100%] blur-sm mt-3 transition-colors duration-500
                        ${isCurrent ? 'bg-[#000080]/30' : 'bg-slate-200/50'}
                     `}></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer/Action Section - Enhanced Design */}
                <div className="mt-16 sm:mt-52 flex flex-col items-center pb-4 z-20 w-full shrink-0">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/95 backdrop-blur-2xl p-4 rounded-[1.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-white/50 max-w-[280px] w-full text-center relative overflow-visible ring-1 ring-slate-900/5 items-center mx-auto"
                    >
                        {/* Decorative Badge at Top Center */}
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 via-white to-green-600 p-[1px] rounded-full shadow-md">
                            <div className="bg-white px-3 py-0.5 rounded-full flex items-center gap-1.5">
                                <Star size={10} className="text-orange-500 fill-orange-500" />
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>Next Mission</span>
                                <Star size={10} className="text-green-600 fill-green-600" />
                            </div>
                        </div>

                        <div className="mt-1 mb-3">
                            <h3 className="text-lg font-black text-slate-800 mb-0.5" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>{nextRank ? nextRank.title : 'Mission Accomplished!'}</h3>
                            <div className="flex flex-col items-center justify-center gap-1.5">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>Target</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black bg-gradient-to-r from-orange-500 via-purple-600 to-green-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>
                                        ₹{nextRank?.minSales.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-px w-8 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                                    <span className={`text-sm font-bold ${(currentSales / (nextRank?.minSales || 1)) >= 0.5 ? 'text-green-600' : 'text-orange-500'}`} style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                                        {Math.min(100, Math.round((currentSales / (nextRank?.minSales || 1)) * 100))}% Done
                                    </span>
                                    <div className="h-px w-8 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                                </div>
                            </div>
                        </div>

                        {nextRank && (
                            <div className="w-full relative h-2 bg-slate-100 rounded-full mb-4 shadow-inner overflow-hidden ring-1 ring-slate-900/5">
                                {/* Tricolor Progress Bar */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (currentSales / nextRank.minSales) * 100)}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                    className="h-full relative overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                    }}
                                >
                                    {/* Shimmer Overlay */}
                                    <motion.div
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full"
                                    />
                                </motion.div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={() => router.push('/SEC/incentive-form')}
                                className="w-full py-2.5 bg-[#000080] text-white rounded-xl font-bold text-sm shadow-[0_10px_20px_-5px_rgba(0,0,128,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(0,0,128,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                                style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
                            >
                                <span className="relative z-10 uppercase">Submit Your Sales</span>
                                <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" strokeWidth={3} />

                                {/* Button Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[#000080] via-[#1a1a90] to-[#000080] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>

                            <button
                                onClick={() => router.push('/SEC/republic-leaderboard')}
                                className="w-full py-2.5 bg-white text-[#000080] border-2 border-[#000080] rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                                style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
                            >
                                <span className="relative z-10 uppercase">HALL OF FAME</span>
                                <Award size={18} className="relative z-10 group-hover:scale-110 transition-transform" strokeWidth={2} />
                            </button>
                        </div>
                    </motion.div>
                    <motion.div
                        className="mt-6 flex items-center gap-2 sm:gap-3 w-full justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <motion.div
                            className="h-[2px] w-4 sm:w-12 rounded-full bg-gradient-to-r from-transparent via-orange-400 to-orange-500"
                            animate={{ scaleX: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.p
                            className="text-[10px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase bg-gradient-to-r from-orange-600 via-[#000080] to-green-700 bg-clip-text text-transparent bg-[length:200%_auto] whitespace-nowrap"
                            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}
                            animate={{
                                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            Jai Hind • Republic Day 2026
                        </motion.p>
                        <motion.div
                            className="h-[2px] w-4 sm:w-12 rounded-full bg-gradient-to-l from-transparent via-green-400 to-green-500"
                            animate={{ scaleX: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.div>
                </div>

            </main>

            {/* Hide scrollbar styles */}
            <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
}
