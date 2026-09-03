import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

const GENERATION_PHRASES = [
  'Gathering the threads...',
  'Listening for what connects...',
  'Something is beginning to take shape...'
];

export default function StoryGenerationExperience() {
  const shouldReduceMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % GENERATION_PHRASES.length);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '420px',
        padding: '48px 20px',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Ambient Breathing Halo Visual */}
      <div
        style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px'
        }}
      >
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [1, 1.18, 1],
                  opacity: [0.35, 0.7, 0.35]
                }
          }
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.25) 0%, rgba(245, 158, 11, 0.05) 60%, transparent 80%)',
            filter: 'blur(10px)'
          }}
        />

        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  rotate: [0, 360]
                }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '1.5px dashed rgba(217, 119, 6, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D97706'
          }}
        >
          <Compass size={24} strokeWidth={1.8} />
        </motion.div>
      </div>

      {/* 2. Cycling Atmospheric Phrasing */}
      <div style={{ height: '36px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={phraseIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.45 }}
            style={{
              fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
              fontSize: '1.35rem',
              fontWeight: 600,
              color: '#0F172A',
              fontStyle: 'italic',
              letterSpacing: '-0.015em'
            }}
          >
            {GENERATION_PHRASES[phraseIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* 3. Reassuring Subtitle */}
      <span
        style={{
          marginTop: '12px',
          fontSize: '0.86rem',
          color: '#64748B',
          maxWidth: '340px',
          lineHeight: 1.5
        }}
      >
        Weaving your recent reflections into the next chapter of your world.
      </span>
    </div>
  );
}
