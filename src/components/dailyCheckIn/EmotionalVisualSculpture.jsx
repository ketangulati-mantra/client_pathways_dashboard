import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Interactive Emotional Sculpture:
 * A 3D-feeling, translucent, volumetric animated object that visually dramatizes
 * the user's emotional resolution (e.g. chaotic fragments gathering into calm, expanding warm golden orbs,
 * gentle breathing ripples, or soft lights warming up).
 */
export default function EmotionalVisualSculpture({
  primaryEmotion,
  intensity = 3,
  contexts = [],
  zone
}) {
  const shouldReduceMotion = useReducedMotion();
  const [settled, setSettled] = useState(false);

  const eId = (primaryEmotion?.id || '').toLowerCase();
  const zoneId = zone?.id || 'high_unpleasant';

  const hasContext = (...items) => items.some((i) => contexts.includes(i));
  const isWork = hasContext('Work', 'Workplace', 'Working', 'Studies', 'School');
  const isFriends = hasContext('Friends', 'Socializing');
  const isHome = hasContext('Home');
  const isAlone = hasContext('By myself');

  // Trigger initial 2.5s emotional transition -> settled state
  useEffect(() => {
    const timer = setTimeout(() => {
      setSettled(true);
    }, 2400);
    return () => clearTimeout(timer);
  }, [eId]);

  // Determine emotional typology
  const isStressedOrAnxious =
    ['anxious', 'stressed', 'overwhelmed', 'tense', 'frustrated', 'angry', 'panicked', 'restless'].includes(eId) ||
    zoneId === 'high_unpleasant';

  const isPositiveOrInspired =
    ['happy', 'joyful', 'excited', 'energized', 'inspired', 'grateful', 'proud', 'playful', 'curious', 'confident'].includes(eId) ||
    zoneId === 'high_pleasant';

  const isCalmOrPeaceful =
    ['calm', 'relaxed', 'peaceful', 'content', 'grounded', 'safe', 'relieved'].includes(eId) ||
    zoneId === 'low_pleasant';

  const isSadOrTired =
    ['sad', 'lonely', 'tired', 'drained', 'down', 'discouraged', 'numb', 'meh'].includes(eId) ||
    zoneId === 'low_unpleasant';

  // Sizing
  const sculptureHeight = 'clamp(115px, 19vh, 160px)';

  // =========================================================================
  // SCENE 1: STRESSED / OVERWHELMED / ANXIOUS (Chaos -> Pause -> Settling)
  // =========================================================================
  if (isStressedOrAnxious) {
    const fragmentCount = intensity >= 4 ? 8 : 6;
    const accentColor = zone?.accent || '#f87171';
    const glowColor = zone?.glowColor || 'rgba(248, 113, 113, 0.45)';

    // Fragment coordinates
    const initialRadii = [46, 52, 42, 58, 48, 54, 44, 50];

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '260px',
          height: sculptureHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          pointerEvents: 'none'
        }}
      >
        {/* Ambient Calming Aura */}
        <motion.div
          animate={{
            scale: settled ? [1, 1.08, 1] : [0.8, 1.15, 1],
            opacity: settled ? 0.65 : 0.4
          }}
          transition={{
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 1.5 }
          }}
          style={{
            position: 'absolute',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glowColor} 0%, rgba(13, 27, 42, 0) 72%)`,
            filter: 'blur(28px)',
            zIndex: 0
          }}
        />

        {/* Central Stabilized Luminous Core */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0.3 }}
          animate={{
            scale: settled ? [1, 1.04, 1] : [0.6, 0.85, 1],
            opacity: settled ? 0.95 : 0.7,
            borderRadius: [
              '48% 52% 54% 46% / 46% 54% 46% 54%',
              '54% 46% 48% 52% / 52% 48% 54% 46%',
              '48% 52% 54% 46% / 46% 54% 46% 54%'
            ]
          }}
          transition={{
            scale: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' },
            borderRadius: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 1.8 }
          }}
          style={{
            position: 'relative',
            width: '64px',
            height: '64px',
            background: `linear-gradient(135deg, ${accentColor} 0%, #1e1b4b 100%)`,
            border: '1.5px solid rgba(255, 255, 255, 0.35)',
            boxShadow: `0 0 28px ${glowColor}, inset 0 2px 6px rgba(255, 255, 255, 0.4)`,
            zIndex: 2
          }}
        />

        {/* Scattered Fragments That Gradually Slow Down and Assemble */}
        {Array.from({ length: fragmentCount }).map((_, idx) => {
          const angle = (idx / fragmentCount) * 2 * Math.PI;
          const radius = initialRadii[idx % initialRadii.length];
          const startX = Math.cos(angle) * (radius * (intensity >= 4 ? 1.3 : 1.1));
          const startY = Math.sin(angle) * (radius * (intensity >= 4 ? 1.3 : 1.1));
          const settledX = Math.cos(angle) * 24;
          const settledY = Math.sin(angle) * 24;

          return (
            <motion.div
              key={idx}
              initial={{ x: startX, y: startY, opacity: 0.8, scale: 0.8 }}
              animate={
                shouldReduceMotion
                  ? { x: settledX, y: settledY, opacity: 0.7 }
                  : settled
                  ? {
                      x: [settledX, settledX * 1.08, settledX],
                      y: [settledY, settledY * 1.08, settledY],
                      opacity: [0.75, 0.9, 0.75],
                      scale: [0.9, 1, 0.9]
                    }
                  : {
                      x: [startX, startX * 0.7, settledX],
                      y: [startY, startY * 0.7, settledY],
                      opacity: [0.8, 0.9, 0.75],
                      scale: [0.8, 1, 0.9]
                    }
              }
              transition={
                settled
                  ? { duration: 3.5 + idx * 0.4, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 2.2, ease: 'easeOut' }
              }
              style={{
                position: 'absolute',
                width: `${10 + (idx % 3) * 2}px`,
                height: `${10 + (idx % 3) * 2}px`,
                borderRadius: '50%',
                background: `linear-gradient(135deg, #ffffff 0%, ${accentColor} 100%)`,
                boxShadow: `0 0 10px ${accentColor}`,
                border: '1px solid rgba(255, 255, 255, 0.6)',
                zIndex: 3
              }}
            />
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // SCENE 2: POSITIVE / INSPIRED / ENERGIZED (Warm Sunrise & Rising Sparkles)
  // =========================================================================
  if (isPositiveOrInspired) {
    const particleCount = isFriends ? 7 : 5;
    const accentColor = zone?.accent || '#fbbf24';
    const glowColor = zone?.glowColor || 'rgba(251, 191, 36, 0.55)';

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '260px',
          height: sculptureHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          pointerEvents: 'none'
        }}
      >
        {/* Volumetric Sunrise Light Beam / Ambient Halo */}
        <motion.div
          animate={{
            scale: shouldReduceMotion ? 1 : [1, 1.15, 1],
            opacity: [0.55, 0.85, 0.55]
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glowColor} 0%, rgba(245, 158, 11, 0.18) 45%, transparent 74%)`,
            filter: 'blur(30px)',
            zIndex: 0
          }}
        />

        {/* Floating Concentric Orbiting Aura */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  rotate: [0, 360],
                  scale: [1, 1.05, 1]
                }
          }
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{
            position: 'absolute',
            width: '92px',
            height: '92px',
            borderRadius: '50%',
            border: '1.5px dashed rgba(251, 191, 36, 0.45)',
            boxShadow: '0 0 16px rgba(251, 191, 36, 0.25)',
            zIndex: 1
          }}
        />

        {/* Main Golden Luminous Sphere */}
        <motion.div
          initial={{ scale: 0.6, y: 15, opacity: 0 }}
          animate={{
            scale: shouldReduceMotion ? 1 : [1, 1.05, 0.98, 1],
            y: shouldReduceMotion ? 0 : [0, -6, 0],
            opacity: 1,
            borderRadius: [
              '48% 52% 54% 46% / 46% 54% 46% 54%',
              '54% 46% 48% 52% / 52% 48% 54% 46%',
              '48% 52% 54% 46% / 46% 54% 46% 54%'
            ]
          }}
          transition={{
            scale: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
            borderRadius: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 0.8 }
          }}
          style={{
            position: 'relative',
            width: '68px',
            height: '68px',
            background: 'radial-gradient(circle at 35% 30%, #fffbeb 0%, #fde047 30%, #f59e0b 70%, #b45309 100%)',
            border: '2px solid rgba(255, 255, 255, 0.65)',
            boxShadow: `0 12px 32px -4px ${glowColor}, 0 0 24px rgba(251, 191, 36, 0.6), inset 0 2px 6px #ffffff`,
            zIndex: 2
          }}
        />

        {/* Ascending Golden Light Fragments */}
        {Array.from({ length: particleCount }).map((_, idx) => {
          const offsetX = (idx - Math.floor(particleCount / 2)) * 18;
          const delay = idx * 0.45;

          return (
            <motion.div
              key={idx}
              initial={{ y: 20, x: offsetX, opacity: 0, scale: 0.4 }}
              animate={
                shouldReduceMotion
                  ? { y: 0, opacity: 0.6 }
                  : {
                      y: [-10, -42, -58],
                      x: [offsetX, offsetX + (idx % 2 === 0 ? 8 : -8), offsetX],
                      opacity: [0, 0.9, 0],
                      scale: [0.5, 1, 0.4]
                    }
              }
              transition={{
                duration: 3.2,
                repeat: Infinity,
                delay: delay,
                ease: 'easeOut'
              }}
              style={{
                position: 'absolute',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 0 10px #fde047, 0 0 4px #ffffff',
                zIndex: 3
              }}
            />
          );
        })}
      </div>
    );
  }

  // =========================================================================
  // SCENE 3: CALM / PEACEFUL / GROUNDED (Translucent Breathing Orb & Soft Ripples)
  // =========================================================================
  if (isCalmOrPeaceful) {
    const accentColor = zone?.accent || '#34d399';
    const glowColor = zone?.glowColor || 'rgba(52, 211, 153, 0.45)';

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '260px',
          height: sculptureHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          pointerEvents: 'none'
        }}
      >
        {/* Soft Concentric Expanding Breath Ripples */}
        {[0, 1, 2].map((ringIdx) => (
          <motion.div
            key={ringIdx}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={
              shouldReduceMotion
                ? { scale: 1, opacity: 0.3 }
                : {
                    scale: [0.7, 1.45, 1.8],
                    opacity: [0, 0.4, 0]
                  }
            }
            transition={{
              duration: 5.4,
              repeat: Infinity,
              delay: ringIdx * 1.8,
              ease: 'easeOut'
            }}
            style={{
              position: 'absolute',
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              border: `1.5px solid ${accentColor}`,
              boxShadow: `0 0 16px ${glowColor}`,
              zIndex: 0
            }}
          />
        ))}

        {/* Ambient Calming Emerald Halo */}
        <motion.div
          animate={{
            scale: shouldReduceMotion ? 1 : [1, 1.1, 1],
            opacity: [0.45, 0.7, 0.45]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glowColor} 0%, rgba(6, 78, 59, 0.15) 50%, transparent 74%)`,
            filter: 'blur(26px)',
            zIndex: 1
          }}
        />

        {/* Main Translucent Glass Breathing Sphere */}
        <motion.div
          animate={{
            scale: shouldReduceMotion ? 1 : [1, 1.08, 0.96, 1],
            borderRadius: [
              '50% 50% 50% 50%',
              '48% 52% 52% 48% / 52% 48% 48% 52%',
              '50% 50% 50% 50%'
            ]
          }}
          transition={{
            scale: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' },
            borderRadius: { duration: 8, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{
            position: 'relative',
            width: '66px',
            height: '66px',
            background: 'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(52, 211, 153, 0.8) 40%, rgba(5, 150, 105, 0.95) 75%, #064e3b 100%)',
            border: '2px solid rgba(255, 255, 255, 0.65)',
            boxShadow: `0 10px 28px -4px ${glowColor}, 0 0 20px rgba(52, 211, 153, 0.5), inset 0 2px 6px rgba(255, 255, 255, 0.6)`,
            backdropFilter: 'blur(16px)',
            zIndex: 2
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // SCENE 4: SAD / LONELY / DRAINED (Dim Light Gradually Warming & Stabilizing)
  // =========================================================================
  const accentColor = zone?.accent || '#60a5fa';
  const glowColor = zone?.glowColor || 'rgba(96, 165, 250, 0.45)';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '260px',
        height: sculptureHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        pointerEvents: 'none'
      }}
    >
      {/* Soft Protective Embracing Glow */}
      <motion.div
        initial={{ opacity: 0.3, scale: 0.8 }}
        animate={{
          scale: settled ? [1, 1.06, 1] : [0.85, 1],
          opacity: settled ? 0.75 : 0.45
        }}
        transition={{
          scale: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 2.2 }
        }}
        style={{
          position: 'absolute',
          width: '135px',
          height: '135px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(30, 58, 138, 0.18) 50%, transparent 74%)`,
          filter: 'blur(28px)',
          zIndex: 0
        }}
      />

      {/* Gentle Floating Guardian Motes */}
      {Array.from({ length: isAlone ? 6 : 4 }).map((_, idx) => {
        const angle = (idx / (isAlone ? 6 : 4)) * 2 * Math.PI;
        const radius = 38;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.6 }
                : {
                    x: [x, x * 1.15, x],
                    y: [y, y * 1.15, y],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.1, 0.8]
                  }
            }
            transition={{
              duration: 4.2 + idx * 0.5,
              repeat: Infinity,
              delay: idx * 0.4,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: `0 0 8px ${accentColor}`,
              zIndex: 1
            }}
          />
        );
      })}

      {/* Main Dim Light That Gradually Becomes Warmer & Steadier */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0.5 }}
        animate={{
          scale: shouldReduceMotion ? 1 : [1, 1.04, 0.98, 1],
          opacity: settled ? 1 : 0.75,
          borderRadius: [
            '48% 52% 54% 46% / 46% 54% 46% 54%',
            '52% 48% 48% 52% / 50% 50% 50% 50%',
            '48% 52% 54% 46% / 46% 54% 46% 54%'
          ]
        }}
        transition={{
          scale: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 2.2 },
          borderRadius: { duration: 7.5, repeat: Infinity, ease: 'easeInOut' }
        }}
        style={{
          position: 'relative',
          width: '64px',
          height: '64px',
          background: 'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.45) 0%, #60a5fa 35%, #2563eb 70%, #1e3a8a 100%)',
          border: '2px solid rgba(255, 255, 255, 0.55)',
          boxShadow: `0 10px 28px -4px ${glowColor}, 0 0 20px rgba(96, 165, 250, 0.45), inset 0 2px 6px rgba(255, 255, 255, 0.5)`,
          zIndex: 2
        }}
      />
    </div>
  );
}
