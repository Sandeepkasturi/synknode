import React from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';
import planet from '@/assets/InShot_20251211_073704303.jpg';

interface OrbitalAnimationProps {
  isTransferring?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const OrbitalAnimation: React.FC<OrbitalAnimationProps> = ({ 
  isTransferring = false,
  size = 'lg'
}) => {
  const sizeClasses = {
    sm: { container: 'w-32 h-32', sun: 'w-16 h-16', planet: 'w-8 h-8', orbit: 'w-28 h-28' },
    md: { container: 'w-48 h-48', sun: 'w-20 h-20', planet: 'w-10 h-10', orbit: 'w-40 h-40' },
    lg: { container: 'w-64 h-64', sun: 'w-24 h-24', planet: 'w-12 h-12', orbit: 'w-56 h-56' },
  };

  const s = sizeClasses[size];
  const orbitDuration = isTransferring ? 3 : 8;

  return (
    <div className={`relative ${s.container} flex items-center justify-center`}>
      {/* Orbital rings */}
      <motion.div
        className={`absolute ${s.orbit} rounded-full border border-primary/20`}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={`absolute ${s.orbit} rounded-full border border-dashed border-primary/10`}
        style={{ transform: 'scale(0.75)' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      {/* Glow effect */}
      <motion.div
        className={`absolute ${s.sun} rounded-full bg-gradient-to-r from-purple-500/30 via-cyan-400/30 to-purple-500/30 blur-xl`}
        animate={{
          scale: isTransferring ? [1, 1.5, 1] : [1, 1.2, 1],
          opacity: isTransferring ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: isTransferring ? 1 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Sun (Main Logo) */}
      <motion.div
        className={`relative ${s.sun} rounded-full overflow-hidden z-10`}
        animate={{
          boxShadow: isTransferring 
            ? ['0 0 20px rgba(139, 92, 246, 0.5)', '0 0 40px rgba(139, 92, 246, 0.8)', '0 0 20px rgba(139, 92, 246, 0.5)']
            : ['0 0 10px rgba(139, 92, 246, 0.3)', '0 0 20px rgba(139, 92, 246, 0.5)', '0 0 10px rgba(139, 92, 246, 0.3)'],
        }}
        transition={{
          duration: isTransferring ? 0.5 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img 
          src={logo} 
          alt="SynkNode" 
          className="w-full h-full object-cover rounded-full"
        />
      </motion.div>

      {/* Orbiting Planet */}
      <motion.div
        className="absolute"
        animate={{ rotate: 360 }}
        transition={{
          duration: orbitDuration,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ 
          width: size === 'lg' ? '224px' : size === 'md' ? '160px' : '112px',
          height: size === 'lg' ? '224px' : size === 'md' ? '160px' : '112px',
        }}
      >
        <motion.div
          className={`absolute ${s.planet} rounded-full overflow-hidden shadow-lg`}
          style={{ 
            top: '0%', 
            left: '50%', 
            transform: 'translateX(-50%)',
          }}
          animate={{
            scale: isTransferring ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: isTransferring ? Infinity : 0,
          }}
        >
          <img 
            src={planet} 
            alt="Planet" 
            className="w-full h-full object-cover rounded-full ring-2 ring-primary/30"
          />
          {/* Planet glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/30 to-emerald-500/30"
            animate={{
              opacity: isTransferring ? [0.3, 0.6, 0.3] : [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Data transfer particles (only when transferring) */}
      {isTransferring && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400"
              initial={{ 
                x: 0, 
                y: 0,
                opacity: 0,
              }}
              animate={{
                x: [0, Math.cos((i * 60) * Math.PI / 180) * 80],
                y: [0, Math.sin((i * 60) * Math.PI / 180) * 80],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};
