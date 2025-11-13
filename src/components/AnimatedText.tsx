'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnimatedText() {
  const text = 'SalesDost';
  const totalChars = text.length;
  const moveDuration = 4; // Time for each character to move across screen (slower)
  const triggerDuration = 0.1; // All chars trigger within 0.1 seconds (extremely fast)
  const [screenWidth, setScreenWidth] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setScreenWidth(window.innerWidth);
    
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Navigate after S character triggers with extra time (delay = 0.5 + 0.1 + 0.1 = 0.7s)
    const sCharDelay = 0.5 + triggerDuration + 0.1; // Added 0.1s extra time
    const navigationTimer = setTimeout(() => {
      router.push('/login/sec');
    }, sCharDelay * 1000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(navigationTimer);
    };
  }, [router, triggerDuration]);

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 md:px-8">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white text-center">
        {text.split('').map((char, index) => {
          // Last character starts first (index 8), first character starts last (index 0)
          const reverseIndex = totalChars - 1 - index;
          const delay = 0.5 + (reverseIndex * triggerDuration / totalChars);
          
          return (
            <motion.span
              key={`${char}-${index}`}
              className="inline-block"
              initial={{ x: 0 }}
              animate={{ x: screenWidth }}
              transition={{
                type: "spring",
                stiffness: 30,
                damping: 20,
                mass: 1,
                delay: delay,
              }}
            >
              {char}
            </motion.span>
          );
        })}
      </h1>
    </div>
  );
}
