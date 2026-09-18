import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Calendar,
  Compass,
  Heart,
  Clock,
  Circle
} from 'lucide-react';
import {
  MANTRA_21_MOTIVATION_OPTIONS,
  MANTRA_21_MILESTONES,
  getMantra21BridgeContent,
  MANTRA_21_INVITATION_ACTIVITY_ID,
  MANTRA_21_INVITATION_ACTIVITY_TYPE,
  PATHWAY_ID,
  DAY_NUMBER
} from '../utils/depressionPathwayEngine';
import {
  logUserActivityToDB,
  saveUserLessonProgress,
  getUserLessonProgress,
  recordUserPersonalizationSignal
} from '../services/activityLogger';
import { completeLesson } from '../mantra/api';
import { goToDashboard } from '../mantra/navigation';
import { getActiveUserId } from '../services/authService';

/**
 * Mantra 21 Depression Pathway - Day 1 Transition: "Discover & Join Mantra 21"
 * Activity ID: depression_mantra21_invitation
 *
 * Visual & Emotional Language:
 * - Editorial, warm off-white (#FAF8F4), elegant serif typography (Newsreader).
 * - Small uppercase labels, restrained orange (#C2410C) accents, black primary CTAs.
 * - Clean tactile cards, generous whitespace.
 * - Non-salesy, non-clinical, gently inviting, zero false cures or overclaims.
 *
 * Screens:
 * 0: DAY 1 COMPLETION ("You've started. You didn't have to change everything today...")
 * 1: INTRODUCE MANTRA 21 ("What if you kept going? 21 days. ~10 min. Your pace.")
 * 2: WHY JOIN? ("What could 21 days look like? Milestones 01 -> 07 -> 14 -> 21")
 * 3: DISCOVER MOTIVATION ("What would make these 21 days worth it for you? Pick up to 2")
 * 4: PERSONALIZED BRIDGE (Dynamic transition based on their specific 'why')
 * 5: THE JOIN MOMENT (Join Mantra 21 Challenge OR Just follow my plan privately)
 * 6: AFTER JOINING ("Day 1 is already yours. Your next step is waiting tomorrow.")
 */

