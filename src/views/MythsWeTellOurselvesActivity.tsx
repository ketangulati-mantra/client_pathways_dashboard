import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import {
  logUserActivityToDB,
  saveUserLessonProgress,
  getUserLessonProgress,
  recordUserPersonalizationSignal
} from '../services/activityLogger';
import { completeLesson } from '../mantra/api';
import { getActiveUserId } from '../services/authService';

export interface MythItem {
  id: string;
  numberStr: string;
  statement: string;
  answer: 'MYTH' | 'REALITY';
  why: string;
  tryThis: string;
  signalTag: string;
}

export const MYTHS_DATA: MythItem[] = [
  {
    id: 'myth_01',
    numberStr: '01',
    statement: '“I need to feel motivated before I can start doing things.”',
    answer: 'MYTH',
    why: 'Motivation doesn’t always come first. Sometimes taking a small action can help create momentum, even when you don’t feel like doing much.',
    tryThis: 'Instead of waiting to feel ready, choose the smallest possible version of something you need to do.',
    signalTag: 'motivation_action_momentum'
  },
  {
    id: 'myth_02',
    numberStr: '02',
    statement: '“Taking care of myself is selfish when other people need me.”',
    answer: 'MYTH',
    why: 'Looking after your own basic needs isn’t selfish. Rest, boundaries, enjoyable activities and asking for support can all be part of taking care of yourself.',
    tryThis: 'Think of self-care as maintenance, not a reward you have to earn.',
    signalTag: 'self_care_maintenance_boundaries'
  },
  {
    id: 'myth_03',
    numberStr: '03',
    statement: '“If I can’t explain what’s wrong, I shouldn’t ask for help.”',
    answer: 'MYTH',
    why: 'You don’t need a perfect explanation before reaching out. Sometimes saying ‘I haven’t been feeling like myself lately’ is enough to start a conversation.',
    tryThis: 'You can ask for support before you fully understand what you’re experiencing.',
    signalTag: 'help_seeking_unfiltered'
  },
  {
    id: 'myth_04',
    numberStr: '04',
    statement: '“Having a bad day means I’m losing all the progress I’ve made.”',
    answer: 'MYTH',
    why: 'Progress isn’t usually a straight line. Difficult days can happen even while you’re building helpful habits and learning new ways of coping.',
    tryThis: 'Look at how you respond over time, rather than expecting every day to go perfectly.',
    signalTag: 'nonlinear_progress_resilience'
  },
  {
    id: 'myth_05',
    numberStr: '05',
    statement: '“Therapy is only for people with a serious mental health problem.”',
    answer: 'MYTH',
    why: 'People seek therapy for many reasons — including persistent distress, relationship difficulties, life changes, stress, and wanting help understanding patterns in their lives.',
    tryThis: 'You don’t have to wait until things feel overwhelming to consider professional support.',
    signalTag: 'therapy_readiness_normalization'
  }
];

interface MythsWeTellOurselvesActivityProps {
  onBack?: () => void;
  onNavigate?: (route: string) => void;
  service?: string;
}

