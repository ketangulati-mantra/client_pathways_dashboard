import React from 'react';
import { motion } from 'framer-motion';

export function OcdLoopVisual({ size = 320, isMobile = false }) {
  const width = isMobile ? Math.min(size, 260) : size;
  const height = isMobile ? Math.min(size, 220) : size;

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
      }}
    >
      {/* Background Soft Glow Radial */}
      <div
        style={{
          position: 'absolute',
          width: '85%',
          height: '85%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(219, 234, 254, 0.7) 0%, rgba(239, 246, 255, 0.3) 55%, rgba(255, 255, 255, 0) 75%)',
          filter: 'blur(20px)',
          zIndex: 0
        }}
      />

      {/* SVG Canvas for Thought Loop Paths */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="ocdBlueGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
          </linearGradient>

          <linearGradient id="ocdBlueGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="ocdDotGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Outer Orbit / Ring 1 */}
        <motion.circle
          cx="160"
          cy="160"
          r="130"
          stroke="url(#ocdBlueGradient1)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          fill="none"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '160px 160px' }}
        />

        {/* Middle Elliptical Loop 2 */}
        <motion.ellipse
          cx="160"
          cy="160"
          rx="110"
          ry="75"
          stroke="url(#ocdBlueGradient2)"
          strokeWidth="2"
          fill="none"
          initial={{ rotate: -25 }}
          animate={{ rotate: 335 }}
          transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '160px 160px' }}
        />

        {/* Opposite Elliptical Loop 3 */}
        <motion.ellipse
          cx="160"
          cy="160"
          rx="75"
          ry="110"
          stroke="#93c5fd"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          fill="none"
          initial={{ rotate: 45 }}
          animate={{ rotate: -315 }}
          transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '160px 160px' }}
        />

        {/* Inner Organic Flow Wave */}
        <motion.path
          d="M 80,160 C 80,105 115,80 160,80 C 205,80 240,115 240,160 C 240,205 195,240 160,240 C 120,240 80,215 80,160 Z"
          stroke="#0284c7"
          strokeWidth="2.5"
          fill="rgba(239, 246, 255, 0.45)"
          initial={{ scale: 0.96 }}
          animate={{ scale: [0.96, 1.03, 0.96] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 160px' }}
        />

        {/* Focal Core Center: Soft Layered Pulsing Orb */}
        <circle cx="160" cy="160" r="32" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5" />
        <motion.circle
          cx="160"
          cy="160"
          r="20"
          fill="url(#ocdDotGlow)"
          initial={{ scale: 0.9, opacity: 0.85 }}
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 160px' }}
        />
        <circle cx="160" cy="160" r="7" fill="#ffffff" />

        {/* Orbiting Thought Flow Nodes / Micro-Dots */}
        <motion.g
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '160px 160px' }}
        >
          <circle cx="160" cy="30" r="5" fill="#2563eb" />
          <circle cx="160" cy="30" r="10" fill="#2563eb" fillOpacity="0.2" />
        </motion.g>

        <motion.g
          initial={{ rotate: 120 }}
          animate={{ rotate: 480 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '160px 160px' }}
        >
          <circle cx="160" cy="50" r="4" fill="#0284c7" />
          <circle cx="160" cy="50" r="8" fill="#0284c7" fillOpacity="0.2" />
        </motion.g>

        <motion.g
          initial={{ rotate: 240 }}
          animate={{ rotate: 600 }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '160px 160px' }}
        >
          <circle cx="160" cy="65" r="4.5" fill="#38bdf8" />
          <circle cx="160" cy="65" r="9" fill="#38bdf8" fillOpacity="0.25" />
        </motion.g>
      </svg>
    </div>
  );
}
