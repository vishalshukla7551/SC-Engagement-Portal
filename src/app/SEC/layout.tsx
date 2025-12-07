'use client';

import { useRequireAuth } from '@/lib/clientAuth';

export default function SECLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useRequireAuth(['SEC']);

  if (loading) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}

