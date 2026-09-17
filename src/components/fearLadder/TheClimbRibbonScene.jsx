import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Generate dynamic 3D ribbon curve points based on situation count & difficulties
function generateRibbonCurve(situations) {
  const count = Math.max(situations.length, 1);
  const points = [];

  // Anchor bottom start point
  points.push(new THREE.Vector3(-1.8, -1.8, 0.4));

  if (situations.length === 0) {
    // Initial graceful dormant curve when empty
    points.push(new THREE.Vector3(-0.8, -1.0, 0.2));
    points.push(new THREE.Vector3(0.0, 0.0, 0.0));
    points.push(new THREE.Vector3(0.8, 1.0, -0.2));
    points.push(new THREE.Vector3(1.6, 1.8, -0.5));
  } else {
    situations.forEach((sit, idx) => {
      const t = idx / (count - 1 || 1); // 0 to 1
      // S-curve lateral sweep
      const x = -1.4 + t * 2.8 + Math.sin(t * Math.PI) * 0.4;
      // Vertical height directly mapped to difficulty (0-10) with base offset
      const diffNorm = (sit.difficulty !== undefined ? sit.difficulty : 5) / 10;
      const y = -1.4 + diffNorm * 2.8 + (idx / count) * 0.4;
      const z = (1 - t) * 0.6 - t * 0.8;

      points.push(new THREE.Vector3(x, y, z));
    });
  }

  // Anchor top end point
  const last = points[points.length - 1];
  points.push(new THREE.Vector3(last.x + 0.4, last.y + 0.4, last.z - 0.2));

  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
}

// 3D Sculptural Ribbon Mesh with Extruded cross-section
function SculpturalRibbonMesh({ curve, hasBigJump }) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    // Create an elegant flat ribbon strip cross section
    const shape = new THREE.Shape();
    const w = 0.22;
    const h = 0.025;
    shape.moveTo(-w / 2, -h / 2);
    shape.lineTo(w / 2, -h / 2);
    shape.quadraticCurveTo(w / 2 + 0.02, 0, w / 2, h / 2);
    shape.lineTo(-w / 2, h / 2);
    shape.quadraticCurveTo(-w / 2 - 0.02, 0, -w / 2, -h / 2);

    const extrudeSettings = {
      steps: 120,
      extrudePath: curve,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 3
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [curve]);

  // Gentle subtle breathing motion
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t * 0.4) * 0.04;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={hasBigJump ? '#E87868' : '#35233F'}
        roughness={0.6}
        metalness={0.04}
      />
    </mesh>
  );
}

// Physical Marker Pin attached to the Ribbon
function RibbonPinMarker({
  situation,
  index,
  total,
  curve,
  isActive,
  onSelect
}) {
  const markerRef = useRef();

  // Normalized position along the ribbon curve
  const tParam = useMemo(() => {
    if (total <= 1) return 0.5;
    return 0.12 + (index / Math.max(1, total - 1)) * 0.74;
  }, [index, total]);

  const pos = useMemo(() => {
    const p = curve.getPointAt(Math.min(0.98, Math.max(0.02, tParam)));
    return [p.x, p.y, p.z];
  }, [curve, tParam]);

  useFrame(({ clock }) => {
    if (!markerRef.current) return;
    const t = clock.getElapsedTime();
    if (isActive) {
      markerRef.current.position.y = pos[1] + Math.sin(t * 4) * 0.06 + 0.08;
      markerRef.current.scale.set(1.15, 1.15, 1.15);
    } else {
      markerRef.current.position.y = pos[1];
      markerRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group
      ref={markerRef}
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(index);
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Outer Ceramic Sphere Bead */}
      <mesh castShadow>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshStandardMaterial
          color={isActive ? '#E87868' : '#F1D9CF'}
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>

      {/* Inner Accent Core */}
      <mesh position={[0, 0, 0.08]}>
        <circleGeometry args={[0.07, 24]} />
        <meshBasicMaterial color={isActive ? '#F8F3EE' : '#35233F'} />
      </mesh>

      {/* Step Number */}
      <Text
        position={[0, 0, 0.09]}
        fontSize={0.08}
        color={isActive ? '#35233F' : '#F8F3EE'}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {`${index + 1}`}
      </Text>
    </group>
  );
}

// Camera Choreography
function CameraRig({ viewMode, activeIndex, total }) {
  useFrame(({ camera }) => {
    let targetX = 0;
    let targetY = 0;
    let targetZ = 5.2;

    if (viewMode === 'hero') {
      targetX = 0.5;
      targetY = 0.1;
      targetZ = 4.8;
    } else if (viewMode === 'builder') {
      targetX = 0.6;
      targetY = 0.0;
      targetZ = 4.5;
    } else if (viewMode === 'summary') {
      targetX = 0.0;
      targetY = 0.0;
      targetZ = 5.6;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.lookAt(targetX * 0.2, targetY * 0.2, 0);
  });

  return null;
}

export default function TheClimbRibbonScene({
  situations = [],
  activeStepIndex = null,
  viewMode = 'hero',
  hasBigJump = false,
  onSelectStep = () => {}
}) {
  const curve = useMemo(() => generateRibbonCurve(situations), [situations]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', userSelect: 'none' }}>
      <Canvas
        camera={{ position: [0.5, 0.1, 4.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <CameraRig
          viewMode={viewMode}
          activeIndex={activeStepIndex}
          total={situations.length}
        />

        {/* Studio Lighting */}
        <ambientLight intensity={0.7} color="#FFF7F0" />
        <directionalLight
          position={[4, 6, 5]}
          intensity={1.1}
          color="#FFEADB"
          castShadow
        />
        <pointLight position={[-4, -2, 2]} intensity={0.4} color="#E8C978" />

        {/* Sculptural Ribbon Path */}
        <SculpturalRibbonMesh curve={curve} hasBigJump={hasBigJump} />

        {/* Attached Physical Marker Pins */}
        {situations.map((sit, idx) => (
          <RibbonPinMarker
            key={sit.id || idx}
            situation={sit}
            index={idx}
            total={situations.length}
            curve={curve}
            isActive={activeStepIndex === idx}
            onSelect={onSelectStep}
          />
        ))}
      </Canvas>
    </div>
  );
}
