import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function BookingNodesMesh() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Node 1: Therapist (Left) */}
      <group position={[-1.2, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshPhysicalMaterial
            color="#2563eb"
            emissive="#1d4ed8"
            emissiveIntensity={0.5}
            roughness={0.2}
            transmission={0.6}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Connecting Bridge 1 */}
      <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.9, 12]} />
        <meshPhysicalMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>

      {/* Node 2: Calendar / Booking (Center) */}
      <group position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 0.6, 0.12]} />
          <meshPhysicalMaterial
            color="#0284c7"
            emissive="#0369a1"
            emissiveIntensity={0.4}
            roughness={0.15}
            transmission={0.7}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <boxGeometry args={[0.3, 0.3, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Connecting Bridge 2 */}
      <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.9, 12]} />
        <meshPhysicalMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>

      {/* Node 3: Session / Meet (Right) */}
      <group position={[1.2, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshPhysicalMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={0.5}
            roughness={0.2}
            transmission={0.6}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

export default function BookingJourneyNodeCanvas() {
  return (
    <div style={{ width: '180px', height: '110px', position: 'relative' }} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 4, 3]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-2, 1, 2]} intensity={1.2} color="#38bdf8" />
        <BookingNodesMesh />
      </Canvas>
    </div>
  );
}
