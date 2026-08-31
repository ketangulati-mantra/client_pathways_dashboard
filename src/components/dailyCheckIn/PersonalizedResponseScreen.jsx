import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Wind, Heart, ListTodo, Compass, Pause, Feather } from 'lucide-react';

const CATEGORY_ICONS = {
  sparkles: Sparkles,
  wind: Wind,
  heart: Heart,
  list: ListTodo,
  compass: Compass,
  pause: Pause,
  feather: Feather
};

export default function PersonalizedResponseScreen({
  response,
  zone,
  onStartRecommendation,
  onDoneForNow
}) {
  const { openingHeadline, supportingMessage, empatheticObservation, recommendation } = response;
  const headline = openingHeadline || "You've got a lot sitting with you right now.";
  const supporting = supportingMessage || empatheticObservation || "When several things feel heavy at once, you don't have to solve it all today.";

  const rec = recommendation || {
    category: 'Reflection',
    iconType: 'compass',
    title: "Untangle what's on your mind",
    description: "Naming one thing that's weighing on you makes it feel easier to hold.",
    duration: '2 min',
    cta: 'Try this',
    accentColor: '#38bdf8'
  };

  const IconComponent = CATEGORY_ICONS[rec.iconType] || Compass;
  const accent = rec.accentColor || zone?.baseColor || zone?.accent || '#38bdf8';
  const ctaCleanText = String(rec.cta || 'Try this').replace(/→/g, '').trim();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        padding: 'clamp(12px, 2.5vh, 24px) 16px clamp(36px, 5vh, 48px)',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* 1. Personalized Reflection Heading & Message (Stagger Step 1) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '460px',
          marginTop: '4px'
        }}
      >
        <h1
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(2.05rem, 6.5vw, 2.75rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            color: '#f8fafc',
            margin: 0,
            lineHeight: 1.16
          }}
        >
          {headline}
        </h1>

        <p
          style={{
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: 'clamp(0.96rem, 3.2vw, 1.05rem)',
            color: '#cbd5e1',
            margin: 0,
            lineHeight: 1.65,
            fontWeight: 400
          }}
        >
          {supporting}
        </p>
      </motion.div>

      {/* 2. Visual Breathing Space */}
      <div style={{ height: 'clamp(28px, 4.5vh, 44px)', width: '100%', flexShrink: 0 }} />

      {/* 3. Small Next Step Label & Compact Contained Card (Stagger Step 2) */}
      <motion.div
        initial={{ y: 12, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.18, ease: 'easeOut' }}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '12px'
          }}
        >
          <span style={{ color: accent, fontSize: '0.85rem' }}>✦</span>
          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: accent,
              letterSpacing: '0.14em',
              textTransform: 'uppercase'
            }}
          >
            A small next step
          </span>
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            background: 'rgba(255, 255, 255, 0.035)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '20px 22px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px -8px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.08)'
          }}
        >
        {/* Category & Metadata Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#cbd5e1'
          }}
        >
          <IconComponent size={13} strokeWidth={2.4} color={accent} />
          <span>{rec.duration || '2 min'}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
          <span>{rec.category || 'Reflection'}</span>
        </div>

        {/* Activity Title */}
        <h2
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: '1.35rem',
            fontWeight: 600,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.25
          }}
        >
          {rec.title}
        </h2>

        {/* Short Human Explanation */}
        <p
          style={{
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: '0.9rem',
            color: '#cbd5e1',
            margin: 0,
            lineHeight: 1.5,
            maxWidth: '360px'
          }}
        >
          {rec.description}
        </p>

        {/* Integrated Primary CTA Button (Single Clean Arrow Icon) */}
        <motion.button
          type="button"
          onClick={() => onStartRecommendation(rec)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          style={{
            width: '100%',
            maxWidth: '280px',
            background: `linear-gradient(135deg, ${accent} 0%, #0284c7 100%)`,
            border: 'none',
            borderRadius: '9999px',
            padding: '12px 24px',
            color: '#ffffff',
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: '0.94rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '4px',
            boxShadow: `0 8px 24px -2px rgba(56, 189, 248, 0.4)`
          }}
        >
          <span>{ctaCleanText}</span>
          <ArrowRight size={15} strokeWidth={2.4} />
        </motion.button>
        </div>
      </motion.div>

      {/* 5. Quiet Secondary Action */}
      <button
        type="button"
        onClick={onDoneForNow}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
          fontSize: '0.88rem',
          fontWeight: 500,
          cursor: 'pointer',
          padding: '10px 16px',
          outline: 'none',
          marginTop: '10px',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
      >
        Maybe later
      </button>
    </motion.div>
  );
}
