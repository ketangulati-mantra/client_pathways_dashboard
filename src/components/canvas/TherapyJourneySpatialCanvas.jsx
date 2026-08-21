import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 6 Core 3D Therapy Journey Nodes with real product UI aesthetic
const NODES_DATA = [
  { id: 'plan', title: 'Plan', pos: [-3.6, 2.2, 0], color: '#2563eb', emissive: '#1d4ed8' },
  { id: 'branch_ai', title: 'AI Match', pos: [-1.4, 1.2, 0.6], color: '#0284c7', emissive: '#0369a1' },
  { id: 'branch_self', title: 'Browse', pos: [-1.4, -0.2, -0.6], color: '#06b6d4', emissive: '#0891b2' },
  { id: 'match_converge', title: 'Match', pos: [0.4, 0.5, 0.2], color: '#3b82f6', emissive: '#2563eb' },
  { id: 'chat', title: 'Chat', pos: [2.0, -0.8, 0.4], color: '#6366f1', emissive: '#4f46e5' },
  { id: 'book', title: 'Book', pos: [1.2, -2.4, -0.2], color: '#10b981', emissive: '#059669' },
  { id: 'session', title: 'Session', pos: [-1.0, -3.8, 0.3], color: '#2563eb', emissive: '#1d4ed8' },
  { id: 'continue', title: 'Continue', pos: [-3.0, -5.2, -0.5], color: '#0284c7', emissive: '#0369a1' }
];

function FloatingSplineTrack({ isMobile }) {
  // Main spine curve
  const mainCurve = useMemo(() => {
    const pts = [
      new THREE.Vector3(-4.8, 3.2, -0.8),
      new THREE.Vector3(-3.6, 2.2, 0),
      new THREE.Vector3(-2.4, 1.4, 0.3),
      new THREE.Vector3(0.4, 0.5, 0.2),
      new THREE.Vector3(2.0, -0.8, 0.4),
      new THREE.Vector3(1.2, -2.4, -0.2),
      new THREE.Vector3(-1.0, -3.8, 0.3),
      new THREE.Vector3(-3.0, -5.2, -0.5),
      new THREE.Vector3(-4.5, -6.5, -1.2)
    ];
    return new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
  }, []);

  // Branch A (AI Match)
  const branchCurveA = useMemo(() => {
    const pts = [
      new THREE.Vector3(-2.4, 1.4, 0.3),
      new THREE.Vector3(-1.4, 1.2, 0.6),
      new THREE.Vector3(0.4, 0.5, 0.2)
    ];
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  }, []);

  // Branch B (Browse)
  const branchCurveB = useMemo(() => {
    const pts = [
      new THREE.Vector3(-2.4, 1.4, 0.3),
      new THREE.Vector3(-1.4, -0.2, -0.6),
      new THREE.Vector3(0.4, 0.5, 0.2)
    ];
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  }, []);

  const segments = isMobile ? 60 : 120;
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(mainCurve, segments, 0.045, 12, false), [mainCurve, segments]);
  const branchGeoA = useMemo(() => new THREE.TubeGeometry(branchCurveA, 30, 0.035, 10, false), [branchCurveA]);
  const branchGeoB = useMemo(() => new THREE.TubeGeometry(branchCurveB, 30, 0.035, 10, false), [branchCurveB]);

  return (
    <group>
      {/* Primary Spline */}
      <mesh geometry={tubeGeo}>
        <meshPhysicalMaterial
          color="#2563eb"
          emissive="#1d4ed8"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.1}
          transmission={0.65}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Branch Paths */}
      <mesh geometry={branchGeoA}>
        <meshPhysicalMaterial
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      <mesh geometry={branchGeoB}>
        <meshPhysicalMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Product Nodes */}
      {NODES_DATA.map((node) => (
        <group key={node.id} position={node.pos}>
          {/* Outer Glass Ring / Sphere */}
          <mesh>
            <sphereGeometry args={[0.26, 24, 24]} />
            <meshPhysicalMaterial
              color={node.color}
              emissive={node.emissive}
              emissiveIntensity={0.5}
              roughness={0.15}
              metalness={0.1}
              transmission={0.7}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Inner Light Core */}
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SceneCameraRigger({ mousePos, scrollProgress, isMobile }) {
  const { camera } = useThree();
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!isMobile) {
      const targetRotX = mousePos.current.y * 0.08;
      const targetRotY = mousePos.current.x * 0.08;
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 3.5, delta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 3.5, delta);
    }

    const p = scrollProgress.current;
    const targetCamZ = 6.2 - p * 3.0;
    const targetCamY = 0.5 - p * 2.2;
    const targetCamX = Math.sin(p * Math.PI) * 0.8;

    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 3, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 3, delta);
    camera.lookAt(0, -p * 1.6, 0);
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[-4, 8, 6]} intensity={1.4} color="#ffffff" />
      <pointLight position={[2, 2, 4]} intensity={2.0} color="#38bdf8" distance={12} />
      <pointLight position={[-2, -3, 3]} intensity={1.5} color="#2563eb" distance={10} />
      <group ref={groupRef}>
        <FloatingSplineTrack isMobile={isMobile} />
      </group>
    </>
  );
}

export default function TherapyJourneySpatialCanvas() {
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
        opacity: 0.95
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.5, 6.2], fov: 42 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <SceneCameraRigger
          mousePos={mousePos}
          scrollProgress={scrollProgress}
          isMobile={isMobile}
        />
      </Canvas>
    </div>
  );
}
