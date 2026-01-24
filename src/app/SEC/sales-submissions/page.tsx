"use client";

import React, { useEffect, useState } from "react";
import RepublicHeader from "@/components/RepublicHeader";
import RepublicFooter from "@/components/RepublicFooter";
import { motion } from "framer-motion";

type Submission = {
    id: string;
    imei: string;
    Date_of_sale: string;
    createdAt: string;
    plan: {
        planType: string;
        price: number;
    };
    samsungSKU: {
        ModelName: string;
        Category: string;
    };
};

const IndianFlag = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={(size * 2) / 3} viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-sm rounded-[1px] inline-block">
        <rect width="30" height="20" fill="white" />
        <rect width="30" height="6.66" fill="#FF9933" />
        <rect y="13.33" width="30" height="6.67" fill="#138808" />
        <circle cx="15" cy="10" r="3" stroke="#000080" strokeWidth="1" />
        <path d="M15 10L15 7M15 10L15 13M15 10L18 10M15 10L12 10M15 10L17.12 7.88M15 10L12.88 12.12M15 10L17.12 12.12M15 10L12.88 7.88" stroke="#000080" strokeWidth="0.5" />
    </svg>
);

export default function SalesSubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState(""); // State for date filter

    useEffect(() => {
        async function fetchSubmissions() {
            try {
                const res = await fetch("/api/user/sales-submissions");
                if (!res.ok) throw new Error("Failed to fetch data");
                const data = await res.json();
                setSubmissions(data.submissions);
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

    // 1. Filter by Date first
    const filteredSubmissions = selectedDate
        ? submissions.filter(s => {
            const dateStr = new Date(s.Date_of_sale || s.createdAt).toISOString().split('T')[0];
            return dateStr === selectedDate;
        })
        : submissions;


    // 2. Calculate counts based on FILTERED submissions
    const counts = filteredSubmissions.reduce((acc, curr) => {
        const type = curr.plan?.planType || "Unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Calculate Total Earnings
    const totalEarnings = filteredSubmissions.reduce((sum, curr) => sum + (curr.plan?.price || 0), 0);
    const hasSalesToday = filteredSubmissions.some(s => {
        const today = new Date().toISOString().split('T')[0];
        const saleDate = new Date(s.Date_of_sale || s.createdAt).toISOString().split('T')[0];
        return saleDate === today;
    });

    // Calculate Streak (Consecutive days ending today or yesterday)
    const calculateStreak = () => {
        if (submissions.length === 0) return 0;

        // Get all unique sale dates (YYYY-MM-DD)
        const uniqueDates = new Set(
            submissions.map(s => {
                const d = new Date(s.Date_of_sale || s.createdAt);
                // Adjust for IST since server dates might be UTC but we treat them as local sale days
                // Actually safer to trust the date string component if available, or simple ISO split if consistent
                return d.toISOString().split('T')[0];
            })
        );

        let streak = 0;
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Start checking from today
        let checkDate = new Date(today);

        // If no sale today, maybe streak is active from yesterday?
        // Logic: Streak count includes today IF sale exists.
        // If sale NOT exists today, check yesterday. If yesterday exists, streak is active (count continues).
        // If yesterday missing, streak broken.

        if (!uniqueDates.has(todayStr)) {
            // No sale today effectively, so check starts from yesterday
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

    // 3. Grouping Logic for Table
    const groupedTableData = filteredSubmissions.reduce((acc, curr) => {
        const dateObj = new Date(curr.Date_of_sale || curr.createdAt);
        // Format YYYY-MM-DD for sorting/keys
        const sortDate = dateObj.toISOString().split('T')[0];
        // Display Date
        const displayDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        // Short Date for Mobile
        const shortDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' });

        const deviceName = curr.samsungSKU?.ModelName || "Unknown Device";
        const planType = curr.plan?.planType || "Unknown Plan";

        const key = `${sortDate}|${deviceName}|${planType}`;

        if (!acc[key]) {
            acc[key] = {
                sortDate,
                displayDate,
                shortDate,
                deviceName,
                planType,
                units: 0
            };
        }
        acc[key].units += 1;
        return acc;
    }, {} as Record<string, { sortDate: string; displayDate: string; shortDate: string; deviceName: string; planType: string; units: number }>);

    // Convert to array and sort by Date Descending
    const tableRows = Object.values(groupedTableData).sort((a, b) => b.sortDate.localeCompare(a.sortDate));


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800 pb-40 font-sans">
            <RepublicHeader hideGreeting />

            <div className="pt-6 px-4 max-w-4xl mx-auto relative">
                {/* Streak Fire Indicator (Floating Top Right) */}
                {currentStreak > 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute right-4 top-2 flex flex-col items-center z-20"
                    >
                        <div className="relative group cursor-pointer" title={`${currentStreak} Day Sales Streak!`}>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-3xl drop-shadow-md relative z-10"
                            >
                                🔥
                            </motion.div>
                            <motion.div
                                animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full -z-10"
                            ></motion.div>

                            {/* Streak Count Badge */}
                            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-50 shadow-sm z-20">
                                {currentStreak}
                            </div>
                        </div>
                        <p className="text-[8px] font-black text-orange-600 mt-0.5 uppercase tracking-tighter bg-orange-50 px-1 rounded-sm border border-orange-100">Streak</p>
                    </motion.div>
                )}

                {/* Page Heading - Matched to Form Page */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 relative pl-3"
                >
                    <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-[#FF9933] via-white to-[#138808] shadow-sm"></div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h1 className="text-2xl font-black text-[#000080] tracking-tight uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            My Sales
                        </h1>
                        <IndianFlag size={20} />
                    </div>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                        Your submission history
                    </p>
                </motion.div>

                {/* Total Earnings Banner - HIGH ENGAGEMENT */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 bg-gradient-to-r from-[#000080] to-[#1a1a90] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Total Points</p>
                            <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {totalEarnings.toLocaleString('en-IN')}
                            </h2>
                        </div>
                        <div className="text-right">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10">
                                <p className="text-[10px] text-blue-100">Total Units</p>
                                <p className="text-lg font-bold">{filteredSubmissions.length}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Summary Cards (Total Sales) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-4 gap-2 mb-6"
                >
                    {Object.entries(counts).map(([key, count], index) => (
                        <motion.div
                            key={key}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 + (index * 0.05) }}
                            className="bg-white rounded-xl p-2 border border-slate-200 shadow-sm text-center flex flex-col justify-center items-center h-full relative overflow-hidden group hover:border-orange-200 transition-colors"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-white to-green-500 opacity-50"></div>
                            <div className="text-lg font-black text-[#000080] leading-none mb-1 group-hover:scale-110 transition-transform">{count}</div>
                            <div className="text-[9px] font-bold text-slate-500 leading-tight uppercase tracking-wide">
                                {shortMapping[key as keyof typeof shortMapping] || key.replace(/_/g, " ")}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-3 flex justify-between items-end gap-2"
                >
                    <div className="pb-1">
                        {hasSalesToday && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                Active Today
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filter Date:</span>
                        <div className="relative">
                            <input
                                type="date"
                                className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-1.5 w-32 shadow-sm"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate("")}
                                    className="absolute -right-6 top-1.5 text-xs text-red-500 hover:text-red-700 font-bold"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Table View */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                    <div className="">
                        <table className="w-full text-left text-slate-600">
                            <thead className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th scope="col" className="px-3 py-3 w-[18%] text-[#000080]">Date</th>
                                    <th scope="col" className="px-2 py-3 w-[35%] text-[#000080]">Device</th>
                                    <th scope="col" className="px-2 py-3 w-[32%] text-[#000080]">Plan</th>
                                    <th scope="col" className="px-2 py-3 w-[15%] text-center text-[#000080]">Qty</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {tableRows.length > 0 ? (
                                    tableRows.map((row, index) => (
                                        <motion.tr
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + (index * 0.05) }}
                                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-3 py-3 font-semibold text-slate-700 align-top">
                                                {row.shortDate}
                                            </td>
                                            <td className="px-2 py-3 align-top break-words font-medium text-slate-600">
                                                {row.deviceName}
                                            </td>
                                            <td className="px-2 py-3 align-top break-words">
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                    {shortMapping[row.planType as keyof typeof shortMapping] || row.planType}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 text-center text-orange-600 font-black text-sm align-top">
                                                {row.units}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center text-slate-400 text-xs font-medium">
                                            {selectedDate ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <span>No sales found for this date.</span>
                                                    <button onClick={() => setSelectedDate("")} className="text-blue-600 underline">Show All</button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl grayscale opacity-50">🏆</div>
                                                    <p>Time to start your winning streak!</p>
                                                    <a href="/SEC/incentive-form" className="px-4 py-2 bg-[#000080] text-white rounded-lg shadow-md font-bold text-xs uppercase hover:bg-orange-600 transition-colors">Submit Sale</a>
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

            <RepublicFooter />
        </div>
    );
}
