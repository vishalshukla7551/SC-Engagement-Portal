'use client';

import ReferralSegmentedControl from './ReferralSegmentedControl';

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6">
      <ReferralSegmentedControl />
      {children}
    </div>
  );
}
