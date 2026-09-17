import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural floating token tile
function FloatingJourneyToken({ position = [0, 0, 0], color = '#E47761', index = 0 }) {
  const meshRef = useRef();
  const speed = 0.8 + index * 0.2;
  const initialOffset = index * 1.2;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed + initialOffset;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.12;
    meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
    meshRef.current.rotation.y = Math.cos(t * 0.4) * 0.15;
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[0.9, 0.9, 0.14]} />
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.05}
      />
    </mesh>
  );
}

// Gentle connected ribbon path connecting floating tokens
function FloatingPath() {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.8, -1.4, 0.2),
      new THREE.Vector3(-0.9, -0.6, -0.1),
      new THREE.Vector3(0.1, 0.2, 0.3),
      new THREE.Vector3(1.1, 1.0, -0.2),
      new THREE.Vector3(2.0, 1.8, 0.1)
    ]);
  }, []);

  const tubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, 0.04, 8, false);
  }, [curve]);

  return (
    <mesh geometry={tubeGeo}>
      <meshStandardMaterial color="#E4C36A" roughness={0.5} />
    </mesh>
  );
}

export default function CourageJourney3DBackdrop({ stage = 1 }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <ambientLight intensity={0.75} color="#FFFDF9" />
        <directionalLight position={[4, 6, 4]} intensity={1.2} color="#FFF3E6" castShadow />
        <pointLight position={[-3, -2, 2]} intensity={0.5} color="#A9B99A" />

        <FloatingPath />

        {/* Floating Sculptural Tokens in Warm Palette */}
        <FloatingJourneyToken position={[-1.8, -1.4, 0.2]} color="#E47761" index={0} />
        <FloatingJourneyToken position={[-0.9, -0.6, -0.1]} color="#E4C36A" index={1} />
        <FloatingJourneyToken position={[0.1, 0.2, 0.3]} color="#A9B99A" index={2} />
        <FloatingJourneyToken position={[1.1, 1.0, -0.2]} color="#E47761" index={3} />
        <FloatingJourneyToken position={[2.0, 1.8, 0.1]} color="#3D2940" index={4} />
      </Canvas>
    </div>
  );
}
