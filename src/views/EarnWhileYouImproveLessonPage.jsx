import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  PlusCircle,
  RefreshCw,
  Check
} from 'lucide-react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { handleExit } from '../mantra/navigation';
import { triggerCompletionWebhook } from '../mantra/api';

const LESSON_ID = 'earn-while-you-improve-your-wellbeing';
const LESSON_TITLE = 'Earn While You Improve Your Wellbeing';

const HOW_IT_WORKS_STEPS = [
  {
    num: '01',
    title: 'Complete daily activities',
    desc: 'Spend a few minutes on activities designed for your wellbeing.',
    icon: CheckCircle2,
    color: '#2563eb',
    bg: '#eff6ff'
  },
  {
    num: '02',
    title: 'Earn points',
    desc: 'Every completed activity adds points to your account.',
    icon: Coins,
    color: '#16a34a',
    bg: '#f0fdf4'
  },
  {
    num: '03',
    title: 'Use your points',
    desc: 'Redeem points for discounts on wellness services across Mantra.',
    icon: Gift,
    color: '#0d9488',
    bg: '#f0fdfa'
  }
];

const MANTRA_SERVICES = [
  {
    name: 'Therapy',
    desc: 'Professional mental health support',
    icon: HeartHandshake,
    color: '#2563eb',
    bg: '#eff6ff'
  },
  {
    name: 'Yoga',
    desc: 'Movement and mindfulness',
    icon: Leaf,
    color: '#0d9488',
    bg: '#f0fdfa'
  },
  {
    name: 'Fitness',
    desc: 'Support for an active lifestyle',
    icon: Dumbbell,
    color: '#ea580c',
    bg: '#fff7ed'
  },
  {
    name: 'Coaching',
    desc: 'Guidance for goals and growth',
    icon: Compass,
    color: '#7c3aed',
    bg: '#f5f3ff'
  },
  {
    name: 'Doctor Consultations',
    desc: 'Professional health guidance',
    icon: Stethoscope,
    color: '#0284c7',
    bg: '#f0f9ff'
  },
  {
    name: 'And more',
    desc: 'Additional wellness services',
    icon: PlusCircle,
    color: '#475569',
    bg: '#f1f5f9'
  }
];

