import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Coins,
  Gift,
  HeartHandshake,
  Leaf,
  Dumbbell,
  Compass,
  Stethoscope,
  Tag,
  Check,
  TrendingUp,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { handleExit } from '../mantra/navigation';
import { triggerCompletionWebhook } from '../mantra/api';

const LESSON_ID = 'earn-while-you-improve-your-wellbeing';

const DESTINATIONS = [
  {
    id: 'therapy',
    name: '1-on-1 Therapy',
    category: 'Mental Wellbeing',
    desc: 'Deep confidential support with licensed clinical psychologists.',
    benefit: 'Save on video & audio sessions',
    icon: HeartHandshake,
    accent: '#2563eb',
    bg: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(239, 246, 255, 0.9) 100%)',
    border: 'rgba(191, 219, 254, 0.8)',
    tag: 'Most Popular',
    featured: true
  },
  {
    id: 'yoga',
    name: 'Yoga & Mindfulness',
    category: 'Mind & Body',
    desc: 'Guided breathwork, posture flows, and daily meditation routines.',
    benefit: 'Unlock guided sessions',
    icon: Leaf,
    accent: '#0d9488',
    bg: '#ffffff',
    border: 'rgba(226, 232, 240, 0.8)'
  },
  {
    id: 'fitness',
    name: 'Personal Fitness',
    category: 'Physical Health',
    desc: 'Structured workout plans and active coaching for your lifestyle.',
    benefit: 'Savings on plan upgrades',
    icon: Dumbbell,
    accent: '#ea580c',
    bg: '#ffffff',
    border: 'rgba(226, 232, 240, 0.8)'
  },
  {
    id: 'coaching',
    name: 'Life & Career Coaching',
    category: 'Growth',
    desc: 'Action-oriented strategy for personal transitions and confidence.',
    benefit: 'Discounted discovery calls',
    icon: Compass,
    accent: '#7c3aed',
    bg: '#ffffff',
    border: 'rgba(226, 232, 240, 0.8)'
  },
  {
    id: 'doctor',
    name: 'Doctor Consultations',
    category: 'Medical Care',
    desc: 'Direct telehealth consultations with medical practitioners.',
    benefit: 'Redeem on consultations',
    icon: Stethoscope,
    accent: '#0284c7',
    bg: '#ffffff',
    border: 'rgba(226, 232, 240, 0.8)'
  }
];

