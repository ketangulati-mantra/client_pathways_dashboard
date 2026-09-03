import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Compass, Feather } from 'lucide-react';

export default function StoryFeaturedCard({
  storyState,
  latestChapter,
  hasChapters,
  onOpenStory
}) {
  const cycleName = storyState?.current_cycle_name || 'An Evolving Realm';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onOpenStory}
      style={{
        width: '100%',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        padding: '18px 20px',
        cursor: 'pointer',
        boxSizing: 'border-box',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10px',
          right: '10px',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)',
          filter: 'blur(15px)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FDE68A',
            flexShrink: 0
          }}
        >
          {hasChapters ? <Feather size={19} /> : <Compass size={19} />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#FDE68A',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              YOUR PERSONAL STORY
            </span>
          </div>

          <span
            style={{
              fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
              fontSize: '1.12rem',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.01em'
            }}
          >
            {hasChapters && latestChapter
              ? `Chapter ${latestChapter.chapter_number}: ${latestChapter.title}`
              : 'A world that slowly becomes yours'}
          </span>

          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            {hasChapters ? cycleName : 'Shape an evolving realm from your reflections'}
          </span>
        </div>
      </div>

      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1
        }}
      >
        <ArrowRight size={15} strokeWidth={2.2} />
      </div>
    </motion.div>
  );
}
