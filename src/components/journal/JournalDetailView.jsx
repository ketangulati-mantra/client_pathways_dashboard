import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, MoreHorizontal, Edit3, Trash2, X, AlertTriangle } from 'lucide-react';
import { deleteJournalEntry } from '../../services/journalService';
import { extractEntryDisplay } from '../../services/journalFormatting';

function formatFullDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getMoodDotColor(emotion) {
  const e = (emotion || '').toLowerCase();
  if (['overwhelmed', 'anxious', 'stressed', 'frustrated', 'angry'].includes(e)) return '#e11d48';
  if (['sad', 'lonely', 'tired', 'drained'].includes(e)) return '#2563eb';
  if (['calm', 'peaceful', 'relaxed', 'content'].includes(e)) return '#059669';
  return '#d97706';
}

export default function JournalDetailView({
  entry,
  onBack,
  onEdit,
  onDeleted
}) {
  const shouldReduceMotion = useReducedMotion();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);

  // Close menu when tapping outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMenu]);

  if (!entry) return null;

  const dateText = formatFullDate(entry.created_at || entry.date || new Date().toISOString());
  const isReflectToday = entry.entry_type === 'reflect_today';
  const isGuidedPrompt = entry.entry_type === 'guided_prompt';

  const typeLabel = isReflectToday
    ? 'Reflect on Today'
    : isGuidedPrompt
    ? 'Guided Reflection'
    : 'Free Write';

  const typeBg = isReflectToday ? '#FAF3E8' : isGuidedPrompt ? '#F5F1FA' : '#EDF7F6';
  const typeColor = isReflectToday ? '#B45309' : isGuidedPrompt ? '#7C3AED' : '#0F766E';

  const mood = entry.emotion;
  const moodColor = getMoodDotColor(mood);

  // Structured prompt answers from metadata if available (Reflect on Today)
  const structuredPrompts = Array.isArray(entry.metadata?.prompts) ? entry.metadata.prompts : null;

  // Single guided prompt text from metadata if available
  const guidedPromptText = isGuidedPrompt ? entry.metadata?.prompt || entry.title : null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (entry.id && !String(entry.id).startsWith('sample-')) {
        await deleteJournalEntry(entry.id);
      }
      if (onDeleted) {
        onDeleted(entry.id);
      }
    } catch (err) {
      console.error('[JournalDetailView] Failed to delete reflection:', err);
      setIsDeleting(false);
      setShowDeleteModal(false);
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
        .journal-detail-container {
          width: 100%;
          max-width: 740px;
          margin: 0 auto;
          padding: 20px 20px 88px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .journal-detail-content {
          font-family: "Plus Jakarta Sans", Inter, -apple-system, sans-serif;
          font-size: clamp(1.04rem, 2.2vw, 1.15rem);
          line-height: 1.8;
          color: #1E293B;
          white-space: pre-wrap;
          word-break: break-word;
        }

        @media (min-width: 680px) {
          .journal-detail-container {
            padding: 32px 28px 100px;
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
          height: '280px',
          background: isReflectToday
            ? 'radial-gradient(ellipse at 50% 0%, rgba(254, 243, 199, 0.6) 0%, rgba(250, 247, 242, 0) 75%)'
            : isGuidedPrompt
            ? 'radial-gradient(ellipse at 50% 0%, rgba(245, 243, 255, 0.7) 0%, rgba(250, 247, 242, 0) 75%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(243, 238, 228, 0.9) 0%, rgba(250, 247, 242, 0) 75%)',
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
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back to reflections"
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

        {/* Subtle Overflow Menu Button (•••) */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <motion.button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="More options"
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
            <MoreHorizontal size={17} strokeWidth={2.2} />
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  background: '#FFFFFF',
                  border: '1px solid #E6E1D8',
                  borderRadius: '14px',
                  boxShadow: '0 10px 28px -4px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04)',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: '170px',
                  zIndex: 100
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(entry);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#0F172A',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    outline: 'none',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8F6F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Edit3 size={15} color="#0284C7" />
                  <span>Edit reflection</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#B91C1C',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    outline: 'none',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Trash2 size={15} color="#DC2626" />
                  <span>Delete reflection</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Journal Reading Surface */}
      <main className="journal-detail-container" style={{ position: 'relative', zIndex: 1 }}>
        {(() => {
          const display = extractEntryDisplay(entry);

          return (
            <>
              {/* 1. Date & Entry Type Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.88rem',
                    color: '#64748B',
                    fontWeight: 500,
                    letterSpacing: '-0.01em'
                  }}
                >
                  {display.fullDate}
                </span>
                <span style={{ color: '#CBD5E1' }}>•</span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: display.typeMeta.accentColor,
                    background: display.typeMeta.bgColor,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.02em',
                    border: `1px solid ${display.typeMeta.borderColor}`
                  }}
                >
                  {display.typeMeta.label}
                </span>
              </div>

              {/* 2. Prominent Editorial Title */}
              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(1.85rem, 4.5vw, 2.45rem)',
                  fontWeight: 600,
                  color: '#0F172A',
                  margin: 0,
                  lineHeight: 1.2,
                  letterSpacing: '-0.025em'
                }}
              >
                {display.displayTitle}
              </h1>

              {/* 3. Subtle Mood / Check-in Context if available */}
              {display.emotion && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#F5F2EC',
                    border: '1px solid #EAE4D8',
                    borderRadius: '10px',
                    padding: '6px 12px',
                    width: 'fit-content',
                    fontSize: '0.84rem',
                    color: '#334155',
                    marginTop: '-4px'
                  }}
                >
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>🫧</span>
                  <span>You checked in feeling <strong>{display.emotion}</strong></span>
                </div>
              )}

              {/* Subtle Paper Separator */}
              <div style={{ height: '1px', background: '#EAE5DB', width: '100%', margin: '4px 0' }} />

              {/* 4. Guided Prompt Callout (if guided reflection) */}
              {display.originalPrompt && (
                <div
                  style={{
                    padding: '14px 16px',
                    background: '#F5F1FA',
                    border: '1px solid #E8E0F2',
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Reflection Prompt
                  </span>
                  <span style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.12rem', color: '#1E293B', fontStyle: 'italic', lineHeight: 1.4 }}>
                    "{display.originalPrompt}"
                  </span>
                </div>
              )}

              {/* 5. Full Readable Reflection Body */}
              {display.structuredPrompts && display.structuredPrompts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {display.structuredPrompts.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                          fontSize: '1.24rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          lineHeight: 1.3
                        }}
                      >
                        {item.prompt}
                      </span>
                      <p
                        style={{
                          fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                          fontSize: '1.05rem',
                          lineHeight: 1.75,
                          color: '#334155',
                          margin: 0,
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {item.response}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <article className="journal-detail-content">
                  {display.userFullText || entry.content}
                </article>
              )}
            </>
          );
        })()}
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
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
                maxWidth: '400px',
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
                    background: '#FEF2F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DC2626',
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
                  Delete this reflection?
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
                This reflection will be permanently removed. This action cannot be undone.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  style={{
                    background: 'transparent',
                    border: '1px solid #E2E8F0',
                    borderRadius: '9999px',
                    padding: '8px 16px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{
                    background: '#DC2626',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '8px 18px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)'
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
