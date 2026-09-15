import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';
import {
  CONCERNS,
  STEP1_CONCERN_KEYS,
  MANUAL_CHANGE_FOCUS_KEYS,
  ALL_SUPPORTED_CONCERN_KEYS,
  SCREEN2_QUESTIONS,
  DESIRED_OUTCOMES,
  THERAPY_PATHWAY_MAP,
  THERAPY_SERVICE_ID,
  CONCERN_KEY_TO_PATHWAY_ID,
  evaluateFocusAssessment
} from '../../utils/focusAssessmentEngine';
import { assignPathway } from '../../mantra/api';
import { handleExit } from '../../mantra/navigation';
import { CalmAtmosphereVisual } from './CalmAtmosphereVisual';

const STORAGE_KEY = 'mantra_focus_assessment_draft_v4';

// Human progress configuration
const STEP_LABELS = [
  'Getting to know you',
  'Understanding what you need',
  'Looking ahead'
];

export function PersonalizedFocusWizard({ onComplete }) {
  const shouldReduceMotion = useReducedMotion();

  // Step index:
  // -1 = Emotional Welcome / Intro Screen
  //  0 = Step 1 (Primary Concern)
  //  1 = Step 2 (Contextual Signal)
  //  2 = Step 3 (Desired Outcome)
  //  3 = Result Screen (Your Starting Point)
  const [step, setStep] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.result) return 3;
        if (parsed.selectedConcern) {
          if (parsed.desiredOutcomeId) return 2;
          if (parsed.screen2OptionId) return 1;
          return 0;
        }
      }
    } catch (e) {}
    return -1; // Default to gentle welcome screen
  });

  const [selectedConcern, setSelectedConcern] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).selectedConcern || null : null;
    } catch (e) {
      return null;
    }
  });

  const [selectedFocusLabel, setSelectedFocusLabel] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedFocusLabel) return parsed.selectedFocusLabel;
        if (parsed.result?.concernLabel) return parsed.result.concernLabel;
        if (parsed.selectedConcern && CONCERNS[parsed.selectedConcern]) {
          return CONCERNS[parsed.selectedConcern].label;
        }
      }
    } catch (e) {}
    return null;
  });

  const [screen2OptionId, setScreen2OptionId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).screen2OptionId || null : null;
    } catch (e) {
      return null;
    }
  });

  const [customText, setCustomText] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).customText || '' : '';
    } catch (e) {
      return '';
    }
  });

  const [desiredOutcomeId, setDesiredOutcomeId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).desiredOutcomeId || null : null;
    } catch (e) {
      return null;
    }
  });

  const [evaluationResult, setEvaluationResult] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).result || null : null;
    } catch (e) {
      return null;
    }
  });

  const [showChangeFocusModal, setShowChangeFocusModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Sync draft state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedConcern,
          selectedFocusLabel,
          screen2OptionId,
          customText,
          desiredOutcomeId,
          result: evaluationResult
        })
      );
    } catch (e) {}
  }, [selectedConcern, selectedFocusLabel, screen2OptionId, customText, desiredOutcomeId, evaluationResult]);

  // Handle Intro CTA
  const handleStartIntro = () => {
    setStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 1 Selection Handler (with gentle conversational transition)
  const handleSelectScreen1 = (concernKey) => {
    setSelectedConcern(concernKey);
    if (selectedConcern !== concernKey) {
      setScreen2OptionId(null);
    }
    setTimeout(() => {
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 280);
  };

  // Step 2 Selection Handler (with gentle conversational transition)
  const handleSelectScreen2 = (optId) => {
    setScreen2OptionId(optId);
    setTimeout(() => {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 280);
  };

  // Step 3 Selection Handler (Evaluate & Transition to Result Screen)
  // NOTE: Webhook is NOT called here. It will be called ONLY on final CTA click.
  const handleSelectScreen3 = (outcomeId) => {
    setDesiredOutcomeId(outcomeId);

    const answers = {
      selectedConcern: selectedConcern || 'depression',
      screen2OptionId: screen2OptionId || '',
      customText: customText.trim(),
      desiredOutcomeId: outcomeId
    };

    // Calculate deterministic canonical concern
    const evaluated = evaluateFocusAssessment(answers);
    setEvaluationResult(evaluated);
    setSelectedConcern(evaluated.concernKey);
    setSelectedFocusLabel(evaluated.concernLabel);
    setSubmissionError(null);

    setTimeout(() => {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 320);
  };

  // Manual Focus Change Handler (Modal selection)
  // Updates the state immediately so result screen shows new focus.
  // NOTE: Webhook is NOT called here. It will be called ONLY on final CTA click.
  const handleManualSelectFocus = (concernKey) => {
    const c = CONCERNS[concernKey];
    if (!c) return;

    setShowChangeFocusModal(false);
    setSelectedConcern(concernKey);
    setSelectedFocusLabel(c.label);
    setScreen2OptionId(null);
    setDesiredOutcomeId(null);
    setSubmissionError(null);

    const evaluated = evaluateFocusAssessment({
      selectedConcern: concernKey,
      screen2OptionId: '',
      desiredOutcomeId: 'feel_calmer'
    });

    setEvaluationResult(evaluated);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final CTA Handler: Dispatches assign_pathway webhook with the final selected focus
  const handleStart21DayPlan = async () => {
    if (isAssigning) return;

    const currentFocusLabel = selectedFocusLabel || evaluationResult?.concernLabel;
    const pathwayId =
      (currentFocusLabel && THERAPY_PATHWAY_MAP[currentFocusLabel]) ||
      (selectedConcern && CONCERN_KEY_TO_PATHWAY_ID[selectedConcern]);

    if (!pathwayId) {
      console.error('[Focus Assessment] No pathway mapping found for focus:', currentFocusLabel, selectedConcern);
      setSubmissionError('Please select a valid focus to start your plan.');
      return;
    }

    setIsAssigning(true);
    setSubmissionError(null);

    try {
      const res = await assignPathway(pathwayId, THERAPY_SERVICE_ID);

      if (!res.success) {
        setSubmissionError(res.error || 'Failed to assign pathway. Please retry.');
        setIsAssigning(false);
        return;
      }

      setIsAssigning(false);

      if (onComplete) {
        onComplete();
      } else {
        handleExit();
      }
    } catch (err) {
      console.error('[Focus Assessment] Webhook error:', err);
      setSubmissionError(err?.message || 'Connection failed. Please retry.');
      setIsAssigning(false);
    }
  };

  const handleChangeFocus = () => {
    setShowChangeFocusModal(true);
  };

  // Common Card Animation Variant
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.06
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }
  };

  // =========================================================================
  // RENDER INTRO SCREEN: GENTLE EMOTIONAL WELCOME (CONCISE & VISUAL)
  // =========================================================================
  if (step === -1) {
    return (
      <div
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          boxSizing: 'border-box',
          padding: 'clamp(12px, 2vh, 28px) clamp(16px, 4vw, 24px) clamp(24px, 4vh, 40px)'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}
        >
          {/* Intro Mental Health Illustration */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: 'clamp(180px, 48vw, 250px)',
              marginBottom: 'clamp(12px, 2vh, 20px)'
            }}
          >
            <img
              src="https://res.cloudinary.com/hxbamdqf/image/upload/v1788516103/graphic_2_er8a3u.png"
              alt="Welcome illustration"
              style={{
                width: '100%',
                maxWidth: 'clamp(180px, 48vw, 250px)',
                height: 'auto',
                maxHeight: 'clamp(150px, 24vh, 210px)',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
              loading="eager"
            />
          </motion.div>

          {/* Framing Copy */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 'clamp(6px, 1.2vh, 10px)',
              width: '100%'
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#2563eb'
              }}
            >
              A QUICK START
            </span>

            <h1
              style={{
                fontSize: 'clamp(1.75rem, 5vw, 2.3rem)',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.18,
                letterSpacing: '-0.025em',
                margin: 0
              }}
            >
              Let’s start with you.
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 3.2vw, 1.12rem)',
                color: '#334155',
                lineHeight: 1.45,
                fontWeight: 500,
                margin: '2px auto 0'
              }}
            >
              Tell us what’s been going on.
            </p>

            <p
              style={{
                fontSize: 'clamp(0.86rem, 2.6vw, 0.94rem)',
                color: '#64748b',
                lineHeight: 1.4,
                fontWeight: 500,
                margin: '0 auto'
              }}
            >
              No right or wrong answers.
            </p>
          </motion.div>

          {/* Action Button & Time Estimate */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.16 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              maxWidth: '320px',
              marginTop: 'clamp(18px, 2.8vh, 28px)'
            }}
          >
            <button
              type="button"
              onClick={handleStartIntro}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: 'clamp(13px, 1.8vh, 16px) clamp(24px, 5vw, 32px)',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: 'clamp(0.96rem, 3vw, 1.05rem)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.24)',
                transition: 'all 0.18s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.32)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.24)';
              }}
            >
              <span>Let’s begin →</span>
            </button>

            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>
              About 2 minutes
            </span>
          </motion.div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER RESULT SCREEN: CALM STARTING POINT
  // =========================================================================
  if (step === 3 && evaluationResult) {
    return (
      <div
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          boxSizing: 'border-box',
          padding: 'clamp(10px, 1.8vh, 24px) clamp(16px, 4vw, 24px) clamp(24px, 4vh, 40px)'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}
        >
          {/* Mental Health Hero Character Illustration - Enlarged */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: 'clamp(210px, 56vw, 300px)',
              marginBottom: 'clamp(8px, 1.5vh, 16px)'
            }}
          >
            <img
              src="https://res.cloudinary.com/hxbamdqf/image/upload/v1788515757/graphic_1_und38o.png"
              alt="Wellness illustration"
              style={{
                width: '100%',
                maxWidth: 'clamp(210px, 56vw, 300px)',
                height: 'auto',
                maxHeight: 'clamp(170px, 28vh, 250px)',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
              loading="eager"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 'clamp(3px, 0.8vh, 6px)',
              width: '100%'
            }}
          >
            {/* Eyebrow */}
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#2563eb'
              }}
            >
              YOUR STARTING POINT
            </span>

            {/* Main Emotional Headline */}
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: '2px 0 0',
                lineHeight: 1.2
              }}
            >
              Let's work on this together.
            </h1>

            {/* Exact Canonical Concern Label */}
            <div
              style={{
                fontSize: 'clamp(1.85rem, 5vw, 2.5rem)',
                fontWeight: 800,
                color: '#1e40af',
                letterSpacing: '-0.025em',
                marginTop: '4px',
                lineHeight: 1.15
              }}
            >
              {selectedFocusLabel || evaluationResult?.concernLabel || ''}
            </div>

            {/* Supporting Copy */}
            <p
              style={{
                fontSize: 'clamp(0.92rem, 2.8vw, 1rem)',
                color: '#475569',
                maxWidth: '440px',
                margin: '6px auto 0',
                lineHeight: 1.5
              }}
            >
              Based on what you shared, this is where we'll begin.
            </p>
          </motion.div>

          {/* Error notification if webhook failed */}
          {submissionError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.86rem',
                marginTop: '10px'
              }}
            >
              <AlertCircle size={16} />
              <span>{submissionError}</span>
            </div>
          )}

          {/* Action Area */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.12 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              maxWidth: '380px',
              marginTop: 'clamp(14px, 2.2vh, 20px)'
            }}
          >
            {/* Primary CTA */}
            <button
              type="button"
              onClick={handleStart21DayPlan}
              disabled={isAssigning}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: 'clamp(12px, 1.8vh, 16px) clamp(22px, 4.5vw, 28px)',
                borderRadius: '9999px',
                border: 'none',
                background: isAssigning
                  ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: 'clamp(0.95rem, 3vw, 1.05rem)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isAssigning ? 'not-allowed' : 'pointer',
                boxShadow: isAssigning ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                if (!isAssigning) e.currentTarget.style.background = '#1d4ed8';
              }}
              onMouseOut={(e) => {
                if (!isAssigning) e.currentTarget.style.background = '#2563eb';
              }}
            >
              <span>{isAssigning ? 'Starting your plan...' : 'Start my 21-day plan →'}</span>
            </button>

            {/* Optional Secondary Action */}
            <button
              type="button"
              onClick={handleChangeFocus}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 14px',
                transition: 'color 0.15s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              Not quite right? Change my focus
            </button>
          </motion.div>
        </div>

        {/* Change Focus Modal */}
        <AnimatePresence>
          {showChangeFocusModal && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100dvh',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(12px, 3vh, 24px) 16px',
                boxSizing: 'border-box'
              }}
              onClick={() => setShowChangeFocusModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  width: '100%',
                  maxWidth: '460px',
                  maxHeight: 'min(86vh, 620px)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(15, 23, 42, 0.08)',
                  textAlign: 'left',
                  boxSizing: 'border-box'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Fixed Modal Header */}
                <div
                  style={{
                    padding: '20px 20px 14px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    flexShrink: 0,
                    background: '#ffffff',
                    boxSizing: 'border-box',
                    width: '100%'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 'clamp(1.2rem, 4vw, 1.35rem)',
                        fontWeight: 800,
                        color: '#0f172a',
                        margin: 0,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.25,
                        flex: '1 1 auto',
                        minWidth: 0,
                        textAlign: 'left'
                      }}
                    >
                      Choose your focus
                    </h3>

                    <button
                      type="button"
                      onClick={() => setShowChangeFocusModal(false)}
                      aria-label="Close"
                      style={{
                        width: '36px',
                        height: '36px',
                        minWidth: '36px',
                        maxWidth: '36px',
                        minHeight: '36px',
                        maxHeight: '36px',
                        flexShrink: 0,
                        flexGrow: 0,
                        borderRadius: '50%',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        color: '#64748b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'background-color 0.15s ease, color 0.15s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#0f172a';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.color = '#64748b';
                      }}
                    >
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </div>

                  <p
                    style={{
                      width: '100%',
                      fontSize: '0.88rem',
                      color: '#64748b',
                      margin: 0,
                      fontWeight: 500,
                      lineHeight: 1.45,
                      textAlign: 'left',
                      boxSizing: 'border-box'
                    }}
                  >
                    Select the focus that best fits your needs.
                  </p>
                </div>

                {/* Scrollable Focus Options List (Exactly 10 Options, No 'Other Concerns') */}
                <div
                  style={{
                    padding: '14px 18px 18px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'thin',
                    flex: 1,
                    boxSizing: 'border-box',
                    width: '100%'
                  }}
                >
                  {MANUAL_CHANGE_FOCUS_KEYS.map((key) => {
                    const c = CONCERNS[key];
                    const isCurrent = evaluationResult.concernKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleManualSelectFocus(key)}
                        style={{
                          width: '100%',
                          minHeight: '48px',
                          padding: '12px 16px',
                          borderRadius: '14px',
                          border: isCurrent ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: isCurrent
                            ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                            : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          textAlign: 'left',
                          boxShadow: isCurrent
                            ? '0 2px 8px rgba(37, 99, 235, 0.12)'
                            : '0 1px 2px rgba(15, 23, 42, 0.02)',
                          transition: 'all 0.14s ease',
                          outline: 'none',
                          boxSizing: 'border-box',
                          gap: '12px'
                        }}
                        onMouseOver={(e) => {
                          if (!isCurrent) {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isCurrent) {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.96rem',
                            fontWeight: isCurrent ? 700 : 600,
                            color: isCurrent ? '#1e40af' : '#1e293b',
                            lineHeight: 1.35
                          }}
                        >
                          {c.label}
                        </span>

                        {isCurrent && (
                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Check size={13} color="#ffffff" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // =========================================================================
  // RENDER ASSESSMENT STEPS 1–3
  // =========================================================================
  const progressPercentage = Math.round(((step + 1) / 3) * 100);
  const currentAtmosphereMode = step === 0 ? 'step1' : step === 1 ? 'step2' : 'step3';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '740px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px) 80px',
        boxSizing: 'border-box'
      }}
    >
      {/* Human Progress Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          marginBottom: '28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#475569',
              letterSpacing: '-0.01em'
            }}
          >
            {STEP_LABELS[step]}
          </span>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#94a3b8'
            }}
          >
            {step + 1} of 3
          </span>
        </div>

        {/* Human Progress Track */}
        <div
          style={{
            width: '100%',
            height: '4px',
            background: 'rgba(226, 232, 240, 0.8)',
            borderRadius: '999px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '999px',
              width: `${progressPercentage}%`,
              transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>
      </div>

      {/* Main Adaptive Question Area */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="screen1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              width: '100%'
            }}
          >
            {/* Ambient Header with Subtle Organic Visual */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <h1
                  style={{
                    fontSize: 'clamp(1.45rem, 4vw, 1.95rem)',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.26,
                    letterSpacing: '-0.025em',
                    margin: 0
                  }}
                >
                  What would you most like help with right now?
                </h1>
                <p
                  style={{
                    fontSize: '0.96rem',
                    color: '#64748b',
                    fontWeight: 500,
                    lineHeight: 1.5,
                    margin: 0
                  }}
                >
                  You don't need to find the perfect words. Just choose what feels closest.
                </p>
              </div>

              <div style={{ display: 'none', md: 'block' }}>
                <CalmAtmosphereVisual mode={currentAtmosphereMode} size={64} />
              </div>
            </div>

            {/* Exactly 8 Supported Assessment Concern Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}
            >
              {STEP1_CONCERN_KEYS.map((key) => {
                const concern = CONCERNS[key];
                const isSelected = selectedConcern === concern.key;
                return (
                  <motion.button
                    key={concern.key}
                    variants={itemVariants}
                    type="button"
                    onClick={() => handleSelectScreen1(concern.key)}
                    style={{
                      width: '100%',
                      minHeight: '58px',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid rgba(226, 232, 240, 0.9)',
                      background: isSelected
                        ? 'linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%)'
                        : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? '0 4px 16px rgba(37, 99, 235, 0.10)'
                        : '0 1px 3px rgba(15, 23, 42, 0.02)',
                      transition: 'all 0.16s ease',
                      textAlign: 'left',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#93c5fd';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.02)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          border: isSelected ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                          background: isSelected ? '#2563eb' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.16s ease'
                        }}
                      >
                        {isSelected && <Check size={13} color="#ffffff" strokeWidth={3} />}
                      </div>
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#1e40af' : '#1e293b',
                          lineHeight: 1.45,
                          wordBreak: 'break-word'
                        }}
                      >
                        {concern.screen1OptionText}
                      </span>
                    </div>

                    {isSelected && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: '#2563eb',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginLeft: '12px'
                        }}
                      >
                        Selected
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="screen2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              width: '100%'
            }}
          >
            {/* Natural Follow-up Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#4f46e5'
                  }}
                >
                  Let's narrow it down a little
                </span>
                <h1
                  style={{
                    fontSize: 'clamp(1.45rem, 4vw, 1.95rem)',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.26,
                    letterSpacing: '-0.025em',
                    margin: 0
                  }}
                >
                  {SCREEN2_QUESTIONS[selectedConcern || 'depression']?.question}
                </h1>
                <p
                  style={{
                    fontSize: '0.96rem',
                    color: '#64748b',
                    fontWeight: 500,
                    lineHeight: 1.5,
                    margin: 0
                  }}
                >
                  Choose the one that feels closest to what you're dealing with right now.
                </p>
              </div>

              <div style={{ display: 'none', md: 'block' }}>
                <CalmAtmosphereVisual mode={currentAtmosphereMode} size={64} />
              </div>
            </div>

            {/* Concern Specific Options */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}
            >
              {(SCREEN2_QUESTIONS[selectedConcern || 'depression']?.options || []).map(
                (opt) => {
                  const isSelected = screen2OptionId === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      variants={itemVariants}
                      type="button"
                      onClick={() => handleSelectScreen2(opt.id)}
                      style={{
                        width: '100%',
                        minHeight: '58px',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: isSelected ? '2px solid #4f46e5' : '1px solid rgba(226, 232, 240, 0.9)',
                        background: isSelected
                          ? 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)'
                          : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: isSelected
                          ? '0 4px 16px rgba(79, 70, 229, 0.10)'
                          : '0 1px 3px rgba(15, 23, 42, 0.02)',
                        transition: 'all 0.16s ease',
                        textAlign: 'left',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onMouseOver={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#c7d2fe';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.02)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #4f46e5' : '1.5px solid #cbd5e1',
                            background: isSelected ? '#4f46e5' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.16s ease'
                          }}
                        >
                          {isSelected && <Check size={13} color="#ffffff" strokeWidth={3} />}
                        </div>
                        <span
                          style={{
                            fontSize: '1rem',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#3730a3' : '#1e293b',
                            lineHeight: 1.45,
                            wordBreak: 'break-word'
                          }}
                        >
                          {opt.text}
                        </span>
                      </div>

                      {isSelected && (
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: '#4f46e5',
                            fontWeight: 700,
                            flexShrink: 0,
                            marginLeft: '12px'
                          }}
                        >
                          Selected
                        </span>
                      )}
                    </motion.button>
                  );
                }
              )}
            </motion.div>

            {/* Optional Free-text for custom situations */}
            {(selectedConcern === 'other_concerns' || screen2OptionId?.includes('custom')) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>
                  Anything specific you'd like us to know? (Optional)
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Share a short note..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '0.94rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="screen3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              width: '100%'
            }}
          >
            {/* Forward-Looking Hopeful Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#ea580c'
                  }}
                >
                  Looking ahead
                </span>
                <h1
                  style={{
                    fontSize: 'clamp(1.45rem, 4vw, 1.95rem)',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.26,
                    letterSpacing: '-0.025em',
                    margin: 0
                  }}
                >
                  If the next 21 days went well, what would you most want to be different?
                </h1>
                <p
                  style={{
                    fontSize: '0.96rem',
                    color: '#64748b',
                    fontWeight: 500,
                    lineHeight: 1.5,
                    margin: 0
                  }}
                >
                  Choose the change that would bring the biggest relief.
                </p>
              </div>

              <div style={{ display: 'none', md: 'block' }}>
                <CalmAtmosphereVisual mode={currentAtmosphereMode} size={64} />
              </div>
            </div>

            {/* Desired Outcome Options */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}
            >
              {DESIRED_OUTCOMES.map((outcome) => {
                const isSelected = desiredOutcomeId === outcome.id;
                return (
                  <motion.button
                    key={outcome.id}
                    variants={itemVariants}
                    type="button"
                    onClick={() => handleSelectScreen3(outcome.id)}
                    style={{
                      width: '100%',
                      minHeight: '56px',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #ea580c' : '1px solid rgba(226, 232, 240, 0.9)',
                      background: isSelected
                        ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)'
                        : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? '0 4px 16px rgba(234, 88, 12, 0.10)'
                        : '0 1px 3px rgba(15, 23, 42, 0.02)',
                      transition: 'all 0.16s ease',
                      textAlign: 'left',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#fed7aa';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.02)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          border: isSelected ? '2px solid #ea580c' : '1.5px solid #cbd5e1',
                          background: isSelected ? '#ea580c' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.16s ease'
                        }}
                      >
                        {isSelected && <Check size={13} color="#ffffff" strokeWidth={3} />}
                      </div>
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#9a3412' : '#1e293b',
                          lineHeight: 1.45,
                          wordBreak: 'break-word'
                        }}
                      >
                        {outcome.text}
                      </span>
                    </div>

                    {isSelected && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: '#ea580c',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginLeft: '12px'
                        }}
                      >
                        Selected
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: '28px',
          width: '100%'
        }}
      >
        {step >= 0 && step < 3 && (
          <button
            type="button"
            onClick={() => {
              setStep((prev) => prev - 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#475569',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '10px 18px',
              borderRadius: '9999px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#0f172a';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>
        )}
      </div>
    </div>
  );
}

