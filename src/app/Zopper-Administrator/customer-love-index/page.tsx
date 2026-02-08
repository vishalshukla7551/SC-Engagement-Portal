'use client';

import RomanceMeritBoard from '@/components/RomanceMeritBoard';

export default function CustomerLoveIndexAdminPage() {
    // Wrapping in a div to ensure full height if needed, though RomanceMeritBoard handles it well.
    return (
        <div className="bg-gray-50 min-h-screen">
            <RomanceMeritBoard showFooter={false} />
        </div>
    );
}
