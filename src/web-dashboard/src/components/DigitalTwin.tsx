import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Box } from '@react-three/drei';
import * as THREE from 'three';

const Building = ({ position, size, color }: any) => {
  return (
    <Box position={position} args={size}>
      <meshStandardMaterial color={color} opacity={0.8} transparent />
    </Box>
  );
};

const CrowdDot = ({ position }: any) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      // Simulate slight movement
      ref.current.position.x += Math.sin(clock.getElapsedTime() + position[0]) * 0.01;
      ref.current.position.z += Math.cos(clock.getElapsedTime() + position[2]) * 0.01;
    }
  });

  return (
    <mesh position={position} ref={ref}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial color="#4ade80" />
    </mesh>
  );
};

const DigitalTwin: React.FC = () => {
  // Generate random crowd dots
  const dots = Array.from({ length: 200 }).map((_, i) => (
    <CrowdDot 
      key={i} 
      position={[(Math.random() - 0.5) * 40, 0.5, (Math.random() - 0.5) * 40]} 
    />
  ));

  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 20, 30], fov: 45 }}>
        <color attach="background" args={['#0a0a0a']} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 20, 5]} intensity={1} castShadow />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <OrbitControls autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2.1} />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        {/* Buildings */}
        <Building position={[-10, 5, -10]} size={[8, 10, 8]} color="#1e293b" />
        <Building position={[15, 8, -5]} size={[10, 16, 12]} color="#1e293b" />
        <Building position={[0, 4, 15]} size={[12, 8, 10]} color="#1e293b" />
        <Building position={[-15, 12, 10]} size={[8, 24, 8]} color="#1e293b" />
        
        {/* Crowd Simulation */}
        {dots}
        
      </Canvas>
    </div>
  );
};

export default DigitalTwin;
