import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
  Plus,
  Calendar as CalendarIcon,
  Search,
  MoreVertical,
  Compass,
  X
} from 'lucide-react';
import { getUserJournalEntries } from '../../services/journalService';
import { getActiveUserId } from '../../services/authService';

import { extractEntryDisplay } from '../../services/journalFormatting';

// Group entries naturally by time (Today, Yesterday, This Week, Month Year)
function groupEntriesByTime(entries) {
  const groups = {};
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  entries.forEach((entry) => {
    const date = new Date(entry.created_at || entry.date || Date.now());
    let groupKey = '';

    if (date.toDateString() === today.toDateString()) {
      groupKey = 'TODAY';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'YESTERDAY';
    } else if (date >= oneWeekAgo) {
      groupKey = 'THIS WEEK';
    } else {
      groupKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(entry);
  });

  return groups;
}

export default function JournalHistoryScreen({
  onBack,
  onSelectEntry,
  onStartNewEntry,
  onOpenCalendar,
  onOpenSearch,
  onOpenPatterns,
  onOpenStory
}) {
  const shouldReduceMotion = useReducedMotion();
  const userId = getActiveUserId();

  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAllEntries() {
      try {
        const fetched = await getUserJournalEntries(userId, 50);
        if (isMounted) {
          setEntries(fetched);
        }
      } catch (err) {
        console.warn('[JournalHistory] Failed to load entries:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadAllEntries();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const groupedEntries = useMemo(() => groupEntriesByTime(entries), [entries]);
  const groupKeys = Object.keys(groupedEntries);

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
        .journal-history-container {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          padding: 16px 18px 96px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .header-action-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-action-btn {
          background: #FFFFFF;
          border: 1px solid #E6E1D8;
          border-radius: 9999px;
          width: 38px;
          height: 38px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #475569;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
          outline: none;
          transition: all 0.15s ease;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .header-action-btn.patterns-btn {
          background: #EDF7F6;
          color: #0F766E;
          border: 1px solid #D5ECE9;
        }

        .header-action-btn .btn-text {
          display: none;
        }

        .desktop-new-btn {
          display: none;
        }

        .mobile-cta-banner {
          display: flex;
        }

        .history-reflection-entry {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 18px 4px;
          border-bottom: 1px solid #ECE6DC;
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.15s ease;
          border-radius: 8px;
        }

        .history-reflection-entry:hover {
          transform: translateX(2px);
        }

        .history-reflection-entry:last-child {
          border-bottom: none;
        }

        .skeleton-pulse {
          background: linear-gradient(90deg, #F0EBE1 25%, #F8F5EE 50%, #F0EBE1 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
          border-radius: 8px;
        }

        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (min-width: 680px) {
          .journal-history-container {
            padding: 28px 24px 100px;
            gap: 32px;
          }

          .header-action-btn {
            width: auto;
            padding: 8px 14px;
          }

          .header-action-btn .btn-text {
            display: inline;
          }

          .desktop-new-btn {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .mobile-cta-banner {
            display: none;
          }

          .history-reflection-entry {
            padding: 20px 8px;
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
          background: 'radial-gradient(ellipse at 50% 0%, rgba(243, 238, 228, 0.95) 0%, rgba(250, 247, 242, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="journal-history-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Header Navigation */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            position: 'relative',
            zIndex: 30
          }}
        >
          {/* Left Back Button */}
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Back to reflection setup"
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
              outline: 'none',
              flexShrink: 0
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </motion.button>

          {/* Right Header Action Controls - Outside on both mobile & desktop */}
          <div className="header-action-controls">
            {onOpenSearch && (
              <motion.button
                type="button"
                onClick={onOpenSearch}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                aria-label="Search thoughts"
                title="Search thoughts"
                className="header-action-btn"
              >
                <Search size={15} strokeWidth={2.2} />
                <span className="btn-text">Search</span>
              </motion.button>
            )}

            {onOpenPatterns && (
              <motion.button
                type="button"
                onClick={onOpenPatterns}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                aria-label="Your patterns"
                title="Your patterns"
                className="header-action-btn patterns-btn"
              >
                <Sparkles size={15} strokeWidth={2.2} />
                <span className="btn-text">Patterns</span>
              </motion.button>
            )}

            {onOpenCalendar && (
              <motion.button
                type="button"
                onClick={onOpenCalendar}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                aria-label="Journey timeline"
                title="Journey timeline"
                className="header-action-btn"
              >
                <CalendarIcon size={15} strokeWidth={2.2} />
                <span className="btn-text">Journey</span>
              </motion.button>
            )}

            {onOpenStory && (
              <motion.button
                type="button"
                onClick={onOpenStory}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                aria-label="Your personal story"
                title="Your personal story"
                className="header-action-btn"
                style={{
                  background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                  color: '#FDE68A',
                  border: '1px solid #334155'
                }}
              >
                <Compass size={15} strokeWidth={2.2} />
                <span className="btn-text" style={{ color: '#FFFFFF' }}>Story</span>
              </motion.button>
            )}

            {onStartNewEntry && (
              <motion.button
                type="button"
                onClick={onStartNewEntry}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="desktop-new-btn"
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '8px 18px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)'
                }}
              >
                <Plus size={15} strokeWidth={2.4} />
                <span>New reflection</span>
              </motion.button>
            )}
          </div>
        </header>

        {/* Page Title & Editorial Introduction */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#64748B',
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}
          >
            YOUR JOURNAL
          </span>

          <h1
            style={{
              fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
              fontSize: 'clamp(2.2rem, 5.8vw, 2.9rem)',
              fontWeight: 600,
              color: '#0F172A',
              margin: 0,
              lineHeight: 1.12,
              letterSpacing: '-0.025em'
            }}
          >
            Your Reflections
          </h1>

          <p style={{ fontSize: '0.94rem', color: '#64748B', margin: '4px 0 0', lineHeight: 1.5 }}>
            A collection of moments you've taken time to reflect.
          </p>
        </div>

        {/* Mobile Primary New Reflection Button (Clearly accessible, full-width below intro) */}
        {onStartNewEntry && (
          <div className="mobile-cta-banner" style={{ width: '100%' }}>
            <motion.button
              type="button"
              onClick={onStartNewEntry}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '12px 20px',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 3px 12px rgba(15, 23, 42, 0.16)',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} strokeWidth={2.4} />
              <span>New reflection</span>
            </motion.button>
          </div>
        )}

        {/* Grouped Chronological Timeline (Skeleton vs Rendered) */}
        {isLoading && entries.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="skeleton-pulse" style={{ height: '70px', borderRadius: '12px' }} />
            <div className="skeleton-pulse" style={{ height: '70px', borderRadius: '12px' }} />
            <div className="skeleton-pulse" style={{ height: '70px', borderRadius: '12px' }} />
          </div>
        ) : entries.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {groupKeys.map((groupKey) => (
              <section key={groupKey} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#94A3B8',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    paddingBottom: '6px'
                  }}
                >
                  {groupKey}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {groupedEntries[groupKey].map((entry) => {
                    const display = extractEntryDisplay(entry);

                    return (
                      <motion.div
                        key={entry.id}
                        className="history-reflection-entry"
                        onClick={() => onSelectEntry(entry)}
                      >
                        {/* 1. Strong Primary Title */}
                        <h3
                          style={{
                            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                            fontSize: 'clamp(1.2rem, 3.8vw, 1.45rem)',
                            fontWeight: 600,
                            color: '#0F172A',
                            margin: 0,
                            lineHeight: 1.3,
                            letterSpacing: '-0.015em'
                          }}
                        >
                          {display.displayTitle}
                        </h3>

                        {/* 2. Secondary Metadata: Dot + Mood + Reflection Type + Date */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexWrap: 'wrap',
                            fontSize: '0.8rem',
                            color: '#64748B',
                            fontWeight: 500
                          }}
                        >
                          {display.emotion && (
                            <>
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: display.emotionColor,
                                  flexShrink: 0
                                }}
                              />
                              <span style={{ fontWeight: 600, color: '#334155' }}>
                                {display.emotion}
                              </span>
                              <span>·</span>
                            </>
                          )}

                          <span>{display.typeMeta.label}</span>
                          <span>·</span>
                          <span style={{ color: '#94A3B8' }}>{display.relativeDate}</span>
                        </div>

                        {/* 3. Clean 2-Line Excerpt Preview (pure user reflection content, zero markdown headers) */}
                        {display.userSnippet && (
                          <p
                            style={{
                              fontSize: '0.88rem',
                              color: '#52525B',
                              margin: '2px 0 0',
                              lineHeight: 1.55,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {display.userSnippet}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : !isLoading ? (
          /* Warm Minimal Empty State */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '60px 20px',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#F0EBE1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#78716C',
                marginBottom: '4px'
              }}
            >
              <BookOpen size={20} strokeWidth={2} />
            </div>

            <h3
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: '1.35rem',
                fontWeight: 600,
                color: '#0F172A',
                margin: 0
              }}
            >
              Your reflections will appear here
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#78716C', maxWidth: '320px', margin: 0, lineHeight: 1.5 }}>
              Every reflection begins with a moment to pause. Start writing whenever something is on your mind.
            </p>

            {onStartNewEntry && (
              <motion.button
                type="button"
                onClick={onStartNewEntry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '10px 22px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Start writing</span>
                <ArrowRight size={14} strokeWidth={2.4} />
              </motion.button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
