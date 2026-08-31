import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Flame, Share2 } from 'lucide-react';
import { getMilestoneDetails } from './milestoneConfig';

export default function MilestoneCelebrationModal({
  milestoneNumber = 7,
  achievedAt,
  onKeepMoment,
  onDismiss
}) {
  const shouldReduceMotion = useReducedMotion();
  const config = getMilestoneDetails(milestoneNumber);
  const { theme, headline, message, closing, badgeText } = config;

  // Keyboard accessibility: Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  // Subtle floating ember coordinates
  const embers = [
    { x: -50, y: 30, delay: 0.2, duration: 3.2 },
    { x: 45, y: 20, delay: 0.6, duration: 2.8 },
    { x: -25, y: -40, delay: 0.9, duration: 3.5 },
    { x: 30, y: -50, delay: 0.4, duration: 3.1 },
    { x: -60, y: -20, delay: 1.1, duration: 3.8 },
    { x: 55, y: -10, delay: 1.4, duration: 3.0 }
  ];

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Milestone achievement: ${headline}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(11, 21, 34, 0.97)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(20px, 4vh, 40px) 20px',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}
      >
        {/* Ambient Warm Flame Radial Light */}
        <div
          style={{
            position: 'absolute',
            width: 'clamp(320px, 80vw, 520px)',
            height: 'clamp(320px, 80vw, 520px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, rgba(245, 158, 11, 0.18) 45%, transparent 75%)',
            filter: 'blur(55px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Close Button (X) */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close milestone celebration"
          style={{
            position: 'absolute',
            top: 'clamp(16px, 3vh, 28px)',
            right: 'clamp(16px, 3vw, 28px)',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            cursor: 'pointer',
            zIndex: 10,
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#cbd5e1';
          }}
        >
          <X size={18} strokeWidth={2.4} />
        </button>

        {/* Main Celebration Content */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
            maxWidth: '480px',
            gap: 'clamp(20px, 3.8vh, 32px)',
            margin: 'auto 0'
          }}
        >
          {/* 1. Large Animated Flame Centerpiece with Floating Sparks */}
          <div
            style={{
              position: 'relative',
              width: '190px',
              height: '190px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Soft Floating Embers / Sparks */}
            {!shouldReduceMotion &&
              embers.map((emb, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [emb.y, emb.y - 45, emb.y - 90],
                    x: [emb.x, emb.x + (i % 2 === 0 ? 10 : -10), emb.x],
                    opacity: [0, 0.85, 0],
                    scale: [0.6, 1, 0.4]
                  }}
                  transition={{
                    duration: emb.duration,
                    repeat: Infinity,
                    delay: emb.delay,
                    ease: 'easeOut'
                  }}
                  style={{
                    position: 'absolute',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#fbbf24',
                    boxShadow: '0 0 8px #f59e0b, 0 0 16px #ea580c',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }}
                />
              ))}

            {/* Glowing Golden Ring */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: [1, 1.08, 1],
                      opacity: [0.65, 0.95, 0.65]
                    }
              }
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, rgba(245, 158, 11, 0.12) 55%, transparent 75%)',
                filter: 'blur(16px)',
                pointerEvents: 'none'
              }}
            />

            {/* Flame Sphere Core */}
            <motion.div
              initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25, type: 'spring', stiffness: 350, damping: 20 }}
              style={{
                position: 'relative',
                zIndex: 4,
                width: '124px',
                height: '124px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fde047 0%, #f97316 55%, #ea580c 100%)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 16px 40px -4px rgba(249, 115, 22, 0.7), 0 0 35px rgba(251, 191, 36, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.6)'
              }}
            >
              <Flame size={44} fill="#ffffff" strokeWidth={1.2} color="#ffffff" />
              <span
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  fontStyle: 'italic',
                  color: '#ffffff',
                  lineHeight: 1,
                  marginTop: '2px',
                  textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
                }}
              >
                {milestoneNumber}
              </span>
            </motion.div>
          </div>

          {/* 2. Headline & Recognition Copy */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              maxWidth: '440px'
            }}
          >
            {/* Top Badge */}
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#fbbf24',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              {badgeText || `🔥 ${milestoneNumber} Day Streak`}
            </span>

            <motion.h2
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: 'clamp(2rem, 6.2vw, 2.6rem)',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: '#f8fafc',
                margin: 0,
                lineHeight: 1.18
              }}
            >
              {headline}
            </motion.h2>

            <motion.p
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              style={{
                fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                fontSize: 'clamp(0.98rem, 3.4vw, 1.08rem)',
                color: '#cbd5e1',
                margin: 0,
                lineHeight: 1.6,
                fontWeight: 400
              }}
            >
              {message}
            </motion.p>

            {closing && (
              <motion.span
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.75 }}
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: '1rem',
                  fontStyle: 'italic',
                  color: '#94a3b8',
                  marginTop: '2px'
                }}
              >
                {closing}
              </motion.span>
            )}
          </div>

          {/* 3. Actions */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              width: '100%',
              maxWidth: '320px',
              marginTop: '4px'
            }}
          >
            {/* Primary Action: Share your milestone */}
            <motion.button
              type="button"
              onClick={() => {
                if (onKeepMoment) {
                  onKeepMoment({
                    milestone: milestoneNumber,
                    headline,
                    message,
                    achievedAt: achievedAt || new Date().toISOString()
                  });
                } else {
                  onDismiss();
                }
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                border: 'none',
                borderRadius: '9999px',
                padding: '14px 28px',
                color: '#ffffff',
                fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                fontSize: '0.98rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 10px 28px -4px rgba(249, 115, 22, 0.55)'
              }}
            >
              <Share2 size={16} strokeWidth={2.4} />
              <span>Share your milestone</span>
            </motion.button>

            {/* Secondary Action: Continue */}
            <button
              type="button"
              onClick={onDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '6px 12px',
                outline: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
