import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Flame } from 'lucide-react';
import WeeklyStreakTracker from './WeeklyStreakTracker';
import EmotionalVisualSculpture from './EmotionalVisualSculpture';

import { generateCheckInExperience } from './personalizationEngine';

/**
 * Returns dynamic completion copy and atmospheric styling tailored to the user's emotional outcome.
 */
function getCompletionMoment({ primaryEmotion, additionalEmotions = [], intensity = 3, contexts = [], reflection = '', zone, recentHistory = [] }) {
  const exp = generateCheckInExperience({
    primaryEmotion,
    additionalEmotions,
    intensity,
    contexts,
    reflection,
    zone,
    recentHistory
  });

  const emotionName = primaryEmotion?.name || 'this feeling';

  // Intensity labels
  const intensityMap = {
    1: 'Slightly present',
    2: 'Mild intensity',
    3: 'Noticeable intensity',
    4: 'Strong intensity',
    5: 'Deeply felt'
  };
  const intensityLabel = intensityMap[intensity] || `Level ${intensity} intensity`;

  return {
    headline: exp.completion.headline,
    supporting: exp.completion.supporting,
    closureAffirmation: exp.completion.closureAffirmation,
    emotionName,
    intensityLabel,
    atmosphereGradient: exp.completion.atmosphere,
    accentColor: exp.completion.accentColor
  };
}

export default function CompletionScreen({
  primaryEmotion,
  additionalEmotions = [],
  intensity = 3,
  contexts = [],
  reflection = '',
  zone,
  streak,
  onReturnHome
}) {
  const shouldReduceMotion = useReducedMotion();

  const moment = getCompletionMoment({
    primaryEmotion,
    intensity,
    contexts,
    zone
  });

  const currentStreak = streak?.currentStreak || 1;
  const nextMilestone = streak?.nextMilestone || (currentStreak < 3 ? 3 : currentStreak < 7 ? 7 : 15);
  const daysUntilNext = streak?.daysUntilNextMilestone ?? Math.max(1, nextMilestone - currentStreak);

  // Motivational streak affirmations
  let streakHeader = '🔥 You started your streak';
  if (currentStreak >= 2 && currentStreak < 7) {
    streakHeader = '🔥 You showed up again';
  } else if (currentStreak >= 7 && currentStreak < 30) {
    streakHeader = "🔥 You're building serious momentum";
  } else if (currentStreak >= 30) {
    streakHeader = '🔥 An incredible streak of self-presence';
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
        padding: 'clamp(10px, 2.5vh, 20px) 16px clamp(40px, 6vh, 56px)',
        gap: 'clamp(18px, 3vh, 26px)',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Personalized Dynamic 3D Emotional Visual Sculpture */}
      <EmotionalVisualSculpture
        primaryEmotion={primaryEmotion}
        intensity={intensity}
        contexts={contexts}
        zone={zone}
      />

      {/* 2. Main Emotional Moment */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '460px'
        }}
      >
        <h1
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(2.1rem, 6.8vw, 2.85rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            color: '#f8fafc',
            margin: 0,
            lineHeight: 1.15
          }}
        >
          {moment.headline}
        </h1>

        <p
          style={{
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: 'clamp(0.96rem, 3.2vw, 1.05rem)',
            color: '#cbd5e1',
            margin: 0,
            lineHeight: 1.6,
            fontWeight: 400,
            maxWidth: '420px'
          }}
        >
          {moment.supporting}
        </p>
      </div>

      {/* 3. Personal Check-in Summary ("Today's Moment" Memory Card) */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.18 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          width: '100%',
          maxWidth: '380px',
          padding: '14px 18px',
          background: 'rgba(255, 255, 255, 0.035)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '18px',
          backdropFilter: 'blur(16px)',
          boxSizing: 'border-box'
        }}
      >
        <span
          style={{
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#94a3b8',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}
        >
          Today's Moment
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: moment.accentColor,
              boxShadow: `0 0 10px ${moment.accentColor}`
            }}
          />
          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#ffffff'
            }}
          >
            {moment.emotionName}
          </span>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.85rem' }}>•</span>
          <span
            style={{
              fontSize: '0.88rem',
              color: '#cbd5e1',
              fontWeight: 500
            }}
          >
            {moment.intensityLabel}
          </span>
        </div>
      </motion.div>

      {/* 4. Compact Celebratory Streak Card */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          maxWidth: '380px',
          padding: '14px 18px',
          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.22)',
          borderRadius: '18px',
          boxSizing: 'border-box',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.5), 0 0 16px rgba(245, 158, 11, 0.12)'
        }}
      >
        {/* Streak Title & Count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <motion.div
              animate={shouldReduceMotion ? {} : { scale: [1, 1.14, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Flame size={20} color="#f59e0b" fill="#f59e0b" />
            </motion.div>
            <span
              style={{
                fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                fontSize: '0.98rem',
                fontWeight: 800,
                color: '#ffffff'
              }}
            >
              {currentStreak} Day Streak
            </span>
          </div>

          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#f59e0b',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            {streakHeader.replace('🔥 ', '')}
          </span>
        </div>

        {/* Weekly Monday-to-Sunday Tracker */}
        <WeeklyStreakTracker currentStreak={currentStreak} completedToday={true} compact={true} />

        {/* Milestone Progress Text */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '0 4px',
            fontSize: '0.76rem',
            color: '#cbd5e1',
            fontWeight: 500
          }}
        >
          <span>Goal: {nextMilestone} days</span>
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>
            {daysUntilNext === 1 ? '1 check-in left' : `${daysUntilNext} check-ins left`}
          </span>
        </div>
      </motion.div>

      {/* 5. Clean Primary Ending Action */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          maxWidth: '340px',
          marginTop: '4px'
        }}
      >
        <motion.button
          type="button"
          onClick={onReturnHome}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
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
            boxShadow: '0 8px 24px -4px rgba(56, 189, 248, 0.45)'
          }}
        >
          <span>Return to dashboard</span>
          <ArrowRight size={16} strokeWidth={2.4} />
        </motion.button>
      </div>
    </motion.div>
  );
}
