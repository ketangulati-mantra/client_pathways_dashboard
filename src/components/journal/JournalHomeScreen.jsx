import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, PenTool, Sun, Sparkles, BookOpen } from 'lucide-react';
import { useCheckInState } from '../../hooks/useCheckInState';
import { useStoryState } from '../../hooks/useStoryState';
import { getUserJournalEntries } from '../../services/journalService';
import { getActiveUserId } from '../../services/authService';
import StoryFeaturedCard from './story/StoryFeaturedCard.jsx';
import { extractEntryDisplay } from '../../services/journalFormatting';

export default function JournalHomeScreen({
  onBack,
  onNavigateToCheckIn,
  onStartFreeWrite,
  onStartReflectOnToday,
  onStartGuidedPrompt,
  onSelectEntry,
  onViewAllHistory,
  onOpenStory,
  successToastMessage
}) {
  const shouldReduceMotion = useReducedMotion();
  const userId = getActiveUserId();

  // Centralized Canonical Check-In State from Database
  const {
    hasCheckedInToday: hasCompletedCheckIn,
    todayLatestCheckIn: latestCheckIn,
    streak: dbStreak
  } = useCheckInState(userId);

  // Story state for featured companion card
  const {
    storyState,
    latestChapter,
    hasChapters
  } = useStoryState(userId);

  const [dbEntries, setDbEntries] = useState([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState(successToastMessage || null);

  // Auto-clear success toast
  useEffect(() => {
    if (successToastMessage) {
      setFeedbackToast(successToastMessage);
      const timer = setTimeout(() => setFeedbackToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successToastMessage]);

  // Fetch recent journal entries
  useEffect(() => {
    let isMounted = true;
    async function loadEntries() {
      try {
        const entries = await getUserJournalEntries(userId, 20).catch(() => []);
        if (isMounted) {
          setDbEntries(Array.isArray(entries) ? entries : []);
        }
      } catch (err) {
        console.warn('[Journal] Failed to load entries:', err);
      } finally {
        if (isMounted) setIsLoadingEntries(false);
      }
    }
    loadEntries();
    return () => {
      isMounted = false;
    };
  }, [userId, successToastMessage]);

  // Date formatting: e.g. "Tuesday, September 1"
  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Emotional context from check-in (strictly null if no check-in today)
  const checkInEmotion = hasCompletedCheckIn ? latestCheckIn?.primary_emotion : null;

  const handleStartOption = (type) => {
    if (type === 'free_write') {
      if (onStartFreeWrite) onStartFreeWrite();
    } else if (type === 'reflect_today') {
      if (onStartReflectOnToday) onStartReflectOnToday();
      else {
        setFeedbackToast('Reflect on Today (Coming in Phase 4)');
        setTimeout(() => setFeedbackToast(null), 2500);
      }
    } else if (type === 'guided_prompt') {
      if (onStartGuidedPrompt) onStartGuidedPrompt();
      else {
        setFeedbackToast('Guided Prompts (Coming in Phase 5)');
        setTimeout(() => setFeedbackToast(null), 2500);
      }
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#/';
    }
  };

  const handleCheckInClick = () => {
    if (onNavigateToCheckIn) {
      onNavigateToCheckIn();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#/task/daily-check-in';
    }
  };

  const handleEntryClick = (entry) => {
    if (onSelectEntry) {
      onSelectEntry(entry);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        background: '#FAF7F2',
        color: '#1E293B',
        fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        .journal-flow-container {
          width: 100%;
          max-width: 860px;
          margin: 0 auto;
          padding: 20px 18px 72px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .reflection-actions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          width: 100%;
        }

        .journal-history-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 18px 0;
          border-bottom: 1px solid #EBE5DB;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .journal-history-row:last-child {
          border-bottom: none;
        }

        .journal-history-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        @media (min-width: 680px) {
          .journal-flow-container {
            padding: 32px 28px 88px;
            gap: 34px;
          }

          .reflection-actions-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }

          .journal-history-header {
            flex-direction: row;
            align-items: baseline;
            justify-content: space-between;
          }
        }
      `}</style>

      {/* Atmospheric Soft Light Washes */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '320px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(243, 238, 228, 0.9) 0%, rgba(250, 247, 242, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Main Single Vertical Cohesive Container */}
      <div className="journal-flow-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* 1. Header: Back Navigation & Editorial Title + Date */}
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
            paddingTop: '2px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <motion.button
              type="button"
              onClick={handleBackClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Go back"
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
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
            <h1
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: 'clamp(2.2rem, 5vw, 2.9rem)',
                fontWeight: 600,
                color: '#0F172A',
                margin: 0,
                lineHeight: 1.08,
                letterSpacing: '-0.03em'
              }}
            >
              Journal
            </h1>

            <span
              style={{
                fontSize: '0.9rem',
                color: '#64748B',
                fontWeight: 500,
                letterSpacing: '-0.01em'
              }}
            >
              {todayDateFormatted}
            </span>
          </div>
        </header>

        {/* 2. SECTION 1: START A REFLECTION (PRIMARY ACTION) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#64748B',
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}
          >
            START A REFLECTION
          </span>

          <div className="reflection-actions-grid">
            {/* Option 1: Free Write (Soft Teal/Sage Tint) */}
            <motion.div
              whileHover={{ y: -2, boxShadow: '0 6px 18px rgba(15, 118, 110, 0.08)' }}
              whileTap={{ scale: 0.985 }}
              onClick={() => handleStartOption('free_write')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '18px 18px',
                background: '#EDF7F6', // Soft calm teal/sage tint
                border: '1px solid #D5ECE9',
                borderRadius: '18px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.015)',
                transition: 'all 0.25s ease',
                minHeight: '138px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(15, 118, 110, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0F766E',
                    boxShadow: '0 2px 6px rgba(15, 118, 110, 0.06)'
                  }}
                >
                  <PenTool size={17} strokeWidth={2.2} />
                </div>
                <ArrowRight size={15} strokeWidth={2.2} color="#0F766E" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '10px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                  ✍️ Free Write
                </span>
                <span style={{ fontSize: '0.84rem', color: '#4D615F', fontWeight: 400, lineHeight: 1.4 }}>
                  Write whatever is on your mind.
                </span>
              </div>
            </motion.div>

            {/* Option 2: Reflect on Today (Warm Peach / Gold Tint) */}
            <motion.div
              whileHover={{ y: -2, boxShadow: '0 6px 18px rgba(217, 119, 6, 0.08)' }}
              whileTap={{ scale: 0.985 }}
              onClick={() => handleStartOption('reflect_today')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '18px 18px',
                background: '#FAF3E8', // Warm soft peach / gold tint
                border: '1px solid #EFE2CE',
                borderRadius: '18px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.015)',
                transition: 'all 0.25s ease',
                minHeight: '138px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(217, 119, 6, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#B45309',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.06)'
                  }}
                >
                  <Sun size={18} strokeWidth={2.2} />
                </div>
                <ArrowRight size={15} strokeWidth={2.2} color="#B45309" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '10px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                  ☀️ Reflect on Today
                </span>
                <span style={{ fontSize: '0.84rem', color: '#6A5946', fontWeight: 400, lineHeight: 1.4 }}>
                  Explore thoughts and feelings from today.
                </span>
              </div>
            </motion.div>

            {/* Option 3: Guided Prompt (Soft Lavender Tint) */}
            <motion.div
              whileHover={{ y: -2, boxShadow: '0 6px 18px rgba(124, 58, 237, 0.08)' }}
              whileTap={{ scale: 0.985 }}
              onClick={() => handleStartOption('guided_prompt')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '18px 18px',
                background: '#F5F1FA', // Soft gentle lavender tint
                border: '1px solid #E8E0F2',
                borderRadius: '18px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.015)',
                transition: 'all 0.25s ease',
                minHeight: '138px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(124, 58, 237, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7C3AED',
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.06)'
                  }}
                >
                  <Sparkles size={17} strokeWidth={2.2} />
                </div>
                <ArrowRight size={15} strokeWidth={2.2} color="#7C3AED" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '10px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                  ✨ Guided Prompt
                </span>
                <span style={{ fontSize: '0.84rem', color: '#5F5170', fontWeight: 400, lineHeight: 1.4 }}>
                  Let a thoughtful prompt help you begin.
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2.5 SECTION: YOUR EVOLVING STORY (FEATURED COMPANION) */}
        <StoryFeaturedCard
          storyState={storyState}
          latestChapter={latestChapter}
          hasChapters={hasChapters}
          onOpenStory={onOpenStory}
        />

        {/* 3. SECTION 2: DAILY CHECK-IN CONNECTION (SECONDARY) */}
        {!hasCompletedCheckIn ? (
          /* =========================================================================
             STATE A: USER HAS NOT COMPLETED TODAY'S CHECK-IN
             ========================================================================= */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              background: '#F0F7FA', // Subtle pale teal / airy blue tint
              border: '1px solid #DCEBF2',
              borderRadius: '16px',
              padding: '16px 20px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '560px' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#0284C7',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase'
                }}
              >
                BEFORE YOU BEGIN
              </span>
              <span
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#0F172A',
                  letterSpacing: '-0.015em'
                }}
              >
                How are you feeling right now?
              </span>
              <span style={{ fontSize: '0.84rem', color: '#526071', fontWeight: 400 }}>
                Taking a moment to notice how you're feeling can help guide your reflection.
              </span>
            </div>

            <motion.button
              type="button"
              onClick={handleCheckInClick}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: '#0284C7',
                border: 'none',
                borderRadius: '9999px',
                padding: '9px 18px',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
                outline: 'none',
                transition: 'background-color 0.2s ease'
              }}
            >
              <span>Log your mood</span>
              <ArrowRight size={14} strokeWidth={2.2} />
            </motion.button>
          </motion.div>
        ) : (
          /* =========================================================================
             STATE B: USER HAS COMPLETED TODAY'S CHECK-IN (SUBTLE CONTEXTUAL INSIGHT)
             ========================================================================= */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              background: '#F0FDF4', // Gentle subtle pale green wash
              border: '1px solid #D1FAE5',
              borderRadius: '16px',
              padding: '14px 18px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🫧</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>
                  You're feeling {checkInEmotion} today
                </span>
                <span style={{ fontSize: '0.82rem', color: '#047857' }}>
                  You can bring that into your reflection.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStartOption('reflect_today')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#047857',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 6px',
                outline: 'none'
              }}
            >
              <span>Reflect</span>
              <ArrowRight size={13} strokeWidth={2.2} />
            </button>
          </motion.div>
        )}

        {/* 4. SECTION 3: RECENT REFLECTIONS (CLEAN NOTEBOOK HISTORY LIST / CALM EMPTY STATE) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '2px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.12em',
                textTransform: 'uppercase'
              }}
            >
              RECENT REFLECTIONS
            </span>

            {dbEntries.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (onViewAllHistory) {
                    onViewAllHistory();
                  } else {
                    setFeedbackToast('Viewing all reflections');
                    setTimeout(() => setFeedbackToast(null), 2000);
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0284C7',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  outline: 'none'
                }}
              >
                <span>View all</span>
                <ArrowRight size={13} strokeWidth={2.2} />
              </button>
            )}
          </div>

          {/* Clean Journal Pages List or Calm Empty State */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dbEntries.length > 0 ? (
              dbEntries.map((entry) => {
                const display = extractEntryDisplay(entry);

                return (
                  <motion.div
                    key={entry.id}
                    className="journal-history-row"
                    whileHover={{ x: 2 }}
                    onClick={() => handleEntryClick(entry)}
                  >
                    {/* Entry Header: Title on Left, Metadata on Right */}
                    <div className="journal-history-header">
                      <span
                        style={{
                          fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                          fontSize: '1.18rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          letterSpacing: '-0.015em'
                        }}
                      >
                        {display.displayTitle}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {display.emotion && (
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: display.emotionColor
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#64748B'
                          }}
                        >
                          {display.relativeDate} {display.emotion ? `· ${display.emotion}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Entry Preview Snippet (clean user text without raw markdown) */}
                    {display.userSnippet && (
                      <p
                        style={{
                          fontSize: '0.88rem',
                          color: '#52525B',
                          margin: 0,
                          lineHeight: 1.55,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontWeight: 400
                        }}
                      >
                        {display.userSnippet}
                      </p>
                    )}
                  </motion.div>
                );
              })
            ) : (
              /* Calm Empty State (No fake placeholders) */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '36px 20px',
                  gap: '8px'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#F0EBE1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#78716C',
                    marginBottom: '2px'
                  }}
                >
                  <BookOpen size={18} strokeWidth={2} />
                </div>
                <span
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: '1.18rem',
                    fontWeight: 600,
                    color: '#0F172A'
                  }}
                >
                  Your reflections will appear here
                </span>
                <span
                  style={{
                    fontSize: '0.86rem',
                    color: '#78716C',
                    maxWidth: '300px',
                    lineHeight: 1.5
                  }}
                >
                  Start writing whenever something is on your mind.
                </span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Subtle Toast Feedback */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0F172A',
              borderRadius: '9999px',
              padding: '10px 22px',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 600,
              boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={15} color="#FDE047" />
            <span>{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
