import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  Sun,
  Activity,
  Heart,
  Calendar,
  Compass,
  Clock,
  BarChart3,
  Feather,
  MessageCircle,
  Coffee,
  Sparkle
} from 'lucide-react';
import { getJournalEcosystemData } from '../../services/journalService';
import { getActiveUserId } from '../../services/authService';

const TIME_RANGES = [
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: 'all', label: 'All time', days: 9999 }
];

function isIntenseEmotion(emotion) {
  const e = (emotion || '').toLowerCase();
  return ['overwhelmed', 'anxious', 'stressed', 'frustrated', 'angry', 'exhausted', 'sad', 'panicked', 'panic', 'alarmed', 'terrified', 'fearful'].includes(e);
}

export default function JournalPatternsScreen({
  onBack,
  onOpenWrite,
  onNavigateToCalendar,
  onNavigateToHistory
}) {
  const shouldReduceMotion = useReducedMotion();
  const userId = getActiveUserId();

  const [timeRange, setTimeRange] = useState('30d');
  const [journalEntries, setJournalEntries] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fast Unified Data Load via purpose-built ecosystem-data API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const { journals, checkIns: userCheckIns } = await getJournalEcosystemData(userId, 100);
        if (isMounted) {
          setJournalEntries(journals || []);
          setCheckIns(userCheckIns || []);
        }
      } catch (err) {
        console.warn('[JournalPatterns] Error loading patterns data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Filter data strictly by selected timeframe
  const { filteredJournals, filteredCheckIns } = useMemo(() => {
    const selected = TIME_RANGES.find((t) => t.id === timeRange) || TIME_RANGES[1];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selected.days);

    const fJournals = journalEntries.filter((j) => {
      if (selected.id === 'all') return true;
      const d = new Date(j.created_at || j.date || Date.now());
      return d >= cutoff;
    });

    const fCheckIns = checkIns.filter((c) => {
      if (selected.id === 'all') return true;
      const d = new Date(c.created_at || Date.now());
      return d >= cutoff;
    });

    return { filteredJournals: fJournals, filteredCheckIns: fCheckIns };
  }, [journalEntries, checkIns, timeRange]);

  // Factual Activity Overview Metrics for the selected timeframe
  const metrics = useMemo(() => {
    const totalJournals = filteredJournals.length;
    const totalCheckIns = filteredCheckIns.length;

    let freeWriteCount = 0;
    let guidedCount = 0;
    let reflectTodayCount = 0;
    let totalWordCount = 0;

    filteredJournals.forEach((j) => {
      if (j.entry_type === 'reflect_today') reflectTodayCount++;
      else if (j.entry_type === 'guided_prompt') guidedCount++;
      else freeWriteCount++;

      const wordLen = (j.content || '').split(/\s+/).filter(Boolean).length;
      totalWordCount += wordLen;
    });

    const avgWords = totalJournals > 0 ? Math.round(totalWordCount / totalJournals) : 0;

    return {
      totalJournals,
      totalCheckIns,
      avgWords,
      freeWriteCount,
      guidedCount,
      reflectTodayCount
    };
  }, [filteredJournals, filteredCheckIns]);

  // ==========================================
  // OBSERVED PATTERNS & THEMES (INTERPRETED ANALYSIS)
  // Grounded in evidence with natural, human observations
  // ==========================================
  const patterns = useMemo(() => {
    const list = [];
    const totalEntriesCount = filteredJournals.length;

    // Strict threshold: At least 3 reflections are required to identify any pattern
    if (totalEntriesCount < 3) {
      return list;
    }

    const isEmergingTier = totalEntriesCount <= 5; // 3–5 entries

    // Helper: Collect all textual signals from prompts, titles, and responses
    const entryCorpus = filteredJournals.map((j) => {
      const prompt = (j.metadata?.prompt || j.title || '').toLowerCase();
      const content = (j.content || '').toLowerCase();
      const category = (j.metadata?.category || '').toLowerCase();
      const emotion = (j.emotion || '').toLowerCase();
      return {
        id: j.id,
        text: `${prompt} ${content} ${category} ${emotion}`,
        created_at: j.created_at || j.date || Date.now(),
        emotion: j.emotion
      };
    });

    // 1. Interpersonal Communication & Relational Openness
    const commMatches = entryCorpus.filter((e) =>
      e.text.includes('communication') ||
      e.text.includes('communicate') ||
      e.text.includes('openly') ||
      e.text.includes('express') ||
      e.text.includes('someone close') ||
      e.text.includes('relationship') ||
      e.text.includes('friends') ||
      e.text.includes('conversation') ||
      e.text.includes('people in your life')
    );

    if (commMatches.length >= 2) {
      const matchCount = commMatches.length;
      list.push({
        id: 'theme-communication',
        category: isEmergingTier ? 'Emerging theme' : 'Recurring theme',
        title: 'Finding space to say what\'s on your mind',
        description: 'A few recent reflections return to communication and expressing yourself more openly with people close to you.',
        basis: `Mentioned in ${matchCount} recent reflections`,
        icon: <MessageCircle size={15} color="#7C3AED" />,
        accentColor: '#7C3AED',
        actionLabel: 'Explore →',
        action: onNavigateToHistory
      });
    }

    // 2. Self-Compassion & Inner Growth
    const growthMatches = entryCorpus.filter((e) =>
      e.text.includes('strength') ||
      e.text.includes('pressure') ||
      e.text.includes('grow') ||
      e.text.includes('progress') ||
      e.text.includes('proud') ||
      e.text.includes('learn') ||
      e.text.includes('myself') ||
      e.text.includes('forgive') ||
      e.text.includes('patience') ||
      e.text.includes('grace')
    );

    if (growthMatches.length >= 2) {
      const matchCount = growthMatches.length;
      list.push({
        id: 'theme-growth',
        category: isEmergingTier ? 'Emerging theme' : 'Personal growth',
        title: 'Recognizing your strengths and progress',
        description: 'When looking at personal challenges, your entries often explore what you are learning about yourself rather than dwelling on setbacks.',
        basis: `Emerging across ${matchCount} reflections`,
        icon: <Compass size={15} color="#0F766E" />,
        accentColor: '#0F766E',
        actionLabel: 'Explore →',
        action: onNavigateToHistory
      });
    }

    // 3. Everyday Ease & Small Moments of Comfort
    const easeMatches = entryCorpus.filter((e) =>
      e.text.includes('gratitude') ||
      e.text.includes('grateful') ||
      e.text.includes('thankful') ||
      e.text.includes('coffee') ||
      e.text.includes('walk') ||
      e.text.includes('quiet') ||
      e.text.includes('morning') ||
      e.text.includes('simple') ||
      e.text.includes('comfort') ||
      e.text.includes('peace') ||
      e.text.includes('sun') ||
      e.text.includes('relief')
    );

    if (easeMatches.length >= 2) {
      const matchCount = easeMatches.length;
      list.push({
        id: 'theme-ease',
        category: isEmergingTier ? 'Emerging theme' : 'Moments of ease',
        title: 'Small moments seem meaningful to you',
        description: 'When positive experiences appear in your reflections, they often involve ordinary moments of comfort, connection, or quiet relief.',
        basis: `Appeared in ${matchCount} recent reflections`,
        icon: <Coffee size={15} color="#B45309" />,
        accentColor: '#B45309',
        actionLabel: 'Explore →',
        action: onNavigateToHistory
      });
    }

    // 4. Processing Heavier Emotions
    const intenseReflections = filteredJournals.filter((j) => j.emotion && isIntenseEmotion(j.emotion));
    if (intenseReflections.length >= 2) {
      const matchCount = intenseReflections.length;
      list.push({
        id: 'theme-supportive-space',
        category: 'Supportive space',
        title: 'Reaching for writing in heavier moments',
        description: 'You tend to turn to reflection when feeling heavier emotions, giving your thoughts room to settle and be processed.',
        basis: `Noticed across ${matchCount} entries`,
        icon: <Heart size={15} color="#0284C7" />,
        accentColor: '#0284C7',
        actionLabel: 'Explore →',
        action: onNavigateToCalendar
      });
    }

    // Limit list to top 2 patterns so we never overwhelm with AI cards
    return list.slice(0, 2);
  }, [filteredJournals, onNavigateToCalendar, onNavigateToHistory]);

  const hasDataInCurrentTimeframe = filteredJournals.length > 0 || filteredCheckIns.length > 0;
  const showStillTakingShape = patterns.length === 1;

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
        boxSizing: 'border-box',
        overflowX: 'hidden',
        width: '100%'
      }}
    >
      <style>{`
        .patterns-container {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding: 16px 16px 96px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .metric-summary-card {
          background: #FFFFFF;
          border: 1px solid #ECE7DF;
          border-radius: 18px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
          width: 100%;
          box-sizing: border-box;
        }

        .pattern-card-compact {
          background: #FFFFFF;
          border: 1px solid #ECE7DF;
          border-radius: 18px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-sizing: border-box;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          width: 100%;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .pattern-card-compact:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
        }

        .taking-shape-card {
          background: #F8F5EE;
          border: 1px dashed #E2DBCF;
          border-radius: 16px;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-sizing: border-box;
          width: 100%;
        }

        .early-stage-observation-card {
          background: #FFFFFF;
          border: 1px solid #ECE7DF;
          border-radius: 18px;
          padding: 22px 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 10px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
          width: 100%;
          box-sizing: border-box;
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

        @media (min-width: 480px) {
          .patterns-container {
            padding: 20px 20px 96px;
            gap: 28px;
          }

          .metric-summary-card {
            padding: 20px 22px;
            border-radius: 20px;
          }

          .pattern-card-compact {
            padding: 18px 20px;
            border-radius: 20px;
          }

          .early-stage-observation-card {
            padding: 24px 24px;
            border-radius: 20px;
          }
        }

        @media (min-width: 680px) {
          .patterns-container {
            padding: 32px 28px 100px;
            gap: 32px;
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
          background: 'radial-gradient(ellipse at 50% 0%, rgba(243, 238, 228, 0.9) 0%, rgba(250, 247, 242, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="patterns-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Header */}
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px', width: '100%' }}>
            <h1
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: 'clamp(1.95rem, 5.5vw, 2.75rem)',
                fontWeight: 600,
                color: '#0F172A',
                margin: 0,
                lineHeight: 1.12,
                letterSpacing: '-0.025em',
                wordBreak: 'break-word'
              }}
            >
              Your Patterns
            </h1>
            <span style={{ fontSize: 'clamp(0.85rem, 2.6vw, 0.92rem)', color: '#64748B', lineHeight: 1.5 }}>
              Interpreted observations and recurring themes across your reflections.
            </span>
          </div>
        </header>

        {/* Time Period Selector Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {TIME_RANGES.map((t) => {
            const isSelected = timeRange === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id)}
                style={{
                  background: isSelected ? '#0F172A' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  border: isSelected ? '1px solid #0F172A' : '1px solid #E6E1D8',
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* 1. FACTUAL ACTIVITY OVERVIEW (Factual Counts & Formats) */}
        {isLoading && journalEntries.length === 0 ? (
          <div className="metric-summary-card">
            <div className="skeleton-pulse" style={{ height: '14px', width: '120px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div className="skeleton-pulse" style={{ height: '50px' }} />
              <div className="skeleton-pulse" style={{ height: '50px' }} />
              <div className="skeleton-pulse" style={{ height: '50px' }} />
            </div>
          </div>
        ) : hasDataInCurrentTimeframe ? (
          <div className="metric-summary-card">
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ACTIVITY OVERVIEW
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', fontFamily: 'Newsreader, Georgia, serif' }}>
                  {metrics.totalJournals}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Reflections logged
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F766E', fontFamily: 'Newsreader, Georgia, serif' }}>
                  {metrics.totalCheckIns}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Daily check-ins
                </span>
              </div>

              {metrics.avgWords > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7C3AED', fontFamily: 'Newsreader, Georgia, serif' }}>
                    {metrics.avgWords}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Avg words / entry
                  </span>
                </div>
              )}
            </div>

            {/* Reflection Types Distribution */}
            {metrics.totalJournals > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '8px', borderTop: '1px solid #F1ECE3' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>
                  Reflection Formats:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {metrics.freeWriteCount > 0 && (
                    <span style={{ fontSize: '0.76rem', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F766E', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      ✍️ Free Write ({metrics.freeWriteCount})
                    </span>
                  )}
                  {metrics.guidedCount > 0 && (
                    <span style={{ fontSize: '0.76rem', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#7C3AED', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      💡 Guided ({metrics.guidedCount})
                    </span>
                  )}
                  {metrics.reflectTodayCount > 0 && (
                    <span style={{ fontSize: '0.76rem', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#B45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      🌅 Reflect on Today ({metrics.reflectTodayCount})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* 2. OBSERVED PATTERNS (COMPACT, LIGHTWEIGHT & GROUNDED) */}
        {isLoading && journalEntries.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton-pulse" style={{ height: '90px', borderRadius: '18px' }} />
            <div className="skeleton-pulse" style={{ height: '90px', borderRadius: '18px' }} />
          </div>
        ) : patterns.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              OBSERVED PATTERNS
            </span>

            {patterns.map((pattern) => (
              <motion.div
                key={pattern.id}
                className="pattern-card-compact"
              >
                {/* Category Header: Icon + Subtle Eyebrow Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {pattern.icon}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: pattern.accentColor,
                      letterSpacing: '0.04em'
                    }}
                  >
                    {pattern.category}
                  </span>
                </div>

                {/* Observation Title */}
                <h3
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(1.1rem, 3.5vw, 1.25rem)',
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: 0,
                    lineHeight: 1.3
                  }}
                >
                  {pattern.title}
                </h3>

                {/* Grounded Explanation */}
                <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  {pattern.description}
                </p>

                {/* Footer Row: Evidence + Subtle Explore CTA */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '4px',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                    {pattern.basis}
                  </span>

                  {pattern.action && (
                    <button
                      type="button"
                      onClick={pattern.action}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: pattern.accentColor,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        outline: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <span>{pattern.actionLabel}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Soft Secondary State: "Still taking shape" */}
            {showStillTakingShape && (
              <div className="taking-shape-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkle size={13} color="#78716C" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#78716C', letterSpacing: '0.04em' }}>
                    STILL TAKING SHAPE
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                  More reflections will help reveal which themes continue to show up over time.
                </p>
              </div>
            )}
          </div>
        ) : !isLoading ? (
          /* Early-Stage Editorial Observation Section */
          <div className="early-stage-observation-card">
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#78716C',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              EARLY IN YOUR JOURNEY
            </span>

            <h3
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: 'clamp(1.2rem, 3.8vw, 1.35rem)',
                fontWeight: 600,
                color: '#0F172A',
                margin: 0,
                lineHeight: 1.25
              }}
            >
              Your story is still taking shape
            </h3>

            <p
              style={{
                fontSize: '0.88rem',
                color: '#475569',
                maxWidth: '460px',
                margin: 0,
                lineHeight: 1.55
              }}
            >
              You've started creating moments worth looking back on. As you continue reflecting, recurring themes and changes over time will begin to emerge.
            </p>

            {/* Subtle factual progress line using real canonical data */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: '#78716C',
                fontWeight: 500,
                marginTop: '2px'
              }}
            >
              <span>
                {filteredJournals.length} {filteredJournals.length === 1 ? 'reflection' : 'reflections'}
                {' · '}
                {filteredCheckIns.length} {filteredCheckIns.length === 1 ? 'check-in' : 'check-ins'} so far
              </span>
            </div>

            {/* Subtle text/action link CTA */}
            <button
              type="button"
              onClick={onOpenWrite || onNavigateToHistory || onBack}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0F172A',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 0',
                marginTop: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                outline: 'none',
                transition: 'color 0.15s ease'
              }}
            >
              <span>Keep reflecting</span>
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
