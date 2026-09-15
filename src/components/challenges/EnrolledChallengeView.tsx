import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Clock,
  Share2,
  Trophy,
  Lock,
  Compass
} from 'lucide-react';
import { ChallengeDashboardPayload } from '../../services/challengeService';
import { getActiveUserName, getActiveUserId } from '../../services/authService';
import { getMantra21DayActivity } from '../../data/mantra21DayDefinitions';
import Mantra21InviteModal from '../Mantra21InviteModal';

const THERAPY_MANTRA_LOGO = 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785828110/therapymantraIcon_kie5d3.png';

interface EnrolledChallengeViewProps {
  data: ChallengeDashboardPayload;
  onRefresh?: () => Promise<void>;
  onNavigatePathwayTask?: (taskId: string) => void;
  onExploreOtherChallenges?: () => void;
}

export default function EnrolledChallengeView({
  data,
  onRefresh,
  onNavigatePathwayTask,
  onExploreOtherChallenges
}: EnrolledChallengeViewProps) {
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [showFinalLeaderboardModal, setShowFinalLeaderboardModal] = useState<boolean>(false);

  const {
    challenge,
    enrollment,
    progress,
    today,
    leaderboard,
    community
  } = data;

  const rawName = getActiveUserName();
  const userName = rawName && rawName.trim().length > 0 ? rawName : null;
  const userId = getActiveUserId() || '234306';

  const currentDay = enrollment?.currentDay || 1;
  const totalDays = challenge?.durationDays || 21;
  const completedDays = progress?.completedDays ?? enrollment?.completedDays ?? 0;
  const currentStreak = progress?.currentStreak ?? enrollment?.currentStreak ?? (completedDays > 0 ? completedDays : 0);
  const isTodayCompleted = progress?.isTodayCompleted ?? today?.isCompleted ?? false;
  const daysRemaining = Math.max(0, totalDays - completedDays);

  // Dynamic Day Activity resolution from rich definitions matrix
  const currentDayActivity = getMantra21DayActivity(currentDay);
  const nextDayNum = Math.min(21, currentDay + 1);
  const nextDayActivity = getMantra21DayActivity(nextDayNum);

  const displayTodayTitle = (today?.title || currentDayActivity.title).replace(/^Day\s*\d+\s*:\s*/i, '');
  const displayTodayDescription = today?.description || currentDayActivity.tagline;
  const displayTodayMinutes = today?.estimatedMinutes || currentDayActivity.durationMinutes || 5;

  // Check if challenge reached Day 21 completion
  const isChallengeCompleted = completedDays >= 21 || enrollment?.status === 'completed';

  // Live participation rank snapshot
  const userRank = leaderboard?.me?.rank || 247;
  const totalParticipants = community?.activeParticipants || 4280;

  // Derive completed vs missed vs current vs future days accurately
  // Example: if currentDay is 4 and completedDays is 3 with no missed days, days 1..3 are completed.
  // If user completed [1, 2] and currentDay is 4, Day 3 is marked as missed.
  const dayStatusMap = React.useMemo(() => {
    const map: Record<number, 'completed' | 'current' | 'missed' | 'future'> = {};
    for (let d = 1; d <= totalDays; d++) {
      if (d < currentDay) {
        // If completedDays count covers this day, it's completed, otherwise missed
        if (d <= completedDays) {
          map[d] = 'completed';
        } else {
          map[d] = 'missed';
        }
      } else if (d === currentDay) {
        map[d] = isTodayCompleted ? 'completed' : 'current';
      } else {
        map[d] = 'future';
      }
    }
    return map;
  }, [totalDays, currentDay, completedDays, isTodayCompleted]);

  const missedCount = Object.values(dayStatusMap).filter((s) => s === 'missed').length;

  const handleStartToday = () => {
    const route = today?.actionRoute || '/task/depression-one-tiny-step';
    const cleanRoute = route.replace(/^#/, '');
    if (onNavigatePathwayTask) {
      onNavigatePathwayTask(cleanRoute);
    } else {
      window.location.hash = cleanRoute.startsWith('/') ? cleanRoute : `/${cleanRoute}`;
    }
  };

  const handleNavigate = (route: string) => {
    if (onNavigatePathwayTask) {
      onNavigatePathwayTask(route);
    } else {
      const clean = route.replace(/^#/, '');
      window.location.hash = clean.startsWith('/') ? clean : `/${clean}`;
    }
  };

  const topList = leaderboard?.top || [
    { rank: 1, name: 'Aarav K.', score: 21, streak: 21 },
    { rank: 2, name: 'Riya S.', score: 19, streak: 19 },
    { rank: 3, name: 'Karan M.', score: 18, streak: 18 }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAFBFD',
        color: '#090D16',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        position: 'relative',
        overflowX: 'hidden',
        paddingBottom: '80px'
      }}
    >
      {/* ─── 1. CLEAN COMPACT WHITE HEADER ─── */}
      <header
        style={{
          width: '100%',
          background: '#FFFFFF',
          borderBottom: '1px solid #F1F5F9',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          paddingTop: 'env(safe-area-inset-top, 0px)'
        }}
      >
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          {/* Logo + Live Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
            <img
              src={THERAPY_MANTRA_LOGO}
              alt="TherapyMantra"
              style={{ height: '28px', width: 'auto', maxHeight: '32px', objectFit: 'contain', flexShrink: 0 }}
            />
            <div
              className="hidden sm:inline-flex"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '999px',
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                color: '#0284C7',
                fontSize: '10.5px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0284C7' }} />
              <span>LIVE</span>
            </div>
          </div>

          {/* Invite Action */}
          <button
            onClick={() => setIsInviteOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '6px 12px',
              borderRadius: '999px',
              color: '#475569',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Share2 size={13} color="#0284C7" />
            <span>Invite</span>
          </button>
        </div>
      </header>

      {/* ─── 2. DAY 21 COMPLETE STATE CELEBRATION (IF COMPLETE) ─── */}
      {isChallengeCompleted && (
        <section
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #090D16 0%, #0F1D36 100%)',
            color: '#FFFFFF',
            padding: '48px 24px',
            marginBottom: '24px'
          }}
        >
          <div style={{ maxWidth: '1120px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284C7, #38BDF8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 0 24px rgba(56, 189, 248, 0.4)'
              }}
            >
              <Trophy size={32} color="#FFFFFF" />
            </div>

            <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.16em', color: '#38BDF8', textTransform: 'uppercase', marginBottom: '8px' }}>
              MANTRA 21 COMPLETE
            </div>

            <h1 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 950, letterSpacing: '-0.03em', margin: '0 0 10px 0' }}>
              21 Days of Showing Up.
            </h1>

            <p style={{ fontSize: '16px', color: '#94A3B8', maxWidth: '480px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
              You completed your universal 21-day mental wellness journey.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', padding: '12px 24px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', marginBottom: '24px' }}>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>Your Final Rank:</span>
              <span style={{ fontSize: '20px', fontWeight: 950, color: '#38BDF8' }}>#{userRank}</span>
            </div>

            <div>
              <button
                onClick={() => setShowFinalLeaderboardModal(true)}
                style={{
                  padding: '14px 28px',
                  borderRadius: '14px',
                  background: '#FFFFFF',
                  color: '#090D16',
                  fontSize: '13.5px',
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(255,255,255,0.2)'
                }}
              >
                VIEW FINAL LEADERBOARD →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ─── 3. ACTIVE CHALLENGE TRACKER (FOCUSED & CLEAN) ─── */}
      <main
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '28px 20px 0 20px'
        }}
      >
        {/* HERO / CURRENT DAY */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: '#0284C7',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}
          >
            MANTRA 21 • DAY {String(currentDay).padStart(2, '0')} OF {totalDays}
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 4.5vw, 42px)',
              fontWeight: 950,
              color: '#090D16',
              letterSpacing: '-0.03em',
              margin: '0 0 6px 0',
              lineHeight: 1.15
            }}
          >
            You're on your way.
          </h1>

          <p style={{ fontSize: '15.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
            One small step today. One more day of showing up.
          </p>
        </div>

        {/* ─── 01: TODAY'S CHALLENGE (REFINED, BALANCED PROPORTIONS) ─── */}
        <section style={{ marginBottom: '24px' }}>
          <div
            style={{
              padding: 'clamp(20px, 3.5vw, 36px)',
              borderRadius: '22px',
              background: 'linear-gradient(145deg, #0A1120 0%, #0F1E38 100%)',
              color: '#FFFFFF',
              boxShadow: '0 12px 32px -8px rgba(9, 13, 22, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Soft background ambient glow */}
            <div
              style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
                filter: 'blur(45px)',
                pointerEvents: 'none'
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: isTodayCompleted ? 'rgba(16, 185, 129, 0.18)' : 'rgba(56, 189, 248, 0.15)',
                    color: isTodayCompleted ? '#34D399' : '#38BDF8',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                >
                  {isTodayCompleted ? <Check size={12} strokeWidth={3} /> : <Compass size={12} />}
                  <span>{isTodayCompleted ? `✓ DAY ${String(currentDay).padStart(2, '0')} COMPLETE` : 'TODAY'}</span>
                </div>

                <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>
                  Day {String(currentDay).padStart(2, '0')}
                </span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(20px, 3.5vw, 28px)',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  margin: '0 0 10px 0',
                  lineHeight: 1.25
                }}
              >
                {displayTodayTitle}
              </h2>

              <p style={{ fontSize: '14.5px', color: '#CBD5E1', lineHeight: 1.55, maxWidth: '560px', margin: '0 0 22px 0' }}>
                {displayTodayDescription}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '16px',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94A3B8', fontSize: '12.5px', fontWeight: 600 }}>
                  <Clock size={14} color="#38BDF8" />
                  <span>~{displayTodayMinutes} MIN</span>
                </div>

                <button
                  onClick={handleStartToday}
                  style={{
                    padding: '11px 22px',
                    borderRadius: '12px',
                    background: isTodayCompleted ? 'rgba(255, 255, 255, 0.12)' : '#FFFFFF',
                    color: isTodayCompleted ? '#FFFFFF' : '#090D16',
                    fontSize: '13px',
                    fontWeight: 900,
                    letterSpacing: '0.03em',
                    border: isTodayCompleted ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isTodayCompleted ? 'none' : '0 6px 18px -3px rgba(255, 255, 255, 0.25)',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{isTodayCompleted ? 'REVIEW TODAY’S STEP →' : 'START TODAY →'}</span>
                </button>
              </div>

              {/* Dynamic Next Up Activity Section (Shows what you have already done and what is next) */}
              {isTodayCompleted && currentDay < 21 && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
                      COMING NEXT • TOMORROW (DAY {String(nextDayNum).padStart(2, '0')})
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                      {data.nextUp?.title || nextDayActivity.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                      {data.nextUp?.description || nextDayActivity.tagline}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '11.5px', fontWeight: 700 }}>
                    <Clock size={12} color="#64748B" />
                    <span>~{data.nextUp?.estimatedMinutes || nextDayActivity.durationMinutes || 5} MIN</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── 02: THE 21-DAY CHALLENGE TRACKER & SUMMARY ─── */}
        <section style={{ marginBottom: '32px' }}>
          {/* Compact 3-Metric Summary Strip Above Tracker */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}
          >
            <div style={{ padding: '16px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 950, color: '#090D16', lineHeight: 1 }}>
                {completedDays} / {totalDays}
              </div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', marginTop: '6px' }}>
                DAYS SHOWN UP
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 950, color: '#EA580C', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                <span>🔥</span>
                <span>{currentStreak}</span>
              </div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', marginTop: '6px' }}>
                DAY STREAK
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 950, color: '#0284C7', lineHeight: 1 }}>
                {daysRemaining}
              </div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', marginTop: '6px' }}>
                DAYS TO GO
              </div>
            </div>
          </div>

          {/* Visual 21-Day Journey Path (Completed ✓, Current ●, Missed ×, Future ○) */}
          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              overflowX: 'auto',
              boxShadow: '0 4px 16px -6px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#64748B', textTransform: 'uppercase' }}>
                MY 21-DAY JOURNEY
              </span>

              {missedCount > 0 && (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#EA580C' }}>
                  {missedCount} {missedCount === 1 ? 'day missed' : 'days missed'} • Pick up where you left off
                </span>
              )}
            </div>

            {/* 21 Nodes */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minWidth: '640px',
                position: 'relative',
                padding: '12px 8px 18px 8px'
              }}
            >
              {/* Background Connecting Line (Centered at 21px) */}
              <div style={{ position: 'absolute', top: '21px', left: '16px', right: '16px', height: '2px', background: '#E2E8F0', zIndex: 0 }} />

              {Array.from({ length: 21 }, (_, i) => i + 1).map((dayNum) => {
                const status = dayStatusMap[dayNum];

                return (
                  <div
                    key={dayNum}
                    onClick={() => {
                      if (status === 'completed' || status === 'current') {
                        handleNavigate(`/task/mantra21-day-${dayNum}`);
                      }
                    }}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: status === 'completed' || status === 'current' ? 'pointer' : 'default'
                    }}
                  >
                    {/* Consistent Node Visual State (Uniform 18px Diameter) */}
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background:
                          status === 'completed'
                            ? '#0284C7'
                            : status === 'current'
                            ? '#090D16'
                            : status === 'missed'
                            ? '#FFF7ED'
                            : '#FFFFFF',
                        border:
                          status === 'current'
                            ? '2px solid #38BDF8'
                            : status === 'completed'
                            ? 'none'
                            : status === 'missed'
                            ? '2px solid #FB923C'
                            : '2px solid #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: status === 'current' ? '0 0 10px 2px rgba(56, 189, 248, 0.4)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {status === 'completed' && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
                      {status === 'current' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8' }} />}
                      {status === 'missed' && <span style={{ fontSize: '9px', color: '#EA580C', fontWeight: 900, lineHeight: 1 }}>×</span>}
                    </div>

                    {/* Day label */}
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: status === 'current' ? 900 : 700,
                        color:
                          status === 'current'
                            ? '#0284C7'
                            : status === 'completed'
                            ? '#090D16'
                            : status === 'missed'
                            ? '#EA580C'
                            : '#94A3B8',
                        marginTop: '8px'
                      }}
                    >
                      {String(dayNum).padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend Guide */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                borderTop: '1px solid #F1F5F9',
                paddingTop: '12px',
                flexWrap: 'wrap',
                fontSize: '11px',
                color: '#64748B'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284C7' }} />
                <span>Completed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8', border: '1px solid #090D16' }} />
                <span>Current</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFF7ED', border: '1.5px solid #FB923C' }} />
                <span>Missed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid #CBD5E1' }} />
                <span>Future</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 03: CURRENT LIVE RANK & DAY 21 LOCKED LEADERBOARD (PREMIUM HERO CARD) ─── */}
        <section style={{ marginBottom: '32px' }}>
          <div
            style={{
              padding: 'clamp(18px, 3.5vw, 28px)',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #090D16 0%, #0F1D36 100%)',
              color: '#FFFFFF',
              boxShadow: '0 12px 32px -8px rgba(9, 13, 22, 0.16)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Ambient soft background light */}
            <div
              style={{
                position: 'absolute',
                top: '-30%',
                right: '10%',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(2, 132, 199, 0.22) 0%, transparent 70%)',
                filter: 'blur(50px)',
                pointerEvents: 'none'
              }}
            />

            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                alignItems: 'center',
                gap: '18px'
              }}
            >
              {/* Left: Primary Live Rank Highlight */}
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 9px',
                    borderRadius: '999px',
                    background: 'rgba(56, 189, 248, 0.14)',
                    color: '#38BDF8',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8' }} />
                  <span>YOUR LIVE RANK</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 'clamp(34px, 5vw, 44px)', fontWeight: 950, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    #{userRank}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34D399',
                      fontSize: '11px',
                      fontWeight: 800
                    }}
                  >
                    <span>↑ 12 places</span>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px', fontWeight: 500 }}>
                  of <strong style={{ color: '#F1F5F9', fontWeight: 800 }}>{totalParticipants.toLocaleString()}</strong> active challengers
                </div>

                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                  Updated today • Rankings based on consistency & showing up
                </div>
              </div>

              {/* Right: Day 21 Leaderboard Unlock Box */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  <Lock size={13} color="#38BDF8" />
                  <span>FINAL LEADERBOARD</span>
                </div>

                <div style={{ fontSize: '12.5px', color: '#E2E8F0', marginTop: '5px', lineHeight: 1.45, fontWeight: 500 }}>
                  🔒 Full podium & community standings unlock after <strong>Day 21</strong>.
                </div>

                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
                  Complete all 21 daily steps to lock in your final finisher position.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FINAL LEADERBOARD MODAL (UNLOCKED AFTER DAY 21) ─── */}
      <AnimatePresence>
        {showFinalLeaderboardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(9, 13, 22, 0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              style={{
                width: '100%',
                maxWidth: '560px',
                background: '#090D16',
                color: '#FFFFFF',
                borderRadius: '24px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  MANTRA 21 FINAL LEADERBOARD
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 950, margin: '6px 0' }}>21 Days. You Showed Up.</h2>
                <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>Top consistent finishers across the community</div>
              </div>

              {/* Podium */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px' }}>🥈</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, marginTop: '4px' }}>{topList[1]?.name || 'Riya'}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>21 Days</div>
                </div>

                <div style={{ flex: 1.1, background: 'rgba(56,189,248,0.15)', border: '1px solid #38BDF8', padding: '18px', borderRadius: '16px', textAlign: 'center', transform: 'translateY(-6px)' }}>
                  <div style={{ fontSize: '22px' }}>🥇</div>
                  <div style={{ fontSize: '14.5px', fontWeight: 900, marginTop: '4px' }}>{topList[0]?.name || 'Aarav'}</div>
                  <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 700 }}>21 Days</div>
                </div>

                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px' }}>🥉</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, marginTop: '4px' }}>{topList[2]?.name || 'Karan'}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>21 Days</div>
                </div>
              </div>

              {/* User Final Position */}
              <div style={{ padding: '12px 18px', borderRadius: '12px', background: 'rgba(2,132,199,0.3)', border: '1px solid #0284C7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: '#38BDF8' }}>#{userRank}</span>
                  <span style={{ fontSize: '13.5px', fontWeight: 800 }}>YOU (Finisher)</span>
                </div>
                <span style={{ fontSize: '12px', color: '#BAE6FD', fontWeight: 700 }}>21 Days • 🔥 {currentStreak} Streak</span>
              </div>

              <button
                onClick={() => setShowFinalLeaderboardModal(false)}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  color: '#090D16',
                  fontSize: '13px',
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <Mantra21InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
}
