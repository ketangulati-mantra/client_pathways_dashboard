import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RefreshCw,
  Sun,
  Sparkles,
  X
} from 'lucide-react';
import { createJournalEntry, updateJournalEntry } from '../../services/journalService';
import { getActiveUserId } from '../../services/authService';

function getMoodColor(emotion) {
  const e = (emotion || '').toLowerCase();
  if (['overwhelmed', 'anxious', 'stressed', 'frustrated', 'angry'].includes(e)) return '#E11D48';
  if (['sad', 'lonely', 'tired', 'drained'].includes(e)) return '#2563EB';
  if (['calm', 'peaceful', 'relaxed', 'content'].includes(e)) return '#059669';
  return '#D97706';
}

function formatEditorDate(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

export default function JournalEditor({
  entryType = 'free_write', // 'free_write' | 'reflect_today' | 'guided_prompt'
  initialPrompt = null,
  editingEntry = null,
  onBack,
  onSaved,
  onNavigateToCheckIn,
  latestCheckIn,
  hasCompletedCheckIn
}) {
  const shouldReduceMotion = useReducedMotion();
  const userId = getActiveUserId();
  const isEditing = Boolean(editingEntry && editingEntry.id);

  // Storage key for autosaving drafts
  const draftKey = `journal_draft_${entryType}_${userId}`;

  // Check-in context
  const checkInEmotion = editingEntry?.emotion || (hasCompletedCheckIn ? latestCheckIn?.primary_emotion : null);
  const checkInZone = editingEntry?.emotion_zone || (hasCompletedCheckIn ? latestCheckIn?.emotion_zone : null);

  // Active prompt if reflecting on today or guided prompt
  const [activePrompt, setActivePrompt] = useState(() => {
    if (editingEntry?.metadata?.prompt) return editingEntry.metadata.prompt;
    if (initialPrompt) return initialPrompt;
    return null;
  });

  // Title and Content state
  const [title, setTitle] = useState(() => {
    if (editingEntry?.title) return editingEntry.title;
    return '';
  });

  const [content, setContent] = useState(() => {
    if (editingEntry?.content) return editingEntry.content;
    // Check localStorage draft
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.content) return parsed.content;
      }
    } catch {}
    return '';
  });

  const [currentEntryId, setCurrentEntryId] = useState(editingEntry?.id || null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'

  const textareaRef = useRef(null);
  const titleInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Auto-resize textarea height as user types
  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);
    triggerAutoSave(title, val);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(380, textareaRef.current.scrollHeight)}px`;
    }
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    triggerAutoSave(val, content);
  };

  // Perform database auto-save
  const performSave = useCallback(
    async (currentTitle, currentContent) => {
      // Don't save empty drafts to DB
      if (!currentContent.trim() && !currentTitle.trim()) {
        setSaveStatus('idle');
        return null;
      }

      setSaveStatus('saving');
      try {
        const effectiveTitle = currentTitle.trim() || (activePrompt ? activePrompt : 'Untitled Reflection');
        let saved;

        if (currentEntryId) {
          saved = await updateJournalEntry(currentEntryId, {
            title: effectiveTitle,
            content: currentContent.trim(),
            metadata: {
              ...(editingEntry?.metadata || {}),
              prompt: activePrompt,
              lastSavedAt: new Date().toISOString()
            }
          });
        } else {
          saved = await createJournalEntry({
            userId,
            title: effectiveTitle,
            content: currentContent.trim(),
            entryType,
            emotion: checkInEmotion,
            emotionZone: checkInZone,
            checkInId: latestCheckIn?.id || null,
            metadata: {
              prompt: activePrompt,
              lastSavedAt: new Date().toISOString()
            }
          });
          if (saved && saved.id) {
            setCurrentEntryId(saved.id);
          }
        }

        // Clear local draft once saved to DB
        try {
          localStorage.removeItem(draftKey);
        } catch {}

        setSaveStatus('saved');
        return saved;
      } catch (err) {
        console.warn('[JournalEditor] Auto-save error:', err);
        try {
          localStorage.setItem(
            draftKey,
            JSON.stringify({ title: currentTitle, content: currentContent, updatedAt: new Date().toISOString() })
          );
        } catch {}
        setSaveStatus('saved');
        return null;
      }
    },
    [userId, currentEntryId, activePrompt, entryType, checkInEmotion, checkInZone, latestCheckIn, editingEntry, draftKey]
  );

  // Debounced trigger
  const triggerAutoSave = useCallback(
    (newTitle, newContent) => {
      setSaveStatus('saving');
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({ title: newTitle, content: newContent, updatedAt: new Date().toISOString() })
        );
      } catch {}

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        performSave(newTitle, newContent);
      }, 1200);
    },
    [draftKey, performSave]
  );

  // Handle Back: save any remaining changes and return
  const handleBack = async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (content.trim() || title.trim()) {
      const saved = await performSave(title, content);
      if (onSaved && saved) {
        onSaved(saved, isEditing);
        return;
      }
    }
    onBack();
  };

  // Adjust initial textarea height on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(380, textareaRef.current.scrollHeight)}px`;
    }
  }, []);

  const headerTypeLabel = useMemo(() => {
    if (entryType === 'reflect_today') return 'Reflect on Today';
    if (entryType === 'guided_prompt') return 'Guided Reflection';
    return 'Free Write';
  }, [entryType]);

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
        .journal-editor-wrapper {
          width: 100%;
          max-width: 740px;
          margin: 0 auto;
          padding: 16px 20px 80px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .checkin-soft-callout {
          background: rgba(240, 249, 248, 0.75);
          border: 1px solid rgba(204, 236, 232, 0.8);
          border-radius: 16px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          box-sizing: border-box;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
        }

        .checkin-soft-callout:hover {
          background: rgba(235, 247, 245, 0.9);
          border-color: #B2DFD9;
          transform: translateY(-1px);
        }

        .journal-title-input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-family: Newsreader, "Playfair Display", Georgia, serif;
          font-size: clamp(1.8rem, 4.8vw, 2.35rem);
          font-weight: 600;
          color: #0F172A;
          letter-spacing: -0.02em;
          line-height: 1.25;
          padding: 0;
          margin: 0;
        }

        .journal-title-input::placeholder {
          color: #94A3B8;
          font-weight: 400;
        }

        .journal-body-textarea {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: clamp(1.06rem, 2.8vw, 1.2rem);
          font-weight: 400;
          color: #1E293B;
          line-height: 1.75;
          resize: none;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
          min-height: 380px;
        }

        .journal-body-textarea::placeholder {
          color: #94A3B8;
          font-weight: 400;
        }

        @media (min-width: 680px) {
          .journal-editor-wrapper {
            padding: 24px 28px 100px;
            gap: 24px;
          }
          .checkin-soft-callout {
            padding: 16px 20px;
          }
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
          background: 'radial-gradient(ellipse at 50% 0%, rgba(243, 238, 228, 0.85) 0%, rgba(250, 247, 242, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="journal-editor-wrapper" style={{ position: 'relative', zIndex: 1 }}>
        {/* 1. TOP HEADER (Back, Mode Label, Subtle Auto-Save Indicator) */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '2px 0 4px'
          }}
        >
          <motion.button
            type="button"
            onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Back"
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
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
              outline: 'none'
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </motion.button>

          {/* Centered Mode Label */}
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#64748B',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            {headerTypeLabel}
          </span>

          {/* Subtle Auto-save State Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: '#64748B',
              minWidth: '70px',
              justifyContent: 'flex-end'
            }}
          >
            {saveStatus === 'saving' ? (
              <span style={{ color: '#0284C7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#0284C7',
                    animation: 'pulse 1s infinite'
                  }}
                />
                Saving...
              </span>
            ) : saveStatus === 'saved' ? (
              <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={13} strokeWidth={2.6} />
                Saved
              </span>
            ) : null}
          </div>
        </header>

        {/* 2. COMPACT SOFT CALLOUT (The perfect middle ground: noticeable, optional, secondary) */}
        {!hasCompletedCheckIn ? (
          /* STATE A: NOT YET CHECKED IN TODAY */
          <motion.div
            className="checkin-soft-callout"
            whileTap={{ scale: 0.99 }}
            onClick={onNavigateToCheckIn}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sun size={13} color="#0F766E" strokeWidth={2.4} />
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#0F766E',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  TODAY'S CHECK-IN
                </span>
              </div>

              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A' }}>
                How are you feeling right now?
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                Take a moment to notice how you're feeling before reflecting.
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#0F766E',
                fontSize: '0.82rem',
                fontWeight: 600,
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <span>Check in</span>
              <ArrowRight size={13} strokeWidth={2.2} />
            </div>
          </motion.div>
        ) : hasCompletedCheckIn && checkInEmotion ? (
          /* STATE B: ALREADY CHECKED IN TODAY */
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              color: '#64748B',
              padding: '2px 0'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: getMoodColor(checkInEmotion),
                flexShrink: 0
              }}
            />
            <span style={{ fontWeight: 600, color: '#334155' }}>
              {checkInEmotion}
            </span>
            <span>·</span>
            <span>Logged today</span>
          </div>
        ) : null}

        {/* 3. REFLECTION PROMPT IF APPLICABLE */}
        {activePrompt && (
          <div
            style={{
              background: 'rgba(243, 238, 228, 0.55)',
              borderLeft: '3px solid #0F766E',
              borderRadius: '0 14px 14px 0',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F766E', letterSpacing: '0.06em' }}>
              PROMPT
            </span>
            <span
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: '1.05rem',
                fontStyle: 'italic',
                color: '#1E293B',
                lineHeight: 1.45
              }}
            >
              “{activePrompt}”
            </span>
          </div>
        )}

        {/* 4. MAIN WRITING CANVASS (Primary Focus with clear breathing space) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
          {/* Subtle Date Header */}
          <span
            style={{
              fontSize: '0.84rem',
              fontWeight: 500,
              color: '#94A3B8',
              letterSpacing: '0.01em'
            }}
          >
            {formatEditorDate(editingEntry?.created_at)}
          </span>

          {/* Seamless Editorial Title Input */}
          <input
            ref={titleInputRef}
            type="text"
            className="journal-title-input"
            placeholder="Give this reflection a title..."
            value={title}
            onChange={handleTitleChange}
          />

          {/* Large Open Writing Textarea */}
          <textarea
            ref={textareaRef}
            className="journal-body-textarea"
            placeholder="What's on your mind today?"
            value={content}
            onChange={handleContentChange}
          />
        </div>
      </div>
    </div>
  );
}
