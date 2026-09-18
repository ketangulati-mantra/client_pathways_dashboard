import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Flame,
  Trophy,
  Users,
  Compass,
  Zap,
  ArrowRight,
  Check,
  ChevronRight,
  UserPlus,
  Share2,
  ShieldCheck,
  Award,
  CircleDot,
  Layers,
  Activity,
  Heart,
  Calendar,
  TrendingUp,
  X
} from 'lucide-react';
import { getActiveUserId } from '../services/authService';
import { logUserActivityToDB, recordUserPersonalizationSignal } from '../services/activityLogger';
import { enrollInChallenge } from '../services/challengeService';
import { completeLesson } from '../mantra/api';
import { goToDashboard } from '../mantra/navigation';
import Mantra21InviteModal from '../components/Mantra21InviteModal';

/**
 * MANTRA 21 — THE REVEAL EXPERIENCE (Phase 1)
 *
 * Visual & Emotional Universe:
 * - Midnight / Deep Space Dark Mode (#06070B, #0D0F18, #131726)
 * - Luminous Electric Orange (#FF5722, #FF7A45) & Cyberpunk Amber (#FFB020)
 * - Restrained Violet / Electric Blue / Neon Cyan glowing atmospheric gradients
 * - Nike Campaign / Spotify Wrapped / Apple Event / Strava Challenge energy
 * - Cinematic sound/motion vibe, glowing 21-point constellation, live community pulses,
 *   active challenge leaderboard, frictionless FOMO & social invites.
 *
 * Screen Progression:
 * 1. Screen 1: The Reveal (Dramatic 21 glow, glowing path with point 1 lit, cinematic entry)
 * 2. Screen 2: What is Mantra 21? (Not another streak, 3 large pillars: Understand, Practice, Build)
 * 3. Screen 3: The 21-Day Journey (Cinematic 3-phase constellation: Weeks 1-3, Day 1 complete highlight)
 * 4. Screen 4: What You Actually Get (6 interactive premium glass feature cards)
 * 5. Screen 5: The People (Live community pulse, dynamic stats, floating avatars, real movement feel)
 * 6. Screen 6: The Competition & Leaderboard (Consistency-based ranking, "Your Day 1 already counts")
 * 7. Screen 7: The FOMO & Invite + Final Join CTA (Milestones progression, friend invitations, Join CTA)
 */

