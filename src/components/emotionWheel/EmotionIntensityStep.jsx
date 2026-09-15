import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function EmotionIntensityStep({
  emotion,
  family,
  intensity,
  onSelectIntensity,
  onContinue
}) {
  const intensityLevels = [
    { level: 1, label: 'A little', desc: 'A subtle, quiet background feeling', glow: 0.25 },
    { level: 2, label: 'Noticeably', desc: 'Clearly present and drawing attention', glow: 0.45 },
    { level: 3, label: 'Moderately', desc: 'Distinctly felt in mind and body', glow: 0.65 },
    { level: 4, label: 'Strongly', desc: 'Occupying much of your focus', glow: 0.85 },
    { level: 5, label: 'Intensely', desc: 'A vivid, acute surge across your system', glow: 1.0 }
  ];

  const themeColor = family?.color || '#38bdf8';
  const parentFamilyName = family?.name || 'Feeling';
  const emotionName = emotion?.name || 'This feeling';
  const currentLevelInfo = intensityLevels.find((i) => i.level === intensity) || intensityLevels[2];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: '100%',
        maxWidth: '640px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 auto',
        padding: '16px 8px 48px'
      }}
    >
      {/* 1. HERO EMOTION IDENTITY */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.06, duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '28px'
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: '4px'
          }}
        >
          {parentFamilyName}
        </span>
        <h1
          style={{
            fontSize: 'clamp(36px, 7vw, 52px)',
            fontWeight: '900',
            color: themeColor,
            letterSpacing: '-0.02em',
            margin: '0 0 10px 0',
            lineHeight: 1.1,
            textShadow: `0 0 32px ${themeColor}40`
          }}
        >
          {emotionName}
        </h1>
        <div
          style={{
            width: '40px',
            height: '2px',
            borderRadius: '2px',
            background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`,
            marginBottom: '16px'
          }}
        />
        <h2
          style={{
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: '800',
            color: '#ffffff',
            lineHeight: 1.25,
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em'
          }}
        >
          How strongly are you feeling this right now?
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.72)',
            lineHeight: 1.5,
            maxWidth: '500px',
            margin: 0
          }}
        >
          Notice how much space this is occupying in your mind and body.
        </p>
      </motion.div>

      {/* 2. THE HERO INTENSITY VISUAL CONTINUUM */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '20px 0 36px',
          width: '100%'
        }}
      >
        {/* Ambient atmospheric breathing orb */}
        <motion.div
          animate={{
            scale: [1, 1.05 + intensity * 0.04, 1],
            opacity: [currentLevelInfo.glow * 0.4, currentLevelInfo.glow * 0.65, currentLevelInfo.glow * 0.4]
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: `${140 + intensity * 28}px`,
            height: `${140 + intensity * 28}px`,
            borderRadius: '50%',
            background: themeColor,
            filter: `blur(${36 + intensity * 8}px)`,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Hero Central Number */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <span
            style={{
              fontSize: 'clamp(72px, 14vw, 96px)',
              fontWeight: '900',
              color: '#ffffff',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              textShadow: `0 0 40px ${themeColor}60`
            }}
          >
            {intensity}
          </span>
          <span
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: themeColor,
              marginTop: '10px',
              letterSpacing: '0.02em',
              textTransform: 'capitalize'
            }}
          >
            {currentLevelInfo.label}
          </span>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: '6px 0 0 0',
              maxWidth: '380px',
              lineHeight: 1.45
            }}
          >
            {currentLevelInfo.desc}
          </p>
        </div>
      </div>

      {/* 3. ELEGANT INTERACTIVE CONTINUUM TRACK */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          padding: '16px 0',
          marginBottom: '36px'
        }}
      >
        {/* Subtle connecting track line */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '24px',
            right: '24px',
            height: '3px',
            background: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-50%)',
            zIndex: 0
          }}
        >
          {/* Active progress fill */}
          <div
            style={{
              width: `${((intensity - 1) / 4) * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${themeColor}80, ${themeColor})`,
              transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>

        {intensityLevels.map((item) => {
          const isSelected = item.level === intensity;
          const isPassed = item.level <= intensity;
          return (
            <motion.button
              key={item.level}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelectIntensity(item.level)}
              style={{
                position: 'relative',
                zIndex: 1,
                width: isSelected ? '46px' : '36px',
                height: isSelected ? '46px' : '36px',
                minWidth: isSelected ? '46px' : '36px',
                minHeight: isSelected ? '46px' : '36px',
                maxWidth: isSelected ? '46px' : '36px',
                maxHeight: isSelected ? '46px' : '36px',
                flexShrink: 0,
                aspectRatio: '1 / 1',
                padding: 0,
                borderRadius: '50%',
                background: isSelected
                  ? themeColor
                  : isPassed
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(255, 255, 255, 0.08)',
                border: isSelected ? '3px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.12)',
                color: isSelected ? '#0a0f1d' : 'rgba(255, 255, 255, 0.85)',
                fontWeight: isSelected ? '800' : '600',
                fontSize: isSelected ? '18px' : '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSelected ? `0 0 24px ${themeColor}90` : 'none',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {item.level}
            </motion.button>
          );
        })}
      </div>

      {/* 4. WARM ACTION BUTTON */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, #2563eb 100%)`,
          color: '#ffffff',
          border: 'none',
          borderRadius: '16px',
          padding: '16px 36px',
          fontSize: '16.5px',
          fontWeight: '700',
          cursor: 'pointer',
          width: '100%',
          maxWidth: '380px',
          boxShadow: `0 8px 28px ${themeColor}35`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.25s ease'
        }}
      >
        <span>Continue</span>
        <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  );
}
