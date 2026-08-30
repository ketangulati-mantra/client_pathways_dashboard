import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  UserCheck,
  Search,
  MessageSquare,
  Calendar as CalendarIcon,
  Video,
  RefreshCw,
  Clock,
  Shield,
  Loader2,
  Check
} from 'lucide-react';
import { triggerCompletionWebhook } from '../mantra/api';
import { handleExit } from '../mantra/navigation';
import CustomVideoPlayer from '../components/video/CustomVideoPlayer';

const LESSON_ID = 'first-therapy-session';
const ACTIVITY_TITLE = 'How to Book a Session';
const REWARD_POINTS = 25;

const VIDEO_CONFIG = {
  videoUrl: 'https://res.cloudinary.com/hxbamdqf/video/upload/v1787317079/How_to_Book_a_Session_with_Your_Expert_fgru3o.mp4',
  posterUrl: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1787317624/qVDdQS5oUUo-HD_kfy1fx.jpg'
};

const FLOW_STEPS = [
  {
    step: '01',
    title: 'Choose a plan',
    desc: 'Start with a trial session or select a multi-month plan.'
  },
  {
    step: '02',
    title: 'Share your preferences',
    desc: 'Tell Mantra your goals, challenges, and therapist preferences.'
  },
  {
    step: '03',
    title: 'Get matched or choose your therapist',
    desc: 'Let AI match you instantly or browse and invite a provider.'
  },
  {
    step: '04',
    title: 'Chat with your therapist',
    desc: 'Message your therapist in the app to get comfortable before booking.'
  },
  {
    step: '05',
    title: 'Pick a time & book',
    desc: 'Select a convenient date and time on your therapist\'s calendar.'
  },
  {
    step: '06',
    title: 'Join from chat',
    desc: 'Open the secure video session link shared directly in your chat.'
  }
];

const PREFERENCE_CHIPS = ['Anxiety', 'Stress', 'Low Mood', 'Relationships', 'Sleep', 'ADHD', 'OCD'];
const TIME_SLOTS = ['Tomorrow, 4:00 PM', 'Friday, 10:00 AM', 'Saturday, 2:30 PM'];

