'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import {
    Trophy,
    Zap,
    Crown,
    Sparkles,
    X,
    Play,
    Pause,
    Share2,
    Star,
    Target,
    Rocket,
    Flame,
    Award,
    Fingerprint,
    Music,
    Repeat,
    Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- VISUAL ASSETS (SVG Shapes) ---

const Shapes = {
    Starburst: ({ className }: { className?: string }) => (
        <svg viewBox="0 0 100 100" className={className}>
            <path d="M50 0 L58 35 L95 25 L70 50 L95 75 L58 65 L50 100 L42 65 L5 75 L30 50 L5 25 L42 35 Z" fill="currentColor" />
        </svg>
    ),
    Squiggle: ({ className }: { className?: string }) => (
        <svg viewBox="0 0 200 50" className={className} preserveAspectRatio="none">
            <path d="M0 25 Q 25 0, 50 25 T 100 25 T 150 25 T 200 25" fill="none" stroke="currentColor" strokeWidth="8" />
        </svg>
    ),
    Blob: ({ className }: { className?: string }) => (
        <svg viewBox="0 0 200 200" className={className}>
            <path d="M41.7,-64.1C54.1,-55.8,64.4,-44.6,71.1,-31.8C77.8,-19,80.9,-4.6,78.2,8.8C75.5,22.2,67,34.6,56.8,44.2C46.6,53.8,34.7,60.6,22.1,64.2C9.5,67.8,-3.8,68.2,-16.2,64.4C-28.6,60.6,-40.1,52.6,-49.9,43C-59.7,33.4,-67.8,22.2,-70.6,9.8C-73.4,-2.6,-70.9,-16.2,-63.3,-27.1C-55.7,-38,-43,-46.2,-30.7,-54.5C-18.4,-62.7,-6.5,-71.1,5.2,-79.1L16.9,-87.2" transform="translate(100 100)" fill="currentColor" />
        </svg>
    ),
    ConcentricArcs: ({ className, color1, color2 }: { className?: string, color1: string, color2: string }) => (
        <svg viewBox="0 0 200 200" className={className}>
            <circle cx="200" cy="0" r="200" fill={color1} />
            <circle cx="200" cy="0" r="160" fill={color2} />
            <circle cx="200" cy="0" r="120" fill={color1} />
            <circle cx="200" cy="0" r="80" fill={color2} />
            <circle cx="200" cy="0" r="40" fill={color1} />
        </svg>
    ),
    GridDots: ({ className }: { className?: string }) => (
        <svg viewBox="0 0 100 100" className={className}>
            <defs>
                <pattern id="dot-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="2" fill="currentColor" />
                </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#dot-pattern)" />
        </svg>
    ),
    TunnelLines: ({ className }: { className?: string }) => (
        <svg viewBox="0 0 100 160" className={className} preserveAspectRatio="none">
            {/* Abstract Tunnel Arcs based on reference */}
            <path d="M-20 0 C 20 60, 80 60, 120 0" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M-10 0 C 25 50, 75 50, 110 0" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M0 0 C 30 40, 70 40, 100 0" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M10 0 C 35 30, 65 30, 90 0" fill="none" stroke="currentColor" strokeWidth="0.5" />

            {/* Bottom Elements */}
            <path d="M-50 150 C 10 130, 30 150, 40 160" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M150 150 C 90 130, 70 150, 60 160" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
    )
};

// --- DATA ---
const USER_DATA = {
    name: "Harshdeep Singh",
    year: 2026,
    totalMissions: 156,
    totalBounty: 124500, // This will be replaced by API data
    longestStreak: 12,
    bestMonth: "OCT",
    bestMonthCount: 45,
    rank: "Sales Commander",
    topRegion: "North",
    regionRank: 7,
    badges: [
        { name: "Century Maker", icon: Star },
        { name: "High Roller", icon: Target },
        { name: "5 Star", icon: Award },
        { name: "Fastest", icon: Rocket },
    ]
};

// --- THEMES ---
// --- PATRIOTIC THEME COMPONENTS ---

const AshokaChakra = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={`animate-spin-slow ${className}`} fill="none" stroke="currentColor" strokeWidth="0.5">
        <circle cx="12" cy="12" r="10" strokeWidth="1" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        {[...Array(24)].map((_, i) => (
            <line
                key={i}
                x1="12" y1="12"
                x2="12" y2="2"
                transform={`rotate(${i * 15} 12 12)`}
                strokeLinecap="round"
            />
        ))}
    </svg>
);