export default function Mantra21Day1TransitionView({ onBack, onNavigate, service }) {
  // Screen index: 0 to 6
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMotivations, setSelectedMotivations] = useState([]);
  const [chosenPlanMode, setChosenPlanMode] = useState('challenge'); // 'challenge' | 'private_plan'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef(Date.now());
  const initialLoadRef = useRef(false);

  // Privacy-first analytics logger
  const trackAnalyticsEvent = (eventName, eventData = {}) => {
    try {
      const payload = {
        event: eventName,
        user_id: getActiveUserId(),
        activity_id: MANTRA_21_INVITATION_ACTIVITY_ID,
        pathway_id: PATHWAY_ID,
        day_number: DAY_NUMBER,
        timestamp: new Date().toISOString(),
        ...eventData
      };
      if (typeof window !== 'undefined') {
        const historyKey = 'mantra_analytics_events';
        const currentHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
        currentHistory.push(payload);
        localStorage.setItem(historyKey, JSON.stringify(currentHistory.slice(-100)));
      }
    } catch (e) {
      console.warn('Analytics tracking non-blocking error:', e);
    }
  };

  // 1. Initial Load & Progress Recovery
  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    trackAnalyticsEvent('mantra21_offer_seen');

    async function restoreProgress() {
      const userId = getActiveUserId();
      const savedProgress = await getUserLessonProgress(MANTRA_21_INVITATION_ACTIVITY_ID, userId).catch(() => null);
      if (savedProgress?.data?.response_data) {
        const resp = savedProgress.data.response_data;
        if (resp.selected_motivations && Array.isArray(resp.selected_motivations)) {
          setSelectedMotivations(resp.selected_motivations);
        }
        if (resp.plan_mode) {
          setChosenPlanMode(resp.plan_mode);
        }
        if (typeof savedProgress.data.current_step === 'number' && savedProgress.data.current_step < 6) {
          setCurrentStep(savedProgress.data.current_step);
        }
      }
    }
    restoreProgress();
  }, []);

  // 2. Step Change Auto-Save
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const userId = getActiveUserId();
    saveUserLessonProgress({
      userId,
      activityId: MANTRA_21_INVITATION_ACTIVITY_ID,
      currentStep,
      totalSteps: 7,
      actionDone: `step_${currentStep}`,
      responseData: {
        current_step: currentStep,
        selected_motivations: selectedMotivations,
        plan_mode: chosenPlanMode
      }
    }).catch(() => {});
  }, [currentStep, selectedMotivations, chosenPlanMode]);

  // Toggle Motivation Card Selection (Max 2)
  const toggleMotivation = (motId) => {
    if (selectedMotivations.includes(motId)) {
      setSelectedMotivations((prev) => prev.filter((id) => id !== motId));
    } else {
      if (selectedMotivations.length >= 2) {
        // Replace oldest or keep max 2
        setSelectedMotivations((prev) => [prev[1], motId]);
      } else {
        setSelectedMotivations((prev) => [...prev, motId]);
      }
    }
  };

  // Dynamic Bridge Text
  const bridgeContent = useMemo(() => {
    return getMantra21BridgeContent(selectedMotivations);
  }, [selectedMotivations]);

  // Handle Joining & Completion
  const handleJoinOrProceed = async (mode) => {
    setChosenPlanMode(mode);
    setIsSubmitting(true);

    const userId = getActiveUserId();
    const completedAt = new Date().toISOString();
    const startedAt = new Date(startTimeRef.current).toISOString();
    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const rawResponseData = {
      mantra21_offer_seen: true,
      mantra21_interest_clicked: true,
      mantra21_motivation_selected: selectedMotivations,
      mantra21_joined: true,
      mantra21_join_timestamp: completedAt,
      plan_mode: mode,
      completion_status: 'completed',
      time_spent_seconds: timeSpentSeconds
    };

    const activityPayload = {
      userId,
      activityId: MANTRA_21_INVITATION_ACTIVITY_ID,
      lessonId: MANTRA_21_INVITATION_ACTIVITY_ID,
      activityType: MANTRA_21_INVITATION_ACTIVITY_TYPE,
      service: service || 'therapy',
      resultSummary: {
        pathway_id: PATHWAY_ID,
        day_number: DAY_NUMBER,
        started_at: startedAt,
        completed_at: completedAt,
        completion_status: 'completed',
        time_spent_seconds: timeSpentSeconds,
        response_data: rawResponseData
      },
      metadata: {
        activityId: MANTRA_21_INVITATION_ACTIVITY_ID,
        pathwayId: PATHWAY_ID,
        dayNumber: DAY_NUMBER,
        planMode: mode,
        selectedMotivations
      }
    };

    // Save locally
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`mantra_completed_${MANTRA_21_INVITATION_ACTIVITY_ID}_${userId}`, JSON.stringify(rawResponseData));
        localStorage.setItem(`mantra_21_plan_mode_${userId}`, mode);
        localStorage.setItem(`mantra_21_joined_${userId}`, 'true');
      } catch (e) {}
    }

    trackAnalyticsEvent('mantra21_joined', {
      plan_mode: mode,
      motivations: selectedMotivations
    });

    // 1. Log to user_activities
    const logRes = await logUserActivityToDB(activityPayload).catch((e) => {
      console.warn('DB log non-blocking warning:', e);
      return null;
    });

    // 2. Persist Motivation Signals idempotently
    const signalPromises = selectedMotivations.map((motId) => {
      return recordUserPersonalizationSignal({
        userId,
        pathwayId: PATHWAY_ID,
        signal: `motivation_${motId}`,
        strength: 3,
        sourceType: 'activity',
        sourceId: logRes?.data?.id ? String(logRes.data.id) : MANTRA_21_INVITATION_ACTIVITY_ID,
        metadata: {
          activityId: MANTRA_21_INVITATION_ACTIVITY_ID,
          motivation: motId,
          planMode: mode
        }
      });
    });

    await Promise.allSettled(signalPromises);

    // 3. Mark Lesson Complete via webhook
    try {
      await completeLesson(MANTRA_21_INVITATION_ACTIVITY_ID);
    } catch (e) {
      console.warn('[Mantra21Invitation] Completion webhook error:', e);
    }

    setIsSubmitting(false);
    // Advance to Screen 7 (After Joining confirmation)
    setCurrentStep(6);
  };

  // Final exit from Screen 7
  const handleFinalExit = () => {
    goToDashboard();
  };

  // Animation variants
  const fadeInVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAF8F4',
        color: '#1C1917',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Bar / Header */}
      <header
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '24px 20px 16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}
      >
        <button
          onClick={() => {
            if (currentStep > 0 && currentStep < 6) {
              setCurrentStep((s) => s - 1);
            } else if (onBack) {
              onBack();
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#78716C',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 0',
            visibility: currentStep === 6 ? 'hidden' : 'visible'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#A8A29E'
            }}
          >
            Mantra 21
          </span>
        </div>
      </header>

      {/* Main Flow Container */}
      <main
        style={{
          width: '100%',
          maxWidth: '580px',
          padding: '12px 24px 60px 24px',
          boxSizing: 'border-box',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <AnimatePresence mode="wait">
          {/* ========================================================= */}
          {/* SCREEN 1 — DAY 1 COMPLETION                              */}
          {/* ========================================================= */}
          {currentStep === 0 && (
            <motion.div
              key="screen_0"
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#C2410C',
                  display: 'block',
                  marginBottom: '16px'
                }}
              >
                DAY 1 · COMPLETE
              </span>

              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(38px, 6.2vw, 52px)',
                  fontWeight: 500,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  color: '#1C1917',
                  margin: '0 0 20px 0'
                }}
              >
                You've started.
              </h1>

              <div
                style={{
                  fontSize: '17px',
                  color: '#44403C',
                  lineHeight: 1.6,
                  margin: '0 0 36px 0'
                }}
              >
                <p style={{ margin: '0 0 12px 0' }}>
                  You didn't have to change everything today.
                </p>
                <p style={{ margin: 0, color: '#78716C' }}>
                  You just took one small step.
                </p>
              </div>

              {/* Visual 21-Dot Track Representation */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E7E5E0',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  marginBottom: '40px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#C2410C', letterSpacing: '0.08em' }}>
                    DAY 01
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#A8A29E', letterSpacing: '0.08em' }}>
                    DAY 21
                  </span>
                </div>

                {/* 21 Dots in responsive flex row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px'
                  }}
                >
                  {Array.from({ length: 21 }).map((_, idx) => {
                    const isDay1 = idx === 0;
                    return (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          height: isDay1 ? '10px' : '6px',
                          borderRadius: '3px',
                          backgroundColor: isDay1 ? '#C2410C' : '#E7E5E0',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  onClick={() => {
                    trackAnalyticsEvent('mantra21_interest_clicked');
                    setCurrentStep(1);
                  }}
                  style={{
                    background: '#1C1917',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 28px',
                    color: '#FAF8F4',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>See what's next</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 2 — INTRODUCE MANTRA 21                           */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <motion.div
              key="screen_1"
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#C2410C',
                  display: 'block',
                  marginBottom: '16px'
                }}
              >
                MANTRA 21
              </span>

              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(36px, 6vw, 48px)',
                  fontWeight: 500,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.12,
                  color: '#1C1917',
                  margin: '0 0 16px 0'
                }}
              >
                What if you kept going?
              </h1>

              <p
                style={{
                  fontSize: '16px',
                  color: '#57534E',
                  lineHeight: 1.6,
                  margin: '0 0 32px 0'
                }}
              >
                Mantra 21 is a 21-day journey built around small, practical steps you can take at your own pace.
              </p>

              {/* 3 Core Value Pillars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E7E5E0',
                    borderRadius: '14px',
                    padding: '18px 20px'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#C2410C', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                    21 DAYS
                  </span>
                  <span style={{ fontSize: '15px', color: '#1C1917', fontWeight: 500 }}>
                    One guided step each day
                  </span>
                </div>

                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E7E5E0',
                    borderRadius: '14px',
                    padding: '18px 20px'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#C2410C', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                    ~10 MINUTES
                  </span>
                  <span style={{ fontSize: '15px', color: '#1C1917', fontWeight: 500 }}>
                    Short activities designed to fit into real life
                  </span>
                </div>

                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E7E5E0',
                    borderRadius: '14px',
                    padding: '18px 20px'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#C2410C', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                    YOUR PACE
                  </span>
                  <span style={{ fontSize: '15px', color: '#1C1917', fontWeight: 500 }}>
                    No need to be perfect
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: '14.5px',
                  color: '#78716C',
                  lineHeight: 1.55,
                  margin: '0 0 32px 0',
                  fontStyle: 'italic'
                }}
              >
                Each day builds on what you discover about yourself.
              </p>

              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  onClick={() => setCurrentStep(2)}
                  style={{
                    background: '#1C1917',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 28px',
                    color: '#FAF8F4',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <span>I’m interested</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 3 — WHY JOIN? (MILESTONES)                        */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <motion.div
              key="screen_2"
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#C2410C',
                  display: 'block',
                  marginBottom: '16px'
                }}
              >
                THE JOURNEY
              </span>

              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(34px, 5.8vw, 46px)',
                  fontWeight: 500,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  color: '#1C1917',
                  margin: '0 0 24px 0'
                }}
              >
                What could 21 days<br />look like?
              </h1>

              {/* Vertical Milestones Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', marginBottom: '32px' }}>
                {MANTRA_21_MILESTONES.map((m, idx) => {
                  const isCompleted = m.status === 'completed';
                  const isLast = idx === MANTRA_21_MILESTONES.length - 1;
                  return (
                    <div key={m.day} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                      {/* Left Track & Icon */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '28px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: isCompleted ? '#C2410C' : '#FFFFFF',
                            border: isCompleted ? 'none' : '1.5px solid #D6D3D1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isCompleted ? '#FAF8F4' : '#A8A29E',
                            fontSize: '11px',
                            fontWeight: 700,
                            flexShrink: 0
                          }}
                        >
                          {isCompleted ? <Check size={13} strokeWidth={3} /> : idx + 1}
                        </div>
                        {!isLast && (
                          <div
                            style={{
                              width: '1.5px',
                              flex: 1,
                              minHeight: '36px',
                              backgroundColor: isCompleted ? '#FED7AA' : '#E7E5E0',
                              margin: '4px 0'
                            }}
                          />
                        )}
                      </div>

                      {/* Content Card */}
                      <div
                        style={{
                          paddingBottom: isLast ? '0px' : '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: isCompleted ? '#C2410C' : '#A8A29E', letterSpacing: '0.06em' }}>
                            DAY {m.day}
                          </span>
                          {isCompleted && (
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#C2410C' }}>
                              (You are here)
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: '#1C1917', marginTop: '2px' }}>
                          {m.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  background: '#F5F5F4',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  marginBottom: '32px'
                }}
              >
                <p style={{ margin: '0 0 8px 0', fontSize: '14.5px', color: '#1C1917', lineHeight: 1.55, fontWeight: 500 }}>
                  You won't be asked to fix everything at once.
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#78716C', lineHeight: 1.55 }}>
                  The journey is about understanding your patterns, trying small actions, and building tools you can keep using.
                </p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  onClick={() => setCurrentStep(3)}
                  style={{
                    background: '#1C1917',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 28px',
                    color: '#FAF8F4',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 4 — DISCOVER THEIR MOTIVATION                     */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <motion.div
              key="screen_3"
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#C2410C',
                  display: 'block',
                  marginBottom: '16px'
                }}
              >
                YOUR WHY
              </span>

              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(32px, 5.5vw, 44px)',
                  fontWeight: 500,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  color: '#1C1917',
                  margin: '0 0 12px 0'
                }}
              >
                What would make these 21 days worth it for you?
              </h1>

              <p
                style={{
                  fontSize: '15px',
                  color: '#78716C',
                  lineHeight: 1.5,
                  margin: '0 0 24px 0'
                }}
              >
                Pick up to two. There's no right answer.
              </p>

              {/* Motivation Options Grid/List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {MANTRA_21_MOTIVATION_OPTIONS.map((opt) => {
                  const isSelected = selectedMotivations.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleMotivation(opt.id)}
                      style={{
                        background: isSelected ? '#FFF7ED' : '#FFFFFF',
                        border: isSelected ? '1.5px solid #C2410C' : '1px solid #E7E5E0',
                        borderRadius: '14px',
                        padding: '16px 18px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>
                        {opt.emoji}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '12.5px',
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                              color: isSelected ? '#C2410C' : '#1C1917'
                            }}
                          >
                            {opt.title}
                          </span>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: isSelected ? 'none' : '1.5px solid #D6D3D1',
                              backgroundColor: isSelected ? '#C2410C' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {isSelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '13.5px', color: '#78716C', lineHeight: 1.45 }}>
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  disabled={selectedMotivations.length === 0}
                  onClick={() => setCurrentStep(4)}
                  style={{
                    background: selectedMotivations.length > 0 ? '#1C1917' : '#D6D3D1',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 28px',
                    color: '#FAF8F4',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: selectedMotivations.length > 0 ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>That's my why</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 5 — PERSONALIZED BRIDGE                           */}
          {/* ========================================================= */}
          {currentStep === 4 && (
            <motion.div
              key="screen_4"
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#C2410C',
                  display: 'block',
                  marginBottom: '16px'
                }}
              >
                YOUR STARTING FOCUS
              </span>

              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(36px, 6vw, 48px)',
                  fontWeight: 500,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  color: '#1C1917',
                  margin: '0 0 24px 0'
                }}
              >
                {bridgeContent.bridgeTitle}
              </h1>

              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E7E5E0',
                  borderRadius: '16px',
                  padding: '24px 22px',
                  marginBottom: '32px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {selectedMotivations.map((id) => {
                    const obj = MANTRA_21_MOTIVATION_OPTIONS.find((m) => m.id === id);
                    if (!obj) return null;
                    return (
                      <span
                        key={id}
                        style={{
                          background: '#FFF7ED',
                          color: '#C2410C',
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: '1px solid #FFEDD5'
                        }}
                      >
                        {obj.emoji} {obj.title}
                      </span>
                    );
                  })}
                </div>

                <div style={{ fontSize: '15.5px', color: '#44403C', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {bridgeContent.bridgeBody}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  onClick={() => setCurrentStep(5)}
                  style={{
                    background: '#1C1917',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 28px',
                    color: '#FAF8F4',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <span>See the plan</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 6 — THE JOIN MOMENT                               */}
          {/* ========================================================= */}
          {currentStep === 5 && (
            <motion.div
              key="screen_5"
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#C2410C',
                  display: 'block',
                  marginBottom: '16px'
                }}
              >
                MANTRA 21
              </span>

              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(36px, 6vw, 48px)',
                  fontWeight: 500,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.12,
                  color: '#1C1917',
                  margin: '0 0 20px 0'
                }}
              >
                21 days.<br />One small step at a time.
              </h1>

              {/* Progress visual */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E7E5E0',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  marginBottom: '28px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#C2410C' }}>DAY 01</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#78716C' }}>~10 min / day</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#A8A29E' }}>DAY 21</span>
                </div>
                <div style={{ height: '4px', backgroundColor: '#E7E5E0', borderRadius: '2px', position: 'relative' }}>
                  <div style={{ width: '5%', height: '100%', backgroundColor: '#C2410C', borderRadius: '2px' }} />
                </div>
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14.5px', color: '#1C1917', fontWeight: 500 }}>
                  “Start today. Come back tomorrow.”
                </div>
              </div>

              {/* Reassurance note */}
              <p
                style={{
                  fontSize: '14.5px',
                  color: '#78716C',
                  lineHeight: 1.55,
                  margin: '0 0 32px 0',
                  textAlign: 'center'
                }}
              >
                You don't have to complete every day perfectly.<br />
                <strong style={{ color: '#1C1917' }}>Showing up is the point.</strong>
              </p>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleJoinOrProceed('challenge')}
                  style={{
                    background: '#1C1917',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 28px',
                    color: '#FAF8F4',
                    fontSize: '15.5px',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{isSubmitting ? 'Enrolling...' : 'Join Mantra 21 →'}</span>
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={() => handleJoinOrProceed('private_plan')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#78716C',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    padding: '10px 0',
                    textAlign: 'center',
                    textDecoration: 'underline'
                  }}
                >
                  Just follow my plan
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 7 — AFTER JOINING (CONFIRMATION & NEXT STEP)      */}
          {/* ========================================================= */}
          {currentStep === 6 && (
            <motion.div
              key="screen_6"
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#C2410C',
                  display: 'block',
                  marginBottom: '16px'
                }}
              >
                {chosenPlanMode === 'challenge' ? 'WELCOME TO MANTRA 21' : 'YOUR 21-DAY PLAN'}
              </span>

              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(36px, 6vw, 48px)',
                  fontWeight: 500,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  color: '#1C1917',
                  margin: '0 0 16px 0'
                }}
              >
                Day 1 is already yours.
              </h1>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#15803D',
                  background: '#F0FDF4',
                  border: '1px solid #DCFCE7',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  marginBottom: '24px',
                  alignSelf: 'flex-start'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Day 1 complete</span>
              </div>

              <p
                style={{
                  fontSize: '15.5px',
                  color: '#57534E',
                  lineHeight: 1.6,
                  margin: '0 0 28px 0'
                }}
              >
                Your next step is waiting tomorrow.
              </p>

              {/* Progress Pathway Preview */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E7E5E0',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '36px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#C2410C', color: '#FAF8F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', display: 'block' }}>DAY 01</span>
                      <span style={{ fontSize: '12px', color: '#78716C' }}>Start where you are</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D' }}>Done</span>
                </div>

                <div style={{ height: '1px', backgroundColor: '#F5F5F4' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                      02
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', display: 'block' }}>DAY 02</span>
                      <span style={{ fontSize: '12px', color: '#78716C' }}>Why everything feels harder</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#D97706' }}>Tomorrow</span>
                </div>

                <div style={{ height: '1px', backgroundColor: '#F5F5F4' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F5F5F4', color: '#A8A29E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                      <Lock size={13} />
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#78716C', display: 'block' }}>DAY 03 — 21</span>
                      <span style={{ fontSize: '12px', color: '#A8A29E' }}>Building your toolkit</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#A8A29E' }}>Locked</span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  onClick={handleFinalExit}
                  style={{
                    background: '#1C1917',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 28px',
                    color: '#FAF8F4',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <span>Go to my journey</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
