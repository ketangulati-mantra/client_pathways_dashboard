import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getContextualIntensity } from './intensityContext';

export default function IntensityScreen({
  primaryEmotion,
  zone,
  initialIntensity = 3,
  onConfirm
}) {
  const [intensity, setIntensity] = useState(initialIntensity || 3);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setIntensity(initialIntensity || 3);
  }, [primaryEmotion?.id, initialIntensity]);

  // Contextual scale resolution based on the selected emotion and quadrant
  const contextConfig = getContextualIntensity({
    emotionId: primaryEmotion?.id,
    emotionName: primaryEmotion?.name,
    zoneId: zone?.id
  });

  const selectedLevel = contextConfig.levels[intensity] || contextConfig.levels[3];
  const leftLabel = contextConfig.leftLabel || 'Slightly present';
  const rightLabel = contextConfig.rightLabel || 'Very intense';

  const zoneAccent = zone?.baseColor || zone?.accent || '#38bdf8';
  const zoneGlow = zone?.glowColor || 'rgba(56, 189, 248, 0.45)';
  const activeOrbBg = `linear-gradient(135deg, ${zoneAccent} 0%, #0d2033 100%)`;
  const selectedNodeBg = `linear-gradient(135deg, ${zoneAccent} 0%, #0f2438 100%)`;
  const primaryButtonBg = `linear-gradient(135deg, ${zoneAccent} 0%, #0284c7 100%)`;

  // Dynamic visual orb size mapped to 1-5
  const orbSizes = {
    1: 104,
    2: 116,
    3: 128,
    4: 140,
    5: 152
  };

  const orbOpacities = {
    1: 0.35,
    2: 0.5,
    3: 0.65,
    4: 0.82,
    5: 0.95
  };

  const currentOrbSize = orbSizes[intensity] || 128;
  const currentGlowOpacity = orbOpacities[intensity] || 0.65;

  const handleSelectLevel = (level) => {
    setIntensity(level);

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(10);
      } catch (e) {}
    }
  };

  const handleContinue = () => {
    onConfirm(intensity);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: '460px',
        margin: '0 auto',
        padding: 'clamp(4px, 1.5vh, 12px) 16px clamp(90px, 14vh, 110px)',
        gap: 'clamp(14px, 2.2vh, 20px)',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Reflective Heading & Emotion Pill */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <h1
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.85rem, 6vw, 2.35rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1.16,
            color: '#ffffff',
            margin: 0
          }}
        >
          How intense does this feel right now?
        </h1>

        {/* Selected Emotion Context Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '9999px',
            padding: '4px 14px',
            marginTop: '2px'
          }}
        >
          <span style={{ fontSize: '0.84rem', color: '#cbd5e1', fontWeight: 500 }}>
            Reflecting on
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: zoneAccent,
                boxShadow: `0 0 10px ${zoneAccent}`
              }}
            />
            <span
              style={{
                fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                fontSize: '0.86rem',
                fontWeight: 800,
                color: '#ffffff'
              }}
            >
              {primaryEmotion?.name || 'this feeling'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Central Glowing Interactive Orb */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(150px, 20vh, 185px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Soft Diffused Ambient Background Glow */}
        <motion.div
          animate={{
            width: currentOrbSize * 1.4,
            height: currentOrbSize * 1.4,
            opacity: currentGlowOpacity * 0.75,
            scale: shouldReduceMotion ? 1 : [1, 1.05, 1]
          }}
          transition={{
            width: { type: 'spring', stiffness: 300, damping: 25 },
            height: { type: 'spring', stiffness: 300, damping: 25 },
            opacity: { duration: 0.3 },
            scale: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${zoneGlow} 0%, ${zoneAccent}33 50%, transparent 75%)`,
            filter: 'blur(26px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Tactile Opaque Glowing Sphere */}
        <motion.div
          animate={{
            width: currentOrbSize,
            height: currentOrbSize,
            borderRadius: [
              '48% 52% 54% 46% / 46% 54% 46% 54%',
              '54% 46% 48% 52% / 52% 48% 54% 46%',
              '48% 52% 54% 46% / 46% 54% 46% 54%'
            ],
            scale: shouldReduceMotion ? 1 : [1, 1.02, 1]
          }}
          transition={{
            width: { type: 'spring', stiffness: 320, damping: 26 },
            height: { type: 'spring', stiffness: 320, damping: 26 },
            borderRadius: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{
            position: 'relative',
            background: activeOrbBg,
            border: '2px solid rgba(255, 255, 255, 0.45)',
            boxShadow: `0 14px 36px -4px ${zoneGlow}, 0 0 24px ${zoneGlow}60, inset 0 2px 6px rgba(255, 255, 255, 0.4)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            zIndex: 1,
            boxSizing: 'border-box',
            padding: '8px'
          }}
        >
          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: 'clamp(1.6rem, 5vw, 2.1rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
            }}
          >
            {intensity}
          </span>
          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: 'clamp(0.74rem, 2.4vw, 0.84rem)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.01em',
              padding: '0 4px',
              textAlign: 'center'
            }}
          >
            {selectedLevel.label}
          </span>
        </motion.div>
      </div>

      {/* 3. Horizontal 1–5 Selector Rail */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          padding: '0 8px',
          boxSizing: 'border-box'
        }}
      >
        {/* Track Boundary Labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0 4px',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#cbd5e1',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}
        >
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>

        {/* 5-Node Interactive Rail Container */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '46px',
            padding: '0 2px',
            boxSizing: 'border-box'
          }}
        >
          {/* Base Connecting Line */}
          <div
            style={{
              position: 'absolute',
              left: '20px',
              right: '20px',
              height: '3px',
              background: 'rgba(255, 255, 255, 0.14)',
              borderRadius: '9999px',
              zIndex: 1
            }}
          />

          {/* Active Illuminated Segment */}
          <motion.div
            animate={{
              width: `${((intensity - 1) / 4) * 100}%`
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            style={{
              position: 'absolute',
              left: '20px',
              maxWidth: 'calc(100% - 40px)',
              height: '3px',
              background: zoneAccent,
              boxShadow: `0 0 10px ${zoneAccent}`,
              borderRadius: '9999px',
              zIndex: 2
            }}
          />

          {/* 5 Interactive Nodes with Solid Opaque Background */}
          {[1, 2, 3, 4, 5].map((lvl) => {
            const isSelected = lvl === intensity;
            const isPassed = lvl <= intensity;
            const itemLabel = contextConfig.levels[lvl]?.label || `Level ${lvl}`;

            return (
              <motion.button
                key={lvl}
                type="button"
                onClick={() => handleSelectLevel(lvl)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                animate={{
                  scale: isSelected ? 1.18 : 1
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                aria-label={`Level ${lvl}: ${itemLabel}`}
                aria-pressed={isSelected}
                style={{
                  position: 'relative',
                  zIndex: 4,
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: isSelected
                    ? `2.5px solid #ffffff`
                    : isPassed
                    ? `1.5px solid ${zoneAccent}`
                    : '1.5px solid rgba(255, 255, 255, 0.22)',
                  background: isSelected
                    ? selectedNodeBg
                    : isPassed
                    ? '#0c1a29'
                    : '#09121d',
                  boxShadow: isSelected
                    ? `0 0 18px ${zoneGlow}, 0 4px 12px rgba(0, 0, 0, 0.7)`
                    : isPassed
                    ? `0 0 10px ${zoneAccent}35, 0 2px 8px rgba(0, 0, 0, 0.6)`
                    : '0 2px 6px rgba(0, 0, 0, 0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                  padding: 0
                }}
              >
                <span
                  style={{
                    fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                    fontSize: isSelected ? '1rem' : '0.9rem',
                    fontWeight: 800,
                    color: isSelected
                      ? '#ffffff'
                      : isPassed
                      ? zoneAccent
                      : '#64748b'
                  }}
                >
                  {lvl}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4. Contextual Feedback Card */}
      <div
        style={{
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={intensity}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              backdropFilter: 'blur(16px)',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: zoneAccent,
                  letterSpacing: '-0.015em'
                }}
              >
                {selectedLevel.label}
              </span>
              <span style={{ fontSize: '0.84rem', color: '#cbd5e1', fontWeight: 600 }}>
                · Level {intensity} of 5
              </span>
            </div>

            <p
              style={{
                fontSize: '0.88rem',
                color: '#cbd5e1',
                lineHeight: 1.45,
                margin: 0,
                fontWeight: 400
              }}
            >
              {selectedLevel.desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 5. Sticky Bottom Action Area */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, rgba(13, 27, 42, 0) 0%, rgba(13, 27, 42, 0.88) 32%, rgba(13, 27, 42, 0.98) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '12px 16px clamp(16px, 3vh, 24px)',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 40,
          boxSizing: 'border-box'
        }}
      >
        <motion.button
          type="button"
          onClick={handleContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          style={{
            width: '100%',
            maxWidth: '460px',
            background: primaryButtonBg,
            border: 'none',
            borderRadius: '16px',
            padding: '14px 24px',
            color: '#ffffff',
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: '0.98rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: `0 8px 24px -2px ${zoneGlow}`
          }}
        >
          <span>Continue</span>
          <ArrowRight size={17} strokeWidth={2.4} />
        </motion.button>
      </div>
    </motion.div>
  );
}
