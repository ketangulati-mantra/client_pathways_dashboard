import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, AlertTriangle, Sun, Feather, ChevronLeft } from 'lucide-react';
import { createJournalEntry } from '../../services/journalService';
import { getActiveUserId } from '../../services/authService';
import { extractCheckInContext, getPersonalizedReflectTodaySteps } from '../../services/journalPersonalization';

// Emotion-aware gentle exploratory prompts (3 steps max)
function getPromptsForEmotion(emotion, zone) {
  const e = (emotion || '').toLowerCase();

  if (['overwhelmed', 'stressed', 'pressured'].includes(e)) {
    return [
      {
        step: 1,
        title: 'Look Back',
        prompt: "What's been taking up the most space in your mind today?",
        placeholder: "Write about what felt like a lot to carry today..."
      },
      {
        step: 2,
        title: 'Explore',
        prompt: 'Was there a specific moment when that weight felt heaviest?',
        placeholder: 'Describe what was happening or what you were thinking in that moment...'
      },
      {
        step: 3,
        title: 'Understand',
        prompt: 'What is one small boundary or pause you might give yourself right now?',
        placeholder: 'Even a small breath, pausing a task, or resting...'
      }
    ];
  }

  if (['anxious', 'worried', 'nervous', 'uneasy'].includes(e)) {
    return [
      {
        step: 1,
        title: 'Look Back',
        prompt: 'What thoughts or situations have felt unsettled today?',
        placeholder: 'Write whatever has been creating uncertainty...'
      },
      {
        step: 2,
        title: 'Explore',
        prompt: 'What parts of this are within your control, and what parts belong to tomorrow?',
        placeholder: 'Separating what is yours to hold right now...'
      },
      {
        step: 3,
        title: 'Understand',
        prompt: 'What would help you feel a little more grounded in this moment?',
        placeholder: 'A physical sensation, a quiet reminder, or someone you trust...'
      }
    ];
  }

  if (['sad', 'lonely', 'grief', 'down', 'tired', 'drained'].includes(e)) {
    return [
      {
        step: 1,
        title: 'Look Back',
        prompt: 'What felt particularly tender or difficult about today?',
        placeholder: 'Allow yourself to name what feels heavy without needing to fix it...'
      },
      {
        step: 2,
        title: 'Explore',
        prompt: 'How has your body or mind been asking you to slow down?',
        placeholder: 'Noticing where you feel tired or what you have been holding back...'
      },
      {
        step: 3,
        title: 'Understand',
        prompt: 'What kind of gentleness or comfort do you need most today?',
        placeholder: 'Kind words to yourself, warmth, rest, or quiet...'
      }
    ];
  }

  if (['calm', 'peaceful', 'relaxed', 'content', 'happy', 'grateful', 'inspired'].includes(e)) {
    return [
      {
        step: 1,
        title: 'Look Back',
        prompt: 'What contributed most to feeling this sense of ease or connection today?',
        placeholder: 'A moment, a person, an environment, or an internal choice...'
      },
      {
        step: 2,
        title: 'Explore',
        prompt: 'How did this feeling show up in how you moved through your day?',
        placeholder: 'Noticing how you reacted, created, or related to others...'
      },
      {
        step: 3,
        title: 'Understand',
        prompt: 'What from today would you like to carry forward into tomorrow?',
        placeholder: 'An insight, a gratitude, or a steady intention...'
      }
    ];
  }

  // General default reflection prompts
  return [
    {
      step: 1,
      title: 'Look Back',
      prompt: 'What stood out most about your day today?',
      placeholder: 'A memorable conversation, a feeling, or a moment that caught your attention...'
    },
    {
      step: 2,
      title: 'Explore',
      prompt: 'How did that experience or moment make you feel underneath the surface?',
      placeholder: 'Exploring what thoughts or emotions arose...'
    },
    {
      step: 3,
      title: 'Understand',
      prompt: 'What do you feel you need most as you close out this day?',
      placeholder: 'Clarity, rest, gratitude, or simply letting go of what happened...'
    }
  ];
}