export default function Mantra21RevealExperience({ onBack, onNavigate, service }) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [leaderboardTab, setLeaderboardTab] = useState('this_week'); // 'this_week' | 'all_time'
  const [copiedLink, setCopiedLink] = useState(false);
  const [invitedFriendsCount, setInvitedFriendsCount] = useState(0);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Privacy-friendly analytics tracker
  const trackEvent = (eventName, metadata = {}) => {
    try {
      const payload = {
        event: eventName,
        user_id: getActiveUserId(),
        experience: 'mantra21_reveal',
        timestamp: new Date().toISOString(),
        screen_index: currentScreen,
        ...metadata
      };
      if (typeof window !== 'undefined') {
        const history = JSON.parse(localStorage.getItem('mantra21_reveal_analytics') || '[]');
        history.push(payload);
        localStorage.setItem('mantra21_reveal_analytics', JSON.stringify(history.slice(-100)));
      }
    } catch (e) {
      console.warn('Analytics logging error:', e);
    }
  };

  // Track screen transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const screenEvents = [
      'mantra21_reveal_started',
      'mantra21_info_viewed',
      'mantra21_journey_viewed',
      'mantra21_features_viewed',
      'mantra21_community_viewed',
      'mantra21_leaderboard_viewed',
      'mantra21_invite_viewed'
    ];
    if (screenEvents[currentScreen]) {
      trackEvent(screenEvents[currentScreen]);
    }
  }, [currentScreen]);

  const [enrollmentStatusText, setEnrollmentStatusText] = useState('');
  const [enrollmentError, setEnrollmentError] = useState('');

  // Handle Joining Challenge (Idempotent Backend Enrollment)
  const handleJoinChallenge = async () => {
    const userId = getActiveUserId();
    if (!userId) {
      setEnrollmentError('Please ensure you are logged in to enroll.');
      return;
    }

    setIsEnrolling(true);
    setEnrollmentError('');
    setEnrollmentStatusText('Enrolling you...');

    trackEvent('mantra21_join_clicked', {
      invited_friends_count: invitedFriendsCount,
      time_spent_seconds: Math.round((Date.now() - startTimeRef.current) / 1000)
    });

    try {
      // 1. Authoritative Backend Challenge Enrollment
      const enrollResult = await enrollInChallenge('mantra_21', userId);
      if (!enrollResult.success || !enrollResult.data) {
        throw new Error(enrollResult.error || 'Failed to enroll in Mantra 21');
      }

      const timestamp = new Date().toISOString();

      // 2. Record activity signal
      const payload = {
        userId,
        activityId: 'depression_mantra21_invitation',
        lessonId: 'depression_mantra21_invitation',
        activityType: 'challenge_reveal_join',
        service: service || 'therapy',
        resultSummary: {
          pathway_id: 'depression',
          challenge_id: 'mantra_21',
          enrollment_id: enrollResult.data.id,
          day_number: enrollResult.data.currentDay || 1,
          enrolled_at: enrollResult.data.enrolledAt || timestamp,
          status: 'enrolled_challenge',
          time_spent_seconds: Math.round((Date.now() - startTimeRef.current) / 1000),
          response_data: {
            mantra21_reveal_completed: true,
            mantra21_joined: true,
            invited_friends: invitedFriendsCount
          }
        }
      };

      await logUserActivityToDB(payload).catch((e) => console.warn('Activity log note:', e));
      await recordUserPersonalizationSignal({
        userId,
        pathwayId: 'depression',
        signal: 'challenge_enrolled',
        strength: 5,
        sourceType: 'challenge_reveal',
        sourceId: 'mantra21_day1_reveal'
      }).catch((e) => console.warn('Signal note:', e));
      await completeLesson('depression_mantra21_invitation', service || 'therapy').catch((e) => console.warn('Lesson complete note:', e));

      // 3. Show confirmed state before transitioning
      setEnrollmentStatusText("You're in ✓");

      setTimeout(() => {
        setIsEnrolling(false);
        goToDashboard();
      }, 700);

    } catch (err) {
      console.error('[Mantra21] Enrollment failed:', err);
      setIsEnrolling(false);
      setEnrollmentStatusText('');
      setEnrollmentError('Something went wrong. Please try again.');
    }
  };

  // Social Invite Action (Opens bottom sheet / modal)
  const handleOpenInvite = () => {
    setShowInviteModal(true);
    trackEvent('mantra21_invite_modal_opened');
  };

  const handleInviteSent = (method) => {
    setInvitedFriendsCount((prev) => prev + 1);
    trackEvent('mantra21_invite_shared_success', { method });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#07080D',
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(255, 87, 34, 0.18) 0%, transparent 60%),
          radial-gradient(circle at 100% 70%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 0% 40%, rgba(14, 165, 233, 0.08) 0%, transparent 50%)
        `,
        color: '#F8FAFC',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Background ambient particle stars */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.25,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Top Experience Progress Bar (Only visible after Screen 1) */}
      {currentScreen > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'rgba(255, 255, 255, 0.06)',
            zIndex: 50
          }}
        >
          <motion.div
            initial={{ width: `${(currentScreen / 6) * 100}%` }}
            animate={{ width: `${((currentScreen + 1) / 7) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #FF5722 0%, #FFB020 100%)',
              boxShadow: '0 0 12px rgba(255, 87, 34, 0.8)'
            }}
          />
        </div>
      )}

      {/* Floating Header Skip / Close Button */}
      {currentScreen > 0 && (
        <div
          style={{
            position: 'fixed',
            top: '12px',
            right: '16px',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <button
            onClick={() => {
              if (onBack) onBack();
              else if (onNavigate) onNavigate('/');
            }}
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '6px 14px',
              color: '#CBD5E1',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Exit</span>
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Main Flow Container */}
      <main
        style={{
          width: '100%',
          maxWidth: '520px',
          minHeight: '100vh',
          padding: '48px 16px 40px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          position: 'relative',
          zIndex: 10
        }}
      >
        <AnimatePresence mode="wait">
          {/* ========================================================= */}
          {/* SCREEN 1 — THE REVEAL (Cinematic Universe Entry)         */}
          {/* ========================================================= */}
          {currentScreen === 0 && (
            <motion.div
              key="screen_0"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '40px 10px',
                flex: 1,
                justifyContent: 'center'
              }}
            >
              {/* Badge */}
              {/* Top Tag */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 87, 34, 0.12)',
                  border: '1px solid rgba(255, 87, 34, 0.35)',
                  borderRadius: '24px',
                  padding: '6px 16px',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: '#FF7A45',
                  textTransform: 'uppercase',
                  marginBottom: '24px',
                  boxShadow: '0 0 20px rgba(255, 87, 34, 0.25)'
                }}
              >
                <Zap size={13} fill="#FF7A45" />
                <span>A 21-Day Mental Health Challenge</span>
              </motion.div>

              {/* Massive Glowing "21" Monument + Brand Lockup */}
              <div style={{ position: 'relative', margin: '4px 0 20px 0' }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    fontSize: 'clamp(96px, 24vw, 150px)',
                    fontWeight: 900,
                    lineHeight: 0.85,
                    letterSpacing: '-0.06em',
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #FFA07A 50%, #FF5722 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 80px rgba(255, 87, 34, 0.6)',
                    userSelect: 'none'
                  }}
                >
                  21
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    letterSpacing: '0.28em',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    marginTop: '12px',
                    textShadow: '0 2px 14px rgba(0,0,0,0.8)'
                  }}
                >
                  MANTRA 21
                </motion.div>
              </div>

              {/* Emotional Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  fontSize: 'clamp(28px, 5.5vw, 36px)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  color: '#F8FAFC',
                  margin: '0 0 12px 0'
                }}
              >
                Show up for your{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #FF5722 0%, #FFB020 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  mind.
                </span>
              </motion.h2>

              {/* Short Compact Explanation */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{
                  fontSize: '15px',
                  color: '#94A3B8',
                  lineHeight: 1.55,
                  maxWidth: '420px',
                  margin: '0 0 10px 0'
                }}
              >
                A guided daily experience to understand yourself, try practical tools, and discover what helps you.
              </motion.p>

              {/* Secondary subtle guidance */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                style={{
                  fontSize: '12.5px',
                  color: '#64748B',
                  fontWeight: 500,
                  marginBottom: '28px'
                }}
              >
                Take the journey at your own pace.
              </motion.div>

              {/* Personal Journey Status Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 87, 34, 0.25)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '20px',
                  padding: '18px 20px',
                  marginBottom: '32px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#FF7A45', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    YOU'RE ALREADY STARTED
                  </span>
                  <span
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      color: '#4ADE80',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Check size={12} strokeWidth={3} /> DAY 01 COMPLETE
                  </span>
                </div>

                {/* Subtle 21-day journey visualization */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', margin: '14px 0 16px 0' }}>
                  {Array.from({ length: 21 }).map((_, i) => {
                    const isLit = i === 0;
                    return (
                      <React.Fragment key={i}>
                        <div
                          style={{
                            width: isLit ? '10px' : '6px',
                            height: isLit ? '10px' : '6px',
                            borderRadius: '50%',
                            background: isLit
                              ? 'radial-gradient(circle, #FFA07A 0%, #FF5722 100%)'
                              : 'rgba(255, 255, 255, 0.18)',
                            boxShadow: isLit ? '0 0 10px rgba(255, 87, 34, 0.95)' : 'none',
                            flexShrink: 0
                          }}
                        />
                        {i < 20 && (
                          <div
                            style={{
                              flex: 1,
                              height: '1.5px',
                              background: isLit ? 'rgba(255, 87, 34, 0.5)' : 'rgba(255, 255, 255, 0.08)'
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>
                    Your first step is done.
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                    See what's waiting ahead.
                  </div>
                </div>
              </motion.div>

              {/* Discovery CTA */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={() => setCurrentScreen(1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 50%, #FFB020 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '20px 28px',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 30px rgba(255, 87, 34, 0.45)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>Discover what's ahead</span>
                <ArrowRight size={20} strokeWidth={2.5} />
              </motion.button>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 2 — WHAT IS MANTRA 21? (Mental Health Challenge)   */}
          {/* ========================================================= */}
          {currentScreen === 1 && (
            <motion.div
              key="screen_1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              {/* SECTION 1 — TOP LABEL */}
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: '#FF7A45',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}
              >
                WELCOME TO MANTRA 21
              </div>

              {/* SECTION 2 — HERO */}
              <h1
                style={{
                  fontSize: 'clamp(28px, 5.8vw, 40px)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.18,
                  color: '#F8FAFC',
                  margin: '0 0 8px 0'
                }}
              >
                21 days.<br />
                For your mental health.<br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #FF5722 0%, #FFB020 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  One small step at a time.
                </span>
              </h1>

              {/* SECTION 3 — WHAT IS IT? */}
              <p
                style={{
                  fontSize: '14.5px',
                  color: '#94A3B8',
                  lineHeight: 1.55,
                  margin: '0 0 6px 0',
                  maxWidth: '520px'
                }}
              >
                A guided 21-day challenge to help you understand yourself, try practical mental-health tools, and discover what works for you.
              </p>
              <div
                style={{
                  fontSize: '12.5px',
                  color: '#CBD5E1',
                  fontWeight: 600,
                  marginBottom: '26px'
                }}
              >
                About 10 minutes a day.
              </div>

              {/* SECTION 4 — SHOW WHAT ACTUALLY HAPPENS (Visual Daily Experience) */}
              <div style={{ marginBottom: '28px' }}>
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: '#FF7A45',
                    textTransform: 'uppercase',
                    marginBottom: '12px'
                  }}
                >
                  EVERY DAY
                </div>

                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '18px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative'
                  }}
                >
                  {/* Daily Step 01 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'rgba(255, 87, 34, 0.15)',
                        border: '1px solid rgba(255, 87, 34, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#FF7A45',
                        flexShrink: 0
                      }}
                    >
                      01
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em', marginBottom: '2px' }}>
                        CHECK IN
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>
                        “How am I doing today?”
                      </div>
                    </div>
                  </div>

                  {/* Step Connector */}
                  <div style={{ width: '1.5px', height: '10px', background: 'rgba(255, 255, 255, 0.15)', marginLeft: '13px' }} />

                  {/* Daily Step 02 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'rgba(255, 176, 32, 0.15)',
                        border: '1px solid rgba(255, 176, 32, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#FFB020',
                        flexShrink: 0
                      }}
                    >
                      02
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em', marginBottom: '2px' }}>
                        YOUR DAILY ACTIVITY
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>
                        “Learn something. Try something. Notice something.”
                      </div>
                    </div>
                  </div>

                  {/* Step Connector */}
                  <div style={{ width: '1.5px', height: '10px', background: 'rgba(255, 255, 255, 0.15)', marginLeft: '13px' }} />

                  {/* Daily Step 03 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#38BDF8',
                        flexShrink: 0
                      }}
                    >
                      03
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em', marginBottom: '2px' }}>
                        ONE SMALL STEP
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>
                        “Take it into real life.”
                      </div>
                    </div>
                  </div>

                  {/* Step Connector */}
                  <div style={{ width: '1.5px', height: '10px', background: 'rgba(255, 255, 255, 0.15)', marginLeft: '13px' }} />

                  {/* Daily Step 04 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'rgba(74, 222, 128, 0.15)',
                        border: '1px solid rgba(74, 222, 128, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#4ADE80',
                        flexShrink: 0
                      }}
                    >
                      04
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em', marginBottom: '2px' }}>
                        SHOW UP
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>
                        “Keep building your journey.”
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5 — THE JOURNEY PREVIEW */}
              <div style={{ marginBottom: '28px' }}>
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: '#FF7A45',
                    textTransform: 'uppercase',
                    marginBottom: '12px'
                  }}
                >
                  21 DAYS
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  {/* Glowing Horizontal Journey Points */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', position: 'relative' }}>
                    <div
                      style={{
                        background: 'rgba(255, 87, 34, 0.15)',
                        border: '1px solid rgba(255, 87, 34, 0.4)',
                        borderRadius: '10px',
                        padding: '8px 6px',
                        textAlign: 'center',
                        color: '#FF7A45',
                        fontSize: '11.5px',
                        fontWeight: 900
                      }}
                    >
                      DAY 01 ✓
                    </div>
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        padding: '8px 6px',
                        textAlign: 'center',
                        color: '#94A3B8',
                        fontSize: '11.5px',
                        fontWeight: 700
                      }}
                    >
                      DAY 07
                    </div>
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        padding: '8px 6px',
                        textAlign: 'center',
                        color: '#94A3B8',
                        fontSize: '11.5px',
                        fontWeight: 700
                      }}
                    >
                      DAY 14
                    </div>
                    <div
                      style={{
                        background: 'rgba(255, 176, 32, 0.1)',
                        border: '1px solid rgba(255, 176, 32, 0.3)',
                        borderRadius: '10px',
                        padding: '8px 6px',
                        textAlign: 'center',
                        color: '#FFB020',
                        fontSize: '11.5px',
                        fontWeight: 900
                      }}
                    >
                      DAY 21
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.45 }}>
                    Start where you are.<br />
                    <span style={{ color: '#F1F5F9', fontWeight: 700 }}>See where 21 days takes you.</span>
                  </div>
                </div>
              </div>

              {/* SECTION 6 — WHAT MAKES IT A CHALLENGE */}
              <div style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: '#FF7A45',
                    textTransform: 'uppercase',
                    marginBottom: '10px'
                  }}
                >
                  THE CHALLENGE
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '8px',
                    marginBottom: '8px'
                  }}
                >
                  {/* Streaks */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '12px',
                      padding: '10px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: 800, color: '#F8FAFC', marginBottom: '2px' }}>
                      <Flame size={14} color="#FF7A45" /> Streaks
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.3 }}>
                      Keep showing up.
                    </div>
                  </div>

                  {/* Milestones */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '12px',
                      padding: '10px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: 800, color: '#F8FAFC', marginBottom: '2px' }}>
                      <Trophy size={14} color="#FFB020" /> Milestones
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.3 }}>
                      Reach checkpoints.
                    </div>
                  </div>

                  {/* Community */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '12px',
                      padding: '10px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: 800, color: '#F8FAFC', marginBottom: '2px' }}>
                      <Users size={14} color="#38BDF8" /> Community
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.3 }}>
                      Do it with others.
                    </div>
                  </div>

                  {/* Leaderboard */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '12px',
                      padding: '10px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', fontWeight: 800, color: '#F8FAFC', marginBottom: '2px' }}>
                      <TrendingUp size={14} color="#4ADE80" /> Leaderboard
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.3 }}>
                      Climb by showing up.
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', padding: '0 2px', lineHeight: 1.35 }}>
                  Rankings are based on challenge participation, never your mental-health responses.
                </div>
              </div>

              {/* SECTION 7 — USER'S CURRENT STATUS */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(255, 87, 34, 0.3)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ minWidth: '160px', flex: '1 1 auto' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#FF7A45', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    YOUR MANTRA 21
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
                    Your first step is already done.
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                    {21 - 1} days ahead.
                  </div>
                </div>

                <span
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    color: '#4ADE80',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    padding: '5px 10px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <Check size={12} strokeWidth={3} /> DAY 01 COMPLETE
                </span>
              </div>

              {/* SECTION 8 — CTA */}
              <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                <button
                  onClick={() => setCurrentScreen(2)}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    color: '#07080D',
                    fontSize: '15px',
                    fontWeight: 800,
                    letterSpacing: '0.03em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <span>SHOW ME THE 21 DAYS</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 3 — YOUR 21-DAY JOURNEY (Continuous Visual Path)  */}
          {/* ========================================================= */}
          {currentScreen === 2 && (
            <motion.div
              key="screen_2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: '#FF7A45',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}
              >
                YOUR 21-DAY JOURNEY
              </div>

              <h1
                style={{
                  fontSize: 'clamp(28px, 5.5vw, 38px)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  color: '#F8FAFC',
                  margin: '0 0 10px 0'
                }}
              >
                Start where you are.<br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #FF5722 0%, #FFB020 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Build from there.
                </span>
              </h1>

              <p style={{ fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 28px 0', maxWidth: '520px' }}>
                Each part of the journey has a different focus, from understanding what you're going through to finding tools you can actually keep using.
              </p>

              {/* Continuous Journey Timeline / Path */}
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                {/* Glowing Path Connecting Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '19px',
                    top: '24px',
                    bottom: '24px',
                    width: '2px',
                    background: 'linear-gradient(180deg, #FF5722 0%, rgba(255, 176, 32, 0.5) 45%, rgba(56, 189, 248, 0.25) 80%, rgba(148, 163, 184, 0.1) 100%)',
                    boxShadow: '0 0 12px rgba(255, 87, 34, 0.35)',
                    zIndex: 0
                  }}
                />

                {/* ================= CHAPTER 01 ================= */}
                <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                  {/* Glowing Node */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #FF5722 0%, #C2410C 100%)',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 0 20px rgba(255, 87, 34, 0.8), 0 0 40px rgba(255, 87, 34, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                    >
                      <Check size={18} strokeWidth={3.5} />
                    </div>
                  </div>

                  {/* Chapter 1 Card / Container */}
                  <div
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)',
                      border: '1px solid rgba(255, 87, 34, 0.35)',
                      boxShadow: '0 8px 24px -6px rgba(255, 87, 34, 0.15)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      position: 'relative'
                    }}
                  >
                    {/* YOU ARE HERE Marker */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span
                        style={{
                          background: 'linear-gradient(90deg, #FF5722 0%, #FF7A45 100%)',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 900,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          padding: '3px 9px',
                          borderRadius: '20px',
                          boxShadow: '0 2px 8px rgba(255, 87, 34, 0.4)'
                        }}
                      >
                        YOU ARE HERE · DAY 01 ✓
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#FFB020',
                          letterSpacing: '0.08em'
                        }}
                      >
                        DAYS 1–7
                      </span>
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#FDBA74', fontWeight: 600, marginBottom: '6px' }}>
                      “Your journey has already begun.”
                    </div>

                    <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                      UNDERSTAND WHAT'S GOING ON
                    </h3>

                    <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', color: '#CBD5E1', lineHeight: 1.45 }}>
                      Notice your patterns, energy, thoughts, emotions and the things that have been getting in the way.
                    </p>

                    {/* Mental Health Content Preview Tags */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          color: '#E2E8F0',
                          fontWeight: 500
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FF7A45' }} />
                        Understand your patterns
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          color: '#E2E8F0',
                          fontWeight: 500
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FF7A45' }} />
                        Why everything feels harder
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          color: '#E2E8F0',
                          fontWeight: 500
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FF7A45' }} />
                        Spot what's getting in the way
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= CHAPTER 02 ================= */}
                <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                  {/* Subtle Node */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(255, 176, 32, 0.12)',
                        border: '2px solid rgba(255, 176, 32, 0.45)',
                        boxShadow: '0 0 14px rgba(255, 176, 32, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFB020',
                        fontSize: '11px',
                        fontWeight: 900
                      }}
                    >
                      02
                    </div>
                  </div>

                  {/* Chapter 2 Card */}
                  <div
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 900, color: '#FFB020', letterSpacing: '0.1em' }}>
                        DAYS 8–14
                      </span>
                      <span style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 600 }}>
                        Coming up · Days 8–14
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                      TRY WHAT HELPS
                    </h3>

                    <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.45 }}>
                      Explore practical activities for your thoughts, routines, relationships and everyday life.
                    </p>

                    {/* Mental Health Content Preview Tags */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          color: '#CBD5E1',
                          fontWeight: 500
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFB020' }} />
                        Find small things you enjoy
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          color: '#CBD5E1',
                          fontWeight: 500
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFB020' }} />
                        Work with difficult thoughts
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          color: '#CBD5E1',
                          fontWeight: 500
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFB020' }} />
                        Make everyday life a little easier
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= CHAPTER 03 ================= */}
                <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                  {/* Distant Node */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '2px solid rgba(56, 189, 248, 0.35)',
                        boxShadow: '0 0 12px rgba(56, 189, 248, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38BDF8',
                        fontSize: '11px',
                        fontWeight: 900
                      }}
                    >
                      03
                    </div>
                  </div>

                  {/* Chapter 3 Card */}
                  <div
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.025)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 900, color: '#38BDF8', letterSpacing: '0.1em' }}>
                        DAYS 15–21
                      </span>
                      <span style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 600 }}>
                        Finish line · Day 21 🏆
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                      KEEP WHAT WORKS
                    </h3>

                    <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.45 }}>
                      Bring together the tools, insights and small changes that feel useful to you.
                    </p>

                    {/* Mental Health Content Preview Tags */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          color: '#CBD5E1',
                          fontWeight: 500
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#38BDF8' }} />
                        Build your personal toolkit
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          color: '#CBD5E1',
                          fontWeight: 500
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#38BDF8' }} />
                        Reconnect with what matters
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          color: '#CBD5E1',
                          fontWeight: 500
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#38BDF8' }} />
                        Plan what you'll carry forward
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= 21-DAY PROGRESSION MILESTONES ================= */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '28px'
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    marginBottom: '12px'
                  }}
                >
                  THE MILESTONES
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px'
                  }}
                >
                  {/* Milestone 1: Day 1 */}
                  <div
                    style={{
                      background: 'rgba(255, 87, 34, 0.12)',
                      border: '1px solid rgba(255, 87, 34, 0.35)',
                      borderRadius: '12px',
                      padding: '10px 8px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#FF7A45' }}>
                      DAY 01 ✓
                    </span>
                    <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#4ADE80', letterSpacing: '0.04em' }}>
                      YOUR FIRST STEP
                    </span>
                  </div>

                  {/* Milestone 2: Day 7 */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '12px',
                      padding: '10px 8px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#E2E8F0' }}>
                      DAY 07
                    </span>
                    <span style={{ fontSize: '9.5px', fontWeight: 600, color: '#94A3B8' }}>
                      FIRST MILESTONE
                    </span>
                  </div>

                  {/* Milestone 3: Day 14 */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '12px',
                      padding: '10px 8px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#E2E8F0' }}>
                      DAY 14
                    </span>
                    <span style={{ fontSize: '9.5px', fontWeight: 600, color: '#94A3B8' }}>
                      HALFWAY
                    </span>
                  </div>

                  {/* Milestone 4: Day 21 */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 176, 32, 0.15) 0%, rgba(255, 87, 34, 0.08) 100%)',
                      border: '1px solid rgba(255, 176, 32, 0.4)',
                      boxShadow: '0 0 14px rgba(255, 176, 32, 0.15)',
                      borderRadius: '12px',
                      padding: '10px 8px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#FFB020' }}>
                      DAY 21
                    </span>
                    <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#FDE047', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      🏆 FINISHER
                    </span>
                  </div>
                </div>
              </div>

              {/* ================= REPLACED CTA ================= */}
              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button
                  onClick={() => setCurrentScreen(3)}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '18px 24px',
                    color: '#07080D',
                    fontSize: '15px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <span>SEE WHAT I'LL BE DOING</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 4 — WHAT YOU ACTUALLY GET (6 Premium Cards)       */}
          {/* ========================================================= */}
          {currentScreen === 3 && (
            <motion.div
              key="screen_3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: '#FF7A45',
                  textTransform: 'uppercase',
                  marginBottom: '12px'
                }}
              >
                THIS IS MORE THAN DAILY ACTIVITIES
              </div>

              <h1
                style={{
                  fontSize: 'clamp(30px, 6vw, 42px)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  color: '#F8FAFC',
                  margin: '0 0 20px 0'
                }}
              >
                Here's what's<br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #FF5722 0%, #FFB020 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  waiting for you.
                </span>
              </h1>

              {/* 6 Features Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  marginBottom: '28px'
                }}
              >
                {/* 1 */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '16px 14px'
                  }}
                >
                  <Activity size={20} color="#FF7A45" style={{ marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                    Daily Activities
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>
                    Short 10-min practical experiences.
                  </p>
                </div>

                {/* 2 */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '16px 14px'
                  }}
                >
                  <Compass size={20} color="#FFB020" style={{ marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                    Personalized
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>
                    Your responses shape what Mantra emphasizes.
                  </p>
                </div>

                {/* 3 */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '16px 14px'
                  }}
                >
                  <Flame size={20} color="#FF5722" style={{ marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                    Streaks & Milestones
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>
                    Show up consistently and unlock milestones.
                  </p>
                </div>

                {/* 4 */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '16px 14px'
                  }}
                >
                  <Trophy size={20} color="#A78BFA" style={{ marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                    The Leaderboard
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>
                    Climb rankings based on showing up.
                  </p>
                </div>

                {/* 5 */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '16px 14px'
                  }}
                >
                  <Layers size={20} color="#38BDF8" style={{ marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                    Personal Toolkit
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>
                    Collect strategies you can return to anytime.
                  </p>
                </div>

                {/* 6 */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '16px 14px'
                  }}
                >
                  <Users size={20} color="#34D399" style={{ marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                    Live Community
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>
                    Journey alongside thousands of others.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button
                  onClick={() => setCurrentScreen(4)}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '18px 24px',
                    color: '#07080D',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>See who's doing this</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* ========================================================= */}
          {/* SCREEN 5 — THE PEOPLE (Community Energy & Live Pulses)   */}
          {/* ========================================================= */}
          {currentScreen === 4 && (
            <motion.div
              key="screen_4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: '#FF7A45',
                  textTransform: 'uppercase',
                  marginBottom: '12px'
                }}
              >
                YOU'RE NOT DOING THIS ALONE
              </div>

              <h1
                style={{
                  fontSize: 'clamp(30px, 6vw, 42px)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  color: '#F8FAFC',
                  margin: '0 0 16px 0'
                }}
              >
                There's a whole lot of<br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #FF5722 0%, #FFB020 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  people doing this with you.
                </span>
              </h1>

              {/* Massive Live Numbers Card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  marginBottom: '20px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '180px',
                    height: '100px',
                    background: 'radial-gradient(circle, rgba(255, 87, 34, 0.3) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }}
                />

                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  [COMMUNITY STATS]
                </span>

                <div
                  style={{
                    fontSize: 'clamp(44px, 10vw, 56px)',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    margin: '6px 0 2px 0'
                  }}
                >
                  12,438
                </div>

                <div style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600, marginBottom: '20px' }}>
                  people on the 21-day journey right now
                </div>

                {/* Today Pulse Chips */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      background: 'rgba(255, 87, 34, 0.12)',
                      border: '1px solid rgba(255, 87, 34, 0.3)',
                      borderRadius: '20px',
                      padding: '8px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#FF7A45',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Flame size={14} />
                    <span>3,241 showed up today</span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(34, 197, 94, 0.12)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '20px',
                      padding: '8px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#4ADE80',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Check size={14} />
                    <span>8,927 activities finished</span>
                  </div>
                </div>
              </div>

              {/* Participant Quotes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#CBD5E1',
                    lineHeight: 1.45
                  }}
                >
                  “I used to think I had to fix everything in one day. Doing just 10 minutes took all the pressure off.”
                  <span style={{ display: 'block', color: '#64748B', fontSize: '11px', marginTop: '4px' }}>
                    Ananya S., Day 14
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#CBD5E1',
                    lineHeight: 1.45
                  }}
                >
                  “Seeing other people checking in every morning keeps me from slipping back into isolation.”
                  <span style={{ display: 'block', color: '#64748B', fontSize: '11px', marginTop: '4px' }}>
                    Rohan M., Day 9
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button
                  onClick={() => setCurrentScreen(5)}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '18px 24px',
                    color: '#07080D',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>See the leaderboard</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 6 — THE COMPETITION / LEADERBOARD                 */}
          {/* ========================================================= */}
          {currentScreen === 5 && (
            <motion.div
              key="screen_5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: '#FF7A45',
                  textTransform: 'uppercase',
                  marginBottom: '12px'
                }}
              >
                YES, THERE'S A LEADERBOARD.
              </div>

              <h1
                style={{
                  fontSize: 'clamp(32px, 6.2vw, 44px)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  color: '#F8FAFC',
                  margin: '0 0 12px 0'
                }}
              >
                Show up.<br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #FF5722 0%, #FFB020 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Move up.
                </span>
              </h1>

              <p
                style={{
                  fontSize: '14.5px',
                  color: '#94A3B8',
                  lineHeight: 1.5,
                  margin: '0 0 20px 0'
                }}
              >
                Mantra 21 isn't about being the "most mentally healthy."
                <br />
                <strong style={{ color: '#E2E8F0' }}>
                  It's about showing up for yourself consistently.
                </strong>
              </p>

              {/* Leaderboard Scope Header / Static Indicator */}
              <div
                style={{
                  display: 'flex',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '4px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(255, 87, 34, 0.2)',
                    border: '1px solid rgba(255, 87, 34, 0.4)',
                    borderRadius: '8px',
                    padding: '8px 0',
                    color: '#FF7A45',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textAlign: 'center'
                  }}
                >
                  THIS WEEK
                </div>
                <div
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 0',
                    color: '#64748B',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textAlign: 'center',
                    opacity: 0.6
                  }}
                >
                  ALL TIME
                </div>
              </div>

              {/* Leaderboard Table List */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '16px'
                }}
              >
                {/* Rank 1 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#FFB020', width: '18px' }}>1</span>
                    <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#FFFFFF' }}>Aarav K.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF7A45', fontSize: '13.5px', fontWeight: 800 }}>
                    <Flame size={14} /> 21 pts
                  </div>
                </div>

                {/* Rank 2 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#94A3B8', width: '18px' }}>2</span>
                    <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#FFFFFF' }}>Riya S.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF7A45', fontSize: '13.5px', fontWeight: 800 }}>
                    <Flame size={14} /> 19 pts
                  </div>
                </div>

                {/* Rank 3 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#CD7F32', width: '18px' }}>3</span>
                    <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#FFFFFF' }}>Karan M.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF7A45', fontSize: '13.5px', fontWeight: 800 }}>
                    <Flame size={14} /> 18 pts
                  </div>
                </div>

                {/* User Active Entry */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(90deg, rgba(255, 87, 34, 0.25) 0%, rgba(255, 176, 32, 0.15) 100%)',
                    border: '1px solid rgba(255, 87, 34, 0.5)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#FF7A45', width: '18px' }}>4</span>
                    <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF' }}>You (Challenger)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF7A45', fontSize: '14px', fontWeight: 800 }}>
                    <Flame size={15} /> 17 pts
                  </div>
                </div>

                {/* Rank 5 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#64748B', width: '18px' }}>5</span>
                    <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#94A3B8' }}>Ananya D.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '13.5px', fontWeight: 700 }}>
                    <Flame size={14} /> 16 pts
                  </div>
                </div>
              </div>

              {/* Safety distinction badge */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShieldCheck size={14} color="#38BDF8" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.04em' }}>
                    PURE CONSISTENCY, ZERO JUDGMENT
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.45 }}>
                  Rankings are based solely on completing daily activities and streaks, never on mental health scores or private answers.
                </p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button
                  onClick={() => setCurrentScreen(6)}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '18px 24px',
                    color: '#07080D',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>See Day 21 vision</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 7 — THE FINISH LINE & YOUR MANTRA 21 WRAPPED       */}
          {/* ========================================================= */}
          {currentScreen === 6 && (
            <motion.div
              key="screen_6"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              {/* TOP LABEL */}
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  color: '#FF7A45',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}
              >
                THE FINISH LINE
              </div>

              {/* HERO HEADLINE */}
              <h1
                style={{
                  fontSize: 'clamp(28px, 5.8vw, 40px)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  color: '#F8FAFC',
                  margin: '0 0 10px 0'
                }}
              >
                By Day 21,<br />
                you'll know yourself<br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #FF5722 0%, #FFB020 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  a little differently.
                </span>
              </h1>

              <p style={{ fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.55, margin: '0 0 24px 0', maxWidth: '500px' }}>
                Not because 21 days fixes everything. Because you spent 21 days paying attention, trying things, and finding what works for you.
              </p>



              {/* ================= 2. WHAT YOU'LL WALK AWAY WITH ================= */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.12em', color: '#FF7A45', textTransform: 'uppercase', marginBottom: '10px' }}>
                  WHAT YOU'LL WALK AWAY WITH
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#E2E8F0' }}>
                    <Check size={15} color="#4ADE80" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span>A clearer picture of your patterns</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#E2E8F0' }}>
                    <Check size={15} color="#4ADE80" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span>Practical tools you've actually tried</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#E2E8F0' }}>
                    <Check size={15} color="#4ADE80" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span>A personal toolkit you can return to</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#E2E8F0' }}>
                    <Check size={15} color="#4ADE80" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span>A record of what worked for you</span>
                  </div>
                </div>

                {/* 3 Reflection Pillar Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '12px', padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#FF7A45', marginBottom: '3px' }}>WHAT I NOTICED</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', lineHeight: 1.3 }}>“What patterns showed up?”</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '12px', padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#FFB020', marginBottom: '3px' }}>WHAT I TRIED</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', lineHeight: 1.3 }}>“What actually helped?”</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '12px', padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#38BDF8', marginBottom: '3px' }}>WHAT I'LL KEEP</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', lineHeight: 1.3 }}>“What to carry forward?”</div>
                  </div>
                </div>
              </div>

              {/* ================= 3. COMPACT MILESTONES STRIP ================= */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.12em', color: '#FF7A45', textTransform: 'uppercase', marginBottom: '10px' }}>
                  THE MILESTONES
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '14px',
                    padding: '10px'
                  }}
                >
                  {/* Day 1 */}
                  <div style={{ textAlign: 'center', padding: '4px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FF7A45' }}>DAY 01 ✓</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#4ADE80', marginTop: '2px' }}>Started</div>
                  </div>

                  {/* Day 7 */}
                  <div style={{ textAlign: 'center', padding: '4px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#CBD5E1' }}>DAY 07</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8', marginTop: '2px' }}>First milestone</div>
                  </div>

                  {/* Day 14 */}
                  <div style={{ textAlign: 'center', padding: '4px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#CBD5E1' }}>DAY 14</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8', marginTop: '2px' }}>Halfway</div>
                  </div>

                  {/* Day 21 */}
                  <div style={{ textAlign: 'center', padding: '4px', background: 'rgba(255, 176, 32, 0.1)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#FFB020' }}>DAY 21 🏆</div>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#FDE047', marginTop: '2px' }}>Finisher</div>
                  </div>
                </div>
              </div>

              {/* ================= 4. IMAGINE FINISHING TOGETHER ================= */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(255, 87, 34, 0.06) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '28px'
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#C084FC', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>
                  IMAGINE FINISHING TOGETHER
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px' }}>
                  Invite someone to take the journey with you.
                </div>

                <button
                  onClick={handleOpenInvite}
                  style={{
                    width: '100%',
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.45)',
                    borderRadius: '10px',
                    padding: '10px',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <UserPlus size={14} />
                  <span>+ INVITE A FRIEND</span>
                </button>
              </div>

              {/* ================= 5. FINAL COMMITMENT CTA ================= */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '6px' }}>
                {/* Enrollment Error Banner */}
                {enrollmentError && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      color: '#FCA5A5',
                      fontSize: '13px',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    {enrollmentError}
                  </div>
                )}

                <motion.button
                  disabled={isEnrolling}
                  onClick={handleJoinChallenge}
                  whileHover={!isEnrolling ? { scale: 1.02 } : {}}
                  whileTap={!isEnrolling ? { scale: 0.98 } : {}}
                  style={{
                    width: '100%',
                    background: enrollmentStatusText.includes('✓') 
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #FF5722 0%, #FF7A45 50%, #FFB020 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '20px 28px',
                    color: '#FFFFFF',
                    fontSize: '16.5px',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    cursor: isEnrolling ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: enrollmentStatusText.includes('✓')
                      ? '0 10px 36px rgba(16, 185, 129, 0.5)'
                      : '0 10px 36px rgba(255, 87, 34, 0.5)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{isEnrolling ? enrollmentStatusText || 'Enrolling you...' : 'Enroll Me →'}</span>
                </motion.button>

                <button
                  disabled={isEnrolling}
                  onClick={() => {
                    if (onNavigate) onNavigate('/');
                    else if (onBack) onBack();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '6px 0',
                    textAlign: 'center'
                  }}
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Social Invite Modal / Bottom Sheet */}
      <Mantra21InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSent={handleInviteSent}
      />
    </div>
  );
}
