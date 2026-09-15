import React from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  Button,
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import {
  Star,
  Heart,
  Users,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const LESSON_ID = 'top-listener-recognition';
const LESSON_TITLE = 'Top Listener of the Month & Recognition';
const REWARD_POINTS = 10;

const HOW_IT_WORKS = [
  {
    icon: Users,
    title: 'Stay Active as a Listener',
    description: 'Engage regularly with clients and maintain consistent availability on the platform.',
  },
  {
    icon: Heart,
    title: 'Provide Quality Emotional Support',
    description: 'Practice empathetic listening, compassion, and create a safe, non-judgmental space for clients.',
  },
  {
    icon: Star,
    title: 'Earn Positive Client Feedback',
    description: 'High ratings and positive feedback increase your chances of being recognized.',
  },
  {
    icon: TrendingUp,
    title: 'Maintain Strong Performance',
    description: 'Consistently demonstrate professionalism, responsiveness, and quality support during sessions.',
  },
  {
    icon: Award,
    title: 'Get Recognized Every Month',
    description: 'Each month, outstanding listeners are selected based on consistency, client satisfaction, and overall performance.',
  },
];

export default function TopListenerLessonPage({ onBack }) {
  const {
    lessonProgress,
    showCelebrate,
    handleCloseCelebration,
    handleActionComplete,
  } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasQuiz: false,
    hasAction: true,
  });

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}
      className="animate-fade-in"
    >
      <Header title={LESSON_TITLE} onBack={onBack} progress={lessonProgress} points={REWARD_POINTS} />

      <main
        style={{
          flex: 1,
          padding: '40px 24px 80px',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}
      >
        {/* Hero */}
        <div
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '20px',
            padding: '36px 32px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '60px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={22} fill="currentColor" />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', opacity: 0.85, textTransform: 'uppercase' }}>
              Listener Recognition Program
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', margin: '0 0 12px', lineHeight: 1.25 }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, margin: '0 0 20px', lineHeight: 1.6, maxWidth: '600px' }}>
            Deliver consistent, high-quality emotional support to earn recognition as one of Mantra's Top Listeners.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem', fontWeight: 600 }}>
              <Clock size={13} /> 5 min read
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem', fontWeight: 600 }}>
              <Award size={13} /> +{REWARD_POINTS} Reward Points
            </span>
          </div>
        </div>

        {/* How It Works */}
        <section>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6366f1', background: '#ede9fe', padding: '4px 10px', borderRadius: '20px', marginBottom: '8px' }}>
              Recognition Criteria
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>
              Here is how it works
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '16px', border: '1px solid #eef0f3', padding: '28px', gap: '0' }}>
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '2px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: idx % 2 === 0 ? '#ede9fe' : '#fdf2f8', color: idx % 2 === 0 ? '#6366f1' : '#d946ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <step.icon size={18} />
                  </div>
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div style={{ width: '2px', flex: 1, minHeight: '24px', background: '#e5e7eb', margin: '4px 0' }} />
                  )}
                </div>
                <div style={{ paddingBottom: idx < HOW_IT_WORKS.length - 1 ? '24px' : '0', paddingTop: '8px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-main)' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Info callout */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#15803d', margin: '0 0 4px' }}>You are on the right track!</p>
            <p style={{ fontSize: '0.85rem', color: '#166534', margin: 0, lineHeight: 1.6 }}>
              Recognition is awarded monthly. Keep showing up consistently and your efforts will be noticed. Top Listeners receive a special badge and are featured on the Mantra Listener leaderboard.
            </p>
          </div>
        </div>

        {/* CTA */}
        <section style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
          <Button
            variant="primary"
            onClick={handleActionComplete}
            style={{ minWidth: '220px', height: '52px', fontSize: '1rem', fontWeight: 700 }}
          >
            Mark as Read
          </Button>
        </section>
      </main>

      {showCelebrate && (
        <CompletionScreen
          points={REWARD_POINTS}
          title="Activity Complete!"
          subtitle="Well done! You have learned how the Top Listener Recognition program works. Keep delivering exceptional support to earn your spot."
          onClose={handleCloseCelebration}
        />
      )}
    </div>
  );
}
