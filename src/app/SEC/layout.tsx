'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function SECLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    // If loading is done but no user, stop checking profile
    if (!loading && !user) {
      setCheckingProfile(false);
      return;
    }

    if (loading || !user) return;

    // Skip profile check if already on the onboarding page
    if (pathname === '/SEC/onboarding') {
      setCheckingProfile(false);
      return;
    }

    // Check if fullName, store, or employeeId is missing
    const fullName = (user?.fullName || '').trim();
    const storeId = user?.storeId || user?.selectedStoreId;
    const storeName = user?.store?.name;
    const employeeId = user?.employeeId || user?.employId;

    // Redirect to onboarding if fullName, store, or employeeId is missing
    if (!fullName || (!storeId && !storeName) || !employeeId) {
      router.replace('/SEC/onboarding');
      return;
    }

    setCheckingProfile(false);
  }, [loading, user, pathname, router]);

  if (loading || checkingProfile) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

