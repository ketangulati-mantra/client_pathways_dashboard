import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, BookOpen, Feather, Sparkles, Compass } from 'lucide-react';
import { getAtmosphericCycleBadge, getCycleProgressionLabel, formatReaderUnresolvedHint } from '../../../services/storyNarrativeHelper.js';

export default function StoryChapterReader({
  chapter,
  storyState,
  onBack,
  onOpenNextChapter,
  isGeneratingNext,
  canUnlockNextChapter = true
}) {
  const shouldReduceMotion = useReducedMotion();

  if (!chapter) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF7F2',
          padding: '24px'
        }}
      >
        <p style={{ color: '#64748B', fontSize: '1rem', marginBottom: '16px' }}>Chapter not found.</p>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: '#0F172A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9999px',
            padding: '10px 20px',
            cursor: 'pointer'
          }}
        >
          Return to Story Home
        </button>
      </div>
    );
  }

  const cycleLabel = getAtmosphericCycleBadge(
    chapter.cycle_id || storyState?.current_cycle_id,
    storyState?.current_cycle_name
  );
  const progressLabel = getCycleProgressionLabel(chapter.chapter_number);
  const primaryThread = storyState?.open_threads?.[0];
  const unresolvedHint = primaryThread ? formatReaderUnresolvedHint(primaryThread) : null;

  // Split chapter content by double newline to render literary paragraphs
  const paragraphs = (chapter.content || '')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#FAF7F2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 18px 80px',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Header Navigation */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '680px',
          marginBottom: '32px'
        }}
      >
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back to Story Home"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E6E1D8',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#334155',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </motion.button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#78716C',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: '#F0EBE1',
              padding: '4px 12px',
              borderRadius: '9999px'
            }}
          >
            {cycleLabel}
          </span>
        </div>
      </header>

      {/* 2. Reading Container (Editorial Digital Book Layout) */}
      <article
        style={{
          width: '100%',
          maxWidth: '620px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {/* Chapter Eyebrow & Number */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#D97706',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}
        >
          <Feather size={14} strokeWidth={2} />
          <span>CHAPTER {chapter.chapter_number}</span>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <span style={{ color: '#78716C', fontWeight: 500 }}>{progressLabel}</span>
        </motion.div>

        {/* Chapter Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(2rem, 5.2vw, 2.75rem)',
            fontWeight: 600,
            color: '#0F172A',
            margin: '0 0 28px',
            lineHeight: 1.15,
            letterSpacing: '-0.025em'
          }}
        >
          {chapter.title}
        </motion.h1>

        {/* Story Prose Paragraphs */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.1rem, 2.6vw, 1.25rem)',
            lineHeight: 1.82,
            color: '#27272A',
            letterSpacing: '-0.005em'
          }}
        >
          {paragraphs.map((p, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: shouldReduceMotion ? 0 : 0.15 + idx * 0.08
              }}
              style={{
                margin: 0,
                textAlign: 'left'
              }}
            >
              {p}
            </motion.p>
          ))}
        </div>

        {/* Subtle Decorative Editorial Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            margin: '48px 0 32px',
            color: '#D1C7B7'
          }}
        >
          <div style={{ width: '40px', height: '1px', background: '#E6E1D8' }} />
          <span style={{ fontSize: '0.85rem', letterSpacing: '0.2em' }}>✦</span>
          <div style={{ width: '40px', height: '1px', background: '#E6E1D8' }} />
        </motion.div>

        {/* 3. Continuation Note & Unresolved Thread */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {unresolvedHint && (
            <div
              style={{
                background: '#FDFBF7',
                border: '1px solid #EFE9DE',
                borderRadius: '16px',
                padding: '18px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxSizing: 'border-box'
              }}
            >
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#78716C',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              >
                CONTINUATION
              </span>
              <p
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: '1.08rem',
                  fontStyle: 'italic',
                  color: '#334155',
                  margin: 0,
                  lineHeight: 1.55
                }}
              >
                {unresolvedHint}
              </p>
            </div>
          )}

          {/* Gentle Next Action / Return to Story Home */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              marginTop: '12px'
            }}
          >
            {canUnlockNextChapter && onOpenNextChapter ? (
              <motion.button
                type="button"
                onClick={onOpenNextChapter}
                disabled={isGeneratingNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '14px 30px',
                  fontSize: '0.96rem',
                  fontWeight: 600,
                  cursor: isGeneratingNext ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)'
                }}
              >
                <Sparkles size={15} color="#FDE68A" />
                <span>{isGeneratingNext ? 'Unfolding next chapter...' : 'Discover what happens next'}</span>
              </motion.button>
            ) : (
              <div
                style={{
                  background: '#FDFBF7',
                  border: '1px solid #ECE7DF',
                  borderRadius: '16px',
                  padding: '16px 22px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  maxWidth: '440px',
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B45309', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  TODAY'S CHAPTER COMPLETE
                </span>
                <p style={{ fontFamily: 'Newsreader, "Playfair Display", Georgia, serif', fontSize: '1.05rem', color: '#0F172A', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                  "Your next chapter will unfold tomorrow as new reflections take shape."
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 12px',
                outline: 'none'
              }}
            >
              Return to Story Home
            </button>
          </div>
        </motion.div>
      </article>
    </div>
  );
}