const PatrioticBackground = ({ theme, variant = 'default' }: { theme: any, variant?: 'default' | 'radar' | 'spotlight' | 'regal' | 'rising' | 'cobra' | 'battalion' | 'honor' | 'elite' | 'laser' }) => (
    <div className="absolute inset-0 overflow-hidden bg-[#001233]"> {/* Deep Navy Blue Base */}

        {/* --- COMMON: Camouflage Texture Overlay --- */}
        <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-10 mix-blend-overlay z-0"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            }}
        />

        {/* --- VARIANT: DEFAULT / INTRO --- */}
        {variant === 'default' && (
            <>
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,#FF9933_120deg,transparent_180deg)] animate-spin-slow opacity-30 blur-[100px]" />
                    <div className="absolute bottom-[-50%] right-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_180deg,transparent_0deg,#138808_120deg,transparent_180deg)] animate-spin-slow opacity-30 blur-[100px]" style={{ animationDirection: 'reverse' }} />
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] opacity-5 pointer-events-none">
                    <AshokaChakra className="w-full h-full text-white" />
                </div>
            </>
        )}

        {/* --- VARIANT: RADAR (Stats) --- */}
        {variant === 'radar' && (
            <>
                {/* Grid Lines */}
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
                {/* Radar Sweep */}
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,255,0,0.1)_60deg,rgba(0,255,0,0)_80deg)] animate-spin-slow opacity-50" style={{ animationDuration: '4s' }} />
                {/* Blips */}
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1/3 left-1/4 w-2 h-2 bg-green-500 rounded-full box-shadow-[0_0_10px_#0f0]"
                />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-red-500 rounded-full box-shadow-[0_0_10px_#f00]"
                />
            </>
        )}

        {/* --- VARIANT: SPOTLIGHT (Highlight) --- */}
        {variant === 'spotlight' && (
            <>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80" />
                <div className="absolute top-[-20%] left-1/2 transform -translate-x-1/2 w-[100vh] h-[100vh] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#001233] to-transparent" />
                {/* Moving Beams */}
                <motion.div
                    animate={{ rotate: [-20, 20, -20] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-50%] left-1/2 w-[200px] h-[150vh] bg-gradient-to-b from-white/10 to-transparent blur-xl origin-top transform -translate-x-1/2"
                />
            </>
        )}

        {/* --- VARIANT: REGAL (Rank/Badges) --- */}
        {variant === 'regal' && (
            <>
                {/* Gold Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.8)_100%)]" />
                <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #FFD700 0, #FFD700 1px, transparent 0, transparent 50%)',
                    backgroundSize: '20px 20px'
                }} />
                {/* Slow pulse */}
                <motion.div
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-tr from-[#FF9933]/20 via-transparent to-[#138808]/20"
                />
            </>
        )}

        {/* --- VARIANT: RISING (Leaderboard) --- */}
        {variant === 'rising' && (
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: '110vh', x: Math.random() * 100 + 'vw', opacity: 0, scale: 0.5 }}
                        animate={{ y: '-10vh', opacity: [0, 1, 0], scale: 1 }}
                        transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
                        className="absolute w-px h-20 bg-gradient-to-t from-transparent via-[#FF9933] to-transparent"
                    />
                ))}
            </div>
        )}

        {/* --- VARIANT: COBRA (Outro/Action) --- */}
        {variant === 'cobra' && (
            <>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#001233]" />
                <div className="absolute inset-0 opacity-30">
                    <svg width="100%" height="100%">
                        <pattern id="hex" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                            <path d="M25 0 L50 12.5 L50 37.5 L25 50 L0 37.5 L0 12.5 Z" fill="none" stroke="#FFFFFF" strokeOpacity="0.1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#hex)" />
                    </svg>
                </div>
                {/* Occasional Glitch/Flash */}
                <motion.div
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 5 }}
                    className="absolute inset-0 bg-white mix-blend-overlay"
                />
            </>
        )}

        {/* --- VARIANT: BATTALION (Leaderboard/WarRoom) --- */}
        {variant === 'battalion' && (
            <>
                <div className="absolute inset-0 bg-[#001800] opacity-90 mix-blend-multiply" /> {/* Darker Green Tint */}

                {/* Topographic Lines */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 C 20 20 40 10 50 30 C 60 50 80 40 100 60' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3Cpath d='M0 20 C 30 30 50 20 60 40 C 70 60 90 50 100 80' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`,
                    backgroundSize: '300px 300px'
                }} />

                {/* Crosshairs */}
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '100px 100px'
                }} />

                {/* Rotating Map Target */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 w-[80vh] h-[80vh] border border-white/10 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none"
                >
                    <div className="absolute top-0 w-4 h-4 border-l border-t border-white" />
                    <div className="absolute bottom-0 w-4 h-4 border-r border-b border-white" />
                    <div className="w-[90%] h-[90%] border border-dashed border-white/20 rounded-full" />
                </motion.div>
            </>
        )}

        {/* --- VARIANT: HONOR (Rank) --- */}
        {variant === 'honor' && (
            <>
                {/* Flowing Tricolor Bands */}
                <motion.div
                    animate={{ y: ['-20%', '0%', '-20%'], rotate: [45, 45, 45] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-30 blur-[80px]"
                    style={{ background: 'linear-gradient(180deg, #FF9933 30%, #FFFFFF 50%, #138808 70%)' }}
                />

                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(#FFD700 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

                {/* Central Glow */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] bg-gradient-to-r from-[#FF9933]/20 to-[#138808]/20 blur-[100px] rounded-full" />
            </>
        )}

        {/* --- VARIANT: ELITE (Highlight/Top 5%) --- */}
        {variant === 'elite' && (
            <>
                {/* Intense Dark Base */}
                <div className="absolute inset-0 bg-[#000000] opacity-60" />

                {/* Tricolor Lasers/Beams */}
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 w-[200vw] h-[2px] opacity-50 origin-left"
                        style={{
                            background: i === 0 ? 'linear-gradient(90deg, transparent, #FF9933)' :
                                i === 1 ? 'linear-gradient(90deg, transparent, #FFFFFF)' :
                                    'linear-gradient(90deg, transparent, #138808)'
                        }}
                    />
                ))}

                {/* Explosive Burst Effect */}
                <div className="absolute top-1/2 left-1/2 w-[80vh] h-[80vh] transform -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_60%)] animate-pulse" />


            </>
        )}

        {/* --- VARIANT: LASER (Requested) --- */}
        {variant === 'laser' && (
            <>
                <div className="absolute inset-0 bg-black/80" />
                {/* Vertical Laser Beams */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: '0%', opacity: 0 }}
                        animate={{ height: ['0%', '120%', '120%'], opacity: [0, 0.4, 0] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeOut"
                        }}
                        className={`absolute bottom-0 w-[2px] blur-[1px] ${i % 3 === 0 ? 'bg-orange-500' :
                            i % 3 === 1 ? 'bg-white' : 'bg-green-500'
                            }`}
                        style={{
                            left: `${15 + i * 14}%`,
                            transform: `rotate(${(i - 2.5) * 15}deg)`,
                            transformOrigin: 'bottom center'
                        }}
                    />
                ))}

                {/* Floating Particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={`p-${i}`}
                        animate={{ y: [0, -800], opacity: [0, 1, 0] }}
                        transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
                        className="absolute bottom-0 w-1 h-1 bg-white rounded-full opacity-0"
                        style={{ left: `${Math.random() * 100}%` }}
                    />
                ))}
            </>
        )}

        {/* --- COMMON: Floating Particles (Embers/Dust) - Only on some variants --- */}
        {['default', 'rising', 'spotlight', 'battalion', 'honor', 'elite'].includes(variant) && (
            <div className="absolute inset-0 z-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: '100vh', x: Math.random() * 100 + 'vw', opacity: 0 }}
                        animate={{ y: '-10vh', opacity: [0, 1, 0] }}
                        transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 10, ease: "linear" }}
                        className="absolute w-1 h-1 bg-[#FFD700] rounded-full blur-[1px]"
                    />
                ))}
            </div>
        )}
    </div>
);

