import React from 'react';
import { generateShareableArtifacts } from './shareCopyEngine';

/**
 * ShareableEmotionCard: Dedicated 9:16 Instagram Story Social Quote Card.
 * 
 * DESIGN PRINCIPLES:
 * - Editorial quote aesthetic, zero UI chrome, zero clinical/assessment language.
 * - Generous negative space, elegant typography, atmospheric ambient glow based on emotion family.
 * - Subtle, premium Mantra wordmark.
 * - Strictly privacy-safe.
 */
export default React.forwardRef(function ShareableEmotionCard(
  { emotion, family, intensity = 3, selectedContexts = [], selectedNeeds = [], styleId = 'relatable' },
  ref
) {
  const themeColor = family?.color || '#38bdf8';
  const emotionName = emotion?.name || 'Provoked';
  const familyName = family?.name || 'Anger';

  const allArtifacts = generateShareableArtifacts({
    emotionName,
    familyName,
    intensity,
    selectedContexts,
    selectedNeeds
  });

  const activeContent = allArtifacts[styleId] || allArtifacts.relatable;

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        maxWidth: '340px',
        aspectRatio: '9 / 16',
        maxHeight: '600px',
        background: '#070c14',
        borderRadius: '28px',
        boxShadow: `0 32px 80px -16px rgba(0, 0, 0, 0.9), 0 0 40px ${themeColor}15`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'clamp(36px, 6vh, 48px) clamp(24px, 6vw, 32px)',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
        fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* 1. Atmospheric Abstract Emotional Glow (Organic Aura) */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: themeColor,
          filter: 'blur(75px)',
          opacity: 0.28,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: themeColor,
          filter: 'blur(80px)',
          opacity: 0.15,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Subtle organic texture grain overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* 2. Top Header: Minimal Elegant Headline */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%'
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em'
          }}
        >
          {activeContent.headline}
        </span>
        <div
          style={{
            width: '24px',
            height: '1.5px',
            background: `linear-gradient(90deg, transparent, ${themeColor}80, transparent)`,
            marginTop: '12px'
          }}
        />
      </div>

      {/* 3. Center Piece: Editorial Quote Content with Generous Whitespace */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          margin: 'auto 0',
          width: '100%',
          padding: '0 4px'
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(18px, 4.8vw, 22px)',
            fontWeight: '600',
            color: '#f8fafc',
            lineHeight: 1.55,
            letterSpacing: '-0.015em',
            whiteSpace: 'pre-line',
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.6)'
          }}
        >
          {activeContent.quote}
        </p>
      </div>

      {/* 4. Footer: Subtle, Premium Mantra Wordmark */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: '6px'
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          Mantra
        </span>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.3)',
            letterSpacing: '0.04em'
          }}
        >
          therapymantra.co
        </span>
      </div>
    </div>
  );
});
