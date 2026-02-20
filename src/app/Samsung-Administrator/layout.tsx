'use client';

import { useAuth } from '@/context/AuthContext';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function SamsungAdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

