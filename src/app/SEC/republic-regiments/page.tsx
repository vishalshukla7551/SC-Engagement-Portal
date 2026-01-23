'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronRight,
    Search,
    Target,
    Shield,
    Star,
    Award,
    X,
    User,
    Store,
    Compass,
    Crown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import RepublicFooter from '@/components/RepublicFooter';

// --- Shared Components ---

const IndianFlag = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={(size * 2) / 3} viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-sm rounded-[1px]">
        <rect width="30" height="20" fill="white" />
        <rect width="30" height="6.66" fill="#FF9933" />
        <rect y="13.33" width="30" height="6.67" fill="#138808" />
        <circle cx="15" cy="10" r="3" stroke="#000080" strokeWidth="1" />
        <path d="M15 10L15 7M15 10L15 13M15 10L18 10M15 10L12 10M15 10L17.12 7.88M15 10L12.88 12.12M15 10L17.12 12.12M15 10L12.88 7.88" stroke="#000080" strokeWidth="0.5" />
    </svg>
);

const TacticalCompass = () => (
    <div className="flex flex-col items-center justify-center pt-2 pb-12 md:hidden pointer-events-none select-none opacity-80">
        <div className="relative w-64 h-64 flex items-center justify-center">

            {/* Outer Ring */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-stone-400">
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 1" />

                {/* Static Ticks */}
                {Array.from({ length: 4 }).map((_, i) => (
                    <line
                        key={i}
                        x1="50" y1="2"
                        x2="50" y2="8"
                        transform={`rotate(${i * 90} 50 50)`}
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                ))}
            </svg>

            {/* Rotating Inner Component */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="w-full h-full relative"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full text-stone-500">
                    {/* Inner Geometric Design */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                    <path d="M50 15 L50 85 M15 50 L85 50" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />

                    {/* Needle Shape */}
                    <path d="M50 20 L55 50 L50 80 L45 50 Z" fill="currentColor" opacity="0.8" />
                    <circle cx="50" cy="50" r="2" fill="#f5f5f0" stroke="currentColor" strokeWidth="1" />
                </svg>
            </motion.div>

            {/* Labels */}
            <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-stone-500">
                <span className="absolute top-4 text-lg">N</span>
                <span className="absolute bottom-4 text-lg">S</span>
                <span className="absolute left-4 text-lg">W</span>
                <span className="absolute right-4 text-lg">E</span>
            </div>
        </div>
    </div>
);

const BattlefieldBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#f5f5f0]">
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

        {/* Tactical Grid */}
        <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
        }}></div>

        {/* Fog/Smoke */}
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

        {/* Center Glow */}
        <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-300/20 rounded-full blur-[80px]"
        />

        {/* Crosshairs */}
        <div className="absolute top-10 left-10 w-20 h-20 border-l-2 mb-2 border-t-2 border-slate-400/50"></div>
        <div className="absolute top-10 right-10 w-20 h-20 border-r-2 border-t-2 border-slate-400/50"></div>
        <div className="absolute bottom-10 left-10 w-20 h-20 border-l-2 border-b-2 border-slate-400/50"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border-r-2 border-b-2 border-slate-400/50"></div>
    </div>
);

