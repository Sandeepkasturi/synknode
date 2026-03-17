import React from 'react';
import logo from '@/assets/logo.png';
import './Logo3DAnimation.css';

interface Logo3DAnimationProps {
  isTransferring?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo3DAnimation: React.FC<Logo3DAnimationProps> = ({
  isTransferring = false,
  size = 'lg',
}) => {
  const sizeMap = { sm: 80, md: 120, lg: 160 };
  const px = sizeMap[size];

  return (
    <div
      className="logo3d-scene"
      style={{ width: px, height: px, perspective: 600 }}
    >
      {/* Glow pulse */}
      <div className={`logo3d-glow ${isTransferring ? 'logo3d-glow--active' : ''}`} />

      {/* Orbit ring */}
      <div className={`logo3d-ring ${isTransferring ? 'logo3d-ring--active' : ''}`} />
      <div className={`logo3d-ring logo3d-ring--2 ${isTransferring ? 'logo3d-ring--active' : ''}`} />

      {/* Particles */}
      {isTransferring && (
        <div className="logo3d-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="logo3d-particle"
              style={{
                '--i': i,
                '--total': 12,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Logo */}
      <div className={`logo3d-card ${isTransferring ? 'logo3d-card--active' : ''}`}>
        <img src={logo} alt="SynkNode" className="logo3d-img" />
      </div>
    </div>
  );
};
