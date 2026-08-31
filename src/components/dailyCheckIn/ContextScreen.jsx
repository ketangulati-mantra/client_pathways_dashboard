import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CONTEXT_GROUPS } from './taxonomy';
import { ArrowRight } from 'lucide-react';

export default function ContextScreen({
  primaryEmotion,
  zone,
  initialContexts = [],
  onConfirm
}) {
  const [selected, setSelected] = useState(initialContexts || []);

  React.useEffect(() => {
    setSelected(initialContexts || []);
  }, [primaryEmotion?.id, initialContexts]);

  // Dynamic emotional accent tokens for header & primary CTA
  const accentColor = zone?.accent || '#f87171';
  const activeBg = zone?.activeBg || `linear-gradient(135deg, ${accentColor} 0%, #b91c1c 100%)`;
  const glowColor = zone?.glowColor || 'rgba(239, 68, 68, 0.65)';
  const emotionWord = primaryEmotion?.name?.toLowerCase() || 'this';

  // Calming Sky Cyan / Frost Blue selection style (meditative, universal contrast)
  const cyanSelectedBg = 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)';
  const cyanSelectedBorder = '1.5px solid rgba(255, 255, 255, 0.55)';
  const cyanSelectedShadow = '0 4px 16px rgba(56, 189, 248, 0.35), 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.35)';

  const handleToggle = (item) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(8);
      } catch (e) {}
    }
  };

  const handleContinue = () => {
    onConfirm(selected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.28 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
        paddingTop: '4px'
      }}
    >
      {/* 1. Primary Reflective Question & Reassuring Guidance */}
      <div
        style={{
          textAlign: 'left',
          width: '100%',
          maxWidth: '540px',
          padding: '2px 6px 16px',
          boxSizing: 'border-box'
        }}
      >
        <h1
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.75rem, 5.5vw, 2.35rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1.18,
            color: '#ffffff',
            margin: 0
          }}
        >
          What was happening when you felt{' '}
          <span style={{ color: accentColor, fontStyle: 'italic', fontWeight: 600 }}>
            {emotionWord}
          </span>
          ?
        </h1>
        <p
          style={{
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: 'clamp(0.84rem, 2.8vw, 0.92rem)',
            color: '#94a3b8',
            margin: '6px 0 0 0',
            lineHeight: 1.45,
            fontWeight: 500
          }}
        >
          Choose anything that feels relevant, or continue when you're ready.
        </p>
      </div>

      {/* 2. Focused Context Dimensions (Calming Sky Cyan Selection) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(22px, 4.2vh, 30px)',
          width: '100%',
          maxWidth: '540px',
          padding: '4px 6px clamp(120px, 18vh, 150px)',
          boxSizing: 'border-box'
        }}
      >
        {CONTEXT_GROUPS.map((groupObj) => (
          <div
            key={groupObj.group}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '100%'
            }}
          >
            {/* Subtle Navigation Landmark Label */}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                paddingLeft: '2px'
              }}
            >
              {groupObj.group}
            </span>

            {/* Layout-Stable Chips (Calm Sky Cyan Glow) */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px clamp(8px, 2vw, 10px)',
                width: '100%'
              }}
            >
              {groupObj.items.map((item) => {
                const isSelected = selected.includes(item);

                return (
                  <motion.button
                    key={item}
                    type="button"
                    onClick={() => handleToggle(item)}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    aria-pressed={isSelected}
                    style={{
                      height: '38px',
                      minHeight: '38px',
                      borderRadius: '12px',
                      padding: '0 15px',
                      background: isSelected
                        ? cyanSelectedBg
                        : 'rgba(255, 255, 255, 0.08)',
                      border: isSelected
                        ? cyanSelectedBorder
                        : '1.5px solid rgba(255, 255, 255, 0.14)',
                      boxShadow: isSelected
                        ? cyanSelectedShadow
                        : '0 1px 3px rgba(0, 0, 0, 0.3)',
                      color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                      fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: 'none',
                      boxSizing: 'border-box',
                      userSelect: 'none',
                      transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <span>{item}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Refined Sticky Continue Dock with Ambient Blur Fade */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, rgba(13, 27, 42, 0) 0%, rgba(13, 27, 42, 0.88) 32%, rgba(13, 27, 42, 0.98) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '14px 16px clamp(16px, 3vh, 24px)',
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
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          style={{
            width: '100%',
            maxWidth: '520px',
            background: activeBg,
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
            boxShadow: `0 8px 26px -3px ${glowColor}`
          }}
        >
          <span>Continue</span>
          <ArrowRight size={17} strokeWidth={2.4} />
        </motion.button>
      </div>
    </motion.div>
  );
}
