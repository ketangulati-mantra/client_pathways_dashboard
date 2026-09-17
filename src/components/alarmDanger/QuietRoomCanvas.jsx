import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import SmokeDetectorMount from './SmokeDetectorMount';

export default function QuietRoomCanvas({
  step = 1,
  isActivated = false,
  intensity = 0.2,
  userRotationY = 0,
  userRotationX = 0,
  isInspecting = false
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: isInspecting ? 'auto' : 'none'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Soft Early-Morning Studio Daylight */}
        <ambientLight intensity={1.3} color="#F1F4F2" />
        <directionalLight position={[6, 8, 5]} intensity={1.5} color="#FFFFFF" />
        <directionalLight position={[-6, 3, -3]} intensity={0.6} color="#DDE8E5" />
        <directionalLight position={[0, -4, 2]} intensity={0.4} color="#D8D5E5" />

        <Suspense fallback={null}>
          <SmokeDetectorMount
            step={step}
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