const JetFlypast = () => {
    return (
        <div className="absolute top-20 left-0 w-full h-40 z-0 pointer-events-none overflow-hidden" style={{ willChange: 'transform', backfaceVisibility: 'hidden', transform: 'translate3d(0,0,0)' }}>
            <motion.div
                initial={{ x: '-20vw' }}
                animate={{ x: '120vw' }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
                className="relative w-full h-full transform-gpu"
            >
                <div className="absolute top-0 left-0 flex flex-col gap-1 not-rotate">
                    {[
                        { color: '#FF9933', top: 0 },
                        { color: '#555555', top: 20 },
                        { color: '#138808', top: 40 }
                    ].map((jet, i) => (
                        <div key={i} className="flex items-center" style={{ marginLeft: i === 1 ? '20px' : '0px' }}>
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 200, opacity: [0, 0.8, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ backgroundColor: jet.color, boxShadow: `0 0 10px ${jet.color}` }}
                                className="h-1 rounded-full mr-1"
                            />
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

// --- Mock Data (will be replaced with real data) ---

const REGIMENTS = [
    { id: 'NORTH', label: 'NORTH REGIMENT', shortLabel: 'N', color: 'text-orange-600' },
    { id: 'SOUTH', label: 'SOUTH REGIMENT', shortLabel: 'S', color: 'text-blue-600' },
    { id: 'WEST', label: 'WEST REGIMENT', shortLabel: 'W', color: 'text-stone-600' },
    { id: 'EAST', label: 'EAST REGIMENT', shortLabel: 'E', color: 'text-emerald-600' }
];

const RANKS = [
    { title: 'Sales General', shortTitle: 'General', icon: Crown },
    { title: 'Sales Chief Marshal', shortTitle: 'Chief Marshal', icon: Star },
    { title: 'Sales Commander', shortTitle: 'Commander', icon: Target },
    { title: 'Sales Major', shortTitle: 'Major', icon: Shield },
    { title: 'Sales Captain', shortTitle: 'Captain', icon: Target },
    { title: 'Sales Lieutenant', shortTitle: 'Lieutenant', icon: Star },
    { title: 'Sales Veer', shortTitle: 'Sales Veer', icon: Shield }
];

// --- Mock Names for Detail View ---
const NAMES = ["Vikram Singh", "Aditi Rao", "Rohan Gupta", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Rahul Verma", "Kavita Das", "Arjun Nair", "Pooja Mehta", "Suresh Raina", "Deepak Hooda", "Manish Pandey", "Hardik Pandya"];
const STORES = ["Reliance Digital - MG Road", "Croma - Sector 18", "Vijay Sales - Mall of India", "Sargam Electronics - Dwarka", "DigiWorld - CP", "Girias - Indiranagar", "Adishwar - Jayanagar", "Viveks - T Nagar"];

const PersonnelListModal = ({ data, onClose }: { data: any, onClose: () => void }) => {
    const personnel = data.personnel || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white border-2 border-stone-300 w-full max-w-md shadow-2xl overflow-hidden max-h-[70vh] flex flex-col rounded-xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 bg-stone-100 border-b border-stone-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black uppercase text-stone-800 tracking-tight">{data.rank}</h3>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">{data.regiment}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-lg transition-colors text-stone-500">
                        <X size={20} />
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto p-2 space-y-2 flex-1 bg-stone-50/50">
                    {personnel.length === 0 ? (
                        <div className="text-center py-8 text-stone-400">
                            <p className="text-sm font-bold">No personnel in this category</p>
                        </div>
                    ) : (
                        personnel.map((person: any, i: number) => (
                            <div key={i} className="bg-white border border-stone-200 p-3 rounded-lg flex items-center justify-between shadow-sm hover:border-orange-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-stone-700 text-sm">{person.fullName}</p>
                                        <p className="text-[10px] text-stone-400 font-mono uppercase">{person.employeeId || person.phone}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1.5 bg-stone-50 px-2 py-1 rounded border border-stone-100">
                                        <Store size={10} className="text-stone-400" />
                                        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-tight max-w-[120px] truncate">{person.storeName}</span>
                                    </div>
                                    <span className="text-[9px] text-stone-400">{person.city}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 bg-stone-100 border-t border-stone-200 text-center">
                    <p className="text-[10px] text-stone-400 font-mono uppercase">CONFIDENTIAL PERSONNEL LIST • {personnel.length} TOTAL</p>
                </div>
            </motion.div>
        </div>
    );
};

export default function RegimentsPage() {
    const router = useRouter();
    const [selectedCell, setSelectedCell] = useState<any>(null);
    const [matrixData, setMatrixData] = useState<any[]>([]);
    const [personnelData, setPersonnelData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data from API
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/sec/regiments');
                const data = await response.json();

                if (data.success) {
                    // Transform matrix data for display
                    const transformedData = RANKS.map(rank => ({
                        rank: rank.title,
                        shortRank: rank.shortTitle,
                        icon: rank.icon,
                        counts: {
                            NORTH: data.matrix[rank.title]?.NORTH || 0,
                            SOUTH: data.matrix[rank.title]?.SOUTH || 0,
                            WEST: data.matrix[rank.title]?.WEST || 0,
                            EAST: data.matrix[rank.title]?.EAST || 0,
                        }
                    }));

                    setMatrixData(transformedData);
                    setPersonnelData(data.personnel);
                } else {
                    setError(data.error || 'Failed to fetch data');
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-[#f0f0e8] relative overflow-hidden font-sans text-stone-800 pb-20">
            {selectedCell && (
                <PersonnelListModal data={selectedCell} onClose={() => setSelectedCell(null)} />
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
                    <div className="w-10" />
                </div>

                <div className="text-center mb-8 relative z-20">
                    <h1 className="text-3xl sm:text-5xl font-black text-stone-800 tracking-tight mb-2 uppercase drop-shadow-sm" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}>
                        WARZONE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">REGIMENTS</span>
                    </h1>
                    <p className="text-stone-500 font-bold text-sm sm:text-base max-w-md mx-auto tracking-widest uppercase" style={{ fontFamily: 'Courier New, monospace' }}>
                        &gt;&gt; Mission Critical: Unit Performance Dashboard
                    </p>
                </div>


                {/* Main Content Area - Responsive Table */}
                <div className="max-w-6xl mx-auto overflow-hidden rounded-xl border-2 border-stone-300 shadow-xl bg-white/80 backdrop-blur-sm relative mb-4 md:mb-20">

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-200/50 border-b-2 border-stone-300">
                                    <th className="p-3 sm:p-6 text-[10px] sm:text-sm font-black text-stone-600 uppercase tracking-widest text-center">Rank</th>
                                    {REGIMENTS.map(regiment => (
                                        <th key={regiment.id} className={`p-2 sm:p-4 text-[10px] sm:text-sm font-black uppercase tracking-wider text-center border-l border-stone-300 ${regiment.color}`}>
                                            {regiment.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-stone-400">
                                            <p className="text-sm font-bold">Loading regiment data...</p>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-red-500">
                                            <p className="text-sm font-bold">Error: {error}</p>
                                        </td>
                                    </tr>
                                ) : matrixData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-stone-400">
                                            <p className="text-sm font-bold">No data available</p>
                                        </td>
                                    </tr>
                                ) : (
                                    matrixData.map((row: any, index: number) => (
                                        <motion.tr
                                            key={row.rank}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="border-b border-stone-200 hover:bg-stone-50/80 transition-colors group"
                                        >
                                            <td className="p-4 sm:p-4 pl-4 sm:pl-8 border-r border-stone-300 bg-stone-100/30">
                                                <div className="flex items-center gap-2 sm:gap-4">
                                                    <div className={`p-1.5 sm:p-2 rounded-lg bg-white border border-stone-200 text-stone-400 group-hover:text-orange-600 group-hover:border-orange-200 transition-all shadow-sm hidden sm:block`}>
                                                        <row.icon size={18} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-stone-700 uppercase tracking-tight text-[10px] sm:text-sm font-poppins hidden sm:block">{row.rank}</span>
                                                        {/* Mobile Short Rank */}
                                                        <span className="font-bold text-stone-700 uppercase tracking-tight text-xs sm:text-sm font-poppins sm:hidden">{row.shortRank}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Counts with Clickable Modal */}
                                            {['NORTH', 'SOUTH', 'WEST', 'EAST'].map((zoneId) => {
                                                const count = (row.counts as any)[zoneId];
                                                const regimentLabel = REGIMENTS.find(r => r.id === zoneId)?.label;
                                                const personnel = personnelData[row.rank]?.[zoneId] || [];

                                                // Hover color
                                                const hoverColor = zoneId === 'NORTH' ? 'group-hover:text-orange-600' :
                                                    zoneId === 'SOUTH' ? 'group-hover:text-blue-600' :
                                                        zoneId === 'EAST' ? 'group-hover:text-emerald-600' : 'group-hover:text-stone-800';

                                                return (
                                                    <td
                                                        key={zoneId}
                                                        className="p-4 sm:p-4 text-center border-r border-stone-200 bg-white/50 cursor-pointer hover:bg-white transition-all relative overflow-hidden"
                                                        onClick={() => setSelectedCell({ rank: row.rank, regiment: regimentLabel, count: count, personnel: personnel })}
                                                    >
                                                        <div className="flex items-center justify-center gap-1 group/cell relative z-10">
                                                            <span className={`font-mono text-base sm:text-lg font-bold text-stone-600 ${hoverColor} transition-colors`}>{count}</span>
                                                            <ChevronRight size={14} className="text-stone-300 group-hover/cell:text-stone-400 transition-all opacity-0 group-hover/cell:opacity-100 group-hover/cell:translate-x-1 hidden sm:block" />
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tactical Compass (Mobile decorative filler) */}
                <TacticalCompass />

            </div>
            <RepublicFooter />
        </div>
    );
}
