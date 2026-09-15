import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Flame,
  Trophy,
  Users,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Award,
  CircleDot,
  Layers,
  Heart,
  Calendar,
  Lock,
  Share2,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Compass,
  CheckCircle2,
  Clock,
  Sparkle
} from 'lucide-react';
import { getActiveUserId } from '../services/authService';
import { logUserActivityToDB, recordUserPersonalizationSignal } from '../services/activityLogger';
import { completeLesson } from '../mantra/api';
import Mantra21InviteModal from '../components/Mantra21InviteModal';

/**
 * MANTRA 21 — PHASE 2: EXPERIENCE THE CHALLENGE
 * 
 * Aesthetic Universe:
 * - Strava Challenge × Spotify Wrapped × Nike Campaign × Gaming Season
 * - Deep dark background (#06070B, #0D0F18, #131726)
 * - Luminous Electric Orange (#FF5722), Coral (#FF7A45), Cyberpunk Amber (#FFB020)
 * - Luminous progress lines, glowing aura cards, translucent glass, avatar orbs
 * - Safe, hopeful, warm, empowering mental wellness competition centered on SHOWING UP
 * 
 * 10 Distinct Screen Steps:
 * 1. Screen 1: "You're In The Arena" (Transition from Phase 1 reveal into live challenge field with 12,438 people)
 * 2. Screen 2: "The Leaderboard" (Show up. Move up. Aarav, Riya, Karan, YOU #04, Ananya)
 * 3. Screen 3: "Your Streak" (How far can you keep it going? 7-day streak, 21-day map, Day 14/21 milestone unlocks)
 * 4. Screen 4: "Milestones / Badges" (Collectibles: First Step, Consistent, Mind Explorer, Reconnect, Momentum, Mantra 21 Finisher)
 * 5. Screen 5: "What You'll See Change" (Interactive Day 1 → 7 → 14 → 21 progression & mock Mantra 21 Wrapped)
 * 6. Screen 6: "The Social Layer" (Don't do it alone: Invite Friends, Friend Streaks, Friends Leaderboard)
 * 7. Screen 7: "What Happens Every Day?" (Manageable 5-step daily routine: Check-in → 5-10m Activity → Real-life step → Mark Day → Watch progress)
 * 8. Screen 8: "The Competition" (Think you can make the top 10? Progress gap: You #47 vs #10 only 6 activities away)
 * 9. Screen 9: "The 21-Day Finish Line" (Cinematic Day 21 completion screen, Finisher Badge, 21-Day Streak, 21-Day Wrapped)
 * 10. Screen 10: "Final FOMO & Commitment" (People are already moving. You already have Day 1. Why stop at 1? 21 is waiting.)
 */

// Demo Metrics & Content (Clearly documented as prototype demo data)
const DEMO_METRICS = {
  totalParticipants: '12,438',
  showedUpToday: '3,241',
  activitiesCompletedToday: '8,927'
};

