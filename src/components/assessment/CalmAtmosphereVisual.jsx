import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * CalmAtmosphereVisual
 *
 * A subtle, organic abstract visual for the Personalized Focus assessment.
 * Communicates calm, reflection, safety, and gentle growth without clinical imagery,
 * smiling stock faces, cartoon therapists, or loud gamified effects.
 *
 * Mode determines gentle ambient shifts:
 * - 'intro': Soft centered breathing orb
 * - 'step1': Grounded reflective teal-blue flow
 * - 'step2': Focused, deepening indigo-lavender flow
 * - 'step3': Slightly warmer, hopeful amber-sky flow
 * - 'result': Harmonious gentle blooming glow
 */
export function CalmAtmosphereVisual({ mode = 'step1', size = 120 }) {
  const shouldReduceMotion = useReducedMotion();

  const configs = {
    intro: {
      gradient1: 'radial-gradient(circle at 35% 35%, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)',
      gradient2: 'radial-gradient(circle at 65% 65%, #c7d2fe 0%, #a5b4fc 60%, transparent 100%)',
      glow: 'rgba(59, 130, 246, 0.18)',
      scaleRange: [1, 1.05, 1],
      rotateRange: [0, 6, 0],
      duration: 8
    },
    step1: {
      gradient1: 'radial-gradient(circle at 30% 30%, #a5f3fc 0%, #38bdf8 50%, #0284c7 100%)',
      gradient2: 'radial-gradient(circle at 70% 70%, #bae6fd 0%, #7dd3fc 60%, transparent 100%)',
      glow: 'rgba(2, 132, 199, 0.16)',
      scaleRange: [1, 1.04, 1],
      rotateRange: [0, -5, 0],
      duration: 9
    },
    step2: {
      gradient1: 'radial-gradient(circle at 35% 35%, #c7d2fe 0%, #818cf8 50%, #4f46e5 100%)',
      gradient2: 'radial-gradient(circle at 60% 60%, #ddd6fe 0%, #c4b5fd 60%, transparent 100%)',
      glow: 'rgba(79, 70, 229, 0.16)',
      scaleRange: [1, 1.05, 1],
      rotateRange: [0, 8, 0],
      duration: 10
    },
    step3: {
      gradient1: 'radial-gradient(circle at 40% 30%, #fed7aa 0%, #f472b6 40%, #818cf8 100%)',
      gradient2: 'radial-gradient(circle at 60% 70%, #fde68a 0%, #fbcfe8 50%, transparent 100%)',
      glow: 'rgba(244, 114, 182, 0.18)',
      scaleRange: [1, 1.06, 1],
      rotateRange: [0, 6, 0],
      duration: 7.5
    },
    result: {
      gradient1: 'radial-gradient(circle at 30% 30%, #bfdbfe 0%, #60a5fa 45%, #2563eb 100%)',
      gradient2: 'radial-gradient(circle at 70% 70%, #bbf7d0 0%, #86efac 50%, transparent 100%)',
      glow: 'rgba(37, 99, 235, 0.20)',
      scaleRange: [1, 1.05, 1],
      rotateRange: [0, 5, 0],
      duration: 8.5
    }
  };

  const current = configs[mode] || configs.step1;

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        pointerEvents: 'none',
        userSelect: 'none'
      }}
      aria-hidden="true"
    >
      {/* Ambient Outer Glow */}
      <motion.div
        animate={
          shouldReduceMotion
            ? { opacity: 0.6 }
            : {
                opacity: [0.5, 0.8, 0.5],
                scale: [0.95, 1.08, 0.95]
              }
        }
        transition={{
          duration: current.duration + 1,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          borderRadius: '50%',
          background: current.glow,
          filter: 'blur(20px)',
          zIndex: 0
        }}
      />

      {/* Primary Organic Shape */}
      <motion.div
        animate={
          shouldReduceMotion
            ? { scale: 1, rotate: 0 }
            : {
                scale: current.scaleRange,
                rotate: current.rotateRange,
                borderRadius: [
                  '54% 46% 50% 50% / 46% 52% 48% 54%',
                  '48% 52% 54% 46% / 54% 48% 52% 46%',
                  '54% 46% 50% 50% / 46% 52% 48% 54%'
                ]
              }
        }
        transition={{
          duration: current.duration,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: current.gradient1,
          borderRadius: '50%',
          boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.45), 0 8px 24px rgba(15, 23, 42, 0.08)',
          zIndex: 1,
          overflow: 'hidden'
        }}
      >
        {/* Internal Flow Highlight */}
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.7 }
              : {
                  opacity: [0.6, 0.9, 0.6],
                  rotate: [0, 360]
                }
          }
          transition={{
            opacity: { duration: current.duration, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 32, repeat: Infinity, ease: 'linear' }
          }}
          style={{
            position: 'absolute',
            inset: '-15%',
            background: current.gradient2,
            borderRadius: '50%',
            filter: 'blur(10px)'
          }}
        />

        {/* Soft Center Sheen */}
        <div
          style={{
            position: 'absolute',
            top: '18%',
            left: '22%',
            width: '28%',
            height: '24%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0) 80%)',
            filter: 'blur(4px)'
          }}
        />
      </motion.div>
    </div>
  );
}
