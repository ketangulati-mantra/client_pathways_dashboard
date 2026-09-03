import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  BookOpen,
  Plus,
  PenTool,
  Sun,
  Calendar as CalendarIcon
} from 'lucide-react';
import { getJournalEcosystemData } from '../../services/journalService';
import { getActiveUserId } from '../../services/authService';
import { extractEntryDisplay } from '../../services/journalFormatting';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function JournalCalendarScreen({
  onBack,
  onSelectEntry,
  onStartReflectionOnDate
}) {
  const shouldReduceMotion = useReducedMotion();
  const userId = getActiveUserId();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayViewDate, setDayViewDate] = useState(null); // When set, renders the dedicated Day View Page
  const [entries, setEntries] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fast Unified Data Load via purpose-built ecosystem-data API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const { journals, checkIns: userCheckIns } = await getJournalEcosystemData(userId, 100);
        if (isMounted) {
          setEntries(journals || []);
          setCheckIns(userCheckIns || []);
        }
      } catch (err) {
        console.warn('[JournalCalendar] Failed to load data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation handlers
  const canGoNextMonth = useMemo(() => {
    const today = new Date();
    return (
      currentYear < today.getFullYear() ||
      (currentYear === today.getFullYear() && currentMonth < today.getMonth())
    );
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    if (canGoNextMonth) {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    }
  };

  // Build calendar matrix for current month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();

    const days = [];

    // Leading empty slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ empty: true, key: `empty-${i}` });
    }

    // Actual month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(currentYear, currentMonth, dayNum);
      const dateKey = formatDateKey(d);
      const isFuture = d > today && d.toDateString() !== today.toDateString();
      const isToday = d.toDateString() === today.toDateString();
      const isSelected = selectedDate && d.toDateString() === selectedDate.toDateString();

      // Find matching journal entries for this date
      const dayEntries = entries.filter((e) => {
        const eDate = new Date(e.check_in_date || e.created_at || e.date);
        return eDate.toDateString() === d.toDateString();
      });

      // Find matching check-in for this date
      const dayCheckIn = checkIns.find((c) => {
        const cDate = new Date(c.created_at);
        return cDate.toDateString() === d.toDateString();
      });

      days.push({
        dayNum,
        date: d,
        dateKey,
        isFuture,
        isToday,
        isSelected,
        entries: dayEntries,
        hasEntries: dayEntries.length > 0,
        checkIn: dayCheckIn,
        hasCheckIn: Boolean(dayCheckIn)
      });
    }

    return days;
  }, [currentYear, currentMonth, selectedDate, entries, checkIns]);

  // Selected date context
  const selectedDateEntries = useMemo(() => {
    if (!selectedDate) return [];
    return entries.filter((e) => {
      const eDate = new Date(e.check_in_date || e.created_at || e.date);
      return eDate.toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, entries]);

  const selectedDateCheckIn = useMemo(() => {
    if (!selectedDate) return null;
    return checkIns.find((c) => {
      const cDate = new Date(c.created_at);
      return cDate.toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, checkIns]);

  // Day View specific date entries (for the dedicated new page view)
  const dayViewEntries = useMemo(() => {
    if (!dayViewDate) return [];
    return entries.filter((e) => {
      const eDate = new Date(e.check_in_date || e.created_at || e.date);
      return eDate.toDateString() === dayViewDate.toDateString();
    });
  }, [dayViewDate, entries]);

  const dayViewCheckIn = useMemo(() => {
    if (!dayViewDate) return null;
    return checkIns.find((c) => {
      const cDate = new Date(c.created_at);
      return cDate.toDateString() === dayViewDate.toDateString();
    });
  }, [dayViewDate, checkIns]);

  // Count reflections in this month
  const monthEntriesCount = useMemo(() => {
    return entries.filter((e) => {
      const eDate = new Date(e.check_in_date || e.created_at || e.date);
      return eDate.getFullYear() === currentYear && eDate.getMonth() === currentMonth;
    }).length;
  }, [entries, currentYear, currentMonth]);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedDateFormatted = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  const dayViewDateFormatted = dayViewDate
    ? dayViewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  const isSelectedToday = selectedDate && selectedDate.toDateString() === new Date().toDateString();

  // ==========================================
  // DEDICATED DAY VIEW PAGE (When dayViewDate is set)
  // ==========================================
  if (dayViewDate) {
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
          .journal-dayview-container {
            width: 100%;
            max-width: 760px;
            margin: 0 auto;
            padding: 16px 16px 96px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .dayview-entry-item {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 18px 20px;
            background: #FFFFFF;
            border: 1px solid #ECE7DF;
            border-radius: 18px;
            cursor: pointer;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            width: 100%;
            box-sizing: border-box;
            overflow-wrap: break-word;
            word-break: break-word;
          }

          .dayview-entry-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
          }

          @media (min-width: 480px) {
            .journal-dayview-container {
              padding: 20px 20px 96px;
              gap: 28px;
            }
          }

          @media (min-width: 680px) {
            .journal-dayview-container {
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

        <div className="journal-dayview-container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Day View Header */}
          <header style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <motion.button
                type="button"
                onClick={() => setDayViewDate(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Back to Calendar"
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px', width: '100%' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                DAILY REFLECTIONS
              </span>
              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(1.85rem, 5vw, 2.5rem)',
                  fontWeight: 600,
                  color: '#0F172A',
                  margin: 0,
                  lineHeight: 1.15,
                  letterSpacing: '-0.025em',
                  wordBreak: 'break-word'
                }}
              >
                {dayViewDateFormatted}
              </h1>
              <span style={{ fontSize: '0.9rem', color: '#64748B' }}>
                {dayViewEntries.length} reflection{dayViewEntries.length > 1 ? 's' : ''} recorded on this day
              </span>
            </div>

            {/* Check-in Context Chip */}
            {dayViewCheckIn?.primary_emotion && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '9999px',
                  padding: '5px 12px',
                  fontSize: '0.82rem',
                  color: '#334155',
                  width: 'fit-content',
                  marginTop: '4px'
                }}
              >
                <span>🫧 Daily Check-in:</span>
                <strong>{dayViewCheckIn.primary_emotion}</strong>
              </div>
            )}
          </header>

          {/* Reflections List for this specific Day */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
            {dayViewEntries.map((entry) => {
              const display = extractEntryDisplay(entry);
              const isGuided = entry.entry_type === 'guided_prompt';

              return (
                <motion.div
                  key={entry.id}
                  className="dayview-entry-item"
                  onClick={() => onSelectEntry(entry)}
                >
                  {/* Header Row: Reflection Type Badge & Mood Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: display.typeMeta.accentColor,
                        background: display.typeMeta.bgColor,
                        border: `1px solid ${display.typeMeta.borderColor}`,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {display.typeMeta.label}
                    </span>

                    {display.emotion && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: display.emotionColor,
                            flexShrink: 0
                          }}
                        />
                        <span>{display.emotion}</span>
                      </div>
                    )}
                  </div>

                  {/* Guided Reflection Layout: [Prompt] */}
                  {isGuided && display.originalPrompt && (
                    <span
                      style={{
                        fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                        fontSize: 'clamp(1.1rem, 3.8vw, 1.25rem)',
                        fontWeight: 600,
                        color: '#0F172A',
                        lineHeight: 1.35,
                        letterSpacing: '-0.015em',
                        wordBreak: 'break-word'
                      }}
                    >
                      "{display.originalPrompt}"
                    </span>
                  )}

                  {/* Reflect on Today or Free Write Title */}
                  {!isGuided && display.displayTitle && (
                    <span
                      style={{
                        fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                        fontSize: 'clamp(1.1rem, 3.8vw, 1.25rem)',
                        fontWeight: 600,
                        color: '#0F172A',
                        letterSpacing: '-0.015em',
                        wordBreak: 'break-word'
                      }}
                    >
                      {display.displayTitle}
                    </span>
                  )}

                  {/* User's Actual Written Reflection (Rendered only if meaningful content exists) */}
                  {display.userSnippet ? (
                    <p
                      style={{
                        fontSize: 'clamp(0.85rem, 2.6vw, 0.9rem)',
                        color: '#475569',
                        margin: 0,
                        lineHeight: 1.55,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}
                    >
                      {display.userSnippet}
                    </p>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN JOURNEY CALENDAR VIEW
  // ==========================================
  const latestEntry = selectedDateEntries[0] || null;

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
        .journal-calendar-container {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding: 16px 16px 96px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .calendar-surface-card {
          background: #FFFFFF;
          border: 1px solid #EAE5DB;
          border-radius: 20px;
          padding: 18px 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.015);
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
        }

        .calendar-weekdays-grid {
          display: grid !important;
          grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
          gap: 4px;
          width: 100% !important;
          box-sizing: border-box !important;
          text-align: center;
          align-items: center;
        }

        .calendar-weekday-item {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          font-size: clamp(0.7rem, 2.5vw, 0.78rem);
          font-weight: 600;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 2px 0;
          box-sizing: border-box;
        }

        .calendar-grid-cells {
          display: grid !important;
          grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
          gap: 4px;
          width: 100% !important;
          box-sizing: border-box !important;
          justify-items: center;
        }

        .calendar-day-cell {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: clamp(0.82rem, 3.2vw, 0.94rem);
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
          user-select: none;
          width: 100%;
          max-width: 40px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .selected-date-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
        }

        .selected-date-heading {
          font-size: 0.76rem;
          font-weight: 700;
          color: #64748B;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          word-break: break-word;
          flex: 1 1 auto;
          min-width: 130px;
        }

        .selected-date-emotion-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 9999px;
          padding: 4px 10px;
          font-size: 0.78rem;
          color: #334155;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .selected-day-entry-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          background: #FFFFFF;
          border: 1px solid #ECE7DF;
          border-radius: 18px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          width: 100%;
          box-sizing: border-box;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .selected-day-entry-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
        }

        .view-all-day-btn {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 11px 16px;
          font-size: 0.84rem;
          font-weight: 600;
          color: #0F172A;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          transition: all 0.15s ease;
          box-sizing: border-box;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
        }

        .view-all-day-btn:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
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
          .journal-calendar-container {
            padding: 20px 20px 96px;
            gap: 28px;
          }

          .calendar-surface-card {
            padding: 22px 18px;
            border-radius: 24px;
          }

          .calendar-weekdays-grid,
          .calendar-grid-cells {
            gap: 6px;
          }

          .calendar-day-cell {
            max-width: 44px;
          }
        }

        @media (min-width: 680px) {
          .journal-calendar-container {
            padding: 32px 28px 100px;
            gap: 32px;
          }

          .calendar-surface-card {
            padding: 24px 20px;
          }

          .calendar-weekdays-grid,
          .calendar-grid-cells {
            gap: 10px;
          }

          .selected-day-entry-item {
            padding: 18px 20px;
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

      <div className="journal-calendar-container" style={{ position: 'relative', zIndex: 1 }}>
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
              Your Journey
            </h1>
            <span style={{ fontSize: 'clamp(0.85rem, 2.6vw, 0.92rem)', color: '#64748B', lineHeight: 1.5 }}>
              A quiet look back at the moments you've taken for yourself.
            </span>
          </div>
        </header>

        {/* 1. Monthly Calendar Surface */}
        <div className="calendar-surface-card">
          {/* Month Navigation Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <motion.button
              type="button"
              onClick={handlePrevMonth}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: '#FAF7F2',
                border: '1px solid #EAE5DB',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
                flexShrink: 0
              }}
            >
              <ChevronLeft size={16} strokeWidth={2.2} />
            </motion.button>

            <span
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: 'clamp(1.12rem, 3.8vw, 1.25rem)',
                fontWeight: 600,
                color: '#0F172A',
                textAlign: 'center'
              }}
            >
              {monthName}
            </span>

            <motion.button
              type="button"
              onClick={handleNextMonth}
              disabled={!canGoNextMonth}
              whileHover={canGoNextMonth ? { scale: 1.05 } : {}}
              whileTap={canGoNextMonth ? { scale: 0.95 } : {}}
              style={{
                background: '#FAF7F2',
                border: '1px solid #EAE5DB',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: canGoNextMonth ? '#334155' : '#CBD5E1',
                cursor: canGoNextMonth ? 'pointer' : 'default',
                outline: 'none',
                flexShrink: 0
              }}
            >
              <ChevronRight size={16} strokeWidth={2.2} />
            </motion.button>
          </div>

          {/* Weekday Headers (Strict 7-column Grid) */}
          <div className="calendar-weekdays-grid">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="calendar-weekday-item">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid (Immediate Skeleton vs Rendered Cells) */}
          {isLoading && entries.length === 0 ? (
            <div className="calendar-grid-cells">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton-pulse"
                  style={{
                    aspectRatio: '1',
                    borderRadius: '50%',
                    maxWidth: '40px',
                    margin: '0 auto',
                    width: '100%'
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="calendar-grid-cells">
              {calendarDays.map((cell) => {
                if (cell.empty) {
                  return <div key={cell.key} style={{ aspectRatio: '1', width: '100%' }} />;
                }

                let cellBg = 'transparent';
                let cellColor = '#0F172A';
                let border = '1px solid transparent';

                if (cell.isFuture) {
                  cellColor = '#CBD5E1';
                } else if (cell.isSelected) {
                  cellBg = '#0F172A';
                  cellColor = '#FFFFFF';
                } else if (cell.hasEntries) {
                  cellBg = '#FAF3E8'; // Warm soft filled highlight
                  cellColor = '#B45309';
                  border = '1px solid #EFE2CE';
                } else if (cell.hasCheckIn) {
                  cellBg = '#EDF7F6'; // Calm sage tint
                  cellColor = '#0F766E';
                }

                if (cell.isToday && !cell.isSelected) {
                  border = '1px solid #0284C7';
                }

                return (
                  <div
                    key={cell.dateKey}
                    onClick={() => {
                      if (!cell.isFuture) {
                        handleSelectDate(cell.date);
                      }
                    }}
                    className="calendar-day-cell"
                    style={{
                      background: cellBg,
                      color: cellColor,
                      border,
                      cursor: cell.isFuture ? 'default' : 'pointer'
                    }}
                  >
                    <span>{cell.dayNum}</span>
                    {cell.hasEntries && !cell.isSelected && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '3px',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: '#B45309'
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Selected Date Reflection Context Surface */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
          <div className="selected-date-header-row">
            <span className="selected-date-heading">
              {selectedDateFormatted}
            </span>

            {/* Check-in mood context pill */}
            {selectedDateCheckIn?.primary_emotion && (
              <div className="selected-date-emotion-pill">
                <span>🫧 Checked in:</span>
                <strong>{selectedDateCheckIn.primary_emotion}</strong>
              </div>
            )}
          </div>

          {/* Reflections for Selected Date: SHOW LATEST ONLY BY DEFAULT */}
          {isLoading && entries.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <div className="skeleton-pulse" style={{ height: '90px', borderRadius: '18px', width: '100%' }} />
              <div className="skeleton-pulse" style={{ height: '90px', borderRadius: '18px', width: '100%' }} />
            </div>
          ) : latestEntry ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {(() => {
                const display = extractEntryDisplay(latestEntry);
                const isGuided = latestEntry.entry_type === 'guided_prompt';

                return (
                  <motion.div
                    key={latestEntry.id}
                    className="selected-day-entry-item"
                    onClick={() => onSelectEntry(latestEntry)}
                  >
                    {/* Header Row: Reflection Type Badge & Mood Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: display.typeMeta.accentColor,
                          background: display.typeMeta.bgColor,
                          border: `1px solid ${display.typeMeta.borderColor}`,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {display.typeMeta.label}
                      </span>

                      {display.emotion && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: display.emotionColor,
                              flexShrink: 0
                            }}
                          />
                          <span>{display.emotion}</span>
                        </div>
                      )}
                    </div>

                    {/* Guided Reflection Layout: [Prompt] -> [User Response] */}
                    {isGuided && display.originalPrompt && (
                      <span
                        style={{
                          fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                          fontSize: 'clamp(1.05rem, 3.5vw, 1.18rem)',
                          fontWeight: 600,
                          color: '#0F172A',
                          lineHeight: 1.35,
                          letterSpacing: '-0.015em',
                          wordBreak: 'break-word'
                        }}
                      >
                        "{display.originalPrompt}"
                      </span>
                    )}

                    {/* Reflect on Today or Free Write Title */}
                    {!isGuided && display.displayTitle && (
                      <span
                        style={{
                          fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                          fontSize: 'clamp(1.05rem, 3.5vw, 1.18rem)',
                          fontWeight: 600,
                          color: '#0F172A',
                          letterSpacing: '-0.015em',
                          wordBreak: 'break-word'
                        }}
                      >
                        {display.displayTitle}
                      </span>
                    )}

                    {/* User's Actual Written Reflection (Rendered only if meaningful content exists) */}
                    {display.userSnippet ? (
                      <p
                        style={{
                          fontSize: 'clamp(0.84rem, 2.6vw, 0.88rem)',
                          color: '#475569',
                          margin: 0,
                          lineHeight: 1.55,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word'
                        }}
                      >
                        {display.userSnippet}
                      </p>
                    ) : null}
                  </motion.div>
                );
              })()}

              {/* View All on New Page Button for Multi-Entry Days */}
              {selectedDateEntries.length > 1 && (
                <motion.button
                  type="button"
                  onClick={() => setDayViewDate(selectedDate)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="view-all-day-btn"
                >
                  <span>View all {selectedDateEntries.length} reflections for this day</span>
                  <ArrowRight size={15} />
                </motion.button>
              )}
            </div>
          ) : (
            /* Gentle No-Reflection State (Never guilty) */
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #ECE7DF',
                borderRadius: '18px',
                padding: '22px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <span style={{ fontSize: '0.94rem', fontWeight: 600, color: '#334155' }}>
                No reflection from this day.
              </span>
              <span style={{ fontSize: '0.86rem', color: '#64748B', maxWidth: '320px', lineHeight: 1.45 }}>
                {selectedDateCheckIn
                  ? `You checked in feeling ${selectedDateCheckIn.primary_emotion}. Would you like to add thoughts?`
                  : 'What would you like to remember about it?'}
              </span>

              {onStartReflectionOnDate && (
                <motion.button
                  type="button"
                  onClick={() => onStartReflectionOnDate(selectedDate)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '8px 18px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <PenTool size={14} />
                  <span>{isSelectedToday ? 'Write a reflection' : 'Reflect on this day'}</span>
                </motion.button>
              )}
            </div>
          )}
        </section>

        {/* 3. Monthly Reflection Summary */}
        {monthEntriesCount > 0 && (
          <div
            style={{
              padding: '16px 18px',
              background: '#FAF3E8',
              border: '1px solid #EFE2CE',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <Sparkles size={18} color="#B45309" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.88rem', color: '#78350F', lineHeight: 1.45 }}>
              You've taken <strong>{monthEntriesCount} moment{monthEntriesCount > 1 ? 's' : ''}</strong> to pause and reflect in {monthName}.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
