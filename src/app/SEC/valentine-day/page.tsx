"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ValentineFooter from "@/components/ValentineFooter";
import Image from "next/image";
import {
    Heart,
    Gift,
    Flower2,
    CakeSlice,
    Sparkles,
    Mail,
    Music,
    Star,
    Camera,
    Crown,
    Gem,
    Trophy,
    PartyPopper
} from "lucide-react";

type Rank = {
    id: string;
    name: string;
    threshold: number;
    icon: string;
    label: string;
    description: string;
    cardSide: 'left' | 'right';
    top: number; // in pixels for easier calculations
    left: number; // in percentage (0 to 100)
    isCustomIcon?: boolean;
    iconSrc?: string;
};

const RANKS: Rank[] = [
    {
        id: 'titan',
        name: 'PROTECTMAX TITAN',
        threshold: 999999, // Manual decided only
        icon: '👑',
        label: 'PROTECTMAX TITAN',
        description: 'The Ultimate Winner',
        cardSide: 'left',
        top: 60,
        left: 30
    },
    {
        id: 'diamond',
        name: 'DIAMOND',
        threshold: 90,
        icon: '💎',
        label: 'DIAMOND',
        description: 'Unbreakable Faith',
        cardSide: 'left',
        top: 230,
        left: 60
    },
    {
        id: 'platinum',
        name: 'PLATINUM',
        threshold: 70,
        icon: '🛡️',
        label: 'PLATINUM',
        description: 'Pure Devotion',
        cardSide: 'right',
        top: 400,
        left: 45
    },
    {
        id: 'gold',
        name: 'GOLD',
        threshold: 50,
        icon: '⚜️',
        label: 'GOLD',
        description: 'Golden Trust',
        cardSide: 'left',
        top: 570,
        left: 55
    },
    {
        id: 'silver',
        name: 'SILVER',
        threshold: 35,
        icon: '⚔️',
        label: 'SILVER',
        description: 'Building Bonds',
        cardSide: 'right',
        top: 740,
        left: 45
    },
    {
        id: 'bronze',
        name: 'BRONZE',
        threshold: 20,
        icon: '🥉',
        isCustomIcon: true,
        label: 'BRONZE',
        description: 'The Beginning',
        cardSide: 'left',
        top: 910,
        left: 55
    },
    {
        id: 'entry',
        name: 'ENTRY LEVEL',
        threshold: 0,
        icon: '❤️',
        label: 'ENTRY LEVEL',
        description: 'Welcome to the Journey',
        cardSide: 'right',
        top: 1180,
        left: 73
    },
];

const MOTIVATION_MESSAGES: Record<string, string> = {
    entry: "Welcome to the Journey! You've taken your first step towards greatness. ❤️",
    bronze: "Bronze Reached! You're starting to shine. Keep pushing for Silver! 🥉",
    silver: "Silver Status! You're building solid bonds. Gold is just a few hearts away! ⚔️",
    gold: "Incredible! You've hit Gold. Your dedication is truly golden! ⚜️",
    platinum: "Platinum Achieved! Pure devotion in every step. Diamond is within your grasp! 🛡️",
    diamond: "Unbreakable! You're a Diamond now. Just one final push to become a TITAN! 💎",
    titan: "CONGRATULATIONS TITAN! You are the ultimate winner of the Customer Obsession journey! 👑"
};

