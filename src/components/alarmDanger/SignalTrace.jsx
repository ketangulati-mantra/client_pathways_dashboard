import React from 'react';
import { motion } from 'framer-motion';

export default function SignalTrace({ active }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '28%',
        left: '52%',
        width: '280px',
        height: '100px',
        pointerEvents: 'none',
        zIndex: 20,
        overflow: 'visible'
      }}
    >
      <svg
        width="280"
        height="100"
        viewBox="0 0 280 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Subtle background guide path */}
        <path
          d="M 0 50 Q 80 20 180 35 T 270 20"
          stroke="rgba(49, 85, 255, 0.12)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Animated Cobalt Signal Trace */}
        {active && (
          <motion.path
            d="M 0 50 Q 80 20 180 35 T 270 20"
            stroke="url(#signalGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 0.8, 1],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1]
            }}
          />
        )}

        {/* Small Data / Waveform Marks */}
        <circle cx="180" cy="35" r="2.5" fill="#3155FF" opacity={active ? 0.8 : 0.2} />
        <circle cx="270" cy="20" r="2" fill="#8B87FF" opacity={active ? 0.9 : 0.2} />

        <defs>
          <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3155FF" stopOpacity="0.2" />
            <stop offset="60%" stopColor="#3155FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#8B87FF" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tiny Coordinate / Frequency Label */}
      <div
        style={{
          position: 'absolute',
          right: '0',
          top: '0',
          fontSize: '0.62rem',
          fontFamily: "'Inter', monospace",
          fontWeight: 700,
          color: '#3155FF',
          letterSpacing: '0.08em',
          opacity: active ? 0.85 : 0.3,
          transition: 'opacity 0.4s ease'
        }}
      >
        SIG // TX.01
      </div>
    </div>
  );
}
