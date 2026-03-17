import React from 'react';
import { Logo3DAnimation } from './Logo3DAnimation';

interface OrbitalAnimationProps {
  isTransferring?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const OrbitalAnimation: React.FC<OrbitalAnimationProps> = ({
  isTransferring = false,
  size = 'lg'
}) => {
  return <Logo3DAnimation isTransferring={isTransferring} size={size} />;
};
