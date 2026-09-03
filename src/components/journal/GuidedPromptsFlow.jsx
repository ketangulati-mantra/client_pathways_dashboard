import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Check,
  AlertTriangle,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { createJournalEntry, getUserJournalEntries } from '../../services/journalService';
import { getActiveUserId } from '../../services/authService';
import {
  extractCheckInContext,
  getPersonalizedGuidedPrompts,
  GUIDED_PROMPT_CATEGORIES
} from '../../services/journalPersonalization';

export { GUIDED_PROMPT_CATEGORIES };

export default function GuidedPromptsFlow({
  onBack,
  onSaved,
  latestCheckIn,
  hasCompletedCheckIn
}) {
  const shouldReduceMotion = useReducedMotion();
  const userId = getActiveUserId();

  // Stage: 'categories' | 'prompts_list' | 'writing'
  const [stage, setStage] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);

  // History & personalization context
  const [recentEntries, setRecentEntries] = useState([]);
  const [sessionSeenPrompts, setSessionSeenPrompts] = useState([]);

  const textareaRef = useRef(null);

  const context = useMemo(
    () => extractCheckInContext(latestCheckIn, { completedToday: hasCompletedCheckIn }),
    [latestCheckIn, hasCompletedCheckIn]
  );
  const emotion = context?.emotion || latestCheckIn?.primary_emotion || null;

  // Load recent entries for intelligent ranking and repetition prevention
  useEffect(() => {
    let isMounted = true;
    async function loadRecent() {
      try {
        const entries = await getUserJournalEntries(userId, 10);
        if (isMounted && Array.isArray(entries)) {
          setRecentEntries(entries);
        }
      } catch {}
    }
    loadRecent();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Auto-focus textarea in writing mode & initialize prompt if needed
  useEffect(() => {
    if (stage === 'writing' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [stage]);

  // Derived personalized prompt bundle for current category
  const personalizedBundle = useMemo(() => {
    const cat = selectedCategory || GUIDED_PROMPT_CATEGORIES[1];
    return getPersonalizedGuidedPrompts({
      category: cat,
      context,
      recentEntries,
      sessionSeenPrompts
    });
  }, [selectedCategory, context, recentEntries, sessionSeenPrompts]);

  useEffect(() => {
    if (stage === 'writing' && !selectedPrompt && personalizedBundle.primaryPrompt) {
      setSelectedPrompt(personalizedBundle.primaryPrompt);
    }
  }, [stage, selectedPrompt, personalizedBundle.primaryPrompt]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setStage('prompts_list');
  };

  const handleSelectPrompt = (promptText) => {
    setSelectedPrompt(promptText);
    setSessionSeenPrompts((prev) => [...new Set([...prev, promptText])]);
    setContent('');
    setStage('writing');
  };

  const handleShufflePrompt = () => {
    const cat = selectedCategory || GUIDED_PROMPT_CATEGORIES[1];
    const allPrompts = personalizedBundle.prompts.length > 0
      ? personalizedBundle.prompts
      : cat.prompts;

    const remaining = allPrompts.filter((p) => p !== selectedPrompt && !sessionSeenPrompts.includes(p));
    const pool = remaining.length > 0 ? remaining : allPrompts.filter((p) => p !== selectedPrompt);

    if (pool.length > 0) {
      const nextPrompt = pool[Math.floor(Math.random() * pool.length)];
      setSelectedPrompt(nextPrompt);
      setSessionSeenPrompts((prev) => [...new Set([...prev, nextPrompt])]);
    }
  };

  const handleBackWithGuard = () => {
    if (stage === 'writing' && content.trim().length > 0) {
      setShowExitModal(true);
    } else if (stage === 'writing') {
      setStage('prompts_list');
    } else if (stage === 'prompts_list') {
      setStage('categories');
    } else {
      onBack();
    }
  };

  const isSavingRef = useRef(false);

  const handleSave = async () => {
    if (content.trim().length === 0 || isSaving || isSavingRef.current) return;

    isSavingRef.current = true;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const emotionZone = latestCheckIn?.emotion_zone || null;
      const checkInId = latestCheckIn?.id || latestCheckIn?.metadata?.checkInId || null;
      const intensity = latestCheckIn?.intensity || null;

      const savedEntry = await createJournalEntry({
        userId,
        title: selectedPrompt,
        content: content.trim(),
        entryType: 'guided_prompt',
        emotion: hasCompletedCheckIn ? emotion : null,
        emotionZone: hasCompletedCheckIn ? emotionZone : null,
        intensity: hasCompletedCheckIn ? intensity : null,
        checkInId: hasCompletedCheckIn ? checkInId : null,
        checkInDate: latestCheckIn?.created_at
          ? new Date(latestCheckIn.created_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        metadata: {
          category: selectedCategory?.title || 'Guided Reflection',
          categoryId: selectedCategory?.id || 'guided',
          prompt: selectedPrompt
        }
      });

      if (onSaved) {
        onSaved(savedEntry);
      }
    } catch (err) {
      console.error('[GuidedPromptsFlow] Failed to save entry:', err);
      setErrorMessage(err?.message || "We couldn't save your reflection. Please try again.");
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  // =========================================================================
  // VIEW 1: CATEGORY SELECTION
  // =========================================================================
  if (stage === 'categories') {
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
            maxWidth: '740px',
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
            aria-label="Back to journal"
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
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)'
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </motion.button>
        </header>

        <main
          style={{
            maxWidth: '740px',
            width: '100%',
            margin: '0 auto 80px',
            padding: '0 20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h1
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: 'clamp(2.1rem, 5vw, 2.7rem)',
                fontWeight: 600,
                color: '#0F172A',
                margin: 0,
                lineHeight: 1.15
              }}
            >
              Guided Prompts
            </h1>
            <p style={{ fontSize: '0.94rem', color: '#64748B', margin: 0 }}>
              A little guidance when you're not sure where to begin.
            </p>
          </div>

          {/* Category Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', minWidth: 0 }}>
            {GUIDED_PROMPT_CATEGORIES.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)' }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleSelectCategory(cat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 20px',
                  background: cat.bgColor,
                  border: `1px solid ${cat.borderColor}`,
                  borderRadius: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  width: '100%',
                  minWidth: 0,
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0 }}>{cat.emoji}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                      {cat.title}
                    </span>
                    <span style={{ fontSize: '0.86rem', color: '#526071', fontWeight: 400, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                      {cat.description}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: cat.accentColor,
                    flexShrink: 0
                  }}
                >
                  <ChevronRight size={16} strokeWidth={2.4} />
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: PROMPT SELECTION WITHIN CATEGORY
  // =========================================================================
  if (stage === 'prompts_list') {
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
            maxWidth: '740px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box'
          }}
        >
          <motion.button
            type="button"
            onClick={() => setStage('categories')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Back to categories"
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
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)'
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </motion.button>
        </header>

        <main
          style={{
            maxWidth: '740px',
            width: '100%',
            margin: '0 auto 80px',
            padding: '0 20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            minWidth: 0
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: selectedCategory?.accentColor || '#7C3AED',
                letterSpacing: '0.12em',
                textTransform: 'uppercase'
              }}
            >
              {selectedCategory?.emoji} {selectedCategory?.title}
            </span>
            <h1
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: 'clamp(1.85rem, 4.5vw, 2.3rem)',
                fontWeight: 600,
                color: '#0F172A',
                margin: 0,
                overflowWrap: 'break-word',
                wordBreak: 'break-word'
              }}
            >
              Choose a prompt to begin
            </h1>
          </div>

          {/* List of Prompts in this category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', minWidth: 0 }}>
            {(personalizedBundle.prompts.length > 0 ? personalizedBundle.prompts : (selectedCategory?.prompts || [])).map((promptText, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2, boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)' }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleSelectPrompt(promptText)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: '#FFFFFF',
                  border: '1px solid #ECE7DF',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
                  gap: '12px',
                  width: '100%',
                  minWidth: 0
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0, paddingRight: '4px' }}>
                  {hasCompletedCheckIn && emotion && personalizedBundle.tailoredPrompts?.includes(promptText) && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7C3AED', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      ✨ Tailored for today
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                      fontSize: '1.14rem',
                      fontWeight: 500,
                      color: '#0F172A',
                      lineHeight: 1.4,
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word'
                    }}
                  >
                    {promptText}
                  </span>
                </div>

                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: selectedCategory.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: selectedCategory.accentColor,
                    flexShrink: 0
                  }}
                >
                  <ArrowRight size={14} strokeWidth={2.4} />
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: GUIDED REFLECTION WRITING CANVAS
  // =========================================================================
  const canSave = content.trim().length > 0 && !isSaving;

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
        .guided-content-textarea {
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
          min-height: 340px;
          box-sizing: border-box;
        }

        .guided-content-textarea::placeholder {
          color: #94A3B8;
          font-family: Newsreader, "Playfair Display", Georgia, serif;
          font-size: 1.2rem;
          font-style: italic;
        }
      `}</style>

      {/* Atmospheric Soft Light Wash */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '240px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 243, 255, 0.7) 0%, rgba(250, 247, 242, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Top Header Bar */}
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
          onClick={handleBackWithGuard}
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

        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#7C3AED',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          GUIDED REFLECTION
        </span>

        {/* Save Action - Disabled & Neutral when content is empty */}
        <motion.button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          whileHover={canSave ? { scale: 1.03 } : {}}
          whileTap={canSave ? { scale: 0.97 } : {}}
          style={{
            background: canSave ? '#7C3AED' : '#E2E8F0',
            color: canSave ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            borderRadius: '9999px',
            padding: '8px 18px',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: canSave ? 'pointer' : 'default',
            pointerEvents: canSave ? 'auto' : 'none',
            boxShadow: canSave ? '0 2px 8px rgba(124, 58, 237, 0.25)' : 'none',
            outline: 'none',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Check size={14} strokeWidth={2.4} />
              <span>Save</span>
            </>
          )}
        </motion.button>
      </header>

      {/* Main Writing Area: Context -> Question -> Space to Write */}
      <main
        style={{
          maxWidth: '740px',
          width: '100%',
          margin: '0 auto 80px',
          padding: '20px 20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Error Notice */}
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

        {/* 1. Subtle Check-in Context Chip */}
        {hasCompletedCheckIn && emotion && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(124, 58, 237, 0.06)',
              border: '1px solid rgba(124, 58, 237, 0.14)',
              borderRadius: '9999px',
              padding: '5px 14px',
              width: 'fit-content',
              fontSize: '0.84rem',
              fontWeight: 500,
              color: '#6D28D9'
            }}
          >
            <Sparkles size={13} strokeWidth={2.2} />
            <span>Today you're feeling <strong>{emotion}</strong></span>
          </div>
        )}

        {/* 2. Personalized Prompt Header & Simplified Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h1
            style={{
              fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.55rem, 4.2vw, 2.15rem)',
              fontWeight: 600,
              color: '#0F172A',
              margin: 0,
              lineHeight: 1.25,
              letterSpacing: '-0.02em'
            }}
          >
            {selectedPrompt || personalizedBundle.primaryPrompt || "What's on your mind today?"}
          </h1>

          {/* Under-prompt actions: Only ↻ New prompt and Browse prompts → */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              gap: '12px',
              paddingTop: '2px'
            }}
          >
            <button
              type="button"
              onClick={handleShufflePrompt}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#7C3AED',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                outline: 'none'
              }}
            >
              <RefreshCw size={13} strokeWidth={2.2} />
              <span>New prompt</span>
            </button>

            <button
              type="button"
              onClick={() => setStage('prompts_list')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 0',
                outline: 'none'
              }}
            >
              Browse prompts →
            </button>
          </div>

          {/* 3. Unfinished Reflection Draft (ONLY shown if genuine unfinished draft exists) */}
          {personalizedBundle?.unfinishedDraft && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                setContent((prev) => prev ? `${prev}\n\n${personalizedBundle.unfinishedDraft.excerpt}` : personalizedBundle.unfinishedDraft.excerpt);
              }}
              style={{
                marginTop: '4px',
                padding: '12px 16px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
                textAlign: 'left'
              }}
            >
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#0F766E',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                Continue where you left off
              </span>
              <span
                style={{
                  fontSize: '0.88rem',
                  color: '#334155',
                  lineHeight: 1.45
                }}
              >
                {personalizedBundle.unfinishedDraft.dateStr}: "{personalizedBundle.unfinishedDraft.excerpt}" →
              </span>
            </motion.div>
          )}
        </div>

        {/* Subtle Horizontal Divider */}
        <div style={{ height: '1px', background: '#EAE5DB', width: '100%', margin: '2px 0' }} />

        {/* 4. Open, Calm Writing Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            hasCompletedCheckIn && emotion
              ? "There's no need to make sense of everything. Start wherever feels easiest..."
              : "Take your time. Write whatever comes to mind..."
          }
          className="guided-content-textarea"
        />
      </main>

      {/* Unsaved Changes Guard Dialog */}
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
                Your progress hasn't been saved yet. Are you sure you want to leave?
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
                  Keep writing
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowExitModal(false);
                    setStage('prompts_list');
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
