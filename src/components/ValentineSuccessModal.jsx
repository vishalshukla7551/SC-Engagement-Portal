'use client';

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

export default function ValentineSuccessModal({
    isOpen,
    earnedIncentive,
    onClose
}) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            const timer = setTimeout(() => {
                setShowConfetti(false);
            }, 4000);
            return () => clearTimeout(timer);
        } else {
            setShowConfetti(false);
        }
    }, [isOpen]);

    const handleButtonClick = () => {
        setShowConfetti(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {/* Valentine Confetti Animation */}
            {showConfetti && (
                <Confetti
                    width={typeof window !== 'undefined' ? window.innerWidth : 300}
                    height={typeof window !== 'undefined' ? window.innerHeight : 200}
                    numberOfPieces={300}
                    recycle={false}
                    colors={['#FF0000', '#FF69B4', '#FFFFFF', '#8B0000']} // Red, Pink, White, Dark Red
                />
            )}

            {/* Modal Card */}
            <div
                className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full relative overflow-hidden ring-4 ring-pink-100"
                style={{
                    animation: 'valentineModalIn 0.4s ease-out',
                    boxShadow: '0 0 50px rgba(255, 105, 180, 0.3), 0 0 90px rgba(220, 20, 60, 0.2)',
                }}
            >
                {/* Decorative top border (Valentine Gradient) */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-pink-500 via-red-500 to-rose-600" />

                {/* Heart / Cupid Illustration */}
                <div className="mb-5 relative flex justify-center items-center">
                    {/* Beating Heart */}
                    <div
                        className="text-6xl relative z-10 animate-pulse"
                    >
                        💖
                    </div>
                    {/* Floating Hearts */}
                    <div className="absolute top-0 flex justify-between w-32">
                        <span className="text-3xl transform -rotate-12 animate-bounce" style={{ animationDelay: '0.1s' }}>🌹</span>
                        <span className="text-3xl transform rotate-12 animate-bounce" style={{ animationDelay: '0.2s' }}>💌</span>
                    </div>
                </div>

                {/* Heading with Valentine Gradient */}
                <h2
                    className="text-2xl font-black mb-1 uppercase tracking-wider"
                    style={{
                        background: 'linear-gradient(90deg, #ec255a 0%, #ff7a9a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    LOVE SENT!
                </h2>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                    Submission Successful
                </h3>

                {/* Subtext */}
                <p className="text-gray-600 text-sm font-medium mb-1 uppercase tracking-wide">
                    Honor Points Earned
                </p>

                {/* Amount */}
                <p
                    className="text-5xl font-black mb-3 drop-shadow-sm"
                    style={{
                        color: '#ec255a' /* Valentine Red/Pink */
                    }}
                >
                    {earnedIncentive}
                </p>

                <p className="text-gray-500 text-xs mb-6 italic">
                    Spreading love and joy! ❤️
                </p>

                {/* Festive decorations row */}
                <div className="flex justify-center gap-4 mb-6 text-xl">
                    <div className="h-1 w-12 bg-pink-400 rounded-full"></div>
                    <div className="h-1 w-12 bg-red-500 rounded-full"></div>
                    <div className="h-1 w-12 bg-rose-600 rounded-full"></div>
                </div>

                {/* Button */}
                <button
                    onClick={handleButtonClick}
                    className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide shadow-lg"
                    style={{
                        background: 'linear-gradient(90deg, #FF69B4 0%, #DC143C 100%)', // Pink to Crimson
                        boxShadow: '0 4px 15px rgba(220, 20, 60, 0.3)',
                    }}
                >
                    View Love Board 💘
                </button>

                <p className="mt-3 text-[10px] text-gray-400 font-medium">
                    *Points will reflect after admin review
                </p>

                {/* Bottom decorative border */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-rose-600 via-red-500 to-pink-500" />
            </div>

            {/* CSS Animations */}
            <style jsx global>{`
        @keyframes valentineModalIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
        </div>
    );
}
