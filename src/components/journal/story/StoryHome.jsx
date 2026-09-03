import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Compass, Sparkles, Feather, Clock, Key, Eye } from 'lucide-react';
import { getAtmosphericWorldSubtitle, getCycleProgressionLabel, formatReaderUnresolvedHint } from '../../../services/storyNarrativeHelper.js';

export default function StoryHome({
  storyState,
  latestChapter,
  chapters = [],
  canUnlockNextChapter = false,
  dailyEligibility = null,
  nextChapterHint = null,
  currentCycle = null,
  onSelectChapter,
  onGenerateNext,
  isGenerating = false,
  onBack
}) {
  const shouldReduceMotion = useReducedMotion();

  const cycleName = storyState?.current_cycle_name || currentCycle?.name || 'The Evolving Realm';
  const worldTheme = storyState?.world_theme || currentCycle?.worldTheme || 'solitude_and_wonder';
  const worldSubtitle = getAtmosphericWorldSubtitle(storyState?.current_cycle_id, worldTheme);

  const cycleStage = storyState?.cycle_progress?.stage || currentCycle?.stage || 'exploration';
  const nextCyclePreview = storyState?.next_cycle_preview || nextChapterHint;
  const primaryThread = storyState?.open_threads?.[0];
  const unresolvedHint = primaryThread ? formatReaderUnresolvedHint(primaryThread) : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '740px',
        margin: '0 auto',
        padding: '16px 18px 96px',
        boxSizing: 'border-box',
        gap: '24px'
      }}
    >
      {/* 1. Header Navigation */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back to Journal"
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
            outline: 'none'
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </motion.button>

        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#78716C',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: '#F0EBE1',
            padding: '5px 14px',
            borderRadius: '9999px'
          }}
        >
          YOUR PERSONAL STORY
        </span>
      </header>

      {/* 2. Atmospheric Living World Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          borderRadius: '24px',
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          padding: '32px 24px 28px',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          color: '#FFFFFF',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {/* Living Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
            filter: 'blur(20px)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FDE68A', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <Compass size={14} />
          <span>CYCLE: {cycleName}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
          <span style={{ color: '#94A3B8' }}>{cycleStage.replace('_', ' ')}</span>
        </div>

        <h2
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.8rem, 4.5vw, 2.4rem)',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#FFFFFF'
          }}
        >
          {cycleName}
        </h2>

        <p
          style={{
            fontSize: '0.92rem',
            color: '#CBD5E1',
            margin: '4px 0 0',
            lineHeight: 1.5,
            maxWidth: '480px'
          }}
        >
          {worldSubtitle}
        </p>
      </motion.div>

      {/* 3. Latest Chapter Feature Card */}
      {latestChapter && (
        <section style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#64748B',
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}
          >
            LATEST CHAPTER
          </span>

          <motion.div
            whileHover={{ y: -2 }}
            onClick={() => onSelectChapter(latestChapter)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E6E1D8',
              borderRadius: '20px',
              padding: '22px 22px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <Feather size={13} />
                <span>CHAPTER {latestChapter.chapter_number}</span>
              </div>

              <span
                style={{
                  fontSize: '0.84rem',
                  color: '#0284C7',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Read</span>
                <ArrowRight size={14} strokeWidth={2.2} />
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: '1.45rem',
                fontWeight: 600,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.25
              }}
            >
              {latestChapter.title}
            </h3>

            {latestChapter.narrative_summary && (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#64748B',
                  margin: 0,
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {latestChapter.narrative_summary}
              </p>
            )}

            {unresolvedHint && (
              <div
                style={{
                  marginTop: '6px',
                  paddingTop: '10px',
                  borderTop: '1px dashed #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  color: '#475569',
                  fontStyle: 'italic'
                }}
              >
                <Eye size={13} color="#D97706" />
                <span>{unresolvedHint}</span>
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* 4. Next Cycle Preview / Teaser (If Active) */}
      {nextCyclePreview && nextCyclePreview.previewText && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
            border: '1px solid #E9D5FF',
            borderRadius: '18px',
            padding: '16px 20px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#FFFFFF',
              border: '1px solid #D8B4FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9333EA',
              flexShrink: 0
            }}
          >
            <Sparkles size={16} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7E22CE', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SOMETHING NEW IS APPEARING
            </span>
            <span style={{ fontSize: '0.86rem', color: '#581C87', lineHeight: 1.45, fontStyle: 'italic' }}>
              "{nextCyclePreview.previewText}"
            </span>
          </div>
        </motion.div>
      )}

      {/* 5. Next Chapter Opportunity Invitation */}
      <section style={{ width: '100%' }}>
        {canUnlockNextChapter ? (
          <motion.div
            style={{
              background: '#F0F9FF',
              border: '1px solid #BAE6FD',
              borderRadius: '18px',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0369A1' }}>
                Your story continues today
              </span>
              <span style={{ fontSize: '0.82rem', color: '#0284C7', lineHeight: 1.4 }}>
                Your recent reflections have woven the next step of your journey.
              </span>
            </div>

            <motion.button
              type="button"
              onClick={onGenerateNext}
              disabled={isGenerating}
              whileHover={{ scale: isGenerating ? 1 : 1.03 }}
              whileTap={{ scale: isGenerating ? 1 : 0.97 }}
              style={{
                background: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '10px 18px',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
                outline: 'none'
              }}
            >
              <Sparkles size={14} color="#FDE047" />
              <span>{isGenerating ? 'Unfolding...' : 'Unfold Chapter'}</span>
            </motion.button>
          </motion.div>
        ) : dailyEligibility?.todayChapterGenerated ? (
          <div
            style={{
              background: '#FAF5EE',
              border: '1px solid #EADFCF',
              borderRadius: '18px',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#78350F' }}>
                Today's story has been written
              </span>
              <span style={{ fontSize: '0.82rem', color: '#92400E', lineHeight: 1.4 }}>
                Come back tomorrow to see where the next thread leads.
              </span>
            </div>

            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'transparent',
                border: '1px solid #D97706',
                color: '#B45309',
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                outline: 'none'
              }}
            >
              Write Reflection
            </button>
          </div>
        ) : (
          <div
            style={{
              background: '#FAF5EE',
              border: '1px solid #EADFCF',
              borderRadius: '18px',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#78350F' }}>
                Your story is waiting
              </span>
              <span style={{ fontSize: '0.82rem', color: '#92400E', lineHeight: 1.4 }}>
                Add a reflection or check in today to inspire the next chapter.
              </span>
            </div>

            <button
              type="button"
              onClick={onBack}
              style={{
                background: '#B45309',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                outline: 'none'
              }}
            >
              Reflect Now
            </button>
          </div>
        )}
      </section>

      {/* 6. Story Chronicle / Chronological Past Chapters */}
      <section style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#64748B',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}
        >
          STORY CHRONICLE ({chapters.length})
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1px solid #E6E1D8', borderRadius: '20px', overflow: 'hidden' }}>
          {chapters.map((ch, idx) => (
            <motion.div
              key={ch.id || ch.chapter_number}
              whileHover={{ backgroundColor: '#FDFBF7' }}
              onClick={() => onSelectChapter(ch)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: idx === chapters.length - 1 ? 'none' : '1px solid #F1ECE1',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#F0EBE1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#78716C',
                    fontSize: '0.84rem',
                    fontWeight: 700
                  }}
                >
                  {ch.chapter_number}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span
                    style={{
                      fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                      fontSize: '1.08rem',
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  >
                    {ch.title}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    {getCycleProgressionLabel(ch.chapter_number)}
                  </span>
                </div>
              </div>

              <ArrowRight size={15} color="#94A3B8" />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