const DEMO_LEADERBOARD = {
  this_week: [
    { rank: '01', name: 'Aarav', streak: 21, score: '480 pts', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', activeToday: true },
    { rank: '02', name: 'Riya', streak: 19, score: '440 pts', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', activeToday: true },
    { rank: '03', name: 'Karan', streak: 18, score: '410 pts', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', activeToday: true },
    { rank: '04', name: 'YOU', streak: 1, score: '380 pts', isUser: true, activeToday: true },
    { rank: '05', name: 'Ananya', streak: 16, score: '360 pts', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', activeToday: false },
    { rank: '06', name: 'Zayn', streak: 15, score: '330 pts', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', activeToday: true },
  ],
  all_time: [
    { rank: '01', name: 'Kavita M.', streak: 42, score: '980 pts', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', activeToday: true },
    { rank: '02', name: 'Aarav', streak: 38, score: '890 pts', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', activeToday: true },
    { rank: '03', name: 'Dev P.', streak: 35, score: '820 pts', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80', activeToday: true },
    { rank: '04', name: 'YOU', streak: 1, score: '380 pts', isUser: true, activeToday: true },
    { rank: '05', name: 'Riya', streak: 28, score: '670 pts', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', activeToday: true }
  ],
  friends: [
    { rank: '01', name: 'YOU', streak: 1, score: '380 pts', isUser: true, activeToday: true },
    { rank: '02', name: 'Riya S.', streak: 7, score: '180 pts', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', activeToday: true },
    { rank: '03', name: 'Arjun K.', streak: 5, score: '120 pts', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', activeToday: true },
    { rank: '04', name: 'Meera T.', streak: 4, score: '90 pts', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', activeToday: false }
  ]
};

const BADGES_LIST = [
  {
    id: 'b1',
    title: 'FIRST STEP',
    desc: 'Completed Day 1 of Mantra 21',
    icon: '🌱',
    unlocked: true,
    tag: 'UNLOCKED'
  },
  {
    id: 'b2',
    title: 'MIND EXPLORER',
    desc: 'Complete your first thought reframing activity',
    icon: '🧠',
    unlocked: true,
    tag: 'UNLOCKED'
  },
  {
    id: 'b3',
    title: 'CONSISTENT',
    desc: 'Complete 7 days of showing up',
    icon: '🔥',
    unlocked: false,
    tag: 'DAY 7 MILESTONE'
  },
  {
    id: 'b4',
    title: 'RECONNECT',
    desc: 'Complete a social connection activity',
    icon: '🫂',
    unlocked: false,
    tag: 'WEEK 2'
  },
  {
    id: 'b5',
    title: 'MOMENTUM',
    desc: 'Complete 14 consecutive challenge days',
    icon: '⚡',
    unlocked: false,
    tag: 'DAY 14 MILESTONE'
  },
  {
    id: 'b6',
    title: 'MANTRA 21 FINISHER',
    desc: 'Complete all 21 challenge days & build your toolkit',
    icon: '🏆',
    unlocked: false,
    tag: 'ULTIMATE'
  }
];

const CHANGE_STAGES = [
  {
    day: 'DAY 1',
    title: 'Recognizing & Starting',
    quote: '“I\'m noticing what\'s been getting in my way without judging myself.”',
    focus: 'Noticing Mind, Body & Actions'
  },
  {
    day: 'DAY 7',
    title: 'Uncovering Patterns',
    quote: '“I\'ve started seeing my triggers and what actually helps me restart.”',
    focus: 'Micro-experiments & Momentum'
  },
  {
    day: 'DAY 14',
    title: 'Finding Your Personal Levers',
    quote: '“I know which tools feel useful to me and how to adapt when tired.”',
    focus: 'Behavioral Activation & Thought Shifts'
  },
  {
    day: 'DAY 21',
    title: 'Mastery & Self-Trust',
    quote: '“I\'ve built a personal toolkit I can carry into every day ahead.”',
    focus: 'Sustainable Daily Practice'
  }
];

export default function Mantra21ChallengeExperience({ onBack, onNavigate, service }) {
  const [currentScreen, setCurrentScreen] = useState(0); // 0 to 9
  const [leaderboardTab, setLeaderboardTab] = useState('this_week');
  const [selectedChangeStage, setSelectedChangeStage] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [friendsInvited, setFriendsInvited] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState(BADGES_LIST[0]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const startTimeRef = useRef(Date.now());
  const screenStartTimeRef = useRef(Date.now());

  // Analytics tracker
  const trackAnalyticsEvent = (eventName, metadata = {}) => {
    try {
      const payload = {
        event: eventName,
        user_id: getActiveUserId(),
        experience: 'mantra21_challenge_phase2',
        screen_index: currentScreen,
        timestamp: new Date().toISOString(),
        ...metadata
      };
      if (typeof window !== 'undefined') {
        const history = JSON.parse(localStorage.getItem('mantra21_phase2_analytics') || '[]');
        history.push(payload);
        localStorage.setItem('mantra21_phase2_analytics', JSON.stringify(history.slice(-100)));
      }
    } catch (e) {
      console.warn('Analytics logging error:', e);
    }
  };

  // Track screen transitions & time spent
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const screenNames = [
      'youre_in_the_arena',
      'leaderboard_viewed',
      'streak_viewed',
      'milestones_viewed',
      'results_preview_viewed',
      'friends_feature_viewed',
      'daily_flow_viewed',
      'competition_screen_viewed',
      'finish_line_viewed',
      'final_fomo_viewed'
    ];

    const prevScreenName = screenNames[currentScreen];
    const timeSpentOnPrev = Math.round((Date.now() - screenStartTimeRef.current) / 1000);
    
    if (prevScreenName) {
      trackAnalyticsEvent(prevScreenName, { time_spent_seconds: timeSpentOnPrev });
    }
    screenStartTimeRef.current = Date.now();
  }, [currentScreen]);

  // Handle Complete / Join Phase 2
  const handleFinalCommitment = async () => {
    setIsEnrolling(true);
    const userId = getActiveUserId();
    const timeSpentTotal = Math.round((Date.now() - startTimeRef.current) / 1000);

    trackAnalyticsEvent('phase2_cta_clicked', {
      total_time_spent_seconds: timeSpentTotal,
      friends_invited: friendsInvited
    });

    const timestamp = new Date().toISOString();

    // Persist challenge enrollment in client storage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`mantra21_enrolled_${userId}`, 'true');
        localStorage.setItem(`mantra21_phase2_completed_${userId}`, 'true');
        localStorage.setItem(`mantra21_enrolled_at_${userId}`, timestamp);
        localStorage.setItem(`mantra_21_plan_mode_${userId}`, 'challenge');
      } catch (e) {}
    }

    // Persist activity and personalization signals to DB
    const payload = {
      userId,
      activityId: 'depression_mantra21_invitation',
      lessonId: 'depression_mantra21_invitation',
      activityType: 'challenge_reveal_join',
      service: service || 'therapy',
      resultSummary: {
        pathway_id: 'depression',
        day_number: 1,
        enrolled_at: timestamp,
        status: 'enrolled_challenge',
        time_spent_seconds: timeSpentTotal,
        response_data: {
          mantra21_phase2_completed: true,
          mantra21_joined: true,
          invited_friends: friendsInvited
        }
      }
    };

    try {
      await logUserActivityToDB(payload);
      await recordUserPersonalizationSignal({
        userId,
        pathwayId: 'depression',
        signal: 'challenge_enrolled',
        strength: 5,
        sourceType: 'challenge_experience',
        sourceId: 'mantra21_phase2_arena'
      });
      await completeLesson('depression_mantra21_invitation', service || 'therapy');
    } catch (err) {
      console.warn('DB recording note:', err);
    }

    setIsEnrolling(false);

    if (onNavigate) {
      onNavigate('/');
    } else if (onBack) {
      onBack();
    }
  };

  const handleCopyInvite = () => {
    trackAnalyticsEvent('invite_clicked', { method: 'copy_link' });
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://mantra21.app/join?ref=${getActiveUserId() || 'challenger'}`);
      setCopiedLink(true);
      setFriendsInvited((prev) => prev + 1);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Nav helpers
  const goNext = () => {
    if (currentScreen < 9) {
      setCurrentScreen((prev) => prev + 1);
    } else {
      handleFinalCommitment();
    }
  };

  const goBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen((prev) => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#07080D',
        color: '#FFFFFF',
        fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Cosmic Lighting & Atmospheric Auras */}
      <div
        style={{
          position: 'fixed',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '750px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(255, 87, 34, 0.18) 0%, rgba(255, 176, 32, 0.08) 40%, rgba(13, 15, 24, 0) 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(13, 15, 24, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Main Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          padding: '20px 18px 48px 18px',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header & Progress Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            position: 'relative'
          }}
        >
          <button
            onClick={goBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#9CA3AF',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            aria-label="Previous step"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Segmented 10-step progress indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flex: 1,
              maxWidth: '240px',
              margin: '0 12px'
            }}
          >
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentScreen(idx)}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: idx <= currentScreen ? '#FF5722' : 'rgba(255, 255, 255, 0.12)',
                  boxShadow: idx === currentScreen ? '0 0 8px rgba(255, 87, 34, 0.6)' : 'none',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(255, 87, 34, 0.12)',
              border: '1px solid rgba(255, 87, 34, 0.3)',
              color: '#FF7A45',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}
          >
            <Flame size={14} color="#FF5722" />
            <span>DAY 1 ACTIVE</span>
          </div>
        </div>

        {/* Dynamic Screen Content Transitions */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            {/* ========================================================================= */}
            {/* SCREEN 1: "YOU'RE IN THE ARENA" */}
            {/* ========================================================================= */}
            {currentScreen === 0 && (
              <motion.div
                key="screen1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                {/* Badge Tag */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: 'rgba(255, 87, 34, 0.12)',
                    border: '1px solid rgba(255, 87, 34, 0.3)',
                    color: '#FF7A45',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    width: 'fit-content',
                    marginBottom: '16px'
                  }}
                >
                  <Sparkles size={14} />
                  <span>ENTERING THE CHALLENGE</span>
                </div>

                <h1
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '34px',
                    lineHeight: '1.15',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                    margin: '0 0 12px 0'
                  }}
                >
                  Okay.<br />
                  <span style={{ color: '#FF7A45' }}>Now here's where it gets interesting.</span>
                </h1>

                <p
                  style={{
                    fontSize: '17px',
                    lineHeight: '1.5',
                    color: '#9CA3AF',
                    margin: '0 0 28px 0',
                    fontWeight: 400
                  }}
                >
                  Thousands of people. 21 days. One challenge to build unstoppable self-awareness.
                </p>

                {/* The Arena Graphic: Glowing Avatars & Constellation Field */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '240px',
                    borderRadius: '24px',
                    background: 'linear-gradient(180deg, rgba(255, 87, 34, 0.08) 0%, rgba(13, 15, 24, 0.8) 100%)',
                    border: '1px solid rgba(255, 87, 34, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: '24px',
                    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)'
                  }}
                >
                  {/* Floating Avatar Circles */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    {[
                      { top: '20%', left: '15%', size: 40, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', pulse: true },
                      { top: '65%', left: '18%', size: 34, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
                      { top: '25%', right: '18%', size: 38, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', pulse: true },
                      { top: '70%', right: '22%', size: 32, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
                      { top: '45%', left: '6%', size: 28, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
                      { top: '48%', right: '8%', size: 30, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' }
                    ].map((dot, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [0, -6, 0],
                          scale: dot.pulse ? [1, 1.08, 1] : 1
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        style={{
                          position: 'absolute',
                          top: dot.top,
                          left: dot.left,
                          right: dot.right,
                          width: `${dot.size}px`,
                          height: `${dot.size}px`,
                          borderRadius: '50%',
                          border: '2px solid rgba(255, 122, 69, 0.5)',
                          backgroundImage: `url(${dot.img})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          boxShadow: '0 0 15px rgba(255, 87, 34, 0.4)'
                        }}
                      />
                    ))}
                  </div>

                  {/* Center Hero "YOU" Beacon */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      zIndex: 2
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF5722 0%, #FFB020 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#07080D',
                        fontWeight: 900,
                        fontSize: '18px',
                        boxShadow: '0 0 30px rgba(255, 87, 34, 0.8), 0 0 60px rgba(255, 176, 32, 0.4)',
                        border: '3px solid #FFFFFF'
                      }}
                    >
                      YOU
                    </div>
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#F9FAFB',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                      DAY 1 CHECKED IN
                    </div>
                  </div>
                </div>

                {/* Live Activity Counter Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    marginBottom: '28px'
                  }}
                >
                  <div
                    style={{
                      padding: '14px 10px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#FF7A45', fontFamily: 'Outfit, sans-serif' }}>
                      {DEMO_METRICS.totalParticipants}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', fontWeight: 500 }}>
                      On the journey
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px 10px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#10B981', fontFamily: 'Outfit, sans-serif' }}>
                      {DEMO_METRICS.showedUpToday}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', fontWeight: 500 }}>
                      Showed up today
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px 10px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFB020', fontFamily: 'Outfit, sans-serif' }}>
                      {DEMO_METRICS.activitiesCompletedToday}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', fontWeight: 500 }}>
                      Completed today
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '11px',
                    color: '#6B7280',
                    textAlign: 'center',
                    marginBottom: '20px',
                    fontStyle: 'italic'
                  }}
                >
                  * Prototype visualization based on active community cohorts
                </div>

                {/* CTA */}
                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  <button
                    onClick={goNext}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '17px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 10px 25px rgba(255, 87, 34, 0.4)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>Show me the challenge</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 2: THE LEADERBOARD */}
            {/* ========================================================================= */}
            {currentScreen === 1 && (
              <motion.div
                key="screen2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#FF7A45',
                    marginBottom: '6px'
                  }}
                >
                  THE MANTRA 21 LEADERBOARD
                </div>

                <h1
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '34px',
                    fontWeight: 800,
                    lineHeight: '1.15',
                    letterSpacing: '-0.02em',
                    margin: '0 0 10px 0'
                  }}
                >
                  Show up.<br />
                  <span style={{ color: '#FF7A45' }}>Move up.</span>
                </h1>

                <p
                  style={{
                    fontSize: '15px',
                    color: '#9CA3AF',
                    lineHeight: '1.5',
                    margin: '0 0 20px 0'
                  }}
                >
                  Every time you complete a challenge activity, you move closer to the top.
                </p>

                {/* Tabs */}
                <div
                  style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '4px',
                    borderRadius: '14px',
                    marginBottom: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {[
                    { id: 'this_week', label: 'THIS WEEK' },
                    { id: 'all_time', label: 'ALL TIME' },
                    { id: 'friends', label: 'FRIENDS' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setLeaderboardTab(tab.id);
                        trackAnalyticsEvent('leaderboard_tab_selected', { tab: tab.id });
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: '10px',
                        border: 'none',
                        background: leaderboardTab === tab.id ? '#FF5722' : 'transparent',
                        color: leaderboardTab === tab.id ? '#FFFFFF' : '#9CA3AF',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Leaderboard List */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '20px'
                  }}
                >
                  {DEMO_LEADERBOARD[leaderboardTab].map((item, idx) => {
                    const isUser = item.isUser;
                    return (
                      <motion.div
                        key={item.rank + item.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          background: isUser
                            ? 'linear-gradient(90deg, rgba(255, 87, 34, 0.25) 0%, rgba(255, 176, 32, 0.15) 100%)'
                            : 'rgba(255, 255, 255, 0.03)',
                          border: isUser ? '2px solid #FF5722' : '1px solid rgba(255, 255, 255, 0.06)',
                          boxShadow: isUser ? '0 0 20px rgba(255, 87, 34, 0.3)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 800,
                              color: idx < 3 ? '#FFB020' : '#6B7280',
                              fontFamily: 'Outfit, sans-serif',
                              minWidth: '22px'
                            }}
                          >
                            {item.rank}
                          </span>

                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.name}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#FF5722',
                                color: '#FFFFFF',
                                fontSize: '11px',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              YOU
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: isUser ? '#FFFFFF' : '#E5E7EB' }}>
                              {item.name} {isUser && '(You)'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{item.score}</div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: isUser ? 'rgba(255, 87, 34, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                            fontSize: '13px',
                            fontWeight: 800,
                            color: '#FF7A45'
                          }}
                        >
                          <Flame size={14} color="#FF5722" />
                          <span>{item.streak}d streak</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Reassurance Callout */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px'
                  }}
                >
                  <ShieldCheck size={18} color="#10B981" />
                  <div style={{ fontSize: '12px', color: '#9CA3AF', lineHeight: '1.4' }}>
                    <strong style={{ color: '#F3F4F6' }}>Rank is based on consistency and showing up.</strong> Never based on your symptom score or private answers.
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={goNext}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '17px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 10px 25px rgba(255, 87, 34, 0.4)'
                    }}
                  >
                    <span>Check my streak power</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 3: "YOUR STREAK" */}
            {/* ========================================================================= */}
            {currentScreen === 2 && (
              <motion.div
                key="screen3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#FF7A45',
                    marginBottom: '6px'
                  }}
                >
                  DAILY MOMENTUM
                </div>

                <h1
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '34px',
                    fontWeight: 800,
                    lineHeight: '1.15',
                    letterSpacing: '-0.02em',
                    margin: '0 0 10px 0'
                  }}
                >
                  How far can you<br />
                  <span style={{ color: '#FF7A45' }}>keep it going?</span>
                </h1>

                {/* Hero Streak Card */}
                <div
                  style={{
                    padding: '24px 20px',
                    borderRadius: '24px',
                    background: 'linear-gradient(145deg, rgba(255, 87, 34, 0.15) 0%, rgba(13, 15, 24, 0.9) 100%)',
                    border: '1px solid rgba(255, 87, 34, 0.4)',
                    textAlign: 'center',
                    marginBottom: '20px',
                    boxShadow: '0 15px 35px -10px rgba(255, 87, 34, 0.3)'
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      background: 'rgba(255, 87, 34, 0.2)',
                      color: '#FF7A45',
                      fontSize: '13px',
                      fontWeight: 800,
                      marginBottom: '12px'
                    }}
                  >
                    <Flame size={16} />
                    <span>PROJECTED MILESTONE</span>
                  </div>

                  <div
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '44px',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      letterSpacing: '-0.02em',
                      lineHeight: '1'
                    }}
                  >
                    🔥 07 DAY STREAK
                  </div>
                  <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '8px' }}>
                    You have unlocked Day 1. Only 6 days to your first master badge.
                  </div>
                </div>

                {/* 21-Day Mini Calendar Grid */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#9CA3AF', marginBottom: '12px' }}>
                    YOUR 21-DAY PATHWAY
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '6px'
                    }}
                  >
                    {Array.from({ length: 21 }).map((_, i) => {
                      const dayNum = i + 1;
                      const isComplete = dayNum === 1;
                      const isProjected = dayNum <= 7;
                      return (
                        <div
                          key={dayNum}
                          style={{
                            aspectRatio: '1/1',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isComplete
                              ? '#FF5722'
                              : isProjected
                              ? 'rgba(255, 87, 34, 0.15)'
                              : 'rgba(255, 255, 255, 0.04)',
                            border: isComplete
                              ? '1px solid #FFFFFF'
                              : isProjected
                              ? '1px dashed rgba(255, 87, 34, 0.5)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                            color: isComplete ? '#FFFFFF' : isProjected ? '#FF7A45' : '#6B7280',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          <span>{dayNum < 10 ? `0${dayNum}` : dayNum}</span>
                          {isComplete && <Check size={10} style={{ marginTop: '2px' }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Milestone Progression Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      background: 'rgba(255, 87, 34, 0.08)',
                      border: '1px solid rgba(255, 87, 34, 0.25)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>🔥</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>7 Days Streak</div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Unlocks "Consistent" badge</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#FF7A45' }}>Target</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>⚡</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF' }}>14 Days Streak</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>Unlocks "Momentum" badge</div>
                      </div>
                    </div>
                    <Lock size={14} color="#6B7280" />
                  </div>
                </div>

                {/* Gentle Permission Note */}
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    textAlign: 'center',
                    marginBottom: '20px',
                    lineHeight: '1.4'
                  }}
                >
                  ✨ <em>"Missing a day doesn't erase what you've learned. You simply pick right back up."</em>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={goNext}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '17px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 10px 25px rgba(255, 87, 34, 0.4)'
                    }}
                  >
                    <span>View unlockable badges</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 4: MILESTONES / BADGES */}
            {/* ========================================================================= */}
            {currentScreen === 3 && (
              <motion.div
                key="screen4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#FF7A45',
                    marginBottom: '6px'
                  }}
                >
                  THINGS YOU CAN UNLOCK
                </div>

                <h1
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '34px',
                    fontWeight: 800,
                    lineHeight: '1.15',
                    letterSpacing: '-0.02em',
                    margin: '0 0 10px 0'
                  }}
                >
                  Your progress<br />
                  <span style={{ color: '#FF7A45' }}>leaves a trail.</span>
                </h1>

                <p
                  style={{
                    fontSize: '15px',
                    color: '#9CA3AF',
                    lineHeight: '1.5',
                    margin: '0 0 20px 0'
                  }}
                >
                  Collectible identity badges awarded when you explore new tools and hit consistency milestones.
                </p>

                {/* Badge Collectible Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    marginBottom: '20px'
                  }}
                >
                  {BADGES_LIST.map((badge) => {
                    const isSelected = selectedBadge.id === badge.id;
                    return (
                      <div
                        key={badge.id}
                        onClick={() => {
                          setSelectedBadge(badge);
                          trackAnalyticsEvent('badge_interactions', { badge_id: badge.id });
                        }}
                        style={{
                          padding: '16px 14px',
                          borderRadius: '18px',
                          background: badge.unlocked
                            ? isSelected
                              ? 'linear-gradient(135deg, rgba(255, 87, 34, 0.25) 0%, rgba(255, 176, 32, 0.15) 100%)'
                              : 'rgba(255, 87, 34, 0.08)'
                            : 'rgba(255, 255, 255, 0.02)',
                          border: isSelected
                            ? '2px solid #FF5722'
                            : badge.unlocked
                            ? '1px solid rgba(255, 87, 34, 0.3)'
                            : '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          opacity: badge.unlocked ? 1 : 0.65,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: badge.unlocked ? 'rgba(255, 87, 34, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            marginBottom: '10px'
                          }}
                        >
                          {badge.icon}
                        </div>

                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
                          {badge.title}
                        </div>

                        <div style={{ fontSize: '10px', color: badge.unlocked ? '#FF7A45' : '#9CA3AF', fontWeight: 700 }}>
                          {badge.tag}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Badge Inspector */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Award size={16} color="#FF7A45" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{selectedBadge.title}</span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: selectedBadge.unlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        color: selectedBadge.unlocked ? '#10B981' : '#9CA3AF',
                        fontWeight: 700
                      }}
                    >
                      {selectedBadge.unlocked ? 'EARNED' : 'LOCKED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', lineHeight: '1.4' }}>
                    {selectedBadge.desc}
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={goNext}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '17px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 10px 25px rgba(255, 87, 34, 0.4)'
                    }}
                  >
                    <span>See what you'll discover</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 5: "WHAT YOU'LL SEE CHANGE" */}
            {/* ========================================================================= */}
            {currentScreen === 4 && (
              <motion.div
                key="screen5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#FF7A45',
                    marginBottom: '6px'
                  }}
                >
                  PERSONAL AWARENESS
                </div>

                <h1
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '32px',
                    fontWeight: 800,
                    lineHeight: '1.15',
                    letterSpacing: '-0.02em',
                    margin: '0 0 10px 0'
                  }}
                >
                  By Day 21, you'll know<br />
                  <span style={{ color: '#FF7A45' }}>a lot more about yourself.</span>
                </h1>

                <p
                  style={{
                    fontSize: '14px',
                    color: '#9CA3AF',
                    lineHeight: '1.4',
                    margin: '0 0 18px 0'
                  }}
                >
                  Tap each checkpoint to preview what you'll notice over the next 3 weeks:
                </p>

                {/* Stage Tabs */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '6px',
                    marginBottom: '16px'
                  }}
                >
                  {CHANGE_STAGES.map((st, i) => (
                    <button
                      key={st.day}
                      onClick={() => {
                        setSelectedChangeStage(i);
                        trackAnalyticsEvent('results_preview_viewed', { stage: st.day });
                      }}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '12px',
                        border: 'none',
                        background: selectedChangeStage === i ? '#FF5722' : 'rgba(255, 255, 255, 0.04)',
                        color: selectedChangeStage === i ? '#FFFFFF' : '#9CA3AF',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {st.day}
                    </button>
                  ))}
                </div>

                {/* Stage Detail Card */}
                <div
                  style={{
                    padding: '20px 18px',
                    borderRadius: '20px',
                    background: 'linear-gradient(145deg, rgba(255, 87, 34, 0.12) 0%, rgba(13, 15, 24, 0.9) 100%)',
                    border: '1px solid rgba(255, 87, 34, 0.3)',
                    marginBottom: '18px'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#FF7A45', marginBottom: '6px' }}>
                    {CHANGE_STAGES[selectedChangeStage].title}
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#F9FAFB',
                      fontStyle: 'italic',
                      lineHeight: '1.45',
                      marginBottom: '12px'
                    }}
                  >
                    {CHANGE_STAGES[selectedChangeStage].quote}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: '#10B981',
                      fontWeight: 700
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>Focus: {CHANGE_STAGES[selectedChangeStage].focus}</span>
                  </div>
                </div>

                {/* Mock Mantra 21 Wrapped Card */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '18px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFB020' }}>
                      🎁 YOUR MANTRA 21 WRAPPED (PREVIEW)
                    </div>
                    <span style={{ fontSize: '10px', color: '#6B7280', padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                      EXAMPLE RESULT
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#D1D5DB' }}>
                      <div style={{ color: '#9CA3AF', fontSize: '11px' }}>Strongest Pattern:</div>
                      <strong>Micro-actions work best</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#D1D5DB' }}>
                      <div style={{ color: '#9CA3AF', fontSize: '11px' }}>Personal Toolkit:</div>
                      <strong>6 custom levers saved</strong>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={goNext}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '17px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 10px 25px rgba(255, 87, 34, 0.4)'
                    }}
                  >
                    <span>Explore the social layer</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 6: THE SOCIAL LAYER */}
            {/* ========================================================================= */}
            {currentScreen === 5 && (
              <motion.div
                key="screen6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#FF7A45',
                    marginBottom: '6px'
                  }}
                >
                  DON'T DO IT ALONE
                </div>

                <h1
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '34px',
                    fontWeight: 800,
                    lineHeight: '1.15',
                    letterSpacing: '-0.02em',
                    margin: '0 0 10px 0'
                  }}
                >
                  Your people can<br />
                  <span style={{ color: '#FF7A45' }}>do it with you.</span>
                </h1>

                <p
                  style={{
                    fontSize: '15px',
                    color: '#9CA3AF',
                    lineHeight: '1.5',
                    margin: '0 0 20px 0'
                  }}
                >
                  Invite friends to track consistency together without sharing private answers.
                </p>

                {/* 3 Social Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(255, 87, 34, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FF7A45'
                      }}
                    >
                      <UserPlus size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>Invite Friends</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Start Mantra 21 together at the same time.</div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10B981'
                      }}
                    >
                      <Flame size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>Friend Streaks</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>See who's still showing up and cheer them on.</div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(255, 176, 32, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFB020'
                      }}
                    >
                      <Trophy size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>Friends Leaderboard</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>A little friendly competition never hurts.</div>
                    </div>
                  </div>
                </div>

                {/* Friend Circle Preview */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background: 'rgba(255, 87, 34, 0.08)',
                    border: '1px solid rgba(255, 87, 34, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#E5E7EB' }}>
                    <strong>Your Circle:</strong> YOU 🔥 1 • RIYA 🔥 7 • ARJUN 🔥 5
                  </div>
                  <button
                    onClick={() => {
                      setShowInviteModal(true);
                      trackAnalyticsEvent('invite_modal_opened');
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      background: '#FF5722',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 4px 14px rgba(255, 87, 34, 0.4)'
                    }}
                  >
                    <UserPlus size={13} />
                    <span>+ INVITE</span>
                  </button>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={goNext}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '17px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 10px 25px rgba(255, 87, 34, 0.4)'
                    }}
                  >
                    <span>How does daily flow work?</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 7: "WHAT HAPPENS EVERY DAY?" */}
            {/* ========================================================================= */}
            {currentScreen === 6 && (
              <motion.div
                key="screen7"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#FF7A45',
                    marginBottom: '6px'
                  }}
                >
                  DAILY COMMITMENT
                </div>

                <h1
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '34px',
                    fontWeight: 800,
                    lineHeight: '1.15',
                    letterSpacing: '-0.02em',
                    margin: '0 0 10px 0'
                  }}
                >
                  So what do you<br />
                  <span style={{ color: '#FF7A45' }}>actually do?</span>
                </h1>

                <p
                  style={{
                    fontSize: '15px',
                    color: '#9CA3AF',
                    lineHeight: '1.5',
                    margin: '0 0 20px 0'
                  }}
                >
                  Designed to fit into real life. ~5–10 minutes a day that doesn't feel heavy.
                </p>

                {/* 5-Step Animated Vertical Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {[
                    { num: '1', title: 'CHECK IN', desc: 'A quick 30-second pulse on how you\'re doing.' },
                    { num: '2', title: 'DAILY ACTIVITY (~5–10 MIN)', desc: 'Learn something, try something, or notice a pattern.' },
                    { num: '3', title: 'REAL-LIFE STEP', desc: 'One tiny 2-minute action outside the app.' },
                    { num: '4', title: 'MARK THE DAY', desc: 'Lock in your checkmark and keep your momentum.' },
                    { num: '5', title: 'WATCH YOUR PROGRESS', desc: 'Streaks rise, ranks climb, and your personal toolkit grows.' }
                  ].map((step, idx) => (
                    <div
                      key={step.num}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        padding: '12px 14px',
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: idx === 0 ? '#FF5722' : 'rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {step.num}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{step.title}</div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={goNext}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '17px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 10px 25px rgba(255, 87, 34, 0.4)'
                    }}
                  >
                    <span>See the competition gap</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 8: "THE COMPETITION" */}
            {/* ========================================================================= */}
            {currentScreen === 7 && (
              <motion.div
                key="screen8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#FF7A45',
                    marginBottom: '6px'
                  }}
                >
                  THE CLIMB
                </div>

                <h1
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '34px',
                    fontWeight: 800,
                    lineHeight: '1.15',
                    letterSpacing: '-0.02em',
                    margin: '0 0 10px 0'
                  }}
                >
                  Think you can<br />
                  <span style={{ color: '#FF7A45' }}>make the top 10?</span>
                </h1>

                <p
                  style={{
                    fontSize: '15px',
                    color: '#9CA3AF',
                    lineHeight: '1.5',
                    margin: '0 0 20px 0'
                  }}
                >
                  You're currently in the top 50 cohort. The top 10 leaderboard is only 6 consistent days away.
                </p>

                {/* Position Gap Card */}
                <div
                  style={{
                    padding: '24px 20px',
                    borderRadius: '24px',
                    background: 'linear-gradient(145deg, rgba(255, 87, 34, 0.15) 0%, rgba(13, 15, 24, 0.9) 100%)',
                    border: '1px solid rgba(255, 87, 34, 0.4)',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>YOUR CURRENT POSITION</div>
                      <div style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Outfit, sans-serif' }}>
                        #47
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#FF7A45', fontWeight: 700 }}>TOP 10 GOAL</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#F9FAFB' }}>6 activities away</div>
                    </div>
                  </div>

                  {/* Progress Gap Bar */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>
                      <span>YOU (#47)</span>
                      <span>TOP 10</span>
                    </div>
                    <div
                      style={{
                        height: '10px',
                        borderRadius: '5px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <div
                        style={{
                          width: '68%',
                          height: '100%',
                          background: 'linear-gradient(90deg, #FF5722 0%, #FFB020 100%)',
                          borderRadius: '5px',
                          boxShadow: '0 0 10px rgba(255, 87, 34, 0.6)'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Callout */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '18px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>THERE'S ONLY ONE WAY UP:</div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#FF7A45', letterSpacing: '0.05em' }}>
                    SHOW UP.
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={goNext}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '17px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 10px 25px rgba(255, 87, 34, 0.4)'
                    }}
                  >
                    <span>Preview Day 21 finish line</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 9: "THE 21-DAY FINISH LINE" */}
            {/* ========================================================================= */}
            {currentScreen === 8 && (
              <motion.div
                key="screen9"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#FF7A45',
                    marginBottom: '6px'
                  }}
                >
                  THE DESTINATION
                </div>

                <h1
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '34px',
                    fontWeight: 800,
                    lineHeight: '1.15',
                    letterSpacing: '-0.02em',
                    margin: '0 0 10px 0'
                  }}
                >
                  Imagine seeing this<br />
                  <span style={{ color: '#FF7A45' }}>on Day 21.</span>
                </h1>

                {/* Day 21 Master Completion Screen Preview */}
                <div
                  style={{
                    padding: '24px 20px',
                    borderRadius: '24px',
                    background: 'linear-gradient(180deg, rgba(255, 87, 34, 0.2) 0%, rgba(13, 15, 24, 0.95) 100%)',
                    border: '2px solid rgba(255, 87, 34, 0.5)',
                    textAlign: 'center',
                    marginBottom: '20px',
                    boxShadow: '0 20px 45px -10px rgba(255, 87, 34, 0.4)'
                  }}
                >
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF5722 0%, #FFB020 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      margin: '0 auto 14px auto',
                      boxShadow: '0 0 30px rgba(255, 87, 34, 0.7)'
                    }}
                  >
                    🏆
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFB020', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    MANTRA 21 FINISHER
                  </div>

                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', marginBottom: '14px', fontFamily: 'Outfit, sans-serif' }}>
                    CHALLENGE COMPLETE
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '16px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>21</div>
                      <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Days Done</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#10B981' }}>🔥 21</div>
                      <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Streak</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFB020' }}>Top 5%</div>
                      <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Finisher</div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '13px',
                    color: '#9CA3AF',
                    textAlign: 'center',
                    lineHeight: '1.5',
                    marginBottom: '20px'
                  }}
                >
                  You'll have a permanent personal toolkit, unshakeable habit proof, and the official Mantra 21 Finisher badge.
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={goNext}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '17px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 10px 25px rgba(255, 87, 34, 0.4)'
                    }}
                  >
                    <span>Final moment</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* SCREEN 10: FINAL FOMO & COMMITMENT */}
            {/* ========================================================================= */}
            {currentScreen === 9 && (
              <motion.div
                key="screen10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'center' }}
              >
                {/* Hero Glow Tag */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: 'rgba(255, 87, 34, 0.15)',
                    border: '1px solid rgba(255, 87, 34, 0.3)',
                    color: '#FF7A45',
                    fontSize: '12px',
                    fontWeight: 800,
                    margin: '0 auto 16px auto'
                  }}
                >
                  <Sparkles size={14} />
                  <span>THE ARENA IS OPEN</span>
                </div>

                <h1
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '36px',
                    fontWeight: 900,
                    lineHeight: '1.15',
                    letterSpacing: '-0.02em',
                    margin: '0 0 12px 0'
                  }}
                >
                  People are already<br />
                  <span style={{ color: '#FF7A45' }}>moving.</span>
                </h1>

                <p
                  style={{
                    fontSize: '16px',
                    color: '#9CA3AF',
                    lineHeight: '1.5',
                    margin: '0 auto 24px auto',
                    maxWidth: '400px'
                  }}
                >
                  You've already finished Day 1 today. Why stop at 1 when Day 2 is waiting?
                </p>

                {/* Monumental 21 Emblem */}
                <div
                  style={{
                    position: 'relative',
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 87, 34, 0.3) 0%, rgba(13, 15, 24, 0.8) 70%)',
                    border: '2px solid rgba(255, 87, 34, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 28px auto',
                    boxShadow: '0 0 50px rgba(255, 87, 34, 0.5)'
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '64px',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      lineHeight: '1',
                      letterSpacing: '-0.03em'
                    }}
                  >
                    21
                  </div>
                  <div style={{ fontSize: '11px', color: '#FF7A45', fontWeight: 800, letterSpacing: '0.1em' }}>
                    IS WAITING
                  </div>
                </div>

                {/* Quick Benefit Reminders */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginBottom: '28px'
                  }}
                >
                  <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>🔥 Streaks</div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Every day counts</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>🏆 Badges</div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>6 to unlock</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>👥 Friends</div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Show up together</div>
                  </div>
                </div>

                {/* Final Join / Commitment CTA */}
                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={handleFinalCommitment}
                    disabled={isEnrolling}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #FF5722 0%, #FFB020 100%)',
                      color: '#07080D',
                      border: 'none',
                      fontSize: '18px',
                      fontWeight: 900,
                      cursor: isEnrolling ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 12px 30px rgba(255, 87, 34, 0.6)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{isEnrolling ? 'INITIALIZING YOUR ARENA...' : "LET'S DO THIS →"}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Social Invite Modal / Bottom Sheet */}
      <Mantra21InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSent={(method) => {
          setFriendsInvited((prev) => prev + 1);
          trackAnalyticsEvent('invite_shared_success', { method });
        }}
      />
    </div>
  );
}
