import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Check,
  Sparkles,
  ChevronRight,
  Edit3,
  Compass,
  ShieldCheck,
  CornerDownRight
} from 'lucide-react';
import {
  FOUR_DOMAINS,
  PRIMARY_DIFFICULTY_CANDIDATES,
  getRelevantPrimaryDifficulties,
  evaluateHowIsItShowingUp,
  ACTIVITY_2_ID,
  ACTIVITY_2_TYPE,
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
import { getActiveUserId } from '../services/authService';

/**
 * Mantra 21 Depression Pathway — Day 1 Activity 2: "How Is It Showing Up For Me?"
 * 
 * Mobile-First, Highly Responsive Editorial Wellness Experience
 * 
 * Screens:
 * 0: Intro ("How has depression been showing up for you?")
 * 1: Mind Domain (Thoughts)
 * 2: Feelings Domain (Emotions)
 * 3: Body Domain (Physical)
 * 4: Actions Domain (Behavioral)
 * 5: Personal Insight ("Here's what you're noticing" + Interconnections)
 * 6: Primary Difficulty ("What gets in your way the most right now?")
 * 7: Optional Reflection ("Want to put it into your own words?")
 * 8: Final Completion ("You just did something important: you noticed" → Next: one tiny step)
 */

export default function DepressionHowIsItShowingUpActivity({ onBack, onNavigate, service }) {
  // Navigation & Step Management
  const [currentStep, setCurrentStep] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);

  // User Selections (Structured domains)
  const [symptomDomains, setSymptomDomains] = useState({
    cognitive: [],
    emotional: [],
    physical: [],
    behavioral: []
  });

  // Screen 6: Primary Difficulty (Single Select)
  const [primaryDifficulty, setPrimaryDifficulty] = useState(null);

  // Screen 7: Optional Free-form Reflection
  const [reflectionText, setReflectionText] = useState('');

  // Saving / Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 1. Resume / Hydration on mount
  useEffect(() => {
    const restore = async () => {
      const userId = getActiveUserId();
      trackAnalyticsEvent('activity_started', { step: 0 });

      // LocalStorage quick load
      let localData = null;
      try {
        const stored = localStorage.getItem(`mantra_progress_${ACTIVITY_2_ID}_${userId}`);
        if (stored) localData = JSON.parse(stored);
      } catch (e) {}

      // Server progress lookup
      const serverRes = await getUserLessonProgress(userId, ACTIVITY_2_ID).catch(() => null);
      const serverData = serverRes?.data || null;

      const merged = serverData?.responseData || localData;

      if (merged) {
        if (merged.symptom_domains) setSymptomDomains(merged.symptom_domains);
        if (merged.primary_difficulty) setPrimaryDifficulty(merged.primary_difficulty);
        if (merged.optional_free_text) setReflectionText(merged.optional_free_text);
        if (serverData?.currentStep !== undefined && serverData.currentStep < 8) {
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
      symptom_domains: symptomDomains,
      primary_difficulty: primaryDifficulty,
      optional_free_text: reflectionText,
      completion_status: currentStep === 8 ? 'completed' : 'in_progress',
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
      totalSteps: 9,
      actionDone: `step_${currentStep}`,
      responseData
    }).catch((err) => console.warn('Progress sync warning:', err));
  }, [currentStep, symptomDomains, primaryDifficulty, reflectionText]);

  // Scroll to top on step transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Evaluated domain breakdown and signals
  const domainEvaluation = useMemo(() => {
    return evaluateHowIsItShowingUp(symptomDomains, primaryDifficulty);
  }, [symptomDomains, primaryDifficulty]);

  // Dynamic Primary Difficulties tailored to selections
  const relevantPrimaryDifficulties = useMemo(() => {
    return getRelevantPrimaryDifficulties(symptomDomains);
  }, [symptomDomains]);

  // Chip Selection Toggle Handler for 4 Domains
  const handleToggleChip = (domainId, optionId, isNone = false) => {
    setSymptomDomains((prev) => {
      const currentList = prev[domainId] || [];

      if (isNone) {
        // If "None of these" is clicked, clear others and toggle "none"
        if (currentList.includes(optionId)) {
          return { ...prev, [domainId]: [] };
        } else {
          return { ...prev, [domainId]: [optionId] };
        }
      }

      // If a regular option is clicked, remove any "none" option
      let nextList = currentList.filter((id) => !id.endsWith('_none'));
      if (nextList.includes(optionId)) {
        nextList = nextList.filter((id) => id !== optionId);
      } else {
        nextList = [...nextList, optionId];
      }

      return {
        ...prev,
        [domainId]: nextList
      };
    });

    trackAnalyticsEvent('chip_toggled', {
      domain_id: domainId,
      option_id: optionId
    });
  };

  // Complete Activity & Persist
  const handleCompleteActivity = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const userId = getActiveUserId();
    const completedAt = new Date().toISOString();
    const startedAt = new Date(startTimeRef.current).toISOString();
    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const rawResponseData = {
      symptom_domains: symptomDomains,
      primary_difficulty: primaryDifficulty,
      optional_free_text: reflectionText.trim() || null,
      selected_options: domainEvaluation.selectedOptions,
      derived_signals: domainEvaluation.signalsMap,
      timestamp: completedAt,
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
      reflection: reflectionText.trim() || undefined,
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
        primaryDifficulty,
        signals: Object.keys(domainEvaluation.signalsMap),
        domainsCount: domainEvaluation.activeAreasCount
      }
    };

    // Save completion locally
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`mantra_completed_${ACTIVITY_2_ID}_${userId}`, JSON.stringify(rawResponseData));
      } catch (e) {}
    }

    trackAnalyticsEvent('activity_completed', {
      completion_status: 'completed',
      time_spent_seconds: timeSpentSeconds,
      has_reflection: Boolean(reflectionText.trim())
    });

    // 1. Log to user_activities
    const logRes = await logUserActivityToDB(activityPayload).catch((e) => {
      console.warn('DB log non-blocking error:', e);
      return null;
    });

    // 2. Idempotently record each personalization signal
    const signalPromises = Object.entries(domainEvaluation.signalsMap).map(([sigKey, strength]) => {
      return recordUserPersonalizationSignal({
        userId,
        pathwayId: PATHWAY_ID,
        signal: sigKey,
        strength: Math.min(strength, 5),
        sourceType: 'activity',
        sourceId: logRes?.data?.id ? String(logRes.data.id) : ACTIVITY_2_ID,
        metadata: {
          activityId: ACTIVITY_2_ID,
          primaryDifficulty
        }
      });
    });

    await Promise.allSettled(signalPromises);

    // 3. Mark completeLesson via API
    try {
      await completeLesson(ACTIVITY_2_ID, service || 'therapy');
    } catch (e) {}

    setIsSubmitting(false);

    // Navigate to next activity or back to dashboard
    if (onNavigate) {
      onNavigate('/task/depression-one-tiny-win');
    } else if (onBack) {
      onBack();
    }
  };

  // Step Progress Counter
  // For domains 1..4, show "1 of 4", "2 of 4", etc.
  const domainStepIndex = currentStep >= 1 && currentStep <= 4 ? currentStep : null;

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
      {/* Container with max-width and full mobile responsiveness */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}
      >
        {/* Top Navigation & Subdued Progress */}
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

          {domainStepIndex ? (
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#78716C',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                background: '#F5F0E8',
                padding: '4px 12px',
                borderRadius: '999px'
              }}
            >
              Area {domainStepIndex} of 4
            </div>
          ) : (
            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#A8A29E',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Clock size={13} />
              <span>2–3 min</span>
            </div>
          )}
        </div>

        {/* Progress Dots Bar */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            gap: '5px',
            marginBottom: '24px'
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((stepIdx) => (
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

        {/* Main Content Card */}
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
            {/* SCREEN 1: INTRO */}
            {/* ========================================================================= */}
            {currentStep === 0 && (
              <motion.div
                key="step-0-intro"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#FFF7ED',
                    border: '1px solid #FFEDD5',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#C2410C',
                    marginBottom: '16px',
                    width: 'fit-content'
                  }}
                >
                  <Sparkles size={13} />
                  <span>DAY 1 • ACTIVITY 2</span>
                </div>

                <h1
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: 'clamp(26px, 6vw, 32px)',
                    fontWeight: 600,
                    lineHeight: '1.25',
                    color: '#1C1917',
                    margin: '0 0 14px 0',
                    letterSpacing: '-0.02em'
                  }}
                >
                  How has depression been showing up for you?
                </h1>

                <div
                  style={{
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: '#57534E',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '28px'
                  }}
                >
                  <p style={{ margin: 0 }}>
                    Depression doesn't look the same for everyone.
                  </p>
                  <p style={{ margin: 0 }}>
                    Sometimes it's what you <strong>feel</strong>. Sometimes it's what you <strong>think</strong>. Sometimes it's what your <strong>body does</strong>, or what you <strong>stop doing</strong>.
                  </p>
                  <p style={{ margin: 0, color: '#1C1917', fontWeight: 500 }}>
                    Let's see what it looks like for you.
                  </p>
                </div>

                {/* 4 Preview Pillars */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    marginBottom: '32px'
                  }}
                >
                  {[
                    { emoji: '🧠', title: 'Mind', sub: 'Thoughts & focus' },
                    { emoji: '💭', title: 'Feelings', sub: 'Emotional weight' },
                    { emoji: '🫀', title: 'Body', sub: 'Energy & physical state' },
                    { emoji: '🏃', title: 'Actions', sub: 'What you do or avoid' }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E7E5E4',
                        borderRadius: '14px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <span style={{ fontSize: '22px', marginBottom: '2px' }}>{item.emoji}</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>{item.title}</span>
                      <span style={{ fontSize: '12px', color: '#78716C', lineHeight: '1.35' }}>{item.sub}</span>
                    </div>
                  ))}
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
                    <span>Let’s explore</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 2: 4 DOMAIN SCREENS (Steps 1, 2, 3, 4) */}
            {/* ========================================================================= */}
            {currentStep >= 1 && currentStep <= 4 && (
              (() => {
                const domainIndex = currentStep - 1;
                const domain = FOUR_DOMAINS[domainIndex];
                const selectedList = symptomDomains[domain.id] || [];

                return (
                  <motion.div
                    key={`domain-${domain.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                  >
                    {/* Domain Header Card */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '10px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '24px',
                          backgroundColor: domain.themeBg,
                          border: `1px solid ${domain.themeBorder}`,
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {domain.emoji}
                      </span>
                      <div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color: domain.themeColor,
                            display: 'block'
                          }}
                        >
                          {domain.name}
                        </span>
                        <h2
                          style={{
                            fontFamily: 'Newsreader, Georgia, serif',
                            fontSize: 'clamp(20px, 5vw, 24px)',
                            fontWeight: 600,
                            color: '#1C1917',
                            margin: 0,
                            lineHeight: '1.25'
                          }}
                        >
                          {domain.question}
                        </h2>
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: '14px',
                        color: '#78716C',
                        margin: '0 0 18px 0'
                      }}
                    >
                      Select whatever applies right now. You can choose several or skip.
                    </p>

                    {/* Tappable Chips / Cards Grid */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '9px',
                        marginBottom: '24px'
                      }}
                    >
                      {domain.options.map((opt) => {
                        const isSelected = selectedList.includes(opt.id);

                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            onClick={() => handleToggleChip(domain.id, opt.id, opt.isNone)}
                            whileTap={{ scale: 0.985 }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              backgroundColor: isSelected ? '#FFFFFF' : '#FAF9F6',
                              border: isSelected
                                ? `2px solid ${domain.themeColor}`
                                : '1px solid #E7E5E4',
                              borderRadius: '14px',
                              padding: '14px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              boxShadow: isSelected
                                ? '0 3px 10px rgba(0,0,0,0.05)'
                                : '0 1px 2px rgba(0,0,0,0.02)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '15px',
                                fontWeight: isSelected ? 600 : 400,
                                color: isSelected ? '#1C1917' : '#44403C',
                                lineHeight: '1.35'
                              }}
                            >
                              {opt.label}
                            </span>

                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                border: isSelected
                                  ? `2px solid ${domain.themeColor}`
                                  : '1.5px solid #D6D3D1',
                                backgroundColor: isSelected ? domain.themeColor : 'transparent',
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

                    {/* Next Step CTA */}
                    <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                      <button
                        onClick={() => setCurrentStep((s) => s + 1)}
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
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <span>{currentStep === 4 ? 'See what this means' : 'Continue'}</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })()
            )}

            {/* ========================================================================= */}
            {/* SCREEN 3: PERSONAL INSIGHT */}
            {/* ========================================================================= */}
            {currentStep === 5 && (
              <motion.div
                key="step-5-insight"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#F5F0E8',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#78716C',
                    marginBottom: '14px',
                    width: 'fit-content'
                  }}
                >
                  <Compass size={13} />
                  <span>PERSONAL INSIGHT</span>
                </div>

                <h2
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: 'clamp(26px, 6vw, 30px)',
                    fontWeight: 600,
                    color: '#1C1917',
                    margin: '0 0 14px 0',
                    lineHeight: '1.25'
                  }}
                >
                  Here’s what you’re noticing.
                </h2>

                {/* Active Noticed Areas Badges */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '20px'
                  }}
                >
                  {domainEvaluation.activeAreas.length > 0 ? (
                    domainEvaluation.activeAreas.map((area) => (
                      <div
                        key={area.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E7E5E4',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#1C1917',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>{area.emoji}</span>
                        <span>{area.name.charAt(0) + area.name.slice(1).toLowerCase()}</span>
                        <span
                          style={{
                            backgroundColor: '#F5F0E8',
                            color: '#78716C',
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '999px'
                          }}
                        >
                          {area.count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E7E5E4',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        fontSize: '14px',
                        color: '#78716C'
                      }}
                    >
                      Taking a quiet moment to observe your current state.
                    </div>
                  )}
                </div>

                {/* Interconnections Copy Card */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E7E5E4',
                    borderRadius: '18px',
                    padding: '20px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}
                >
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#1C1917',
                      margin: '0 0 12px 0'
                    }}
                  >
                    Sometimes these things affect each other:
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      fontSize: '14.5px',
                      lineHeight: '1.55',
                      color: '#44403C'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <CornerDownRight size={17} color="#EA580C" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span><strong>Low energy</strong> can make everyday things feel much harder to start.</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <CornerDownRight size={17} color="#EA580C" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span><strong>Doing less</strong> can mean fewer things feel rewarding or satisfying.</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <CornerDownRight size={17} color="#EA580C" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span>And when you're feeling low, <strong>your thoughts can become harsher</strong> on you.</span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '16px',
                      paddingTop: '14px',
                      borderTop: '1px solid #F5F0E8',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#C2410C'
                    }}
                  >
                    None of this means you're lazy or failing.
                  </div>
                </div>

                {/* Safe reassurance note */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#78716C',
                    marginBottom: '24px'
                  }}
                >
                  <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
                  <span>This is a gentle self-check, not a clinical assessment or label.</span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  <button
                    onClick={() => setCurrentStep(6)}
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
                    <span>Continue</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 4: PRIMARY DIFFICULTY */}
            {/* ========================================================================= */}
            {currentStep === 6 && (
              <motion.div
                key="step-6-primary"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
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
                    marginBottom: '14px',
                    width: 'fit-content'
                  }}
                >
                  <Sparkles size={13} />
                  <span>PERSONALIZATION SIGNAL</span>
                </div>

                <h2
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: 'clamp(24px, 5.5vw, 28px)',
                    fontWeight: 600,
                    color: '#1C1917',
                    margin: '0 0 10px 0',
                    lineHeight: '1.25'
                  }}
                >
                  What gets in your way the most right now?
                </h2>

                <p
                  style={{
                    fontSize: '14.5px',
                    color: '#78716C',
                    margin: '0 0 20px 0'
                  }}
                >
                  Pick the one that feels most present. This helps us tailor your daily exercises.
                </p>

                {/* Single Select Difficulty Options */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '9px',
                    marginBottom: '20px'
                  }}
                >
                  {relevantPrimaryDifficulties.map((cand) => {
                    const isSelected = primaryDifficulty === cand.id;

                    return (
                      <motion.button
                        key={cand.id}
                        type="button"
                        onClick={() => {
                          setPrimaryDifficulty(cand.id);
                          trackAnalyticsEvent('primary_difficulty_selected', {
                            difficulty_id: cand.id
                          });
                        }}
                        whileTap={{ scale: 0.985 }}
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
                            ? '0 3px 10px rgba(234, 88, 12, 0.12)'
                            : '0 1px 2px rgba(0,0,0,0.02)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span
                          style={{
                            fontSize: '15px',
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? '#1C1917' : '#44403C',
                            lineHeight: '1.35'
                          }}
                        >
                          {cand.label}
                        </span>

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
                            marginLeft: '12px'
                          }}
                        >
                          {isSelected && (
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#FFFFFF'
                              }}
                            />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {primaryDifficulty && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      backgroundColor: '#FFF7ED',
                      border: '1px solid #FED7AA',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      fontSize: '14px',
                      color: '#9A3412',
                      marginBottom: '20px'
                    }}
                  >
                    Got it. We’ll keep this in mind as you move through Mantra 21.
                  </motion.div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  <button
                    onClick={() => setCurrentStep(7)}
                    disabled={!primaryDifficulty}
                    style={{
                      width: '100%',
                      backgroundColor: primaryDifficulty ? '#1C1917' : '#E7E5E4',
                      color: primaryDifficulty ? '#FFFFFF' : '#A8A29E',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: primaryDifficulty ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: primaryDifficulty ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
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
            {/* SCREEN 5: OPTIONAL REFLECTION */}
            {/* ========================================================================= */}
            {currentStep === 7 && (
              <motion.div
                key="step-7-reflection"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#F5F0E8',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#78716C',
                    marginBottom: '14px',
                    width: 'fit-content'
                  }}
                >
                  <Edit3 size={13} />
                  <span>OPTIONAL REFLECTION</span>
                </div>

                <h2
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: 'clamp(24px, 5.5vw, 28px)',
                    fontWeight: 600,
                    color: '#1C1917',
                    margin: '0 0 10px 0',
                    lineHeight: '1.25'
                  }}
                >
                  Want to put it into your own words?
                </h2>

                <p
                  style={{
                    fontSize: '14.5px',
                    color: '#78716C',
                    margin: '0 0 16px 0'
                  }}
                >
                  There's no pressure to write a lot. Just a sentence or two if it helps.
                </p>

                {/* Multiline input */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E7E5E4',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '20px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <label
                    htmlFor="reflection-input"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#A8A29E',
                      display: 'block',
                      marginBottom: '8px'
                    }}
                  >
                    Lately, I’ve noticed…
                  </label>
                  <textarea
                    id="reflection-input"
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="e.g., getting out of bed takes 3 alarms and everything feels heavy..."
                    rows={4}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      color: '#1C1917',
                      fontFamily: 'inherit',
                      backgroundColor: 'transparent',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <button
                    onClick={() => setCurrentStep(8)}
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
                    <span>{reflectionText.trim() ? 'Save reflection' : 'Continue'}</span>
                    <ArrowRight size={18} />
                  </button>

                  {!reflectionText.trim() && (
                    <button
                      onClick={() => setCurrentStep(8)}
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
                      Skip
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* FINAL SCREEN: COMPLETION */}
            {/* ========================================================================= */}
            {currentStep === 8 && (
              <motion.div
                key="step-8-completion"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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
                  <Check size={28} strokeWidth={2.5} />
                </div>

                <h1
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: 'clamp(26px, 6vw, 32px)',
                    fontWeight: 600,
                    lineHeight: '1.25',
                    color: '#1C1917',
                    margin: '0 0 14px 0',
                    letterSpacing: '-0.02em'
                  }}
                >
                  You just did something important: you noticed.
                </h1>

                <div
                  style={{
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: '#57534E',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '28px'
                  }}
                >
                  <p style={{ margin: 0 }}>
                    Depression can make everything feel like one big blur.
                  </p>
                  <p style={{ margin: 0 }}>
                    Breaking it down helps you see what’s actually happening, and that gives us somewhere to start.
                  </p>
                </div>

                {/* Next Activity Preview Card */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E7E5E4',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#EA580C',
                        letterSpacing: '0.04em',
                        display: 'block',
                        marginBottom: '3px'
                      }}
                    >
                      UP NEXT • ACTIVITY 3
                    </span>
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#1C1917'
                      }}
                    >
                      One Tiny Step
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#F5F0E8',
                      padding: '8px',
                      borderRadius: '10px',
                      color: '#78716C'
                    }}
                  >
                    <ChevronRight size={18} />
                  </div>
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
                    <span>{isSubmitting ? 'Saving...' : 'Continue'}</span>
                    <ArrowRight size={18} />
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
