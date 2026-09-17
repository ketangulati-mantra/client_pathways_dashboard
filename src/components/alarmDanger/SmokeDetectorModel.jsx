import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural Smoke Detector 3D Model
 * Minimal architectural product design: off-white/pale cool gray housing,
 * dark sensor channels, cobalt indicator light, speaker vents, underside bevels.
 */
export default function SmokeDetectorModel({
  rotation = [0, 0, 0],
  isActivated = false,
  intensity = 0.2,
  userRotationY = 0,
  userRotationX = 0,
  isInspecting = false
}) {
  const groupRef = useRef();
  const lightRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!isInspecting) {
      // Subtle idle vibration if activated
      if (isActivated) {
        const shake = Math.sin(state.clock.elapsedTime * 24) * 0.015 * (intensity + 0.3);
        groupRef.current.position.y = shake;
        groupRef.current.position.x = Math.cos(state.clock.elapsedTime * 20) * 0.008 * (intensity + 0.3);
      } else {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
        groupRef.current.position.x = 0;
      }
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0.05, 0.08);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.15, 0.08);
    } else {
      groupRef.current.position.y = 0;
      groupRef.current.position.x = 0;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, userRotationY, 0.15);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, userRotationX, 0.15);
    }

    // Indicator light pulse
    if (lightRef.current) {
      if (isActivated) {
        const pulse = 1.2 + Math.sin(state.clock.elapsedTime * (6 + intensity * 6)) * 0.8;
        lightRef.current.intensity = pulse;
      } else {
        const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
        lightRef.current.intensity = pulse;
      }
    }
  });

  return (
    <group ref={groupRef} rotation={rotation} dispose={null}>
      {/* 1. Base Housing / Ceiling Mount disc */}
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[1.95, 2.05, 0.18, 64]} />
        <meshStandardMaterial
          color="#DCE5EB"
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* 2. Main Outer Chasis (Off-White / Cool Pale Gray) */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[1.85, 1.95, 0.38, 64]} />
        <meshStandardMaterial
          color="#F7F9FA"
          roughness={0.3}
          metalness={0.02}
        />
      </mesh>

      {/* 3. Dark Sensor Airflow Chamber Inset Channel */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[1.72, 1.76, 0.12, 64]} />
        <meshStandardMaterial
          color="#182330"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* 4. Top Stepped Beveled Face */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[1.52, 1.7, 0.24, 64]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* 5. Center Sensory Dome Button */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.78, 0.88, 0.12, 48]} />
        <meshStandardMaterial
          color="#EFF3F6"
          roughness={0.35}
          metalness={0.08}
        />
      </mesh>

      {/* 6. Precision Speaker Vents Ring */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 1.25;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh key={i} position={[x, 0.285, z]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.08, 0.02, 0.26]} />
            <meshStandardMaterial color="#374151" roughness={0.7} />
          </mesh>
        );
      })}

      {/* 7. Cobalt Signal Status Indicator (The glowing eye) */}
      <mesh position={[0, 0.35, 0.42]}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial
          color={isActivated ? '#3155FF' : '#3155FF'}
          emissive={isActivated ? '#3155FF' : '#3155FF'}
          emissiveIntensity={isActivated ? 3.5 : 1.2}
          roughness={0.1}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.45, 0.45]}
        color="#3155FF"
        intensity={isActivated ? 2.5 : 0.8}
        distance={3.5}
      />

      {/* 8. Subtle Side Status Accent Mark */}
      <mesh position={[1.72, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.14, 16]} />
        <meshStandardMaterial
          color="#8B87FF"
          emissive="#8B87FF"
          emissiveIntensity={1.0}
        />
      </mesh>
    </group>
  );
}
