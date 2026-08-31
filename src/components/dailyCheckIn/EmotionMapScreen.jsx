import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EMOTION_ZONES } from './taxonomy';

// Rich, non-uniform liquid morphing profiles with dynamic asymmetrical silhouettes
const ZONE_VISUALS = {
  high_unpleasant: {
    label: 'Stressed\n& Intense',
    baseGradient: 'linear-gradient(135deg, #f87171 0%, #dc2626 50%, #7f1d1d 100%)',
    ambientGlow: 'rgba(239, 68, 68, 0.75)',
    petalGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.65) 0%, rgba(185, 28, 28, 0.2) 100%)',
    morphKeyframes: [
      '35% 65% 58% 42% / 54% 38% 62% 46%',
      '62% 38% 45% 55% / 40% 64% 36% 60%',
      '40% 60% 68% 32% / 62% 44% 56% 38%',
      '55% 45% 36% 64% / 38% 58% 42% 62%',
      '35% 65% 58% 42% / 54% 38% 62% 46%'
    ],
    floatX: [-4, 5, -3, 4, -4],
    floatY: [-5, 3, -6, 2, -5],
    duration: 6.2
  },
  high_pleasant: {
    label: 'Energized\n& Uplifted',
    baseGradient: 'linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #78350f 100%)',
    ambientGlow: 'rgba(245, 158, 11, 0.75)',
    petalGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.65) 0%, rgba(180, 83, 9, 0.2) 100%)',
    morphKeyframes: [
      '58% 42% 38% 62% / 64% 56% 44% 36%',
      '42% 58% 64% 36% / 46% 38% 62% 54%',
      '65% 35% 42% 58% / 58% 65% 35% 42%',
      '38% 62% 56% 44% / 36% 48% 52% 64%',
      '58% 42% 38% 62% / 64% 56% 44% 36%'
    ],
    floatX: [4, -5, 6, -3, 4],
    floatY: [-4, -7, 3, -6, -4],
    duration: 7.0
  },
  low_unpleasant: {
    label: 'Heavy\n& Drained',
    baseGradient: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 50%, #1e3a8a 100%)',
    ambientGlow: 'rgba(59, 130, 246, 0.75)',
    petalGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.65) 0%, rgba(29, 78, 216, 0.2) 100%)',
    morphKeyframes: [
      '42% 58% 68% 32% / 46% 62% 38% 54%',
      '58% 42% 36% 64% / 62% 38% 62% 38%',
      '35% 65% 60% 40% / 38% 54% 46% 62%',
      '64% 36% 44% 56% / 54% 42% 58% 46%',
      '42% 58% 68% 32% / 46% 62% 38% 54%'
    ],
    floatX: [-5, 4, -4, 5, -5],
    floatY: [4, 7, -3, 6, 4],
    duration: 7.6
  },
  low_pleasant: {
    label: 'Calm\n& Content',
    baseGradient: 'linear-gradient(135deg, #34d399 0%, #059669 50%, #064e3b 100%)',
    ambientGlow: 'rgba(16, 185, 129, 0.75)',
    petalGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.65) 0%, rgba(4, 120, 87, 0.2) 100%)',
    morphKeyframes: [
      '60% 40% 46% 54% / 44% 58% 42% 56%',
      '44% 56% 62% 38% / 58% 42% 58% 42%',
      '52% 48% 38% 62% / 38% 64% 36% 62%',
      '38% 62% 54% 46% / 62% 36% 64% 38%',
      '60% 40% 46% 54% / 44% 58% 42% 56%'
    ],
    floatX: [4, -4, 5, -3, 4],
    floatY: [5, -4, 6, -2, 5],
    duration: 6.8
  }
};