export default function ReflectOnTodayFlow({
  onBack,
  onSaved,
  onNavigateToCheckIn,
  latestCheckIn,
  hasCompletedCheckIn
}) {
  const shouldReduceMotion = useReducedMotion();
  const userId = getActiveUserId();

  // State: 'choice' (if no checkin and user hasn't opted in/out) | 'reflect' | 'save_review'
  const [stage, setStage] = useState(hasCompletedCheckIn ? 'reflect' : 'choice');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // User responses for 3 steps
  const [responses, setResponses] = useState({ 0: '', 1: '', 2: '' });
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);

  const textareaRef = useRef(null);

  const context = useMemo(() => extractCheckInContext(latestCheckIn, { completedToday: hasCompletedCheckIn }), [latestCheckIn, hasCompletedCheckIn]);
  const emotion = context?.emotion || latestCheckIn?.primary_emotion || null;
  const prompts = useMemo(() => getPersonalizedReflectTodaySteps(context), [context]);

  // Focus textarea smoothly when step changes
  useEffect(() => {
    if (stage === 'reflect' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [stage, currentPromptIndex]);

  // Check if user has entered any answers
  const hasAnyInput = Object.values(responses).some((val) => val && val.trim().length > 0);
  const currentResponse = responses[currentPromptIndex] || '';

  const handleResponseChange = (text) => {
    setResponses((prev) => ({
      ...prev,
      [currentPromptIndex]: text
    }));
  };

  const handleNextPrompt = () => {
    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex((prev) => prev + 1);
    } else {
      setStage('save_review');
    }
  };

  const handlePrevPrompt = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex((prev) => prev - 1);
    }
  };

  const handleSkipPrompt = () => {
    handleNextPrompt();
  };

  const handleBackGuard = () => {
    if (hasAnyInput) {
      setShowExitModal(true);
    } else {
      onBack();
    }
  };

  const isSavingRef = useRef(false);

  const handleSaveReflection = async () => {
    if (isSavingRef.current || isSaving) return;

    const answeredPrompts = prompts
      .map((p, idx) => ({
        step: p.step,
        title: p.title,
        prompt: p.prompt,
        response: (responses[idx] || '').trim()
      }))
      .filter((item) => item.response.length > 0);

    if (answeredPrompts.length === 0) {
      setErrorMessage('Please write a response to at least one reflection prompt.');
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setErrorMessage(null);

    // Build structured content
    const formattedContent = answeredPrompts
      .map((item) => `### ${item.prompt}\n${item.response}`)
      .join('\n\n');

    let finalTitle = title.trim();
    if (!finalTitle) {
      finalTitle = emotion ? `Reflecting on feeling ${emotion}` : 'Reflecting on Today';
    }

    const emotionZone = latestCheckIn?.emotion_zone || null;
    const checkInId = latestCheckIn?.id || latestCheckIn?.metadata?.checkInId || null;
    const intensity = latestCheckIn?.intensity || null;

    try {
      const savedEntry = await createJournalEntry({
        userId,
        title: finalTitle,
        content: formattedContent,
        entryType: 'reflect_today',
        emotion: hasCompletedCheckIn ? emotion : null,
        emotionZone: hasCompletedCheckIn ? emotionZone : null,
        intensity: hasCompletedCheckIn ? intensity : null,
        checkInId: hasCompletedCheckIn ? checkInId : null,
        checkInDate: latestCheckIn?.created_at
          ? new Date(latestCheckIn.created_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        metadata: {
          prompts: answeredPrompts
        }
      });

      if (onSaved) {
        onSaved(savedEntry);
      }
    } catch (err) {
      console.error('[ReflectOnTodayFlow] Save error:', err);
      setErrorMessage(err?.message || "We couldn't save your reflection. Please try again.");
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  // =========================================================================
  // 1. STATE B CHOICE: NO CHECK-IN DETECTED TODAY
  // =========================================================================
  if (stage === 'choice') {
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
        <header
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            maxWidth: '680px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box'
          }}
        >
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </motion.button>
        </header>

        <main
          style={{
            maxWidth: '540px',
            width: '100%',
            margin: '20px auto 60px',
            padding: '0 20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '24px'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: '#FAF3E8',
              border: '1px solid #EFE2CE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#B45309'
            }}
          >
            <Sun size={26} strokeWidth={2} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#B45309',
                letterSpacing: '0.12em',
                textTransform: 'uppercase'
              }}
            >
              BEFORE WE REFLECT
            </span>
            <h1
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: 'clamp(1.75rem, 4.5vw, 2.2rem)',
                fontWeight: 600,
                color: '#0F172A',
                margin: 0,
                lineHeight: 1.2
              }}
            >
              A quick check-in can help personalize your reflection.
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Checking in with how you feel right now gives us a starting point to tailor your prompts.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '340px' }}>
            <motion.button
              type="button"
              onClick={onNavigateToCheckIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: '#0F766E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '12px 24px',
                fontSize: '0.94rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(15, 118, 110, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Check in first</span>
              <ArrowRight size={15} strokeWidth={2.4} />
            </motion.button>

            <button
              type="button"
              onClick={() => setStage('reflect')}
              style={{
                background: 'transparent',
                border: '1px solid #E2E8F0',
                borderRadius: '9999px',
                padding: '11px 24px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Reflect without checking in
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // 2. STAGE: SAVE & TITLE REVIEW SCREEN
  // =========================================================================
  if (stage === 'save_review') {
    const answeredCount = prompts.filter((_, idx) => (responses[idx] || '').trim().length > 0).length;

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
        <header
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '680px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box'
          }}
        >
          <motion.button
            type="button"
            onClick={() => setStage('reflect')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </motion.button>

          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>
            Complete Reflection
          </span>

          <div style={{ width: '38px' }} />
        </header>

        <main
          style={{
            maxWidth: '600px',
            width: '100%',
            margin: '10px auto 80px',
            padding: '0 20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {errorMessage && (
            <div
              style={{
                padding: '10px 14px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '12px',
                color: '#B91C1C',
                fontSize: '0.86rem'
              }}
            >
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#B45309',
                letterSpacing: '0.12em',
                textTransform: 'uppercase'
              }}
            >
              REFLECTION SUMMARY
            </span>
            <h2
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: '1.7rem',
                fontWeight: 600,
                color: '#0F172A',
                margin: 0
              }}
            >
              Ready to save your reflection
            </h2>
            <span style={{ fontSize: '0.88rem', color: '#64748B' }}>
              You answered {answeredCount} of {prompts.length} reflection moments today.
            </span>
          </div>

          {/* Optional Title Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
              Reflection title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={emotion ? `Reflecting on feeling ${emotion}` : 'Give this reflection a title...'}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '0.96rem',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              maxLength={100}
            />
          </div>

          {/* Structured Answers Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {prompts.map((p, idx) => {
              const res = (responses[idx] || '').trim();
              if (!res) return null;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '14px 16px',
                    background: '#FFFFFF',
                    border: '1px solid #EAE5DB',
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#B45309' }}>
                    {p.title}: {p.prompt}
                  </span>
                  <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0, lineHeight: 1.55 }}>
                    {res}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <motion.button
            type="button"
            onClick={handleSaveReflection}
            disabled={isSaving || answeredCount === 0}
            whileHover={!isSaving && answeredCount > 0 ? { scale: 1.02 } : {}}
            whileTap={!isSaving && answeredCount > 0 ? { scale: 0.98 } : {}}
            style={{
              background: answeredCount > 0 ? '#B45309' : '#CBD5E1',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '13px 28px',
              fontSize: '0.96rem',
              fontWeight: 600,
              cursor: answeredCount > 0 && !isSaving ? 'pointer' : 'default',
              boxShadow: answeredCount > 0 ? '0 4px 14px rgba(180, 83, 9, 0.25)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              outline: 'none',
              marginTop: '8px'
            }}
          >
            {isSaving ? (
              <span>Saving reflection...</span>
            ) : (
              <>
                <Check size={16} strokeWidth={2.4} />
                <span>Save Reflection</span>
              </>
            )}
          </motion.button>
        </main>
      </div>
    );
  }

  // =========================================================================
  // 3. STAGE: GUIDED REFLECTION STEP-BY-STEP FLOW
  // =========================================================================
  const currentPrompt = prompts[currentPromptIndex];

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
        .reflect-canvas-textarea {
          width: 100%;
          border: none;
          background: transparent;
          font-family: "Plus Jakarta Sans", Inter, -apple-system, sans-serif;
          font-size: clamp(1.02rem, 2.2vw, 1.12rem);
          line-height: 1.75;
          color: #1E293B;
          outline: none;
          resize: none;
          padding: 0;
          margin: 0;
          min-height: 260px;
          box-sizing: border-box;
        }

        .reflect-canvas-textarea::placeholder {
          color: #94A3B8;
          font-family: Newsreader, "Playfair Display", Georgia, serif;
          font-size: 1.2rem;
          font-style: italic;
        }
      `}</style>

      {/* Atmospheric Soft Warm Peach Light Wash */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '280px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(254, 243, 199, 0.5) 0%, rgba(250, 247, 242, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Sticky Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(250, 247, 242, 0.94)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #ECE7DF',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '740px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <motion.button
          type="button"
          onClick={handleBackGuard}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E6E1D8',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#334155',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
            outline: 'none'
          }}
        >
          <ArrowLeft size={17} strokeWidth={2.2} />
        </motion.button>

        {/* Subtle Step Progress */}
        <span
          style={{
            fontSize: '0.84rem',
            fontWeight: 600,
            color: '#78716C',
            letterSpacing: '0.02em'
          }}
        >
          Reflection · {currentPromptIndex + 1} of {prompts.length}
        </span>

        {/* Skip button */}
        <button
          type="button"
          onClick={handleSkipPrompt}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#78716C',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 8px',
            outline: 'none'
          }}
        >
          Skip →
        </button>
      </header>

      {/* Main Guided Prompt Canvas */}
      <main
        style={{
          width: '100%',
          maxWidth: '740px',
          margin: '0 auto',
          padding: '20px 20px 100px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Context Header Pill if checkin is active */}
        {hasCompletedCheckIn && emotion && currentPromptIndex === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FAF3E8',
              border: '1px solid #EFE2CE',
              borderRadius: '10px',
              padding: '6px 12px',
              width: 'fit-content',
              fontSize: '0.82rem',
              color: '#854D0E'
            }}
          >
            <span style={{ fontSize: '1rem' }}>🫧</span>
            <span>Earlier check-in: feeling <strong>{emotion}</strong></span>
          </motion.div>
        )}

        {/* Step Theme & Editorial Prompt Question */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#B45309',
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}
          >
            STEP {currentPrompt.step} · {currentPrompt.title}
          </span>
          <h1
            style={{
              fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.55rem, 4vw, 2.1rem)',
              fontWeight: 600,
              color: '#0F172A',
              margin: 0,
              lineHeight: 1.25,
              letterSpacing: '-0.02em'
            }}
          >
            {currentPrompt.prompt}
          </h1>
          {currentPrompt.supporting && (
            <p
              style={{
                fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                fontSize: '0.94rem',
                color: '#64748B',
                margin: '2px 0 0',
                lineHeight: 1.5
              }}
            >
              {currentPrompt.supporting}
            </p>
          )}
        </div>

        {/* Horizontal Paper Separator */}
        <div style={{ height: '1px', background: '#EAE5DB', width: '100%' }} />

        {/* Open Comfortable Writing Area */}
        <textarea
          ref={textareaRef}
          value={currentResponse}
          onChange={(e) => handleResponseChange(e.target.value)}
          placeholder={currentPrompt.placeholder}
          className="reflect-canvas-textarea"
        />
      </main>

      {/* Floating Bottom Action Bar */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(250, 247, 242, 0.94)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid #ECE7DF',
          padding: '12px 20px',
          zIndex: 20
        }}
      >
        <div
          style={{
            maxWidth: '740px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {currentPromptIndex > 0 ? (
            <button
              type="button"
              onClick={handlePrevPrompt}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                outline: 'none'
              }}
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <motion.button
            type="button"
            onClick={handleNextPrompt}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: '#B45309',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '10px 22px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(180, 83, 9, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              outline: 'none'
            }}
          >
            <span>{currentPromptIndex === prompts.length - 1 ? 'Review & Save' : 'Next prompt'}</span>
            <ArrowRight size={14} strokeWidth={2.4} />
          </motion.button>
        </div>
      </footer>

      {/* Exit & Unsaved Work Protection Modal */}
      <AnimatePresence>
        {showExitModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              style={{
                width: '100%',
                maxWidth: '380px',
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px 22px',
                boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D97706',
                    flexShrink: 0
                  }}
                >
                  <AlertTriangle size={18} />
                </div>
                <h3
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: 0
                  }}
                >
                  Leave this reflection?
                </h3>
              </div>

              <p
                style={{
                  fontSize: '0.88rem',
                  color: '#64748B',
                  margin: 0,
                  lineHeight: 1.55
                }}
              >
                Your progress hasn't been saved yet. Are you sure you want to exit?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  style={{
                    background: '#0F172A',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '8px 16px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  Keep reflecting
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowExitModal(false);
                    onBack();
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #E2E8F0',
                    borderRadius: '9999px',
                    padding: '8px 16px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  Leave without saving
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
