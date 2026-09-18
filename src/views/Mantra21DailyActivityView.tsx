import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Check,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Play,
  Pause,
  AlertTriangle,
  Heart,
  Compass,
  Bookmark,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { getMantra21DayActivity, Mantra21DayActivity, Mantra21Step } from '../data/mantra21DayDefinitions';
import {
  logUserActivityToDB,
  saveUserLessonProgress,
  getUserLessonProgress,
  recordUserPersonalizationSignal
} from '../services/activityLogger';
import { goToLesson, goToDashboard } from '../mantra/navigation';
import { completeLesson } from '../mantra/api';
import { getActiveUserId } from '../services/authService';

interface Mantra21DailyActivityViewProps {
  dayNumber?: number;
  activityId?: string;
  onBack?: () => void;
  onNavigate?: (route: string) => void;
  service?: string;
}

// Mood scale for before/after reflection
const MOOD_OPTIONS = [
  { value: 'much_worse', label: 'Much worse', emoji: '🌧️' },
  { value: 'little_worse', label: 'A little worse', emoji: '☁️' },
  { value: 'about_same', label: 'About the same', emoji: '⛅' },
  { value: 'little_better', label: 'A little better', emoji: '🌤️' },
  { value: 'much_better', label: 'Much better', emoji: '☀️' }
];