export const MythsWeTellOurselvesActivity: React.FC<MythsWeTellOurselvesActivityProps> = ({
  onBack,
  onNavigate,
  service = 'therapy'
}) => {
  // Navigation & Flow State
  // 0: Opening Screen, 1..5: Myth 1..5, 6: Completion Screen
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  
  // Interaction state per myth: mythId -> 'MYTH' | 'REALITY'
  const [userAnswers, setUserAnswers] = useState<Record<string, 'MYTH' | 'REALITY'>>({});
  // Is explanation revealed for current myth
  const [revealed, setRevealed] = useState<boolean>(false);

  // Submitting / Completion state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const initialLoadRef = useRef<boolean>(false);

  // 1. Resume / Load saved progress on Mount
  useEffect(() => {
    async function loadProgress() {
      if (initialLoadRef.current) return;
      initialLoadRef.current = true;

      try {
        const userId = getActiveUserId();
        const saved = await getUserLessonProgress('mantra21_myths_we_tell_ourselves', userId);

        if (saved && saved.current_step > 0 && saved.current_step <= 5) {
          setCurrentScreen(saved.current_step);
          if (saved.response_data?.userAnswers) {
            setUserAnswers(saved.response_data.userAnswers);
            const mythIdx = saved.current_step - 1;
            if (saved.response_data.userAnswers[MYTHS_DATA[mythIdx]?.id]) {
              setRevealed(true);
            }
          }
        }
      } catch (err) {
        console.warn('[MythsActivity] Error loading saved progress:', err);
      }
    }

    loadProgress();
  }, []);

  // Auto-save progress
  const saveProgressState = async (screenIdx: number, answersMap: Record<string, 'MYTH' | 'REALITY'>) => {
    try {
      const userId = getActiveUserId();
      await saveUserLessonProgress({
        userId,
        lessonId: 'mantra21_myths_we_tell_ourselves',
        currentStep: screenIdx,
        totalSteps: 7,
        responseData: {
          userAnswers: answersMap,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (e) {
      console.warn('[MythsActivity] Failed saving progress:', e);
    }
  };

  // Start activity
  const handleStart = () => {
    setCurrentScreen(1);
    setRevealed(false);
    saveProgressState(1, userAnswers);
  };

  // Handle Option Select (MYTH / REALITY)
  const handleSelectChoice = (choice: 'MYTH' | 'REALITY') => {
    const myth = MYTHS_DATA[currentScreen - 1];
    if (!myth) return;

    const updated = {
      ...userAnswers,
      [myth.id]: choice
    };
    setUserAnswers(updated);
    setRevealed(true);

    // Record non-clinical signal tag
    recordUserPersonalizationSignal({
      pathwayId: 'standalone_psychoeducation',
      signal: myth.signalTag,
      sourceType: 'micro_activity',
      sourceId: myth.id,
      metadata: { selectedAnswer: choice }
    }).catch(() => {});

    saveProgressState(currentScreen, updated);
  };

  // Move to next myth or completion
  const handleNext = () => {
    if (currentScreen < 5) {
      const nextScreen = currentScreen + 1;
      setCurrentScreen(nextScreen);
      const nextMyth = MYTHS_DATA[nextScreen - 1];
      setRevealed(Boolean(userAnswers[nextMyth.id]));
      saveProgressState(nextScreen, userAnswers);
    } else {
      setCurrentScreen(6);
      saveProgressState(6, userAnswers);
    }
  };

  // Final Complete Action
  const handleCompleteActivity = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const userId = getActiveUserId();
      const completionTimeMs = Date.now() - startTimeRef.current;

      // 1. Universal Activity Logger
      await logUserActivityToDB({
        userId,
        activityId: 'mantra21_myths_we_tell_ourselves',
        activityType: 'psychoeducation_micro_activity',
        lessonId: 'mantra21_day_01',
        service,
        emotionZone: 'mind',
        primaryEmotion: 'insight',
        reflection: 'Questioned 5 common mental health myths',
        resultSummary: {
          completedMyths: 5,
          userAnswers,
          completionTimeSeconds: Math.round(completionTimeMs / 1000)
        },
        rewardPoints: 25,
        metadata: {
          activity_started: new Date(startTimeRef.current).toISOString(),
          activity_completed: new Date().toISOString(),
          completion_time_ms: completionTimeMs
        }
      });

      // 2. Mark completed in lesson system
      try {
        await completeLesson('mantra21_day_01');
      } catch (e) {}

      // 3. Mark completion in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`mantra21_day_1_completed_${userId}`, 'true');
        localStorage.setItem(`mantra21_myths_completed_${userId}`, 'true');
      }

      setCompleted(true);

      // Return user to previous flow / dashboard
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('/challenges');
        } else if (onBack) {
          onBack();
        } else {
          window.location.hash = '#/challenges';
        }
      }, 700);
    } catch (err) {
      console.error('[MythsActivity] Error completing activity:', err);
      if (onNavigate) {
        onNavigate('/challenges');
      } else if (onBack) {
        onBack();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMyth = currentScreen >= 1 && currentScreen <= 5 ? MYTHS_DATA[currentScreen - 1] : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(ellipse 70% 50% at 50% -10%, rgba(224, 242, 254, 0.75) 0%, rgba(248, 250, 252, 0) 100%),
          radial-gradient(ellipse 60% 40% at 85% 65%, rgba(238, 242, 255, 0.65) 0%, rgba(248, 250, 252, 0) 100%),
          radial-gradient(ellipse 50% 50% at 15% 85%, rgba(240, 249, 255, 0.7) 0%, rgba(248, 250, 252, 0) 100%)
        `,
        color: '#0F172A',
        fontFamily: "'Plus Jakarta Sans', 'Outfit', 'Inter', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        position: 'relative'
      }}
    >
      {/* ATMOSPHERIC BACKGROUND BLOBS */}
      <div
        style={{
          position: 'fixed',
          top: '-15%',
          right: '-10%',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(186, 230, 253, 0.4) 0%, rgba(186, 230, 253, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-15%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(199, 210, 254, 0.35) 0%, rgba(199, 210, 254, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* MINIMALIST HEADER - NO LOGOS, NO MANTRA 21 */}
      <header
        style={{
          width: '100%',
          maxWidth: '840px',
          height: '64px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
          boxSizing: 'border-box'
        }}
      >
        <button
          onClick={() => {
            if (currentScreen > 0 && currentScreen < 6) {
              setCurrentScreen(currentScreen - 1);
            } else if (onBack) {
              onBack();
            } else if (onNavigate) {
              onNavigate('/challenges');
            } else {
              window.history.back();
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748B',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '12px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#0F172A';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748B';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft size={17} />
          <span>{currentScreen > 0 && currentScreen < 6 ? 'Back' : 'Exit'}</span>
        </button>

        {/* PROGRESS PILL */}
        {currentScreen >= 1 && currentScreen <= 5 ? (
          <div
            style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#0284C7',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              padding: '5px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(186, 230, 253, 0.8)',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.06)',
              backdropFilter: 'blur(8px)'
            }}
          >
            {currentMyth?.numberStr} / 05
          </div>
        ) : (
          <div style={{ width: '48px' }} />
        )}
      </header>

      {/* TOP PROGRESS BAR */}
      {currentScreen >= 1 && currentScreen <= 5 && (
        <div
          style={{
            width: '100%',
            maxWidth: '840px',
            padding: '0 24px',
            boxSizing: 'border-box',
            marginBottom: '8px',
            zIndex: 20
          }}
        >
          <div
            style={{
              width: '100%',
              height: '3px',
              backgroundColor: 'rgba(226, 232, 240, 0.7)',
              borderRadius: '999px',
              overflow: 'hidden'
            }}
          >
            <motion.div
              initial={{ width: `${((currentScreen - 1) / 5) * 100}%` }}
              animate={{ width: `${(currentScreen / 5) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #38BDF8 0%, #0284C7 100%)',
                borderRadius: '999px'
              }}
            />
          </div>
        </div>
      )}

      {/* MAIN OPEN CANVAS */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 24px 48px 24px',
          boxSizing: 'border-box',
          zIndex: 10
        }}
      >
        <AnimatePresence mode="wait">
          {/* ========================================================== */}
          {/* SCREEN 0: EDITORIAL OPENING SCREEN                         */}
          {/* ========================================================== */}
          {currentScreen === 0 && (
            <motion.div
              key="editorial_opening"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '20px 0'
              }}
            >
              {/* EYEBROW */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#0284C7',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '20px'
                }}
              >
                <span>5 MINUTE RESET</span>
              </div>

              {/* HERO TITLE */}
              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 6.5vw, 3.8rem)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '-0.035em',
                  color: '#0F172A',
                  margin: '0 0 16px 0',
                  maxWidth: '680px'
                }}
              >
                MYTHS WE TELL<br />OURSELVES
              </h1>

              {/* SUBTITLE */}
              <p
                style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.35rem)',
                  fontWeight: 500,
                  color: '#0284C7',
                  margin: '0 0 24px 0',
                  maxWidth: '560px',
                  lineHeight: 1.45
                }}
              >
                “5 common beliefs about mental health.<br />Let’s question them.”
              </p>

              {/* SUPPORTING TEXT - DIRECTLY ON CANVAS */}
              <p
                style={{
                  fontSize: 'clamp(0.96rem, 2.4vw, 1.08rem)',
                  color: '#475569',
                  lineHeight: 1.65,
                  maxWidth: '520px',
                  margin: '0 0 32px 0'
                }}
              >
                We pick up ideas about mental health from family, friends, social media, movies — and sometimes from ourselves.
              </p>

              {/* BADGE */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#64748B',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  marginBottom: '36px'
                }}
              >
                <Clock size={15} />
                <span>3 MIN · 5 MYTHS</span>
              </div>

              {/* PRIMARY CTA */}
              <motion.button
                whileHover={{ scale: 1.025, translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  height: '56px',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 28px rgba(2, 132, 199, 0.28)',
                  transition: 'background 0.2s',
                  marginBottom: '16px'
                }}
              >
                <span>START</span>
                <ArrowRight size={18} />
              </motion.button>

              {/* REASSURANCE */}
              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#94A3B8',
                  margin: 0,
                  maxWidth: '380px',
                  lineHeight: 1.45
                }}
              >
                “This isn’t a test. Just a chance to look at a few ideas differently.”
              </p>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 1..5: OPEN-CANVAS MYTH QUESTION                     */}
          {/* ========================================================== */}
          {currentScreen >= 1 && currentScreen <= 5 && currentMyth && (
            <motion.div
              key={`open_myth_${currentMyth.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '12px 0'
              }}
            >
              {/* SMALL EYEBROW */}
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#0284C7',
                  textTransform: 'uppercase',
                  marginBottom: '20px'
                }}
              >
                MYTH {currentMyth.numberStr} / 05
              </div>

              {/* LARGE EDITORIAL STATEMENT - VISUAL HERO */}
              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
                  fontWeight: 900,
                  lineHeight: 1.22,
                  color: '#0F172A',
                  letterSpacing: '-0.03em',
                  margin: '0 0 28px 0',
                  maxWidth: '720px'
                }}
              >
                {currentMyth.statement}
              </h2>

              {/* QUESTION & SELECTION (BEFORE REVEAL) */}
              {!revealed ? (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: '#64748B',
                      textTransform: 'uppercase',
                      margin: '0 0 24px 0'
                    }}
                  >
                    WHAT DO YOU THINK?
                  </p>

                  {/* TWO LARGE TACTILE BUTTONS */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      width: '100%',
                      maxWidth: '460px'
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.025, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectChoice('MYTH')}
                      style={{
                        height: '64px',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid rgba(226, 232, 240, 0.9)',
                        borderRadius: '18px',
                        color: '#0F172A',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#0284C7';
                        e.currentTarget.style.backgroundColor = '#F0F9FF';
                        e.currentTarget.style.color = '#0284C7';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.color = '#0F172A';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.04)';
                      }}
                    >
                      MYTH
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.025, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectChoice('REALITY')}
                      style={{
                        height: '64px',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid rgba(226, 232, 240, 0.9)',
                        borderRadius: '18px',
                        color: '#0F172A',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#0284C7';
                        e.currentTarget.style.backgroundColor = '#F0F9FF';
                        e.currentTarget.style.color = '#0284C7';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.color = '#0F172A';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.04)';
                      }}
                    >
                      REALITY
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* EXPLANATION REVEAL - SEAMLESS CANVAS FLOW */
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    width: '100%',
                    maxWidth: '580px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  {/* REVEAL BADGE */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(224, 242, 254, 0.8)',
                      border: '1px solid rgba(186, 230, 253, 0.9)',
                      color: '#0369A1',
                      fontSize: '0.8rem',
                      fontWeight: 900,
                      letterSpacing: '0.1em',
                      padding: '6px 18px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      marginBottom: '24px'
                    }}
                  >
                    <Sparkles size={14} color="#0284C7" />
                    <span>IT’S A MYTH</span>
                  </div>

                  {/* WHY? SECTION */}
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      backgroundColor: 'rgba(255, 255, 255, 0.85)',
                      border: '1px solid rgba(226, 232, 240, 0.85)',
                      borderRadius: '20px',
                      padding: '20px 24px',
                      marginBottom: '14px',
                      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                      backdropFilter: 'blur(10px)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        letterSpacing: '0.1em',
                        color: '#0284C7',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}
                    >
                      WHY?
                    </div>
                    <p
                      style={{
                        fontSize: 'clamp(0.96rem, 2vw, 1.04rem)',
                        lineHeight: 1.6,
                        color: '#334155',
                        margin: 0
                      }}
                    >
                      {currentMyth.why}
                    </p>
                  </div>

                  {/* TRY THIS SECTION */}
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      backgroundColor: 'rgba(240, 253, 244, 0.85)',
                      border: '1px solid rgba(187, 247, 208, 0.85)',
                      borderRadius: '20px',
                      padding: '20px 24px',
                      marginBottom: '28px',
                      boxShadow: '0 4px 20px rgba(22, 163, 74, 0.03)',
                      backdropFilter: 'blur(10px)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        letterSpacing: '0.1em',
                        color: '#16A34A',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}
                    >
                      TRY THIS
                    </div>
                    <p
                      style={{
                        fontSize: 'clamp(0.96rem, 2vw, 1.04rem)',
                        lineHeight: 1.6,
                        color: '#166534',
                        fontWeight: 500,
                        margin: 0
                      }}
                    >
                      {currentMyth.tryThis}
                    </p>
                  </div>

                  {/* GOT IT CTA */}
                  <motion.button
                    whileHover={{ scale: 1.025, translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      height: '52px',
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '1rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
                      transition: 'background 0.2s'
                    }}
                  >
                    <span>{currentScreen === 5 ? 'SEE SUMMARY' : 'GOT IT'}</span>
                    <ArrowRight size={18} />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 6: COMPLETION SCREEN - OPEN CANVAS                  */}
          {/* ========================================================== */}
          {currentScreen === 6 && (
            <motion.div
              key="completion_open_screen"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '16px 0'
              }}
            >
              {/* CHECKMARK BADGE */}
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid rgba(186, 230, 253, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284C7',
                  marginBottom: '24px',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.12)'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              {/* COMPLETION TITLE */}
              <h1
                style={{
                  fontSize: 'clamp(2rem, 5.5vw, 3rem)',
                  fontWeight: 900,
                  lineHeight: 1.12,
                  letterSpacing: '-0.035em',
                  color: '#0F172A',
                  margin: '0 0 16px 0',
                  maxWidth: '600px'
                }}
              >
                YOU JUST QUESTIONED<br />5 MYTHS
              </h1>

              {/* SUPPORTING COPY */}
              <div
                style={{
                  maxWidth: '520px',
                  margin: '0 0 32px 0',
                  color: '#475569',
                  fontSize: 'clamp(0.96rem, 2.4vw, 1.05rem)',
                  lineHeight: 1.65
                }}
              >
                <p style={{ margin: '0 0 8px 0' }}>
                  Mental health isn’t about having everything figured out.
                </p>
                <p style={{ margin: 0, fontWeight: 500, color: '#1E293B' }}>
                  Sometimes progress starts with questioning the assumptions you’ve been carrying.
                </p>
              </div>

              {/* HERO TAKEAWAY */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1.5px solid rgba(186, 230, 253, 0.9)',
                  borderRadius: '24px',
                  padding: '28px 28px',
                  boxShadow: '0 10px 30px rgba(2, 132, 199, 0.08)',
                  marginBottom: '36px',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    color: '#0284C7',
                    textTransform: 'uppercase',
                    marginBottom: '10px'
                  }}
                >
                  ONE THING TO REMEMBER
                </div>
                <p
                  style={{
                    fontSize: 'clamp(1.2rem, 3.2vw, 1.45rem)',
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: 1.35,
                    margin: 0
                  }}
                >
                  “You don’t have to feel ready to take a small step.”
                </p>
              </div>

              {/* PRIMARY CTA: COMPLETE ACTIVITY */}
              <motion.button
                whileHover={{ scale: 1.025, translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCompleteActivity}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  height: '56px',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 28px rgba(2, 132, 199, 0.28)',
                  opacity: isSubmitting ? 0.75 : 1
                }}
              >
                {isSubmitting ? (
                  <span>SAVING PROGRESS...</span>
                ) : (
                  <>
                    <span>COMPLETE ACTIVITY</span>
                    <CheckCircle2 size={18} />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MythsWeTellOurselvesActivity;
