import React from 'react';
import logo from '@/assets/logo.png';

interface OrbitalAnimationProps {
  isTransferring?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const OrbitalAnimation: React.FC<OrbitalAnimationProps> = ({
  isTransferring = false,
  size = 'lg'
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const s = sizeClasses[size];

  return (
    <div className={`relative flex items-center justify-center`}>
      {/* Simple Glow */}
      <div
        className={`absolute inset-0 bg-primary/20 blur-2xl rounded-full transition-all duration-1000 ${isTransferring ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}
      />

      {/* Logo container */}
      <div className={`${s} relative z-10 rounded-2xl overflow-hidden bg-background shadow-lg border border-border/10`}>
        <img
          src={logo}
          alt="SynkNode"
          className={`w-full h-full object-cover transition-transform duration-700 ${isTransferring ? 'scale-110' : 'scale-100'}`}
        />
      </div>

      {/* Status Ring if transferring */}
      {isTransferring && (
        <div className="absolute inset-0 -m-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      )}
    </div>
  );
};
