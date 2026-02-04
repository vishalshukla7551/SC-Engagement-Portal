import React from 'react';

const RANKS_BADGES = [
    {
        id: 'brigadier',
        title: 'SALES CHIEF MARSHAL',
        sales: '₹1,50,000+',
        color: 'from-orange-500 via-orange-600 to-orange-700',
        shadow: 'shadow-orange-500/50',
        icon: '🎖️',
        description: 'The supreme commander of sales. Elite status achieved!',
        visual: (
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full animate-pulse blur-sm opacity-50"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center border-4 border-orange-200 shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <span className="text-4xl drop-shadow-md relative z-10">🎖️</span>
                    <div className="absolute -bottom-8 left-0 right-0 h-10 bg-black/20 blur-xl"></div>
                </div>
                <div className="absolute -bottom-3 px-3 py-0.5 bg-orange-900 text-orange-100 text-[10px] uppercase font-bold rounded-full tracking-wider border border-orange-400 shadow-lg">
                    Top Rank
                </div>
            </div>
        )
    },
    {
        id: 'colonel',
        title: 'SALES COMMANDER',
        sales: '₹1,20,000+',
        color: 'from-purple-500 via-purple-600 to-purple-700',
        shadow: 'shadow-purple-500/50',
        icon: '⚔️',
        description: 'Exceptional performance! Leading by example.',
        visual: (
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full animate-pulse blur-sm opacity-50"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center border-4 border-purple-200 shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
                    <span className="text-4xl drop-shadow-md">⚔️</span>
                </div>
                <div className="absolute -bottom-3 px-3 py-0.5 bg-purple-900 text-purple-100 text-[10px] uppercase font-bold rounded-full tracking-wider border border-purple-400 shadow-lg">
                    Commander
                </div>
            </div>
        )
    },
    {
        id: 'major',
        title: 'SALES MAJOR',
        sales: '₹80,000+',
        color: 'from-indigo-500 via-indigo-600 to-indigo-700',
        shadow: 'shadow-indigo-500/50',
        icon: '⭐',
        description: 'Outstanding achievement! Your dedication is paying off.',
        visual: (
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full animate-pulse blur-sm opacity-50"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center border-4 border-indigo-200 shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
                    <span className="text-4xl drop-shadow-md">⭐</span>
                </div>
                <div className="absolute -bottom-3 px-3 py-0.5 bg-indigo-900 text-indigo-100 text-[10px] uppercase font-bold rounded-full tracking-wider border border-indigo-400 shadow-lg">
                    Major
                </div>
            </div>
        )
    },
    {
        id: 'captain',
        title: 'SALES CAPTAIN',
        sales: '₹51,000+',
        color: 'from-blue-500 via-blue-600 to-blue-700',
        shadow: 'shadow-blue-500/50',
        icon: '⚓',
        description: 'You are the Captain of Sales! Steering towards success.',
        visual: (
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-pulse blur-sm opacity-50"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center border-4 border-blue-200 shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
                    <span className="text-4xl drop-shadow-md">⚓</span>
                </div>
                <div className="absolute -bottom-3 px-3 py-0.5 bg-blue-900 text-blue-100 text-[10px] uppercase font-bold rounded-full tracking-wider border border-blue-400 shadow-lg">
                    Captain
                </div>
            </div>
        )
    },
    {
        id: 'lieutenant',
        title: 'SALES LIEUTENANT',
        sales: '₹21,000+',
        color: 'from-emerald-500 via-emerald-600 to-emerald-700',
        shadow: 'shadow-emerald-500/50',
        icon: '🛡️',
        description: 'Honor and congratulations on achieving your new rank!',
        visual: (
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full animate-pulse blur-sm opacity-50"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center border-4 border-emerald-200 shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
                    <span className="text-4xl drop-shadow-md">🛡️</span>
                </div>
                <div className="absolute -bottom-3 px-3 py-0.5 bg-emerald-900 text-emerald-100 text-[10px] uppercase font-bold rounded-full tracking-wider border border-emerald-400 shadow-lg">
                    Lieutenant
                </div>
            </div>
        )
    },
    {
        id: 'cadet',
        title: 'SALESVEER',
        sales: 'Start',
        color: 'from-stone-400 via-stone-500 to-stone-600',
        shadow: 'shadow-stone-500/50',
        icon: '🎗️',
        description: 'The journey of a thousand miles begins with a single step.',
        visual: (
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="relative w-24 h-24 bg-gradient-to-br from-stone-300 to-stone-500 rounded-full flex items-center justify-center border-4 border-stone-100 shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
                    <span className="text-4xl drop-shadow-md">�️</span>
                </div>
                <div className="absolute -bottom-3 px-3 py-0.5 bg-stone-700 text-stone-100 text-[10px] uppercase font-bold rounded-full tracking-wider border border-stone-400 shadow-lg">
                    SalesVeer
                </div>
            </div>
        )
    }
];

export default function AchievementsView() {
    return (
        <div className="animate-fade-in-up pb-8">
            {/* Header Banner */}
            <div className="mb-8 bg-gradient-to-r from-[#FF9933] via-[#ffffff] to-[#138808] rounded-3xl p-[2px] shadow-2xl relative overflow-hidden">
                <div className="bg-white rounded-[22px] p-6 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000080 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                    <div className="relative z-10 text-center">
                        <div className="inline-block p-3 rounded-full bg-orange-50 mb-3 shadow-sm border border-orange-100">
                            <span className="text-4xl">�️</span>
                        </div>
                        <h2 className="text-3xl font-black text-[#000080] mb-2 uppercase tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Honor & Glory Badges
                        </h2>
                        <p className="text-slate-600 text-sm font-medium max-w-lg mx-auto">
                            Unlock these prestigious badges as you climb the ranks in the Republic Day Campaign. Your sales define your legacy!
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {RANKS_BADGES.map((badge, idx) => (
                    <div
                        key={idx}
                        className="group relative bg-white rounded-3xl p-5 border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                        {/* Gradient Background Hover Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                        <div className="flex items-start gap-5 relative z-10">
                            <div className="shrink-0 pt-2">
                                {badge.visual}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`text-lg font-black bg-clip-text text-transparent bg-gradient-to-r ${badge.color} uppercase tracking-tight`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {badge.title}
                                    </h3>
                                </div>

                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                                    <span>Target:</span>
                                    <span className="text-[#000080]">{badge.sales}</span>
                                </div>

                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    {badge.description}
                                </p>
                            </div>
                        </div>

                        {/* Shine Effect on Hover */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400 font-medium">
                    * Badges are automatically unlocked when you cross the sales threshold.
                </p>
            </div>

            <style jsx>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
        .group:hover .group-hover\:animate-shine {
          animation: shine 1s;
        }
      `}</style>
        </div>
    );
}
