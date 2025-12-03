'use client';

import { useEffect, useState } from 'react';
import LandingPage from '../../login/sec/LandingPage.jsx';

export default function SECHomePage() {
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let finalName = '';

    // 1) Preferred: derive from authUser stored by login flows
    try {
      const raw = window.localStorage.getItem('authUser');
      if (raw) {
        const auth = JSON.parse(raw) as any;
        finalName = (auth?.fullName || auth?.phone || '').trim();
      }
    } catch {
      // ignore JSON parse errors and fall back to older keys
    }

    // 2) Backwards-compatible fallback: older SEC keys and first/last name
    if (!finalName) {
      const storedFirst = window.localStorage.getItem('firstName') || '';
      const storedLast = window.localStorage.getItem('lastName') || '';
      const storedFull = window.localStorage.getItem('secUserName') || '';
      finalName = (storedFull || `${storedFirst} ${storedLast}`).trim();
    }

    // 3) Final fallback: use phone as display name
    if (!finalName) {
      try {
        const raw = window.localStorage.getItem('authUser');
        if (raw) {
          const auth = JSON.parse(raw) as any;
          if (auth?.phone) finalName = auth.phone;
        }
      } catch {
        // ignore
      }
    }

    if (finalName) {
      setUserName(finalName);
    }
  }, []);

  return <LandingPage userName={userName} />;
}
