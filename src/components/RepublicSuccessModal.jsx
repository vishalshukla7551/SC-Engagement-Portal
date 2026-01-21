'use client';

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

export default function RepublicSuccessModal({
    isOpen,
    earnedIncentive,
    onClose
}) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            // Stop confetti after 4 seconds
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
            {/* Tricolor Confetti Animation */}
            {showConfetti && (
                <Confetti
                    width={typeof window !== 'undefined' ? window.innerWidth : 300}
                    height={typeof window !== 'undefined' ? window.innerHeight : 200}
                    numberOfPieces={300}
                    recycle={false}
                    colors={['#FF9933', '#FFFFFF', '#138808']} // Saffron, White, Green
                />
            )}

            {/* Modal Card */}
            <div
                className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full relative overflow-hidden ring-4 ring-orange-100"
                style={{
                    animation: 'republicModalIn 0.4s ease-out',
                    boxShadow: '0 0 50px rgba(255, 153, 51, 0.3), 0 0 90px rgba(19, 136, 8, 0.2)',
                }}
            >
                {/* Decorative top border (Tricolor) */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

                {/* Ashoka Chakra / Flag Illustration */}
                <div className="mb-5 relative flex justify-center items-center">
                    {/* Spinning Chakra */}
                    <div
                        className="text-6xl relative z-10"
                        style={{ animation: 'chakraSpin 10s linear infinite' }}
                    >
                        🎡
                    </div>
                    {/* Flags aside */}
                    <div className="absolute top-0 flex justify-between w-32 animate-pulse-slow">
                        <span className="text-3xl transform -rotate-12">🇮🇳</span>
                        <span className="text-3xl transform rotate-12">🇮🇳</span>
                    </div>
                </div>

                {/* Heading with Tricolor Gradient */}
                <h2
                    className="text-2xl font-black mb-1 uppercase tracking-wider"
                    style={{
                        background: 'linear-gradient(90deg, #FF9933 0%, #000080 50%, #138808 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    JAI HIND!
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
                        color: '#000080' /* Navy Blue */
                    }}
                >
                    {earnedIncentive}
                </p>

                <p className="text-gray-500 text-xs mb-6 italic">
                    Proudly serving the nation! 🫡
                </p>

                {/* Festive decorations row */}
                <div className="flex justify-center gap-4 mb-6 text-xl">
                    <div className="h-1 w-12 bg-[#FF9933] rounded-full"></div>
                    <div className="h-1 w-12 bg-[#FFFFFF] border border-gray-100 rounded-full"></div>
                    <div className="h-1 w-12 bg-[#138808] rounded-full"></div>
                </div>

                {/* Button */}
                <button
                    onClick={handleButtonClick}
                    className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide shadow-lg"
                    style={{
                        background: 'linear-gradient(90deg, #FF9933 0%, #138808 100%)',
                        boxShadow: '0 4px 15px rgba(0, 0, 128, 0.2)',
                    }}
                >
                    View Hall of Fame 🏆
                </button>

                <p className="mt-3 text-[10px] text-gray-400 font-medium">
                    *Points will reflect after admin review
                </p>

                {/* Bottom decorative border */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-[#138808] via-[#FFFFFF] to-[#FF9933]" />
            </div>

            {/* CSS Animations */}
            <style jsx global>{`
        @keyframes republicModalIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes chakraSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-pulse-slow {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .7; }
        }
      `}</style>
        </div>
    );
}