export default function EmotionMapScreen({ onSelectZone }) {
  const [selectedId, setSelectedId] = useState(null);
  const shouldReduceMotion = useReducedMotion();

  const topRowZones = EMOTION_ZONES.slice(0, 2);    // Stressed & Intense, Energized & Uplifted
  const bottomRowZones = EMOTION_ZONES.slice(2, 4); // Heavy & Drained, Calm & Content

  const handleZonePress = (zone) => {
    if (selectedId) return;
    setSelectedId(zone.id);

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(12);
      } catch (e) {}
    }

    setTimeout(() => {
      onSelectZone(zone);
    }, 320);
  };

  const renderOrganicShape = (zone) => {
    const visual = ZONE_VISUALS[zone.id] || ZONE_VISUALS.high_unpleasant;
    const isSelected = selectedId === zone.id;
    const isOtherDimmed = selectedId && !isSelected;
    const labelText = visual.label || zone.name || 'Emotion';

    return (
      <motion.button
        key={zone.id}
        type="button"
        onClick={() => handleZonePress(zone)}
        whileHover={!selectedId ? { scale: 1.05, y: -2 } : {}}
        whileTap={!selectedId ? { scale: 0.94 } : {}}
        animate={{
          scale: isSelected ? 1.08 : isOtherDimmed ? 0.92 : 1,
          opacity: isOtherDimmed ? 0.35 : 1
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 24 }}
        style={{
          position: 'relative',
          width: 'clamp(144px, 42vw, 178px)',
          height: 'clamp(144px, 42vw, 178px)',
          border: 'none',
          background: 'transparent',
          cursor: selectedId ? 'default' : 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        {/* Layer 1: Ambient Continuously Morphing Petal (Living Aura Glow) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  borderRadius: visual.morphKeyframes,
                  x: visual.floatX,
                  y: visual.floatY,
                  rotate: [-4, 6, -3, 4, -4],
                  scale: isSelected ? 1.25 : [1, 1.05, 0.96, 1.04, 1]
                }
          }
          transition={{
            duration: visual.duration * 1.1,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            inset: '-8px',
            background: visual.petalGradient,
            filter: isSelected ? 'blur(16px)' : 'blur(9px)',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />

        {/* Layer 2: Main Tactile Liquid Core (Continuously Shifting Non-Uniform Shape) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  borderRadius: visual.morphKeyframes,
                  x: visual.floatX.map((v) => -v * 0.4),
                  y: visual.floatY.map((v) => -v * 0.4),
                  scale: isSelected ? 1.04 : [1, 1.02, 0.985, 1.015, 1]
                }
          }
          transition={{
            duration: visual.duration,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            inset: 0,
            background: visual.baseGradient,
            boxShadow: isSelected
              ? `0 22px 54px -4px ${visual.ambientGlow}, 0 0 30px ${visual.ambientGlow}, inset 0 2px 6px rgba(255, 255, 255, 0.55)`
              : `0 16px 40px -6px ${visual.ambientGlow}, inset 0 1px 4px rgba(255, 255, 255, 0.35)`,
            zIndex: 2,
            pointerEvents: 'none'
          }}
        />

        {/* Layer 3: Crisp Fixed White Typography */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '12px',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: 'clamp(1rem, 3.6vw, 1.18rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.25,
              letterSpacing: '-0.015em',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.75)',
              whiteSpace: 'pre-line',
              textAlign: 'center'
            }}
          >
            {labelText}
          </span>
        </div>
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        minHeight: 'calc(100dvh - 84px)',
        padding: 'clamp(8px, 2vh, 16px) 12px clamp(24px, 4vh, 36px)',
        boxSizing: 'border-box',
        gap: 'clamp(22px, 4.5vh, 36px)',
        position: 'relative'
      }}
    >
      {/* 1. Reflective Editorial Serif Heading */}
      <div style={{ maxWidth: '440px', padding: '0 6px' }}>
        <h1
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.95rem, 6.8vw, 2.65rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1.16,
            color: '#ffffff',
            margin: 0
          }}
        >
          Tap the color that best describes how you feel right now
        </h1>
      </div>

      {/* 2. Floating Tactile Non-Uniform Morphing Liquid Field */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(12px, 3.2vw, 18px)',
          width: '100%',
          maxWidth: '380px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Row: Stressed & Intense (Red) + Energized & Uplifted (Amber) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'clamp(12px, 3.2vw, 18px)',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {topRowZones.map((zone) => renderOrganicShape(zone))}
        </div>

        {/* Bottom Row: Heavy & Drained (Blue) + Calm & Content (Teal/Green) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'clamp(12px, 3.2vw, 18px)',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {bottomRowZones.map((zone) => renderOrganicShape(zone))}
        </div>
      </div>
    </motion.div>
  );
}
