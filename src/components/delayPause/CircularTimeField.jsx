import React from 'react';
import { motion } from 'framer-motion';

/**
 * CircularTimeField
 * 
 * Blue-White Theme matching OCDMantra Activities:
 * - Outer track in soft slate/blue
 * - Major tick marks in vibrant sky blue (#0284C7)
 * - Traveling point with bright cyan/blue glow
 * - Center numbers in deep slate navy (#0F172A)
 */
export default function CircularTimeField({
  secondsLeft = 60,
  totalSeconds = 60,
  isRunning = false,
  isStatic = false,
}) {
  const center = 160;
  const radius = 125;
  
  // Progress from 0 to 1
  const progress = isStatic ? 0 : Math.max(0, Math.min(1, (totalSeconds - secondsLeft) / totalSeconds));
  
  // Angle for traveling point (starts from top -PI/2)
  const angle = -Math.PI / 2 + progress * Math.PI * 2;
  const pointX = center + radius * Math.cos(angle);
  const pointY = center + radius * Math.sin(angle);

  // Generate 60 ticks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const tickAngle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 15 === 0;
    const isFive = i % 5 === 0;
    const tx = center + radius * Math.cos(tickAngle);
    const ty = center + radius * Math.sin(tickAngle);
    const isPassed = !isStatic && (i / 60) <= progress;

    let dotRadius = 1.4;
    let fill = '#CBD5E1';
    let opacity = 0.6;

    if (isMajor) {
      dotRadius = 2.8;
      fill = '#0284C7';
      opacity = 0.9;
    } else if (isFive) {
      dotRadius = 2.1;
      fill = '#38BDF8';
      opacity = 0.75;
    }

    if (isPassed) {
      fill = '#0284C7';
      opacity = 1;
      dotRadius = isMajor ? 3.2 : 2.2;
    }

    return {
      index: i,
      x: tx,
      y: ty,
      r: dotRadius,
      fill,
      opacity
    };
  });

  return (
    <div className="ssp-timer-frame" aria-label={isStatic ? "60 seconds time field" : `${secondsLeft} seconds remaining`}>
      <svg 
        viewBox="0 0 320 320" 
        className="ssp-timer-svg"
      >
        <defs>
          <radialGradient id="fieldAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#F0F9FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Subtle Blue Glow */}
        <circle 
          cx={center} 
          cy={center} 
          r={radius - 8} 
          fill="url(#fieldAura)" 
        />

        {/* Subtle Guide Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Dynamic Progress Stroke Arc */}
        {!isStatic && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#BAE6FD"
            strokeWidth="2.5"
            strokeDasharray={2 * Math.PI * radius}
            strokeDashoffset={2 * Math.PI * radius * (1 - progress)}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}

        {/* 60 Subtle Circular Marks */}
        {ticks.map((tick) => (
          <circle
            key={tick.index}
            cx={tick.x}
            cy={tick.y}
            r={tick.r}
            fill={tick.fill}
            opacity={tick.opacity}
          />
        ))}

        {/* Traveling Point on Circumference */}
        {!isStatic && (
          <motion.g
            animate={{
              x: pointX,
              y: pointY,
            }}
            transition={{ duration: 0.15, ease: 'linear' }}
          >
            <circle
              cx={0}
              cy={0}
              r={7.5}
              fill="#0284C7"
              opacity="0.3"
            />
            <circle
              cx={0}
              cy={0}
              r={3.8}
              fill="#005387"
            />
            <circle
              cx={0}
              cy={0}
              r={1.2}
              fill="#FFFFFF"
            />
          </motion.g>
        )}

        {/* Static initial resting dot */}
        {isStatic && (
          <circle
            cx={center}
            cy={center - radius}
            r={3.8}
            fill="#0284C7"
            opacity="0.95"
          />
        )}
      </svg>

      {/* Center Display */}
      <div className="ssp-timer-center">
        {isStatic ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span className="ssp-timer-number">60</span>
            <span className="ssp-timer-unit">SECONDS</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.span 
              key={secondsLeft}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="ssp-timer-number"
            >
              {secondsLeft}
            </motion.span>
            <span className="ssp-timer-unit">SECONDS</span>
          </div>
        )}
      </div>
    </div>
  );
}
