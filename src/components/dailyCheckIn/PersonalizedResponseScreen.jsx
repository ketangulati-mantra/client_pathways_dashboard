import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function PersonalizedResponseScreen({
  response,
  zone,
  onDoneForNow,
  onNavigateToAssessment
}) {
  const { openingHeadline, supportingMessage, empatheticObservation, routeDecision } = response || {};
  const accent = zone?.baseColor || zone?.accent || '#38bdf8';

  const headline = routeDecision?.headline || openingHeadline || "You've got a lot sitting with you right now.";
  const supporting = routeDecision?.supporting || supportingMessage || empatheticObservation || "When several things feel heavy at once, you don't have to solve it all today.";
  const rawCtaText = routeDecision?.ctaText || "Continue";
  const ctaText = (rawCtaText || '').replace(/\s*→\s*$/, '').trim() || 'Continue';

  const handleCtaClick = () => {
    if (routeDecision?.type === 'FOCUS_ASSESSMENT') {
      if (onNavigateToAssessment) {
        onNavigateToAssessment();
      } else if (typeof window !== 'undefined') {
        window.location.hash = '#/task/personalized-focus-assessment';
      }
    } else {
      onDoneForNow();
    }
  };

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
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
        padding: 'clamp(20px, 4vh, 48px) 16px clamp(36px, 5vh, 48px)',
        boxSizing: 'border-box',
        position: 'relative',
        minHeight: '60vh'
      }}
    >
      {/* 1. Personalized Reflection Heading & Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '460px',
          marginTop: 'auto',
          marginBottom: 'auto'
        }}
      >
        <h1
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(2.05rem, 6.5vw, 2.85rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            color: '#f8fafc',
            margin: 0,
            lineHeight: 1.18
          }}
        >
          {headline}
        </h1>

        <p
          style={{
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: 'clamp(0.98rem, 3.2vw, 1.08rem)',
            color: '#cbd5e1',
            margin: 0,
            lineHeight: 1.68,
            fontWeight: 400,
            maxWidth: '420px'
          }}
        >
          {supporting}
        </p>

        {/* 2. Primary Route CTA Button */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginTop: 'clamp(24px, 4vh, 36px)'
          }}
        >
          <motion.button
            type="button"
            onClick={handleCtaClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            style={{
              width: '100%',
              maxWidth: '320px',
              minHeight: '48px',
              background: `linear-gradient(135deg, ${accent} 0%, #0284c7 100%)`,
              border: 'none',
              borderRadius: '9999px',
              padding: '12px 28px',
              color: '#ffffff',
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: '0.96rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: `0 8px 24px -2px rgba(56, 189, 248, 0.35)`
            }}
          >
            <span>{ctaText}</span>
            <ArrowRight size={16} strokeWidth={2.4} />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
