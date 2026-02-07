'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

const PROTECT_MAX_FEATURES = [
    {
        id: 'battle-standings',
        title: 'Battle Standings',
        description: 'View Your Progress',
        icon: '⚔️',
        bgGradient: 'from-[#6366f1] via-[#8b5cf6] to-[#ec4899]',
        link: '/SEC/republic-day-hero',
        badge: 'VIEW'
    },
    {
        id: 'hall-of-fame',
        title: 'Hall of Fame',
        description: 'View Leaderboard',
        icon: '🏆',
        bgGradient: 'from-orange-500 via-yellow-500 to-red-500',
        link: '/SEC/republic-leaderboard',
        badge: 'TOP RANK'
    },
    {
        id: 'regiments',
        title: 'Regiments',
        description: 'View Your Regiment',
        icon: '🎖️',
        bgGradient: 'from-[#166534] via-[#15803d] to-[#4ade80]',
        link: '/SEC/republic-regiments',
        badge: 'SQUAD'
    },
    {
        id: 'my-submission',
        title: 'My Submission',
        description: 'View Submission History',
        icon: '📝',
        bgGradient: 'from-blue-500 to-cyan-500',
        link: '/SEC/sales-submissions',
        badge: 'HISTORY'
    }
];

export default function ProtectMaxYoddhaPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <ChevronLeft className="text-slate-600" size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">ProtectMax Yoddha</h1>
                        <p className="text-xs text-slate-500 font-medium">Campaign Dashboard</p>
                    </div>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto">
                {/* Banner or Hero Section (Optional but good for context) */}
                {/* Banner or Hero Section */}
                <div className="mb-6 rounded-2xl overflow-hidden shadow-lg relative h-40 bg-gray-100">
                    <img
                        src="/images/banner3.jpeg"
                        alt="ProtectMax Yoddha Banner"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {PROTECT_MAX_FEATURES.map((feature) => (
                        <Link
                            key={feature.id}
                            href={feature.link}
                            className="group relative block"
                        >
                            <div className={`
                        relative overflow-hidden rounded-2xl p-4 h-40 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
                        bg-gradient-to-br ${feature.bgGradient}
                    `}>
                                {/* Shimmer */}
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="flex flex-col justify-between h-full relative z-10">
                                    <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm shadow-sm">
                                        {feature.icon}
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-white text-md leading-tight mb-1">
                                            {feature.title}
                                        </h3>
                                        <p className="text-xs text-white/90 font-medium line-clamp-2">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Badge */}
                                {feature.badge && (
                                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-0.5 text-[8px] font-bold text-white shadow-sm">
                                        {feature.badge}
                                    </div>
                                )}

                                {/* Decorative Icon */}
                                <div className="absolute -bottom-2 -right-2 text-6xl opacity-10 pointer-events-none rotate-12 transition-transform group-hover:rotate-0">
                                    {feature.icon}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
