import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  Compass,
  Activity as ActivityIcon,
  LineChart,
  Headphones,
  BookMarked,
  HeartPulse,
  ClipboardList,
  Smile,
  BrainCircuit,
  ShieldCheck,
  Award,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { triggerCompletionWebhook } from '../mantra/api';
import { handleExit } from '../mantra/navigation';
import WellbeingJourneyCanvas from '../components/canvas/WellbeingJourneyCanvas';
import CustomVideoPlayer from '../components/video/CustomVideoPlayer';

const LESSON_ID = 'getting-started';
const ACTIVITY_TITLE = 'Getting Started';
const REWARD_POINTS = 25;

const VIDEO_CONFIG = {
  videoUrl: 'https://res.cloudinary.com/hxbamdqf/video/upload/v1787048802/vidssave.com_How_to_Use_TherapyMantra__Step-by-Step_App_Walkthrough_1080P_xg0ndb.mp4',
  posterUrl: 'https://img.youtube.com/vi/oEI40KlZtIw/maxresdefault.jpg'
};

const FOCUS_DATA = {
  'Anxiety': {
    tagline: 'Grounding nervous system spikes and easing anxious thought loops',
    color: '#2563eb',
    phases: [
      { step: 'Understand', desc: 'Recognize physical fight or flight signals' },
      { step: 'Practice', desc: '4-7-8 somatic breathwork and 5-4-3-2-1 grounding' },
      { step: 'Reflect', desc: 'Anxious thought defusion and reality check' },
      { step: 'Progress', desc: 'Track baseline calm drops on your weekly chart' }
    ]
  },
  'Stress': {
    tagline: 'Relieving chronic workday tension and burnout prevention',
    color: '#0284c7',
    phases: [
      { step: 'Understand', desc: 'Map workload triggers and body tension patterns' },
      { step: 'Practice', desc: 'Progressive muscle relaxation and micro resets' },
      { step: 'Reflect', desc: 'Identify energy drains and set healthy boundaries' },
      { step: 'Progress', desc: 'Build lasting daily calm and nervous system resilience' }
    ]
  },
  'Low Mood': {
    tagline: 'Breaking lethargy cycles with gentle behavioral activation',
    color: '#0d9488',
    phases: [
      { step: 'Understand', desc: 'Spot emotional dips and withdrawal patterns' },
      { step: 'Practice', desc: 'Micro activation walks and mood lift exercises' },
      { step: 'Reflect', desc: 'Self compassion logging and gratitude prompts' },
      { step: 'Progress', desc: 'Observe steady lift in daily energy and optimism' }
    ]
  },
  'ADHD': {
    tagline: 'Managing executive function friction and focus overwhelm',
    color: '#7c3aed',
    phases: [
      { step: 'Understand', desc: 'Notice focus friction and dopamine dip cues' },
      { step: 'Practice', desc: '15 minute focus sprints and body doubling' },
      { step: 'Reflect', desc: 'Task decluttering and sensory overwhelm audit' },
      { step: 'Progress', desc: 'Sustain daily routines without burnout or fatigue' }
    ]
  },
  'OCD': {
    tagline: 'Response prevention and cognitive flexibility exercises',
    color: '#c026d3',
    phases: [
      { step: 'Understand', desc: 'Separate intrusive thoughts from core values' },
      { step: 'Practice', desc: 'Urge postponement and cognitive defusion' },
      { step: 'Reflect', desc: 'Uncertainty tolerance logging and trigger reframing' },
      { step: 'Progress', desc: 'Measure steady reduction in compulsion frequency' }
    ]
  },
  'More': {
    tagline: 'Sleep quality, self esteem, relationships and habit growth',
    color: '#2563eb',
    phases: [
      { step: 'Understand', desc: 'Pinpoint specific areas you want to improve' },
      { step: 'Practice', desc: 'Custom daily exercises guided by your plan' },
      { step: 'Reflect', desc: 'Weekly reflection check ins and self care logs' },
      { step: 'Progress', desc: 'Holistic wellbeing progress across all Mantra tools' }
    ]
  }
};

const FOCUS_AREAS = Object.keys(FOCUS_DATA);

const ACTIVITY_TYPES = [
  { label: 'Learn', icon: BookOpen, color: '#2563eb', bg: '#eff6ff' },
  { label: 'Reflect', icon: Compass, color: '#06b6d4', bg: '#ecfeff' },
  { label: 'Practice', icon: ActivityIcon, color: '#3b82f6', bg: '#f0f9ff' },
  { label: 'Track', icon: LineChart, color: '#10b981', bg: '#f0fdf4' }
];