export default function EarnWhileYouImproveLessonPage({ onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [demoPoints, setDemoPoints] = useState(150);
  const [hasSimulatedEarn, setHasSimulatedEarn] = useState(false);

  const { handleActionComplete } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasAction: true,
    hasQuiz: false
  });

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      handleExit();
    }
  };

  const handleMarkAsDone = async () => {
    if (isCompleted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (handleActionComplete) {
        await handleActionComplete();
      } else {
        await triggerCompletionWebhook(LESSON_ID);
      }
      setIsCompleted(true);
    } catch (err) {
      setIsCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateEarn = () => {
    if (hasSimulatedEarn) {
      setDemoPoints(150);
      setHasSimulatedEarn(false);
    } else {
      setDemoPoints(160);
      setHasSimulatedEarn(true);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
        background: '#f8fafc',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#0f172a'
      }}
    >
      <header
        style={{
          height: '52px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          background: 'rgba(248, 250, 252, 0.92)',
          backdropFilter: 'blur(10px)',
          flexShrink: 0,
          zIndex: 20
        }}
      >
        <button
          type="button"
          onClick={handleBackClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
          Rewards Guide
        </span>
      </header>

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'clamp(24px, 4vw, 44px) clamp(16px, 4.5vw, 40px) 80px',
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div
          style={{
            maxWidth: '920px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '48px'
          }}
        >
          <section style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ maxWidth: '640px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  background: 'rgba(37, 99, 235, 0.08)',
                  borderRadius: '9999px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: '#2563eb',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '12px'
                }}
              >
                <Sparkles size={13} />
                <span>Mantra Rewards Loop</span>
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.6rem, 3.8vw, 2.3rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  color: '#0f172a',
                  margin: '0 0 12px 0'
                }}
              >
                Feel better. Get rewarded for showing up.
              </h1>
              <p
                style={{
                  fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                  lineHeight: 1.6,
                  color: '#475569',
                  margin: 0
                }}
              >
                Complete small wellbeing activities, collect points, and unlock savings across Mantra.
              </p>
            </div>

            <div
              style={{
                position: 'relative',
                background: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                borderRadius: '20px',
                padding: 'clamp(20px, 3vw, 28px)',
                boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.04)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(37, 99, 235, 0.04) 50%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '24px',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb',
                      flexShrink: 0
                    }}
                  >
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Step 1
                    </div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
                      Wellbeing Activity
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      Daily tasks & check-ins
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                      flexShrink: 0
                    }}
                  >
                    <Coins size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Step 2 · Earn
                    </div>
                    <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#15803d' }}>
                      +10 Points
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '1px' }}>
                      Automatically accumulated
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: '#f5f3ff',
                      border: '1px solid #ddd6fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7c3aed',
                      flexShrink: 0
                    }}
                  >
                    <Gift size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Step 3
                    </div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
                      Unlock Savings
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      Redeem across Mantra
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2
                style={{
                  fontSize: 'clamp(1.2rem, 2.6vw, 1.45rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#0f172a',
                  margin: '0 0 6px 0'
                }}
              >
                How It Works
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
                A continuous, seamless pathway connecting your daily self-care to tangible rewards.
              </p>
            </div>

            <div
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                padding: '24px 0'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                      fontWeight: 800
                    }}
                  >
                    01
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Complete
                  </span>
                </div>
                <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0f172a' }}>
                  Finish a short daily activity
                </div>
                <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  Spend just a few minutes reflecting, exploring guides, or checking in on your wellbeing goals.
                </p>
              </div>

              {/* Step 02 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '16px 20px',
                  background: 'rgba(240, 253, 244, 0.7)',
                  borderRadius: '16px',
                  border: '1px solid rgba(187, 247, 208, 0.9)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#16a34a',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 800
                      }}
                    >
                      02
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Earn
                    </span>
                  </div>
                  <span
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      boxShadow: '0 1px 4px rgba(22, 163, 74, 0.2)'
                    }}
                  >
                    +10 PTS
                  </span>
                </div>
                <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#14532d' }}>
                  Points add up automatically
                </div>
                <p style={{ fontSize: '0.86rem', color: '#166534', lineHeight: 1.5, margin: 0 }}>
                  Every completed step instantly deposits verified points straight into your personal wallet balance.
                </p>
              </div>

              {/* Step 03 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#f5f3ff',
                      color: '#7c3aed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                      fontWeight: 800
                    }}
                  >
                    03
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Unlock
                  </span>
                </div>
                <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0f172a' }}>
                  Savings across Mantra
                </div>
                <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  Redeem your accrued balance for discounts on 1-on-1 therapy, expert coaching, yoga, and medical care.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================================
              3. SEE IT IN ACTION: Compact Live Reward Balance Moment
             ================================================================= */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                borderRadius: '20px',
                padding: 'clamp(20px, 3.2vw, 28px)',
                boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Activity Completion Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid rgba(241, 245, 249, 1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: hasSimulatedEarn ? '#16a34a' : '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}
                  >
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                    Completed today · Guided Wellbeing Activity
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#16a34a',
                      background: '#f0fdf4',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      border: '1px solid #bbf7d0'
                    }}
                  >
                    <Plus size={12} />
                    <span>10 PTS</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleSimulateEarn}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: hasSimulatedEarn ? '#f1f5f9' : '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    <TrendingUp size={12} />
                    <span>{hasSimulatedEarn ? 'Reset Demo' : 'Simulate +10'}</span>
                  </button>
                </div>
              </div>

              {/* Reward Balance Showcase */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Your Mantra Points
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <motion.span
                      key={demoPoints}
                      initial={{ scale: 1.15, color: '#16a34a' }}
                      animate={{ scale: 1, color: '#0f172a' }}
                      transition={{ duration: 0.25 }}
                      style={{
                        fontSize: 'clamp(2rem, 4.5vw, 2.6rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.03em',
                        lineHeight: 1
                      }}
                    >
                      {demoPoints}
                    </motion.span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#16a34a' }}>
                      PTS
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '6px' }}>
                    Available immediately for wellness discounts and benefits.
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#334155'
                  }}
                >
                  <ShieldCheck size={16} color="#2563eb" />
                  <span>Verified Account Balance</span>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================================
              4. WHERE YOUR POINTS CAN TAKE YOU (Editorial Ecosystem)
             ================================================================= */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2
                style={{
                  fontSize: 'clamp(1.2rem, 2.6vw, 1.45rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#0f172a',
                  margin: '0 0 6px 0'
                }}
              >
                Where your points can take you
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
                Use your points to access savings across the Mantra wellness ecosystem.
              </p>
            </div>

            {/* Asymmetric Ecosystem Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px'
              }}
            >
              {DESTINATIONS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      background: item.bg,
                      border: `1px solid ${item.border}`,
                      borderRadius: '16px',
                      padding: item.featured ? '24px' : '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: item.featured ? '#2563eb' : '#f8fafc',
                            color: item.featured ? '#ffffff' : item.accent,
                            border: item.featured ? 'none' : '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <IconComponent size={19} />
                        </div>

                        {item.tag && (
                          <span
                            style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              padding: '3px 9px',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              letterSpacing: '0.02em'
                            }}
                          >
                            {item.tag}
                          </span>
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.74rem', fontWeight: 600, color: item.accent, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {item.category}
                        </div>
                        <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                          {item.name}
                        </div>
                        <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45, margin: '6px 0 0 0' }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: item.accent,
                        paddingTop: '8px',
                        borderTop: '1px dashed rgba(226, 232, 240, 0.9)'
                      }}
                    >
                      <Tag size={13} />
                      <span>{item.benefit}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* =================================================================
              5. REASSURANCE: Calm Mindset
             ================================================================= */}
          <section
            style={{
              padding: '20px 24px',
              background: 'rgba(241, 245, 249, 0.6)',
              borderRadius: '16px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                flexShrink: 0
              }}
            >
              <HeartHandshake size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                Your wellbeing comes first.
              </div>
              <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px', lineHeight: 1.45 }}>
                Points are simply our way of recognising the time you invest in yourself.
              </div>
            </div>
          </section>

          {/* =================================================================
              6. COMPLETION CTA
             ================================================================= */}
          <section
            style={{
              paddingTop: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <button
              type="button"
              onClick={handleMarkAsDone}
              disabled={isSubmitting || isCompleted}
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '14px 28px',
                borderRadius: '14px',
                background: isCompleted ? '#16a34a' : '#2563eb',
                color: '#ffffff',
                fontSize: '0.96rem',
                fontWeight: 700,
                border: 'none',
                cursor: isCompleted ? 'default' : 'pointer',
                boxShadow: isCompleted
                  ? '0 4px 14px rgba(22, 163, 74, 0.3)'
                  : '0 4px 14px rgba(37, 99, 235, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                if (!isCompleted) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                if (!isCompleted) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isCompleted ? (
                <>
                  <Check size={18} strokeWidth={2.5} />
                  <span>Activity Completed</span>
                </>
              ) : isSubmitting ? (
                <span>Saving Progress...</span>
              ) : (
                <>
                  <Sparkles size={17} />
                  <span>Mark Activity as Done</span>
                </>
              )}
            </button>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, textAlign: 'center' }}>
              Your progress will be saved to your dashboard
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
