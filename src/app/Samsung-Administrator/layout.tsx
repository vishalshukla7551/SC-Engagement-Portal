'use client';

import { useAuth } from '@/context/AuthContext';

export default function SamsungAdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}

