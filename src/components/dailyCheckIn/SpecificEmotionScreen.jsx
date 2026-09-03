import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SPECIFIC_EMOTIONS } from './taxonomy';

// Sizing tokens for the 3-tier constellation hierarchy
const TIER_SIZES = {
  primary: {
    width: 'clamp(116px, 31vw, 150px)',
    height: 'clamp(116px, 31vw, 150px)',
    fontSize: 'clamp(1.02rem, 3.5vw, 1.22rem)',
    fontWeight: 800
  },
  secondary: {
    width: 'clamp(98px, 26vw, 124px)',
    height: 'clamp(98px, 26vw, 124px)',
    fontSize: 'clamp(0.9rem, 3.1vw, 1.05rem)',
    fontWeight: 700
  },
  supporting: {
    width: 'clamp(84px, 22vw, 104px)',
    height: 'clamp(84px, 22vw, 104px)',
    fontSize: 'clamp(0.82rem, 2.8vw, 0.94rem)',
    fontWeight: 700
  }
};

// Subtle, independent floating motion trajectories
const FLOAT_TRAJECTORIES = [
  { x: [-2, 2.5, -1.5, -2], y: [-2, 2, -2.5, -2], duration: 9.2, delay: 0 },
  { x: [2, -2, 2.5, 2], y: [-1.5, -3, 1.5, -1.5], duration: 11.0, delay: 0.8 },
  { x: [-2.5, 2, -2, -2.5], y: [1.5, 2.5, -1.5, 1.5], duration: 9.8, delay: 1.6 },
  { x: [2, -2.5, 1.5, 2], y: [2, -2, 2.5, 2], duration: 11.4, delay: 0.4 },
  { x: [-1.5, 2.5, -2, -1.5], y: [-1.5, 2, -2, -1.5], duration: 10.2, delay: 1.2 }
];

