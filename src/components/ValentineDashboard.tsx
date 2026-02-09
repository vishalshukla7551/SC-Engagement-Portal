'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import ValentineFooter from './ValentineFooter';
import { useRouter } from 'next/navigation';

interface ValentineDashboardProps {
    userName?: string;
}

// 7 Ranks: Aashiq -> Majnu -> Deewana -> Mehboob -> Dilruba -> Raanjha -> ProtectMax Romeo
const RANKS = [
    {
        id: 1,
        name: 'Bronze',
        threshold: 0,
        emoji: '🌹',
        desc: 'The Beginning',
        color: 'from-slate-500 to-slate-700',
        position: { left: '67%', top: '96%' },
        rotation: 0,
        textSide: 'left'
    },
    {
        id: 2,
        name: 'Silver',
        threshold: 1,
        emoji: '🎸',
        desc: 'Lost in Love',
        color: 'from-blue-500 to-indigo-600',
        position: { left: '42%', top: '82%' },
        rotation: 15,
        textSide: 'right'
    },
    {
        id: 3,
        name: 'Gold',
        threshold: 16,
        emoji: '💌',
        desc: 'Crazy in Love',
        color: 'from-purple-500 to-violet-600',
        position: { left: '30%', top: '62%' },
        rotation: -5,
        textSide: 'right'
    },
    {
        id: 4,
        name: 'Platinum',
        threshold: 21,
        emoji: '🏹',
        desc: 'The Beloved',
        color: 'from-pink-500 to-rose-600',
        position: { left: '64%', top: '48%' },
        rotation: 5,
        textSide: 'left'
    },
    {
        id: 5,
        name: 'Diamond',
        threshold: 26,
        emoji: '💓',
        desc: 'Heart Stealer',
        color: 'from-rose-500 to-red-600',
        position: { left: '55%', top: '32%' },
        rotation: -5,
        textSide: 'right'
    },
    {
        id: 6,
        name: 'Supreme',
        threshold: 31,
        emoji: '🌟',
        desc: 'Devoted Soul',
        color: 'from-orange-500 to-amber-600',
        position: { left: '30%', top: '18%' },
        rotation: 10,
        textSide: 'right'
    },
    {
        id: 7,
        name: 'ProtectMax Titan',
        threshold: 36,
        emoji: '👑',
        desc: 'The Ultimate Winner',
        color: 'from-red-600 to-rose-900',
        position: { left: '60%', top: '2%' },
        effect: true,
        customScale: 1.1,
        textSide: 'right'
    },
];

