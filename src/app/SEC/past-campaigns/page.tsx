'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';

const CAMPAIGNS = [
    {
        id: 'protectmax-yoddha',
        title: 'ProtectMax Yoddha',
        description: 'Republic Day Special Contest',
        icon: '⚔️', // Using the sword icon or similar
        bgGradient: 'from-orange-500 via-white to-green-500', // Tricolor theme hint
        isTricolor: true,
        link: '/SEC/past-campaigns/protectmax-yoddha',
        badge: 'COMPLETED'
    },
    {
        id: 'pitch-sultan',
        title: 'Pitch Sultan',
        description: 'Video Pitch Contest',
        icon: '🎤',
        bgGradient: 'from-purple-600 to-indigo-600',
        link: 'https://salesdost.vercel.app/pitchsultan/rewards',
        isExternal: true,
        badge: 'COMPLETED'
    }
];

export default function PastCampaignsPage() {
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
                    <h1 className="text-xl font-bold text-slate-800">Past Campaigns</h1>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto">
                <div className="grid gap-4">
                    {CAMPAIGNS.map((campaign) => (
                        <Link
                            key={campaign.id}
                            href={campaign.link}
                            target={campaign.isExternal ? '_blank' : undefined}
                            className="group relative block"
                        >
                            <div className={`
                        relative overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
                        ${campaign.isTricolor ? 'bg-white border-2 border-orange-100' : `bg-gradient-to-br ${campaign.bgGradient}`}
                    `}>
                                {/* Tricolor Background Special Handling */}
                                {campaign.isTricolor && (
                                    <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-orange-400 via-white to-green-600 pointer-events-none" />
                                )}

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm
                                    ${campaign.isTricolor ? 'bg-orange-50 text-orange-600' : 'bg-white/20 text-white'}
                                `}>
                                            {campaign.icon}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg ${campaign.isTricolor ? 'text-slate-800' : 'text-white'}`}>
                                                {campaign.title}
                                            </h3>
                                            <p className={`text-sm ${campaign.isTricolor ? 'text-slate-500' : 'text-white/80'}`}>
                                                {campaign.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Badge */}
                                <div className={`
                            absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full
                             ${campaign.isTricolor ? 'bg-slate-100 text-slate-500' : 'bg-white/20 text-white'}
                         `}>
                                    {campaign.badge}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
