'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';

export default function ValentineSuccessModal({
    isOpen,
    earnedIncentive,
    onClose
}) {
    const [showConfetti, setShowConfetti] = useState(false);
    const router = useRouter();

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
        router.push('/SEC/passbook');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {/* Confetti */}
            {showConfetti && (
                <Confetti
                    width={typeof window !== 'undefined' ? window.innerWidth : 300}
                    height={typeof window !== 'undefined' ? window.innerHeight : 200}
                    numberOfPieces={300}
                    recycle={false}
                    colors={['#1d4ed8', '#3b82f6', '#93c5fd', '#ffffff', '#e2e8f0']}
                />
            )}

            {/* Modal Card */}
            <div
                className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full relative overflow-hidden ring-2 ring-blue-100"
                style={{ animation: 'modalIn 0.4s ease-out' }}
            >
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-blue-400" />

                {/* Icon */}
                <div className="mb-5 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Heading */}
                <h2 className="text-2xl font-black mb-1 uppercase tracking-wider text-blue-600">
                    Sale Submitted!
                </h2>
                <h3 className="text-lg font-bold text-slate-700 mb-4">
                    Submission Successful
                </h3>

                {/* Incentive amount */}
                <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-widest">
                    Incentive Earned
                </p>
                <p className="text-5xl font-black text-blue-600 mb-1 drop-shadow-sm">
                    ₹{earnedIncentive}
                </p>
                <p className="text-slate-400 text-xs mb-6 italic">
                    Great work! Keep selling. 🎯
                </p>

                {/* Divider */}
                <div className="flex justify-center gap-3 mb-6">
                    <div className="h-1 w-12 bg-blue-200 rounded-full" />
                    <div className="h-1 w-12 bg-blue-400 rounded-full" />
                    <div className="h-1 w-12 bg-blue-600 rounded-full" />
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleButtonClick}
                    className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide shadow-lg bg-blue-600 hover:bg-blue-700"
                >
                    View Incentive Passbook 📒
                </button>

                <p className="mt-3 text-[10px] text-slate-400 font-medium">
                    *Incentive will reflect in your passbook shortly
                </p>

                {/* Bottom accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600" />
            </div>

            <style jsx global>{`
                @keyframes modalIn {
                    0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