export default function ValentineDashboard({ userName: userNameProp = '' }: ValentineDashboardProps) {
    const router = useRouter();
    const [score, setScore] = useState(0);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [prevRankId, setPrevRankId] = useState(1);
    const [visitingRankIndex, setVisitingRankIndex] = useState(0);
    const [clickEffects, setClickEffects] = useState<{ id: number, x: number, y: number }[]>([]);
    const [showCupid, setShowCupid] = useState(false);
    const [isMuted, setIsMuted] = useState(false); // Default to unmuted but waiting for interaction
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [userName, setUserName] = useState(userNameProp);
    const currentRankRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Load user name from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && !userName) {
            try {
                const raw = window.localStorage.getItem('authUser');
                if (raw) {
                    const auth = JSON.parse(raw);
                    const name = auth?.name || auth?.employeeId || 'You';
                    setUserName(name);
                }
            } catch (e) {
                console.error('Error loading user name:', e);
            }
        }
    }, [userName]);

    // Audio Control
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.2; // Low volume as requested
            if (!isMuted) {
                // Browser might block autoplay until interaction
                audioRef.current.play().catch(e => console.log("Audio autoplay blocked:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isMuted]);

    // Page Visibility API - Pause audio when tab goes to background
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (audioRef.current) {
                if (document.hidden) {
                    // Tab is hidden/in background - pause audio
                    audioRef.current.pause();
                } else {
                    // Tab is visible again - resume audio if not muted
                    if (!isMuted) {
                        audioRef.current.play().catch(e => console.log("Audio resume failed:", e));
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isMuted]);

    // Cupid Scheduler
    useEffect(() => {
        const scheduleCupid = () => {
            const delay = Math.random() * 15000 + 10000; // 10-25 seconds random interval
            setTimeout(() => {
                setShowCupid(true);
                setTimeout(() => setShowCupid(false), 8000); // Hide after animation
                scheduleCupid(); // Schedule next
            }, delay);
        };
        scheduleCupid();
    }, []);

    // Calculate Current Rank
    const currentRankIndex = RANKS.findLastIndex(r => score >= r.threshold);
    const currentRank = RANKS[currentRankIndex];

    // Travel Animation Effect
    useEffect(() => {
        // Reset to 0 if score resets (or on mount implicitly via state init)
        if (score === 0) setVisitingRankIndex(0);

        // Animate from current visiting node to actual rank node
        if (visitingRankIndex < currentRankIndex) {
            const timer = setTimeout(() => {
                setVisitingRankIndex(prev => prev + 1);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [visitingRankIndex, currentRankIndex, score]);

    // Auto-scroll to center current rank position
    useEffect(() => {
        if (currentRankRef.current && containerRef.current) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                currentRankRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            }, 100);
        }
    }, [visitingRankIndex]);

    // Level Up Check
    useEffect(() => {
        if (currentRank.id > prevRankId) {
            setShowLevelUp(true);
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#ff0000', '#ff69b4', '#ffffff']
            });
            setTimeout(() => setShowLevelUp(false), 3000);
            setPrevRankId(currentRank.id);
        }
    }, [currentRank.id, prevRankId]);

    // Handle Click/Touch Interaction (Heart Bursts)
    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        // Get coordinates
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            // @ts-ignore
            clientX = (e as React.MouseEvent).clientX;
            // @ts-ignore
            clientY = (e as React.MouseEvent).clientY;
        }

        const newEffect = { id: Date.now(), x: clientX, y: clientY };
        setClickEffects(prev => [...prev, newEffect]);

        // Cleanup this specific effect after animation
        setTimeout(() => {
            setClickEffects(prev => prev.filter(eff => eff.id !== newEffect.id));
        }, 1000);

        // Try playing audio on interaction (if not already playing)
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(e => console.log("Audio play failed on interaction:", e));
            setIsMuted(false);
        }
    };

    // Simulating "Dummy Run" to ProtectMax Romeo (Rank 7, Threshold 36)
    useEffect(() => {
        const interval = setInterval(() => {
            setScore(prev => {
                if (prev >= 40) {
                    clearInterval(interval);
                    return prev;
                }
                // Add 1 heart logic
                return prev + 1;
            });
        }, 2000); // Update every 2s for slower progression

        return () => clearInterval(interval);
    }, []);



    // Cursor Trail State
    const [trail, setTrail] = useState<{ id: number, x: number, y: number }[]>([]);

    // Floating Hearts State
    const [floatingHearts, setFloatingHearts] = useState<{ id: number, left: number, scale: number, duration: number }[]>([]);

    // Heartbeat Animation
    // We can use simple CSS class or motion div, let's use motion div for overlay

    // Handle Mouse Move for Trail
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        // Limit trail creation rate to avoid performance issues
        if (Math.random() > 0.2) return;

        const newPoint = { id: Date.now(), x: e.clientX, y: e.clientY };
        setTrail(prev => [...prev.slice(-20), newPoint]); // Keep last 20

        setTimeout(() => {
            setTrail(prev => prev.filter(p => p.id !== newPoint.id));
        }, 800);
    };

    // Floating Hearts Scheduler (Parallax)

    useEffect(() => {
        const interval = setInterval(() => {
            const newHeart = {
                id: Date.now(),
                left: Math.random() * 100,
                scale: Math.random() * 0.8 + 0.4, // Random size
                duration: Math.random() * 5 + 5 // 5-10s duration for random speed
            };

            setFloatingHearts(prev => [...prev, newHeart]);

        }, 800); // New heart every 800ms
        return () => clearInterval(interval);
    }, []);

    // Side Decorations (Balloons, Letters, etc.) - Specifically for filling empty space
    const [sideItems, setSideItems] = useState<{ id: number, emoji: string, left: number, delay: number, duration: number }[]>([]);

    useEffect(() => {
        // Initial set of side items
        const emojis = ['🎈', '💌', '🧸', '💝', '🍫', '🌹'];
        const items = Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            // Spawn strictly on left (0-15%) or right (85-100%)
            left: Math.random() > 0.5 ? Math.random() * 15 : 85 + Math.random() * 15,
            delay: Math.random() * 10,
            duration: 10 + Math.random() * 10
        }));
        setSideItems(items);
    }, []);

    return (
        <div
            className="relative w-full h-screen overflow-hidden bg-black font-sans cursor-pointer select-none"
            onClick={handleInteraction}
            onMouseMove={handleMouseMove}
        >
            {/* Heartbeat Vignette Overlay - Intensified */}
            <motion.div
                className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_10%,rgba(230,0,40,0.45)_100%)]"
                animate={{ opacity: [0.6, 1.05, 0.6] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Full Screen Background - Light Pinkish Theme */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-pink-200 via-rose-100 to-pink-200">

                {/* PNG Journey Path Overlay */}
                {/* Ensure the path image is visible if it was there before, 
                    but looking at previous replace blocks, we are reconstructing the structure.
                    The path structure usually follows here. 
                    I will restore the Floating Clouds etc as they were structure-wise in Step 598 era.
                */}

                {/* 1. Floating Clouds Layer */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={`cloud-${i}`}
                            className="absolute bg-white/40 blur-[40px] rounded-full"
                            style={{
                                width: 200 + Math.random() * 300,
                                height: 100 + Math.random() * 100,
                                top: `${10 + Math.random() * 60}%`,
                            }}
                            initial={{ x: '-100%' }}
                            animate={{ x: '400%' }}
                            transition={{
                                duration: 20 + Math.random() * 10,
                                repeat: Infinity,
                                ease: "linear",
                                delay: i * 5
                            }}
                        />
                    ))}
                </div>

                {/* Sparkles (Twinkling Stars) */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(60)].map((_, i) => (
                        <motion.div
                            key={`sparkle-${i}`}
                            className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_4px_white]"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0]
                            }}
                            transition={{
                                duration: 1 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 3
                            }}
                        />
                    ))}
                </div>

                {/* 3. Floating Parallax Hearts (Upward) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden h-full">
                    {floatingHearts.map((heart) => (
                        <motion.div
                            key={heart.id}
                            className="absolute text-pink-500/60 drop-shadow-lg"
                            style={{
                                left: `${heart.left}%`,
                                bottom: '-5%',
                                fontSize: `${heart.scale * 2}rem`
                            }}
                            initial={{ y: 0, opacity: 0, scale: heart.scale }}
                            animate={{
                                y: '-105vh',
                                opacity: [0, 0.8, 0],
                                rotate: Math.random() > 0.5 ? 20 : -20
                            }}
                            transition={{
                                duration: heart.duration,
                                ease: "linear"
                            }}
                            onAnimationComplete={() => setFloatingHearts(prev => prev.filter(h => h.id !== heart.id))}
                        >
                            ❤️
                        </motion.div>
                    ))}
                </div>
            </div>


            {/* Side Decorations (Filling Empty Space) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {sideItems.map((item) => (
                    <motion.div
                        key={item.id}
                        className="absolute text-4xl drop-shadow-md filter hover:brightness-110"
                        style={{
                            left: `${item.left}%`,
                            bottom: '-10%',
                        }}
                        animate={{
                            y: ['0vh', '-120vh'],
                            x: [0, Math.sin(item.id) * 50, 0], // Gentle Sway
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                            opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                            duration: item.duration,
                            repeat: Infinity,
                            delay: item.delay,
                            ease: "linear"
                        }}
                    >
                        {item.emoji}
                    </motion.div>
                ))}

                {/* Hanging Red Lanterns at Top Corners */}
                <div className="absolute top-0 left-[2%] z-20 opacity-90">
                    <motion.div
                        initial={{ rotate: 5 }}
                        animate={{ rotate: -5 }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                        className="origin-top text-5xl filter drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                    >
                        🏮
                    </motion.div>
                </div>
                <div className="absolute top-0 right-[2%] z-20 opacity-90">
                    <motion.div
                        initial={{ rotate: -5 }}
                        animate={{ rotate: 5 }}
                        transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                        className="origin-top text-5xl filter drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                    >
                        🏮
                    </motion.div>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col pt-2 pb-20 max-w-md mx-auto">
                <img
                    src="/images/path.PNG"
                    alt="Love Path"
                    className="absolute inset-0 w-full h-full object-fill opacity-60 pointer-events-none mix-blend-multiply -z-10"
                />

                {/* Header Stats - Compact */}
                {/* Blinkit-Inspired Valentine Header */}
                {/* Header Stats - Compact */}
                <div className="flex items-center px-2 mb-2 relative">
                    {/* Back Arrow */}
                    <button
                        onClick={() => router.back()}
                        className="mr-1 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>

                    {/* Valentine Honors Header - Romantic Style */}
                    <div className="relative pl-2.5 py-1 flex-1">
                        {/* Decorative side border */}
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-gradient-to-b from-rose-300 via-red-500 to-rose-900 rounded-full shadow-[0_0_8px_rgba(225,29,72,0.6)]"></div>

                        <div className="flex flex-col">
                            <h1 className="text-base leading-none font-serif italic font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-red-100 drop-shadow-[0_2px_2px_rgba(225,29,72,0.8)] filter contrast-125 whitespace-nowrap pr-1">
                                Customer Honour
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="h-[1.5px] w-5 bg-rose-400 rounded-full shadow-[0_0_4px_#fb7185]"></span>
                                <p className="text-[6px] text-white font-bold tracking-[0.3em] uppercase drop-shadow-md opacity-90 whitespace-nowrap">
                                    Journey of True Love
                                </p>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Snake Path Visualization */}
                <div className="flex-1 relative w-full">
                    {/* Render Ranks */}
                    {RANKS.map((rank, index) => {
                        const isUnlocked = index <= visitingRankIndex;
                        // @ts-ignore
                        const customScale = rank.customScale || 1;
                        // @ts-ignore
                        const rotation = rank.rotation || 0;


                        // @ts-ignore
                        const textSide = rank.textSide || 'right';
                        const isLeft = textSide === 'left';

                        return (
                            <motion.div
                                key={rank.id}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-center z-20 flex-col justify-center`}
                                style={{
                                    left: rank.position.left,
                                    top: rank.position.top,
                                    scale: customScale,
                                    width: '5rem' // Fixed width (icon width) so center point is exactly the icon center
                                }}
                            >
                                <div className={`relative transition-all duration-500 flex-shrink-0 ${isUnlocked ? 'scale-110' : 'scale-95 opacity-80'}`}>
                                    {/* Icon Container with Glow & Sparkles */}
                                    <div
                                        className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.3)] border-4 transition-all duration-300 ${isUnlocked ? 'bg-gradient-to-br from-rose-500/90 to-red-600/90 border-white shadow-rose-500/60' : 'bg-black/40 border-white/30 grayscale'}`}
                                        style={{ transform: `rotate(${rotation}deg)` }}
                                    >
                                        <span className={`text-5xl filter drop-shadow-lg ${isUnlocked ? 'animate-pulse' : ''}`}>{rank.emoji}</span>

                                        {/* Sparkles for Heart King & Titan */}
                                        {(rank.name === 'ProtectMax Titan' || rank.name === 'Bronze') && isUnlocked && (
                                            <div className="absolute inset-0 w-full h-full pointer-events-none">
                                                <motion.div
                                                    className="absolute -top-2 -right-2 text-yellow-300 text-xl"
                                                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5], rotate: [0, 45, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >✨</motion.div>
                                                <motion.div
                                                    className="absolute -bottom-1 -left-2 text-white text-lg"
                                                    animate={{ scale: [1, 0.6, 1], opacity: [1, 0.4, 1], rotate: [0, -45, 0] }}
                                                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                                                >✨</motion.div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info Container (Name + Pts) */}
                                <div className={`flex flex-col absolute top-1/2 -translate-y-1/2 w-max 
                                    ${isLeft ? 'right-full mr-4 items-end text-right' : 'left-full ml-4 items-start text-left'}
                                    ${rank.name === 'ProtectMax Titan' ? (isLeft ? 'mr-1' : 'ml-1') : ''} 
                                `}>
                                    {/* Rank Name Badge */}
                                    <div className={`px-2 py-1 sm:px-4 sm:py-1.5 rounded-full border-2 shadow-xl backdrop-blur-md transform transition-all duration-300 ${isUnlocked ? 'bg-white text-rose-600 border-rose-500 rotate-0 scale-100' : 'bg-black/60 text-white/80 border-transparent rotate-0 scale-90'}`}>
                                        <div className={`flex flex-col ${isLeft ? 'items-end' : 'items-start'} leading-tight`}>
                                            <span className={`${rank.name === 'ProtectMax Titan' ? 'text-[9px] sm:text-[10px] leading-3 whitespace-normal' : (rank.name.length >= 10 ? 'text-[10px] sm:text-xs whitespace-nowrap' : 'text-xs sm:text-base whitespace-nowrap')} font-serif font-black uppercase tracking-wide block text-transparent bg-clip-text bg-gradient-to-br from-rose-600 to-red-900 drop-shadow-sm`}>
                                                {rank.name === 'ProtectMax Titan' ? (
                                                    <>ProtectMax<br /><span className="text-[9px] sm:text-[10px]">Titan</span></>
                                                ) : rank.name}
                                            </span>
                                            {/* Tagline */}
                                            <span className="text-[8px] sm:text-[9px] font-medium text-gray-500 italic mt-0.5 whitespace-nowrap">
                                                {rank.desc}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Points Label */}
                                {!isUnlocked && (
                                    <div className="mt-1 text-[10px] font-bold text-white bg-black/40 px-2 rounded-full inline-block backdrop-blur-sm border border-white/10 ml-2">
                                        {rank.threshold.toLocaleString()} pts
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}

                    {/* Traveling Player Avatar */}
                    <motion.div
                        className="absolute w-20 h-20 z-50 pointer-events-none"
                        initial={false}
                        animate={{
                            left: RANKS[visitingRankIndex].position.left,
                            top: RANKS[visitingRankIndex].position.top
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 60,
                            damping: 15,
                            mass: 1
                        }}
                        style={{ x: '-50%', y: '-70%' }}
                    >
                        {/* Avatar Image/Icon */}
                        <div className="relative">
                            <motion.img
                                src="/images/cupid.png"
                                alt="Player Avatar"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="w-full h-full object-contain filter drop-shadow-xl"
                            />
                            {/* Shadow beneath */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-black/40 rounded-full blur-[3px]"></div>
                        </div>
                    </motion.div>
                </div>

                {/* Sell Button - Fixed at Bottom */}
                <div className="px-4 pb-4 mt-auto mb-9 transform scale-90 origin-bottom">

                    {/* Stats HUD - Premium Glassmorphism */}
                    <div className="mt-4 mx-2 relative overflow-hidden rounded-2xl bg-black/40 backdrop-blur-lg border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

                        {/* Progress Bar Background & Fill */}
                        <div className="absolute top-0 left-0 h-1.5 w-full bg-white/5">
                            {(() => {
                                const nextRank = RANKS[currentRankIndex + 1];
                                const currentRankThreshold = RANKS[currentRankIndex]?.threshold || 0;
                                const nextRankThreshold = nextRank?.threshold || (score > 10000 ? score : 10000);
                                const progress = nextRank
                                    ? Math.min(100, Math.max(0, ((score - currentRankThreshold) / (nextRankThreshold - currentRankThreshold)) * 100))
                                    : 100;

                                return (
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-rose-500 via-red-500 to-yellow-400 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ type: "spring", stiffness: 40, damping: 10 }}
                                    />
                                );
                            })()}
                        </div>

                        <div className="flex justify-between items-center p-5 pt-6">
                            {/* Current Score Column */}
                            <div className="flex flex-col relative z-10">
                                <span className="text-[10px] text-rose-200/80 font-bold tracking-[0.2em] uppercase mb-1">Current Hearts</span>
                                <div className="flex items-baseline gap-1.5">
                                    <motion.span
                                        key={score}
                                        initial={{ scale: 1.2, filter: 'brightness(1.5)' }}
                                        animate={{ scale: 1, filter: 'brightness(1)' }}
                                        className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm font-sans"
                                    >
                                        {score.toLocaleString()}
                                    </motion.span>
                                    <span className="text-xs font-bold text-white/40 uppercase">hearts</span>
                                </div>
                            </div>

                            {/* Divider with Heart */}
                            <div className="relative h-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent mx-2">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] opacity-50">❤️</div>
                            </div>

                            {/* Next Target Column */}
                            <div className="flex flex-col items-end relative z-10">
                                {(() => {
                                    const nextRank = RANKS[currentRankIndex + 1];
                                    return nextRank ? (
                                        <>
                                            <span className="text-[10px] text-rose-200/80 font-bold tracking-[0.2em] uppercase mb-1 text-right">Next Love Up</span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-bold text-white drop-shadow-md flex items-center gap-1.5">
                                                    <span className="text-rose-400">{nextRank.emoji}</span>
                                                    {nextRank.name}
                                                </span>
                                                <span className="text-[11px] font-mono font-medium text-rose-400/80 mt-0.5 bg-rose-950/30 px-1.5 py-0.5 rounded">
                                                    -{(nextRank.threshold - score).toLocaleString()} hearts
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <span className="text-yellow-400 text-2xl animate-bounce">👑</span>
                                            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mt-1">Legandary</span>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Decorative Sheen/Glow */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-[50px] pointer-events-none"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-[50px] pointer-events-none"></div>
                    </div>
                </div>

            </div>

            {/* Level Up Overlay */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="text-8xl mb-4"
                        >
                            {currentRank.emoji}
                        </motion.div>
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-600 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] text-center px-4">
                            LEVEL UP!
                        </h2>
                        <p className="text-2xl text-white font-bold mt-2 text-center">
                            You are now a <br />
                            <span className="text-rose-400 text-3xl">{currentRank.name}</span>
                        </p>
                        <p className="text-sm text-white/80 font-serif italic mt-2 text-center px-6">
                            {currentRank.desc}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <ValentineFooter />

            {/* 7. Background Music */}
            <audio ref={audioRef} loop src="/audio track/Surili_Akhiyon_Wale_Instrumental_-_Official_128k.mp3" />



        </div >
    );
}
