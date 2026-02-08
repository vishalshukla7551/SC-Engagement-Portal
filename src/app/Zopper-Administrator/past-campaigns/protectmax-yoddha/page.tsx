'use client';

import Link from 'next/link';

export default function ProtectMaxYoddhaAdminPage() {
    const sections = [
        {
            id: 'hall-of-fame',
            title: 'Hall of Fame',
            description: 'View the top performers and achievements in the ProtectMax Yoddha campaign.',
            link: '/Zopper-Administrator/hall-of-fame',
            emoji: '🏅',
            color: 'bg-gradient-to-r from-yellow-400 to-amber-500',
        },
        {
            id: 'regiments',
            title: 'Regiments',
            description: 'See how different regiments performed against each other.',
            link: '/Zopper-Administrator/regiments',
            emoji: '⚔️',
            color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <Link
                    href="/Zopper-Administrator/past-campaigns"
                    className="mr-3 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">ProtectMax Yoddha</h1>
            </div>

            <p className="text-gray-600 mb-8 max-w-2xl">
                Access the key performance metrics and recognition boards for the ProtectMax Yoddha campaign.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <Link href={section.link} key={section.id} className="group block">
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full hover:shadow-lg hover:border-blue-100 transition-all duration-300 transform md:hover:-translate-y-1">
                            <div className={`h-24 ${section.color} relative overflow-hidden flex items-center justify-center`}>
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="text-6xl drop-shadow-md select-none transform group-hover:scale-110 transition-transform duration-300">
                                    {section.emoji}
                                </span>
                                <div className="absolute top-2 right-2 opacity-20 text-white text-8xl font-black rotate-12 transform translate-x-4 -translate-y-4 pointer-events-none">
                                    {section.emoji}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                    {section.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                    {section.description}
                                </p>
                                <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                                    View {section.title}
                                    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
