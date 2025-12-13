'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TestPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to results by default
    router.replace('/Zopper-Administrator/test/results');
  }, [router]);

  return null;
}
