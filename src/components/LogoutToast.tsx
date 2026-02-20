'use client';

import { useEffect, useState } from 'react';

interface LogoutToastProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function LogoutToast({ isVisible, onComplete }: LogoutToastProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        return prev + 6.67; // 100/15 = 6.67% per 100ms = 1.5 seconds total
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h3 className="text-center text-lg font-semibold text-gray-900 mb-2">
          Session Expired
        </h3>
        <p className="text-center text-gray-600 text-sm mb-6">
          Your session has expired. Please login again.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Text */}
        <p className="text-center text-xs text-gray-500 mt-3">
          Redirecting in {Math.ceil((100 - progress) / 50)} second{Math.ceil((100 - progress) / 50) !== 1 ? 's' : ''}...
        </p>
      </div>
    </div>
  );
}
