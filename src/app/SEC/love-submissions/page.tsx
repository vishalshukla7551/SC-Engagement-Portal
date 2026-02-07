"use client";

import React, { useEffect, useState } from "react";
import ValentineHeader from "@/components/ValentineHeader";
import ValentineFooter from "@/components/ValentineFooter";
import { motion, AnimatePresence } from "framer-motion";

type Submission = {
    id: string;
    imei: string;
    Date_of_sale: string;
    createdAt: string;
    spotincentivepaidAt: string | null;
    plan: {
        planType: string;
        price: number;
    };
    samsungSKU: {
        ModelName: string;
        Category: string;
    };
};

const HeartIcon = ({ size = 20 }: { size?: number }) => (
    <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ fontSize: size }}
        className="inline-block"
    >
        ❤️
    </motion.span>
);

export default function LoveSubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [verifiedCount, setVerifiedCount] = useState(0);
    const [unverifiedCount, setUnverifiedCount] = useState(0);
    const [verifiedSalesTotal, setVerifiedSalesTotal] = useState(0);
    const [bonusAmount, setBonusAmount] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [hasProtectMaxBonus, setHasProtectMaxBonus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    useEffect(() => {
        async function fetchSubmissions() {
            try {
                const res = await fetch("/api/user/sales-submissions");
                if (!res.ok) throw new Error("Failed to fetch data");
                const data = await res.json();
                setSubmissions(data.submissions);
                setVerifiedCount(data.verifiedCount);
                setUnverifiedCount(data.unverifiedCount);
                setVerifiedSalesTotal(data.verifiedSalesTotal);
                setBonusAmount(data.bonusAmount);
                setTotalPoints(data.totalPoints);
                setHasProtectMaxBonus(data.hasProtectMaxBonus || false);
            } catch (err) {
                setError("Could not load submissions");
            } finally {
                setLoading(false);
            }
        }
        fetchSubmissions();
    }, []);

    const mapping = {
        SCREEN_PROTECT_1_YR: "Screen Protect 1 Yr",
        SCREEN_PROTECT_2_YR: "Screen Protect 2 Yr",
        ADLD_1_YR: "ADLD 1 Yr",
        COMBO_2_YRS: "Combo 2 Yrs",
        EXTENDED_WARRANTY_1_YR: "Extended Warranty 1 Yr",
        TEST_PLAN: "Test Plan",
    };

    const shortMapping = {
        SCREEN_PROTECT_1_YR: "SP 1Y",
        SCREEN_PROTECT_2_YR: "SP 2Y",
        ADLD_1_YR: "ADLD 1Y",
        COMBO_2_YRS: "Combo 2Y",
        EXTENDED_WARRANTY_1_YR: "EW 1Y",
        TEST_PLAN: "Test",
    };

    const filteredSubmissions = selectedDate
        ? submissions.filter(s => {
            const dateStr = new Date(s.Date_of_sale || s.createdAt).toISOString().split('T')[0];
            return dateStr === selectedDate;
        })
        : submissions;

    const counts = filteredSubmissions.reduce((acc, curr) => {
        const type = curr.plan?.planType || "Unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const hasSalesToday = filteredSubmissions.some(s => {
        const today = new Date().toISOString().split('T')[0];
        const saleDate = new Date(s.Date_of_sale || s.createdAt).toISOString().split('T')[0];
        return saleDate === today;
    });

    const calculateStreak = () => {
        if (submissions.length === 0) return 0;
        const uniqueDates = new Set(
            submissions.map(s => {
                const d = new Date(s.Date_of_sale || s.createdAt);
                return d.toISOString().split('T')[0];
            })
        );

        let streak = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        let checkDate = new Date();

        if (!uniqueDates.has(todayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (uniqueDates.has(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    };

    const currentStreak = calculateStreak();

    const groupedTableData = filteredSubmissions.reduce((acc, curr) => {
        const dateObj = new Date(curr.Date_of_sale || curr.createdAt);
        const sortDate = dateObj.toISOString().split('T')[0];
        const displayDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const shortDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' });

        const deviceName = curr.samsungSKU?.ModelName || "Unknown Device";
        const planType = curr.plan?.planType || "Unknown Plan";
        const isVerified = curr.spotincentivepaidAt !== null;

        const key = `${sortDate}|${deviceName}|${planType}`;

        if (!acc[key]) {
            acc[key] = {
                sortDate,
                displayDate,
                shortDate,
                deviceName,
                planType,
                units: 0,
                verifiedUnits: 0,
                unverifiedUnits: 0
            };
        }
        acc[key].units += 1;
        if (isVerified) {
            acc[key].verifiedUnits += 1;
        } else {
            acc[key].unverifiedUnits += 1;
        }
        return acc;
    }, {} as Record<string, { sortDate: string; displayDate: string; shortDate: string; deviceName: string; planType: string; units: number; verifiedUnits: number; unverifiedUnits: number }>);

    const tableRows = Object.values(groupedTableData).sort((a, b) => b.sortDate.localeCompare(a.sortDate));

    if (loading) {
        return (
            <div className="min-h-screen bg-rose-50 flex items-center justify-center">
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-4xl"
                >
                    ❤️
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-rose-50 via-white to-pink-50 min-h-screen text-slate-800 pb-40 font-sans overflow-x-hidden">
            <ValentineHeader hideGreeting />

            {/* Floating Hearts Animation */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-rose-300"
                        initial={{ y: '110vh', x: `${Math.random() * 100}%`, opacity: 0 }}
                        animate={{ y: '-10vh', opacity: [0, 1, 0], rotate: [0, 45, -45, 0] }}
                        transition={{ duration: 8 + Math.random() * 5, repeat: Infinity, delay: i * 1.5 }}
                        style={{ fontSize: `${15 + Math.random() * 20}px` }}
                    >
                        ❤️
                    </motion.div>
                ))}
            </div>

            <div className="pt-6 px-4 max-w-4xl mx-auto relative z-10">
                {/* Streak Indicator */}
                {currentStreak > 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute right-4 top-2 flex flex-col items-center z-20"
                    >
                        <div className="relative group cursor-pointer" title={`${currentStreak} Day Love Streak!`}>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-3xl drop-shadow-md relative z-10"
                            >
                                💝
                            </motion.div>
                            <motion.div
                                animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="absolute inset-0 bg-rose-500/30 blur-xl rounded-full -z-10"
                            ></motion.div>
                            <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-20">
                                {currentStreak}
                            </div>
                        </div>
                        <p className="text-[8px] font-black text-rose-600 mt-0.5 uppercase tracking-tighter bg-rose-50 px-1 rounded-sm border border-rose-100">Streak</p>
                    </motion.div>
                )}

                {/* Page Heading */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 relative pl-3"
                >
                    <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-rose-400 via-red-500 to-pink-600 shadow-sm"></div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h1 className="text-2xl font-black text-rose-700 tracking-tight uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Love Submissions
                        </h1>
                        <HeartIcon size={24} />
                    </div>
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                        Your romantic sales history
                    </p>
                </motion.div>

                {/* Hearts Breakdown Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 bg-gradient-to-br from-[#ff4d6d] via-[#e63946] to-[#c9184a] rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full -ml-8 -mb-8 blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-xs font-black text-pink-100 uppercase tracking-[0.2em] opacity-80">Hearts Breakdown</p>
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                                <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2, repeat: Infinity }}>❤️</motion.div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                <p className="text-[10px] text-pink-100 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                    Admin Verified
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-2xl font-black tracking-tighter">{verifiedSalesTotal.toLocaleString('en-IN')}</p>
                                    <span className="text-sm">❤️</span>
                                </div>
                                <p className="text-[9px] text-pink-200 mt-1 font-medium italic">from {verifiedCount} verified units</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                <p className="text-[10px] text-pink-100 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                    Pending Review
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-2xl font-black tracking-tighter text-yellow-200">-</p>
                                    <span className="text-sm">❤️</span>
                                </div>
                                <p className="text-[9px] text-pink-200 mt-1 font-medium italic">from {unverifiedCount} units</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {bonusAmount > 0 && (
                                <div className="bg-gradient-to-br from-yellow-400/30 to-rose-400/30 backdrop-blur-sm rounded-2xl p-4 border border-white/20 relative group">
                                    <div className="absolute -top-1 -right-1">✨</div>
                                    <p className="text-[10px] text-yellow-100 font-bold uppercase tracking-wider mb-2">🎁 Bonus Hearts</p>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-2xl font-black tracking-tighter text-yellow-100">+{bonusAmount.toLocaleString('en-IN')}</p>
                                        <span className="text-sm">❤️</span>
                                    </div>
                                    <div className="mt-2 space-y-0.5">
                                        {bonusAmount >= 21000 && <p className="text-[8px] text-pink-100">Jan Festivity: +21k</p>}
                                        {hasProtectMaxBonus && <p className="text-[8px] text-pink-100">Assesment: +10k</p>}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-4 rounded-2xl shadow-inner border border-white/50 flex flex-col items-center justify-center col-span-1 ml-auto w-full group overflow-hidden relative">
                                <motion.div
                                    className="absolute inset-0 bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider mb-1 relative z-10">Total Hearts Earned</p>
                                <div className="flex items-center gap-2 relative z-10 transition-transform group-hover:scale-110">
                                    <span className="text-3xl font-black text-rose-700 tracking-tighter">{totalPoints.toLocaleString('en-IN')}</span>
                                    <motion.span
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="text-xl"
                                    >
                                        ❤️
                                    </motion.span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Submissions Stats Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-4 gap-2.5 mb-8"
                >
                    {Object.entries(counts).map(([key, count], index) => (
                        <motion.div
                            key={key}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 + (index * 0.05) }}
                            className="bg-white rounded-2xl p-3 border border-pink-100 shadow-sm text-center flex flex-col justify-center items-center h-full relative overflow-hidden group hover:border-rose-300 transition-all hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-pink-500 opacity-20"></div>
                            <div className="text-xl font-black text-rose-700 leading-none mb-1.5 group-hover:scale-110 transition-transform">{count}</div>
                            <div className="text-[9px] font-black text-pink-400 leading-tight uppercase tracking-[0.1em]">
                                {shortMapping[key as keyof typeof shortMapping] || key.replace(/_/g, " ")}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filter & Date Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-4 flex justify-between items-center px-1"
                >
                    <div>
                        {hasSalesToday && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ring-4 ring-red-100"></span>
                                Spark Today!
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest">Filter:</span>
                        <div className="relative group">
                            <input
                                type="date"
                                className="bg-white border-2 border-pink-50 text-rose-800 text-xs font-bold rounded-xl focus:ring-rose-200 focus:border-rose-400 block px-3 py-2 w-36 shadow-sm transition-all group-hover:border-rose-200 cursor-pointer"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate("")}
                                    className="absolute -right-2 -top-2 w-5 h-5 bg-white border border-rose-100 rounded-full text-[10px] text-rose-500 flex items-center justify-center hover:bg-rose-50 shadow-sm"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Main Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-pink-100 shadow-xl shadow-rose-100/50 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-rose-300 uppercase tracking-[0.2em] bg-rose-50/30 border-b border-rose-100/50">
                                    <th className="px-6 py-5">Date</th>
                                    <th className="px-4 py-5">Device</th>
                                    <th className="px-4 py-5">Plan</th>
                                    <th className="px-4 py-5 text-center">Unit</th>
                                    <th className="px-6 py-5 text-center">Love Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {tableRows.length > 0 ? (
                                    tableRows.map((row, index) => (
                                        <motion.tr
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + (index * 0.05) }}
                                            className="border-b border-rose-50 hover:bg-rose-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-5 font-black text-rose-900 opacity-70">
                                                {row.shortDate}
                                            </td>
                                            <td className="px-4 py-5 font-bold text-slate-700">
                                                {row.deviceName}
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-100 text-rose-600 border border-rose-200 shadow-sm">
                                                    {shortMapping[row.planType as keyof typeof shortMapping] || row.planType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-pink-50 text-rose-600 font-black text-lg shadow-inner">
                                                    {row.units}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex flex-col gap-1.5 items-center">
                                                    {row.verifiedUnits > 0 && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-200">
                                                            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>❤️</motion.span>
                                                            {row.verifiedUnits} Sent
                                                        </span>
                                                    )}
                                                    {row.unverifiedUnits > 0 && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200">
                                                            <span>⏳</span>
                                                            {row.unverifiedUnits} Reviewing
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            {selectedDate ? (
                                                <div className="flex flex-col items-center gap-4">
                                                    <p className="text-rose-300 font-black uppercase tracking-widest text-sm">No romantic encounters on this day.</p>
                                                    <button onClick={() => setSelectedDate("")} className="px-5 py-2 rounded-full border-2 border-rose-100 text-rose-500 font-bold text-xs uppercase hover:bg-rose-50 transition-colors">Show Eternity</button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-5">
                                                    <motion.div
                                                        animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                                        className="text-6xl grayscale opacity-20"
                                                    >
                                                        💘
                                                    </motion.div>
                                                    <p className="text-rose-300 font-black uppercase tracking-[0.2em] text-xs">Spread the love to see results!</p>
                                                    <Link href="/SEC/incentive-form" className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl shadow-lg shadow-rose-200 font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Submit Sale</Link>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            <ValentineFooter />
        </div>
    );
}

import Link from "next/link";