// --- UPDATED THEMES TO MATCH PATRIOTIC VIBE ---
const THEMES = [
    {
        id: 'patriotic',
        bg: 'bg-[#001233]', // Navy Blue
        text: 'text-white',
        accent: 'text-[#FF9933]', // Saffron
        shapeFill: 'text-[#138808]', // Green
        bgPattern: 'kinetic'
    }
];

// --- RANK BADGE CONFIGURATION ---
const RANK_CONFIG: any = {
    'Salesveer': {
        gradient: 'from-[#607D8B] to-[#455A64]', // Slate/Grey
        border: 'border-[#607D8B]',
        shadow: 'shadow-slate-900/50',
        icon: Target,
        label: 'Starter'
    },
    'Sales Lieutenant': {
        gradient: 'from-[#CD7F32] to-[#8B4513]', // Bronze
        border: 'border-[#CD7F32]',
        shadow: 'shadow-orange-900/50',
        icon: Award,
        label: 'Bronze'
    },
    'Sales Captain': {
        gradient: 'from-[#E0E0E0] to-[#757575]', // Silver
        border: 'border-[#C0C0C0]',
        shadow: 'shadow-gray-500/50',
        icon: Shield,
        label: 'Silver'
    },
    'Sales Major': {
        gradient: 'from-[#FFD700] to-[#B8860B]', // Gold
        border: 'border-[#FFD700]',
        shadow: 'shadow-yellow-600/50',
        icon: Crown,
        label: 'Gold'
    },
    'Sales Commander': {
        gradient: 'from-[#4169E1] to-[#000080]', // Royal Blue / Platinum
        border: 'border-[#4169E1]',
        shadow: 'shadow-blue-900/50',
        icon: Zap,
        label: 'Platinum'
    },
    'Sales Chief Marshal': {
        gradient: 'from-[#800000] to-[#000000]', // Crimson + Black
        border: 'border-[#FFD700]', // Gold Border
        shadow: 'shadow-red-900/50',
        icon: Star,
        label: 'Crimson'
    },
    'Sales General': {
        gradient: 'from-[#FF00FF] via-[#00FFFF] to-[#FFFF00]', // Master Holographic
        border: 'border-white',
        shadow: 'shadow-purple-500/50',
        icon: Sparkles,
        label: 'Master'
    }
};

// --- BACKGROUND COMPONENTS ---

// New Brutalist Intro Background based on reference
const BrutalistIntroBackground = ({ theme }: { theme: any }) => (
    <div className="absolute inset-0 z-0 bg-[#F2F2F2] overflow-hidden">
        {/* Top Section with Pattern */}
        <div className="absolute top-0 right-0 w-full h-[60%] overflow-hidden">
            {/* Concentric Arcs in Top Right */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="absolute -top-48 -right-20 w-[120%] h-[120%] origin-top-right"
            >
                <Shapes.ConcentricArcs
                    className="w-full h-full"
                    color1="#121212" // Black rings
                    color2="#1ED760" // Green rings
                />
            </motion.div>

            {/* Wavy Line Overlay - Pushed back with lower z-index if needed, but here it's already in background component. 
                The issue is likely the text is not 'above' this background component enough or the background is too high.
                Actually, the text is in the main slide renderer with z-20. The background is z-0.
                However, looking at the image, the wave SHOULD be behind the text. 
                The user says "above curve is hiding Yoddha wrapped text". 
                Ah, "above curve" might mean the Concentric Arcs? Or the Wavy Line?
                The wavy line is at `top-1/2` which cuts through the text area.
                I will lower the opacity significantly or move it slightly to ensure text legibility, 
                and ensure the text has a higher relative Z-index in the parent.
            */}
            <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute top-[55%] left-0 w-full pointer-events-none opacity-20"
            >
                <svg viewBox="0 0 400 100" className="w-[120%] h-24 text-black fill-none stroke-current stroke-[4]" preserveAspectRatio="xMinYMid slice">
                    <path d="M0 50 Q 50 100 100 50 T 200 50 T 300 50 T 400 50" />
                </svg>
            </motion.div>
        </div>

        {/* Bottom Section Solid Block with Overlay Pattern */}
        <div className="absolute bottom-0 left-0 w-full h-[40%] bg-[#121212] overflow-hidden">
            {/* Bottom Right Pattern based on user request */}
            <div className="absolute bottom-0 right-0 w-full h-[120%] overflow-hidden">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                    className="absolute -bottom-10 right-10 w-[100%] h-[100%] origin-bottom-right"
                >
                    <Shapes.ConcentricArcs
                        className="w-full h-full transform rotate-180"
                        color1="#F2F2F2" // White rings
                        color2="#1ED760" // Green rings
                    />
                </motion.div>
            </div>

            {/* Decorative Corner Dots */}
            <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-blue-400 z-20 border-2 border-black" />
            <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-blue-400 z-20 border-2 border-black" />
            <div className="absolute bottom-4 left-4 w-4 h-4 rounded-full bg-blue-400 z-20 border-2 border-white" />
            <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-blue-400 z-20 border-2 border-white" />
        </div>

        {/* Vertical Text Side Bar */}
        <div className="absolute top-0 left-4 h-full flex flex-col justify-center z-10 pointer-events-none mix-blend-difference">
            <div className="text-[15vh] font-black leading-none text-transparent transform -rotate-90 origin-center whitespace-nowrap opacity-50"
                style={{ WebkitTextStroke: '2px #fff' }}>
                2026 WRAPPED
            </div>
        </div>
    </div>
);

const KineticBackground = ({ text, theme }: { text: string, theme: any }) => (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none flex flex-col justify-center select-none">
        {[...Array(8)].map((_, i) => (
            <div key={i} className={`whitespace-nowrap text-[12vh] font-black leading-[0.85] ${theme.text} ${i % 2 === 0 ? 'animate-marquee' : 'animate-marquee-reverse'}`}>
                {Array(6).fill(text).map((t, j) => (
                    <span key={j} className="mx-4">{t}</span>
                ))}
            </div>
        ))}
    </div>
);

const SquiggleLines = ({ theme }: { theme: any }) => (
    <div className="absolute inset-0 overflow-hidden opacity-30">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                animate={{ x: [-100, 0] }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: "linear" }}
                className={`absolute w-[200%] h-24 ${theme.shapeFill}`}
                style={{ top: `${i * 20}%` }}
            >
                <Shapes.Squiggle className="w-full h-full" />
            </motion.div>
        ))}
    </div>
);

