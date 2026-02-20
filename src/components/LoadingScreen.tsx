'use client';

import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
        </motion.div>

        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading
          </h2>
          <p className="text-sm text-gray-500">
            Please wait while we verify your session...
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-blue-600 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
