import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Check, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { useCheckInState } from '../../hooks/useCheckInState';
import { getUserActivityHistory } from '../../services/activityLogger';
import { getActiveUserId } from '../../services/authService';
import WeeklyStreakTracker from './WeeklyStreakTracker';

const ZONE_COLORS = {
  high_unpleasant: '#f87171',
  high_pleasant: '#fbbf24',
  low_unpleasant: '#60a5fa',
  low_pleasant: '#34d399'
};

function formatCheckInTime(dateStr) {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (isToday) return `Today at ${timeStr}`;
    if (isYesterday) return `Yesterday at ${timeStr}`;
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  } catch (e) {
    return 'Recently';
  }
}

function getIntensityText(intensity) {
  if (!intensity) return 'Feeling';
  if (intensity <= 2) return 'Feeling gently';
  if (intensity === 3) return 'Feeling moderately';
  return 'Feeling strongly';
}

/**
 * Calm, polished skeleton for the streak card to prevent layout shifts.
 */
function StreakCardSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%'
      }}
    >
      {/* Header Row Skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'rgba(251, 191, 36, 0.15)',
              animation: 'streakShimmer 2s ease-in-out infinite'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                width: '100px',
                height: '14px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.12)',
                animation: 'streakShimmer 2s ease-in-out infinite'
              }}
            />
            <div
              style={{
                width: '150px',
                height: '10px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.06)',
                animation: 'streakShimmer 2s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </div>

      {/* 7 Weekday Circles Placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px' }}>
        {[...Array(7)].map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '10px',
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.08)'
              }}
            />
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                animation: 'streakShimmer 2s ease-in-out infinite',
                animationDelay: `${i * 120}ms`
              }}
            />
          </div>
        ))}
      </div>

      {/* Progress Bar Placeholder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '80px', height: '10px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)' }} />
          <div style={{ width: '45px', height: '10px', borderRadius: '4px', background: 'rgba(251, 191, 36, 0.15)' }} />
        </div>
        <div
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.06)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '40%',
              height: '100%',
              background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.2) 0%, rgba(249, 115, 22, 0.3) 100%)',
              animation: 'streakShimmer 2s ease-in-out infinite'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function DailyCheckInHomeScreen({ onStartCheckIn }) {
  const shouldReduceMotion = useReducedMotion();
  const userId = getActiveUserId();

  const [isTapped, setIsTapped] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [showAllCheckIns, setShowAllCheckIns] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Centralized Canonical Check-In State from Database
  const {
    streak: streakData,
    isLoading: isLoadingStreak,
    todayCheckIns,
    hasCheckedInToday
  } = useCheckInState(userId);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        const history = await getUserActivityHistory('daily-check-in', userId);
        if (isMounted) {
          setRecentCheckIns(Array.isArray(history) ? history : []);
        }
      } catch (err) {
        console.warn('Failed to load check-ins for user:', err);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    }

    loadHistory();

    const handleInvalidate = () => {
      loadHistory();
    };

    window.addEventListener('check-in-state-invalidated', handleInvalidate);
    window.addEventListener('focus', handleInvalidate);

    return () => {
      isMounted = false;
      window.removeEventListener('check-in-state-invalidated', handleInvalidate);
      window.removeEventListener('focus', handleInvalidate);
    };
  }, [userId]);

  const handleOrbClick = () => {
    if (isTapped) return;
    setIsTapped(true);

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(12);
      } catch (e) {}
    }

    setTimeout(() => {
      onStartCheckIn();
    }, shouldReduceMotion ? 200 : 450);
  };

  // Streak metrics & copy from canonical state
  const currentStreak = streakData?.current ?? streakData?.currentStreak ?? 0;
  const completedToday = Boolean(streakData?.completedToday);
  const daysUntilNext = streakData?.daysUntilNextMilestone ?? (currentStreak < 3 ? 3 - currentStreak : 4);
  const nextMilestone = streakData?.nextMilestone || (currentStreak < 3 ? 3 : 7);

  // Milestone progress ratio
  const progressCurrent = streakData?.progressToNextMilestone?.current ?? currentStreak;
  const progressTarget = streakData?.progressToNextMilestone?.target ?? nextMilestone;
  const progressPercent = Math.min(100, Math.round((progressCurrent / progressTarget) * 100));

  let streakTitle = currentStreak > 0 ? `${currentStreak} Day Streak` : 'Start your streak';
  let streakSubtitle = completedToday
    ? 'You showed up for yourself today.'
    : currentStreak > 0
    ? 'Check in today to keep your streak going.'
    : 'Check in today to start your streak.';

  let milestoneSubtitle =
    daysUntilNext === 1
      ? `1 more day to reach your ${nextMilestone}-day milestone!`
      : `${daysUntilNext} more days to reach your ${nextMilestone}-day milestone`;

  // Canonical count of entries logged TODAY
  const todayEntriesCount = todayCheckIns && todayCheckIns.length > 0
    ? todayCheckIns.length
    : recentCheckIns.filter((item) => {
        if (!item.created_at) return false;
        return new Date(item.created_at).toDateString() === new Date().toDateString();
      }).length;

  // Show only latest 3 by default, expand on toggle
  const visibleCheckIns = showAllCheckIns ? recentCheckIns : recentCheckIns.slice(0, 3);
  const hasMoreCheckIns = recentCheckIns.length > 3;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '12px 16px 40px',
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto',
        boxSizing: 'border-box',
        gap: '24px'
      }}
    >
      <style>{`
        @keyframes streakShimmer {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.85; }
        }
      `}</style>

      {/* Hero Interactive Orb Area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          width: '100%'
        }}
      >
        {/* Headings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h1
            style={{
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: 'clamp(1.5rem, 5vw, 1.85rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              margin: 0
            }}
          >
            How are you feeling right now?
          </h1>
          <p
            style={{
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: 'clamp(0.88rem, 3vw, 0.96rem)',
              color: '#94a3b8',
              margin: 0,
              lineHeight: 1.45
            }}
          >
            Take a moment to check in with yourself.
          </p>
        </div>

        {/* Tactile Glowing Mood Orb */}
        <div
          style={{
            position: 'relative',
            width: '170px',
            height: '170px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '8px 0'
          }}
        >
          {/* Layer 1: Ambient Backdrop Glow */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scale: [1, 1.12, 1],
                    opacity: [0.35, 0.55, 0.35]
                  }
            }
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              width: '190px',
              height: '190px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(45, 212, 191, 0.22) 50%, transparent 75%)',
              filter: 'blur(16px)',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />

          {/* Layer 2: Outer Pulsing Energy Ring */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    rotate: 360,
                    scale: [1, 1.04, 1]
                  }
            }
            transition={{
              rotate: { duration: 22, repeat: Infinity, ease: 'linear' },
              scale: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }
            }}
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              border: '1.5px dashed rgba(56, 189, 248, 0.3)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* Layer 3: Rotating Gradient Aura Ring */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    rotate: -360
                  }
            }
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              position: 'absolute',
              inset: '-2px',
              borderRadius: '50%',
              border: '1.5px solid transparent',
              borderTopColor: 'rgba(56, 189, 248, 0.65)',
              borderRightColor: 'rgba(45, 212, 191, 0.35)',
              filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.55))',
              pointerEvents: 'none',
              zIndex: 2
            }}
          />

          {/* Layer 4: Micro-Interaction Ripple */}
          <AnimatePresence>
            {isTapped && !shouldReduceMotion && (
              <motion.div
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.14, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  inset: '-2px',
                  borderRadius: '50%',
                  border: '2px solid #38bdf8',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.8)',
                  pointerEvents: 'none',
                  zIndex: 3
                }}
              />
            )}
          </AnimatePresence>

          {/* Layer 5: Main Tactile Button */}
          <motion.button
            type="button"
            onClick={handleOrbClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={isTapped ? { scale: 0.97 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '1.5px solid rgba(56, 189, 248, 0.5)',
              background: 'radial-gradient(circle at 50% 32%, #223854 0%, #172a42 52%, #0e1c2e 100%)',
              boxShadow: isTapped
                ? '0 12px 28px -4px rgba(0, 0, 0, 0.75), 0 0 26px rgba(56, 189, 248, 0.6), inset 0 2px 8px rgba(255, 255, 255, 0.45)'
                : '0 18px 40px -6px rgba(0, 0, 0, 0.65), 0 0 20px rgba(56, 189, 248, 0.35), inset 0 2px 6px rgba(255, 255, 255, 0.3), inset 0 -4px 12px rgba(0, 0, 0, 0.6)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: 0,
              outline: 'none',
              zIndex: 4,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '26%',
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.38) 0%, rgba(45, 212, 191, 0.15) 55%, transparent 80%)',
                filter: 'blur(12px)',
                pointerEvents: 'none'
              }}
            />

            <div
              style={{
                position: 'relative',
                zIndex: 2,
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.18)',
                border: '1.5px solid rgba(56, 189, 248, 0.5)',
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <Plus size={22} strokeWidth={2.8} />
            </div>

            <span
              style={{
                position: 'relative',
                zIndex: 2,
                fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                fontSize: 'clamp(0.98rem, 3.5vw, 1.08rem)',
                fontWeight: 700,
                letterSpacing: '0.01em',
                color: '#ffffff',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
            >
              Check in
            </span>
          </motion.button>
        </div>
      </div>

      {/* 2. Streak Section (Reserved Dimensions with Zero-Shift Skeleton & Instant Caching) */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          minHeight: '172px',
          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.18)',
          borderRadius: '22px',
          padding: '16px 18px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '14px',
          position: 'relative',
          zIndex: 5,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 30px -8px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(251, 191, 36, 0.1)'
        }}
      >
        {isLoadingStreak && !streakData ? (
          <StreakCardSkeleton />
        ) : (
          <>
            {/* Header Row: Flame Icon + Streak Count + Checked in badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #fde047 0%, #f97316 60%, #ea580c 100%)',
                    boxShadow: '0 2px 10px rgba(249, 115, 22, 0.5)'
                  }}
                >
                  <Flame size={18} fill="#ffffff" strokeWidth={1.5} color="#ffffff" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span
                    style={{
                      fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {streakTitle}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                    {streakSubtitle}
                  </span>
                </div>
              </div>

              {completedToday && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(34, 197, 94, 0.14)',
                    border: '1px solid rgba(34, 197, 94, 0.35)',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    color: '#4ade80',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  <Check size={11} strokeWidth={3} />
                  <span>Done</span>
                </div>
              )}
            </div>

            {/* Weekly Day Circles (M T W T F S S) */}
            <WeeklyStreakTracker currentStreak={currentStreak} completedToday={completedToday} />

            {/* Milestone Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Next Milestone</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                  {progressCurrent} / {progressTarget} days
                </span>
              </div>

              {/* Progress Track */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <motion.div
                  initial={shouldReduceMotion ? { width: `${progressPercent}%` } : { width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 60%, #ef4444 100%)',
                    borderRadius: '9999px',
                    boxShadow: '0 0 10px rgba(249, 115, 22, 0.6)'
                  }}
                />
              </div>

              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'left', marginTop: '2px' }}>
                {milestoneSubtitle}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 3. Recent Check-Ins History Section */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#e2e8f0',
              letterSpacing: '0.01em'
            }}
          >
            Today's Check-Ins
          </span>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
            {todayEntriesCount} logged today
          </span>
        </div>

        {/* List of Recent Check-in cards */}
        {recentCheckIns.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {visibleCheckIns.map((item, index) => {
              const zoneColor = ZONE_COLORS[item.emotion_zone] || '#38bdf8';
              const intensityText = getIntensityText(item.intensity);
              const emotionName = item.primary_emotion || 'Emotion';

              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: zoneColor,
                          boxShadow: `0 0 8px ${zoneColor}`
                        }}
                      />
                      <span
                        style={{
                          fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: '#ffffff'
                        }}
                      >
                        {emotionName}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      {formatCheckInTime(item.created_at)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        color: '#cbd5e1',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '2px 8px',
                        borderRadius: '9999px'
                      }}
                    >
                      {intensityText} ({item.intensity}/5)
                    </span>

                    {item.contexts && item.contexts.length > 0 && (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: '#94a3b8',
                          background: 'rgba(255, 255, 255, 0.04)',
                          padding: '2px 8px',
                          borderRadius: '9999px'
                        }}
                      >
                        {item.contexts.join(', ')}
                      </span>
                    )}
                  </div>

                  {item.reflection && item.reflection.trim() !== '' && (
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        margin: '2px 0 0',
                        fontStyle: 'italic',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      "{item.reflection}"
                    </p>
                  )}
                </motion.div>
              );
            })}

            {hasMoreCheckIns && (
              <button
                type="button"
                onClick={() => setShowAllCheckIns(!showAllCheckIns)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  outline: 'none'
                }}
              >
                <span>{showAllCheckIns ? 'Show less' : `Show all ${recentCheckIns.length} check-ins`}</span>
                {showAllCheckIns ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        ) : !isLoadingHistory ? (
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.82rem'
            }}
          >
            No check-ins logged yet today. Tap the orb above to check in.
          </div>
        ) : null}
      </div>
    </div>
  );
}
