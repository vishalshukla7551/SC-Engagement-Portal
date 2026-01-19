'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Store,
    Target,
    X,
    ChevronRight,
    Search,
    MapPin,
    Shield
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- Shared Components (Copied/Adapted for consistency) ---

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
        <svg width={50 * scale} height={60 * scale} viewBox="0 0 50 60" className="drop-shadow-sm" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))' }}>
            <path d="M25 0 L50 30 L25 60 L0 30 Z" fill="currentColor" />
            <path d="M25 0 L25 60" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <path d="M0 30 L50 30" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <path d="M25 60 Q 35 80 25 100" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
        </svg>
    </motion.div>
);

const BattlefieldBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#f5f5f0]">
        {/* Noise Texture - Paper feel */}
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

        {/* Tactical Grid - Dark Lines */}
        <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
        }}></div>

        {/* Radar Sweep Effect - Subtle */}
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] opacity-05"
            style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(255, 100, 0, 0.1) 360deg)',
                borderRadius: '50%'
            }}
        />

        {/* Fog/Smoke - Tricolor Battlefield Vibe */}
        <motion.div
            animate={{ x: [-100, 100, -100], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 w-full h-[600px] bg-gradient-to-t from-green-600/20 to-transparent blur-3xl mix-blend-multiply"
        />
        <motion.div
            animate={{ x: [100, -100, 100], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-orange-500/20 to-transparent blur-3xl mix-blend-multiply"
        />

        {/* Center Blue/White Glow - Chakra Essence */}
        <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-300/20 rounded-full blur-[80px]"
        />

        {/* Dynamic Crosshairs - Dark */}
        <div className="absolute top-10 left-10 w-20 h-20 border-l-2 mb-2 border-t-2 border-slate-400/50"></div>
        <div className="absolute top-10 right-10 w-20 h-20 border-r-2 border-t-2 border-slate-400/50"></div>
        <div className="absolute bottom-10 left-10 w-20 h-20 border-l-2 border-b-2 border-slate-400/50"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border-r-2 border-b-2 border-slate-400/50"></div>
    </div>
);

// --- Mock Data ---

const REGIMENTS = [
    {
        id: 1,
        name: 'Shaurya Regiment',
        region: 'North Zone',
        stores: 42,
        totalSales: '₹1.5 Cr',
        performance: 96,
        color: 'from-orange-500 to-orange-600',
        badge: 'Top Performer'
    },
    {
        id: 2,
        name: 'Uday Regiment',
        region: 'East Zone',
        stores: 35,
        totalSales: '₹85 L',
        performance: 89,
        color: 'from-emerald-500 to-emerald-600',
        badge: 'Rising Star'
    },
    {
        id: 3,
        name: 'Garuda Regiment',
        region: 'West Zone',
        stores: 38,
        totalSales: '₹1.1 Cr',
        performance: 92,
        color: 'from-blue-500 to-blue-600',
        badge: 'High Altitude'
    },
    {
        id: 4,
        name: 'Tejasvi Regiment',
        region: 'South Zone',
        stores: 55,
        totalSales: '₹1.8 Cr',
        performance: 98,
        color: 'from-rose-500 to-rose-600',
        badge: 'Champion'
    },
]

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
                        { color: '#555555', top: 20, delay: 0.1 }, // Darkened smoke for battlefield
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
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-stone-700 transform rotate-90">
                                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                            </svg>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

const StoreListModal = ({ regiment, onClose }: { regiment: any, onClose: () => void }) => {
    // Generate mock stores based on count
    const stores = Array.from({ length: regiment.stores }, (_, i) => ({
        id: i,
        name: `${regiment.name} Store ${String(i + 1).padStart(2, '0')}`,
        sales: `₹${(Math.random() * 5 + 1).toFixed(2)} L`,
        performance: Math.floor(Math.random() * 20 + 80)
    }));

    // Custom Cursor State
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-none" onClick={onClose}>

            {/* Custom Target Cursor */}
            <div
                className="fixed pointer-events-none z-[100] mix-blend-difference"
                style={{
                    left: mousePos.x,
                    top: mousePos.y,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" stroke="#ff4500" strokeWidth="2" strokeDasharray="4 4" className="animate-spin-slow" />
                    <circle cx="20" cy="20" r="4" fill="#ff4500" className="animate-pulse" />
                    <line x1="20" y1="0" x2="20" y2="40" stroke="#ff4500" strokeWidth="1" />
                    <line x1="0" y1="20" x2="40" y2="20" stroke="#ff4500" strokeWidth="1" />
                </svg>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#fafaf5] border-2 border-stone-300 w-full max-w-lg shadow-2xl overflow-hidden max-h-[80vh] flex flex-col relative"
                onClick={e => e.stopPropagation()}
                style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
            >
                {/* Header */}
                <div className={`p-6 bg-gradient-to-r ${regiment.color} text-white relative`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 transition-colors"
                        style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-black uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>{regiment.name}</h2>
                    <div className="flex items-center gap-2 mt-2 opacity-90 text-sm font-mono uppercase">
                        <Store size={14} />
                        <span>{regiment.stores} Stores Online</span>
                    </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto p-4 space-y-3 flex-1 custom-scrollbar">
                    {stores.map((store, i) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={store.id}
                            className="bg-white border border-stone-200 p-4 flex items-center justify-between hover:bg-stone-50 hover:border-orange-500/50 transition-all group cursor-none shadow-sm"
                            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 font-bold text-xs group-hover:text-orange-500 group-hover:border-orange-500/30 transition-colors">
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-800 text-sm uppercase tracking-wide">{store.name}</h4>
                                    <p className="text-xs text-stone-500 font-medium font-mono">Status: <span className="text-emerald-600">ACTIVE ({store.performance}%)</span></p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-stone-400 uppercase font-semibold tracking-wider">Revenue</p>
                                <p className="text-lg font-bold text-stone-800 font-mono">{store.sales}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default function RegimentsPage() {
    const router = useRouter();
    const [selectedRegiment, setSelectedRegiment] = useState<any>(null);

    return (
        <div className="min-h-screen bg-[#f0f0e8] relative overflow-hidden font-sans text-stone-800 pb-20">
            {selectedRegiment && (
                <StoreListModal regiment={selectedRegiment} onClose={() => setSelectedRegiment(null)} />
            )}
            <BattlefieldBackground />
            <JetFlypast />

            {/* Header */}
            <div className="relative z-10 px-4 pt-6 pb-2">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors text-stone-700 border border-stone-300"
                    >
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full shadow-sm border border-stone-300">
                        <IndianFlag size={20} />
                        <span className="text-xs font-bold text-orange-700 tracking-wide uppercase">Republic Day Special</span>
                        <IndianFlag size={20} />
                    </div>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                <div className="text-center mb-8 relative z-20">
                    <h1 className="text-3xl sm:text-5xl font-black text-stone-800 tracking-tight mb-2 uppercase drop-shadow-sm" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}>
                        WARZONE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">REGIMENTS</span>
                    </h1>
                    <p className="text-stone-500 font-bold text-sm sm:text-base max-w-md mx-auto tracking-widest uppercase" style={{ fontFamily: 'Courier New, monospace' }}>
                        &gt;&gt; Mission Critical: Unit Performance Dashboard
                    </p>
                </div>

                {/* Search Bar - Tactical Style */}
                <div className="relative max-w-md mx-auto mb-10">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border-2 border-stone-300/50 rounded-xl leading-5 bg-white/60 backdrop-blur-md text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm shadow-sm transition-all font-mono"
                        placeholder="SEARCH UNITS, ZONES, SECTORS..."
                        style={{ textTransform: 'uppercase' }}
                    />
                </div>

                {/* Regiments Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto">
                    {REGIMENTS.map((regiment, index) => (
                        <motion.div
                            key={regiment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="bg-[#fcfcf9]/95 backdrop-blur-sm border border-stone-300/80 overflow-hidden relative group cursor-pointer hover:border-orange-500 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                        >
                            {/* Decorative Top Border */}
                            <div className={`h-1.5 w-full bg-gradient-to-r ${regiment.color}`} />

                            <div className="p-6 relative">
                                {/* Corner Accents for Tactical Look - Darker for Light Theme */}
                                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-stone-400"></div>
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-stone-400"></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-2.5 rounded bg-white border border-stone-200 text-stone-700 shadow-sm`}>
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <span className="px-2 py-1 bg-white text-orange-700 text-[10px] font-black uppercase tracking-wider border border-orange-200 shadow-sm">
                                        {regiment.badge}
                                    </span>
                                </div>

                                <h3 className="text-xl font-black text-stone-800 mb-1 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>{regiment.name}</h3>
                                <div className="flex items-center text-stone-500 text-xs font-bold mb-6 uppercase tracking-wide">
                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                    {regiment.region}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-stone-100 p-3 border border-stone-200 hover:border-stone-300 transition-colors">
                                        <div className="text-stone-500 text-[10px] font-bold uppercase mb-1">Stores</div>
                                        <div className="text-stone-800 font-bold flex items-center text-lg">
                                            <Store className="w-4 h-4 mr-2 text-blue-600" />
                                            {regiment.stores}
                                        </div>
                                    </div>
                                    <div className="bg-stone-100 p-3 border border-stone-200 hover:border-stone-300 transition-colors">
                                        <div className="text-stone-500 text-[10px] font-bold uppercase mb-1">Total Sales</div>
                                        <div className="text-stone-800 font-bold flex items-center text-lg">
                                            <Target className="w-4 h-4 mr-2 text-emerald-600" />
                                            {regiment.totalSales}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Mission Completion</span>
                                        <span className={`text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r ${regiment.color}`}>
                                            {regiment.performance}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-stone-200 h-1.5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${regiment.performance}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                            className={`h-full bg-gradient-to-r ${regiment.color}`}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setSelectedRegiment(regiment)}
                                        className={`
                                                w-full py-3 font-bold text-xs text-white shadow-lg uppercase tracking-widest
                                                bg-gradient-to-r ${regiment.color}
                                                hover:brightness-110 active:scale-[0.98]
                                                transition-all flex items-center justify-center gap-2
                                                border border-white/20
                                            `}
                                    >
                                        <Store size={14} />
                                        View Stores
                                    </button>
                                </div>
                            </div>

                            {/* Hover Reveal Effect - Warm Shine */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" style={{ transform: 'skewX(-20deg)' }} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
