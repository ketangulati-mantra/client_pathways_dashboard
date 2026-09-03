import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Search, X, BookOpen, Sparkles } from 'lucide-react';
import { searchUserJournalEntries, getUserJournalEntries } from '../../services/journalService';
import { getActiveUserId } from '../../services/authService';
import { extractEntryDisplay } from '../../services/journalFormatting';

// Highlight matching words softly
function highlightMatch(text, query) {
  if (!text || !query || !query.trim()) return text;
  const q = query.trim();
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        style={{
          background: 'rgba(254, 243, 199, 0.9)',
          color: '#0F172A',
          padding: '0 2px',
          borderRadius: '3px',
          fontWeight: 600
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const FILTER_CHIPS = [
  { id: 'all', label: 'All reflections' },
  { id: 'free_write', label: 'Free Write' },
  { id: 'reflect_today', label: 'Reflect on Today' },
  { id: 'guided_prompt', label: 'Guided Prompts' }
];

export default function JournalSearchScreen({
  initialQuery = '',
  onBack,
  onSelectEntry
}) {
  const shouldReduceMotion = useReducedMotion();
  const userId = getActiveUserId();

  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery.trim()));
  const [suggestedThemes, setSuggestedThemes] = useState([]);

  const inputRef = useRef(null);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Fetch real past reflection words for suggestions
  useEffect(() => {
    let isMounted = true;
    async function loadSuggestions() {
      try {
        const recent = await getUserJournalEntries(userId, 15);
        if (isMounted && Array.isArray(recent)) {
          const themes = new Set();
          recent.forEach((r) => {
            if (r.emotion) themes.add(r.emotion);
            if (r.metadata?.category) themes.add(r.metadata.category);
          });
          setSuggestedThemes(Array.from(themes).slice(0, 6));
        }
      } catch {}
    }
    loadSuggestions();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Debounced Search logic
  const executeSearch = useCallback(
    async (searchTerm, filterType) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) {
        setResults([]);
        setHasSearched(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const matched = await searchUserJournalEntries(trimmed, filterType, 40);
        setResults(matched);
      } catch (err) {
        console.warn('[JournalSearch] Search error:', err);
      } finally {
        setIsSearching(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(query, activeFilter);
    }, 280);

    return () => clearTimeout(timer);
  }, [query, activeFilter, executeSearch]);

  const handleClearQuery = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSuggestionClick = (theme) => {
    setQuery(theme);
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
        .journal-search-container {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          padding: 16px 20px 96px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .journal-search-input {
          width: 100%;
          border: none;
          background: transparent;
          font-family: Newsreader, "Playfair Display", Georgia, serif;
          font-size: clamp(1.35rem, 3.8vw, 1.8rem);
          font-weight: 500;
          color: #0F172A;
          outline: none;
          padding: 0;
          margin: 0;
          line-height: 1.25;
        }

        .journal-search-input::placeholder {
          color: #94A3B8;
          font-weight: 400;
        }

        .search-result-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 18px 0;
          border-bottom: 1px solid #EBE5DB;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .search-result-row:last-child {
          border-bottom: none;
        }

        @media (min-width: 680px) {
          .journal-search-container {
            padding: 24px 28px 100px;
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
          background: 'radial-gradient(ellipse at 50% 0%, rgba(243, 238, 228, 0.9) 0%, rgba(250, 247, 242, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Top Sticky Search Bar */}
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
          gap: '14px',
          maxWidth: '780px',
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
            flexShrink: 0
          }}
        >
          <ArrowLeft size={17} strokeWidth={2.2} />
        </motion.button>

        {/* Input box container */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '10px' }}>
          <Search size={18} color="#64748B" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your thoughts..."
            className="journal-search-input"
            maxLength={100}
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClearQuery}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                outline: 'none'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Main Search Surface */}
      <main className="journal-search-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Optional Filter Chips */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '2px',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveFilter(chip.id)}
                style={{
                  background: isActive ? '#0F172A' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                  border: isActive ? '1px solid #0F172A' : '1px solid #E6E1D8',
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  outline: 'none'
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* 1. Pre-Search State (No query yet) */}
        {!hasSearched && query.trim().length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '48px 20px',
              gap: '16px'
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
                marginBottom: '2px'
              }}
            >
              <BookOpen size={20} strokeWidth={2} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h3
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: '1.35rem',
                  fontWeight: 600,
                  color: '#0F172A',
                  margin: 0
                }}
              >
                Look back through your reflections
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: '320px', margin: 0, lineHeight: 1.5 }}>
                Sometimes a few words are enough to bring a moment back.
              </p>
            </div>

            {/* Suggested Themes based on user's real past reflections */}
            {suggestedThemes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  EXPLORE YOUR REFLECTIONS
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', maxWidth: '360px' }}>
                  {suggestedThemes.map((theme, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSuggestionClick(theme)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '9999px',
                        padding: '5px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: '#334155',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* 2. Results List */}
        {hasSearched && results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                paddingBottom: '4px'
              }}
            >
              {results.length} {results.length === 1 ? 'REFLECTION' : 'REFLECTIONS'} FOUND
            </span>

            {results.map((entry) => {
              const display = extractEntryDisplay(entry);

              return (
                <motion.div
                  key={entry.id}
                  className="search-result-row"
                  whileHover={{ x: 2 }}
                  onClick={() => onSelectEntry(entry)}
                >
                  {/* Result Header */}
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        color: '#0F172A',
                        letterSpacing: '-0.015em'
                      }}
                    >
                      {highlightMatch(display.displayTitle, query)}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {display.emotion && (
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: display.emotionColor
                          }}
                        />
                      )}
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>
                        {display.relativeDate} · {display.typeMeta.label}
                      </span>
                    </div>
                  </div>

                  {/* Result Content Preview with Matching Highlight */}
                  {display.userSnippet && (
                    <p
                      style={{
                        fontSize: '0.88rem',
                        color: '#52525B',
                        margin: 0,
                        lineHeight: 1.55,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {highlightMatch(display.userSnippet, query)}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : null}

        {/* 3. Empty Search Results (No match) */}
        {hasSearched && !isSearching && results.length === 0 && query.trim().length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '60px 20px',
              gap: '8px'
            }}
          >
            <span
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: '1.3rem',
                fontWeight: 600,
                color: '#0F172A'
              }}
            >
              Nothing came up
            </span>
            <span style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: '300px', lineHeight: 1.5 }}>
              Try a different word or phrase.
            </span>
          </div>
        ) : null}
      </main>
    </div>
  );
}
