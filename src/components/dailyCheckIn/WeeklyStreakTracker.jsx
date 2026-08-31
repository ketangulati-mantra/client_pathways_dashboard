import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame, Check } from 'lucide-react';

export default function WeeklyStreakTracker({
  currentStreak = 0,
  completedToday = false,
  compact = false
}) {
  const shouldReduceMotion = useReducedMotion();

  // Days of current week starting Monday (0) to Sunday (6)
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Current day index in week (0 = Monday, ..., 6 = Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const currentDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Determine status for each day of the current week:
  // 'completed_flame' | 'completed_check' | 'today_pending' | 'upcoming' | 'missed'
  const weekDays = dayLabels.map((label, index) => {
    const isPast = index < currentDayIndex;
    const isToday = index === currentDayIndex;
    const isFuture = index > currentDayIndex;

    // How many consecutive days prior to today are counted
    const streakOffsetFromToday = currentDayIndex - index;

    if (isToday) {
      return {
        label,
        status: completedToday ? 'completed_flame' : 'today_pending',
        isToday: true
      };
    }

    if (isPast) {
      // If within current streak distance
      const isPartOfStreak = currentStreak > (completedToday ? streakOffsetFromToday : streakOffsetFromToday - 1);
      return {
        label,
        status: isPartOfStreak ? 'completed_check' : 'missed',
        isToday: false
      };
    }

    // Future
    return {
      label,
      status: 'upcoming',
      isToday: false
    };
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: compact ? '320px' : '360px',
        margin: '0 auto',
        padding: compact ? '4px 0' : '8px 4px',
        boxSizing: 'border-box'
      }}
    >
      {weekDays.map((day, i) => {
        const isFilled = day.status === 'completed_flame' || day.status === 'completed_check';
        const isTodayFlame = day.status === 'completed_flame';
        const isTodayPending = day.status === 'today_pending';

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              flex: 1
            }}
          >
            {/* Day Label (M T W T F S S) */}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: day.isToday ? 800 : 600,
                color: day.isToday ? '#fbbf24' : isFilled ? '#cbd5e1' : '#64748b',
                letterSpacing: '0.02em'
              }}
            >
              {day.label}
            </span>

            {/* Day Icon / Node */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: compact ? '32px' : '36px',
                height: compact ? '32px' : '36px'
              }}
            >
              {/* Luminous Glow for Today's Flame */}
              {isTodayFlame && (
                <motion.div
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                          scale: [1, 1.15, 1],
                          opacity: [0.65, 0.95, 0.65]
                        }
                  }
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  style={{
                    position: 'absolute',
                    inset: '-4px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(249, 115, 22, 0.45) 0%, rgba(245, 158, 11, 0.15) 55%, transparent 75%)',
                    filter: 'blur(6px)',
                    pointerEvents: 'none'
                  }}
                />
              )}

              {/* Node Body */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isTodayFlame
                    ? 'linear-gradient(135deg, #fde047 0%, #f97316 60%, #ea580c 100%)'
                    : isFilled
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : isTodayPending
                    ? 'rgba(245, 158, 11, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isTodayPending
                    ? '1.5px dashed #f59e0b'
                    : isFilled
                    ? '1px solid rgba(255, 255, 255, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isTodayFlame
                    ? '0 4px 14px rgba(249, 115, 22, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.5)'
                    : isFilled
                    ? '0 2px 8px rgba(245, 158, 11, 0.3)'
                    : 'none',
                  color: isFilled ? '#ffffff' : '#64748b'
                }}
              >
                {isTodayFlame ? (
                  <Flame size={compact ? 16 : 18} fill="#ffffff" strokeWidth={1.5} />
                ) : isFilled ? (
                  <Check size={compact ? 14 : 16} strokeWidth={2.8} />
                ) : isTodayPending ? (
                  <Flame size={compact ? 13 : 15} color="#f59e0b" strokeWidth={2.2} />
                ) : (
                  <span style={{ fontSize: '0.74rem', color: '#475569' }}>○</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
