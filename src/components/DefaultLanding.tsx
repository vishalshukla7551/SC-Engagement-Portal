'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function DefaultLanding() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login/sec');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center overflow-hidden font-sans">
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative text-center"
        >
          {/* Main Title */}
          <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter text-gray-900">
            SalesDost
          </h1>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.2 }}
            className="mt-6 flex items-center justify-center gap-2 text-gray-500 font-medium tracking-widest uppercase text-xs sm:text-sm"
          >
            <span>Powered By</span>
            <div className="flex items-center gap-1 font-bold text-gray-900">
              <Image
                src="/zopper-icon.png"
                alt="Zopper Logo"
                width={20}
                height={20}
                className="inline-block"
              />
              <span>Zopper</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
