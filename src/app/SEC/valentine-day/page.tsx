'use client';

import { useEffect, useState } from 'react';
import ValentineDashboard from '@/components/ValentineDashboard';

export default function ValentineDayPage() {
    const [userName, setUserName] = useState('Guest');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const raw = window.localStorage.getItem('authUser');
            if (!raw) return;

            const auth = JSON.parse(raw) as any;
            const fullName = (auth?.fullName || '').trim();

            if (fullName) {
                const firstName = fullName.split(' ')[0];
                const properCaseFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
                setUserName(properCaseFirstName);
            }
        } catch {
            // ignore JSON parse errors
        }
    }, []);

    return <ValentineDashboard userName={userName} />;
}
