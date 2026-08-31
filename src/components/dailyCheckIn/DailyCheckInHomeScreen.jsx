import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Check, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { getUserActivityHistory, getUserStreak } from '../../services/activityLogger';
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

export default function DailyCheckInHomeScreen({ onStartCheckIn, latestStreak }) {
  const shouldReduceMotion = useReducedMotion();
  const [isTapped, setIsTapped] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [showAllCheckIns, setShowAllCheckIns] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [streakData, setStreakData] = useState(latestStreak || null);
  const [isLoadingStreak, setIsLoadingStreak] = useState(!latestStreak);

  const userId = getActiveUserId();

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. Load History
      try {
        const history = await getUserActivityHistory('daily-check-in', userId);
        if (isMounted) {
          if (Array.isArray(history) && history.length > 0) {
            setRecentCheckIns(history);
          } else {
            setRecentCheckIns([]);
          }
        }
      } catch (err) {
        console.warn('Failed to load check-ins for user:', err);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }

      // 2. Load Streak (if not already provided via latestStreak)
      if (!latestStreak) {
        try {
          const streak = await getUserStreak(userId);
          if (isMounted && streak) {
            setStreakData(streak);
          }
        } catch (err) {
          console.warn('Failed to load streak for user:', err);
        } finally {
          if (isMounted) setIsLoadingStreak(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userId, latestStreak]);

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

  // Streak metrics & copy
  const currentStreak = streakData?.currentStreak || 0;
  const completedToday = streakData?.completedToday || false;
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

  // Track how many entries were logged TODAY for the active user
  const todayDateString = new Date().toDateString();
  const todayEntriesCount = recentCheckIns.filter((item) => {
    if (!item.created_at) return false;
    return new Date(item.created_at).toDateString() === todayDateString;
  }).length;

  // Show only latest 3 by default, expand on toggle
  const displayedCheckIns = showAllCheckIns ? recentCheckIns : recentCheckIns.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: '16px 16px 48px',
        boxSizing: 'border-box',
        gap: 'clamp(24px, 4.2vh, 36px)',
        color: '#f8fafc',
        position: 'relative'
      }}
    >
      {/* 1. Main Hero: Warm Editorial Serif Heading */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'clamp(20px, 3.8vh, 30px)',
          width: '100%',
          maxWidth: '440px',
          marginTop: '6px',
          position: 'relative',
          zIndex: 5
        }}
      >
        <h1
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.95rem, 6.8vw, 2.55rem)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1.18,
            color: '#f8fafc',
            margin: 0
          }}
        >
          How are you feeling right now?
        </h1>

        {/* 2. Softly Illuminated Dimensional Navy Check-In Sphere */}
        <div
          style={{
            position: 'relative',
            width: 'clamp(195px, 52vw, 235px)',
            height: 'clamp(195px, 52vw, 235px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto'
          }}
        >
          {/* Layer 1: Atmospheric Outer Light Source */}
          <div
            style={{
              position: 'absolute',
              width: '165%',
              height: '165%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.24) 0%, rgba(14, 165, 233, 0.12) 38%, rgba(2, 132, 199, 0.04) 62%, transparent 80%)',
              filter: 'blur(34px)',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />

          {/* Layer 2: Ambient Cyan/Teal Underglow Ring */}
          <div
            style={{
              position: 'absolute',
              width: '115%',
              height: '115%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.32) 0%, rgba(45, 212, 191, 0.16) 50%, transparent 74%)',
              filter: 'blur(16px)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* Layer 3: Gentle Orbiting Highlight Ring */}
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    rotate: [0, 360],
                    opacity: [0.55, 0.85, 0.55]
                  }
            }
            transition={{
              rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
              opacity: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
            }}
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: '1.5px solid transparent',
              borderTopColor: 'rgba(56, 189, 248, 0.75)',
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

      {/* 2. Exciting & Rewarding Streak Section (Warm Fire & Milestone Achievement) */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.18)',
          borderRadius: '22px',
          padding: '16px 18px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          position: 'relative',
          zIndex: 5,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 30px -8px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(251, 191, 36, 0.1)'
        }}
      >
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
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 50%, #fbbf24 100%)',
                borderRadius: '9999px',
                boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)'
              }}
            />
          </div>

          <span style={{ fontSize: '0.74rem', color: '#94a3b8', textAlign: 'center', marginTop: '2px' }}>
            {milestoneSubtitle}
          </span>
        </div>
      </div>

      {/* 3. Your Recent Check-Ins with Today's Count & 3-Item Collapse */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '380px',
          position: 'relative',
          zIndex: 5
        }}
      >
        {/* Section Header with "Today you logged X entries" Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2px'
          }}
        >
          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.02em'
            }}
          >
            Your recent check-ins
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '3px 10px',
              borderRadius: '9999px',
              color: '#38bdf8',
              fontSize: '0.72rem',
              fontWeight: 700
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#38bdf8',
                boxShadow: '0 0 6px #38bdf8'
              }}
            />
            <span>
              {todayEntriesCount === 0
                ? 'No entries today'
                : todayEntriesCount === 1
                ? '1 entry logged today'
                : `${todayEntriesCount} entries logged today`}
            </span>
          </div>
        </div>

        {/* Live Journal Cards from Neon DB */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isLoadingHistory ? (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.84rem'
              }}
            >
              Loading your entries...
            </div>
          ) : recentCheckIns.length > 0 ? (
            <>
              {displayedCheckIns.map((item) => {
                const dotColor = ZONE_COLORS[item.emotion_zone] || '#38bdf8';
                const emotionName = item.primary_emotion || 'Check-In';
                const timeString = formatCheckInTime(item.created_at);
                const intensityText = getIntensityText(item.intensity);

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -1 }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '16px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      backdropFilter: 'blur(12px)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: dotColor,
                        boxShadow: `0 0 10px ${dotColor}`,
                        flexShrink: 0
                      }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                            fontSize: '0.94rem',
                            fontWeight: 800,
                            color: '#f8fafc',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {emotionName}
                        </span>
                        {item.intensity ? (
                          <span style={{ fontSize: '0.74rem', color: dotColor, fontWeight: 700 }}>
                            {item.intensity}/5
                          </span>
                        ) : null}
                      </div>

                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {intensityText} · {timeString}
                      </span>

                      {item.reflection && (
                        <span style={{ fontSize: '0.76rem', color: '#cbd5e1', fontStyle: 'italic', marginTop: '2px', opacity: 0.9 }}>
                          "{item.reflection.length > 55 ? item.reflection.substring(0, 55) + '…' : item.reflection}"
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* View More / Show Less Button if > 3 entries */}
              {recentCheckIns.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllCheckIns((prev) => !prev)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.035)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '10px 16px',
                    color: '#cbd5e1',
                    fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    marginTop: '2px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.035)';
                    e.currentTarget.style.color = '#cbd5e1';
                  }}
                >
                  <span>{showAllCheckIns ? 'Show less' : `View more (${recentCheckIns.length - 3} more)`}</span>
                  {showAllCheckIns ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </>
          ) : (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                padding: '18px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.86rem'
              }}
            >
              No check-ins yet today. Tap the orb above to log your first check-in!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
