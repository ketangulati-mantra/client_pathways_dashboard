import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, X, AlertCircle, AlertTriangle } from 'lucide-react';
import { createJournalEntry, updateJournalEntry } from '../../services/journalService';
import { getActiveUserId } from '../../services/authService';

export default function FreeWriteEditor({
  entry = null, // If provided, edit mode is active
  onBack,
  onSaved,
  onNavigateToCheckIn,
  latestCheckIn,
  hasCompletedCheckIn
}) {
  const shouldReduceMotion = useReducedMotion();
  const userId = getActiveUserId();

  const isEditing = Boolean(entry && entry.id);

  const initialTitle = entry?.title || '';
  const initialContent = entry?.content || '';

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [dismissedCheckInContext, setDismissedCheckInContext] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const textareaRef = useRef(null);

  // Focus textarea smoothly on mount if creating new
  useEffect(() => {
    if (textareaRef.current && !isEditing) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Auto-resize textarea height to accommodate content naturally
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(260, textareaRef.current.scrollHeight)}px`;
    }
  }, [content]);

  // Date formatting: e.g. "Tuesday, September 1"
  const entryDate = entry?.created_at ? new Date(entry.created_at) : new Date();
  const dateFormatted = entryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const checkInEmotion = entry?.emotion || (hasCompletedCheckIn ? latestCheckIn?.primary_emotion : null);
  const checkInZone = entry?.emotion_zone || (hasCompletedCheckIn ? latestCheckIn?.emotion_zone : null);

  // Check if content was modified
  const hasUnsavedChanges = title.trim() !== initialTitle.trim() || content.trim() !== initialContent.trim();
  const canSave = content.trim().length > 0 && !isSaving && (!isEditing || hasUnsavedChanges);

  const handleBackWithGuard = () => {
    if (hasUnsavedChanges && content.trim().length > 0) {
      setShowDiscardModal(true);
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
      let savedEntry;
      if (isEditing && !String(entry.id).startsWith('sample-')) {
        savedEntry = await updateJournalEntry(entry.id, {
          title: title.trim(),
          content: content.trim()
        });
      } else if (isEditing && String(entry.id).startsWith('sample-')) {
        // Fallback for sample entries
        savedEntry = {
          ...entry,
          title: title.trim() || 'Untitled Reflection',
          content: content.trim(),
          updated_at: new Date().toISOString()
        };
      } else {
        savedEntry = await createJournalEntry({
          userId,
          title: title.trim(),
          content: content.trim(),
          entryType: 'free_write',
          emotion: hasCompletedCheckIn ? checkInEmotion : null,
          emotionZone: hasCompletedCheckIn ? checkInZone : null,
          intensity: hasCompletedCheckIn ? latestCheckIn?.intensity : null,
          checkInId: hasCompletedCheckIn ? latestCheckIn?.id : null,
          checkInDate: latestCheckIn?.created_at
            ? new Date(latestCheckIn.created_at).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
        });
      }

      if (onSaved) {
        onSaved(savedEntry, isEditing);
      }
    } catch (err) {
      console.error('[FreeWriteEditor] Failed to save entry:', err);
      setErrorMessage("We couldn't save your reflection. Please try again.");
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

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
        .journal-editor-container {
          width: 100%;
          max-width: 740px;
          margin: 0 auto;
          padding: 16px 20px 80px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .journal-title-input {
          width: 100%;
          border: none;
          background: transparent;
          font-family: Newsreader, "Playfair Display", Georgia, serif;
          font-size: clamp(1.45rem, 3.5vw, 1.85rem);
          font-weight: 600;
          color: #0F172A;
          outline: none;
          padding: 0;
          margin: 0;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }

        .journal-title-input::placeholder {
          color: #94A3B8;
          font-weight: 400;
        }

        .journal-content-textarea {
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
          min-height: 320px;
          box-sizing: border-box;
        }

        .journal-content-textarea::placeholder {
          color: #94A3B8;
          font-family: Newsreader, "Playfair Display", Georgia, serif;
          font-size: 1.25rem;
          font-style: italic;
        }

        @media (min-width: 680px) {
          .journal-editor-container {
            padding: 24px 28px 96px;
            gap: 24px;
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
          height: '260px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(243, 238, 228, 0.85) 0%, rgba(250, 247, 242, 0) 75%)',
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
          background: 'rgba(250, 247, 242, 0.92)',
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
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#475569',
            letterSpacing: '-0.01em'
          }}
        >
          {isEditing ? 'Edit Reflection' : 'New Reflection'}
        </span>

        {/* Subtle Save Action Button */}
        <motion.button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          whileHover={canSave ? { scale: 1.03 } : {}}
          whileTap={canSave ? { scale: 0.97 } : {}}
          style={{
            background: canSave ? '#0284C7' : '#E2E8F0',
            color: canSave ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            borderRadius: '9999px',
            padding: '8px 18px',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: canSave ? 'pointer' : 'default',
            boxShadow: canSave ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none',
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
              <span>{isEditing ? 'Save changes' : 'Save'}</span>
            </>
          )}
        </motion.button>
      </header>

      {/* Main Editor Body */}
      <main className="journal-editor-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Error Notice */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              color: '#B91C1C',
              fontSize: '0.86rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* 1. Subtle Contextual Check-in Banner */}
        {(hasCompletedCheckIn || entry?.emotion) && !dismissedCheckInContext ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              background: 'rgba(5, 150, 105, 0.06)',
              border: '1px solid rgba(5, 150, 105, 0.14)',
              borderRadius: '12px',
              fontSize: '0.84rem',
              color: '#065F46'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem' }}>🫧</span>
              <span>{isEditing ? 'Recorded mood:' : "Today you're feeling"} <strong>{checkInEmotion}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setDismissedCheckInContext(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#059669',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                outline: 'none'
              }}
              title="Dismiss context"
            >
              <X size={14} />
            </button>
          </motion.div>
        ) : !hasCompletedCheckIn && !isEditing ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              background: 'rgba(2, 132, 199, 0.05)',
              border: '1px solid rgba(2, 132, 199, 0.12)',
              borderRadius: '12px',
              fontSize: '0.82rem',
              color: '#0369A1',
              flexWrap: 'wrap',
              gap: '6px'
            }}
          >
            <span>How are you feeling before you begin?</span>
            <button
              type="button"
              onClick={onNavigateToCheckIn}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0284C7',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                padding: '0',
                outline: 'none',
                textDecoration: 'underline'
              }}
            >
              Log your mood →
            </button>
          </div>
        ) : null}

        {/* 2. Date */}
        <span
          style={{
            fontSize: '0.88rem',
            color: '#64748B',
            fontWeight: 500,
            letterSpacing: '-0.01em'
          }}
        >
          {dateFormatted}
        </span>

        {/* 3. Optional Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this reflection a title..."
          className="journal-title-input"
          maxLength={120}
        />

        {/* Subtle Horizontal Divider */}
        <div style={{ height: '1px', background: '#EAE5DB', width: '100%' }} />

        {/* 4. Large Comfortable Writing Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="journal-content-textarea"
        />
      </main>

      {/* Unsaved Changes Guard Dialog */}
      <AnimatePresence>
        {showDiscardModal && (
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
                  Discard changes?
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
                You have unsaved changes to this reflection. Are you sure you want to leave without saving?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowDiscardModal(false)}
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
                  Keep editing
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDiscardModal(false);
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
                  Discard changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