export default function ValentineRoadmapPage() {
    const [hearts, setHearts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [boxOpened, setBoxOpened] = useState(false);
    const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
    const [lastAchievedRankId, setLastAchievedRankId] = useState<string | null>(null);

    // Trigger box opening animation sequence
    useEffect(() => {
        if (showModal) {
            setBoxOpened(false);
            const timer = setTimeout(() => {
                setBoxOpened(true);
            }, 1200); // Wait 1.2s before "opening"
            return () => clearTimeout(timer);
        }
    }, [showModal]);

    const cupidRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/user/valentine-submissions");
                if (res.ok) {
                    const data = await res.json();
                    const realHearts = data.totalHearts || 0;

                    // Start at 0 first to show Cupid at Entry Level
                    setHearts(0);
                    setLoading(false);

                    // Wait 1.5s so user sees the roadmap, then "travel" to real rank
                    setTimeout(() => {
                        setHearts(realHearts);
                    }, 1500);
                }
            } catch (error) {
                console.error("Failed to fetch hearts", error);
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Scroll to follow cupid accurately
    useEffect(() => {
        if (!loading) {
            // Calculate progress (0 at start, 1 at end)
            const progress = hearts / 120;
            // The road is ~1200px high. Hearts=0 is at bottom (y=1200), Hearts=120 is at top (y=60)
            // Target Y in the roadmap container
            const targetY = 1100 - (progress * 1050);

            // Get the container offset from top of document
            const containerOffset = 150; // Approximated header height

            window.scrollTo({
                top: targetY + containerOffset - (window.innerHeight / 2) + 100,
                behavior: 'smooth'
            });
        }
    }, [hearts, loading]);

    // Automatic journey stops at Diamond. Titan is manual.
    const nextRank = [...RANKS].reverse().find(r => r.id !== 'titan' && r.threshold > hearts);
    const heartsNeeded = nextRank ? nextRank.threshold - hearts : 0;

    // Detect rank achievement
    useEffect(() => {
        const achieved = [...RANKS].find(r => hearts >= r.threshold);
        if (achieved && achieved.id !== lastAchievedRankId) {
            const prevRankId = lastAchievedRankId;
            setSelectedRank(achieved);
            setLastAchievedRankId(achieved.id);

            // Show modal if we travel from Entry to a real Rank (Bronze+), or upgrade
            if (achieved.id !== 'entry' && (prevRankId === 'entry' || prevRankId !== null)) {
                // Wait for Cupid to "arrive" at the destination after his sprint
                setTimeout(() => setShowModal(true), 1500);
            }
        }
        // Initialize rank on load
        if (hearts === 0 && lastAchievedRankId === null) {
            setLastAchievedRankId('entry');
        }
    }, [hearts, lastAchievedRankId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    // SVG Path calculation based on node positions
    // Path points (x, y) where x is 0-400 and y is 0-1100
    // Nodes: (200, 60), (320, 230), (80, 400), (320, 570), (80, 740), (320, 910)
    const roadD = "M200,0 L200,60 C200,60 380,150 320,230 C260,310 80,320 80,400 C80,480 320,490 320,570 C320,650 80,660 80,740 C80,820 320,830 320,910 C320,990 200,1050 200,1100 L200,1200";

    return (
        <div className="min-h-screen bg-[#ffeef2] relative font-sans pb-80 overflow-x-hidden">
            {/* Ambient Background Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Floating Themed SVG Icons */}
                {[
                    { IconComp: Heart, top: 1100, left: '15%', color: 'text-rose-400', size: 28 },
                    { IconComp: Gift, top: 980, left: '85%', color: 'text-pink-400', size: 32 },
                    { IconComp: Flower2, top: 820, left: '10%', color: 'text-rose-500', size: 30 },
                    { IconComp: CakeSlice, top: 660, left: '90%', color: 'text-pink-300', size: 26 },
                    { IconComp: Sparkles, top: 480, left: '5%', color: 'text-yellow-400', size: 24 },
                    { IconComp: Mail, top: 320, left: '95%', color: 'text-rose-300', size: 28 },
                    { IconComp: Music, top: 150, left: '80%', color: 'text-pink-400', size: 22 },
                ].map((item, idx) => (
                    <motion.div
                        key={`deco-${idx}`}
                        className={`absolute p-3 rounded-full bg-white/40 backdrop-blur-md shadow-sm border border-white/60 ${item.color}`}
                        style={{ top: item.top, left: item.left }}
                        animate={{
                            y: [0, -15, 0],
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 5 + Math.random() * 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: idx * 0.5
                        }}
                    >
                        <item.IconComp size={item.size} strokeWidth={1.5} />
                    </motion.div>
                ))}

                {/* Floating Heart Particles */}
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={`particle-${i}`}
                        className="absolute text-rose-300/10"
                        initial={{ y: "110%", x: Math.random() * 100 + "%" }}
                        animate={{ y: "-10%", x: (Math.random() * 100 - 10) + "%" }}
                        transition={{ duration: 25 + Math.random() * 15, repeat: Infinity, ease: "linear", delay: i * 2 }}
                    >
                        <Heart size={20 + Math.random() * 30} fill="currentColor" />
                    </motion.div>
                ))}
            </div>

            {/* Back Button */}
            <div className="absolute top-3 left-3 z-50">
                <Link href="/SEC/dashboard" className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </Link>
            </div>

            {/* Header */}
            <header className="pt-12 pb-2 text-center relative z-20">
                <h1 className="text-4xl font-extrabold text-[#d61c4e] italic tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Customer Obsession
                </h1>
                <div className="flex items-center justify-center gap-3 mt-2">
                    <div className="w-12 h-[2px] bg-[#d61c4e]"></div>
                    <p className="text-xs font-semibold text-[#bc4363] uppercase tracking-[0.25em]">JOURNEY OF TRUST</p>
                </div>
            </header>

            {/* Roadmap Container */}
            <div className="relative w-full max-w-[450px] mx-auto mt-4 px-4 h-[1300px]">

                {/* SVG Path */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 400 1250" preserveAspectRatio="none">
                    {/* Shadow Path */}
                    <path
                        d={roadD}
                        fill="none"
                        stroke="black"
                        strokeWidth="110"
                        strokeLinecap="round"
                        className="opacity-5"
                    />

                    {/* Main Road Path */}
                    <path
                        d={roadD}
                        fill="none"
                        stroke="#e69ab4"
                        strokeWidth="100"
                        strokeLinecap="round"
                    />

                    {/* Inner highlight */}
                    <path
                        d={roadD}
                        fill="none"
                        stroke="#f5b8cc"
                        strokeWidth="60"
                        strokeLinecap="round"
                        className="opacity-40"
                    />

                    {/* Dashed Center Line */}
                    <path
                        d={roadD}
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeDasharray="18 18"
                        className="opacity-80"
                    />
                </svg>

                {/* Animated Cupid Runner */}
                <motion.div
                    ref={cupidRef}
                    initial={false}
                    animate={{
                        // Strategic mapping: Ensures Cupid reaches each node exactly at its milestone
                        offsetDistance: (() => {
                            const map = [
                                // Strategic mapping: Titan (h:120) is now unreachable via hearts. 
                                // Automatic travel caps at Diamond (h:85/90 points effectively)
                                { h: 999999, p: 5.5 },   // Titan (Manual)
                                { h: 85, p: 18.5 },  // Diamond
                                { h: 70, p: 31.5 },  // Platinum
                                { h: 50, p: 45.5 },  // Gold
                                { h: 39, p: 58.5 },  // Silver
                                { h: 30, p: 74.0 },  // Bronze
                                { h: 0, p: 93.0 }   // Entry
                            ];

                            // Find segment
                            for (let i = 0; i < map.length - 1; i++) {
                                if (hearts >= map[i + 1].h) {
                                    const upper = map[i];
                                    const lower = map[i + 1];
                                    const t = (hearts - lower.h) / (upper.h - lower.h);
                                    return `${lower.p + t * (upper.p - lower.p)}%`;
                                }
                            }
                            return "93%";
                        })()
                    }}
                    transition={{
                        offsetDistance: { type: "spring", stiffness: 50, damping: 20 },
                        y: { repeat: Infinity, duration: 0.6, ease: "easeInOut", repeatType: "reverse" }
                    }}
                    style={{
                        position: 'absolute',
                        width: '60px',
                        height: '60px',
                        offsetPath: `path("${roadD}")`,
                        offsetRotate: '0deg',
                        zIndex: 30,
                        pointerEvents: 'none'
                    }}
                    className="flex items-center justify-center"
                >
                    <motion.div
                        animate={{
                            y: [-8, 8],
                            rotate: [-5, 5]
                        }}
                        transition={{
                            y: { repeat: Infinity, duration: 0.5, ease: "easeInOut", repeatType: "reverse" },
                            rotate: { repeat: Infinity, duration: 0.8, ease: "easeInOut", repeatType: "reverse" }
                        }}
                    >
                        <Image
                            src="/images/cupid.png"
                            alt="Cupid"
                            width={60}
                            height={60}
                            className="drop-shadow-[0_5px_15px_rgba(214,28,78,0.4)]"
                        />
                    </motion.div>
                </motion.div>

                {/* Nodes rendering logic */}
                {RANKS.map((rank, index) => {
                    const isTitan = rank.id === 'titan';
                    const isBronze = rank.id === 'bronze';
                    const isEntry = rank.id === 'entry';

                    return (
                        <motion.div
                            key={rank.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="absolute flex items-center justify-center z-10 w-full"
                            style={{
                                top: `${rank.top}px`,
                                left: 0,
                            }}
                        >
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* The node is centered at exactly rank.left % */}
                                <div
                                    className="absolute flex items-center"
                                    style={{
                                        left: `${rank.left}%`,
                                        transform: 'translateX(-50%)',
                                        flexDirection: rank.cardSide === 'left' ? 'row-reverse' : 'row'
                                    }}
                                >
                                    {/* Icon Badge Container */}
                                    <div className="relative flex flex-col items-center">
                                        {/* Outer Decorative Rings - Standardized for all ranks */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-white/10 border border-white/20 rounded-full z-0"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] h-[125%] border border-white/30 rounded-full z-0"></div>

                                        <div className={`
                                            flex items-center justify-center rounded-full shadow-2xl relative z-20 overflow-hidden
                                            ${isTitan ? 'w-24 h-24 border-6 border-white bg-white' :
                                                isBronze ? 'w-28 h-28 border-6 border-white bg-white' :
                                                    'w-24 h-24 border-6 border-white bg-white'}
                                        `}>
                                            {rank.isCustomIcon && rank.iconSrc ? (
                                                <div className="relative w-full h-full scale-110">
                                                    <Image
                                                        src={rank.iconSrc}
                                                        alt={rank.label}
                                                        fill
                                                        className="object-contain p-2"
                                                    />
                                                </div>
                                            ) : (
                                                <span className={`filter drop-shadow-md select-none ${isTitan ? 'text-5xl pb-1' : 'text-5xl'}`}>
                                                    {rank.icon}
                                                </span>
                                            )}
                                            {/* Gloss effect */}
                                            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
                                        </div>

                                        {/* Points Pill */}
                                        {!isTitan && (
                                            <div className="bg-[#4a5568] text-white text-[11px] font-bold px-5 py-2 rounded-full -mt-4 z-30 shadow-lg border border-white/20 uppercase tracking-widest whitespace-nowrap min-w-[80px] text-center">
                                                {rank.threshold} pts
                                            </div>
                                        )}
                                    </div>

                                    {/* Label Card */}
                                    <div className={`
                                        bg-white border-[3px] border-[#d61c4e] px-5 py-3.5 rounded-2xl shadow-xl z-10 min-w-[160px]
                                        ${rank.cardSide === 'left' ? 'mr-4 text-right' : 'ml-4 text-left'}
                                        hover:scale-105 transition-transform duration-300
                                    `}>
                                        <h3 className="text-[15px] font-black text-[#d61c4e] uppercase leading-none mb-1">{rank.label}</h3>
                                        <p className="text-[11px] text-gray-500 italic font-semibold leading-tight">{rank.description}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Bottom Status Bar */}
            <div className="fixed bottom-28 left-0 right-0 p-3 z-40">
                <div className="max-w-[360px] mx-auto bg-[#9c8a8a]/90 backdrop-blur-3xl rounded-[2.5rem] p-4 text-white shadow-2xl flex items-center justify-between border border-white/30">

                    {/* Current Hearts */}
                    <div className="flex flex-col gap-1 pl-1">
                        <p className="text-[9px] text-white/80 font-black uppercase tracking-[0.2em]">CURRENT HEARTS</p>
                        <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 flex items-center justify-center">
                                <div className="absolute inset-0 border-2 border-yellow-400 rounded-full animate-pulse-slow"></div>
                                <div className="w-7 h-7 rounded-full border border-yellow-400 flex items-center justify-center text-xs shadow-[0_0_12px_rgba(253,224,71,0.5)] bg-yellow-400/10">
                                    💛
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl font-light tracking-tighter leading-none">{hearts}</span>
                                <span className="text-[10px] font-bold opacity-80 tracking-widest leading-none">HEARTS</span>
                            </div>
                        </div>
                    </div>

                    {/* Divider with Heart */}
                    <div className="h-12 w-[1.5px] bg-white/20 relative mx-1">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,1)]">
                            ❤️
                        </div>
                    </div>

                    {/* Next Love Up */}
                    <div className="flex flex-col items-end gap-1 pr-1 text-right">
                        <p className="text-[9px] text-white/80 font-black uppercase tracking-[0.2em]">NEXT LOVE UP</p>
                        <p className="text-3xl font-light text-white tracking-tight leading-none mb-0.5">
                            {nextRank?.name.split(' ')[0] || "Max"}
                        </p>
                        {heartsNeeded > 0 && (
                            <div className="px-4 py-1.5 bg-white/20 rounded-xl text-[9px] font-bold border border-white/10 shadow-sm">
                                -{heartsNeeded} hearts
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Milestone Achievement Modal */}
            <AnimatePresence>
                {showModal && selectedRank && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-rose-900/40 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0, y: 50 }}
                            className="bg-white rounded-[3rem] p-8 max-w-[340px] w-full text-center shadow-[0_20px_50px_rgba(214,28,78,0.3)] border-4 border-[#d61c4e] relative overflow-hidden"
                        >
                            {/* Animated Background Confetti Elements */}
                            <div className="absolute inset-0 pointer-events-none opacity-20">
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute text-rose-500"
                                        animate={{
                                            rotate: 360,
                                            y: [0, -20, 0],
                                            x: [0, Math.sin(i) * 20, 0]
                                        }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        style={{ top: `${20 * i}%`, left: `${15 * i}%` }}
                                    >
                                        <Sparkles size={16} />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Gift Box High Quality Animation - Opening Sequence */}
                            <div className="relative w-48 h-48 mx-auto -mt-10 mb-2 flex items-center justify-center">
                                {/* Magical Inner Glow (only when open) */}
                                <AnimatePresence>
                                    {boxOpened && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 0.8 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute w-32 h-32 bg-yellow-400/40 rounded-full blur-3xl z-0"
                                        />
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    key={boxOpened ? "open" : "closed"}
                                    initial={boxOpened ? { scale: 0.8, y: 20 } : { scale: 1 }}
                                    animate={boxOpened ?
                                        { scale: 1, y: 0 } :
                                        {
                                            rotate: [-2, 2, -2, 2, 0],
                                            x: [-1, 1, -1, 1, 0],
                                            scale: [1, 1.05, 1]
                                        }
                                    }
                                    transition={boxOpened ?
                                        { type: "spring", stiffness: 300, damping: 15 } :
                                        { duration: 0.2, repeat: Infinity, repeatType: "mirror" }
                                    }
                                    className="relative z-10 w-full h-full"
                                >
                                    <Image
                                        src="/images/gift-box.png"
                                        alt="Gift Box"
                                        fill
                                        className={`object-contain ${boxOpened ? 'drop-shadow-[0_15px_30px_rgba(214,28,78,0.5)]' : 'drop-shadow-[0_5px_15px_rgba(0,0,0,0.2)]'}`}
                                    />
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 rounded-full text-[#d61c4e] text-xs font-black uppercase tracking-widest mb-4 border border-rose-100">
                                    <PartyPopper size={14} />
                                    New Level Unlocked
                                </div>
                                <h2 className="text-3xl font-black text-[#d61c4e] mb-2 uppercase leading-none">
                                    {selectedRank.name}
                                </h2>
                                <p className="text-gray-500 text-sm font-semibold italic mb-8 leading-relaxed px-2">
                                    "{MOTIVATION_MESSAGES[selectedRank.id] || selectedRank.description}"
                                </p>
                            </motion.div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowModal(false)}
                                className="w-full bg-[#d61c4e] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:brightness-110 mb-2 mt-4"
                            >
                                Collect Your Hearts
                            </motion.button>

                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                Tap to continue journey
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ValentineFooter />
        </div>
    );
}
