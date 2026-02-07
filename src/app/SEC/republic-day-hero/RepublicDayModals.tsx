import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Award,
    Star,
    Shield,
    CheckCircle,
    Gift,
    FileText,
    X,
    Crown,
    Lock,
    ChevronRight,
} from 'lucide-react';

// Rank Configuration
// Sales General removed - will be assigned manually later
export const RANKS = [
    { id: 'cadet', title: 'SALESVEER', minSales: 0, color: 'bg-stone-400', icon: Shield },
    { id: 'lieutenant', title: 'SALES LIEUTENANT', minSales: 21000, color: 'bg-emerald-500', icon: Star },
    { id: 'captain', title: 'SALES CAPTAIN', minSales: 51000, color: 'bg-blue-500', icon: Award },
    { id: 'major', title: 'SALES MAJOR', minSales: 80000, color: 'bg-indigo-600', icon: Award },
    { id: 'colonel', title: 'SALES COMMANDER', minSales: 120000, color: 'bg-purple-600', icon: Award },
    { id: 'brigadier', title: 'SALES CHIEF MARSHAL', minSales: 150000, color: 'bg-orange-500', icon: Star },
    { id: 'general', title: 'SALES GENERAL', minSales: 200000, color: 'bg-red-600', icon: Crown },
];

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsModal = memo(({ isOpen, onClose }: TermsModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Terms & Conditions</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-slate-600 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div>
                        <p className="font-bold text-slate-800 mb-1">1. Campaign Period</p>
                        <p>The PROTECTMAXYODHA Campaign (Honour & Glory Path) is valid from 23rd January 2026 to 31st January 2026.</p>
                    </div>

                    <div>
                        <p className="font-bold text-slate-800 mb-1">2. Eligibility</p>
                        <p>This mission is open to all active Samsung Experience Consultants (SECs) across all zones (North, South, East, West).</p>
                    </div>

                    <div>
                        <p className="font-bold text-slate-800 mb-1">3. Honour Points System</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>You need to earn Honour Points to progress through the ranks.</li>
                            <li>Each ₹1 of plan sales revenue achieved translates to 1 Honour Point.</li>
                            <li>Ranks are achieved based on the total Honour Points accumulated during the campaign period.</li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-bold text-slate-800 mb-1">4. Rank Progression & Rewards</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Ranks are assigned based on cumulative Honour Points earned during the campaign period.</li>
                            <li>Incentives are calculated based on the highest rank achieved.</li>
                            <li>Sales must be successfully submitted and verified via the portal to count towards Honour Points and rank progression.</li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-bold text-slate-800 mb-1">5. Verification Process</p>
                        <p>All sales entries (IMEIs) will undergo mandatory verification. Fraudulent entries will lead to immediate disqualification from the campaign and further disciplinary action.</p>
                    </div>

                    <div>
                        <p className="font-bold text-slate-800 mb-1">6. Final Authority</p>
                        <p>The management reserves the right to modify, extend, or terminate the campaign at its sole discretion without prior notice. Decisions regarding reward distribution are final and binding.</p>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                        onClick={onClose}
                        className="w-full text-white font-bold py-3 rounded-xl uppercase tracking-wider shadow-lg hover:shadow-xl active:scale-95 transition-all relative overflow-hidden group"
                        style={{
                            background: 'linear-gradient(90deg, #FF9933 0%, #000080 50%, #138808 100%)'
                        }}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative">I Understand</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
});

interface RewardsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentRankIndex: number;
}

