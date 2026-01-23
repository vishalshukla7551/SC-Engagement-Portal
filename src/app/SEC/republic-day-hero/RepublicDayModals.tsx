import React, { memo } from 'react';
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
    Lock
} from 'lucide-react';

// Rank Configuration
export const RANKS = [
    { id: 'cadet', title: 'SALESVEER', minSales: 0, color: 'bg-stone-400', icon: Shield },
    { id: 'lieutenant', title: 'SALES LIEUTENANT', minSales: 21000, color: 'bg-emerald-500', icon: Star },
    { id: 'captain', title: 'SALES CAPTAIN', minSales: 51000, color: 'bg-blue-500', icon: Award },
    { id: 'major', title: 'SALES MAJOR', minSales: 80000, color: 'bg-indigo-600', icon: Award },
    { id: 'colonel', title: 'SALES COMMANDER', minSales: 120000, color: 'bg-purple-600', icon: Award },
    { id: 'brigadier', title: 'SALES CHIEF MARSHAL', minSales: 150000, color: 'bg-orange-500', icon: Star },
    { id: 'general', title: 'SALES GENERAL', minSales: 150000, color: 'bg-gradient-to-r from-red-600 to-orange-600', icon: Crown },
];

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsModal = memo(({ isOpen, onClose }: TermsModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-orange-50 via-white to-green-50">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl text-white shadow-lg"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        >
                            <Gift size={20} />
                        </motion.div>
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
                            { title: 'SALES CHIEF MARSHAL', message: 'Elite status achieved! You\'re among the top performers.', reward: '₹2,500', minSales: 150000 },
                            { title: 'SALES GENERAL', message: 'Supreme excellence! Only ONE person tops the Hall of Fame!', reward: '₹5,000', minSales: 150000 }
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
                                    className={`relative p-4 rounded-2xl bg-gradient-to-br border-2 transition-all hover:scale-[1.02] ${isCurrentRank
                                        ? 'from-blue-50 to-indigo-50 border-blue-400 shadow-lg shadow-blue-300/50 ring-2 ring-blue-400'
                                        : isTopRank
                                            ? 'from-yellow-50 to-orange-50 border-orange-300 shadow-lg shadow-orange-200/50'
                                            : 'from-slate-50 to-white border-slate-200 hover:border-orange-200'
                                        }`}
                                >
                                    {isCurrentRank && (
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-md animate-pulse border border-blue-200">
                                            ⭐ Your Rank
                                        </div>
                                    )}
                                    {isTopRank && !isCurrentRank && (
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg z-20 animate-pulse border border-yellow-200">
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
                                                <span className="text-xs font-bold text-[#000080]">{item.minSales === 0 ? '0' : item.title === 'SALES GENERAL' ? '1.5 lacs plus' : item.minSales.toLocaleString('en-IN')}</span>
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
                        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                            <Star className="text-blue-600 fill-blue-600 shrink-0 mt-0.5" size={18} />
                        </motion.div>
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
