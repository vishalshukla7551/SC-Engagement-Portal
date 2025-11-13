'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SECLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }
    // Handle OTP sending logic here
    console.log('Sending OTP to:', phoneNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            SC+ Engagement Portal
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">SEC Login</h2>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-6">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-600 uppercase mb-3"
            >
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-6">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer"
              />
            </div>
            <label htmlFor="terms" className="ml-3 text-base text-gray-700">
              I have read and agree to the{' '}
              <Link
                href="/terms"
                className="text-blue-600 hover:underline font-medium"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white font-semibold py-4 rounded-lg hover:bg-gray-800 transition-colors text-lg"
          >
            Send OTP
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p className="text-gray-600">
            Different Role?{' '}
            <Link
              href="/login/role"
              className="text-blue-600 hover:underline font-medium"
            >
              Go to Role Login
            </Link>
          </p>
          <p className="text-gray-600">
            Need an account?{' '}
            <Link
              href="/signup"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up for different roles
            </Link>
          </p>
        </div>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <span className="text-base">Powered by</span>
            <Image
              src="/zopper-logo.svg"
              alt="Zopper"
              width={120}
              height={30}
              className="inline-block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
