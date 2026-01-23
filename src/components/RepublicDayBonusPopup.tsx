'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Star } from 'lucide-react';

const BONUS_PHONE_NUMBERS = [
  "6377159886","9462008833","9928563176","9873829955","9999777910","7700987551","7756998722","8249426923","9962473050","7276452315",
  "9814654646","8100432608","8271116222","8237952639","7569720524","9586051609","8017838550","9987432175","7382470372","7020496418",
  "9137303035","8668993472","7044339703","7029543643","8435363145","7093299335","7973390912","9860589046","9877732964","8708323804",
  "8707258851","8218981308","8412098681","9140682442","6394502060","9044467509","9264995526","8867811147","9989999421","8108784550",
  "8080555696","9773202129","9945111142","8237963992","9987161700","9767414826","9676530082","9637742857","7838131652","9026788090",
  "9999404156","9663827863","9742934601","7359544317","9582576831","8882575369","9718804101","7600443523","7503059272","9626983020",
  "7982552640","9327126229","7676060317","9690997663","9999678004","7408108617"
];

const BONUS_POINTS = 25000;
const STORAGE_KEY = 'republic_day_bonus_shown';

interface RepublicDayBonusPopupProps {
  userPhone?: string;
}

export default function RepublicDayBonusPopup({ userPhone }: RepublicDayBonusPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    // Check if popup has already been shown
    const hasShown = localStorage.getItem(STORAGE_KEY);
    if (hasShown) {
      return;
    }

    // Get user phone from authUser if not provided
    let phone = userPhone;
    if (!phone && typeof window !== 'undefined') {
      try {
        const authUser = window.localStorage.getItem('authUser');
        if (authUser) {
          const user = JSON.parse(authUser);
          phone = user?.phone;
        }
      } catch {
        // ignore
      }
    }

    // Check if user is eligible
    if (phone && BONUS_PHONE_NUMBERS.includes(phone)) {
      setIsEligible(true);
      setIsOpen(true);
      // Mark as shown
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [userPhone]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && isEligible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                    {BONUS_POINTS.toLocaleString('en-IN')}
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
