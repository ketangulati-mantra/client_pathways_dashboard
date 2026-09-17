import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural Concentric Pulse Wave
function SignalWave({ index, intensity, mode }) {
  const meshRef = useRef();
  const speed = 0.8 + intensity * 2.2;
  const initialPhase = (index / 4) * Math.PI * 2;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed + initialPhase;
    const progress = (t % (Math.PI * 2)) / (Math.PI * 2); // 0 to 1
    
    // Scale increases outward
    const scale = 0.8 + progress * 2.8;
    meshRef.current.scale.set(scale, scale, 1);
    
    // Opacity fades out as it expands
    const alpha = (1 - progress) * (0.15 + intensity * 0.45);
    meshRef.current.material.opacity = alpha;
  });

  // Dynamic wave color: Mint (0) -> Signal Amber (0.5) -> Soft Coral (1.0)
  const waveColor = useMemo(() => {
    if (intensity < 0.4) {
      return new THREE.Color('#9BE3C1'); // Cool Mint
    } else if (intensity < 0.75) {
      return new THREE.Color('#FFB84D'); // Signal Amber
    } else {
      return new THREE.Color('#FF8E7A'); // Soft Coral
    }
  }, [intensity]);

  return (
    <mesh ref={meshRef} position={[0, 0, -index * 0.05]}>
      <ringGeometry args={[0.95, 1.02, 64]} />
      <meshBasicMaterial
        color={waveColor}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Glowing Core Object
function SignalCore({ intensity, mode }) {
  const coreRef = useRef();
  const innerRef = useRef();
  const outerRingsRef = useRef();

  // Determine current palette
  const coreColor = useMemo(() => {
    const c1 = new THREE.Color('#9BE3C1'); // Mint
    const c2 = new THREE.Color('#FFB84D'); // Amber
    const c3 = new THREE.Color('#FF8E7A'); // Coral

    if (intensity < 0.5) {
      return c1.clone().lerp(c2, intensity * 2);
    } else {
      return c2.clone().lerp(c3, (intensity - 0.5) * 2);
    }
  }, [intensity]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      // Rotation rate tied to intensity
      coreRef.current.rotation.z = t * (0.2 + intensity * 0.8);
      coreRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
      
      // Breathing pulse
      const pulse = 1 + Math.sin(t * (2 + intensity * 4)) * (0.05 + intensity * 0.12);
      coreRef.current.scale.set(pulse, pulse, pulse);
    }

    if (outerRingsRef.current) {
      outerRingsRef.current.rotation.z = -t * (0.3 + intensity * 0.6);
      outerRingsRef.current.rotation.x = Math.cos(t * 0.4) * 0.2;
    }
  });

  return (
    <group>
      {/* Central Radiant Sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={0.8 + intensity * 2.2}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Inner Halo */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshBasicMaterial
          color={coreColor}
          transparent
          opacity={0.2 + intensity * 0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Geometric Orbit Ring */}
      <group ref={outerRingsRef}>
        <mesh>
          <torusGeometry args={[1.1, 0.02, 16, 100]} />
          <meshBasicMaterial
            color={coreColor}
            transparent
            opacity={0.4 + intensity * 0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.25, 0.015, 16, 100]} />
          <meshBasicMaterial
            color={coreColor}
            transparent
            opacity={0.25 + intensity * 0.35}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Concentric Signal Wave Emitters */}
      {[0, 1, 2, 3].map((idx) => (
        <SignalWave key={idx} index={idx} intensity={intensity} mode={mode} />
      ))}
    </group>
  );
}

// Dynamic Camera Controller
function CameraRig({ mode, intensity }) {
  useFrame(({ camera }) => {
    let targetZ = 4.2;
    let targetX = 0;
    let targetY = 0;

    if (mode === 'hero') {
      targetZ = 4.0;
      targetX = 0;
      targetY = 0;
    } else if (mode === 'signal_room') {
      // Zoom closer slightly as signal gets louder
      targetZ = 3.6 - intensity * 0.6;
      targetX = 0;
    } else if (mode === 'scenarios') {
      targetX = 1.2; // Move signal to the right/side during scenarios
      targetZ = 4.4;
      targetY = 0.2;
    } else if (mode === 'affirmation') {
      targetX = 0;
      targetZ = 5.2; // Move signal further back into the background
      targetY = -0.3;
    } else if (mode === 'final') {
      targetX = 0;
      targetZ = 4.6;
      targetY = 0.4;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function SignalRoomScene({ intensity = 0.2, mode = 'hero' }) {
  return (
    <div className="w-full h-full relative pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <CameraRig mode={mode} intensity={intensity} />
        
        {/* Calm Ambient & Directional Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight
          position={[0, 0, 2]}
          intensity={1.0 + intensity * 3.0}
          color={intensity > 0.6 ? '#FFB84D' : '#9BE3C1'}
          distance={8}
          decay={2}
        />
        
        {/* Central 3D Signal */}
        <SignalCore intensity={intensity} mode={mode} />
      </Canvas>
    </div>
  );
}
