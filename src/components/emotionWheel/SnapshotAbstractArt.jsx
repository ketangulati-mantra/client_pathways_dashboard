import React from 'react';

/**
 * SnapshotAbstractArt: Premium editorial white + blue abstract background artwork.
 * Strictly background layer (pointerEvents: none, zIndex: 0) to guarantee 100% typography readability.
 */
export default function SnapshotAbstractArt({ familyName = 'Anger' }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        borderRadius: 'inherit'
      }}
    >
      {/* 1. Soft sky-blue ambient light blooms */}
      <div
        style={{
          position: 'absolute',
          top: '-12%',
          right: '-14%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(37, 99, 235, 0.08) 55%, transparent 75%)',
          filter: 'blur(35px)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '36%',
          left: '-20%',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147, 197, 253, 0.22) 0%, rgba(59, 130, 246, 0.06) 60%, transparent 80%)',
          filter: 'blur(40px)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(191, 219, 254, 0.32) 0%, rgba(96, 165, 250, 0.08) 55%, transparent 75%)',
          filter: 'blur(45px)'
        }}
      />

      {/* 2. Abstract Editorial Vector Line Art & Rings */}
      <svg
        viewBox="0 0 340 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.38
        }}
      >
        <path
          d="M-30,120 C90,70 250,160 370,100"
          stroke="url(#blueWave1)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <path
          d="M-20,190 C80,150 230,270 380,210"
          stroke="url(#blueWave2)"
          strokeWidth="1.2"
        />
        <circle
          cx="290"
          cy="90"
          r="55"
          stroke="url(#blueWave1)"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        <circle
          cx="45"
          cy="500"
          r="95"
          stroke="url(#blueWave2)"
          strokeWidth="1"
          opacity="0.45"
        />

        {/* Tiny decorative stars */}
        <path
          d="M260 210 L262 216 L268 218 L262 220 L260 226 L258 220 L252 218 L258 216 Z"
          fill="#0284c7"
          opacity="0.5"
        />
        <path
          d="M60 380 L61.5 383 L65 384 L61.5 385 L60 388 L58.5 385 L55 384 L58.5 383 Z"
          fill="#38bdf8"
          opacity="0.6"
        />

        <defs>
          <linearGradient id="blueWave1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="blueWave2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* 3. Micro-texture grain overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.025) 1px, transparent 0)',
          backgroundSize: '16px 16px',
          opacity: 0.8
        }}
      />
    </div>
  );
}
