'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Star } from 'lucide-react';

const STORAGE_KEY = 'republic_day_bonus_shown';

interface RepublicDayBonusPopupProps {
  hasBonus?: boolean;
}

export default function RepublicDayBonusPopup({ hasBonus = false }: RepublicDayBonusPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if popup has already been shown
    const hasShown = localStorage.getItem(STORAGE_KEY);
    if (hasShown) {
      return;
    }

    // Show popup if user has bonus
    if (hasBonus) {
      setIsOpen(true);
      // Mark as shown
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [hasBonus]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-r from-orange-500 via-[#000080] to-green-600 p-6 text-white overflow-hidden">
              {/* Animated Background Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"
              />

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
              >
                <X size={20} className="text-white" />
              </button>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  className="mb-3"
                >
                  <Gift size={48} className="text-yellow-300 drop-shadow-lg" />
                </motion.div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Special Bonus!
                </h2>
                <p className="text-sm font-semibold opacity-90">
                  For Your Contribution
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Bonus Amount */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-orange-50 to-green-50 rounded-2xl p-4 border-2 border-orange-200 text-center"
              >
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  You've Earned
                </p>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center justify-center gap-2"
                >
                  <span className="text-4xl font-black bg-gradient-to-r from-orange-600 via-[#000080] to-green-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    21,000
                  </span>
                  <span className="text-xl font-bold text-slate-700">Points</span>
                </motion.div>
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center space-y-2"
              >
                <p className="text-sm font-semibold text-slate-800">
                  🎬 Thank you for your contribution in the Pitchsultan video creation!
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your dedication and participation have been recognized. These bonus points have been added to your account to celebrate your efforts.
                </p>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2 pt-2"
              >
                {[
                  "✨ Bonus points added to your passbook",
                  "🏆 Counts towards your rank progression",
                  "🎯 Use them for future incentives"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    {item}
                  </div>
                ))}
              </motion.div>

              {/* Decorative Stars */}
              <div className="flex justify-center gap-2 pt-2">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  >
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="w-full py-3 bg-gradient-to-r from-orange-500 via-[#000080] to-green-600 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-orange-900/30 hover:shadow-xl transition-all"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Awesome! Let&apos;s Go 🚀
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