export const Mantra21DailyActivityView: React.FC<Mantra21DailyActivityViewProps> = ({
  dayNumber = 1,
  activityId,
  onBack,
  onNavigate
}) => {
  // Load activity definition based on dayNumber
  const activityData: Mantra21DayActivity = useMemo(() => {
    return getMantra21DayActivity(dayNumber);
  }, [dayNumber]);

  const totalSteps = activityData.steps.length;

  // Step state management
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [hasResumed, setHasResumed] = useState<boolean>(false);
  const [resumePromptOpen, setResumePromptOpen] = useState<boolean>(false);

  // User interactive state
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [customInputText, setCustomInputText] = useState<string>('');
  const [moodAfter, setMoodAfter] = useState<string>('about_same');
  const [reflectionNote, setReflectionNote] = useState<string>('');

  // Action Mode Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(120);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Submitting / Safety state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCrisisDetected, setIsCrisisDetected] = useState<boolean>(false);
  const [showSyncError, setShowSyncError] = useState<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());
  const initialLoadRef = useRef<boolean>(false);

  const currentStep: Mantra21Step = activityData.steps[currentStepIndex] || activityData.steps[0];

  // 1. Resume / Load saved progress on Mount
  useEffect(() => {
    async function loadProgress() {
      if (initialLoadRef.current) return;
      initialLoadRef.current = true;

      try {
        const userId = getActiveUserId();
        const saved = await getUserLessonProgress(activityData.activityId, userId);

        if (saved && saved.current_step > 0 && saved.current_step < totalSteps - 1) {
          setResumePromptOpen(true);
          if (saved.response_data) {
            if (saved.response_data.selectedOptionIds) setSelectedOptionIds(saved.response_data.selectedOptionIds);
            if (saved.response_data.selectedAction) setSelectedAction(saved.response_data.selectedAction);
            if (saved.response_data.moodAfter) setMoodAfter(saved.response_data.moodAfter);
            if (saved.response_data.reflectionNote) setReflectionNote(saved.response_data.reflectionNote);
          }
        }
      } catch (err) {
        console.warn('[Mantra21DailyActivity] Error fetching progress:', err);
      }
    }

    loadProgress();
  }, [activityData.activityId, totalSteps]);

  // Timer Tick
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timerSeconds]);

  // Safety keyword detector for crisis intervention
  const checkSafetyKeywords = (text: string) => {
    const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'self-harm', 'don\'t want to live', 'cut myself', 'hanging myself'];
    const lower = text.toLowerCase();
    const hit = crisisKeywords.some((k) => lower.includes(k));
    if (hit) {
      setIsCrisisDetected(true);
    }
    return hit;
  };

  // Save progress on step transitions
  const persistCurrentProgress = async (nextStepIdx: number) => {
    try {
      const userId = getActiveUserId();
      await saveUserLessonProgress({
        userId,
        lessonId: activityData.activityId,
        currentStep: nextStepIdx,
        totalSteps,
        actionDone: selectedAction || undefined,
        responseData: {
          selectedOptionIds,
          selectedAction,
          moodAfter,
          reflectionNote,
          dayNumber: activityData.dayNumber
        }
      });
    } catch (e) {
      console.warn('[Mantra21DailyActivity] Non-blocking progress save error:', e);
    }
  };

  // Next Step Transition
  const handleNextStep = async () => {
    if (currentStepIndex < totalSteps - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await persistCurrentProgress(nextIdx);
    } else {
      await handleCompleteActivity();
    }
  };

  // Previous Step Transition
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('/challenges');
    }
  };

  // Final Activity Completion & Persistence
  const handleCompleteActivity = async () => {
    setIsSubmitting(true);
    setShowSyncError(false);

    const userId = getActiveUserId();
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const completionPayload = {
      userId,
      activityId: activityData.activityId,
      activityType: 'challenge_daily_practice',
      lessonId: activityData.activityId,
      resultSummary: {
        dayNumber: activityData.dayNumber,
        activityTitle: activityData.title,
        selectedOptionIds,
        selectedAction,
        moodAfter,
        reflectionNote,
        durationSeconds,
        completedAt: new Date().toISOString()
      },
      metadata: {
        challengeId: 'mantra_21',
        dayNumber: activityData.dayNumber,
        category: activityData.themeCategory
      }
    };

    try {
      // 1. Log completion to DB
      await logUserActivityToDB(completionPayload);

      // 2. Complete in Laravel Webhook if applicable
      await completeLesson(activityData.activityId);

      // 3. Emit deterministic personalization signals if present
      if (currentStep.signalOnSelect) {
        for (const optId of selectedOptionIds) {
          const signal = currentStep.signalOnSelect[optId];
          if (signal) {
            await recordUserPersonalizationSignal({
              userId,
              pathwayId: 'mantra_21',
              signal,
              strength: 1.0,
              sourceType: 'activity',
              sourceId: activityData.activityId
            });
          }
        }
      }

      // 4. Save completed flag in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`mantra21_day_${activityData.dayNumber}_completed_${userId}`, 'true');
        window.dispatchEvent(new CustomEvent('mantra21-activity-completed', { detail: { dayNumber: activityData.dayNumber } }));
      }
    } catch (error) {
      console.warn('[Mantra21DailyActivity] Sync warning:', error);
      setShowSyncError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Crisis Intervention Modal
  if (isCrisisDetected) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#070D18',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '32px',
            textAlign: 'center'
          }}
        >
          <AlertTriangle size={48} color="#F87171" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>We are here for you</h2>
          <p style={{ fontSize: '15px', color: '#E2E8F0', lineHeight: 1.6, marginBottom: '24px' }}>
            It sounds like things are really heavy right now. Please know that you do not have to carry this alone. Free, confidential support is available 24/7.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a
              href="tel:988"
              style={{
                display: 'block',
                padding: '14px',
                borderRadius: '12px',
                background: '#EF4444',
                color: '#FFFFFF',
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              CALL 988 (LIFELINE)
            </a>
            <button
              onClick={() => setIsCrisisDetected(false)}
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'transparent',
                border: '1px solid #475569',
                color: '#94A3B8',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Return to Activity
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAFBFD',
        color: '#090D16',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        position: 'relative',
        overflowX: 'hidden',
        paddingBottom: '120px'
      }}
    >
      {/* ─── 1. TOP MINIMAL CALM PROGRESS HEADER ─── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(250, 251, 253, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #F1F5F9',
          padding: '12px 20px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)'
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Back button */}
          <button
            onClick={handlePrevStep}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: '8px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          {/* Calm Step Indicator: e.g. "DAY 01 • STEP 2 OF 6" */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#0284C7', textTransform: 'uppercase' }}>
              DAY {String(activityData.dayNumber).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#94A3B8' }}>
              Step {currentStepIndex + 1} of {totalSteps}
            </div>
          </div>

          {/* Time estimate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94A3B8', fontSize: '12px', fontWeight: 600 }}>
            <Clock size={13} />
            <span>~{activityData.durationMinutes} min</span>
          </div>
        </div>

        {/* Subtle top progress track */}
        <div
          style={{
            maxWidth: '680px',
            margin: '8px auto 0 auto',
            height: '3px',
            background: '#E2E8F0',
            borderRadius: '999px',
            overflow: 'hidden'
          }}
        >
          <motion.div
            animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #0284C7, #38BDF8)',
              borderRadius: '999px'
            }}
          />
        </div>
      </header>

      {/* ─── 2. RESUME BANNER (IF RESUMED) ─── */}
      <AnimatePresence>
        {resumePromptOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              maxWidth: '680px',
              margin: '16px auto 0 auto',
              padding: '12px 20px',
              background: '#F0F9FF',
              border: '1px solid #BAE6FD',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0369A1' }}>Welcome back.</div>
              <div style={{ fontSize: '12px', color: '#0C4A6E' }}>You're partway through today's practice.</div>
            </div>
            <button
              onClick={() => {
                setResumePromptOpen(false);
                setHasResumed(true);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#0284C7',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Continue →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 3. CORE FOCUSED STEP CANVAS ─── */}
      <main
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '32px 20px 0 20px'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {/* ── STEP KIND 1: ARRIVE ── */}
            {currentStep.kind === 'arrive' && (
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: '#F0F9FF',
                    color: '#0284C7',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: '16px'
                  }}
                >
                  <Compass size={13} />
                  <span>{currentStep.badge || `DAY ${String(activityData.dayNumber).padStart(2, '0')}`}</span>
                </div>

                <h1
                  style={{
                    fontSize: 'clamp(28px, 5vw, 36px)',
                    fontWeight: 950,
                    color: '#090D16',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                    margin: '0 0 12px 0'
                  }}
                >
                  {currentStep.title || activityData.title}
                </h1>

                {currentStep.subtitle && (
                  <p
                    style={{
                      fontSize: '17px',
                      color: '#475569',
                      lineHeight: 1.55,
                      fontWeight: 500,
                      margin: '0 0 24px 0'
                    }}
                  >
                    {currentStep.subtitle}
                  </p>
                )}

                {currentStep.contextText && (
                  <div
                    style={{
                      padding: '20px 24px',
                      borderRadius: '16px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 20px -8px rgba(0,0,0,0.05)',
                      fontSize: '15px',
                      color: '#334155',
                      lineHeight: 1.6,
                      marginBottom: '36px'
                    }}
                  >
                    {currentStep.contextText}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP KIND 2: LEARN ── */}
            {currentStep.kind === 'learn' && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    color: '#64748B',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}
                >
                  {currentStep.title || 'WHY THIS HAPPENS'}
                </div>

                {currentStep.subtitle && (
                  <h2
                    style={{
                      fontSize: '24px',
                      fontWeight: 900,
                      color: '#090D16',
                      letterSpacing: '-0.02em',
                      margin: '0 0 24px 0',
                      lineHeight: 1.25
                    }}
                  >
                    {currentStep.subtitle}
                  </h2>
                )}

                {currentStep.teachPoints?.map((pt, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '24px',
                      borderRadius: '18px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      marginBottom: '16px',
                      boxShadow: '0 4px 16px -6px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#090D16', marginBottom: '8px' }}>
                      {pt.heading}
                    </div>
                    <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '0 0 10px 0' }}>
                      {pt.body}
                    </p>
                    {pt.subtext && (
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0284C7', letterSpacing: '0.02em' }}>
                        {pt.subtext}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP KIND 3: INTERACT (MULTI-SELECT / SINGLE / ACTION SELECTOR) ── */}
            {currentStep.kind === 'interact' && (
              <div>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#090D16',
                    letterSpacing: '-0.02em',
                    margin: '0 0 8px 0',
                    lineHeight: 1.25
                  }}
                >
                  {currentStep.title}
                </h2>

                {currentStep.subtitle && (
                  <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                    {currentStep.subtitle}
                  </p>
                )}

                {/* Option list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                  {currentStep.options?.map((opt) => {
                    const isSelected =
                      currentStep.interactionType === 'action_selector'
                        ? selectedAction === opt.label
                        : selectedOptionIds.includes(opt.id);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (currentStep.interactionType === 'action_selector') {
                            setSelectedAction(opt.label);
                          } else if (currentStep.interactionType === 'single_choice') {
                            setSelectedOptionIds([opt.id]);
                          } else {
                            // Multi-choice
                            if (isSelected) {
                              setSelectedOptionIds(selectedOptionIds.filter((id) => id !== opt.id));
                            } else {
                              const max = currentStep.maxSelections || 5;
                              if (selectedOptionIds.length < max) {
                                setSelectedOptionIds([...selectedOptionIds, opt.id]);
                              } else {
                                setSelectedOptionIds([...selectedOptionIds.slice(1), opt.id]);
                              }
                            }
                          }
                        }}
                        style={{
                          padding: '16px 20px',
                          borderRadius: '16px',
                          background: isSelected ? '#F0F9FF' : '#FFFFFF',
                          border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 4px 16px -4px rgba(2, 132, 199, 0.15)' : 'none'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          {opt.category && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                letterSpacing: '0.08em',
                                color: isSelected ? '#0284C7' : '#94A3B8',
                                textTransform: 'uppercase',
                                display: 'block',
                                marginBottom: '2px'
                              }}
                            >
                              {opt.category}
                            </span>
                          )}
                          <div style={{ fontSize: '15px', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#090D16' : '#1E293B' }}>
                            {opt.label}
                          </div>
                          {opt.description && (
                            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                              {opt.description}
                            </div>
                          )}
                        </div>

                        {/* Selection check indicator */}
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: isSelected ? 'none' : '2px solid #CBD5E1',
                            background: isSelected ? '#0284C7' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP KIND 4: DO (REAL-WORLD ACTION) ── */}
            {currentStep.kind === 'do' && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    color: '#0284C7',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}
                >
                  REAL-WORLD ACTION
                </div>

                <h2
                  style={{
                    fontSize: '26px',
                    fontWeight: 950,
                    color: '#090D16',
                    letterSpacing: '-0.02em',
                    margin: '0 0 12px 0'
                  }}
                >
                  {currentStep.title || 'TAKE YOUR TIME.'}
                </h2>

                <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                  {selectedAction ? `Your action: "${selectedAction}"` : currentStep.subtitle}
                </p>

                {/* Optional calming timer */}
                {currentStep.allowTimer && (
                  <div
                    style={{
                      padding: '24px',
                      borderRadius: '20px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      textAlign: 'center',
                      marginBottom: '28px',
                      boxShadow: '0 8px 24px -8px rgba(0,0,0,0.06)'
                    }}
                  >
                    <div style={{ fontSize: '38px', fontWeight: 900, color: '#090D16', fontFamily: 'monospace', marginBottom: '12px' }}>
                      {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '12px',
                          background: isTimerRunning ? '#F1F5F9' : '#090D16',
                          color: isTimerRunning ? '#090D16' : '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 800,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isTimerRunning ? <Pause size={15} /> : <Play size={15} />}
                        <span>{isTimerRunning ? 'PAUSE' : 'START CALM TIMER'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSeconds(currentStep.defaultTimerSeconds || 120);
                        }}
                        style={{
                          padding: '10px',
                          borderRadius: '12px',
                          background: '#F1F5F9',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer'
                        }}
                      >
                        <RotateCcw size={15} />
                      </button>
                    </div>
                  </div>
                )}

                <p style={{ fontSize: '14px', color: '#64748B', textAlign: 'center', margin: '0 0 24px 0' }}>
                  {currentStep.actionPrompt || 'We will wait right here. Tap below when you return.'}
                </p>
              </div>
            )}

            {/* ── STEP KIND 5: REFLECT (BEFORE / AFTER & NEUTRAL NOTE) ── */}
            {currentStep.kind === 'reflect' && (
              <div>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#090D16',
                    letterSpacing: '-0.02em',
                    margin: '0 0 8px 0'
                  }}
                >
                  {currentStep.title || 'HOW DO YOU FEEL NOW?'}
                </h2>

                <p style={{ fontSize: '15px', color: '#64748B', margin: '0 0 24px 0' }}>
                  {currentStep.subtitle || 'Every state is okay. Notice whatever is present.'}
                </p>

                {/* Mood Scale */}
                {currentStep.showMoodDelta && (
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                      {MOOD_OPTIONS.map((opt) => {
                        const isSelected = moodAfter === opt.value;
                        return (
                          <div
                            key={opt.value}
                            onClick={() => setMoodAfter(opt.value)}
                            style={{
                              padding: '12px 6px',
                              borderRadius: '14px',
                              background: isSelected ? '#F0F9FF' : '#FFFFFF',
                              border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{opt.emoji}</div>
                            <div style={{ fontSize: '11px', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#0369A1' : '#64748B' }}>
                              {opt.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Optional Reflection Box */}
                {currentStep.reflectionQuestion && (
                  <div style={{ marginBottom: '28px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
                      {currentStep.reflectionQuestion}
                      {currentStep.optionalReflection && (
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', marginLeft: '6px' }}>
                          (Optional)
                        </span>
                      )}
                    </label>
                    <textarea
                      value={reflectionNote}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReflectionNote(val);
                        checkSafetyKeywords(val);
                      }}
                      placeholder={currentStep.reflectionPlaceholder || 'Share a brief reflection...'}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '14px',
                        border: '1px solid #CBD5E1',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        color: '#090D16',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── STEP KIND 6: COMPLETE (CALM MILESTONE) ── */}
            {currentStep.kind === 'complete' && (
              <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #0284C7, #38BDF8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto',
                    boxShadow: '0 12px 32px -8px rgba(2, 132, 199, 0.35)'
                  }}
                >
                  <Check size={36} color="#FFFFFF" strokeWidth={3} />
                </motion.div>

                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    color: '#0284C7',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}
                >
                  {currentStep.badge || `DAY ${String(activityData.dayNumber).padStart(2, '0')} COMPLETE`}
                </div>

                <h1
                  style={{
                    fontSize: '32px',
                    fontWeight: 950,
                    color: '#090D16',
                    letterSpacing: '-0.03em',
                    margin: '0 0 12px 0'
                  }}
                >
                  {currentStep.title || 'You showed up.'}
                </h1>

                <p style={{ fontSize: '16px', color: '#475569', maxWidth: '420px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
                  {currentStep.subtitle || 'That is one more step forward in your journey.'}
                </p>

                {/* Tiny Win Card */}
                {activityData.tinyWinTemplate && (
                  <div
                    style={{
                      maxWidth: '440px',
                      margin: '0 auto 36px auto',
                      padding: '20px',
                      borderRadius: '16px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 8px 24px -6px rgba(0,0,0,0.04)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      {activityData.tinyWinTemplate.title}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#090D16' }}>
                      {activityData.tinyWinTemplate.format({ selectedActionText: selectedAction })}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px' }}>
                      Small counts.
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── 4. BOTTOM ACTION CONTROL BAR ─── */}
        <div style={{ marginTop: '36px' }}>
          {currentStep.kind === 'complete' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  goToDashboard();
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  background: '#090D16',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px -6px rgba(9, 13, 22, 0.35)'
                }}
              >
                <span>BACK TO MY JOURNEY →</span>
              </button>
            </div>
          ) : (
            <button
              disabled={isSubmitting}
              onClick={handleNextStep}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                background: '#090D16',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 900,
                letterSpacing: '0.04em',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px -6px rgba(9, 13, 22, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{currentStep.kind === 'do' ? "I'M BACK →" : currentStepIndex === totalSteps - 2 ? 'COMPLETE TODAY →' : 'CONTINUE →'}</span>
            </button>
          )}

          {showSyncError && (
            <div style={{ fontSize: '12px', color: '#EF4444', textAlign: 'center', marginTop: '12px' }}>
              Progress saved locally. Will sync to server when connection stabilizes.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Mantra21DailyActivityView;
