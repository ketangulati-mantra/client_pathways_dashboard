import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { handleExit } from '../mantra/navigation';
import { triggerCompletionWebhook } from '../mantra/api';

const LESSON_ID = 'how-can-therapy-help';
const LESSON_TITLE = 'How Therapy Helps';

const TOPICS = [
  {
    id: 'anxiety',
    icon: '🧠',
    title: 'Anxiety & overthinking',
    short: 'Understand overwhelming thoughts and calm racing worries.',
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    glow: 'rgba(2, 132, 199, 0.07)'
  },
  {
    id: 'mood',
    icon: '🌧️',
    title: 'Low mood & energy',
    short: 'Explore changes in motivation, energy, and interest.',
    color: '#4f46e5',
    bg: '#eef2ff',
    border: '#c7d2fe',
    glow: 'rgba(79, 70, 229, 0.07)'
  },
  {
    id: 'stress',
    icon: '🔥',
    title: 'Stress & burnout',
    short: 'Find healthier ways to manage pressure and overwhelm.',
    color: '#0d9488',
    bg: '#f0fdfa',
    border: '#99f6e4',
    glow: 'rgba(13, 148, 136, 0.07)'
  },
  {
    id: 'emotions',
    icon: '❤️',
    title: 'Difficult emotions',
    short: 'Make sense of emotions that feel confusing or intense.',
    color: '#e11d48',
    bg: '#fff1f2',
    border: '#fecdd3',
    glow: 'rgba(225, 29, 72, 0.07)'
  },
  {
    id: 'relationships',
    icon: '👥',
    title: 'Relationships',
    short: 'Understand patterns and navigate difficult connections.',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    glow: 'rgba(124, 58, 237, 0.07)'
  },
  {
    id: 'growth',
    icon: '🌱',
    title: 'Personal growth',
    short: 'Learn more about yourself and build healthier habits.',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    glow: 'rgba(22, 163, 74, 0.07)'
  }
];

const STEPS = [
  {
    num: '01',
    title: 'Talk',
    desc: 'Share what’s on your mind. You don’t need to have the perfect words.'
  },
  {
    num: '02',
    title: 'Understand',
    desc: 'Make sense of patterns, emotions, and triggers together.'
  },
  {
    num: '03',
    title: 'Move forward',
    desc: 'Learn practical ways to cope, respond differently, and feel better.'
  }
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 28 : -28,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.2, 0.9, 0.35, 1]
    }
  },
  exit: (direction) => ({
    x: direction > 0 ? -28 : 28,
    opacity: 0,
    transition: {
      duration: 0.22,
      ease: [0.2, 0.9, 0.35, 1]
    }
  })
};

