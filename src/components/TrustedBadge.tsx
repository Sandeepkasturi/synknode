import React from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

export const TrustedBadge: React.FC = () => {
    return (
        <div className="relative flex items-center justify-center w-24 h-24">
            {/* Central Logo */}
            <div className="relative z-10 w-12 h-12 rounded-full overflow-hidden bg-background ring-2 ring-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                <img src={logo} alt="SynkNode" className="w-full h-full object-cover" />
            </div>

            {/* Revolving Planet Orbit */}
            <motion.div
                className="absolute w-20 h-20 rounded-full border border-primary/20"
                style={{ rotateX: 60, rotateY: 10 }}
            />

            {/* Revolving Planet */}
            <motion.div
                className="absolute w-full h-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(34,211,238,0.8)] relative">
                        {/* Planet Ring */}
                        <div className="absolute inset-0 rounded-full border border-white/30 scale-150" />
                    </div>
                </div>
            </motion.div>

            {/* Orbit Text (Optional: "Trusted Partner") */}
            <div className="absolute -bottom-8 w-max">
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-display">Trusted Partner</span>
            </div>
        </div>
    );
};