export default function SpecificEmotionScreen({
  zone,
  selectedPrimary,
  selectedAdditional = [],
  onConfirm
}) {
  // Reliable emotion list resolution from zone or taxonomy dictionary
  const zoneId = zone?.id || 'high_unpleasant';
  const emotions =
    (zone?.emotions && zone.emotions.length > 0)
      ? zone.emotions
      : (SPECIFIC_EMOTIONS[zoneId] || SPECIFIC_EMOTIONS.high_unpleasant);

  const zoneAccent = zone?.baseColor || zone?.accent || '#38bdf8';
  const zoneGlow = zone?.glowColor || 'rgba(56, 189, 248, 0.45)';
  const zoneActiveBg = zone?.activeBg || zone?.bgGradient || `linear-gradient(135deg, ${zoneAccent} 0%, #0284c7 100%)`;

  // Strictly verify selected emotion belongs to this active category
  const validInitial = emotions.find((e) => e.id === selectedPrimary?.id) || null;
  const [selectedEmotion, setSelectedEmotion] = useState(validInitial);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const valid = emotions.find((e) => e.id === selectedPrimary?.id) || null;
    setSelectedEmotion(valid);
  }, [zone?.id, selectedPrimary?.id]);

  const handleSelectEmotion = (emo) => {
    setSelectedEmotion(emo);

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(10);
      } catch (e) {}
    }
  };

  const handleContinue = () => {
    if (!selectedEmotion) return;
    onConfirm({ primary: selectedEmotion, additional: [] });
  };

  const renderBubble = (emo, idx, customOffset = {}) => {
    if (!emo) return null;
    const isSelected = selectedEmotion?.id === emo.id;
    const isOtherSelected = selectedEmotion && !isSelected;
    const tier = emo.tier || (emo.size === 'large' ? 'primary' : emo.size === 'small' ? 'supporting' : 'secondary');
    const sizeConfig = TIER_SIZES[tier] || TIER_SIZES.secondary;
    const float = FLOAT_TRAJECTORIES[idx % FLOAT_TRAJECTORIES.length];

    // Liquid organic contour keyframes
    const morphKeyframes = [
      '48% 52% 54% 46% / 46% 54% 46% 54%',
      '54% 46% 48% 52% / 52% 48% 54% 46%',
      '46% 54% 52% 48% / 48% 52% 46% 54%',
      '48% 52% 54% 46% / 46% 54% 46% 54%'
    ];

    return (
      <motion.button
        key={emo.id}
        type="button"
        onClick={() => handleSelectEmotion(emo)}
        whileHover={{ scale: 1.05, y: -3 }}
        whileTap={{ scale: 0.94 }}
        animate={{
          scale: isSelected ? [1.12, 1.15, 1.12] : isOtherSelected ? 0.95 : 1,
          opacity: isOtherSelected ? 0.55 : 1
        }}
        transition={
          isSelected
            ? {
                scale: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: 0.25 }
              }
            : { type: 'spring', stiffness: 350, damping: 24 }
        }
        aria-pressed={isSelected}
        aria-label={`Select ${emo.name}: ${emo.def || emo.nuance}`}
        style={{
          position: 'relative',
          width: sizeConfig.width,
          height: sizeConfig.height,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          boxSizing: 'border-box',
          flexShrink: 0,
          zIndex: isSelected ? 20 : 5,
          ...customOffset
        }}
      >
        {/* Layer 1: Ambient Background Drifting Glow */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  borderRadius: morphKeyframes,
                  x: float.x,
                  y: float.y,
                  scale: isSelected ? 1.25 : [1, 1.04, 0.98, 1],
                  opacity: isSelected ? 0.9 : 0.35
                }
          }
          transition={{
            duration: float.duration,
            delay: float.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            inset: '-8px',
            background: isSelected
              ? `radial-gradient(circle, ${zoneGlow} 0%, transparent 75%)`
              : `radial-gradient(circle, ${zoneAccent}30 0%, transparent 75%)`,
            filter: isSelected ? 'blur(12px)' : 'blur(5px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Layer 2: Main Tactile Glass Constellation Body */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  borderRadius: morphKeyframes,
                  x: float.x.map((v) => -v * 0.4),
                  y: float.y.map((v) => -v * 0.4)
                }
          }
          transition={{
            duration: float.duration,
            delay: float.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            inset: 0,
            background: isSelected
              ? zoneActiveBg
              : `linear-gradient(145deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.06) 100%)`,
            border: isSelected
              ? `2px solid #ffffff`
              : `1px solid rgba(255, 255, 255, 0.25)`,
            boxShadow: isSelected
              ? `0 16px 44px -4px ${zoneGlow}, 0 0 24px ${zoneGlow}60, inset 0 2px 6px rgba(255, 255, 255, 0.35)`
              : `0 8px 22px -4px rgba(0, 0, 0, 0.6), inset 0 1px 3px rgba(255, 255, 255, 0.18)`,
            backdropFilter: 'blur(18px)',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        {/* Layer 3: High Contrast Typography */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '6px 10px',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: sizeConfig.fontSize,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.015em',
              lineHeight: 1.15,
              textShadow: isSelected ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.8)'
            }}
          >
            {emo.name}
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
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
        paddingTop: '6px'
      }}
    >
      {/* 1. Reflective Editorial Heading */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: '460px',
          padding: '4px 12px 16px',
          boxSizing: 'border-box'
        }}
      >
        <h1
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.75rem, 6.2vw, 2.5rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1.16,
            color: '#ffffff',
            margin: 0
          }}
        >
          Which feeling feels closest?
        </h1>
        <p
          style={{
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: 'clamp(0.86rem, 3.3vw, 0.98rem)',
            color: '#ffffff',
            opacity: 0.9,
            margin: '6px 0 0 0',
            letterSpacing: '-0.01em',
            fontWeight: 500
          }}
        >
          Take your time. Explore what resonates with you.
        </p>
      </div>

      {/* 2. Deliberately Composed Organic Constellation Field */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(12px, 3vw, 20px)',
          width: '100%',
          maxWidth: '720px',
          padding: '6px 12px 160px',
          boxSizing: 'border-box'
        }}
      >
        {/* Tier 1 + 2 Cluster: Primary Left, Secondary Center, Primary Right */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '520px',
            padding: '0 4px'
          }}
        >
          {emotions[0] && renderBubble(emotions[0], 0)}
          {emotions[3] && renderBubble(emotions[3], 3, { marginTop: '-12px' })}
          {emotions[1] && renderBubble(emotions[1], 1, { marginTop: '8px' })}
        </div>

        {/* Tier 1 Primary Center Anchor */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            maxWidth: '520px',
            padding: '0 8px'
          }}
        >
          {emotions[4] && renderBubble(emotions[4], 4, { transform: 'translateX(-10px)' })}
          {emotions[2] && renderBubble(emotions[2], 2, { transform: 'translateX(10px)' })}
        </div>

        {/* Tier 2 & Tier 3 Supporting Trio */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '520px',
            padding: '0 6px'
          }}
        >
          {emotions[5] && renderBubble(emotions[5], 5, { marginTop: '4px' })}
          {emotions[6] && renderBubble(emotions[6], 6)}
          {emotions[7] && renderBubble(emotions[7], 7, { marginTop: '-8px' })}
        </div>

        {/* Tier 3 Supporting Field */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            maxWidth: '520px',
            padding: '0 8px'
          }}
        >
          {emotions[8] && renderBubble(emotions[8], 8)}
          {emotions[9] && renderBubble(emotions[9], 9, { marginTop: '6px' })}
        </div>

        {/* Remaining Supporting Nuances */}
        {emotions.slice(10).length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(10px, 2.8vw, 18px)',
              alignItems: 'center',
              width: '100%',
              maxWidth: '520px',
              flexWrap: 'wrap',
              marginTop: '4px'
            }}
          >
            {emotions.slice(10).map((emo, idx) =>
              renderBubble(emo, 10 + idx)
            )}
          </div>
        )}
      </div>

      {/* Responsive Styles */}
      <style>{`
        .emotion-selection-dock {
          position: fixed;
          bottom: clamp(14px, 2.5vh, 24px);
          left: 14px;
          right: 14px;
          max-width: 480px;
          margin: 0 auto;
          background: rgba(13, 27, 42, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 20px 48px -6px rgba(0, 0, 0, 0.8), 0 0 24px ${zoneGlow};
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 20px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 50;
          box-sizing: border-box;
        }

        .emotion-dock-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
          width: 100%;
        }

        .emotion-dock-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .emotion-dock-def {
          font-size: 0.86rem;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.4;
          font-weight: 450;
        }

        .emotion-dock-btn {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 12px 20px;
          color: #ffffff;
          font-family: "Plus Jakarta Sans", Inter, -apple-system, sans-serif;
          font-size: 0.94rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 20px -2px ${zoneGlow};
        }

        @media (min-width: 580px) {
          .emotion-selection-dock {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            gap: 18px;
          }
          .emotion-dock-info {
            flex: 1;
            min-width: 0;
          }
          .emotion-dock-btn {
            width: auto;
            flex-shrink: 0;
            padding: 12px 22px;
          }
        }
      `}</style>

      {/* 3. Floating Dark Glass Bottom Information Dock (Only appears when selected) */}
      <AnimatePresence>
        {selectedEmotion && (
          <motion.div
            className="emotion-selection-dock"
            initial={{ y: 70, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 70, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            {/* Emotion Name & Contextual Definition */}
            <div className="emotion-dock-info">
              <div className="emotion-dock-title-row">
                <span
                  style={{
                    fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                    fontSize: '1.08rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '-0.015em'
                  }}
                >
                  {selectedEmotion.name}
                </span>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: zoneAccent,
                    boxShadow: `0 0 10px ${zoneAccent}`
                  }}
                />
              </div>

              <motion.span
                key={selectedEmotion.id}
                className="emotion-dock-def"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {selectedEmotion.def || selectedEmotion.nuance}
              </motion.span>
            </div>

            {/* Tactile Continue CTA */}
            <motion.button
              type="button"
              className="emotion-dock-btn"
              onClick={handleContinue}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              style={{
                background: zoneActiveBg
              }}
            >
              <span>Continue</span>
              <ArrowRight size={16} strokeWidth={2.4} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
