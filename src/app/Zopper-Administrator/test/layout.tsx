'use client';

import TestSegmentedControl from './TestSegmentedControl';

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6">
      <TestSegmentedControl />
      {children}
    </div>
  );
}
