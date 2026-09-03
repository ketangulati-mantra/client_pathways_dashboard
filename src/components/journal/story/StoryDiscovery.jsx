import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen, Compass } from 'lucide-react';

export default function StoryDiscovery({ onBegin, isGenerating, error }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: '680px',
        margin: '0 auto',
        padding: '24px 16px 64px',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* 1. Subtle Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#F0EBE1',
          padding: '6px 14px',
          borderRadius: '9999px',
          color: '#78716C',
          fontSize: '0.74rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '16px'
        }}
      >
        <Sparkles size={13} color="#D97706" />
        <span>Your Personal Story</span>
      </motion.div>

      {/* 2. Editorial Main Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
          fontSize: 'clamp(2.1rem, 5.5vw, 3rem)',
          fontWeight: 600,
          color: '#0F172A',
          margin: '0 0 14px',
          lineHeight: 1.15,
          letterSpacing: '-0.025em'
        }}
      >
        A world that slowly becomes yours.
      </motion.h1>

      {/* 3. Thoughtful Supporting Text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
          color: '#64748B',
          lineHeight: 1.6,
          maxWidth: '520px',
          margin: '0 0 32px',
          fontWeight: 400
        }}
      >
        Your reflections can inspire an evolving story shaped by the themes and moments you choose to share.
      </motion.p>

      {/* 4. Atmospheric Living Visual Composition */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        style={{
          width: '100%',
          maxWidth: '540px',
          height: '240px',
          borderRadius: '24px',
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(15, 23, 42, 0.12)',
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Living Ambient Light Glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '260px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(217, 119, 6, 0.08) 50%, transparent 80%)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }}
        />

        {/* Layered Silhouettes (Mountain Ridge & Lantern Glow) */}
        <svg
          viewBox="0 0 540 240"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          {/* Distant Stars */}
          <circle cx="80" cy="45" r="1.5" fill="#FEF3C7" opacity="0.6" />
          <circle cx="160" cy="30" r="1.2" fill="#FEF3C7" opacity="0.8" />
          <circle cx="280" cy="55" r="1.8" fill="#FEF3C7" opacity="0.7" />
          <circle cx="420" cy="35" r="1.2" fill="#FEF3C7" opacity="0.5" />
          <circle cx="490" cy="60" r="1.5" fill="#FEF3C7" opacity="0.9" />

          {/* Distant Mountain Layer */}
          <path
            d="M0 240 L0 140 Q130 90 270 145 T540 120 L540 240 Z"
            fill="#334155"
            opacity="0.45"
          />

          {/* Foreground Coastal / Pine Ridge Layer */}
          <path
            d="M0 240 L0 180 Q100 135 220 170 Q360 205 540 150 L540 240 Z"
            fill="#0F172A"
          />

          {/* Central Beacon / Harbor Lantern */}
          <circle cx="270" cy="142" r="3" fill="#FDE68A" />
          <circle cx="270" cy="142" r="12" fill="#F59E0B" opacity="0.3" />
        </svg>

        {/* Ambient Subtle Badge Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: '0.78rem',
            letterSpacing: '0.04em',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            padding: '4px 12px',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Compass size={12} color="#FDE68A" />
          <span>An unfolding realm awaits</span>
        </div>
      </motion.div>

      {/* 5. Primary Call to Action */}
      <motion.button
        type="button"
        onClick={onBegin}
        disabled={isGenerating}
        whileHover={{ scale: isGenerating ? 1 : 1.02, y: isGenerating ? 0 : -2 }}
        whileTap={{ scale: isGenerating ? 1 : 0.98 }}
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '9999px',
          padding: '16px 36px',
          fontSize: '1.02rem',
          fontWeight: 600,
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          outline: 'none',
          transition: 'all 0.2s ease',
          marginBottom: '14px'
        }}
      >
        <span>Begin your story</span>
        <ArrowRight size={17} strokeWidth={2.2} />
      </motion.button>

      {/* 6. Supporting Microcopy */}
      <span
        style={{
          fontSize: '0.84rem',
          color: '#94A3B8',
          lineHeight: 1.4,
          maxWidth: '380px'
        }}
      >
        Your first chapter will be shaped by the reflections you've shared.
      </span>

      {/* 7. Error message if any */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '20px',
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: '12px',
            padding: '10px 18px',
            color: '#B91C1C',
            fontSize: '0.86rem',
            maxWidth: '440px'
          }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
