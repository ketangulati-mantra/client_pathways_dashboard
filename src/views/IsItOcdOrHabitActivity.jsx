import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { handleExit, goToLesson } from '../mantra/navigation';
import { completeLesson } from '../mantra/api';
import { getActiveUserId } from '../services/authService';

const LESSON_ID = 'ocd_habit';
const OCDMANTRA_LOGO_URL =
  'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png';

export default function IsItOcdOrHabitActivity({ onBack, onNavigate }) {
  const { t } = useTranslation('ocd_habit');
  const prefersReducedMotion = useReducedMotion();

  const { handleActionComplete } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasAction: true,
    hasQuiz: false
  });

  // Stage state: 1 to 5
  const [stage, setStage] = useState(1);

  // Stage 2 State: "I CHECK ONCE" vs "I CHECK AGAIN" Interactive Story
  const [stage2Choice, setStage2Choice] = useState(null); // null | 'once' | 'again'
  const [isPlaying, setIsPlaying] = useState(false);
  const [sequenceStep, setSequenceStep] = useState(0);
  const [hasViewedOnce, setHasViewedOnce] = useState(false);
  const [hasViewedAgain, setHasViewedAgain] = useState(false);

  // Stage 3 State: "LOOK CLOSER" (Observation Points: 'doubt' | 'repetition' | 'relief')
  const [stage3Observation, setStage3Observation] = useState(null);

  // Stage 4 State: "NOW TRY IT ON SOMETHING ELSE" (2 sequential application scenarios)
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0); // 0, 1
  const [scenarioSelections, setScenarioSelections] = useState({}); // { 0: 'opt_id', 1: 'opt_id' }

  // Completion state
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState(null);

  const stage2TimerRef = useRef(null);

  const trackEvent = (eventName, data = {}) => {
    try {
      const payload = {
        event: eventName,
        user_id: getActiveUserId(),
        activity_id: LESSON_ID,
        service: 'ocd',
        timestamp: new Date().toISOString(),
        ...data
      };
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push(payload);
      }
      console.log(`[Analytics] ${eventName}:`, payload);
    } catch (err) {
      console.warn('Analytics error:', err);
    }
  };

  useEffect(() => {
    trackEvent('activity_started');
    return () => {
      if (stage2TimerRef.current) clearTimeout(stage2TimerRef.current);
    };
  }, []);

  const goToStage = (nextStage) => {
    setStage(nextStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackEvent(`stage_${nextStage}_viewed`);
  };

  // ----------------------------------------------------
  // Stage 2: Sequence Playback Controller ("I CHECK ONCE" vs "I CHECK AGAIN")
  // ----------------------------------------------------
  const playSequence = (choice) => {
    if (stage2TimerRef.current) clearTimeout(stage2TimerRef.current);
    setIsPlaying(true);
    setSequenceStep(0);
    setStage2Choice(choice);
    trackEvent('experience_played', { choice });

    if (choice === 'once') {
      // Steps: 0 (LOCK) -> 1 (CHECK) -> 2 ("Looks locked.") -> 3 (DONE)
      stage2TimerRef.current = setTimeout(() => {
        setSequenceStep(1);
        stage2TimerRef.current = setTimeout(() => {
          setSequenceStep(2);
          stage2TimerRef.current = setTimeout(() => {
            setSequenceStep(3);
            setIsPlaying(false);
            setHasViewedOnce(true);
          }, 850);
        }, 850);
      }, 750);
    } else if (choice === 'again') {
      // Steps: 0 (LOCK) -> 1 (CHECK) -> 2 (“But what if I missed something?”) -> 3 (CHECK AGAIN) -> 4 (RELIEF) -> 5 (“But what if…?” ↺)
      stage2TimerRef.current = setTimeout(() => {
        setSequenceStep(1);
        stage2TimerRef.current = setTimeout(() => {
          setSequenceStep(2);
          stage2TimerRef.current = setTimeout(() => {
            setSequenceStep(3);
            stage2TimerRef.current = setTimeout(() => {
              setSequenceStep(4);
              stage2TimerRef.current = setTimeout(() => {
                setSequenceStep(5);
                setIsPlaying(false);
                setHasViewedAgain(true);
              }, 950);
            }, 850);
          }, 900);
        }, 850);
      }, 750);
    }
  };

  const handleStage2Choice = (choice) => {
    if (isPlaying) return;
    playSequence(choice);
  };

  // ----------------------------------------------------
  // Stage 3: Look Closer Observation
  // ----------------------------------------------------
  const handleStage3Observation = (obs) => {
    setStage3Observation(obs);
    trackEvent('look_closer_observation_selected', { observation: obs });
  };

  // ----------------------------------------------------
  // Stage 5: Completion
  // ----------------------------------------------------
  const handleMarkAsDone = async () => {
    if (isCompleted || isCompleting) return;
    setIsCompleting(true);
    setCompletionError(null);

    try {
      const success = await completeLesson(LESSON_ID);
      if (success) {
        setIsCompleted(true);
        handleActionComplete();
        trackEvent('activity_completed');
        setTimeout(() => {
          if (onBack) onBack();
          else handleExit();
        }, 600);
      } else {
        setCompletionError(
          t('stage_5.error_save', {
            defaultValue: 'Unable to save right now. Progress is stored locally.'
          })
        );
      }
    } catch (err) {
      setCompletionError(
        t('stage_5.error_save', {
          defaultValue: 'Unable to save right now. Progress is stored locally.'
        })
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleGoToNextActivity = () => {
    trackEvent('next_activity_clicked');
    if (onNavigate) {
      onNavigate('/task/spot-your-compulsions');
    } else {
      goToLesson('/task/spot-your-compulsions');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#FAF9F6',
        color: '#0F172A',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        WebkitFontSmoothing: 'antialiased',
        boxSizing: 'border-box'
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* APP HEADER                                                    */}
      {/* ------------------------------------------------------------- */}
      <header
        style={{
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (stage > 1) {
              setStage((prev) => prev - 1);
            } else {
              handleExit(onBack, onNavigate);
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#64748B',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 0',
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={17} />
          <span>{t('header_back', { defaultValue: 'Back' })}</span>
        </button>

        <img
          src={OCDMANTRA_LOGO_URL}
          alt="OCDMantra"
          style={{
            height: 'clamp(25px, 5.5vw, 28px)',
            width: 'auto',
            objectFit: 'contain',
            opacity: 0.95
          }}
        />

        <span
          style={{
            fontSize: '0.76rem',
            fontWeight: 550,
            color: '#94A3B8',
            minWidth: '50px',
            textAlign: 'right'
          }}
        >
          {t('progress_format', { current: stage, defaultValue: `${stage} of 5` })}
        </span>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CANVAS                                                   */}
      {/* ------------------------------------------------------------- */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '680px',
          margin: '0 auto',
          padding: '8px 20px 72px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        <AnimatePresence mode="wait">
          {/* ========================================================= */}
          {/* STAGE 01: INTRODUCE THE IDEA                             */}
          {/* ========================================================= */}
          {stage === 1 && (
            <motion.div
              key="stage-1"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                paddingTop: 'clamp(36px, 8vh, 64px)',
                gap: 'clamp(28px, 5vh, 42px)'
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 'clamp(2.3rem, 6vw, 3.4rem)',
                    fontWeight: 850,
                    letterSpacing: '-0.035em',
                    lineHeight: 1.1,
                    color: '#0B1528',
                    margin: '0 0 16px 0'
                  }}
                >
                  {t('hero.title', { defaultValue: 'Is It OCD or Just a Habit?' })}
                </h1>

                <p
                  style={{
                    fontSize: 'clamp(1.15rem, 3vw, 1.4rem)',
                    fontWeight: 500,
                    color: '#64748B',
                    margin: 0,
                    lineHeight: 1.4
                  }}
                >
                  {t('hero.subtitle', { defaultValue: 'Same action. Different experience.' })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => goToStage(2)}
                style={{
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '16px 48px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  minHeight: '52px',
                  boxShadow: '0 4px 16px rgba(2, 132, 199, 0.28)',
                  transition: 'all 0.15s ease'
                }}
              >
                {t('hero.cta_start', { defaultValue: 'START' })}
              </button>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* STAGE 02: SCENARIO & INTERACTIVE STORY ("WHAT HAPPENS NEXT?") */}
          {/* ========================================================= */}
          {stage === 2 && (
            <motion.div
              key="stage-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 'clamp(14px, 2.2vh, 20px)'
              }}
            >
              {/* Context & Scenario Header */}
              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#64748B',
                    display: 'block',
                    marginBottom: '4px'
                  }}
                >
                  {t('stage_2.section_kicker', { defaultValue: 'LOCKING THE DOOR' })}
                </span>

                <h2
                  style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2.05rem)',
                    fontWeight: 850,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                    color: '#0B1528',
                    margin: '0 0 6px 0'
                  }}
                >
                  {t('stage_2.context', { defaultValue: 'You just locked the door.' })}
                </h2>

                <p
                  style={{
                    fontSize: 'clamp(0.95rem, 2.4vw, 1.05rem)',
                    color: '#475569',
                    fontWeight: 600,
                    margin: 0
                  }}
                >
                  {t('stage_2.question', { defaultValue: 'What happens next?' })}
                </p>
              </div>

              {/* State A: Before any selection - Two Equal Action Choices */}
              {stage2Choice === null && (
                <div
                  style={{
                    width: '100%',
                    maxWidth: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginTop: '8px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleStage2Choice('once')}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: '1.5px solid #E2E8F0',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '1rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <span>{t('stage_2.choice_once', { defaultValue: 'I CHECK ONCE' })}</span>
                    <span style={{ fontSize: '1.1rem', color: '#64748B', fontWeight: 800 }}>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStage2Choice('again')}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: '1.5px solid #E2E8F0',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '1rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <span>{t('stage_2.choice_again', { defaultValue: 'I CHECK AGAIN' })}</span>
                    <span style={{ fontSize: '1.1rem', color: '#64748B', fontWeight: 800 }}>→</span>
                  </button>
                </div>
              )}

              {/* State B & C: Active Story Playback / Result */}
              {stage2Choice !== null && (
                <>
                  {/* Lock Visual Anchor & Scenario Subtitle in clean compact row */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        {/* Shackle */}
                        <motion.path
                          d="M44 48 V34 C44 24 76 24 76 34 V48"
                          fill="none"
                          stroke={
                            stage2Choice === 'again' && (sequenceStep === 2 || sequenceStep === 5)
                              ? '#0284C7'
                              : '#475569'
                          }
                          strokeWidth="6"
                          strokeLinecap="round"
                          animate={{
                            y:
                              (stage2Choice === 'once' && sequenceStep === 1) ||
                              (stage2Choice === 'again' && (sequenceStep === 1 || sequenceStep === 3))
                                ? [0, -3, 0]
                                : 0
                          }}
                          transition={{
                            repeat:
                              (stage2Choice === 'once' && sequenceStep === 1) ||
                              (stage2Choice === 'again' && (sequenceStep === 1 || sequenceStep === 3))
                                ? 2
                                : 0,
                            duration: 0.32
                          }}
                        />

                        {/* Lock Body */}
                        <rect
                          x="32"
                          y="44"
                          width="56"
                          height="48"
                          rx="12"
                          fill={
                            stage2Choice === 'again' && (sequenceStep === 2 || sequenceStep === 5)
                              ? '#0284C7'
                              : '#0F172A'
                          }
                          style={{ transition: 'fill 0.25s ease' }}
                        />

                        {/* Keyhole */}
                        <circle cx="60" cy="64" r="4" fill="#FFFFFF" />
                        <path d="M58 64 L57 76 H63 L62 64 Z" fill="#FFFFFF" />

                        {/* Looping pulse on Doubt Return */}
                        {stage2Choice === 'again' && sequenceStep === 5 && !prefersReducedMotion && (
                          <motion.circle
                            cx="60"
                            cy="68"
                            r="36"
                            fill="none"
                            stroke="#0284C7"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            animate={{ scale: [0.95, 1.15, 0.95], opacity: [0.9, 0.2, 0.9] }}
                            transition={{ repeat: Infinity, duration: 1.1 }}
                          />
                        )}
                      </svg>
                    </div>

                    <span
                      style={{
                        fontSize: '0.94rem',
                        fontWeight: 650,
                        fontStyle: 'italic',
                        color: stage2Choice === 'again' ? '#0284C7' : '#1E293B',
                        maxWidth: '340px',
                        lineHeight: 1.3
                      }}
                    >
                      {stage2Choice === 'once'
                        ? t('stage_2.quote_once', { defaultValue: '“I check once.”' })
                        : t('stage_2.quote_again', { defaultValue: '“I checked… but what if I missed something?”' })}
                    </span>
                  </div>

                  {/* Modern Unified Storyboard Card */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '380px',
                      background: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1.5px solid #E2E8F0',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                      padding: '14px 16px',
                      boxSizing: 'border-box',
                      textAlign: 'left'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                      }}
                    >
                      {/* Left vertical timeline indicator line */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '10px',
                          top: '10px',
                          bottom: '12px',
                          width: '2px',
                          background: stage2Choice === 'again' ? '#E0F2FE' : '#F1F5F9',
                          zIndex: 0
                        }}
                      />

                      {(stage2Choice === 'once'
                        ? [
                            { id: 0, label: t('stage_2.step_lock', { defaultValue: 'LOCK' }), stateText: 'Key turned' },
                            { id: 1, label: t('stage_2.step_check', { defaultValue: 'CHECK' }), stateText: 'Checked once' },
                            { id: 2, label: t('stage_2.step_looks_locked', { defaultValue: 'LOOKS LOCKED' }), stateText: 'Confirmed' },
                            { id: 3, label: t('stage_2.step_done', { defaultValue: 'DONE' }), stateText: 'Done.' }
                          ]
                        : [
                            { id: 0, label: t('stage_2.step_lock', { defaultValue: 'LOCK' }), stateText: 'Key turned' },
                            { id: 1, label: t('stage_2.step_check', { defaultValue: 'CHECK' }), stateText: 'Checked once' },
                            { id: 2, label: t('stage_2.step_doubt', { defaultValue: 'DOUBT ENTERS' }), stateText: '“What if I missed it?”' },
                            { id: 3, label: t('stage_2.step_check_again', { defaultValue: 'CHECK AGAIN' }), stateText: 'Handle pulled again' },
                            { id: 4, label: t('stage_2.step_relief', { defaultValue: 'RELIEF' }), stateText: 'Brief ease' },
                            { id: 5, label: t('stage_2.step_doubt_returns', { defaultValue: 'DOUBT RETURNS ↺' }), stateText: 'Loop returns' }
                          ]
                      ).map((item) => {
                        const isReached = sequenceStep >= item.id;
                        const isCurrent = sequenceStep === item.id;
                        const isDoubtStep = stage2Choice === 'again' && (item.id === 2 || item.id === 5);

                        return (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '6px 0',
                              position: 'relative',
                              zIndex: 1,
                              opacity: isReached ? 1 : 0.35,
                              transition: 'all 0.22s ease'
                            }}
                          >
                            {/* Step Node Dot */}
                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '9999px',
                                background: isCurrent
                                  ? isDoubtStep
                                    ? '#0284C7'
                                    : '#0F172A'
                                  : isReached
                                  ? isDoubtStep
                                    ? '#BAE6FD'
                                    : '#CBD5E1'
                                  : '#FFFFFF',
                                border: isCurrent
                                  ? '2px solid #FFFFFF'
                                  : isReached
                                  ? '2px solid #FFFFFF'
                                  : '2px solid #CBD5E1',
                                boxShadow: isCurrent
                                  ? '0 0 0 3px rgba(2, 132, 199, 0.25)'
                                  : '0 1px 2px rgba(0,0,0,0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all 0.22s ease'
                              }}
                            >
                              <div
                                style={{
                                  width: '5px',
                                  height: '5px',
                                  borderRadius: '9999px',
                                  background: isCurrent ? '#FFFFFF' : isReached ? '#0F172A' : '#94A3B8'
                                }}
                              />
                            </div>

                            {/* Step Text Information */}
                            <div
                              style={{
                                flex: 1,
                                minWidth: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                                background: isCurrent
                                  ? isDoubtStep
                                    ? '#F0F9FF'
                                    : '#F8FAFC'
                                  : 'transparent',
                                padding: isCurrent ? '5px 10px' : '3px 0',
                                borderRadius: '8px',
                                border: isCurrent
                                  ? isDoubtStep
                                    ? '1px solid #BAE6FD'
                                    : '1px solid #E2E8F0'
                                  : '1px solid transparent',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.82rem',
                                  fontWeight: isCurrent ? 800 : isReached ? 700 : 500,
                                  color: isDoubtStep && isReached ? '#0284C7' : isReached ? '#0F172A' : '#64748B',
                                  lineHeight: 1.2
                                }}
                              >
                                {item.label}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  fontWeight: isCurrent ? 650 : 500,
                                  color: isDoubtStep && isReached ? '#0369A1' : isCurrent ? '#0F172A' : '#94A3B8',
                                  textAlign: 'right',
                                  flexShrink: 0,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {item.stateText}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Post-Experience Controls & AHA Moment */}
                  {!isPlaying && (
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '440px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: '4px'
                      }}
                    >
                      {/* AHA Moment Card (Revealed after seeing both or clearly highlighted) */}
                      {hasViewedOnce && hasViewedAgain ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25 }}
                          style={{
                            width: '100%',
                            padding: '14px 18px',
                            background: '#F0F9FF',
                            border: '1.5px solid #BAE6FD',
                            borderRadius: '16px',
                            textAlign: 'center',
                            boxSizing: 'border-box'
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 850,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: '#0284C7',
                              display: 'block',
                              marginBottom: '4px'
                            }}
                          >
                            {t('stage_2.aha_headline', { defaultValue: 'SAME ACTION. DIFFERENT PATTERN.' })}
                          </span>
                          <p
                            style={{
                              fontSize: '0.92rem',
                              fontWeight: 700,
                              color: '#0F172A',
                              margin: '0 0 4px 0',
                              lineHeight: 1.35
                            }}
                          >
                            {t('stage_2.aha_sub', { defaultValue: '“The action itself doesn’t tell the whole story.”' })}
                          </p>
                          <p
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              color: '#475569',
                              margin: 0,
                              lineHeight: 1.4
                            }}
                          >
                            {t('stage_2.aha_detail', {
                              defaultValue: 'Notice what happens around it: the doubt, the urge to respond, the temporary relief, and whether the doubt returns.'
                            })}
                          </p>
                        </motion.div>
                      ) : null}

                      {/* Primary Continue Button */}
                      <button
                        type="button"
                        onClick={() => goToStage(3)}
                        style={{
                          background: '#0B1528',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '14px 44px',
                          fontSize: '0.98rem',
                          fontWeight: 750,
                          cursor: 'pointer',
                          minHeight: '48px',
                          boxShadow: '0 3px 12px rgba(15, 23, 42, 0.15)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {t('stage_2.btn_continue', { defaultValue: 'CONTINUE →' })}
                      </button>

                      {/* Switch Path and Replay in centered column */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%'
                        }}
                      >
                        {stage2Choice === 'once' ? (
                          <button
                            type="button"
                            onClick={() => handleStage2Choice('again')}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0284C7',
                              fontSize: '0.86rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '6px 12px'
                            }}
                          >
                            {t('stage_2.btn_see_other_again', { defaultValue: 'SEE “I CHECK AGAIN” →' })}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStage2Choice('once')}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0284C7',
                              fontSize: '0.86rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '6px 12px'
                            }}
                          >
                            {t('stage_2.btn_see_other_once', { defaultValue: 'SEE “I CHECK ONCE” →' })}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => playSequence(stage2Choice)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: 'none',
                            border: 'none',
                            color: '#64748B',
                            fontSize: '0.84rem',
                            fontWeight: 650,
                            cursor: 'pointer',
                            padding: '6px 12px'
                          }}
                        >
                          <RotateCcw size={14} />
                          <span>{t('stage_2.btn_replay', { defaultValue: 'Replay' })}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* STAGE 03: SCREEN 03 — LOOK CLOSER (OBSERVATION)           */}
          {/* ========================================================= */}
          {stage === 3 && (
            <motion.div
              key="stage-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 'clamp(14px, 2.4vh, 22px)'
              }}
            >
              {/* Header */}
              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#0284C7',
                    display: 'block',
                    marginBottom: '4px'
                  }}
                >
                  {t('stage_3.section_kicker', { defaultValue: 'LOOK CLOSER' })}
                </span>

                <h2
                  style={{
                    fontSize: 'clamp(1.45rem, 3.8vw, 1.95rem)',
                    fontWeight: 850,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.2,
                    color: '#0B1528',
                    margin: '0 0 4px 0'
                  }}
                >
                  {t('stage_3.headline', { defaultValue: 'Both started with the same action.' })}
                </h2>

                <p style={{ margin: 0, fontSize: '0.94rem', color: '#64748B', fontWeight: 550 }}>
                  {t('stage_3.sub', { defaultValue: 'What changed?' })}
                </p>
              </div>

              {/* Comparison Timeline Card */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '20px',
                  padding: '20px 18px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)'
                }}
              >
                {/* Timeline 1: I CHECK ONCE */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '16px',
                    background: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#64748B'
                      }}
                    >
                      I CHECK ONCE
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '6px' }}>
                      NATURAL STOP
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#FFFFFF',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '12px',
                        fontSize: '0.84rem',
                        fontWeight: 750,
                        color: '#0F172A',
                        textAlign: 'center'
                      }}
                    >
                      CHECK
                    </div>
                    <span style={{ color: '#94A3B8', fontWeight: 700 }}>──────→</span>
                    <div
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#F0FDF4',
                        border: '1.5px solid #86EFAC',
                        borderRadius: '12px',
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        color: '#16A34A',
                        textAlign: 'center'
                      }}
                    >
                      DONE
                    </div>
                  </div>
                </div>

                {/* Timeline 2: I CHECK AGAIN */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '16px',
                    background: '#F0F9FF',
                    borderRadius: '16px',
                    border: '1.5px solid #BAE6FD'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#0284C7'
                      }}
                    >
                      I CHECK AGAIN
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369A1', background: '#E0F2FE', padding: '2px 8px', borderRadius: '6px' }}>
                      REPEATING
                    </span>
                  </div>

                  {/* Clean vertical sequence with connecting indicators */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                    {/* Node 1: CHECK */}
                    <div
                      style={{
                        padding: '9px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 750,
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>1. CHECK</span>
                      <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Initial action</span>
                    </div>

                    <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.75rem', lineHeight: 1 }}>↓</div>

                    {/* Node 2: DOUBT */}
                    <div
                      style={{
                        padding: '9px 12px',
                        background: stage3Observation === 'doubt' ? '#0284C7' : '#FFFFFF',
                        color: stage3Observation === 'doubt' ? '#FFFFFF' : '#0369A1',
                        border: stage3Observation === 'doubt' ? '1.5px solid #0284C7' : '1px solid #BAE6FD',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: stage3Observation === 'doubt' ? '0 2px 10px rgba(2, 132, 199, 0.25)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>2. DOUBT</span>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: stage3Observation === 'doubt' ? '#E0F2FE' : '#64748B',
                          fontWeight: 600
                        }}
                      >
                        “What if I missed it?”
                      </span>
                    </div>

                    <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.75rem', lineHeight: 1 }}>↓</div>

                    {/* Node 3: CHECK AGAIN */}
                    <div
                      style={{
                        padding: '9px 12px',
                        background: stage3Observation === 'repetition' ? '#0284C7' : '#FFFFFF',
                        color: stage3Observation === 'repetition' ? '#FFFFFF' : '#0369A1',
                        border: stage3Observation === 'repetition' ? '1.5px solid #0284C7' : '1px solid #BAE6FD',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: stage3Observation === 'repetition' ? '0 2px 10px rgba(2, 132, 199, 0.25)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>3. CHECK AGAIN</span>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: stage3Observation === 'repetition' ? '#E0F2FE' : '#64748B',
                          fontWeight: 600
                        }}
                      >
                        Action repeated
                      </span>
                    </div>

                    <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.75rem', lineHeight: 1 }}>↓</div>

                    {/* Node 4: RELIEF */}
                    <div
                      style={{
                        padding: '9px 12px',
                        background: stage3Observation === 'relief' ? '#0284C7' : '#FFFFFF',
                        color: stage3Observation === 'relief' ? '#FFFFFF' : '#0369A1',
                        border: stage3Observation === 'relief' ? '1.5px solid #0284C7' : '1px solid #BAE6FD',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: stage3Observation === 'relief' ? '0 2px 10px rgba(2, 132, 199, 0.25)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>4. RELIEF</span>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: stage3Observation === 'relief' ? '#E0F2FE' : '#64748B',
                          fontWeight: 600
                        }}
                      >
                        Temporary calm
                      </span>
                    </div>

                    <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.75rem', lineHeight: 1 }}>↓</div>

                    {/* Node 5: DOUBT RETURNS */}
                    <div
                      style={{
                        padding: '9px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 750,
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <span style={{ whiteSpace: 'nowrap' }}>5. DOUBT RETURNS</span>
                      <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Cycle repeats
                      </span>
                    </div>
                  </div>
                </div>

                {/* Observation Choice Points */}
                <div style={{ marginTop: '2px' }}>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      display: 'block',
                      textAlign: 'left',
                      marginBottom: '8px'
                    }}
                  >
                    Tap what you notice:
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {[
                      { id: 'doubt', labelKey: 'stage_3.choice_doubt', labelDef: 'DOUBT' },
                      { id: 'repetition', labelKey: 'stage_3.choice_repetition', labelDef: 'REPETITION' },
                      { id: 'relief', labelKey: 'stage_3.choice_relief', labelDef: 'RELIEF' }
                    ].map((item) => {
                      const isSelected = stage3Observation === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleStage3Observation(item.id)}
                          style={{
                            padding: '10px 8px',
                            background: isSelected ? '#0B1528' : '#F8FAFC',
                            color: isSelected ? '#FFFFFF' : '#0F172A',
                            border: isSelected ? '1.5px solid #0B1528' : '1.5px solid #CBD5E1',
                            borderRadius: '12px',
                            fontSize: '0.84rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {t(item.labelKey, { defaultValue: item.labelDef })}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Single-Sentence Observation Feedback */}
                {stage3Observation && (
                  <motion.div
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      padding: '12px 14px',
                      background: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      borderRadius: '12px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#0369A1',
                      lineHeight: 1.4,
                      textAlign: 'left'
                    }}
                  >
                    {stage3Observation === 'doubt' &&
                      t('stage_3.feedback_doubt', {
                        defaultValue: 'Notice how uncertainty enters the second experience.'
                      })}
                    {stage3Observation === 'repetition' &&
                      t('stage_3.feedback_repetition', {
                        defaultValue: 'Notice how the same action happens again.'
                      })}
                    {stage3Observation === 'relief' &&
                      t('stage_3.feedback_relief', {
                        defaultValue: 'Notice how relief appears after responding.'
                      })}
                  </motion.div>
                )}
              </div>

              {/* Continue Button */}
              <button
                type="button"
                onClick={() => goToStage(4)}
                style={{
                  background: '#0B1528',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '14px 44px',
                  fontSize: '0.98rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  minHeight: '48px',
                  marginTop: '4px',
                  boxShadow: '0 3px 12px rgba(15, 23, 42, 0.12)'
                }}
              >
                {t('stage_3.btn_continue', { defaultValue: 'CONTINUE →' })}
              </button>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* STAGE 04: NOW TRY IT ON SOMETHING ELSE (APPLICATION)       */}
          {/* ========================================================= */}
          {stage === 4 && (
            <motion.div
              key="stage-4"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 'clamp(14px, 2.4vh, 22px)'
              }}
            >
              {/* Header */}
              <div>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#0284C7',
                    display: 'block',
                    marginBottom: '4px'
                  }}
                >
                  {t('stage_4.section_kicker', { defaultValue: 'NOW TRY IT ON SOMETHING ELSE' })}
                </span>

                <h2
                  style={{
                    fontSize: 'clamp(1.5rem, 3.8vw, 2.05rem)',
                    fontWeight: 850,
                    letterSpacing: '-0.03em',
                    color: '#0B1528',
                    margin: '0 0 4px 0'
                  }}
                >
                  {t('stage_4.headline', { defaultValue: 'Look beyond the action.' })}
                </h2>

                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>
                  {t('stage_4.sub', { defaultValue: 'What stands out?' })}
                </p>
              </div>

              {/* Progress Tracker (2 scenarios) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em' }}>
                  {t('stage_4.scenario_count', { current: currentScenarioIdx + 1, defaultValue: `EXAMPLE ${currentScenarioIdx + 1} OF 2` })}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[0, 1].map((idx) => (
                    <div
                      key={idx}
                      style={{
                        width: idx === currentScenarioIdx ? '16px' : '6px',
                        height: '6px',
                        borderRadius: '9999px',
                        background: idx === currentScenarioIdx ? '#0284C7' : idx < currentScenarioIdx ? '#0F172A' : '#CBD5E1',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Current Application Scenario */}
              {(() => {
                const scenarios = [
                  {
                    id: 0,
                    tagKey: 'stage_4.scenario_1.tag',
                    tagDef: 'REREADING A MESSAGE',
                    storyKey: 'stage_4.scenario_1.story',
                    storyDef: '“I reread my message once before sending it. It looks good, so I send it.”',
                    questionKey: 'stage_4.scenario_1.question',
                    questionDef: 'What stands out?',
                    visual: (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 14px',
                          background: '#F8FAFC',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          fontSize: '0.82rem',
                          fontWeight: 750,
                          color: '#334155'
                        }}
                      >
                        <span>{t('stage_4.scenario_1.visual_read', { defaultValue: 'READ ONCE' })}</span>
                        <span style={{ color: '#94A3B8' }}>→</span>
                        <span style={{ color: '#0F172A' }}>{t('stage_4.scenario_1.visual_check', { defaultValue: 'LOOKS GOOD' })}</span>
                        <span style={{ color: '#94A3B8' }}>→</span>
                        <span style={{ color: '#16A34A' }}>{t('stage_4.scenario_1.visual_send', { defaultValue: 'SEND' })}</span>
                      </div>
                    ),
                    options: [
                      {
                        id: 'clear_stop',
                        labelKey: 'stage_4.scenario_1.opt_clear_stop',
                        labelDef: 'A clear stop',
                        feedbackKey: 'stage_4.scenario_1.feedback_clear_stop',
                        feedbackDef: 'The action has a clear stopping point. Attention is able to move on.'
                      },
                      {
                        id: 'repeated_doubt',
                        labelKey: 'stage_4.scenario_1.opt_repeated_doubt',
                        labelDef: 'Repeated doubt',
                        feedbackKey: 'stage_4.scenario_1.feedback_repeated_doubt',
                        feedbackDef: 'Notice when looking once settles the question versus when doubt pulls back.'
                      },
                      {
                        id: 'repeating_action',
                        labelKey: 'stage_4.scenario_1.opt_repeating_action',
                        labelDef: 'Repeating the action',
                        feedbackKey: 'stage_4.scenario_1.feedback_repeating_action',
                        feedbackDef: 'In this case, once checked, the action didn\'t need to be repeated.'
                      }
                    ]
                  },
                  {
                    id: 1,
                    tagKey: 'stage_4.scenario_2.tag',
                    tagDef: 'THE STOVE',
                    storyKey: 'stage_4.scenario_2.story',
                    storyDef: '“I turn the stove off. I look once. The burner is off. I leave.”',
                    questionKey: 'stage_4.scenario_2.question',
                    questionDef: 'What stands out?',
                    visual: (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 14px',
                          background: '#F8FAFC',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          fontSize: '0.82rem',
                          fontWeight: 750,
                          color: '#334155'
                        }}
                      >
                        <span style={{ color: '#0F172A' }}>{t('stage_4.scenario_2.visual_off', { defaultValue: 'TURN OFF' })}</span>
                        <span style={{ color: '#94A3B8' }}>→</span>
                        <span>{t('stage_4.scenario_2.visual_look', { defaultValue: 'LOOK ONCE' })}</span>
                        <span style={{ color: '#94A3B8' }}>→</span>
                        <span style={{ color: '#16A34A' }}>{t('stage_4.scenario_2.visual_leave', { defaultValue: 'LEAVE' })}</span>
                      </div>
                    ),
                    options: [
                      {
                        id: 'clear_stop',
                        labelKey: 'stage_4.scenario_2.opt_clear_stop',
                        labelDef: 'A clear stop',
                        feedbackKey: 'stage_4.scenario_2.feedback_clear_stop',
                        feedbackDef: 'Looking once and moving on gives a natural sense of completion.'
                      },
                      {
                        id: 'repeated_doubt',
                        labelKey: 'stage_4.scenario_2.opt_repeated_doubt',
                        labelDef: 'Repeated doubt',
                        feedbackKey: 'stage_4.scenario_2.feedback_repeated_doubt',
                        feedbackDef: 'Notice whether doubt returns or whether seeing it off was enough.'
                      },
                      {
                        id: 'need_recheck',
                        labelKey: 'stage_4.scenario_2.opt_need_recheck',
                        labelDef: 'A need to recheck',
                        feedbackKey: 'stage_4.scenario_2.feedback_need_recheck',
                        feedbackDef: 'Here, seeing the burner off settled the thought without returning.'
                      }
                    ]
                  }
                ];

                const cur = scenarios[currentScenarioIdx];
                const selectedOptId = scenarioSelections[currentScenarioIdx];
                const activeOption = cur.options.find((o) => o.id === selectedOptId);

                return (
                  <div
                    key={cur.id}
                    style={{
                      width: '100%',
                      maxWidth: '460px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      background: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '20px',
                      padding: '20px 18px',
                      boxSizing: 'border-box',
                      textAlign: 'left'
                    }}
                  >
                    {/* Scenario Visual Sequence */}
                    {cur.visual}

                    {/* Scenario Story */}
                    <div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#64748B',
                          display: 'block',
                          marginBottom: '4px'
                        }}
                      >
                        {t(cur.tagKey, { defaultValue: cur.tagDef })}
                      </span>
                      <p style={{ margin: 0, fontSize: '0.94rem', fontWeight: 600, color: '#1E293B', lineHeight: 1.45 }}>
                        {t(cur.storyKey, { defaultValue: cur.storyDef })}
                      </p>
                    </div>

                    {/* Question & 3 Non-diagnostic Choices */}
                    <div>
                      <span
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 850,
                          color: '#0B1528',
                          display: 'block',
                          marginBottom: '10px'
                        }}
                      >
                        {t(cur.questionKey, { defaultValue: cur.questionDef })}
                      </span>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {cur.options.map((opt) => {
                          const isChosen = selectedOptId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setScenarioSelections((prev) => ({ ...prev, [currentScenarioIdx]: opt.id }));
                                trackEvent('application_scenario_answered', { scenario: cur.id, option: opt.id });
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: isChosen ? '#0B1528' : '#F8FAFC',
                                color: isChosen ? '#FFFFFF' : '#0F172A',
                                border: isChosen ? '1.5px solid #0B1528' : '1.5px solid #E2E8F0',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>{t(opt.labelKey, { defaultValue: opt.labelDef })}</span>
                              {isChosen && <span style={{ color: '#38BDF8', fontSize: '0.88rem', fontWeight: 800 }}>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Immediate Concise Feedback */}
                    {activeOption && (
                      <motion.div
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          padding: '12px 14px',
                          background: '#F0F9FF',
                          border: '1px solid #BAE6FD',
                          borderRadius: '12px',
                          fontSize: '0.86rem',
                          fontWeight: 600,
                          color: '#0369A1',
                          lineHeight: 1.4
                        }}
                      >
                        {t(activeOption.feedbackKey, { defaultValue: activeOption.feedbackDef })}
                      </motion.div>
                    )}

                    {/* Next / Continue Step Button */}
                    {selectedOptId && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                        {currentScenarioIdx < 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentScenarioIdx((prev) => prev + 1);
                              trackEvent('next_application_scenario_clicked', { nextIdx: currentScenarioIdx + 1 });
                            }}
                            style={{
                              background: '#0B1528',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '9999px',
                              padding: '12px 34px',
                              fontSize: '0.92rem',
                              fontWeight: 750,
                              cursor: 'pointer',
                              minHeight: '44px',
                              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)'
                            }}
                          >
                            {t('stage_4.btn_next_scenario', { defaultValue: 'NEXT EXAMPLE →' })}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => goToStage(5)}
                            style={{
                              background: '#0B1528',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '9999px',
                              padding: '14px 40px',
                              fontSize: '0.96rem',
                              fontWeight: 750,
                              cursor: 'pointer',
                              minHeight: '48px',
                              boxShadow: '0 3px 12px rgba(15, 23, 42, 0.15)'
                            }}
                          >
                            {t('stage_4.btn_finish_scenarios', { defaultValue: 'CONTINUE →' })}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* STAGE 05: ONE PRACTICAL TAKEAWAY & NEXT STEPS             */}
          {/* ========================================================= */}
          {stage === 5 && (
            <motion.div
              key="stage-5"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                paddingTop: 'clamp(16px, 3vh, 32px)',
                gap: 'clamp(20px, 3.5vh, 28px)'
              }}
            >
              {/* Practical Takeaway Card */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  padding: '28px 24px',
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '24px',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#0284C7'
                  }}
                >
                  {t('stage_5.section_kicker', { defaultValue: 'ONE PRACTICAL TAKEAWAY' })}
                </span>

                <h2
                  style={{
                    fontSize: 'clamp(1.2rem, 3.2vw, 1.5rem)',
                    fontWeight: 750,
                    color: '#0B1528',
                    lineHeight: 1.3,
                    margin: 0
                  }}
                >
                  {t('stage_5.headline', {
                    defaultValue: 'Next time you notice a repeated action, pause and notice:'
                  })}
                </h2>

                <div
                  style={{
                    padding: '14px 22px',
                    background: '#F0F9FF',
                    border: '1.5px solid #BAE6FD',
                    borderRadius: '16px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'clamp(1.15rem, 3vw, 1.35rem)',
                      fontWeight: 850,
                      color: '#0284C7',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {t('stage_5.prompt_question', { defaultValue: '“What is pulling me back?”' })}
                  </p>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.92rem',
                    color: '#64748B',
                    fontWeight: 550,
                    lineHeight: 1.45,
                    maxWidth: '380px'
                  }}
                >
                  {t('stage_5.detail', {
                    defaultValue: 'An action can look ordinary from the outside. The experience around it can tell you more.'
                  })}
                </p>
              </div>

              {/* Completion Action */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                  maxWidth: '360px'
                }}
              >
                {isCompleted ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.96rem',
                      fontWeight: 750,
                      color: '#16A34A',
                      background: '#F0FDF4',
                      border: '1.5px solid #86EFAC',
                      borderRadius: '9999px',
                      padding: '14px 32px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>{t('stage_5.completed_badge', { defaultValue: 'Activity Completed' })}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleMarkAsDone}
                    disabled={isCompleting}
                    style={{
                      width: '100%',
                      background: isCompleting ? '#64748B' : '#0284C7',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '16px 36px',
                      fontSize: '1rem',
                      fontWeight: 800,
                      cursor: isCompleting ? 'not-allowed' : 'pointer',
                      minHeight: '52px',
                      boxShadow: '0 4px 16px rgba(2, 132, 199, 0.28)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isCompleting ? (
                      <span>{t('stage_5.saving', { defaultValue: 'Saving...' })}</span>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        <span>{t('stage_5.btn_complete', { defaultValue: 'Mark Activity as Done' })}</span>
                      </>
                    )}
                  </button>
                )}

                {completionError && (
                  <span style={{ color: '#DC2626', fontSize: '0.8rem', display: 'block', textAlign: 'center' }}>
                    {completionError}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
