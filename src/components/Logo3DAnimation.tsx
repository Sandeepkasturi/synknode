import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import logo from '@/assets/logo.png';

interface LogoPlaneProps {
  isTransferring: boolean;
}

const LogoPlane: React.FC<LogoPlaneProps> = ({ isTransferring }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const texture = useLoader(THREE.TextureLoader, logo);

  // Particle system for transfer effect
  const particleCount = 80;
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.5 + Math.random() * 1.2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    return positions;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (meshRef.current) {
      // Gentle float
      meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;
      meshRef.current.rotation.x = Math.cos(t * 0.3) * 0.08;

      if (isTransferring) {
        meshRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.06);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }

    if (glowRef.current) {
      const glowScale = isTransferring
        ? 1.6 + Math.sin(t * 2.5) * 0.2
        : 1.3 + Math.sin(t * 1.5) * 0.08;
      glowRef.current.scale.setScalar(glowScale);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        isTransferring ? 0.25 + Math.sin(t * 3) * 0.1 : 0.12;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.z = t * (isTransferring ? 0.8 : 0.15);
      (particlesRef.current.material as THREE.PointsMaterial).opacity =
        isTransferring ? 0.7 + Math.sin(t * 4) * 0.3 : 0.2;
    }
  });

  return (
    <group>
      {/* Glow backdrop */}
      <mesh ref={glowRef} position={[0, 0, -0.2]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial
          color="#e8770a"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Logo plane */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh ref={meshRef}>
          <planeGeometry args={[2, 2]} />
          <meshStandardMaterial
            map={texture}
            transparent
            toneMapped={false}
            emissive="#e8770a"
            emissiveIntensity={isTransferring ? 0.4 : 0.1}
          />
        </mesh>
      </Float>

      {/* Orbiting particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#e8770a"
          size={0.04}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.008, 8, 64]} />
        <meshBasicMaterial
          color="#e8770a"
          transparent
          opacity={isTransferring ? 0.4 : 0.15}
        />
      </mesh>
    </group>
  );
};

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
    <div style={{ width: px, height: px }} className="relative">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 3]} intensity={1} color="#e8770a" />
        <pointLight position={[-3, -2, 2]} intensity={0.4} color="#fbbf24" />
        <Suspense fallback={null}>
          <LogoPlane isTransferring={isTransferring} />
        </Suspense>
      </Canvas>
    </div>
  );
};
