'use client';

import { useRequireAuth } from '@/lib/clientAuth';

export default function SamsungAdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useRequireAuth(['SAMSUNG_ADMINISTRATOR']);

  if (loading) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}

