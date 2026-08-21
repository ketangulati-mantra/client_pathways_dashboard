import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 6 Core Nodes representing the user's wellbeing journey
const NODE_DEFINITIONS = [
  { id: 'needs', label: 'Needs', pos: [-3.2, 2.2, 0], color: '#38bdf8', scale: 0.28 },
  { id: 'pathway', label: 'Pathway', pos: [-1.4, 0.8, 1.2], color: '#2563eb', scale: 0.32 },
  { id: 'activities', label: 'Activities', pos: [0.6, 1.4, 2.2], color: '#06b6d4', scale: 0.34 },
  { id: 'tools', label: 'Tools', pos: [2.2, -0.4, 1.0], color: '#3b82f6', scale: 0.3 },
  { id: 'progress', label: 'Progress', pos: [1.2, -2.0, -0.5], color: '#10b981', scale: 0.32 },
  { id: 'support', label: 'Support', pos: [-1.0, -3.2, -1.8], color: '#6366f1', scale: 0.36 }
];

function PathwayMesh({ activeNodeIndex, isMobile }) {
  const curve = useMemo(() => {
    const points = NODE_DEFINITIONS.map(n => new THREE.Vector3(...n.pos));
    points.unshift(new THREE.Vector3(-4.5, 3.5, -1.5));
    points.push(new THREE.Vector3(0, -4.5, -3.0));
    return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
  }, []);

  const tubeGeo = useMemo(() => {
    const tubularSegments = isMobile ? 64 : 120;
    const radialSegments = isMobile ? 8 : 16;
    return new THREE.TubeGeometry(curve, tubularSegments, 0.055, radialSegments, false);
  }, [curve, isMobile]);

  const glowGeo = useMemo(() => {
    const tubularSegments = isMobile ? 48 : 80;
    return new THREE.TubeGeometry(curve, tubularSegments, 0.08, 8, false);
  }, [curve, isMobile]);

  return (
    <group>
      {/* Primary Tube Pathway */}
      <mesh geometry={tubeGeo}>
        <meshPhysicalMaterial
          color="#2563eb"
          emissive="#1d4ed8"
          emissiveIntensity={0.35}
          roughness={0.15}
          metalness={0.1}
          transmission={0.65}
          thickness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Subtle Cyan Inner Glow */}
      <mesh geometry={glowGeo}>
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Connected Nodes */}
      {NODE_DEFINITIONS.map((node, idx) => {
        const isActive = activeNodeIndex === idx;
        return (
          <group key={node.id} position={node.pos}>
            <mesh>
              <sphereGeometry args={[node.scale * (isActive ? 1.35 : 1), 24, 24]} />
              <meshPhysicalMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={isActive ? 0.9 : 0.4}
                transmission={0.7}
                roughness={0.1}
                thickness={0.5}
                transparent
                opacity={0.9}
              />
            </mesh>

            <mesh>
              <sphereGeometry args={[node.scale * 0.45 * (isActive ? 1.4 : 1), 16, 16]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.85}
              />
            </mesh>

            {isActive && (
              <mesh>
                <sphereGeometry args={[node.scale * 1.8, 16, 16]} />
                <meshBasicMaterial
                  color={node.color}
                  transparent
                  opacity={0.2}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function SceneController({ mousePos, scrollProgress, activeNodeIndex, isMobile }) {
  const { camera } = useThree();
  const groupRef = useRef();
  const lightRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!isMobile) {
      const targetRotX = mousePos.current.y * 0.08;
      const targetRotY = mousePos.current.x * 0.08;
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4, delta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 4, delta);
    }

    if (lightRef.current && !isMobile) {
      const targetLightX = mousePos.current.x * 4;
      const targetLightY = mousePos.current.y * 4;
      lightRef.current.position.x = THREE.MathUtils.damp(lightRef.current.position.x, targetLightX, 5, delta);
      lightRef.current.position.y = THREE.MathUtils.damp(lightRef.current.position.y, targetLightY, 5, delta);
    }

    const progress = scrollProgress.current;
    const targetCamZ = 6.2 - progress * 2.8;
    const targetCamY = 0.4 - progress * 1.8;
    const targetCamX = Math.sin(progress * Math.PI) * 0.8;

    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 3, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 3, delta);
    camera.lookAt(0, -progress * 1.2, 0);
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[-5, 8, 5]} intensity={1.2} color="#ffffff" />
      <pointLight ref={lightRef} position={[0, 0, 4]} intensity={1.8} color="#38bdf8" distance={10} />
      <group ref={groupRef}>
        <PathwayMesh activeNodeIndex={activeNodeIndex} isMobile={isMobile} />
      </group>
    </>
  );
}

export default function WellbeingJourneyCanvas({ activeNodeIndex = 0 }) {
  const mousePos = useRef({ x: 0, y: 0 });
  const scrollProgress = useRef(0);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePos.current = { x, y };
    };

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        scrollProgress.current = Math.min(1, Math.max(0, window.scrollY / totalHeight));
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.92
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.4, 6.2], fov: 45 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <SceneController
          mousePos={mousePos}
          scrollProgress={scrollProgress}
          activeNodeIndex={activeNodeIndex}
          isMobile={isMobile}
        />
      </Canvas>
    </div>
  );
}
