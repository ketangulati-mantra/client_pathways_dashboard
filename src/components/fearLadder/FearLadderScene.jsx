import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Procedural curved path points through the landscape
function generatePathCurve() {
  const points = [
    new THREE.Vector3(-2.8, -1.2, 1.2),
    new THREE.Vector3(-1.8, -0.7, 0.6),
    new THREE.Vector3(-0.8, -0.2, 0.2),
    new THREE.Vector3(0.3, 0.3, -0.2),
    new THREE.Vector3(1.4, 0.9, -0.6),
    new THREE.Vector3(2.6, 1.6, -1.1)
  ];
  return new THREE.CatmullRomCurve3(points);
}

// 3D Soft Clay Miniature Landscape
function MiniatureLandscape() {
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(12, 10, 32, 32);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 0.4) * 0.4 + Math.cos(y * 0.3) * 0.3 + (x > 0 ? x * 0.25 : 0);
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group rotation={[-Math.PI / 2.6, 0, 0]} position={[0, -0.8, -0.5]}>
      {/* Soft Terracotta / Warm Paper Clay Base */}
      <mesh geometry={terrainGeo} receiveShadow>
        <meshStandardMaterial
          color="#E6DED1"
          roughness={0.85}
          metalness={0.05}
          flatShading={false}
        />
      </mesh>

      {/* Decorative Gentle Sage Hills */}
      <mesh position={[-2.5, 2.0, 0.6]} scale={[1.8, 1.4, 0.8]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#A9BE9F" roughness={0.9} />
      </mesh>
      <mesh position={[3.2, -1.0, 0.7]} scale={[2.2, 1.6, 1.1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#A9BE9F" roughness={0.9} />
      </mesh>

      {/* Small Tactile Stones */}
      <mesh position={[-1.2, -1.8, 0.1]} scale={[0.25, 0.2, 0.15]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#D9785B" roughness={0.8} />
      </mesh>
      <mesh position={[1.8, 1.5, 0.3]} scale={[0.3, 0.25, 0.2]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#D9785B" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Visual 3D Curved Trail Path
function TrailPath({ curve }) {
  const tubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, 0.09, 8, false);
  }, [curve]);

  return (
    <mesh geometry={tubeGeo} position={[0, 0, 0.02]}>
      <meshStandardMaterial
        color="#F1D98B"
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  );
}

// Tactile Path Signpost Marker
function PathMarker({ situation, index, total, curve, isActive, isHovered, onSelect }) {
  const meshRef = useRef();

  const tParam = useMemo(() => {
    if (total <= 1) return 0.5;
    return 0.12 + (index / Math.max(1, total - 1)) * 0.76;
  }, [index, total]);

  const pos = useMemo(() => {
    const p = curve.getPointAt(tParam);
    return [p.x, p.y + 0.35, p.z];
  }, [curve, tParam]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    if (isActive) {
      meshRef.current.position.y = pos[1] + Math.sin(time * 3) * 0.08 + 0.15;
    } else if (isHovered) {
      meshRef.current.position.y = pos[1] + 0.08;
    } else {
      meshRef.current.position.y = pos[1];
    }
  });

  return (
    <group ref={meshRef} position={pos} onClick={(e) => { e.stopPropagation(); onSelect(index); }}>
      {/* Wooden Signpost Pin */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.45, 12]} />
        <meshStandardMaterial color="#25302B" roughness={0.7} />
      </mesh>

      {/* Terracotta / Forest Sign Head */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.55, 0.3, 0.1]} />
        <meshStandardMaterial
          color={isActive ? '#D9785B' : isHovered ? '#183B32' : '#25302B'}
          roughness={0.5}
        />
      </mesh>

      {/* Difficulty Number Badge */}
      <mesh position={[0.22, 0.18, 0.06]}>
        <circleGeometry args={[0.09, 16]} />
        <meshBasicMaterial color="#F1D98B" />
      </mesh>

      {/* 3D Floating Difficulty Text */}
      <Text
        position={[0, 0.1, 0.06]}
        fontSize={0.11}
        color="#F7F1E7"
        anchorX="center"
        anchorY="middle"
      >
        {`#${index + 1}`}
      </Text>
    </group>
  );
}

// Camera Rig Controller
function CameraController({ viewMode, activeStepIndex, totalSteps, curve }) {
  useFrame(({ camera }) => {
    let targetX = 0;
    let targetY = 0.4;
    let targetZ = 5.2;

    if (viewMode === 'hero') {
      targetX = 0;
      targetY = 0.2;
      targetZ = 5.0;
    } else if (viewMode === 'builder') {
      if (activeStepIndex !== null && totalSteps > 0) {
        const tParam = totalSteps <= 1 ? 0.5 : 0.12 + (activeStepIndex / Math.max(1, totalSteps - 1)) * 0.76;
        const p = curve.getPointAt(tParam);
        targetX = p.x * 0.7;
        targetY = p.y * 0.7 + 0.3;
        targetZ = 3.8;
      } else {
        targetX = 0;
        targetY = 0.5;
        targetZ = 4.8;
      }
    } else if (viewMode === 'summary') {
      targetX = 0;
      targetY = 0.6;
      targetZ = 5.8;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.lookAt(targetX * 0.3, targetY * 0.3, 0);
  });

  return null;
}

export default function FearLadderLandscapeScene({
  situations = [],
  activeStepIndex = null,
  hoveredStepIndex = null,
  viewMode = 'hero',
  onSelectStep = () => {}
}) {
  const curve = useMemo(() => generatePathCurve(), []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', userSelect: 'none' }}>
      <Canvas
        camera={{ position: [0, 0.4, 5.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <CameraController
          viewMode={viewMode}
          activeStepIndex={activeStepIndex}
          totalSteps={situations.length}
          curve={curve}
        />

        {/* Warm Sunlight & Soft Ambient Lighting */}
        <ambientLight intensity={0.65} color="#FFFBF2" />
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.2}
          color="#FFF2D6"
          castShadow
        />
        <hemisphereLight skyColor="#F7F1E7" groundColor="#A9BE9F" intensity={0.4} />

        {/* Handcrafted Landscape Diorama */}
        <MiniatureLandscape />

        {/* Tactile Trail Path */}
        <TrailPath curve={curve} />

        {/* Situations as Path Markers */}
        {situations.map((sit, idx) => (
          <PathMarker
            key={sit.id || idx}
            situation={sit}
            index={idx}
            total={situations.length}
            curve={curve}
            isActive={activeStepIndex === idx}
            isHovered={hoveredStepIndex === idx}
            onSelect={onSelectStep}
          />
        ))}
      </Canvas>
    </div>
  );
}