export const RewardsModal = memo(({ isOpen, onClose, currentRankIndex }: RewardsModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-orange-50 via-white to-green-50">
                    <div className="flex items-center gap-3">
                        <div
                            className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl text-white shadow-lg"
                        >
                            <Gift size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>ProtectMaxYodha Rewards</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <p className="text-xs text-slate-500 font-medium mb-4 uppercase tracking-wider text-center">Climb the ranks and unlock incredible rewards! 🏆</p>

                    {(() => {
                        const rewardData = [
                            { title: 'SALES VEER', message: 'Start Now', reward: 'Get Started', minSales: 0 },
                            { title: 'SALES LIEUTENANT', message: 'Honor and congratulations on achieving your new rank!', reward: 'Recognition', minSales: 21000 },
                            { title: 'SALES CAPTAIN', message: 'Don\'t stop here—after all, you are the Sales Captain of Sales!', reward: 'Prestige', minSales: 51000 },
                            { title: 'SALES MAJOR', message: 'Outstanding achievement! Your dedication is paying off.', reward: '₹500', minSales: 80000 },
                            { title: 'SALES COMMANDER', message: 'Exceptional performance! Lead by example and inspire others.', reward: '₹1,500', minSales: 120000 },
                            { title: 'SALES CHIEF MARSHAL', message: 'Elite status achieved! You\'re among the top performers. The ultimate rank awaits!', reward: '₹2,500', minSales: 150000 },
                            { title: 'SALES GENERAL', message: 'THE LEGEND! You have conquered the summit of sales excellence.', reward: '₹5,000 + TROPHY', minSales: 200000 }
                        ];
                        return rewardData.map((item, i) => {
                            const rank = RANKS[i];
                            const isTopRank = i === rewardData.length - 1;
                            const isCurrentRank = i === currentRankIndex;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className={`relative p-4 rounded-2xl bg-gradient-to-br border-2 ${isCurrentRank
                                        ? 'from-blue-50 to-indigo-50 border-blue-400 shadow-lg shadow-blue-300/50 ring-2 ring-blue-400'
                                        : isTopRank
                                            ? 'from-yellow-50 to-orange-50 border-orange-300 shadow-lg shadow-orange-200/50'
                                            : 'from-slate-50 to-white border-slate-200'
                                        }`}
                                >
                                    {isCurrentRank && (
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-md border border-blue-200">
                                            ⭐ Your Rank
                                        </div>
                                    )}
                                    {isTopRank && !isCurrentRank && (
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg z-20 border border-yellow-200">
                                            🏆 Top Honor
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr ${rank?.color || 'bg-slate-400'} to-white shadow-md ring-2 ring-white shrink-0`}>
                                            {rank && <rank.icon size={22} className="text-white drop-shadow-sm" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-slate-800 text-sm tracking-tight mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.title}</h4>
                                            <p className="text-xs text-slate-600 leading-relaxed mb-2">{item.message}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-slate-400 font-semibold uppercase">Honour Points:</span>
                                                <span className="text-xs font-bold text-[#000080]">{item.minSales === 0 ? '0' : item.minSales.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[9px] font-semibold text-slate-400 uppercase mb-1">Reward</p>
                                            <span className={`text-base font-black ${item.reward.includes('₹') ? 'text-green-600' : 'text-orange-600'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>{item.reward}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        });
                    })()}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 flex items-start gap-3 shadow-sm"
                    >
                        <div className="mt-0.5">
                            <Star className="text-blue-600 fill-blue-600 shrink-0" size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-blue-800 uppercase mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Keep Pushing Forward!</p>
                            <p className="text-xs text-blue-700 leading-relaxed">Every sale brings you closer to glory. Stay motivated, keep climbing, and let your dedication shine! 🌟</p>
                        </div>
                    </motion.div>
                </div>
                <div className="p-6 bg-gradient-to-r from-orange-50 via-white to-green-50 border-t border-slate-100 text-center">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 via-[#000080] to-green-600 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-orange-900/30 hover:shadow-xl active:scale-95 transition-all"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        Let&apos;s Conquer! 🚀
                    </button>
                </div>
            </motion.div>
        </div>
    );
});

interface AnnouncementPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AnnouncementPopup = memo(({ isOpen, onClose }: AnnouncementPopupProps) => {
    const router = useRouter();

    const handleAcceptChallenge = () => {
        try {
            const authUser = localStorage.getItem('authUser');
            if (authUser) {
                const userData = JSON.parse(authUser);
                const phoneNumber = userData.phone || userData.id || userData.username;
                if (phoneNumber) {
                    router.push(`/SEC/training/test/${phoneNumber}?testType=SAMSUNG_PROTECT_MAX`);
                    return;
                }
            }
            // Fallback if no phone number found
            router.push('/SEC/training');
        } catch (e) {
            console.error("Error navigating to test", e);
            router.push('/SEC/training');
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col relative border-4 border-[#000080]"
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full shadow-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-red-500"
                >
                    <X size={20} strokeWidth={3} />
                </button>

                {/* Header */}
                <div className="pt-10 pb-6 px-6 text-center bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-100 rounded-full blur-[40px] opacity-60 pointer-events-none"
                    />

                    <div className="relative z-10">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="inline-block bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 animate-pulse shadow-md border border-red-400"
                        >
                            🛑 Urgent Update
                        </motion.div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase leading-none tracking-tighter" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <span className="text-[#FF9933]">Mission</span> <span className="text-[#000080]">Extended!</span>
                        </h2>
                        <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-wide">Samsung Protect Max Yodha</p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 space-y-5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="bg-yellow-50 border-l-4 border-[#FF9933] p-4 rounded-r-xl shadow-sm">
                        <p className="text-slate-800 font-medium leading-relaxed">
                            Soldier! Due to <span className="font-extrabold text-red-600">HEAVY DEMAND</span>, the battlefield remains open until <span className="font-black bg-[#000080] text-white px-1.5 py-0.5 rounded mx-1">Monday, Feb 2nd</span>!
                        </p>
                    </div>

                    <p className="text-slate-600 text-sm font-medium text-center">
                        This is your <span className="underline decoration-wavy decoration-orange-400 decoration-2 font-bold text-slate-800">LAST CHANCE</span> to prove your mettle and crush the Hall of Fame!
                    </p>

                    {/* Objective Box */}
                    <div className="bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-900 p-5 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30">
                                <Award className="text-yellow-300 fill-yellow-300 drop-shadow-lg" size={32} />
                            </div>
                            <div>
                                <h4 className="font-black text-yellow-300 text-lg uppercase tracking-tight">Mission Objective</h4>
                                <p className="text-blue-100 text-xs font-semibold mt-0.5">Score <span className="text-white font-extrabold text-sm border-b border-yellow-300">&gt;80%</span> in Assessment</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider font-bold text-blue-200">INSTANT REWARD</span>
                            <div className="bg-yellow-400 text-[#000080] font-black px-3 py-1 rounded-full text-base shadow-lg animate-bounce flex items-center gap-1">
                                <Star size={14} fill="#000080" /> +10,000 PTS
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <span className="text-xs font-semibold text-slate-500 italic bg-slate-100 px-3 py-1 rounded-full">
                            "Push your ranks higher! Glory awaits the brave!"
                        </span>
                    </div>
                </div>

                {/* Footer Button */}
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <button
                        onClick={handleAcceptChallenge}
                        className="w-full py-3.5 bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:shadow-orange-500/30 active:scale-95 transition-all text-sm group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Accept Challenge <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                        </span>
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                    </button>
                </div>
            </motion.div>
        </div>
    );
});