export default function EarnWhileYouImproveLessonPage({ onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completeError, setCompleteError] = useState(null);

  const {
    handleActionComplete
  } = useLessonCompletion(LESSON_ID, onBack, {
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
    setCompleteError(null);

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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
        background: '#f8fafc',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* 1. Top Navigation */}
      <header
        style={{
          height: '52px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
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
            padding: '5px 11px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          aria-label="Go back"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <h1
          style={{
            fontSize: 'clamp(0.84rem, 3.6vw, 0.94rem)',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.01em',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {LESSON_TITLE}
        </h1>
      </header>

      {/* Main Guided Scrollable Canvas */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 18px 56px',
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div
          style={{
            maxWidth: '540px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}
        >
          {/* =================================================================
              2. HERO — THE MAIN MESSAGE
             ================================================================= */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Subtle atmospheric glow */}
            <div
              style={{
                position: 'absolute',
                top: '-15px',
                right: '0%',
                width: '160px',
                height: '120px',
                background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.08) 0%, rgba(13, 148, 136, 0.05) 60%, transparent 75%)',
                filter: 'blur(20px)',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            <h2
              style={{
                position: 'relative',
                zIndex: 1,
                fontSize: 'clamp(1.55rem, 5.2vw, 2rem)',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.2,
                letterSpacing: '-0.025em',
                margin: 0
              }}
            >
              Feel better. Get rewarded for showing up.
            </h2>

            <p
              style={{
                position: 'relative',
                zIndex: 1,
                fontSize: '0.94rem',
                color: '#475569',
                lineHeight: 1.55,
                margin: 0
              }}
            >
              Complete simple wellbeing activities, earn points, and use them to unlock savings across Mantra.
            </p>

            {/* Quick 3-Pillar Loop Banner (Understood in 5 Seconds) */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginTop: '6px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '12px 10px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={16} />
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>
                  Activities
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Coins size={16} />
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>
                  Points
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gift size={16} />
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>
                  Savings
                </span>
              </div>
            </div>
          </motion.section>

          {/* =================================================================
              3. THE REWARD LOOP — PRIMARY VISUAL CARD
             ================================================================= */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid #e2e8f0',
              padding: '22px 20px',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            <h3
              style={{
                fontSize: '1.08rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.015em'
              }}
            >
              How it works
            </h3>

            {/* 3 Connected Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '4px' }}>
              {HOW_IT_WORKS_STEPS.map((step, idx) => {
                const isLast = idx === HOW_IT_WORKS_STEPS.length - 1;
                const Icon = step.icon;
                return (
                  <div
                    key={step.num}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      position: 'relative',
                      paddingBottom: isLast ? '0px' : '22px'
                    }}
                  >
                    {/* Node & Connecting Line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          background: step.bg,
                          color: step.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${step.color}25`,
                          zIndex: 2
                        }}
                      >
                        <Icon size={18} strokeWidth={2.2} />
                      </div>

                      {!isLast && (
                        <div
                          style={{
                            width: '2px',
                            flex: 1,
                            background: '#e2e8f0',
                            margin: '4px 0'
                          }}
                        />
                      )}
                    </div>

                    {/* Step Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '3px' }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                        {step.title}
                      </span>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.86rem',
                          color: '#475569',
                          lineHeight: 1.45
                        }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* =================================================================
              4. WHERE YOUR POINTS CAN GO (SERVICES GRID)
             ================================================================= */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h3
                style={{
                  fontSize: '1.08rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.015em'
                }}
              >
                Use your points across Mantra
              </h3>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
                Turn your progress into savings on the support that works for you:
              </p>
            </div>

            {/* 2-Column Responsive Service Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
              }}
            >
              {MANTRA_SERVICES.map((srv) => {
                const Icon = srv.icon;
                return (
                  <div
                    key={srv.name}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '14px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: srv.bg,
                        color: srv.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={17} strokeWidth={2.2} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                        {srv.name}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35 }}>
                        {srv.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* =================================================================
              5. SMALL REAL-WORLD EXAMPLE CARD
             ================================================================= */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#2563eb' }}>
                A Simple Example
              </span>
              <span style={{ fontSize: '0.86rem', color: '#475569', fontWeight: 500 }}>
                Complete your activities this week and build up your points.
              </span>
            </div>

            <div
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                border: '1px solid #f1f5f9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} className="text-blue-600" />
                  Activity completed
                </span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>+50 pts</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} className="text-blue-600" />
                  Activity completed
                </span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>+100 pts</span>
              </div>

              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.86rem'
                }}
              >
                <span style={{ fontWeight: 800, color: '#0f172a' }}>Your points</span>
                <span style={{ fontWeight: 800, color: '#2563eb' }}>150 pts</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} className="text-teal-600" />
              <span style={{ fontSize: '0.8rem', color: '#0d9488', fontWeight: 600 }}>
                Use points toward discounts on any wellness service.
              </span>
            </div>
          </motion.section>

          {/* =================================================================
              6. REASSURANCE / IMPORTANT MESSAGE
             ================================================================= */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
            style={{
              background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)',
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              border: '1px solid #ccfbf1'
            }}
          >
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#134e4a' }}>
              Your wellbeing comes first.
            </span>
            <span style={{ fontSize: '0.84rem', color: '#0f766e', lineHeight: 1.45 }}>
              Points are simply our way of recognising the time and care you invest in yourself.
            </span>
          </motion.section>

          {/* =================================================================
              7. FINAL CTA
             ================================================================= */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '12px',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '24px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                Ready to start earning?
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Complete activities at your own pace and collect points along the way.
              </span>
            </div>

            {completeError && (
              <div style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 600 }}>
                {completeError}
              </div>
            )}

            {!isCompleted ? (
              <button
                type="button"
                onClick={handleMarkAsDone}
                disabled={isSubmitting}
                style={{
                  minHeight: '46px',
                  width: '100%',
                  maxWidth: '320px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: isSubmitting ? '#93c5fd' : '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 3px 12px rgba(37, 99, 235, 0.2)',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = '#1d4ed8';
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = '#2563eb';
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Mark Activity as Done</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 14px',
                    borderRadius: '9999px',
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    fontSize: '0.84rem',
                    fontWeight: 800
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>Activity Completed</span>
                </div>

                <button
                  type="button"
                  onClick={handleBackClick}
                  style={{
                    marginTop: '2px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 22px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>Continue to My Plan</span>
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
