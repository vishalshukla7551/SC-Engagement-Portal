'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti'; // Added confetti
import { getHomePathForRole } from '@/lib/roleHomePath';
import ButtonLoader from '@/components/ButtonLoader';
import { useAuth } from '@/context/AuthContext';

// Pre-calculate Ashok Chakra spokes to avoid hydration mismatch
// Round to fixed precision to ensure exact SSR/client match
// Product: Ashok Chakra Spokes (Commented out for Valentine Theme)
// const ASHOK_CHAKRA_SPOKES = Array.from({ length: 24 }).map((_, i) => {
//   const angle = (i * 15 * Math.PI) / 180;
//   const x1 = Number((12 + 2 * Math.cos(angle)).toFixed(6));
//   const y1 = Number((12 + 2 * Math.sin(angle)).toFixed(6));
//   const x2 = Number((12 + 10 * Math.cos(angle)).toFixed(6));
//   const y2 = Number((12 + 10 * Math.sin(angle)).toFixed(6));
//   return `M${x1} ${y1}L${x2} ${y2}`;
// });

const FloatingHeart = ({ delay, duration, initialX, scale }: { delay: number; duration: number; initialX: number; scale: number }) => (
  <motion.div
    initial={{ y: "110vh", x: `${initialX}vw`, opacity: 0, scale: 0 }}
    animate={{
      y: "-10vh",
      opacity: [0, 1, 1, 0],
      scale: scale,
      x: `${initialX + (Math.random() * 10 - 5)}vw`
    }}
    transition={{
      duration: duration,
      delay: delay,
      repeat: Infinity,
      ease: "linear"
    }}
    className="absolute text-pink-300/40 pointer-events-none"
  >
    <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8 md:w-16 md:h-16">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  </motion.div>
);

