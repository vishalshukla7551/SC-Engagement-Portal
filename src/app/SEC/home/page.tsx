'use client';

import { useEffect, useState } from 'react';
import LandingPage from './component/LandingPage.jsx';

export default function SECHomePage() {
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem('authUser');
      if (!raw) return;

      const auth = JSON.parse(raw) as any;
      const fullName = (auth?.fullName || '').trim();

      if (fullName) {
        setUserName(fullName);
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  return <LandingPage userName={userName} />;
}
