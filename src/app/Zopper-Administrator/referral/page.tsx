'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ReferralPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to referrals by default
    router.replace('/Zopper-Administrator/referral/referrals');
  }, [router]);

  return null;
}
