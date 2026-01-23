'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award,
    ChevronRight,
    Star,
    Flag,
    Shield,
    Lock,
    CheckCircle,
    Gift,
    FileText,
    X,
    ChevronLeft,
    Crown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import RepublicDayBonusPopup from '@/components/RepublicDayBonusPopup';

// Rank Data Configuration
const RANKS = [
    { id: 'cadet', title: 'SALESVEER', minSales: 0, color: 'bg-stone-400', icon: Shield },
    { id: 'lieutenant', title: 'SALES LIEUTENANT', minSales: 21000, color: 'bg-emerald-500', icon: Star },
    { id: 'captain', title: 'SALES CAPTAIN', minSales: 51000, color: 'bg-blue-500', icon: Award },
    { id: 'major', title: 'SALES MAJOR', minSales: 80000, color: 'bg-indigo-600', icon: Award },
    { id: 'colonel', title: 'SALES COMMANDER', minSales: 120000, color: 'bg-purple-600', icon: Award },
    { id: 'brigadier', title: 'SALES CHIEF MARSHAL', minSales: 150000, color: 'bg-orange-500', icon: Star },
    { id: 'general', title: 'SALES GENERAL', minSales: 150000, color: 'bg-gradient-to-r from-red-600 to-orange-600', icon: Crown },
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

const TermsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Terms & Conditions</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-slate-600 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div>
                        <p className="font-bold text-slate-800 mb-1">1. Campaign Period</p>
                        <p>The PROTECTMAXYODHA Campaign (Honour & Glory Path) is valid from 23rd January 2026 to 31st January 2026.</p>
                    </div>

                    <div>
                        <p className="font-bold text-slate-800 mb-1">2. Eligibility</p>
                        <p>This mission is open to all active Samsung Experience Consultants (SECs) across all zones (North, South, East, West).</p>
                    </div>

                    <div>
                        <p className="font-bold text-slate-800 mb-1">3. Honour Points System</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>You need to earn Honour Points to progress through the ranks.</li>
                            <li>Each ₹1 of plan sales revenue achieved translates to 1 Honour Point.</li>
                            <li>Ranks are achieved based on the total Honour Points accumulated during the campaign period.</li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-bold text-slate-800 mb-1">4. Rank Progression & Rewards</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Ranks are assigned based on cumulative Honour Points earned during the campaign period.</li>
                            <li>Incentives are calculated based on the highest rank achieved.</li>
                            <li>Sales must be successfully submitted and verified via the portal to count towards Honour Points and rank progression.</li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-bold text-slate-800 mb-1">5. Verification Process</p>
                        <p>All sales entries (IMEIs) will undergo mandatory verification. Fraudulent entries will lead to immediate disqualification from the campaign and further disciplinary action.</p>
                    </div>

                    <div>
                        <p className="font-bold text-slate-800 mb-1">6. Final Authority</p>
                        <p>The management reserves the right to modify, extend, or terminate the campaign at its sole discretion without prior notice. Decisions regarding reward distribution are final and binding.</p>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                        onClick={onClose}
                        className="w-full text-white font-bold py-3 rounded-xl uppercase tracking-wider shadow-lg hover:shadow-xl active:scale-95 transition-all relative overflow-hidden group"
                        style={{
                            background: 'linear-gradient(90deg, #FF9933 0%, #000080 50%, #138808 100%)'
                        }}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative">I Understand</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const RewardsModal = ({ isOpen, onClose, currentRankIndex }: { isOpen: boolean, onClose: () => void, currentRankIndex: number }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-orange-50 via-white to-green-50">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl text-white shadow-lg"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        >
                            <Gift size={20} />
                        </motion.div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>ProtectMaxYodha Rewards</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <p className="text-xs text-slate-500 font-medium mb-4 uppercase tracking-wider text-center">Climb the ranks and unlock incredible rewards! 🏆</p>

                    {(() => {
                        const rewardData = [
                            { title: 'SALES VEER', message: 'Start Now', reward: 'Get Started', minSales: 0 },
                            { title: 'SALES LIEUTENANT', message: 'Honor and congratulations on achieving your new rank!', reward: 'Recognition', minSales: 21000 },
                            { title: 'SALES CAPTAIN', message: 'Don\'t stop here—after all, you are the Sales Captain of Sales!', reward: 'Prestige', minSales: 51000 },
                            { title: 'SALES MAJOR', message: 'Outstanding achievement! Your dedication is paying off.', reward: '₹500', minSales: 80000 },
                            { title: 'SALES COMMANDER', message: 'Exceptional performance! Lead by example and inspire others.', reward: '₹1,500', minSales: 120000 },
                            { title: 'SALES CHIEF MARSHAL', message: 'Elite status achieved! You\'re among the top performers.', reward: '₹2,500', minSales: 150000 },
                            { title: 'SALES GENERAL', message: 'Supreme excellence! Only ONE person tops the Hall of Fame!', reward: '₹5,000', minSales: 150000 }
                        ];
                        return rewardData.map((item, i) => {
                            const rank = RANKS[i];
                            const isTopRank = i === rewardData.length - 1;
                            const isCurrentRank = i === currentRankIndex;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className={`relative p-4 rounded-2xl bg-gradient-to-br border-2 transition-all hover:scale-[1.02] ${isCurrentRank
                                        ? 'from-blue-50 to-indigo-50 border-blue-400 shadow-lg shadow-blue-300/50 ring-2 ring-blue-400'
                                        : isTopRank
                                            ? 'from-yellow-50 to-orange-50 border-orange-300 shadow-lg shadow-orange-200/50'
                                            : 'from-slate-50 to-white border-slate-200 hover:border-orange-200'
                                        }`}
                                >
                                    {isCurrentRank && (
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-md animate-pulse border border-blue-200">
                                            ⭐ Your Rank
                                        </div>
                                    )}
                                    {isTopRank && !isCurrentRank && (
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 via-yellow-500 to-orange-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-md animate-pulse border border-yellow-200">
                                            🏆 Top Honor
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr ${rank?.color || 'bg-slate-400'} to-white shadow-md ring-2 ring-white shrink-0`}>
                                            {rank && <rank.icon size={22} className="text-white drop-shadow-sm" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-slate-800 text-sm tracking-tight mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.title}</h4>
                                            <p className="text-xs text-slate-600 leading-relaxed mb-2">{item.message}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-slate-400 font-semibold uppercase">Honour Points:</span>
                                                <span className="text-xs font-bold text-[#000080]">{item.minSales === 0 ? '0' : item.title === 'SALES GENERAL' ? '1.5 lacs plus' : item.minSales.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[9px] font-semibold text-slate-400 uppercase mb-1">Reward</p>
                                            <span className={`text-base font-black ${item.reward.includes('₹') ? 'text-green-600' : 'text-orange-600'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>{item.reward}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        });
                    })()}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 flex items-start gap-3 shadow-sm"
                    >
                        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                            <Star className="text-blue-600 fill-blue-600 shrink-0 mt-0.5" size={18} />
                        </motion.div>
                        <div>
                            <p className="text-sm font-black text-blue-800 uppercase mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Keep Pushing Forward!</p>
                            <p className="text-xs text-blue-700 leading-relaxed">Every sale brings you closer to glory. Stay motivated, keep climbing, and let your dedication shine! 🌟</p>
                        </div>
                    </motion.div>
                </div>
                <div className="p-6 bg-gradient-to-r from-orange-50 via-white to-green-50 border-t border-slate-100 text-center">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 via-[#000080] to-green-600 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-orange-900/30 hover:shadow-xl active:scale-95 transition-all"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        Let&apos;s Conquer! 🚀
                    </button>
                </div>
            </motion.div>
        </div>
    );
};



export default function RepublicDayHeroPage() {
    const router = useRouter();

    const [currentSales, setCurrentSales] = useState(0);
    const [rankSales, setRankSales] = useState(0); // New state for stable rank positioning
    const [loading, setLoading] = useState(true);
    const [showTerms, setShowTerms] = useState(false);
    const [showRewards, setShowRewards] = useState(false);

    const [animatedRankIndex, setAnimatedRankIndex] = useState(0); // For progressive avatar jump animation

    useEffect(() => {
        let isMounted = true;
        let timer: NodeJS.Timeout | null = null;

        const fetchSales = async () => {
            try {
                const res = await fetch('/api/sec/republic-hero');
                const data = await res.json();

                if (data.success && isMounted) {
                    const userRealSales = data.data.totalSales;

                    // Set rank sales immediately to avoid avatar jumping during count animation
                    setRankSales(userRealSales);

                    // Animate count up
                    let start = 0;
                    const duration = 2000;
                    const stepTime = 20;
                    const steps = duration / stepTime;
                    const increment = userRealSales / steps;

                    timer = setInterval(() => {
                        if (!isMounted) {
                            if (timer) clearInterval(timer);
                            return;
                        }
                        start += increment;
                        if (start >= userRealSales) {
                            setCurrentSales(userRealSales);
                            if (timer) clearInterval(timer);
                        } else {
                            setCurrentSales(Math.floor(start));
                        }
                    }, stepTime);
                }
            } catch (error) {
                console.error("Failed to fetch protectmax yodha sales", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchSales();

        return () => {
            isMounted = false;
            if (timer) clearInterval(timer);
        };
    }, []);

    // Determine Current Rank Index based on STABLE rankSales, not animating currentSales
    const currentRankIndex = RANKS.findLastIndex(rank => rankSales >= rank.minSales);
    const nextRank = RANKS[currentRankIndex + 1];

    // Progressive Avatar Jump Animation - Jump through each rank until reaching current rank
    useEffect(() => {
        if (currentRankIndex >= 0) {
            let currentStep = 0;
            const jumpInterval = setInterval(() => {
                if (currentStep <= currentRankIndex) {
                    setAnimatedRankIndex(currentStep);
                    currentStep++;
                } else {
                    clearInterval(jumpInterval);
                }
            }, 500); // 500ms delay between each rank jump

            return () => clearInterval(jumpInterval);
        }
    }, [currentRankIndex]);

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
        if (scrollContainerRef.current && itemsRef.current[animatedRankIndex]) {
            const container = scrollContainerRef.current;
            const target = itemsRef.current[animatedRankIndex];

            if (target) {
                const scrollLeft = target.offsetLeft - (container.clientWidth / 2) + (target.clientWidth / 2);
                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [animatedRankIndex]);

    const handleContinue = () => {
        router.push('/SEC/home');
    };

    return (
        <div
            className="h-screen bg-slate-50 relative overflow-hidden font-sans"
            onClick={handleGlobalInteraction}
        >
            {/* Republic Day Bonus Popup */}
            <RepublicDayBonusPopup />

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
                        <div className="flex items-center gap-2 mb-1">
                            {/* Back Button - Smaller and positioned before Republic Day Special */}
                            <button
                                onClick={() => router.push('/SEC/home')}
                                className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:scale-110 transition-all active:scale-95 border border-slate-200"
                                aria-label="Go back to home"
                            >
                                <ChevronLeft className="text-slate-700" size={18} />
                            </button>

                            <div className="flex items-center gap-2 bg-orange-50 w-fit px-3 py-1 rounded-full border border-orange-100">
                                <IndianFlag size={18} />
                                <span className="text-xs font-bold tracking-wider text-[#000080] uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>Republic Day Special</span>
                                <IndianFlag size={18} />
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.03em' }}>
                            Honour & Glory <span className="text-[#FF9933]">Path</span>
                        </h1>
                        <p className="text-slate-600 font-medium mt-0.5 text-[10px] sm:text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Climb the ranks: SALESVEER to <span className="text-red-600 font-bold">SALESGENERAL</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-2 sm:p-3 rounded-2xl border border-white shadow-sm">
                        <div className="text-right">
                            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>Current Points</p>
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
                                {currentSales.toLocaleString('en-IN')}
                            </motion.p>
                        </div>

                    </div>
                </header>

                {/* Progression Path Visualization - Ladder Style */}
                <div className="flex-1 flex items-center justify-center relative w-full min-h-0 pt-6 sm:pt-20 pb-4">

                    {/* Scrollable Container */}
                    {/* Scrollable Container */}
                    <div ref={scrollContainerRef} className="w-full overflow-x-auto overflow-y-visible pb-2 pt-28 sm:pt-40 hide-scrollbar snap-x snap-mandatory flex md:justify-start md:pl-20">
                        <div className="flex items-end gap-2 md:gap-4 px-2 md:px-6 min-w-max mx-auto md:mx-0 justify-center" style={{ paddingBottom: '40px' }}>
                            {RANKS.map((rank, index) => {
                                const isUnlocked = index <= animatedRankIndex;
                                const isCurrent = index === animatedRankIndex;
                                const isLocked = index > animatedRankIndex;

                                // Calculate ladder height - each step goes higher (reduced for compact view)
                                const ladderHeight = index * 24; // 24px increment per level (was 40px)

                                return (
                                    <motion.div
                                        key={rank.id}
                                        className={`flex flex-col items-center group relative snap-center ${rank.id === 'general' ? 'ml-24' : ''}`}
                                        ref={(el) => { itemsRef.current[index] = el; }}
                                        style={{
                                            marginBottom: rank.id === 'general' ? '50px' : `${ladderHeight}px`,
                                            transition: 'margin-bottom 0.5s ease-out'
                                        }}
                                        initial={rank.id === 'general' ? { opacity: 0, scale: 0.5, x: 100, rotate: 15 } : {}}
                                        whileInView={rank.id === 'general' ? {
                                            opacity: 1,
                                            scale: 1,
                                            x: 0,
                                            rotate: 0,
                                            transition: {
                                                type: "spring",
                                                stiffness: 60,
                                                damping: 10,
                                                mass: 1.2,
                                                delay: 0.2
                                            }
                                        } : {}}
                                        viewport={{ once: false, amount: 0.6 }}
                                    >

                                        {/* Diagonal Connector Line - Hide for General to make it standalone */}
                                        {index > 0 && rank.id !== 'general' && (
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

                                        {/* Soldier Avatar (Current Level) - Shows at animated progression rank */}
                                        {index === animatedRankIndex && (
                                            <motion.div
                                                key={`avatar-${animatedRankIndex}`}
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
                                                    <div className="relative w-full h-full"> {/* Wrapped Image in div to avoid motion prop issues if any */}
                                                        <Image
                                                            src="/images/samsung-salesperson.png"
                                                            alt="Samsung Salesperson Avatar"
                                                            fill
                                                            className="object-contain relative z-10"
                                                            priority
                                                        />
                                                    </div>
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
                                                relative z-10 rounded-3xl flex flex-col items-center justify-center
                                                transition-all duration-500 cursor-pointer
                                                ${rank.id === 'general' ? 'w-40 h-40 md:w-48 md:h-48' : 'w-24 h-24 md:w-28 md:h-28'}
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

                                            {/* Special Effects for General Rank - Heavenly Ascension */}
                                            {rank.id === 'general' && (
                                                <>
                                                    {/* Rotating Sunburst */}
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                        className="absolute inset-[-100%] z-0 opacity-20"
                                                        style={{
                                                            background: 'conic-gradient(from 0deg, transparent 0deg, #FFD700 20deg, transparent 40deg, transparent 360deg)',
                                                            filter: 'blur(20px)'
                                                        }}
                                                    />

                                                    {/* Legendary Badge */}
                                                    <div className="absolute -top-6 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg z-20 animate-pulse border border-yellow-200">
                                                        Legendary
                                                    </div>

                                                    {/* Floating Particles */}
                                                    {[...Array(5)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                                            animate={{
                                                                y: [0, -40, -80],
                                                                opacity: [0, 1, 0],
                                                                x: Math.random() * 40 - 20
                                                            }}
                                                            transition={{
                                                                duration: 2 + Math.random(),
                                                                repeat: Infinity,
                                                                delay: Math.random() * 2,
                                                                ease: "easeOut"
                                                            }}
                                                            style={{
                                                                left: `${20 + Math.random() * 60}%`,
                                                                bottom: '10%'
                                                            }}
                                                        />
                                                    ))}
                                                </>
                                            )}

                                            {/* Decorative Shine Effect */}
                                            {/* Generic Shine for unlocked ranks (modified to respect general styling) */}
                                            {isUnlocked && (
                                                <div className="absolute inset-0 rounded-3xl overflow-hidden z-0">
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
                                                    ${rank.id === 'general' ? 'w-16 h-16 md:w-20 md:h-20 mb-3' : 'w-10 h-10 md:w-12 md:h-12 mb-1.5'} rounded-full flex items-center justify-center z-10
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
                                                    {isLocked ? <Lock size={rank.id === 'general' ? 24 : 14} className="text-slate-500" /> : <rank.icon size={rank.id === 'general' ? 32 : 18} className="text-white drop-shadow-md" />}
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
                                                ${rank.id === 'general' ? 'text-sm md:text-lg' : 'text-xs md:text-sm'} font-extrabold text-center px-1 leading-tight z-10
                                                ${rank.id === 'general' ? 'text-red-600' : isUnlocked ? 'text-slate-800' : 'text-slate-400'}
                                                uppercase tracking-tight
                                            `} style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
                                                {rank.title}
                                            </p>

                                            {/* Sales Milestone */}
                                            {rank.id !== 'general' && (
                                                <div className={`
                                                    mt-1 px-2 py-1 rounded-full text-[9px] md:text-[10px] font-bold z-10
                                                    ${isUnlocked ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}
                                                `}>
                                                    {rank.minSales === 0 ? 'Start' : `₹${rank.minSales.toLocaleString('en-IN')}+`}
                                                </div>
                                            )}
                                        </motion.div>

                                        {/* Floor Reflection/Shadow */}
                                        <div className={`
                        w-16 h-2 rounded-[100%] blur-sm mt-3 transition-colors duration-500
                        ${isCurrent ? 'bg-[#000080]/30' : 'bg-slate-200/50'}
                     `}></div>
                                    </motion.div>
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
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>Honour Points</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black bg-gradient-to-r from-orange-500 via-purple-600 to-green-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900, letterSpacing: '-0.02em' }}>
                                        {nextRank?.minSales.toLocaleString('en-IN')}
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
                                className="w-full text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg hover:shadow-xl active:scale-[0.98] relative overflow-hidden group"
                                style={{
                                    background: 'linear-gradient(90deg, #FF9933 0%, #000080 50%, #138808 100%)',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 700
                                }}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <div className="relative flex items-center justify-center gap-2">
                                    <span className="uppercase">Submit Your Sales</span>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                </div>
                            </button>

                            <button
                                onClick={() => router.push('/SEC/republic-leaderboard')}
                                className="w-full text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg hover:shadow-xl active:scale-[0.98] relative overflow-hidden group"
                                style={{
                                    background: 'linear-gradient(90deg, #FF9933 0%, #000080 50%, #138808 100%)',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 700
                                }}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <div className="relative flex items-center justify-center gap-2">
                                    <span className="uppercase">HALL OF FAME</span>
                                    <Award size={18} className="group-hover:scale-110 transition-transform" strokeWidth={2} />
                                </div>
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

                {/* Side Action Buttons - Right Side Top - Always Visible */}
                <div className="fixed right-0 top-20 flex flex-col items-end z-40">
                    <div className="flex flex-col gap-3">
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ x: -8 }}
                            onClick={() => setShowRewards(true)}
                            className="bg-white/95 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-3 py-3 rounded-l-2xl flex items-center gap-2.5 group transition-all w-[130px]"
                        >
                            <div className="bg-orange-100 p-2 rounded-xl group-hover:bg-orange-200 transition-colors shrink-0">
                                <Gift className="text-orange-600" size={18} />
                            </div>
                            <span className="text-[10px] sm:text-xs font-black text-slate-700 uppercase tracking-widest leading-none pr-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Rewards</span>
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ x: -8 }}
                            onClick={() => setShowTerms(true)}
                            className="bg-white/95 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-3 py-3 rounded-l-2xl flex items-center gap-2.5 group transition-all w-[130px]"
                        >
                            <div className="bg-blue-100 p-2 rounded-xl group-hover:bg-blue-200 transition-colors shrink-0">
                                <FileText className="text-blue-600" size={18} />
                            </div>
                            <span className="text-[10px] sm:text-xs font-black text-slate-700 uppercase tracking-widest leading-none pr-1" style={{ fontFamily: 'Poppins, sans-serif' }}>T&C</span>
                        </motion.button>
                    </div>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {showTerms && <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />}
                    {showRewards && <RewardsModal isOpen={showRewards} onClose={() => setShowRewards(false)} currentRankIndex={currentRankIndex} />}
                </AnimatePresence>
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
        </div >
    );
}