export default function FirstTherapySessionActivity({ onBack }) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('Trial Session');
  const [selectedChips, setSelectedChips] = useState(['Anxiety', 'Stress']);
  const [matchChoice, setMatchChoice] = useState('ai');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionError, setCompletionError] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth scrolling with graceful fallback
  useEffect(() => {
    let lenisInstance = null;
    let reqId = null;

    import('lenis')
      .then((module) => {
        const Lenis = module.default || module;
        lenisInstance = new Lenis({
          duration: 1.0,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true
        });

        function raf(time) {
          if (lenisInstance) {
            lenisInstance.raf(time);
            reqId = requestAnimationFrame(raf);
          }
        }
        reqId = requestAnimationFrame(raf);
      })
      .catch(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
      });

    return () => {
      if (reqId) cancelAnimationFrame(reqId);
      if (lenisInstance) lenisInstance.destroy();
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  const toggleChip = (chip) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const handleCompleteActivity = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setCompletionError(null);

    try {
      await triggerCompletionWebhook(LESSON_ID, ACTIVITY_TITLE, REWARD_POINTS);
      handleExit();
    } catch (e) {
      console.error('Failed to complete activity', e);
      handleExit();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render dynamic live UI preview for a step
  const renderStepPreview = (stepIndex = activeStep) => {
    switch (stepIndex) {
      case 0:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1d4ed8' }}>
                50% OFF First Session
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#2563eb', color: '#ffffff', padding: '2px 8px', borderRadius: '9999px' }}>
                Intro Trial
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {['Trial Session', '1 Month', '3 Months', '6 Months'].map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPlan(p)}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: selectedPlan === p ? '#1e40af' : '#f8fafc',
                    color: selectedPlan === p ? '#ffffff' : '#334155',
                    border: selectedPlan === p ? '1px solid #1e40af' : '1px solid #e2e8f0',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
              Select your focus areas:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PREFERENCE_CHIPS.map(c => {
                const active = selectedChips.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleChip(c)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      background: active ? '#eff6ff' : '#f8fafc',
                      border: active ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      color: active ? '#1d4ed8' : '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {active && <Check size={12} color="#2563eb" />}
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div
                onClick={() => setMatchChoice('ai')}
                style={{
                  background: matchChoice === 'ai' ? '#f0f9ff' : '#f8fafc',
                  border: matchChoice === 'ai' ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer'
                }}
              >
                <UserCheck size={16} color="#0284c7" />
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  AI Match
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Auto recommendations
                </div>
              </div>
              <div
                onClick={() => setMatchChoice('browse')}
                style={{
                  background: matchChoice === 'browse' ? '#ecfeff' : '#f8fafc',
                  border: matchChoice === 'browse' ? '1.5px solid #06b6d4' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer'
                }}
              >
                <Search size={16} color="#0891b2" />
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  Browse
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Choose & invite
                </div>
              </div>
            </div>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                Dr. Sarah Jenkins, Psy.D
              </span>
              <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>
                Matched
              </span>
            </div>
          </div>
        );
      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              background: '#f1f5f9',
              borderRadius: '10px 10px 10px 2px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              color: '#334155',
              lineHeight: 1.4
            }}>
              Hello! I've reviewed your preferences. Whenever you feel ready, we can schedule our video session.
            </div>
            <div style={{
              alignSelf: 'flex-end',
              background: '#2563eb',
              color: '#ffffff',
              borderRadius: '10px 10px 2px 10px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              lineHeight: 1.4
            }}>
              Thank you! Looking forward to it.
            </div>
          </div>
        );
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
              Select session slot:
            </span>
            {TIME_SLOTS.map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: selectedSlot === slot ? '#ecfdf5' : '#f8fafc',
                  border: selectedSlot === slot ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                  color: selectedSlot === slot ? '#065f46' : '#334155',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{slot}</span>
                {selectedSlot === slot ? <Check size={14} color="#10b981" /> : <Clock size={13} color="#94a3b8" />}
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div style={{
            background: '#0f172a',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>
                  Video Room
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>50:00</span>
            </div>
            <div style={{
              height: '60px',
              background: '#1e293b',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#38bdf8',
              fontSize: '0.78rem',
              fontWeight: 600
            }}>
              <Video size={16} />
              <span>Dr. Sarah Jenkins is in the room</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#94a3b8' }}>
              <Shield size={12} color="#38bdf8" />
              <span>100% Confidential</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Sticky Top Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(248, 250, 252, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 20px'
      }}>
        <div style={{
          maxWidth: '920px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onBack || handleExit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
            Booking Guide
          </span>
        </div>
      </header>

      {/* Main Narrative Container (4-5 Compact Sections Max) */}
      <main style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '36px 20px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '48px'
      }}>

        {/* SECTION 1: HERO */}
        <section id="hero" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: '#0f172a',
            margin: 0
          }}>
            How to Book a Session
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: '#475569',
            lineHeight: 1.5,
            margin: 0,
            fontWeight: 500
          }}>
            Learn how to choose a therapist, book a convenient time, and join your session.
          </p>

          <div style={{
            marginTop: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.88rem',
            color: '#334155'
          }}>
            <span>Get <strong>50% OFF</strong> your first session.</span>
            <a
              href="https://web.mantracare.com/plans/therapy"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#2563eb',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Explore Therapy Plans</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </section>

        {/* SECTION 2: VIDEO */}
        <section id="video" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              See how it works
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '4px 0 0' }}>
              Take a quick tour of how to select a therapist and schedule your appointment.
            </p>
          </div>

          <div style={{
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <CustomVideoPlayer
              videoUrl={VIDEO_CONFIG.videoUrl}
              posterUrl={VIDEO_CONFIG.posterUrl}
            />
          </div>
        </section>

        {/* SECTION 3: THE COMPLETE FLOW (INTERACTIVE TIMELINE + DYNAMIC LIVE PREVIEW) */}
        <section id="flow" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              From plan to session
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '4px 0 0' }}>
              The complete step-by-step therapy journey. Click any step to preview:
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '20px',
            alignItems: 'start'
          }}>
            {/* Left: Compact Timeline Sequence */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FLOW_STEPS.map((item, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div
                    key={item.step}
                    onClick={() => setActiveStep(idx)}
                    onMouseEnter={() => !isMobile && setActiveStep(idx)}
                    style={{
                      background: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                      border: isActive ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 4px 16px rgba(37, 99, 235, 0.08)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: isActive ? '#2563eb' : '#94a3b8',
                        marginTop: '2px'
                      }}>
                        {item.step}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <span style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: isActive ? '#1e40af' : '#0f172a'
                        }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Inline Expansion */}
                    {isMobile && isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          marginTop: '10px',
                          paddingTop: '12px',
                          borderTop: '1px solid #e2e8f0'
                        }}
                      >
                        {renderStepPreview(idx)}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Right Panel: Dynamic Interactive Live UI Preview */}
            {!isMobile && (
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '220px',
                justifyContent: 'center',
                position: 'sticky',
                top: '80px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                    Live Preview • Step {FLOW_STEPS[activeStep].step}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                    {FLOW_STEPS[activeStep].title}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {renderStepPreview(activeStep)}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: THE TWO IMPORTANT DETAILS */}
        <section id="details" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {/* Detail 1 */}
          <div style={{
            background: 'linear-gradient(145deg, #ffffff, #f0f9ff)',
            border: '1px solid #bfdbfe',
            borderRadius: '16px',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Choose your therapist your way
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Let Mantra match you with AI-assisted recommendations, or browse and invite a therapist yourself.
            </p>
          </div>

          {/* Detail 2 */}
          <div style={{
            background: 'linear-gradient(145deg, #ffffff, #ecfeff)',
            border: '1px solid #a5f3fc',
            borderRadius: '16px',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Book when you're ready
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Once connected, chat with your therapist and choose a date and time that works for both of you. Your session link is shared in chat.
            </p>
          </div>
        </section>

        {/* SECTION 5: FINAL REASSURANCE + CTA */}
        <section id="cta" style={{
          textAlign: 'center',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '36px 20px',
          boxShadow: '0 4px 24px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px'
        }}>
          {/* Reassurance */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '9999px',
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#15803d',
            maxWidth: '100%',
            boxSizing: 'border-box',
            lineHeight: 1.4,
            textAlign: 'center'
          }}>
            <RefreshCw size={14} style={{ flexShrink: 0 }} />
            <span>Not the right fit? You can switch therapists and continue your journey.</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            letterSpacing: '-0.025em'
          }}>
            Ready when you are.
          </h2>

          <p style={{
            fontSize: '0.96rem',
            color: '#475569',
            lineHeight: 1.55,
            maxWidth: '520px',
            margin: 0
          }}>
            Start with your first session and take the next step toward support.
          </p>

          <div style={{ marginTop: '2px' }}>
            <a
              href="https://web.mantracare.com/plans/therapy"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: '#2563eb',
                textDecoration: 'none'
              }}
            >
              <span>Explore Therapy Plans</span>
              <ArrowRight size={15} />
            </a>
          </div>

          {completionError && (
            <div style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 600 }}>
              {completionError}
            </div>
          )}

          <button
            onClick={handleCompleteActivity}
            disabled={isSubmitting}
            style={{
              marginTop: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.22)',
              transition: 'all 0.2s ease',
              width: '100%',
              maxWidth: '260px'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Completing...</span>
              </>
            ) : (
              <>
                <span>Complete & Continue</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </section>

      </main>
    </div>
  );
}
