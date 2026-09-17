import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import SmokeDetectorModel from './SmokeDetectorModel';

export default function SmokeDetectorScene({
  isActivated = false,
  intensity = 0.2,
  userRotationY = 0,
  userRotationX = 0,
  isInspecting = false
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '280px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: isInspecting ? 'auto' : 'none'
      }}
    >
      <Canvas
        camera={{ position: [0, 1.2, 4.4], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Soft Studio Lighting */}
        <ambientLight intensity={1.1} color="#EEF5FA" />
        <directionalLight position={[4, 6, 4]} intensity={1.8} color="#FFFFFF" />
        <directionalLight position={[-4, 2, -2]} intensity={0.6} color="#DCEAF3" />
        <directionalLight position={[0, -3, 2]} intensity={0.4} color="#8B87FF" />

        <Suspense fallback={null}>
          <SmokeDetectorModel
            isActivated={isActivated}
            intensity={intensity}
            userRotationY={userRotationY}
            userRotationX={userRotationX}
            isInspecting={isInspecting}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
