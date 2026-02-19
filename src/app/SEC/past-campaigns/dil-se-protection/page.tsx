'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';

const DIL_SE_PROTECTION_FEATURES = [
    {
        id: 'customer-obsession',
        title: 'Customer Obsession',
        description: 'View Your Rewards',
        icon: '🎖️',
        bgGradient: 'from-[#dc2626] via-[#ef4444] to-[#f87171]',
        link: '/SEC/valentine-day',
        badge: 'REWARDS'
    },
    {
        id: 'customer-love-index',
        title: 'Customer Love Index',
        description: 'View Your Love Score',
        icon: '❤️',
        bgGradient: 'from-[#e11d48] via-[#be123c] to-[#9f1239]',
        link: '/SEC/romance-merit-board',
        badge: 'HOT'
    },
    {
        id: 'my-submission',
        title: 'My Submission',
        description: 'View Submission History',
        icon: '📝',
        bgGradient: 'from-[#db2777] via-[#be185d] to-[#9d174d]',
        link: '/SEC/love-submissions',
        badge: 'LIVE'
    }
];

export default function DilSeProtectionPage() {
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
                        <h1 className="text-xl font-bold text-slate-800">Dil Se Protection</h1>
                        <p className="text-xs text-slate-500 font-medium">Campaign Dashboard</p>
                    </div>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto">
                {/* Banner */}
                <div className="mb-6 rounded-2xl overflow-hidden shadow-lg relative h-40 bg-gray-100">
                    <img
                        src="/images/val1.jpeg"
                        alt="Dil Se Protection Banner"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <h2 className="text-white font-bold text-xl">Dil Se Protection</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {DIL_SE_PROTECTION_FEATURES.map((feature) => (
                        <Link
                            key={feature.id}
                            href={feature.link}
                            className="group relative block"
                        >
                            <div className={`
                        relative overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
                        bg-gradient-to-br ${feature.bgGradient}
                    `}>
                                {/* Shimmer */}
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight mb-1">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-white/90 font-medium">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Badge */}
                                {feature.badge && (
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                        {feature.badge}
                                    </div>
                                )}

                                {/* Decorative Icon */}
                                <div className="absolute -bottom-4 -right-4 text-8xl opacity-10 pointer-events-none rotate-12 transition-transform group-hover:rotate-0">
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
