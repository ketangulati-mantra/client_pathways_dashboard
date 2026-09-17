import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Architectural Smoke Detector mounted naturally in a Quiet Room.
 * Palette: Pale cool sage-gray, subtle muted periwinkle, dark sensory channel, soft lavender highlights.
 */
export default function SmokeDetectorMount({
  step = 1,
  isActivated = false,
  intensity = 0.2,
  userRotationY = 0,
  userRotationX = 0,
  isInspecting = false
}) {
  const groupRef = useRef();
  const lightRef = useRef();
  const roomLightRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!isInspecting) {
      // Dynamic camera/object position depending on the step
      let targetY = 1.3;
      let targetZ = 0;
      let targetRotX = -0.35; // looking up at ceiling
      let targetRotY = 0;

      if (step === 1) {
        targetY = 1.35;
        targetRotX = -0.4;
      } else if (step === 3) {
        targetY = 0.8;
        targetRotX = -0.25; // closer
      } else if (step === 5) {
        targetY = 1.6;
        targetRotX = -0.5; // pushed back into atmosphere
        targetZ = -1.5;
      } else if (step === 7) {
        targetY = 1.1;
        targetRotX = -0.3;
      } else if (step === 8) {
        targetY = 1.4;
        targetRotX = -0.4;
      }

      // Smooth camera drift
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);

      // Subtle vibration if alarm is active
      if (isActivated) {
        const shake = Math.sin(state.clock.elapsedTime * 28) * 0.012 * (intensity + 0.2);
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, shake, 0.2);
      } else {
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.1);
      }
    } else {
      // Manual inspection mode (Step 4)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.1, 0.1);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0.6, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, userRotationY, 0.15);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, userRotationX, 0.15);
    }

    // Indicator light pulse
    if (lightRef.current) {
      if (isActivated) {
        const pulse = 1.0 + Math.sin(state.clock.elapsedTime * (8 + intensity * 6)) * 0.8;
        lightRef.current.intensity = pulse;
      } else {
        const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
        lightRef.current.intensity = pulse;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 1.3, 0]}>
      {/* ============================================================
          1. ARCHITECTURAL CEILING PLANE & WALL INTERSECTION
         ============================================================ */}
      <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial
          color="#F1F4F2"
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Ceiling Mounting Base Plate */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[2.0, 2.1, 0.1, 64]} />
        <meshStandardMaterial
          color="#E5ECE9"
          roughness={0.6}
          metalness={0.02}
        />
      </mesh>

      {/* Subtle Ceiling Shadow Ring */}
      <mesh position={[0, 0.26, 0]}>
        <ringGeometry args={[2.05, 2.45, 64]} />
        <meshBasicMaterial color="#18232B" opacity={0.06} transparent />
      </mesh>

      {/* ============================================================
          2. DETECTOR BODY (PALE SAGE-GRAY ARCHITECTURAL DESIGN)
         ============================================================ */}
      {/* Outer Casing */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.8, 1.95, 0.26, 64]} />
        <meshStandardMaterial
          color="#FAFBFB"
          roughness={0.35}
          metalness={0.02}
        />
      </mesh>

      {/* Sensor Inset Recess Channel (Dark Muted Slate) */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[1.68, 1.72, 0.08, 64]} />
        <meshStandardMaterial
          color="#22303C"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Stepped Front Bevel */}
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[1.48, 1.64, 0.16, 64]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.3}
          metalness={0.02}
        />
      </mesh>

      {/* Central Sensory Disc */}
      <mesh position={[0, -0.24, 0]}>
        <cylinderGeometry args={[0.82, 0.9, 0.08, 48]} />
        <meshStandardMaterial
          color="#EDF2F0"
          roughness={0.4}
          metalness={0.04}
        />
      </mesh>

      {/* Minimal Vent Channels */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 1.22;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh key={i} position={[x, -0.24, z]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.06, 0.02, 0.22]} />
            <meshStandardMaterial color="#4A5863" roughness={0.8} />
          </mesh>
        );
      })}

      {/* Status Indicator Light (Muted Periwinkle / Soft Lavender) */}
      <mesh position={[0, -0.28, 0.45]}>
        <sphereGeometry args={[0.065, 24, 24]} />
        <meshStandardMaterial
          color={isActivated ? '#587A91' : '#7C89A8'}
          emissive={isActivated ? '#587A91' : '#7C89A8'}
          emissiveIntensity={isActivated ? 3.0 : 1.0}
          roughness={0.2}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={[0, -0.4, 0.5]}
        color="#7C89A8"
        intensity={isActivated ? 2.0 : 0.6}
        distance={3.5}
      />
    </group>
  );
}