export default function HowCanTherapyHelpLessonPage({ onBack }) {
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completeError, setCompleteError] = useState(null);

  const {
    handleActionComplete
  } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasAction: true,
    hasQuiz: false
  });

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      handleExit();
    }
  };

  // Snappy Auto-Play: Advances every 2.4 seconds unless paused
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setActiveTopicIndex((prev) => (prev + 1) % TOPICS.length);
    }, 2400);

    return () => clearInterval(timer);
  }, [isPaused, activeTopicIndex]);

  const handleJumpToIndex = (idx) => {
    setDirection(idx > activeTopicIndex ? 1 : -1);
    setActiveTopicIndex(idx);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 2400);
  };

  const handleDragEnd = (_, info) => {
    const swipeThreshold = 25;
    if (info.offset.x < -swipeThreshold) {
      setDirection(1);
      setActiveTopicIndex((prev) => (prev + 1) % TOPICS.length);
    } else if (info.offset.x > swipeThreshold) {
      setDirection(-1);
      setActiveTopicIndex((prev) => (prev - 1 + TOPICS.length) % TOPICS.length);
    }
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 2400);
  };

  const handleMarkAsDone = async () => {
    if (isCompleted || isSubmitting) return;

    setIsSubmitting(true);
    setCompleteError(null);

    try {
      if (handleActionComplete) {
        await handleActionComplete();
      } else {
        await triggerCompletionWebhook(LESSON_ID);
      }
      setIsCompleted(true);
    } catch (err) {
      setIsCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTopic = TOPICS[activeTopicIndex];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
        background: '#f8fafc',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* 1. Compact Sticky Header */}
      <header
        style={{
          height: '52px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(226, 232, 240, 0.7)',
          background: 'rgba(248, 250, 252, 0.92)',
          backdropFilter: 'blur(10px)',
          flexShrink: 0,
          zIndex: 20
        }}
      >
        <button
          type="button"
          onClick={handleBackClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '5px 11px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          aria-label="Go back"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <h1
          style={{
            fontSize: 'clamp(0.86rem, 3.8vw, 0.95rem)',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.01em',
            margin: 0,
            whiteSpace: 'nowrap'
          }}
        >
          {LESSON_TITLE}
        </h1>
      </header>

      {/* Main Guided Scrollable Canvas with Calm Vertical Rhythm */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 18px 56px',
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '36px'
          }}
        >
          {/* =================================================================
              1. HERO: CLEAN TYPOGRAPHY ON BACKGROUND (NO CARD CONTAINER)
             ================================================================= */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingTop: '6px'
            }}
          >
            {/* Subtle atmospheric ambient glow */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-10px',
                width: '180px',
                height: '140px',
                background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.08) 0%, rgba(13, 148, 136, 0.05) 60%, transparent 75%)',
                filter: 'blur(24px)',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            <span
              style={{
                position: 'relative',
                zIndex: 1,
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#2563eb'
              }}
            >
              A Gentle Introduction
            </span>

            <h2
              style={{
                position: 'relative',
                zIndex: 1,
                fontSize: 'clamp(1.55rem, 5.2vw, 1.95rem)',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.22,
                letterSpacing: '-0.025em',
                margin: 0
              }}
            >
              Therapy is a space to understand yourself.
            </h2>

            <p
              style={{
                position: 'relative',
                zIndex: 1,
                fontSize: '0.94rem',
                color: '#475569',
                lineHeight: 1.6,
                margin: 0
              }}
            >
              Talk through what you're experiencing, notice patterns, and find ways forward.
            </p>
          </motion.section>

          {/* =================================================================
              2. THE FOCUSED CAROUSEL MOMENT (ONLY PROMINENT CARD HERE)
             ================================================================= */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 2400)}
          >
            {/* Header: Title + Slide Counter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3
                style={{
                  fontSize: '1.02rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.015em'
                }}
              >
                Therapy can help with...
              </h3>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#64748b',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {activeTopicIndex + 1} of {TOPICS.length}
              </span>
            </div>

            {/* Spacious, Beautiful Hero Carousel Card */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '176px',
                borderRadius: '20px',
                overflow: 'hidden'
              }}
            >
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentTopic.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '176px',
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1.5px solid #e2e8f0',
                    padding: '22px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                    boxSizing: 'border-box',
                    cursor: 'grab'
                  }}
                >
                  {/* Subtle contextual ambient glow per category */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '160px',
                      height: '160px',
                      background: `radial-gradient(ellipse at top right, ${currentTopic.glow} 0%, transparent 70%)`,
                      pointerEvents: 'none',
                      borderRadius: '20px'
                    }}
                  />

                  {/* Icon & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: currentTopic.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.35rem',
                        flexShrink: 0,
                        border: `1px solid ${currentTopic.border}`
                      }}
                    >
                      {currentTopic.icon}
                    </div>

                    <h4
                      style={{
                        margin: 0,
                        fontSize: '1.08rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        letterSpacing: '-0.015em'
                      }}
                    >
                      {currentTopic.title}
                    </h4>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: '#475569',
                      lineHeight: 1.55,
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    {currentTopic.short}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Smooth Progress Pagination Indicators */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                paddingTop: '2px'
              }}
            >
              {TOPICS.map((topic, i) => {
                const isActive = activeTopicIndex === i;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleJumpToIndex(i)}
                    style={{
                      width: isActive ? '24px' : '6px',
                      height: '5px',
                      borderRadius: '999px',
                      background: isActive ? '#2563eb' : '#cbd5e1',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                );
              })}
            </div>
          </motion.section>

          {/* =================================================================
              3. “WHAT ACTUALLY HAPPENS?” — ELEGANT FLOW (NO BOXED CARDS)
             ================================================================= */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.015em'
              }}
            >
              What actually happens?
            </h3>

            {/* Flowing Connected Vertical Journey on Canvas Background */}
            <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '4px' }}>
              {STEPS.map((step, idx) => {
                const isLast = idx === STEPS.length - 1;
                return (
                  <div
                    key={step.num}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      position: 'relative',
                      paddingBottom: isLast ? '0px' : '24px'
                    }}
                  >
                    {/* Node & Connecting Path */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          border: '2px solid #0d9488',
                          color: '#0d9488',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(13, 148, 136, 0.12)',
                          zIndex: 2
                        }}
                      >
                        {step.num}
                      </div>

                      {!isLast && (
                        <div
                          style={{
                            width: '2px',
                            flex: 1,
                            background: '#cbd5e1',
                            margin: '4px 0'
                          }}
                        />
                      )}
                    </div>

                    {/* Clean Text without Enclosing Box */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '2px' }}>
                      <span
                        style={{
                          fontSize: '0.96rem',
                          fontWeight: 800,
                          color: '#0f172a'
                        }}
                      >
                        {step.title}
                      </span>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.86rem',
                          color: '#475569',
                          lineHeight: 1.5
                        }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* =================================================================
              4. REASSURANCE PAUSE (SOFT TINTED BREATHING MOMENT)
             ================================================================= */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)',
              borderRadius: '20px',
              padding: '24px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#ccfbf1',
                fontSize: '1.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              🌿
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#134e4a', lineHeight: 1.35 }}>
                You don’t have to have everything figured out.
              </span>
              <span style={{ fontSize: '0.84rem', color: '#0f766e', lineHeight: 1.45 }}>
                You can simply start where you are.
              </span>
            </div>
          </motion.section>

          {/* =================================================================
              5. PROFESSIONAL SUPPORT (GENTLE OPTIONAL NEXT STEP)
             ================================================================= */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                Ready to explore support?
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Talk with a qualified therapist when you feel ready.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => window.open('https://web.mantracare.com/plans/therapy', '_blank')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Explore Therapy Options</span>
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                onClick={handleMarkAsDone}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 8px'
                }}
              >
                Maybe later
              </button>
            </div>
          </motion.section>

          {/* =================================================================
              6. COMPLETION (SINGLE CLEAN FINISH BLOCK)
             ================================================================= */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '12px',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '28px'
            }}
          >
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              That’s the basics. Take things at your own pace.
            </span>

            {completeError && (
              <div style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 600 }}>
                {completeError}
              </div>
            )}

            {!isCompleted ? (
              <button
                type="button"
                onClick={handleMarkAsDone}
                disabled={isSubmitting}
                style={{
                  minHeight: '46px',
                  width: '100%',
                  maxWidth: '320px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: isSubmitting ? '#93c5fd' : '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 3px 12px rgba(37, 99, 235, 0.2)',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = '#1d4ed8';
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = '#2563eb';
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Mark Activity as Done</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 14px',
                    borderRadius: '9999px',
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    fontSize: '0.84rem',
                    fontWeight: 800
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>Activity Completed</span>
                </div>

                <button
                  type="button"
                  onClick={handleBackClick}
                  style={{
                    marginTop: '2px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 22px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>Continue to My Plan</span>
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
