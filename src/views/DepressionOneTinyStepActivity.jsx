import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Check,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CornerDownRight,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Share2,
  AlertTriangle,
  HelpCircle,
  Minimize2
} from 'lucide-react';
import {
  TINY_STEP_CATEGORIES,
  containsCrisisKeywords,
  evaluateOneTinyStep,
  ACTIVITY_3_ID,
  ACTIVITY_3_TYPE,
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
 * Mantra 21 Depression Pathway - Day 1 Activity 3: "One Tiny Step"
 * 
 * Clinical Basis: Behavioral Activation (Micro-stepping)
 * Tone: Focused, energetic, mission-driven, zero-pressure, non-clinical.
 * 
 * Screens:
 * 0: THE SHIFT ("You don't need to fix your whole day. You just need one tiny step.")
 * 1: CHOOSE WHAT WOULD HELP (6 Focused Journey Cards + Custom)
 * 2: SHRINK THE TASK (Progressive Action Shrinker with interactive selector)
 * 3: MAKE IT REAL (Visual Commitment Card: Now vs Later Today)
 * 4: ACTION MODE ("Go do it." Distraction-free mission screen + optional lightweight timer)
 * 5: RETURN ("You did it." + Effort Spectrum: Much harder <-> Much easier)
 * 6: THE TINY WIN (Safe-to-share social milestone artifact)
 * 7: CLOSING ("Small still counts. Tomorrow, we'll build from here.")
 */

export default function DepressionOneTinyStepActivity({ onBack, onNavigate, service }) {
  // Navigation & Step Management (0 to 7)
  const [currentStep, setCurrentStep] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);

  // State: Selections
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(3); // Defaults to small/micro (e.g. index 3)
  const [customActionText, setCustomActionText] = useState('');
  const [customActionShrunk, setCustomActionShrunk] = useState(false);
  const [isCrisisDetected, setIsCrisisDetected] = useState(false);

  // Scheduling
  const [timingChoice, setTimingChoice] = useState('now'); // 'now' | 'later'
  const [laterTime, setLaterTime] = useState('18:00');

  // Action Mode Timer
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Outcome & Perception
  const [actionCompleted, setActionCompleted] = useState(true);
  const [expectedVsActual, setExpectedVsActual] = useState('about_expected'); // 'much_harder' | 'harder' | 'about_expected' | 'easier' | 'much_easier'
  const [showDidNotHappenDialog, setShowDidNotHappenDialog] = useState(false);

  // Saving / Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef(Date.now());
  const initialLoadRef = useRef(false);

  // Privacy-first analytics logger
  const trackAnalyticsEvent = (eventName, eventData = {}) => {
    try {
      const payload = {
        event: eventName,
        user_id: getActiveUserId(),
        activity_id: ACTIVITY_3_ID,
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

  // 1. Resume / Hydration on mount
  useEffect(() => {
    const restore = async () => {
      const userId = getActiveUserId();
      trackAnalyticsEvent('activity_started', { step: 0 });

      // LocalStorage quick load
      let localData = null;
      try {
        const stored = localStorage.getItem(`mantra_progress_${ACTIVITY_3_ID}_${userId}`);
        if (stored) localData = JSON.parse(stored);
      } catch (e) {}

      // Server progress lookup
      const serverRes = await getUserLessonProgress(userId, ACTIVITY_3_ID).catch(() => null);
      const serverData = serverRes?.data || null;
      const merged = serverData?.responseData || localData;

      if (merged) {
        if (merged.selected_category) setSelectedCategory(merged.selected_category);
        if (merged.selected_size_index !== undefined) setSelectedSizeIndex(merged.selected_size_index);
        if (merged.custom_action_text) setCustomActionText(merged.custom_action_text);
        if (merged.timing_choice) setTimingChoice(merged.timing_choice);
        if (merged.action_completed !== undefined) setActionCompleted(merged.action_completed);
        if (merged.expected_vs_actual) setExpectedVsActual(merged.expected_vs_actual);
        if (serverData?.currentStep !== undefined && serverData.currentStep < 7) {
          setCurrentStep(serverData.currentStep);
        }
      }

      setHasResumed(true);
      initialLoadRef.current = true;
    };

    restore();
  }, []);

  // 2. Persist step progress on state changes
  useEffect(() => {
    if (!initialLoadRef.current) return;
    const userId = getActiveUserId();

    const responseData = {
      selected_category: selectedCategory,
      selected_size_index: selectedSizeIndex,
      custom_action_text: customActionText,
      timing_choice: timingChoice,
      later_time: laterTime,
      action_completed: actionCompleted,
      expected_vs_actual: expectedVsActual,
      completion_status: currentStep === 7 ? 'completed' : 'in_progress',
      started_at: new Date(startTimeRef.current).toISOString(),
      last_updated_at: new Date().toISOString()
    };

    try {
      localStorage.setItem(`mantra_progress_${ACTIVITY_3_ID}_${userId}`, JSON.stringify(responseData));
    } catch (e) {}

    saveUserLessonProgress({
      userId,
      lessonId: ACTIVITY_3_ID,
      currentStep,
      totalSteps: 8,
      actionDone: `step_${currentStep}`,
      responseData
    }).catch((err) => console.warn('Progress sync warning:', err));
  }, [currentStep, selectedCategory, selectedSizeIndex, customActionText, timingChoice, laterTime, actionCompleted, expectedVsActual]);

  // Scroll to top on step transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Current Category & Action
  const activeCategory = useMemo(() => {
    return TINY_STEP_CATEGORIES.find((c) => c.id === selectedCategory) || null;
  }, [selectedCategory]);

  const activeAction = useMemo(() => {
    if (selectedCategory === 'custom') {
      return {
        id: 'custom_step',
        label: customActionText.trim() || 'My custom tiny step',
        sizeLevel: 1,
        minutes: 2
      };
    }
    if (!activeCategory || !activeCategory.sizes) return null;
    return activeCategory.sizes[selectedSizeIndex] || activeCategory.sizes[activeCategory.sizes.length - 1];
  }, [activeCategory, selectedCategory, selectedSizeIndex, customActionText]);

  // Sync Timer when entering Action Mode (Screen 4)
  useEffect(() => {
    if (currentStep === 4 && activeAction) {
      const defaultSecs = (activeAction.minutes || 2) * 60;
      setTimerSeconds(defaultSecs);
      setIsTimerRunning(false);
    }
  }, [currentStep, activeAction]);

  // Timer Tick
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Check Custom Input Safety
  const handleCustomTextChange = (text) => {
    setCustomActionText(text);
    if (containsCrisisKeywords(text)) {
      setIsCrisisDetected(true);
      trackAnalyticsEvent('crisis_keyword_detected', { field: 'custom_action' });
    } else {
      setIsCrisisDetected(false);
    }
  };

  // Complete Activity & Persist to Neon DB
  const handleCompleteActivity = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const userId = getActiveUserId();
    const completedAt = new Date().toISOString();
    const startedAt = new Date(startTimeRef.current).toISOString();
    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const evaluation = evaluateOneTinyStep({
      selectedCategory,
      selectedAction: activeAction,
      actionSizeLevel: activeAction?.sizeLevel ?? 1,
      actionCompleted,
      expectedVsActual
    });

    const rawResponseData = {
      selected_category: selectedCategory,
      category_title: evaluation.categoryTitle,
      selected_action: activeAction?.label || 'One Tiny Step',
      action_size_level: activeAction?.sizeLevel ?? 1,
      planned_timing: timingChoice,
      scheduled_time: timingChoice === 'later' ? laterTime : 'immediate',
      action_completed: actionCompleted,
      expected_vs_actual_difficulty: expectedVsActual,
      derived_signals: evaluation.signalsMap,
      timestamp: completedAt,
      completion_status: 'completed',
      time_spent_seconds: timeSpentSeconds
    };

    const activityPayload = {
      userId,
      activityId: ACTIVITY_3_ID,
      lessonId: ACTIVITY_3_ID,
      activityType: ACTIVITY_3_TYPE,
      service: service || 'therapy',
      rewardPoints: 25,
      reflection: typeof activeAction?.label === 'string' ? `Tiny Step: ${activeAction.label}` : undefined,
      resultSummary: {
        pathway_id: PATHWAY_ID,
        day_number: DAY_NUMBER,
        activity_number: 3,
        started_at: startedAt,
        completed_at: completedAt,
        completion_status: 'completed',
        time_spent_seconds: timeSpentSeconds,
        response_data: rawResponseData
      },
      metadata: {
        activityId: ACTIVITY_3_ID,
        pathwayId: PATHWAY_ID,
        dayNumber: DAY_NUMBER,
        selectedCategory,
        actionCompleted,
        signals: Object.keys(evaluation.signalsMap)
      }
    };

    // 1. Save locally
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`mantra_completed_${ACTIVITY_3_ID}_${userId}`, JSON.stringify(rawResponseData));
      } catch (e) {}
    }

    trackAnalyticsEvent('activity_completed', {
      completion_status: 'completed',
      time_spent_seconds: timeSpentSeconds,
      action_completed: actionCompleted,
      category: selectedCategory
    });

    // 2. Log to user_activities
    const logRes = await logUserActivityToDB(activityPayload).catch((e) => {
      console.warn('DB log non-blocking error:', e);
      return null;
    });

    // 3. Record traceable personalization signals
    const signalPromises = Object.entries(evaluation.signalsMap).map(([sigKey, strength]) => {
      return recordUserPersonalizationSignal({
        userId,
        pathwayId: PATHWAY_ID,
        signal: sigKey,
        strength: Math.min(strength, 5),
        sourceType: 'activity',
        sourceId: logRes?.data?.id ? String(logRes.data.id) : ACTIVITY_3_ID,
        metadata: {
          activityId: ACTIVITY_3_ID,
          selectedCategory,
          actionCompleted
        }
      });
    });

    await Promise.allSettled(signalPromises);

    // 4. Complete lesson via webhook
    try {
      await completeLesson(ACTIVITY_3_ID, service || 'therapy').catch((e) => console.warn('[OneTinyStep] Completion webhook error:', e));
      await completeLesson('depression_one_tiny_step', service || 'therapy').catch(() => {});
      await completeLesson('depression_one_tiny_win', service || 'therapy').catch(() => {});
    } catch (e) {
      console.warn('[OneTinyStep] Completion webhook error:', e);
    }

    setIsSubmitting(false);

    // Return to dashboard
    if (onBack) {
      onBack();
    } else {
      goToDashboard();
    }
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
        padding: '20px 16px 40px 16px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}
      >
        {/* Top Bar Navigation & Journey Step */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <button
            onClick={() => {
              if (currentStep > 0) {
                setCurrentStep((s) => s - 1);
              } else if (onBack) {
                onBack();
              }
            }}
            aria-label="Go back"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#78716C',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '6px 2px',
              borderRadius: '8px'
            }}
          >
            <ArrowLeft size={18} />
            <span>{currentStep === 0 ? 'Back' : 'Previous'}</span>
          </button>

          <div />
        </div>

        {/* Progress Journey Track */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            gap: '5px',
            marginBottom: '24px'
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map((stepIdx) => (
            <div
              key={stepIdx}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor:
                  currentStep === stepIdx
                    ? '#EA580C'
                    : currentStep > stepIdx
                    ? '#FED7AA'
                    : '#E7E5E4',
                transition: 'background-color 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Dynamic Abstract Visual Motif Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <motion.div
            animate={{
              scale: currentStep === 4 ? [1, 1.08, 1] : 1,
              rotate: currentStep * 45
            }}
            transition={{ duration: 1.5, repeat: currentStep === 4 ? Infinity : 0, ease: 'easeInOut' }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: currentStep >= 5 ? '50%' : '10px',
              background: currentStep >= 5 ? '#059669' : '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)'
            }}
          >
            {currentStep >= 5 ? <Check size={18} strokeWidth={3} /> : <Sparkles size={18} />}
          </motion.div>
        </div>

        {/* Main Content Area */}
        <main
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}
        >
          <AnimatePresence mode="wait">
            {/* ========================================================================= */}
            {/* SCREEN 1: THE SHIFT */}
            {/* ========================================================================= */}
            {currentStep === 0 && (
              <motion.div
                key="step-0-shift"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <h1
                    style={{
                      fontFamily: 'Newsreader, Georgia, serif',
                      fontSize: 'clamp(28px, 6.5vw, 34px)',
                      fontWeight: 600,
                      lineHeight: '1.2',
                      color: '#1C1917',
                      margin: '0 0 12px 0',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    You don't need to fix your whole day.
                  </h1>

                  <h2
                    style={{
                      fontFamily: 'Newsreader, Georgia, serif',
                      fontSize: 'clamp(22px, 5.5vw, 26px)',
                      fontWeight: 500,
                      lineHeight: '1.3',
                      color: '#EA580C',
                      margin: '0 0 20px 0'
                    }}
                  >
                    You just need one tiny step.
                  </h2>

                  <div
                    style={{
                      fontSize: '15.5px',
                      lineHeight: '1.65',
                      color: '#57534E',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      When you're feeling low, even simple things can feel like a lot.
                    </p>
                    <p style={{ margin: 0, fontWeight: 500, color: '#1C1917' }}>
                      So let's make the goal smaller.
                    </p>
                  </div>
                </div>

                {/* Abstract Visual Anchor */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E7E5E4',
                    borderRadius: '20px',
                    padding: '24px',
                    marginBottom: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      backgroundColor: '#FFF7ED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EA580C',
                      flexShrink: 0
                    }}
                  >
                    <Sliders size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', marginBottom: '2px' }}>
                      1% Easier Principle
                    </div>
                    <div style={{ fontSize: '13px', color: '#78716C', lineHeight: '1.4' }}>
                      Success is taking one small, doable step, not trying to fix everything at once.
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                  <button
                    onClick={() => setCurrentStep(1)}
                    style={{
                      width: '100%',
                      backgroundColor: '#EA580C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <span>Find my tiny step</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 2: CHOOSE WHAT WOULD HELP */}
            {/* ========================================================================= */}
            {currentStep === 1 && (
              <motion.div
                key="step-1-choose"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <h2
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: 'clamp(24px, 5.5vw, 28px)',
                    fontWeight: 600,
                    color: '#1C1917',
                    margin: '0 0 8px 0',
                    lineHeight: '1.25'
                  }}
                >
                  What could make today a little easier?
                </h2>

                <p
                  style={{
                    fontSize: '14.5px',
                    color: '#78716C',
                    margin: '0 0 20px 0'
                  }}
                >
                  Don't overthink it. Pick whatever feels most doable.
                </p>

                {/* Vertically Stacked Journey Cards */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginBottom: '20px'
                  }}
                >
                  {TINY_STEP_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;

                    return (
                      <motion.button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          trackAnalyticsEvent('category_selected', { category_id: cat.id });
                        }}
                        whileTap={{ scale: 0.985 }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          backgroundColor: isSelected ? '#FFFFFF' : cat.bg,
                          border: isSelected
                            ? `2px solid ${cat.color}`
                            : `1px solid ${cat.border}`,
                          borderRadius: '16px',
                          padding: '16px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          boxShadow: isSelected
                            ? '0 4px 14px rgba(0,0,0,0.06)'
                            : '0 1px 3px rgba(0,0,0,0.02)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                              color: isSelected ? cat.color : '#1C1917',
                              marginBottom: '3px'
                            }}
                          >
                            {cat.title}
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              color: '#57534E',
                              lineHeight: '1.35'
                            }}
                          >
                            {cat.subtitle}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: isSelected
                              ? `2px solid ${cat.color}`
                              : '1.5px solid #CBD5E1',
                            backgroundColor: isSelected ? cat.color : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginLeft: '12px'
                          }}
                        >
                          {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Stalled / Unsure Help Note */}
                <div
                  style={{
                    backgroundColor: '#F5F0E8',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    fontSize: '13px',
                    color: '#78716C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px'
                  }}
                >
                  <HelpCircle size={16} color="#A8A29E" style={{ flexShrink: 0 }} />
                  <span>Unsure what to choose? Pick the smallest thing taking under 2 minutes.</span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedCategory}
                    style={{
                      width: '100%',
                      backgroundColor: selectedCategory ? '#1C1917' : '#E7E5E4',
                      color: selectedCategory ? '#FFFFFF' : '#A8A29E',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: selectedCategory ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: selectedCategory ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>Continue</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 3: SHRINK THE TASK (Interactive Shrinker) */}
            {/* ========================================================================= */}
            {currentStep === 2 && (
              <motion.div
                key="step-2-shrink"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#FFF7ED',
                    border: '1px solid #FFEDD5',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#C2410C',
                    marginBottom: '12px',
                    width: 'fit-content'
                  }}
                >
                  <Minimize2 size={13} />
                  <span>MICRO-STEPPING</span>
                </div>

                <h2
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: 'clamp(26px, 6vw, 30px)',
                    fontWeight: 600,
                    color: '#1C1917',
                    margin: '0 0 8px 0',
                    lineHeight: '1.25'
                  }}
                >
                  Now make it smaller.
                </h2>

                <p
                  style={{
                    fontSize: '14.5px',
                    color: '#78716C',
                    margin: '0 0 20px 0'
                  }}
                >
                  The goal isn't to do a lot. The goal is to make it easy enough to start.
                </p>

                {/* Custom Action Branch */}
                {selectedCategory === 'custom' ? (
                  <div style={{ marginBottom: '24px' }}>
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: isCrisisDetected ? '1.5px solid #EF4444' : '1px solid #E7E5E4',
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '16px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <label
                        htmlFor="custom-step-input"
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#A8A29E',
                          display: 'block',
                          marginBottom: '8px'
                        }}
                      >
                        What tiny step would you like to do?
                      </label>
                      <input
                        id="custom-step-input"
                        type="text"
                        value={customActionText}
                        onChange={(e) => handleCustomTextChange(e.target.value)}
                        placeholder="e.g. Put shoes near the door, drink water..."
                        style={{
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          fontSize: '15px',
                          color: '#1C1917',
                          backgroundColor: 'transparent'
                        }}
                      />
                    </div>

                    {isCrisisDetected && (
                      <div
                        style={{
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FCA5A5',
                          borderRadius: '12px',
                          padding: '14px',
                          marginBottom: '16px',
                          color: '#991B1B',
                          fontSize: '13px',
                          lineHeight: '1.5'
                        }}
                      >
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <AlertTriangle size={16} /> We care about your safety.
                        </div>
                        If you are experiencing overwhelming feelings or thoughts of self-harm, please reach out to a support counselor immediately (e.g. call or text 988 in the US or your local crisis helpline).
                      </div>
                    )}

                    {customActionText.length > 30 && !customActionShrunk && (
                      <div
                        style={{
                          backgroundColor: '#FFF7ED',
                          border: '1px solid #FED7AA',
                          borderRadius: '14px',
                          padding: '14px',
                          color: '#9A3412',
                          fontSize: '13.5px',
                          lineHeight: '1.45'
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>That's a good goal. Can we shrink it even more?</div>
                        <span>Try picking something that takes under 2 minutes so there is zero friction.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Progressive Shrinker List */
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeCategory?.sizes.map((sz, idx) => {
                        const isSelected = selectedSizeIndex === idx;

                        return (
                          <motion.button
                            key={sz.id}
                            type="button"
                            onClick={() => {
                              setSelectedSizeIndex(idx);
                              trackAnalyticsEvent('action_size_selected', {
                                size_level: sz.sizeLevel,
                                label: sz.label
                              });
                            }}
                            whileTap={{ scale: 0.99 }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              backgroundColor: isSelected ? '#FFFFFF' : '#FAF9F6',
                              border: isSelected
                                ? '2px solid #EA580C'
                                : '1px solid #E7E5E4',
                              borderRadius: '14px',
                              padding: '14px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              boxShadow: isSelected
                                ? '0 4px 12px rgba(234, 88, 12, 0.12)'
                                : '0 1px 2px rgba(0,0,0,0.02)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  color: isSelected ? '#EA580C' : '#94A3B8',
                                  background: isSelected ? '#FFF7ED' : '#F1F5F9',
                                  padding: '2px 6px',
                                  borderRadius: '6px'
                                }}
                              >
                                ~{sz.minutes}m
                              </span>
                              <span
                                style={{
                                  fontSize: '14.5px',
                                  fontWeight: isSelected ? 600 : 400,
                                  color: isSelected ? '#1C1917' : '#44403C'
                                }}
                              >
                                {sz.label}
                              </span>
                            </div>

                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: isSelected
                                  ? '2px solid #EA580C'
                                  : '1.5px solid #D6D3D1',
                                backgroundColor: isSelected ? '#EA580C' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginLeft: '10px'
                              }}
                            >
                              {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div
                      style={{
                        textAlign: 'center',
                        marginTop: '12px',
                        fontSize: '13px',
                        color: '#78716C',
                        fontWeight: 500
                      }}
                    >
                      Pick the version you'd actually do right now.
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={selectedCategory === 'custom' && (!customActionText.trim() || isCrisisDetected)}
                    style={{
                      width: '100%',
                      backgroundColor: '#1C1917',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <span>That one →</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 4: MAKE IT REAL (Visual Commitment Card) */}
            {/* ========================================================================= */}
            {currentStep === 3 && (
              <motion.div
                key="step-3-commit"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <h2
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: 'clamp(26px, 6vw, 30px)',
                    fontWeight: 600,
                    color: '#1C1917',
                    margin: '0 0 16px 0',
                    lineHeight: '1.25'
                  }}
                >
                  Let's make it happen.
                </h2>

                {/* Large Visual Commitment Card */}
                <div
                  style={{
                    backgroundColor: '#1C1917',
                    color: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '24px 20px',
                    marginBottom: '28px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: '#EA580C',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}
                  >
                    MY TINY STEP
                  </div>

                  <div
                    style={{
                      fontFamily: 'Newsreader, Georgia, serif',
                      fontSize: '22px',
                      fontWeight: 600,
                      lineHeight: '1.35',
                      marginBottom: '14px'
                    }}
                  >
                    {activeAction?.label}
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      color: '#E7E5E4'
                    }}
                  >
                    <Clock size={13} />
                    <span>Takes ~{activeAction?.minutes || 2} minutes</span>
                  </div>
                </div>

                {/* When Choice: NOW vs LATER TODAY */}
                <div style={{ marginBottom: '24px' }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1C1917',
                      marginBottom: '10px'
                    }}
                  >
                    When?
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setTimingChoice('now')}
                      style={{
                        padding: '14px',
                        borderRadius: '14px',
                        border: timingChoice === 'now' ? '2px solid #EA580C' : '1px solid #E7E5E4',
                        backgroundColor: timingChoice === 'now' ? '#FFF7ED' : '#FFFFFF',
                        color: timingChoice === 'now' ? '#C2410C' : '#44403C',
                        fontWeight: 700,
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      NOW
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimingChoice('later')}
                      style={{
                        padding: '14px',
                        borderRadius: '14px',
                        border: timingChoice === 'later' ? '2px solid #EA580C' : '1px solid #E7E5E4',
                        backgroundColor: timingChoice === 'later' ? '#FFF7ED' : '#FFFFFF',
                        color: timingChoice === 'later' ? '#C2410C' : '#44403C',
                        fontWeight: 700,
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      LATER TODAY
                    </button>
                  </div>

                  {timingChoice === 'later' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E7E5E4',
                        borderRadius: '14px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ fontSize: '14px', color: '#57534E', fontWeight: 500 }}>Target time today:</span>
                      <input
                        type="time"
                        value={laterTime}
                        onChange={(e) => setLaterTime(e.target.value)}
                        style={{
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '14px',
                          color: '#1C1917',
                          fontWeight: 600,
                          outline: 'none'
                        }}
                      />
                    </motion.div>
                  )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  <button
                    onClick={() => setCurrentStep(4)}
                    style={{
                      width: '100%',
                      backgroundColor: '#EA580C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)'
                    }}
                  >
                    <span>I'm ready →</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 5: ACTION MODE (Distraction-Free Mission Screen) */}
            {/* ========================================================================= */}
            {currentStep === 4 && (
              <motion.div
                key="step-4-action"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  textAlign: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px 0'
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: '#EA580C',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}
                >
                  MISSION IN PROGRESS
                </div>

                <h1
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: 'clamp(32px, 8vw, 40px)',
                    fontWeight: 600,
                    color: '#1C1917',
                    margin: '0 0 10px 0'
                  }}
                >
                  Go do it.
                </h1>

                <p
                  style={{
                    fontSize: '16px',
                    color: '#78716C',
                    margin: '0 0 28px 0',
                    maxWidth: '360px',
                    lineHeight: '1.5'
                  }}
                >
                  Just this one thing. Nothing else.
                </p>

                {/* Highlighted Action Commitment Box */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #EA580C',
                    borderRadius: '20px',
                    padding: '24px 20px',
                    marginBottom: '32px',
                    width: '100%',
                    boxSizing: 'border-box',
                    boxShadow: '0 6px 20px rgba(234, 88, 12, 0.08)'
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Newsreader, Georgia, serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#1C1917',
                      lineHeight: '1.4'
                    }}
                  >
                    {activeAction?.label}
                  </div>
                </div>

                {/* Lightweight Optional Countdown Timer */}
                <div
                  style={{
                    backgroundColor: '#F5F0E8',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    marginBottom: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#1C1917',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {formatTimer(timerSeconds)}
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    style={{
                      background: isTimerRunning ? '#EA580C' : '#1C1917',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                  </button>
                </div>

                <div style={{ fontSize: '14px', color: '#78716C', marginBottom: '32px', fontStyle: 'italic' }}>
                  “I'll be here when you're done.”
                </div>

                {/* Done & Return Trigger */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setActionCompleted(true);
                      setCurrentStep(5);
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)'
                    }}
                  >
                    <Check size={18} strokeWidth={3} />
                    <span>I did it</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDidNotHappenDialog(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#78716C',
                      fontSize: '13.5px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: '8px'
                    }}
                  >
                    Didn't happen this time?
                  </button>
                </div>

                {/* Gentle Retry Dialog */}
                {showDidNotHappenDialog && (
                  <div
                    style={{
                      marginTop: '16px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7E5E4',
                      borderRadius: '16px',
                      padding: '16px',
                      textAlign: 'left',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#1C1917', marginBottom: '4px' }}>
                      Didn't happen this time. That's okay.
                    </div>
                    <div style={{ fontSize: '13.5px', color: '#78716C', marginBottom: '12px' }}>
                      Energy fluctuates. Want to make it even smaller?
                    </div>
                    <button
                      onClick={() => {
                        setShowDidNotHappenDialog(false);
                        setCurrentStep(2); // Go back to shrinker
                      }}
                      style={{
                        backgroundColor: '#1C1917',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Make it smaller
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 6: RETURN (Perceived Effort Spectrum) */}
            {/* ========================================================================= */}
            {currentStep === 5 && (
              <motion.div
                key="step-5-return"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <Check size={26} strokeWidth={3} />
                </div>

                <h2
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: 'clamp(28px, 6.5vw, 32px)',
                    fontWeight: 600,
                    color: '#1C1917',
                    margin: '0 0 8px 0',
                    lineHeight: '1.25'
                  }}
                >
                  You did it.
                </h2>

                {/* Transformed Completed Action Card */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #A7F3D0',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    marginBottom: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#1C1917' }}>
                    {activeAction?.label}
                  </span>
                </div>

                {/* Effort Spectrum: Much harder <-> Much easier */}
                <div style={{ marginBottom: '28px' }}>
                  <div
                    style={{
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: '#1C1917',
                      marginBottom: '6px'
                    }}
                  >
                    Was it easier or harder than you expected?
                  </div>
                  <div style={{ fontSize: '13px', color: '#78716C', marginBottom: '16px' }}>
                    (Optional reflection, not a mood score)
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { id: 'much_harder', label: 'Much harder than expected' },
                      { id: 'harder', label: 'A little harder' },
                      { id: 'about_expected', label: 'About what I expected' },
                      { id: 'easier', label: 'A little easier' },
                      { id: 'much_easier', label: 'Much easier than expected' }
                    ].map((opt) => {
                      const isSelected = expectedVsActual === opt.id;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setExpectedVsActual(opt.id);
                            trackAnalyticsEvent('difficulty_reported', { rating: opt.id });
                          }}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid #059669' : '1px solid #E7E5E4',
                            backgroundColor: isSelected ? '#ECFDF5' : '#FAF9F6',
                            color: isSelected ? '#065F46' : '#44403C',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '14px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check size={16} color="#059669" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  <button
                    onClick={() => setCurrentStep(6)}
                    style={{
                      width: '100%',
                      backgroundColor: '#1C1917',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <span>See my tiny win →</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 7: THE TINY WIN (Safe-to-Share Social Card) */}
            {/* ========================================================================= */}
            {currentStep === 6 && (
              <motion.div
                key="step-6-win"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                {/* Spotify-Wrapped Style Premium Social Artifact (No medical info) */}
                <div
                  style={{
                    backgroundColor: '#1C1917',
                    color: '#FAF8F4',
                    borderRadius: '24px',
                    padding: '28px 22px',
                    marginBottom: '24px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '24px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.12em',
                        color: '#EA580C',
                        textTransform: 'uppercase'
                      }}
                    >
                      TINY WIN
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#A8A29E'
                      }}
                    >
                      Day 1 • Mantra 21
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'Newsreader, Georgia, serif',
                      fontSize: 'clamp(24px, 6vw, 30px)',
                      fontWeight: 600,
                      lineHeight: '1.25',
                      margin: '0 0 20px 0',
                      color: '#FAF8F4'
                    }}
                  >
                    “I showed up for myself today.”
                  </h3>

                  <div
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                      {activeAction?.label}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={handleCompleteActivity}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      backgroundColor: '#EA580C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: isSubmitting ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)'
                    }}
                  >
                    <span>{isSubmitting ? 'Saving...' : 'Keep this win →'}</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(7)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#78716C',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: '6px',
                      textAlign: 'center'
                    }}
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 8: CLOSING (Finish Day 1) */}
            {/* ========================================================================= */}
            {currentStep === 7 && (
              <motion.div
                key="step-7-closing"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '18px',
                    backgroundColor: '#FFF7ED',
                    border: '1px solid #FFEDD5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    color: '#EA580C'
                  }}
                >
                  <Sparkles size={28} />
                </div>

                <h1
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: 'clamp(28px, 6.5vw, 34px)',
                    fontWeight: 600,
                    lineHeight: '1.25',
                    color: '#1C1917',
                    margin: '0 0 16px 0',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Small still counts.
                </h1>

                <div
                  style={{
                    fontSize: '15.5px',
                    lineHeight: '1.65',
                    color: '#57534E',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    marginBottom: '36px'
                  }}
                >
                  <p style={{ margin: 0 }}>
                    You didn't have to fix everything today.
                  </p>
                  <p style={{ margin: 0 }}>
                    You chose one thing. You started. <strong>That matters.</strong>
                  </p>
                  <p style={{ margin: 0, color: '#1C1917', fontWeight: 500 }}>
                    Tomorrow, we'll build from here.
                  </p>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  <button
                    onClick={handleCompleteActivity}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      backgroundColor: '#EA580C',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: isSubmitting ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <span>{isSubmitting ? 'Finishing Day 1...' : 'Finish Day 1 →'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