export default function SECLogin() {
  const router = useRouter();
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hearts, setHearts] = useState<{ id: number; delay: number; duration: number; initialX: number; scale: number }[]>([]);

  useEffect(() => {
    setHearts(Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      initialX: Math.random() * 100,
      scale: 0.5 + Math.random() * 1
    })));

    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % LOVE_QUOTES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const [quoteIndex, setQuoteIndex] = useState(0);

  const LOVE_QUOTES = [
    "Selling with Heart ❤️",
    "Spread the Love, Close the Deal 🌹",
    "You are the Heart of Zopper 💖",
    "Happy Valentine's SalesDost! 💘"
  ];

  const fireHeartConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff0000', '#ff69b4', '#ff1493'],
        shapes: ['heart' as any]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff0000', '#ff69b4', '#ff1493'],
        shapes: ['heart' as any]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidNumber, setIsValidNumber] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.role) {
      const homePath = getHomePathForRole(user.role);
      router.push(homePath);
    }
  }, [user, router]);

  // Shared input styles – keep consistent with Phone Number field
  const inputBaseClasses =
    'w-full px-3 py-2.5 rounded-lg text-base text-black placeholder:text-gray-500 transition-all duration-200 border-0 outline-none focus:outline-none';
  const labelBaseClasses = 'block text-sm font-medium text-gray-900 mb-1.5';

  // Apply important styles on mount
  useEffect(() => {
    const phoneInput = document.getElementById('phone') as HTMLInputElement;
    const otpInput = document.getElementById('otp') as HTMLInputElement;

    if (phoneInput) {
      phoneInput.style.setProperty('background-color', '#e8f0fe', 'important');
      phoneInput.style.setProperty('border', '1px solid #d1d5db', 'important');
      phoneInput.style.setProperty('outline', 'none', 'important');
    }

    if (otpInput) {
      otpInput.style.setProperty('background-color', 'transparent', 'important');
      otpInput.style.setProperty('border', '1px solid #d1d5db', 'important');
      otpInput.style.setProperty('outline', 'none', 'important');
    }
  }, [otpSent]);

  // If already logged in, redirect away from SEC login.
  // REMOVED: authUser is only for UI display, not for auth decisions
  // Auth is handled by cookies/tokens via AuthProvider

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Keep only digits and enforce a maximum of 10
    const digitsOnly = inputValue.replace(/\D/g, '').slice(0, 10);

    setPhoneNumber(digitsOnly);

    if (!digitsOnly) {
      setValidationMessage('');
      setIsValidNumber(null);
    } else if (digitsOnly.length < 10) {
      setValidationMessage('Invalid number');
      setIsValidNumber(false);
    } else if (digitsOnly.length === 10) {
      setValidationMessage('Valid number');
      setIsValidNumber(true);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const digitsOnly = phoneNumber.replace(/\D/g, '').slice(0, 10);

    if (!digitsOnly || digitsOnly.length < 10) {
      setPhoneNumber(digitsOnly);
      setValidationMessage('Invalid number');
      setIsValidNumber(false);
      alert('Please enter a 10-digit phone number');
      return;
    }



    setPhoneNumber(digitsOnly);
    setValidationMessage('Valid number');
    setIsValidNumber(true);

    try {
      setLoading(true);
      const res = await fetch('/api/auth/sec/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: digitsOnly }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error || 'Failed to send OTP');
        return;
      }

      // OTP will be visible in the terminal logs on the server.
      setOtpSent(true);
    } catch (err) {
      console.error('Error sending OTP', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    fireHeartConfetti();
    setError(null);

    if (!otp) {
      alert('Please enter your OTP');
      return;
    }

    const digitsOnly = phoneNumber.replace(/\D/g, '').slice(0, 10);

    try {
      setLoading(true);
      const res = await fetch('/api/auth/sec/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: digitsOnly, otp }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error || 'Invalid OTP');
        return;
      }

      // Store SEC auth info in localStorage, same as role login does.
      if (typeof window !== 'undefined' && data?.user) {
        window.localStorage.setItem('authUser', JSON.stringify(data.user));
      }

      // If this SEC user has not yet provided their name, send them to the
      // one-time name capture screen before landing on the home dashboard.
      if (data.needsName) {
        // Use window.location.href to ensure localStorage is fully written before redirect
        window.location.href = '/SEC/onboarding';
        return;
      }

      // OTP verified successfully; redirect to SEC landing page (via shared helper).
      // const target = getHomePathForRole(data.user.role || 'SEC');

      // CAMPAIGN: Redirect to Republic Day Special Page first
      const target = '/SEC/republic-day-hero';

      // Use window.location.href to ensure localStorage is fully written before redirect
      window.location.href = target;
    } catch (err) {
      console.error('Error verifying OTP', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex flex-col md:flex-row items-center justify-center p-4 relative overflow-x-hidden overflow-y-auto bg-white"
    >
      {/* --- REPUBLIC DAY BACKGROUND START (COMMENTED OUT) --- */}
      {/* 
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] bg-orange-400/20 rounded-full blur-[100px] mix-blend-multiply"
        />
        <motion.div
           animate={{
            x: [100, -100, 100],
            y: [50, -50, 50],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 -right-1/4 w-[70vw] h-[70vw] bg-green-400/20 rounded-full blur-[120px] mix-blend-multiply"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-300/20 rounded-full blur-[100px] mix-blend-multiply"
        />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vmin] h-[90vmin] opacity-[0.03] pointer-events-none"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-blue-900">
            <circle cx="12" cy="12" r="10" strokeWidth="0.5" />
            
            {ASHOK_CHAKRA_SPOKES.map((d, i) => (
              <path key={i} d={d} strokeWidth="0.5" />
            ))}
            <circle cx="12" cy="12" r="2" strokeWidth="0.5" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [5, 10, 5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-16 h-16 opacity-60 hidden md:block"
        >
          <svg viewBox="0 0 24 24" fill="url(#kiteGradientOrange)">
            <defs>
              <linearGradient id="kiteGradientOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9933" />
                <stop offset="100%" stopColor="#FF7700" />
              </linearGradient>
            </defs>
            <path d="M12 2L2 12l10 10 10-10L12 2z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ y: [10, -10, 10], rotate: [-5, -10, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-10 w-20 h-20 opacity-60 hidden md:block"
        >
          <svg viewBox="0 0 24 24" fill="url(#kiteGradientGreen)">
            <defs>
              <linearGradient id="kiteGradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#138808" />
                <stop offset="100%" stopColor="#0E6005" />
              </linearGradient>
            </defs>
            <path d="M12 2L2 12l10 10 10-10L12 2z" />
          </svg>
        </motion.div>
      </div>
      */}
      {/* --- REPUBLIC DAY BACKGROUND END --- */}

      {/* --- VALENTINE THEME BACKGROUND START --- */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-rose-50 via-white to-pink-50">
        {/* Ambient Background Blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [-50, 50, -50],
              y: [-25, 25, -25],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-[70vw] h-[70vw] bg-pink-300/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              x: [50, -50, 50],
              y: [25, -25, 25],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 right-0 w-[80vw] h-[80vw] bg-rose-300/20 rounded-full blur-[120px]"
          />
        </div>

        {/* Floating Hearts */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {hearts.map((heart) => (
            <FloatingHeart
              key={heart.id}
              delay={heart.delay}
              duration={heart.duration}
              initialX={heart.initialX}
              scale={heart.scale}
            />
          ))}
        </div>
      </div>
      {/* --- VALENTINE THEME BACKGROUND END --- */}

      {/* Card Wrapper - Anchors Santa hat and Gift box to the card */}


      {/* Login Card */}
      <div
        className="w-full max-w-[450px] mx-auto bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 relative border border-white/50"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        <div className="text-center mb-8">

          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-rose-500 via-pink-600 to-rose-500 bg-clip-text text-transparent">
            SEC Login
          </h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.5 }}
              className="text-pink-500 font-medium text-sm"
            >
              {LOVE_QUOTES[quoteIndex]}
            </motion.p>
          </AnimatePresence>
          {/* <p className="text-gray-500">Login with your phone number</p> */}
        </div>

        <form
          onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}
          className="space-y-6"
          autoComplete="off"
        >
          <div>
            <label
              htmlFor="phone"
              className={labelBaseClasses}
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="sec-phone"
              autoComplete="off"
              inputMode="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter your phone number"
              className={inputBaseClasses}
              style={{
                backgroundColor: '#e8f0fe',
                border: '1px solid #d1d5db',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.setProperty('border-color', 'rgb(120, 164, 235)', 'important');
                e.target.style.setProperty('box-shadow', 'rgba(59, 130, 246, 0.06) 0px 0px 0px 1.77453px', 'important');
                e.target.style.setProperty('outline', 'none', 'important');
              }}
              onBlur={(e) => {
                e.target.style.setProperty('border-color', '#d1d5db', 'important');
                e.target.style.setProperty('box-shadow', 'none', 'important');
              }}
            />
            {validationMessage && (
              <p
                className={`mt-2 text-sm ${isValidNumber ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {validationMessage}
              </p>
            )}
            {error && !otpSent && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>



          <button
            type="button"
            onClick={handleSendOTP}
            disabled={loading || otpSent}
            className="w-full text-white font-semibold py-2.5 transition-all text-base disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98]"
            style={{
              backgroundImage:
                loading || otpSent ? 'none' : 'linear-gradient(90deg, #E11D48 0%, #DB2777 50%, #E11D48 100%)', // Rose-Pink gradient
              backgroundColor: loading || otpSent ? '#d1d5db' : 'transparent',
              borderRadius: '12px',
              boxShadow: loading || otpSent ? 'none' : 'rgba(37, 99, 235, 0.2) 0px 8px 16px -4px',
              backgroundSize: '200% 100%',
              backgroundPosition: '0 0', // Explicitly set initial position
            }}
            onMouseEnter={(e) => {
              if (!loading && !otpSent) {
                e.currentTarget.style.backgroundPosition = '100% 0';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !otpSent) {
                e.currentTarget.style.backgroundPosition = '0 0';
              }
            }}
          >
            {loading && !otpSent && <ButtonLoader variant="light" size="md" />}
            {loading && !otpSent ? 'Sending...' : 'Send OTP'}
          </button>

          {otpSent && (
            <>
              {/* Divider */}
              <div style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)',
                marginBottom: '24px'
              }} />

              <div>
                <p className="text-center mb-3" style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>
                  OTP sent to registered whatsapp number
                </p>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  autoComplete="off"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter OTP"
                  className={inputBaseClasses}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    outline: 'none',
                    textAlign: 'center',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.setProperty('border-color', 'rgb(120, 164, 235)', 'important');
                    e.target.style.setProperty('box-shadow', 'rgba(59, 130, 246, 0.06) 0px 0px 0px 1.77453px', 'important');
                    e.target.style.setProperty('outline', 'none', 'important');
                  }}
                  onBlur={(e) => {
                    e.target.style.setProperty('border-color', '#d1d5db', 'important');
                    e.target.style.setProperty('box-shadow', 'none', 'important');
                  }}
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 text-center">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="flex-1 text-white font-semibold py-2.5 rounded-xl transition-all text-base disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98]"
                  style={{
                    background: loading ? '#d1d5db' : 'linear-gradient(90deg, #138808 0%, #059669 100%)', // Green gradient for verify
                    boxShadow: loading ? 'none' : 'rgba(19, 136, 8, 0.2) 0px 4px 12px'
                  }}
                >
                  {loading && <ButtonLoader variant="light" size="md" />}
                  {loading ? 'Verifying...' : 'Verify'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setError(null);
                  }}
                  disabled={loading}
                  className="flex-1 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors text-base disabled:cursor-not-allowed border-2 border-gray-200"
                  style={{ backgroundColor: 'white' }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Different Role?{' '}
            <Link
              href="/login/role"
              className="text-blue-600 hover:underline font-medium"
            >
              Go to Role Login
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Need an account?{' '}
            <Link
              href="/signup"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up for different roles
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center text-gray-500 gap-1">
            <span className="text-base">Powered by</span>
            <Image
              src="/zopper-icon.png"
              alt="Zopper icon"
              width={24}
              height={24}
              className="inline-block"
            />
            <span className="text-base font-semibold text-gray-900">Zopper</span>
          </div>
        </div>
      </div>


    </div>
  );
}
