'use client';

import Link from 'next/link';

export default function PastCampaignsAdminPage() {
    const campaigns = [
        {
            id: 'protectmax-yoddha',
            title: 'ProtectMax Yoddha',
            date: 'Jan 2024 - Feb 2024',
            status: 'Completed',
            description: 'A campaign focused on maximizing protection plan sales.',
            color: 'bg-gradient-to-br from-orange-400 to-red-500',
            link: '/Zopper-Administrator/past-campaigns/protectmax-yoddha',
        },
        // Add more future campaigns here
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Past Campaigns</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                    <Link href={campaign.link} key={campaign.id} className="group">
                        <div className={`rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white border border-gray-100`}>
                            <div className={`h-32 ${campaign.color} p-6 flex items-center justify-center relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                <h2 className="text-white text-2xl font-bold relative z-10 text-center drop-shadow-md">
                                    {campaign.title}
                                </h2>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                        {campaign.date}
                                    </span>
                                    <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full uppercase">
                                        {campaign.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {campaign.description}
                                </p>
                                <div className="mt-auto flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                    View Details
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
