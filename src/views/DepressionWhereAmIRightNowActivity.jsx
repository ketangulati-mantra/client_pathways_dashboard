import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Check,
  Battery,
  BatteryMedium,
  BatteryLow,
  Sparkles,
  CloudRain,
  Sun,
  Users,
  Heart,
  Smile,
  Zap,
  CheckCircle2
} from 'lucide-react';
import {
  ACTIVITY_2_ID,
  ACTIVITY_2_TYPE,
  PATHWAY_ID,
  DAY_NUMBER,
  SNAPSHOT_ENERGY_OPTIONS,
  SNAPSHOT_THOUGHTS_OPTIONS,
  SNAPSHOT_ENJOYMENT_OPTIONS,
  SNAPSHOT_EVERYDAY_OPTIONS,
  SNAPSHOT_CONNECTION_OPTIONS,
  SNAPSHOT_SELF_CARE_OPTIONS,
  evaluateWhereAmISnapshot
} from '../utils/depressionPathwayEngine';
import {
  logUserActivityToDB,
  saveUserLessonProgress,
  getUserLessonProgress,
  recordUserPersonalizationSignal
} from '../services/activityLogger';
import { completeLesson } from '../mantra/api';
import { getActiveUserId } from '../services/authService';

export default function DepressionWhereAmIRightNowActivity({ onBack, onNavigate, service }) {
  // Screen steps:
  // 0: Intro
  // 1: Energy
  // 2: Thoughts
  // 3: Enjoyment
  // 4: Everyday Life
  // 5: Connection
  // 6: Self-Care
  // 7: Personal Snapshot
  // 8: Personalized Insight
  // 9: Completion
  const [currentStep, setCurrentStep] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);

  // User snapshot responses
  const [answers, setAnswers] = useState({
    energy: null,
    thoughts: null,
    enjoyment: null,
    everyday_life: null,
    connection: null,
    self_care: null
  });

  const startTimeRef = useRef(Date.now());
  const initialLoadRef = useRef(false);

  // Privacy-first analytics logger (no sensitive free text)
  const trackAnalyticsEvent = (eventName, eventData = {}) => {
    try {
      const payload = {
        event: eventName,
        user_id: getActiveUserId(),
        activity_id: ACTIVITY_2_ID,
        pathway_id: PATHWAY_ID,
        day_number: DAY_NUMBER,
        timestamp: new Date().toISOString(),
        ...eventData
      };
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mantra_analytics_event', { detail: payload }));
      }
      console.log(`[Mantra Analytics] ${eventName}:`, payload);
    } catch (e) {}
  };

  // 1. Resume / Re-Entry Behavior: Load existing progress on mount
  useEffect(() => {
    const restore = async () => {
      const userId = getActiveUserId();
      trackAnalyticsEvent('activity_started', { step: 0 });

      // Check localStorage for instant hydration
      let localData = null;
      try {
        const stored = localStorage.getItem(`mantra_progress_${ACTIVITY_2_ID}_${userId}`);
        if (stored) localData = JSON.parse(stored);
      } catch (e) {}

      // Query database for canonical progress
      const dbProgress = await getUserLessonProgress(ACTIVITY_2_ID, userId).catch(() => null);
      const saved = dbProgress?.response_data || localData;

      if (saved) {
        setAnswers((prev) => ({
          energy: saved.energy || prev.energy,
          thoughts: saved.thoughts || prev.thoughts,
          enjoyment: saved.enjoyment || prev.enjoyment,
          everyday_life: saved.everyday_life || prev.everyday_life,
          connection: saved.connection || prev.connection,
          self_care: saved.self_care || prev.self_care
        }));

        if (dbProgress?.current_step !== undefined && dbProgress.current_step > 0 && dbProgress.current_step < 9) {
          setCurrentStep(dbProgress.current_step);
        }
      }

      setHasResumed(true);
      initialLoadRef.current = true;
    };

    restore();
  }, []);

  // 2. Persist step progress to DB user_progress and localStorage
  useEffect(() => {
    if (!initialLoadRef.current) return;
    const userId = getActiveUserId();

    const responseData = {
      ...answers,
      completion_status: currentStep === 9 ? 'completed' : 'in_progress',
      started_at: new Date(startTimeRef.current).toISOString(),
      last_updated_at: new Date().toISOString()
    };

    try {
      localStorage.setItem(`mantra_progress_${ACTIVITY_2_ID}_${userId}`, JSON.stringify(responseData));
    } catch (e) {}

    saveUserLessonProgress({
      userId,
      lessonId: ACTIVITY_2_ID,
      currentStep,
      totalSteps: 10,
      actionDone: `step_${currentStep}`,
      responseData
    }).catch((err) => console.warn('Progress sync warning:', err));
  }, [currentStep, answers]);

  // Scroll to top on step transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Derived non-clinical evaluation
  const snapshotEvaluation = useMemo(() => {
    return evaluateWhereAmISnapshot(answers);
  }, [answers]);

  const autoAdvanceTimeoutRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectAnswer = (dimensionKey, optionId, targetNextStep = null) => {
    setAnswers((prev) => ({
      ...prev,
      [dimensionKey]: optionId
    }));

    trackAnalyticsEvent('question_answered', {
      question_id: dimensionKey,
      selected_option_id: optionId
    });

    if (targetNextStep !== null) {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        setCurrentStep(targetNextStep);
      }, 300);
    }
  };

  // Complete Activity & Persist
  const handleCompleteActivity = async () => {
    const userId = getActiveUserId();
    const completedAt = new Date().toISOString();
    const startedAt = new Date(startTimeRef.current).toISOString();
    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const rawResponseData = {
      energy: answers.energy,
      thoughts: answers.thoughts,
      enjoyment: answers.enjoyment,
      everyday_life: answers.everyday_life,
      connection: answers.connection,
      self_care: answers.self_care,
      derived_signals: snapshotEvaluation.signalStrengths,
      harder_items_count: snapshotEvaluation.harderItems.length,
      within_reach_count: snapshotEvaluation.withinReachItems.length,
      completion_status: 'completed',
      time_spent_seconds: timeSpentSeconds
    };

    const activityPayload = {
      userId,
      activityId: ACTIVITY_2_ID,
      lessonId: ACTIVITY_2_ID,
      activityType: ACTIVITY_2_TYPE,
      service: service || 'therapy',
      rewardPoints: 25,
      resultSummary: {
        pathway_id: PATHWAY_ID,
        day_number: DAY_NUMBER,
        activity_number: 2,
        started_at: startedAt,
        completed_at: completedAt,
        completion_status: 'completed',
        time_spent_seconds: timeSpentSeconds,
        response_data: rawResponseData
      },
      metadata: {
        activityId: ACTIVITY_2_ID,
        pathwayId: PATHWAY_ID,
        dayNumber: DAY_NUMBER,
        primaryStruggle: snapshotEvaluation.primaryStruggleDimension,
        signalStrengths: snapshotEvaluation.signalStrengths
      }
    };

    // Save completion to LocalStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`mantra_completed_${ACTIVITY_2_ID}_${userId}`, JSON.stringify(rawResponseData));
      } catch (e) {}
    }

    trackAnalyticsEvent('activity_completed', {
      completion_status: 'completed',
      time_spent_seconds: timeSpentSeconds
    });

    // 1. Log Activity to user_activities
    const logRes = await logUserActivityToDB(activityPayload).catch((e) => {
      console.warn('DB log non-blocking error:', e);
      return null;
    });

    // 2. Idempotently record each derived dimension signal into user_personalization_signals
    const signalPromises = Object.entries(snapshotEvaluation.signalStrengths).map(([sigKey, str]) => {
      if (str > 0) {
        return recordUserPersonalizationSignal({
          userId,
          pathwayId: PATHWAY_ID,
          signal: sigKey,
          strength: str,
          sourceType: 'activity',
          sourceId: logRes?.data?.id ? String(logRes.data.id) : ACTIVITY_2_ID,
          metadata: {
            activity_id: ACTIVITY_2_ID,
            dimension_answer: answers
          }
        }).catch((err) => console.warn('Signal record error:', err));
      }
      return Promise.resolve();
    });

    await Promise.all(signalPromises);

    // 3. Mark completion
    await completeLesson(ACTIVITY_2_ID).catch((e) =>
      console.warn('Completion non-blocking error:', e)
    );

    if (onNavigate) {
      onNavigate('/task/one-tiny-win');
    } else if (onBack) {
      onBack();
    }
  };

  const totalSteps = 10;
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  // Question navigation helper
  const canProceedCurrentStep = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return Boolean(answers.energy);
      case 2: return Boolean(answers.thoughts);
      case 3: return Boolean(answers.enjoyment);
      case 4: return Boolean(answers.everyday_life);
      case 5: return Boolean(answers.connection);
      case 6: return Boolean(answers.self_care);
      case 7: return true;
      case 8: return true;
      case 9: return true;
      default: return false;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAF8F4',
        color: '#1C1917',
        fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Top Header with Progress Dots / Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(250, 248, 244, 0.94)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E7E5E0',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <button
            onClick={() => {
              if (currentStep > 0) setCurrentStep((prev) => prev - 1);
              else if (onBack) onBack();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 0',
              color: '#78716C',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: 600,
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1C1917')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#78716C')}
          >
            <ArrowLeft size={16} strokeWidth={2.2} />
            <span>{currentStep === 0 ? 'Exit' : 'Back'}</span>
          </button>

          {/* Stepper Dots (Storytelling style) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[1, 2, 3, 4, 5, 6].map((qIdx) => {
              const isPassed = currentStep > qIdx;
              const isCurrent = currentStep === qIdx;
              return (
                <div
                  key={qIdx}
                  style={{
                    width: isCurrent ? '18px' : '6px',
                    height: '6px',
                    borderRadius: '999px',
                    background: isCurrent ? '#C2410C' : isPassed ? '#1C1917' : '#D6D3CD',
                    transition: 'all 0.25s ease'
                  }}
                />
              );
            })}
          </div>

          <div style={{ width: '40px', textAlign: 'right' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#A8A29E',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              Day 01
            </span>
          </div>
        </div>
      </header>

      {/* Main Full-Screen Storytelling Container */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '680px',
          margin: '0 auto',
          padding: 'clamp(28px, 5vh, 48px) 24px 64px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* SCREEN 1 — INTRO */}
          {/* ============================================================ */}
          {currentStep === 0 && (
            <motion.div
              key="step-0-intro"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ textAlign: 'left', width: '100%' }}
            >
              <div style={{ marginBottom: '16px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Day 1 of 21 • Activity 2
                </span>
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#78716C',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginTop: '4px'
                  }}
                >
                  Where Am I Right Now?
                </span>
              </div>

              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(36px, 6vw, 52px)',
                  fontWeight: 500,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.12,
                  color: '#1C1917',
                  margin: '0 0 20px 0'
                }}
              >
                Let's take a quick<br />snapshot of where<br />you are right now.
              </h1>

              <p
                style={{
                  fontSize: 'clamp(16px, 2.8vw, 18px)',
                  color: '#44403C',
                  lineHeight: 1.6,
                  margin: '0 0 24px 0',
                  fontWeight: 500,
                  maxWidth: '520px'
                }}
              >
                No scores. No judgment. Just notice what has been feeling a little harder lately.
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#A8A29E',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '36px'
                }}
              >
                <Clock size={14} color="#C2410C" />
                <span>~2 min • Non-clinical snapshot</span>
              </div>

              <div>
                <button
                  onClick={() => setCurrentStep(1)}
                  style={{
                    background: '#1C1917',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    color: '#FAF8F4',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#292524')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#1C1917')}
                >
                  <span>Let’s do it</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 2 — ENERGY */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <motion.div
              key="step-1-energy"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ textAlign: 'left', width: '100%' }}
            >
              <div style={{ marginBottom: '28px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Energy & Battery
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(30px, 5.2vw, 42px)',
                    fontWeight: 500,
                    margin: '6px 0 10px 0',
                    color: '#1C1917',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em'
                  }}
                >
                  How has your energy<br />been feeling lately?
                </h2>
                <p style={{ fontSize: '14.5px', color: '#78716C', margin: 0, lineHeight: 1.5 }}>
                  Think about ordinary days, not your very best or worst day.
                </p>
              </div>

              {/* Tactile Visual Options for Energy */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
                {SNAPSHOT_ENERGY_OPTIONS.map((opt) => {
                  const isSelected = answers.energy === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectAnswer('energy', opt.id, 2)}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '14px',
                        border: isSelected ? '1.5px solid #1C1917' : '1px solid #E7E5E0',
                        background: isSelected ? '#FFFFFF' : '#FAF8F4',
                        color: isSelected ? '#1C1917' : '#44403C',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '15.5px', fontWeight: isSelected ? 700 : 500, lineHeight: 1.45, paddingRight: '12px' }}>
                        {opt.label}
                      </span>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '1.5px solid #1C1917' : '1.5px solid #D6D3CD',
                          background: isSelected ? '#1C1917' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isSelected && <Check size={12} color="#FAF8F4" strokeWidth={2.5} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                disabled={!answers.energy}
                style={{
                  background: answers.energy ? '#1C1917' : '#D6D3CD',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: answers.energy ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 3 — THOUGHTS */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <motion.div
              key="step-2-thoughts"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ textAlign: 'left', width: '100%' }}
            >
              <div style={{ marginBottom: '28px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Mind & Thoughts
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(30px, 5.2vw, 42px)',
                    fontWeight: 500,
                    margin: '6px 0 10px 0',
                    color: '#1C1917',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em'
                  }}
                >
                  What about your mind?
                </h2>
                <p style={{ fontSize: '14.5px', color: '#78716C', margin: 0, lineHeight: 1.5 }}>
                  How much have thoughts, worrying, overthinking, or mental heaviness been getting in the way?
                </p>
              </div>

              {/* Distinct organic options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
                {SNAPSHOT_THOUGHTS_OPTIONS.map((opt) => {
                  const isSelected = answers.thoughts === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectAnswer('thoughts', opt.id, 3)}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '14px',
                        border: isSelected ? '1.5px solid #1C1917' : '1px solid #E7E5E0',
                        background: isSelected ? '#FFFFFF' : '#FAF8F4',
                        color: isSelected ? '#1C1917' : '#44403C',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '15.5px', fontWeight: isSelected ? 700 : 500, lineHeight: 1.45, paddingRight: '12px' }}>
                        {opt.label}
                      </span>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '1.5px solid #1C1917' : '1.5px solid #D6D3CD',
                          background: isSelected ? '#1C1917' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isSelected && <Check size={12} color="#FAF8F4" strokeWidth={2.5} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentStep(3)}
                disabled={!answers.thoughts}
                style={{
                  background: answers.thoughts ? '#1C1917' : '#D6D3CD',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: answers.thoughts ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 4 — ENJOYMENT */}
          {/* ============================================================ */}
          {currentStep === 3 && (
            <motion.div
              key="step-3-enjoyment"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ textAlign: 'left', width: '100%' }}
            >
              <div style={{ marginBottom: '28px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Interest & Lightness
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(30px, 5.2vw, 42px)',
                    fontWeight: 500,
                    margin: '6px 0 10px 0',
                    color: '#1C1917',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em'
                  }}
                >
                  What about the things<br />you usually enjoy?
                </h2>
                <p style={{ fontSize: '14.5px', color: '#78716C', margin: 0, lineHeight: 1.5 }}>
                  Have they been feeling as rewarding or interesting as they normally do?
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
                {SNAPSHOT_ENJOYMENT_OPTIONS.map((opt) => {
                  const isSelected = answers.enjoyment === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectAnswer('enjoyment', opt.id, 4)}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '14px',
                        border: isSelected ? '1.5px solid #1C1917' : '1px solid #E7E5E0',
                        background: isSelected ? '#FFFFFF' : '#FAF8F4',
                        color: isSelected ? '#1C1917' : '#44403C',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '15.5px', fontWeight: isSelected ? 700 : 500, lineHeight: 1.45, paddingRight: '12px' }}>
                        {opt.label}
                      </span>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '1.5px solid #1C1917' : '1.5px solid #D6D3CD',
                          background: isSelected ? '#1C1917' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isSelected && <Check size={12} color="#FAF8F4" strokeWidth={2.5} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentStep(4)}
                disabled={!answers.enjoyment}
                style={{
                  background: answers.enjoyment ? '#1C1917' : '#D6D3CD',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: answers.enjoyment ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 5 — EVERYDAY LIFE */}
          {/* ============================================================ */}
          {currentStep === 4 && (
            <motion.div
              key="step-4-everyday"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ textAlign: 'left', width: '100%' }}
            >
              <div style={{ marginBottom: '28px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Functioning & Rhythm
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(30px, 5.2vw, 42px)',
                    fontWeight: 500,
                    margin: '6px 0 10px 0',
                    color: '#1C1917',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em'
                  }}
                >
                  And everyday things?
                </h2>
                <p style={{ fontSize: '14.5px', color: '#78716C', margin: 0, lineHeight: 1.5 }}>
                  Things like getting ready, studying, working, cleaning, or taking care of yourself.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
                {SNAPSHOT_EVERYDAY_OPTIONS.map((opt) => {
                  const isSelected = answers.everyday_life === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectAnswer('everyday_life', opt.id, 5)}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '14px',
                        border: isSelected ? '1.5px solid #1C1917' : '1px solid #E7E5E0',
                        background: isSelected ? '#FFFFFF' : '#FAF8F4',
                        color: isSelected ? '#1C1917' : '#44403C',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '15.5px', fontWeight: isSelected ? 700 : 500, lineHeight: 1.45, paddingRight: '12px' }}>
                        {opt.label}
                      </span>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '1.5px solid #1C1917' : '1.5px solid #D6D3CD',
                          background: isSelected ? '#1C1917' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isSelected && <Check size={12} color="#FAF8F4" strokeWidth={2.5} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentStep(5)}
                disabled={!answers.everyday_life}
                style={{
                  background: answers.everyday_life ? '#1C1917' : '#D6D3CD',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: answers.everyday_life ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 6 — CONNECTION */}
          {/* ============================================================ */}
          {currentStep === 5 && (
            <motion.div
              key="step-5-connection"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ textAlign: 'left', width: '100%' }}
            >
              <div style={{ marginBottom: '28px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  People & Space
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(30px, 5.2vw, 42px)',
                    fontWeight: 500,
                    margin: '6px 0 10px 0',
                    color: '#1C1917',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em'
                  }}
                >
                  What about feeling connected?
                </h2>
                <p style={{ fontSize: '14.5px', color: '#78716C', margin: 0, lineHeight: 1.5 }}>
                  How have friends, family, or other people been feeling lately?
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
                {SNAPSHOT_CONNECTION_OPTIONS.map((opt) => {
                  const isSelected = answers.connection === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectAnswer('connection', opt.id, 6)}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '14px',
                        border: isSelected ? '1.5px solid #1C1917' : '1px solid #E7E5E0',
                        background: isSelected ? '#FFFFFF' : '#FAF8F4',
                        color: isSelected ? '#1C1917' : '#44403C',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '15.5px', fontWeight: isSelected ? 700 : 500, lineHeight: 1.45, paddingRight: '12px' }}>
                        {opt.label}
                      </span>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '1.5px solid #1C1917' : '1.5px solid #D6D3CD',
                          background: isSelected ? '#1C1917' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isSelected && <Check size={12} color="#FAF8F4" strokeWidth={2.5} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentStep(6)}
                disabled={!answers.connection}
                style={{
                  background: answers.connection ? '#1C1917' : '#D6D3CD',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: answers.connection ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 7 — SELF-CARE */}
          {/* ============================================================ */}
          {currentStep === 6 && (
            <motion.div
              key="step-6-self-care"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ textAlign: 'left', width: '100%' }}
            >
              <div style={{ marginBottom: '28px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Rest & Self-Care
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(30px, 5.2vw, 42px)',
                    fontWeight: 500,
                    margin: '6px 0 10px 0',
                    color: '#1C1917',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em'
                  }}
                >
                  And taking care of yourself?
                </h2>
                <p style={{ fontSize: '14.5px', color: '#78716C', margin: 0, lineHeight: 1.5 }}>
                  Sleep, food, movement, personal care, or simply doing things that help you feel okay.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
                {SNAPSHOT_SELF_CARE_OPTIONS.map((opt) => {
                  const isSelected = answers.self_care === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectAnswer('self_care', opt.id, 7)}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '14px',
                        border: isSelected ? '1.5px solid #1C1917' : '1px solid #E7E5E0',
                        background: isSelected ? '#FFFFFF' : '#FAF8F4',
                        color: isSelected ? '#1C1917' : '#44403C',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '15.5px', fontWeight: isSelected ? 700 : 500, lineHeight: 1.45, paddingRight: '12px' }}>
                        {opt.label}
                      </span>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '1.5px solid #1C1917' : '1.5px solid #D6D3CD',
                          background: isSelected ? '#1C1917' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isSelected && <Check size={12} color="#FAF8F4" strokeWidth={2.5} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentStep(7)}
                disabled={!answers.self_care}
                style={{
                  background: answers.self_care ? '#1C1917' : '#D6D3CD',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: answers.self_care ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>See my snapshot</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 8 — PERSONAL SNAPSHOT */}
          {/* ============================================================ */}
          {currentStep === 7 && (
            <motion.div
              key="step-7-snapshot"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ textAlign: 'left', width: '100%' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Your Starting Snapshot
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(32px, 5.5vw, 44px)',
                    fontWeight: 500,
                    margin: '6px 0 8px 0',
                    color: '#1C1917',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Here's your snapshot.
                </h2>
                <p style={{ fontSize: '15px', color: '#78716C', margin: 0, lineHeight: 1.5 }}>
                  A clearer picture of what you've been noticing lately.
                </p>
              </div>

              {/* Two Column / Card Summary: Harder vs Within Reach */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
                {/* Section 1: Things Feeling Harder Right Now */}
                {snapshotEvaluation.harderItems.length > 0 && (
                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E7E5E0',
                      borderRadius: '16px',
                      padding: '22px 24px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#EA580C',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '16px'
                      }}
                    >
                      THINGS FEELING HARDER RIGHT NOW
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {snapshotEvaluation.harderItems.map((item) => (
                        <div
                          key={item.key}
                          style={{
                            borderBottom: '1px solid #F5F5F4',
                            paddingBottom: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917' }}>
                              {item.label}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '14.5px', color: '#57534E', lineHeight: 1.5, paddingLeft: '24px' }}>
                            "{item.selectedStatement || item.selectedLabel}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 2: Still Within Reach */}
                {snapshotEvaluation.withinReachItems.length > 0 && (
                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E7E5E0',
                      borderRadius: '16px',
                      padding: '22px 24px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#15803D',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '16px'
                      }}
                    >
                      STILL WITHIN REACH
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {snapshotEvaluation.withinReachItems.map((item) => (
                        <div
                          key={item.key}
                          style={{
                            borderBottom: '1px solid #F5F5F4',
                            paddingBottom: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917' }}>
                              {item.label}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '14.5px', color: '#57534E', lineHeight: 1.5, paddingLeft: '24px' }}>
                            "{item.selectedStatement || item.selectedLabel}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setCurrentStep(8)}
                style={{
                  background: '#1C1917',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 9 — PERSONALIZED INSIGHT */}
          {/* ============================================================ */}
          {currentStep === 8 && (
            <motion.div
              key="step-8-insight"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ textAlign: 'left', width: '100%' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Compassionate Observation
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(30px, 5.2vw, 42px)',
                    fontWeight: 500,
                    margin: '6px 0 0 0',
                    color: '#1C1917',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {snapshotEvaluation.insight.headline}
                </h2>
              </div>

              {/* Editorial Card */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E7E5E0',
                  borderRadius: '16px',
                  padding: 'clamp(24px, 4vw, 32px)',
                  boxSizing: 'border-box',
                  marginBottom: '28px'
                }}
              >
                <p
                  style={{
                    fontSize: '15.5px',
                    color: '#44403C',
                    lineHeight: 1.7,
                    margin: '0 0 20px 0',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {snapshotEvaluation.insight.body}
                </p>

                <p
                  style={{
                    fontSize: '14px',
                    color: '#78716C',
                    fontStyle: 'italic',
                    margin: 0,
                    borderTop: '1px solid #F5F5F4',
                    paddingTop: '16px'
                  }}
                >
                  "We'll keep this in mind as you move through Mantra 21."
                </p>
              </div>

              <button
                onClick={() => setCurrentStep(9)}
                style={{
                  background: '#1C1917',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 10 — EDITORIAL COMPLETION */}
          {/* ============================================================ */}
          {currentStep === 9 && (
            <motion.div
              key="step-9-completion"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ textAlign: 'left', width: '100%' }}
            >
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: '#C2410C',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '12px'
                }}
              >
                Day 1 • Activity 2 Complete
              </span>

              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(36px, 5.8vw, 48px)',
                  fontWeight: 500,
                  color: '#1C1917',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  margin: '0 0 18px 0'
                }}
              >
                Now we know a little<br />more about your<br />starting point.
              </h1>

              <p
                style={{
                  fontSize: '15px',
                  color: '#78716C',
                  lineHeight: 1.6,
                  margin: '0 0 36px 0',
                  maxWidth: '520px'
                }}
              >
                You don't need to fix everything today. We're just going to work with where you are.
              </p>

              <button
                onClick={handleCompleteActivity}
                style={{
                  background: '#1C1917',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue to the next activity</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