const AnimatedNumber = ({ value }: { value: number }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let start = 0;
        const duration = 2000;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = value / steps;

        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setDisplay(value);
                clearInterval(timer);
            } else {
                setDisplay(Math.floor(start));
            }
        }, stepTime);
        return () => clearInterval(timer);
    }, [value]);

    return <span>{display.toLocaleString()}</span>;
};

// --- SLIDE RENDERERS ---

const SlideRenderer = ({ slide, theme, currentPoints, unitsSold, longestStreak, regionData, leaderboardData, rankTitle, userName, hallOfFameData, globalRank, globalStats, onGenerateVideo, isRecording }: { slide: any, theme: any, currentPoints: number, unitsSold: number, longestStreak: number, regionData?: { region: string, rank: number | string, topPercent: number }, leaderboardData?: any[], rankTitle?: string, userName?: string, hallOfFameData?: any[], globalRank?: number | string, globalStats?: { rank: string | number, total: number, percent: number }, onGenerateVideo?: () => void, isRecording?: boolean }) => {
    // Force consistent theme usage
    const pTheme = THEMES[0];

    switch (slide.type) {
        case 'intro':
            return (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-0 z-10 overflow-hidden">
                    <PatrioticBackground theme={pTheme} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                        className="relative z-20 text-center w-full"
                    >
                        {/* Saffron Header */}
                        <div className="bg-[#FF9933] text-black w-full py-4 transform -rotate-2 scale-110 mb-8 border-y-4 border-white shadow-xl relative z-10">
                            <div className="text-xl font-bold tracking-[0.5em] uppercase animate-pulse">Jai Hind</div>
                        </div>

                        <h1 className="font-black leading-[0.85] tracking-tighter mb-6 relative pointer-events-none select-none drop-shadow-2xl">
                            <div className="text-[18vw] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 relative z-30 filter drop-shadow-[0_4px_0_#000]" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)' }}>
                                YODDHA
                            </div>
                            <div className="text-[18vw] text-[#FF9933] relative z-20 -mt-[4vw] mix-blend-normal transform skew-x-12" style={{ textShadow: '4px 4px 0px #000' }}>
                                WRAPPED
                            </div>
                        </h1>
                        <div className="bg-[#138808] text-white inline-block px-8 py-2 font-bold tracking-widest uppercase transform rotate-2 border-2 border-white/50 shadow-lg">
                            Operation 2026 Successful
                        </div>
                    </motion.div>
                </div>
            );

        case 'stats':
            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 relative z-10 text-center">
                    <PatrioticBackground theme={pTheme} variant="radar" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "backOut" }}
                        className="relative z-20 w-full max-w-sm"
                    >
                        <div className="bg-black/80 backdrop-blur-xl border border-[#FF9933]/30 p-8 rounded-3xl relative overflow-hidden group shadow-[0_0_30px_rgba(255,153,51,0.2)]">
                            {/* Scanning Line Effect */}
                            <motion.div
                                animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                                className="absolute left-0 w-full h-[2px] bg-[#138808] z-10 shadow-[0_0_10px_#138808] pointer-events-none"
                            />

                            {/* Tech Grid Overlay */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                            }} />

                            <div className="relative z-20">
                                <h2 className="text-[#FF9933] text-sm font-black uppercase tracking-[0.3em] mb-8 border-b border-white/10 pb-4 flex items-center justify-between">
                                    <span>Your story in numbers</span>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                    </div>
                                </h2>

                                <div className="space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        whileHover={{ scale: 1.05, borderColor: 'rgba(255,153,51,0.5)' }}
                                        className="bg-white/5 rounded-xl p-4 border border-white/5 transition-colors cursor-crosshair relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-1 opacity-20"><Zap className="w-4 h-4" /></div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            Total Points
                                        </div>
                                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FFD700] to-white drop-shadow-sm">
                                            <AnimatedNumber value={currentPoints} />
                                        </div>
                                    </motion.div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                            className="bg-white/5 rounded-xl p-4 border border-white/5 cursor-crosshair"
                                        >
                                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Units Sold</div>
                                            <div className="text-3xl font-black text-white">
                                                <AnimatedNumber value={unitsSold} />
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.8 }}
                                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(19,136,8,0.2)' }}
                                            className="bg-white/5 rounded-xl p-4 border border-white/5 cursor-crosshair"
                                        >
                                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 text-center whitespace-nowrap">longest Streak</div>
                                            <div className="text-3xl font-black text-[#138808] flex items-center justify-center gap-1">
                                                {longestStreak} <span className="text-lg">⚡</span>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            );

        case 'highlight':
            return (
                <div className="w-full h-full p-0 relative z-10 bg-[#001233] overflow-hidden flex flex-col items-center justify-center">
                    <PatrioticBackground theme={pTheme} variant="elite" />

                    <div className="relative z-20 text-center">
                        <div className="w-64 h-80 border-[6px] border-[#FF9933] bg-gradient-to-br from-black via-[#1a1a1a] to-[#001233] backdrop-blur-md relative flex flex-col items-center justify-center p-6 shadow-2xl skew-x-[-6deg]">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                            <div className="text-[#138808] font-black text-6xl mb-2 drop-shadow-md">TOP 5%</div>
                            <div className="text-white text-sm font-bold uppercase tracking-widest mb-4">Elite Commando</div>
                            <div className="w-full h-0.5 bg-white/20 mb-4" />
                            <p className="text-gray-300 text-xs font-mono leading-relaxed">
                                You have outperformed <span className="text-[#FF9933] font-bold">{100 - (regionData?.topPercent || 1)}%</span> of the {regionData?.region || USER_DATA.topRegion} battalion. Your strategic execution was exemplary.
                            </p>

                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-white text-black font-black flex items-center justify-center rounded-full border-4 border-[#138808] transform rotate-12 z-30">
                                #{regionData?.rank || USER_DATA.regionRank}
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'rank': {
            const displayRank = rankTitle || USER_DATA.rank;

            // Logic for Rank Display
            let mainDisplayStr = '';
            let topSubStr = ''; // Above main text
            let bottomDescStr = ''; // Below rank title
            let isPercentage = false;
            let percentageVal = 0;
            let isKeepGoing = false;
            let isGreatStart = false;

            const rLower = displayRank.toLowerCase();

            if (rLower.includes('chief marshal')) {
                isPercentage = true;
                percentageVal = 5;
            } else if (rLower.includes('commander')) {
                isPercentage = true;
                percentageVal = 20;
            } else if (rLower.includes('major')) {
                isPercentage = true;
                percentageVal = 35;
            } else if (rLower.includes('captain')) {
                isPercentage = true;
                percentageVal = 50;
            } else if (rLower.includes('lieutenant')) {
                isKeepGoing = true;
                topSubStr = 'You performed well!';
                mainDisplayStr = 'KEEP GOING!';
                bottomDescStr = 'Push more to rise the ranks next time.';
            } else {
                // Default fallback or Salesveer
                // Assuming 'Salesveer' or 'Cadet' falls here or explicitly check
                // User said "For SALESVEER show GREAT START"
                // We will treat any non-ranked/non-lieutenant as Salesveer/Great Start logic for safety, or check string
                isGreatStart = true;
                mainDisplayStr = 'GREAT START';
                topSubStr = 'Welcome to the battlefield';
                bottomDescStr = 'Push more to rise the ranks next time in Upcoming contests.';
            }

            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 relative z-10 text-center text-white">
                    <PatrioticBackground theme={pTheme} variant="laser" />

                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-20 bg-gradient-to-br from-[#000040] to-black border-2 border-[#FFD700] rounded-3xl p-8 shadow-2xl max-w-sm w-full"
                    >
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-[#FFD700] to-[#B8860B] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.4)]">
                            <Crown className="w-12 h-12 text-black" />
                        </div>

                        {isPercentage ? (
                            <h2 className="text-6xl font-black uppercase tracking-tighter mb-2 text-[#138808] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                TOP<br />{percentageVal}%
                            </h2>
                        ) : (
                            <>
                                {topSubStr && <div className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-2">{topSubStr}</div>}
                                <h2 className="text-5xl font-black uppercase tracking-tighter mb-4 text-[#FF9933] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-tight">
                                    {mainDisplayStr}
                                </h2>
                            </>
                        )}

                        <h1 className="text-xl font-bold uppercase tracking-widest mb-6 text-white border-b border-white/20 pb-4">
                            {displayRank}
                        </h1>

                        <p className="text-sm text-gray-300 font-medium leading-relaxed">
                            {isPercentage ? (
                                <>You have outperformed <span className="text-[#FF9933] font-bold">{100 - percentageVal}%</span> of the entire sales force. Your strategic execution was exemplary.</>
                            ) : (
                                <>{bottomDescStr}</>
                            )}
                        </p>
                    </motion.div>
                </div>
            );
        }

        case 'leaderboard':
            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 relative z-10 text-center">
                    <PatrioticBackground theme={pTheme} variant="battalion" />

                    <div className="relative z-20 bg-white text-black p-8 rounded-sm shadow-[10px_10px_0px_#FF9933] border-4 border-black max-w-sm w-full transform rotate-1">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#000080] text-white px-4 py-1 font-bold text-xs uppercase tracking-widest border-2 border-white">
                            Battalion Rank
                        </div>
                        <div className="text-xl font-bold uppercase mb-4 opacity-50 tracking-widest">{regionData?.region || USER_DATA.topRegion} Region</div>
                        <div className="text-8xl font-black leading-none mb-2 tracking-tighter text-[#001233]">
                            {typeof regionData?.rank === 'number' ? `#${regionData.rank}` : '#NA'}
                        </div>

                        <div className="w-full h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                            <div className="w-[95%] h-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
                        </div>
                    </div>
                </div>
            );

        case 'badges':
            const realRank = rankTitle || USER_DATA.rank;
            const currentRank = RANK_CONFIG[realRank] ? realRank : 'Salesveer';
            const rankKeys = Object.keys(RANK_CONFIG);

            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 relative z-10 bg-[#001233] overflow-hidden">
                    <PatrioticBackground theme={pTheme} variant="regal" />

                    <div className="text-center mb-8 z-20 relative">
                        <h2 className="text-[#FFD700] text-3xl font-black uppercase tracking-[0.2em] mb-2 drop-shadow-md">My Rank</h2>
                        <p className="text-white/50 text-xs font-bold uppercase tracking-widest border-b border-[#FFD700]/30 pb-2 inline-block">Official Identification</p>
                    </div>

                    {/* Main Active Badge (ID Card Style) */}
                    <motion.div
                        initial={{ scale: 0.8, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        transition={{ type: "spring", duration: 1.2, bounce: 0.4 }}
                        className="relative z-30 mb-12"
                    >
                        {/* ID Card Container */}
                        <div className={`w-72 h-[26rem] rounded-xl bg-[#0a0a0a] border-[1px] border-[#FFD700] relative overflow-hidden flex flex-col items-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]`}>
                            {/* Header Strip - Tricolor */}
                            <div className={`w-full h-28 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] flex items-center justify-center pt-2`}>
                            </div>

                            {/* Avatar Circle */}
                            <div className={`w-28 h-28 rounded-full border-[3px] border-[#FFD700] bg-zinc-900 -mt-14 z-10 flex items-center justify-center shadow-2xl relative overflow-visible`}>
                                {/* Round Mask for Content */}
                                <div className="absolute inset-0 rounded-full overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black" />
                                </div>

                                <div className="text-4xl font-black text-white select-none relative z-10 tracking-tighter">
                                    {(userName || USER_DATA.name).split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                </div>
                                {/* Rank Icon Badge on Avatar - Overlapping */}
                                {(() => {
                                    const Icon = RANK_CONFIG[currentRank].icon;
                                    return (
                                        <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9933] to-[#FFD700] flex items-center justify-center border-4 border-black shadow-lg z-20`}>
                                            <Icon size={20} className="text-white" />
                                        </div>
                                    )
                                })()}
                            </div>

                            {/* Text Details */}
                            <div className="flex-1 w-full p-6 flex flex-col items-center text-center">
                                <h1 className="text-2xl font-black text-white uppercase leading-none mb-1 tracking-tight">
                                    {currentRank}
                                </h1>
                                <div className={`text-xs font-bold uppercase tracking-widest text-[#FFD700] mb-4`}>
                                    {RANK_CONFIG[currentRank].label} Tier
                                </div>

                                {/* Stats Grid on Card */}
                                <div className="w-full grid grid-cols-2 gap-2 mt-auto">
                                    <div className="bg-[#121212] rounded-sm p-2 border border-white/5">
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase">Points</div>
                                        <div className="text-lg font-black text-white">
                                            {currentPoints >= 1000 ? (currentPoints / 1000).toFixed(1) + 'k' : currentPoints}
                                        </div>
                                    </div>
                                    <div className="bg-[#121212] rounded-sm p-2 border border-white/5">
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase">Rank</div>
                                        <div className="text-lg font-black text-white">#{globalRank || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Holographic/Texture Overlay */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        </div>
                    </motion.div>

                    {/* Comparison Row (Other Ranks) */}
                    <div className="w-full flex items-center justify-center gap-2 px-4 relative z-20 overflow-x-auto no-scrollbar mask-linear-fade">
                        {rankKeys.map((rank, i) => {
                            const isActive = rank === currentRank;
                            const Style = RANK_CONFIG[rank];
                            const Icon = Style.icon;

                            return (
                                <motion.div
                                    key={rank}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: isActive ? 1 : 0.4, y: 0, scale: isActive ? 1.1 : 0.9 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className={`flex flex-col items-center min-w-[60px] ${isActive ? 'grayscale-0' : 'grayscale'}`}
                                >
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${Style.gradient} flex items-center justify-center shadow-lg border-2 ${isActive ? 'border-[#FFD700]' : 'border-transparent'}`}>
                                        <Icon size={20} className="text-white" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            );

        case 'hall-of-fame':
            const surroundingPeers = (hallOfFameData && hallOfFameData.length > 0) ? hallOfFameData : (leaderboardData && leaderboardData.length > 0) ? leaderboardData : [
                { rank: USER_DATA.regionRank - 2, name: "Vikram Malhotra", points: "12.8k" },
                { rank: USER_DATA.regionRank - 1, name: "Aditi Sharma", points: "12.6k" },
                { rank: USER_DATA.regionRank, name: USER_DATA.name, points: "12.5k", isUser: true }, // The User
                { rank: USER_DATA.regionRank + 1, name: "Rohan Gupta", points: "12.2k" },
                { rank: USER_DATA.regionRank + 2, name: "Sneha Patel", points: "11.9k" },
            ];

            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 relative z-10 bg-[#001233] overflow-hidden">
                    <PatrioticBackground theme={pTheme} variant="spotlight" />

                    <div className="text-center mb-8 relative z-20">
                        <div className="inline-block bg-[#138808] text-white px-6 py-2 transform -rotate-1 font-black uppercase tracking-widest text-xl border-2 border-[#FF9933] shadow-[4px_4px_0px_#000]">
                            Hall of Fame
                        </div>
                    </div>

                    <div className="w-full max-w-sm relative z-20">
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="flex flex-col gap-3"
                        >
                            {surroundingPeers.map((peer, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: peer.isUser ? 1 : 0.6 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`flex items-center justify-between p-4 rounded-lg border ${peer.isUser
                                        ? 'bg-gradient-to-r from-[#1a1a1a] to-black text-[#FFD700] border-[#FFD700] scale-105 shadow-xl z-20'
                                        : 'bg-white/10 text-white border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`font-black text-xl ${peer.isUser ? 'text-[#FF9933]' : 'text-gray-500'}`}>
                                            #{peer.rank}
                                        </div>
                                        <div className="font-bold uppercase tracking-tight">
                                            {peer.name}
                                        </div>
                                    </div>
                                    <div className="font-mono font-bold opacity-80">
                                        {peer.points}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            );

        case 'outro': {
            const handleShare = async () => {
                const shareText = `🇮🇳 MISSION ACCOMPLISHED!\n\nI just secured the rank of *${rankTitle || 'Soldier'}* in the Yoddha 2026 Republic Day Challenge!\n\n🏆 Points: ${currentPoints}\n🏅 Region Rank: #${regionData?.rank || '-'}\n🌍 Top ${regionData?.topPercent || 1}% of ${regionData?.region || 'Battalion'}\n\nCan you beat my score? #Yoddha2026 #RepublicDay`;

                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: 'Yoddha 2026 Achievement',
                            text: shareText,
                            url: window.location.href
                        });
                    } catch (err) {
                        console.log('Share canceled');
                    }
                } else {
                    navigator.clipboard.writeText(shareText);
                    alert('Achievement copied to clipboard! Share it with your squad.');
                }
            };

            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 relative z-10 text-center">
                    <PatrioticBackground theme={pTheme} variant="cobra" />

                    <div className="mb-12 relative z-20">
                        <h1 className={`text-6xl font-black uppercase text-white drop-shadow-xl tracking-tighter`}>Mission<br /><span className="text-[#FF9933]">Completed</span></h1>
                        <p className="text-white/60 font-bold tracking-widest mt-2 uppercase">See You In Next Contest</p>
                    </div>

                    <div className="w-full max-w-xs space-y-4 relative z-20">
                        <button
                            onClick={onGenerateVideo}
                            disabled={isRecording}
                            className={`w-full py-4 ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-[#138808]'} text-white font-black uppercase rounded-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg`}
                        >
                            {isRecording ? 'Recording in Progress...' : 'Generate Video Reel'} <Play className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleShare}
                            className="w-full py-4 bg-[#FF9933] text-black font-black uppercase rounded-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg"
                        >
                            Share Stats (Text) <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-transparent text-white border-2 border-white/30 font-black uppercase rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Replay Briefing
                        </button>
                    </div>
                </div>
            );
        }

        default:
            return null;
    }
};

const slides = [
    { type: 'intro', themeId: 'toxic', duration: 4000 },
    { type: 'stats', themeId: 'heat', duration: 6000 },

    { type: 'rank', themeId: 'candy', duration: 6000 },
    { type: 'leaderboard', themeId: 'toxic', duration: 5000 },
    { type: 'badges', themeId: 'heat', duration: 6000 },
    { type: 'hall-of-fame', themeId: 'heat', duration: 5000 },
    { type: 'outro', themeId: 'midnight', duration: 8000 },
];

export default function YoddhaVideoPage() {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [currentPoints, setCurrentPoints] = useState(USER_DATA.totalBounty);
    const [unitsSold, setUnitsSold] = useState(USER_DATA.totalMissions);
    const [longestStreak, setLongestStreak] = useState(USER_DATA.longestStreak);
    const [rankTitle, setRankTitle] = useState(USER_DATA.rank);
    const [userName, setUserName] = useState(USER_DATA.name);
    const [regionData, setRegionData] = useState<{ region: string, rank: number | string, topPercent: number }>({
        region: USER_DATA.topRegion,
        rank: USER_DATA.regionRank,
        topPercent: 1
    });
    const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
    const [hallOfFameData, setHallOfFameData] = useState<any[]>([]);
    const [globalRank, setGlobalRank] = useState<number | string>('-');
    const [globalStats, setGlobalStats] = useState({ rank: '-' as string | number, total: 0, percent: 100 });

    // Video Generation Logic
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const handleStartVideoGeneration = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { displaySurface: 'browser' },
                audio: true, // Capture audio if available
                preferCurrentTab: true // Experimental hint
            } as any);

            // Determine mimeType
            const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
                ? 'video/webm; codecs=vp9'
                : 'video/webm';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const file = new File([blob], 'yoddha_stats_2026.webm', { type: 'video/webm' });

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
                setIsRecording(false);

                // Share
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Yoddha 2026 Stats',
                            text: 'Check out my Year in Review!'
                        });
                    } catch (err) {
                        console.error('Share failed', err);
                    }
                } else {
                    // Fallback to download
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'yoddha_stats_2026.webm';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            };

            // Start Recording
            mediaRecorder.start();
            setIsRecording(true);

            // Reset to beginning
            setCurrentSlide(0);
            setIsPaused(false);

        } catch (err) {
            console.error("Error starting screen capture:", err);
            alert("Could not start screen recording. Please permit screen sharing.");
        }
    };

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    useEffect(() => {
        const fetchCurrentPoints = async () => {
            let myName = USER_DATA.name;
            let myRegion = USER_DATA.topRegion;

            try {
                // 1. Fetch Personal Data
                const heroResponse = await fetch('/api/sec/republic-hero');
                if (heroResponse.ok) {
                    const result = await heroResponse.json();
                    if (result.success && result.data) {
                        myName = result.data.name;
                        myRegion = result.data.region || myRegion;

                        setUserName(result.data.name);
                        setCurrentPoints(result.data.totalSales);
                        setUnitsSold(result.data.salesCount);
                        setLongestStreak(result.data.longestStreak);
                        setRankTitle(result.data.rankTitle || USER_DATA.rank);

                        // Initial fallback region data
                        setRegionData({
                            region: myRegion,
                            rank: result.data.regionRank || 'NA',
                            topPercent: 1
                        });
                        setLeaderboardData(result.data.surroundingPeers || []);
                    }
                }

                // 2. Fetch Global Hall of Fame Data
                const hofResponse = await fetch('/api/sec/republic-day-leaderboard');
                if (hofResponse.ok) {
                    const hofResult = await hofResponse.json();
                    if (hofResult.success && hofResult.leaderboards) {
                        const rankOrder = ['brigadier', 'colonel', 'major', 'captain', 'lieutenant', 'cadet'];
                        let allTopUsers: any[] = [];

                        rankOrder.forEach(rankKey => {
                            if (hofResult.leaderboards[rankKey]) {
                                allTopUsers = [...allTopUsers, ...hofResult.leaderboards[rankKey]];
                            }
                        });

                        // Calculate Global Rank
                        const myIndex = allTopUsers.findIndex((u: any) => u.name === myName);
                        let calculatedGlobalRank: number | string = '-';
                        if (myIndex !== -1) {
                            calculatedGlobalRank = myIndex + 1;
                            setGlobalRank(calculatedGlobalRank);
                        }

                        // Calculate Global Stats
                        const totalParticipants = allTopUsers.length;
                        const globalTopPercent = myIndex !== -1
                            ? Math.ceil(((myIndex + 1) / totalParticipants) * 100)
                            : 100;

                        setGlobalStats({
                            rank: calculatedGlobalRank,
                            total: totalParticipants,
                            percent: globalTopPercent
                        });

                        // Take top 5
                        setHallOfFameData(allTopUsers.slice(0, 5).map((u: any, i: number) => ({
                            rank: i + 1,
                            name: u.name,
                            points: u.salesAmount >= 1000 ? (u.salesAmount / 1000).toFixed(1) + 'k' : u.salesAmount,
                            isUser: u.name === myName
                        })));
                    }
                }

                // 3. Fetch Regiments Data for Accurate Zone Rank
                const regResponse = await fetch('/api/sec/regiments');
                if (regResponse.ok) {
                    const regResult = await regResponse.json();
                    if (regResult.success && regResult.personnel) {
                        // Aggregate users for myRegion
                        let zoneUsers: any[] = [];
                        // regResult.personnel is grouped by Rank Title (e.g. "Sales Captain")
                        Object.keys(regResult.personnel).forEach(rankKey => {
                            if (regResult.personnel[rankKey][myRegion]) {
                                zoneUsers = [...zoneUsers, ...regResult.personnel[rankKey][myRegion]];
                            }
                        });

                        // Sort by totalSales desc
                        zoneUsers.sort((a: any, b: any) => b.totalSales - a.totalSales);

                        // Find my Rank
                        const myZoneIndex = zoneUsers.findIndex((u: any) => u.fullName === myName);
                        if (myZoneIndex !== -1) {
                            const exactZoneRank = myZoneIndex + 1;
                            const totalZoneParticipants = zoneUsers.length;
                            const exactZonePercent = Math.ceil((exactZoneRank / totalZoneParticipants) * 100);

                            // Update Region Data with accurate calculation
                            setRegionData({
                                region: myRegion,
                                rank: exactZoneRank,
                                topPercent: exactZonePercent
                            });
                        }
                    }
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchCurrentPoints();
    }, []);

    const activeSlide = slides[currentSlide] || slides[0];
    const theme = THEMES.find(t => t.id === activeSlide?.themeId) || THEMES[0];

    // Auto-advance logic
    const nextSlide = useCallback(() => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            // End of slideshow
            // If we are recording, stop it now
            if (isRecording) {
                handleStopRecording();
            }
        }
    }, [currentSlide, isRecording, handleStopRecording]);

    const prevSlide = useCallback(() => {
        if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
    }, [currentSlide]);

    const [progress, setProgress] = useState(0);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        setProgress(0);
        lastTimeRef.current = 0;
    }, [currentSlide]);

    useEffect(() => {
        let frameId: number;
        const animate = (time: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = time;
            const delta = time - lastTimeRef.current;
            lastTimeRef.current = time;

            if (!isPaused) {
                setProgress(p => {
                    const next = p + (delta / activeSlide.duration) * 100;
                    if (next >= 100) {
                        nextSlide();
                        return 100;
                    }
                    return next;
                });
            }
            frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [isPaused, activeSlide.duration, nextSlide]);

    return (
        <div
            className={`fixed inset-0 overflow-hidden font-sans transition-colors duration-700 ease-in-out ${theme.bg}`}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            <div className="absolute top-0 left-0 w-full z-50 p-2 pt-safe flex gap-1">
                {slides.map((_, i) => (
                    <div key={i} className="h-1 flex-1 bg-black/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-100 ease-linear"
                            style={{
                                width: i < currentSlide ? '100%' : i === currentSlide ? `${progress}%` : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={() => router.back()}
                className="absolute top-8 right-4 z-50 text-white/50 hover:text-white"
            >
                <X />
            </button>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full relative"
                >
                    <SlideRenderer
                        slide={activeSlide}
                        theme={theme}
                        currentPoints={currentPoints}
                        unitsSold={unitsSold}
                        longestStreak={longestStreak}
                        regionData={regionData}
                        leaderboardData={leaderboardData}
                        rankTitle={rankTitle}
                        userName={userName}
                        hallOfFameData={hallOfFameData}
                        globalRank={globalRank}
                        globalStats={globalStats}
                        onGenerateVideo={handleStartVideoGeneration}
                        isRecording={isRecording}
                    />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 z-40 flex">
                <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); prevSlide(); }} />
                <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); setIsPaused(p => !p); }} />
                <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); nextSlide(); }} />
            </div>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee { animation: marquee 20s linear infinite; }
                .animate-marquee-reverse { animation: marquee 20s linear infinite reverse; }
                .animate-spin-slow { animation: spin 12s linear infinite; }
            `}</style>
        </div>
    );
}
