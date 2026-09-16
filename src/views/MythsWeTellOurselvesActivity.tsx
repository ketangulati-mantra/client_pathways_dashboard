import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
  Compass,
  Smile,
  RefreshCw
} from 'lucide-react';
import {
  logUserActivityToDB,
  saveUserLessonProgress,
  getUserLessonProgress,
  recordUserPersonalizationSignal
} from '../services/activityLogger';
import { completeLesson } from '../mantra/api';
import { getActiveUserId } from '../services/authService';

export const THERAPY_MANTRA_LOGO_URL =
  'https://res.cloudinary.com/hxbamdqf/image/upload/v1786010770/MantraCareLogo_jjuy1c.png';

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
  
  // Interaction state per myth: mythId -> { choice: 'MYTH' | 'REALITY', timestamp: number }
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
      pathwayId: 'mantra_21',
      signal: myth.signalTag,
      sourceType: 'micro_activity',
      sourceId: myth.id,
      metadata: { selectedAnswer: choice, day: 1 }
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
        reflection: 'Questioned 5 common mental health myths on Day 1',
        resultSummary: {
          completedMyths: 5,
          userAnswers,
          completionTimeSeconds: Math.round(completionTimeMs / 1000)
        },
        rewardPoints: 25,
        metadata: {
          activity_started: new Date(startTimeRef.current).toISOString(),
          activity_completed: new Date().toISOString(),
          completion_time_ms: completionTimeMs,
          day: 1
        }
      });

      // 2. Mark completed in lesson system
      try {
        await completeLesson('mantra21_day_01');
      } catch (e) {}

      // 3. Mark Day 1 complete in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`mantra21_day_1_completed_${userId}`, 'true');
        localStorage.setItem(`mantra21_myths_completed_${userId}`, 'true');
      }

      setCompleted(true);

      // Return user to Day 1 / Dashboard
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
        backgroundColor: '#FAFAF9', // Soft light warm neutral
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(224, 242, 254, 0.45) 0%, rgba(250, 250, 249, 0.95) 90%)',
        color: '#0F172A',
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        position: 'relative'
      }}
    >
      {/* AMBIENT BACKGROUND GLOWS */}
      <div
        style={{
          position: 'fixed',
          top: '-10%',
          right: '-10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(56, 189, 248, 0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-10%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.08) 0%, rgba(129, 140, 248, 0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* TOP HEADER */}
      <header
        style={{
          width: '100%',
          maxWidth: '760px',
          height: '64px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
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
            gap: '6px',
            color: '#64748B',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 10px',
            borderRadius: '10px',
            transition: 'background 0.2s'
          }}
        >
          <ArrowLeft size={18} />
          <span>{currentScreen > 0 && currentScreen < 6 ? 'Back' : 'Exit'}</span>
        </button>

        {/* LOGO */}
        <img
          src={THERAPY_MANTRA_LOGO_URL}
          alt="TherapyMantra"
          style={{ height: '28px', objectFit: 'contain' }}
        />

        {/* PROGRESS PILL */}
        {currentScreen >= 1 && currentScreen <= 5 ? (
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#0284C7',
              backgroundColor: '#E0F2FE',
              padding: '4px 12px',
              borderRadius: '999px',
              border: '1px solid #BAE6FD'
            }}
          >
            {currentMyth?.numberStr} / 05
          </div>
        ) : (
          <div style={{ width: '60px' }} />
        )}
      </header>

      {/* PROGRESS BAR (Only on interactive screens) */}
      {currentScreen >= 1 && currentScreen <= 5 && (
        <div
          style={{
            width: '100%',
            maxWidth: '760px',
            padding: '0 20px',
            boxSizing: 'border-box',
            marginBottom: '12px',
            zIndex: 10
          }}
        >
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#E2E8F0',
              borderRadius: '999px',
              overflow: 'hidden'
            }}
          >
            <motion.div
              initial={{ width: `${((currentScreen - 1) / 5) * 100}%` }}
              animate={{ width: `${(currentScreen / 5) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                height: '100%',
                backgroundColor: '#0284C7',
                borderRadius: '999px'
              }}
            />
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '720px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 20px 32px 20px',
          boxSizing: 'border-box',
          zIndex: 5
        }}
      >
        <AnimatePresence mode="wait">
          {/* ========================================================== */}
          {/* SCREEN 0: OPENING SCREEN                                  */}
          {/* ========================================================== */}
          {currentScreen === 0 && (
            <motion.div
              key="opening_screen"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '24px 0'
              }}
            >
              {/* EYEBROW */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  color: '#0369A1',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  marginBottom: '20px'
                }}
              >
                <Sparkles size={14} color="#0284C7" />
                <span>MANTRA 21 · DAY 1</span>
              </div>

              {/* TITLE */}
              <h1
                style={{
                  fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  color: '#0F172A',
                  margin: '0 0 14px 0',
                  maxWidth: '560px'
                }}
              >
                MYTHS WE TELL OURSELVES
              </h1>

              {/* SUBTITLE */}
              <p
                style={{
                  fontSize: 'clamp(1.05rem, 2.8vw, 1.25rem)',
                  fontWeight: 500,
                  color: '#0284C7',
                  margin: '0 0 20px 0',
                  maxWidth: '520px',
                  lineHeight: 1.45
                }}
              >
                “5 common beliefs about mental health. Let’s question them.”
              </p>

              {/* SUPPORTING COPY */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid #E2E8F0',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  padding: '18px 24px',
                  maxWidth: '480px',
                  margin: '0 0 28px 0',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
                }}
              >
                <p
                  style={{
                    fontSize: '0.94rem',
                    color: '#475569',
                    lineHeight: 1.6,
                    margin: 0
                  }}
                >
                  We pick up ideas about mental health from family, friends, social media, movies — and sometimes from ourselves.
                </p>
              </div>

              {/* BADGE */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#64748B',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  marginBottom: '32px'
                }}
              >
                <Clock size={15} />
                <span>3 MIN · 5 MYTHS</span>
              </div>

              {/* PRIMARY CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                style={{
                  width: '100%',
                  maxWidth: '340px',
                  height: '54px',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.28)',
                  transition: 'background 0.2s',
                  marginBottom: '14px'
                }}
              >
                <span>START</span>
                <ArrowRight size={18} />
              </motion.button>

              {/* REASSURANCE */}
              <p
                style={{
                  fontSize: '0.84rem',
                  color: '#94A3B8',
                  margin: 0,
                  maxWidth: '360px',
                  lineHeight: 1.45
                }}
              >
                “This isn’t a test. Just a chance to look at a few ideas differently.”
              </p>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 1..5: MYTH STATEMENT & REVEAL                       */}
          {/* ========================================================== */}
          {currentScreen >= 1 && currentScreen <= 5 && currentMyth && (
            <motion.div
              key={`myth_${currentMyth.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {/* HERO STATEMENT CARD */}
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
                  padding: 'clamp(24px, 5vw, 36px)',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  marginBottom: '20px',
                  position: 'relative'
                }}
              >
                {/* MYTH NUMBER EYEBROW */}
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: '#64748B',
                    textTransform: 'uppercase',
                    marginBottom: '16px'
                  }}
                >
                  MYTH {currentMyth.numberStr} / 05
                </div>

                {/* STATEMENT - HERO OF SCREEN */}
                <h2
                  style={{
                    fontSize: 'clamp(1.45rem, 4vw, 2.1rem)',
                    fontWeight: 800,
                    lineHeight: 1.3,
                    color: '#0F172A',
                    letterSpacing: '-0.025em',
                    margin: '0 0 20px 0'
                  }}
                >
                  {currentMyth.statement}
                </h2>

                {/* QUESTION */}
                {!revealed && (
                  <p
                    style={{
                      fontSize: '0.96rem',
                      fontWeight: 600,
                      color: '#0284C7',
                      margin: '0 0 24px 0'
                    }}
                  >
                    What do you think?
                  </p>
                )}

                {/* TWO LARGE CHOICES: MYTH vs REALITY */}
                {!revealed ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '14px',
                      width: '100%',
                      maxWidth: '440px',
                      margin: '0 auto'
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectChoice('MYTH')}
                      style={{
                        height: '56px',
                        backgroundColor: '#F8FAFC',
                        border: '2px solid #E2E8F0',
                        borderRadius: '16px',
                        color: '#0F172A',
                        fontSize: '1rem',
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#0284C7';
                        e.currentTarget.style.backgroundColor = '#F0F9FF';
                        e.currentTarget.style.color = '#0284C7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.color = '#0F172A';
                      }}
                    >
                      MYTH
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectChoice('REALITY')}
                      style={{
                        height: '56px',
                        backgroundColor: '#F8FAFC',
                        border: '2px solid #E2E8F0',
                        borderRadius: '16px',
                        color: '#0F172A',
                        fontSize: '1rem',
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#0284C7';
                        e.currentTarget.style.backgroundColor = '#F0F9FF';
                        e.currentTarget.style.color = '#0284C7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.color = '#0F172A';
                      }}
                    >
                      REALITY
                    </motion.button>
                  </div>
                ) : null}

                {/* EXPLANATION REVEAL STATE */}
                <AnimatePresence>
                  {revealed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: 12 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      style={{
                        textAlign: 'left',
                        paddingTop: '8px'
                      }}
                    >
                      {/* REVEAL BADGE: IT'S A MYTH */}
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#E0F2FE',
                            border: '1px solid #BAE6FD',
                            color: '#0369A1',
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            letterSpacing: '0.08em',
                            padding: '6px 16px',
                            borderRadius: '999px',
                            textTransform: 'uppercase'
                          }}
                        >
                          <Sparkles size={14} color="#0284C7" />
                          <span>IT’S A MYTH</span>
                        </div>
                      </div>

                      {/* WHY? SECTION */}
                      <div
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '16px',
                          padding: '18px 20px',
                          marginBottom: '14px'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 900,
                            letterSpacing: '0.08em',
                            color: '#0284C7',
                            textTransform: 'uppercase',
                            marginBottom: '6px'
                          }}
                        >
                          <HelpCircle size={15} />
                          <span>WHY?</span>
                        </div>
                        <p
                          style={{
                            fontSize: '0.95rem',
                            lineHeight: 1.55,
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
                          backgroundColor: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          borderRadius: '16px',
                          padding: '18px 20px',
                          marginBottom: '24px'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 900,
                            letterSpacing: '0.08em',
                            color: '#16A34A',
                            textTransform: 'uppercase',
                            marginBottom: '6px'
                          }}
                        >
                          <Lightbulb size={15} />
                          <span>TRY THIS</span>
                        </div>
                        <p
                          style={{
                            fontSize: '0.95rem',
                            lineHeight: 1.55,
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        style={{
                          width: '100%',
                          height: '52px',
                          backgroundColor: '#0284C7',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '14px',
                          fontSize: '1rem',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 6px 20px rgba(2, 132, 199, 0.25)'
                        }}
                      >
                        <span>{currentScreen === 5 ? 'SEE SUMMARY' : 'GOT IT'}</span>
                        <ArrowRight size={18} />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 6: COMPLETION SCREEN                                */}
          {/* ========================================================== */}
          {currentScreen === 6 && (
            <motion.div
              key="completion_screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '16px 0'
              }}
            >
              {/* CHECKMARK ICON */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#E0F2FE',
                  border: '2px solid #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284C7',
                  marginBottom: '20px',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.16)'
                }}
              >
                <CheckCircle2 size={34} />
              </div>

              {/* COMPLETION TITLE */}
              <h1
                style={{
                  fontSize: 'clamp(1.8rem, 4.5vw, 2.4rem)',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  color: '#0F172A',
                  margin: '0 0 14px 0',
                  maxWidth: '540px'
                }}
              >
                YOU JUST QUESTIONED 5 MYTHS
              </h1>

              {/* SUPPORTING COPY */}
              <div
                style={{
                  maxWidth: '480px',
                  margin: '0 0 24px 0',
                  color: '#475569',
                  fontSize: '0.96rem',
                  lineHeight: 1.6
                }}
              >
                <p style={{ margin: '0 0 10px 0' }}>
                  Mental health isn’t about having everything figured out.
                </p>
                <p style={{ margin: 0, fontWeight: 500, color: '#334155' }}>
                  Sometimes progress starts with questioning the assumptions you’ve been carrying.
                </p>
              </div>

              {/* VISUALLY PROMINENT TAKEAWAY BOX */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #BAE6FD',
                  borderRadius: '20px',
                  padding: '24px 24px',
                  boxShadow: '0 8px 28px rgba(2, 132, 199, 0.08)',
                  marginBottom: '32px',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <div
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    color: '#0284C7',
                    textTransform: 'uppercase',
                    marginBottom: '10px'
                  }}
                >
                  ONE THING TO REMEMBER
                </div>
                <p
                  style={{
                    fontSize: 'clamp(1.15rem, 3vw, 1.35rem)',
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCompleteActivity}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  maxWidth: '340px',
                  height: '54px',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.28)',
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
