'use client';

import { motion } from 'framer-motion';

interface ValentineHeaderProps {
    userName?: string;
}

export default function ValentineHeader({ userName = 'Dreamer' }: ValentineHeaderProps) {
    return (
        <div className="bg-[#ec255a] rounded-b-[30px] shadow-2xl pb-6 mb-2 px-6 pt-12 relative overflow-hidden shrink-0 z-30 w-full">
            {/* Background Pattern/Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-20 -left-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Right Side Floating White Hearts (Weaving Effect) */}
            <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden pointer-events-none z-0">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-white/40 filter drop-shadow-sm"
                        style={{
                            fontSize: `${Math.random() * 25 + 10}px`,
                            right: `${Math.random() * 60}%`,
                            bottom: -20
                        }}
                        animate={{
                            y: [-20, -150],
                            x: [0, Math.sin(i) * 25, 0],
                            opacity: [0, 0.8, 0],
                            rotate: [0, 20, -20]
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeInOut"
                        }}
                    >
                        🤍
                    </motion.div>
                ))}
            </div>

            {/* Top Row: Brand/Context */}
            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex flex-col text-white">
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 drop-shadow-md">
                        Valentine's
                        <span className="bg-yellow-400 text-[#ec255a] text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider transform -rotate-2 shadow-sm">Special</span>
                    </h1>
                    <div className="flex items-center gap-1 mt-0.5 font-medium opacity-95">
                        <span className="text-sm font-bold tracking-wide">Celebrating Love w/ {userName}</span>
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >❤️</motion.span>
                    </div>
                </div>
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg cursor-pointer hover:bg-white/30 transition-colors">
                    <span className="text-xl">👤</span>
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#ec255a]"></div>
                </div>
            </div>



            {/* Quick Catergories/Tags (Decorative) */}
            <div className="flex justify-between items-center px-1 relative z-10">
                {[
                    { icon: '🌹', label: 'Roses', delay: 0 },
                    { icon: '🍫', label: 'Treats', delay: 0.1 },
                    { icon: '🧸', label: 'Teddy', delay: 0.2 },
                    { icon: '💑', label: 'Date', delay: 0.3 },
                    { icon: '💍', label: 'Propose', delay: 0.4 },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item.delay }}
                        whileHover={{ y: -5 }}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-sm backdrop-blur-sm group-hover:bg-white/90 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-300">
                            {item.icon}
                        </div>
                        <span className="text-[9px] font-bold text-white/90 uppercase tracking-wide group-hover:text-yellow-300 transition-colors">{item.label}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
