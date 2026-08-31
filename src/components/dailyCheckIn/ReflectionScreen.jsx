import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function ReflectionScreen({
  primaryEmotion,
  zone,
  initialReflection = '',
  onConfirm
}) {
  const [text, setText] = useState(initialReflection || '');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setText(initialReflection || '');
  }, [primaryEmotion?.id, initialReflection]);

  const emotionName = primaryEmotion?.name || 'this';
  const accentColor = zone?.accent || '#f87171';
  const activeBg = zone?.activeBg || `linear-gradient(135deg, ${accentColor} 0%, #b91c1c 100%)`;
  const glowColor = zone?.glowColor || 'rgba(239, 68, 68, 0.65)';

  // Auto-expand textarea smoothly as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(110, textareaRef.current.scrollHeight)}px`;
    }
  }, [text]);

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
        textAlign: 'center',
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
        padding: 'clamp(6px, 2vh, 16px) 6px clamp(110px, 16vh, 140px)',
        gap: 'clamp(18px, 3.5vh, 26px)'
      }}
    >
      {/* 1. Expressive Emotion Heading & Gentle Reflection Prompt */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          maxWidth: '520px',
          padding: '0 4px'
        }}
      >
        <h1
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(2.4rem, 8vw, 3.4rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            color: accentColor,
            margin: 0,
            lineHeight: 1.12,
            textShadow: `0 4px 24px ${accentColor}40`
          }}
        >
          {emotionName}
        </h1>
        <p
          style={{
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: 'clamp(0.94rem, 3.4vw, 1.06rem)',
            color: '#f8fafc',
            margin: '2px 0 0 0',
            lineHeight: 1.45,
            fontWeight: 500,
            maxWidth: '440px'
          }}
        >
          Describe what might be causing you to feel{' '}
          <strong style={{ color: '#ffffff', fontWeight: 800 }}>
            {emotionName.toLowerCase()}
          </strong>{' '}
          right now, or simply continue.
        </p>
      </div>

      {/* 2. Compact, Auto-Expanding Journaling Glass Card */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: isFocused
            ? 'rgba(22, 36, 54, 0.75)'
            : 'rgba(22, 36, 54, 0.55)',
          border: isFocused
            ? `1.5px solid ${accentColor}`
            : '1.5px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '20px',
          padding: 'clamp(14px, 3.2vw, 20px)',
          boxShadow: isFocused
            ? `0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px ${accentColor}35, inset 0 1px 2px rgba(255, 255, 255, 0.2)`
            : '0 10px 28px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          transition: 'border 0.2s ease, box-shadow 0.2s ease, background 0.2s ease'
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Anything on your mind? (Optional)"
          rows={3}
          style={{
            width: '100%',
            minHeight: '110px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontSize: 'clamp(0.98rem, 3.4vw, 1.08rem)',
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            resize: 'none',
            lineHeight: 1.6,
            fontWeight: 500,
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        />

        {/* Card Footer: Live Character Counter */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingTop: '8px',
            marginTop: '4px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <span
            style={{
              fontSize: '0.76rem',
              color: text.length > 0 ? '#ffffff' : '#94a3b8',
              fontWeight: 600,
              letterSpacing: '0.02em',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '2px 8px',
              borderRadius: '6px'
            }}
          >
            {text.length} characters
          </span>
        </div>
      </motion.div>

      {/* 3. Refined Sticky Action Dock with Ambient Blur Fade */}
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
          onClick={() => onConfirm(text)}
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
          <span>{text.trim() ? 'Save & Continue' : 'Continue'}</span>
          <ArrowRight size={17} strokeWidth={2.4} />
        </motion.button>
      </div>
    </motion.div>
  );
}