const ECOSYSTEM_TOOLS = [
  { name: 'Meditation', icon: Headphones, color: '#2563eb', bg: '#eff6ff' },
  { name: 'Journaling', icon: BookMarked, color: '#06b6d4', bg: '#ecfeff' },
  { name: 'Mindfulness', icon: HeartPulse, color: '#10b981', bg: '#f0fdf4' },
  { name: 'Assessments', icon: ClipboardList, color: '#6366f1', bg: '#eef2ff' },
  { name: 'Trackers', icon: Smile, color: '#f59e0b', bg: '#fffbeb' },
  { name: 'AI Support', icon: BrainCircuit, color: '#8b5cf6', bg: '#f5f3ff' },
  { name: 'Self-Care', icon: ShieldCheck, color: '#0284c7', bg: '#f0f9ff' }
];

export default function HowTherapymantraWorksLessonPage({ onBack }) {
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [selectedFocus, setSelectedFocus] = useState('Anxiety');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionError, setCompletionError] = useState(null);

  // Smooth scrolling with graceful fallback
  useEffect(() => {
    let lenisInstance = null;
    let reqId = null;

    import('lenis')
      .then((module) => {
        const Lenis = module.default || module;
        lenisInstance = new Lenis({
          duration: 1.1,
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

  // Track active section for 3D node activation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;
      const sections = ['hero-sec', 'mantra-sec', 'video-sec', 'plan-sec', 'activities-sec', 'tools-sec', 'points-sec', 'support-sec', 'cta-sec'];

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveNodeIndex(Math.min(5, Math.floor((i / (sections.length - 1)) * 5)));
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartJourney = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setCompletionError(null);

    try {
      // 1. Trigger the completion webhook
      await triggerCompletionWebhook(LESSON_ID, ACTIVITY_TITLE, REWARD_POINTS);
      
      // 2. Use handle exit function
      handleExit();
    } catch (e) {
      console.error('Failed to complete onboarding', e);
      handleExit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFocus = FOCUS_DATA[selectedFocus] || FOCUS_DATA['Anxiety'];

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* 3D WebGL Spatial Pathway Canvas (Persistent Midground - Fully Visible) */}
      <WellbeingJourneyCanvas activeNodeIndex={activeNodeIndex} />

      {/* Sticky Top Navigation Bar with Centered Task Heading */}
      <header
        style={{
          height: '52px',
          padding: '0 16px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(248, 250, 252, 0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          flexShrink: 0
        }}
      >
        <div style={{ justifySelf: 'start' }}>
          <button
            type="button"
            onClick={onBack || handleExit}
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
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            aria-label="Go back"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        </div>

        <h1
          style={{
            justifySelf: 'center',
            fontSize: 'clamp(0.84rem, 2.5vw, 0.94rem)',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.01em',
            margin: 0,
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }}
        >
          {ACTIVITY_TITLE}
        </h1>

        <div style={{ justifySelf: 'end' }} />
      </header>

      {/* Main Narrative Container spanning full page width with 32-40px margins */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1020px',
          width: '100%',
          margin: '0 auto',
          padding: '0 clamp(16px, 4vw, 36px) 96px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          boxSizing: 'border-box'
        }}
      >

        {/* 1. HERO */}
        <section id="hero-sec" style={{
          textAlign: 'center',
          paddingTop: '36px',
          paddingBottom: '16px',
          background: 'transparent'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 style={{
              fontSize: 'clamp(2.1rem, 4.4vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.18,
              color: '#0f172a',
              margin: '0 auto 16px'
            }}>
              A plan for your wellbeing, <br />
              <span style={{ color: '#2563eb' }}>built around you.</span>
            </h1>

            <p style={{
              fontSize: 'clamp(0.98rem, 1.8vw, 1.15rem)',
              color: '#475569',
              lineHeight: 1.6,
              maxWidth: '620px',
              margin: '0 auto',
              fontWeight: 500
            }}>
              Get a personalized plan with guided activities, practical tools, and support to help you make progress, one step at a time.
            </p>
          </motion.div>
        </section>

        {/* 2. HOW MANTRA HELPS */}
        <section id="mantra-sec" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '28px 24px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)'
        }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Everything you need to work on your wellbeing.
          </h2>
          <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: 1.65, margin: '0 0 20px' }}>
            Your personalized plan brings together activities, tools, progress tracking, and professional support in one place.
          </p>

          {/* Connected Flow - Responsive Segmented Track */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '10px'
          }}>
            {['Your Plan', 'Activities', 'Tools', 'Progress', 'Support'].map((item, idx) => (
              <div
                key={item}
                style={{
                  background: idx === 0 ? '#eff6ff' : '#ffffff',
                  border: idx === 0 ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 8px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: idx === 0 ? '#2563eb' : '#94a3b8' }}>
                  0{idx + 1}
                </span>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: idx === 0 ? '#1d4ed8' : '#334155'
                }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. SEE HOW MANTRA WORKS (VIDEO) */}
        <section id="video-sec">
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              See how Mantra works
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#64748b', margin: 0 }}>
              Take a quick tour of the app and see where your plan, activities, and wellbeing tools fit into your journey.
            </p>
          </div>

          {/* Custom Responsive Video Player */}
          <CustomVideoPlayer
            videoUrl={VIDEO_CONFIG.videoUrl}
            posterUrl={VIDEO_CONFIG.posterUrl}
          />
        </section>

        {/* 4. YOUR PLAN ADAPTS TO YOU */}
        <section id="plan-sec" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '28px 24px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Your plan adapts to you
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Choose what you'd like to work on, such as anxiety, stress, low mood, ADHD, OCD, or more. Mantra then gives you guided activities and resources tailored to your focus.
            </p>
          </div>

          {/* Dynamic Interactive Focus Tabs */}
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {FOCUS_AREAS.map((area) => {
                const isSelected = selectedFocus === area;
                return (
                  <motion.button
                    key={area}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedFocus(area)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '9999px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      color: isSelected ? '#1d4ed8' : '#475569',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.18)' : 'none',
                      transition: 'border-color 0.2s, background-color 0.2s, color 0.2s'
                    }}
                  >
                    {area}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Focus Tagline */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedFocus + '-tagline'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '8px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                color: '#166534',
                fontWeight: 600
              }}
            >
              <Sparkles size={15} color="#16a34a" />
              <span><strong>{selectedFocus}:</strong> {currentFocus.tagline}</span>
            </motion.div>
          </AnimatePresence>

          {/* Dynamic 4-Phase Roadmap Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedFocus + '-phases'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '14px'
              }}
            >
              {currentFocus.phases.map((phase, idx) => (
                <div
                  key={phase.step}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    gap: '6px',
                    minHeight: '100px',
                    boxSizing: 'border-box'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    Phase 0{idx + 1} • {phase.step}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.45, fontWeight: 500 }}>
                    {phase.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* 5. SMALL ACTIVITIES. REAL PROGRESS. */}
        <section id="activities-sec" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '28px 24px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Small activities. Real progress.
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Your plan gives you activities that help you learn, reflect, practice, and track, so you can take small steps toward feeling better.
            </p>
          </div>

          {/* Compact 4 Action Pillars */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px'
          }}>
            {ACTIVITY_TYPES.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.label}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: act.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: act.color
                  }}>
                    <Icon size={16} />
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                    {act.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. TOOLS WHEN YOU NEED THEM */}
        <section id="tools-sec" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '28px 24px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Tools when you need them
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Explore meditation, journaling, mindfulness, assessments, trackers, AI support, and more whenever you need them.
            </p>
          </div>

          {/* Connected Tool Ecosystem */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '8px'
          }}>
            {ECOSYSTEM_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.name}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: tool.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tool.color,
                    flexShrink: 0
                  }}>
                    <Icon size={14} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                    {tool.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. EVERY STEP COUNTS */}
        <section id="points-sec" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '28px 24px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Every step counts
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Complete activities and meaningful actions to earn points.
            </p>
          </div>

          {/* Sequence Flow - Balanced 3-Column Card Track */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '10px'
          }}>
            {[
              { title: 'Complete', desc: 'Finish activities' },
              { title: 'Earn Points', desc: '+10 pts reward', highlight: true },
              { title: 'Redeem Rewards', desc: 'Eligible services' }
            ].map((step, idx) => (
              <div
                key={step.title}
                style={{
                  background: step.highlight ? '#eff6ff' : '#ffffff',
                  border: step.highlight ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 8px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px'
                }}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: step.highlight ? '#2563eb' : '#94a3b8', textTransform: 'uppercase' }}>
                  Step 0{idx + 1}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: step.highlight ? '#1d4ed8' : '#0f172a' }}>
                  {step.title}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {step.desc}
                </span>
              </div>
            ))}
          </div>

          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.55 }}>
            Points can be used toward eligible wellness services available through Mantra.
          </p>
        </section>

        {/* 8. NEED MORE SUPPORT? */}
        <section id="support-sec" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              Need more support?
            </h2>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2563eb' }}>
              You're not on your own.
            </div>
          </div>

          <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            Explore professional support from qualified therapists and other wellness services whenever you need additional help.
          </p>

          <div>
            <a
              href="https://mantracare.com/therapy"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#2563eb',
                textDecoration: 'none'
              }}
            >
              <span>Explore professional support</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </section>

        {/* 9. FINAL CTA & COMPLETION */}
        <section id="cta-sec" style={{
          textAlign: 'center',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '40px 20px',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              You're ready to get started.
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.6, margin: '0 0 24px' }}>
              Open your personalized plan, complete your first activity, and take the next step toward better wellbeing.
            </p>

            {completionError && (
              <div style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>
                {completionError}
              </div>
            )}

            <button
              onClick={handleStartJourney}
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 32px',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s ease',
                width: '100%',
                maxWidth: '260px'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <span>Start My Journey</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
