const fs = require('fs');

const pageContent = `import React from 'react';
import { Header, Button, Timeline, CompletionScreen } from '../components';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { 
  Stethoscope, Dumbbell, Apple, BrainCircuit, Leaf, HeartHandshake, CheckCircle2, Sparkles 
} from 'lucide-react';

const LESSON_ID = 'earn-while-you-improve-your-wellbeing';
const LESSON_TITLE = 'Earn While You Improve Your Wellbeing';
const REWARD_POINTS = 50;

const TIMELINE_STEPS = [
  {
    title: 'Choose Your Pathway',
    description: 'Select the primary condition or wellness goal you want to focus on.'
  },
  {
    title: 'Receive Your 60-Day Plan',
    description: 'Our system creates a personalized, day-by-day plan tailored specifically to your needs.'
  },
  {
    title: 'Complete Daily Activities',
    description: 'Every day, new guided activities become available. Read lessons, watch videos, and practice mindfulness.'
  },
  {
    title: 'Earn Mantra Points',
    description: 'You are rewarded for your consistency! Earn points for every activity you complete.'
  },
  {
    title: 'Redeem Rewards',
    description: 'Use your earned points to unlock premium wellness services across the Mantra ecosystem.'
  }
];

const REWARDS = [
  { name: 'Therapy', icon: HeartHandshake, color: '#ec4899' },
  { name: 'Yoga', icon: Leaf, color: '#10b981' },
  { name: 'Fitness', icon: Dumbbell, color: '#f59e0b' },
  { name: 'Coaching', icon: Sparkles, color: '#8b5cf6' },
  { name: 'Doctor Consults', icon: Stethoscope, color: '#3b82f6' },
  { name: 'Meditation', icon: BrainCircuit, color: '#6366f1' },
  { name: 'Nutrition', icon: Apple, color: '#ef4444' }
];

export default function EarnWhileYouImproveLessonPage({ onBack }) {
  const {
    lessonProgress,
    showCelebrate,
    handleActionComplete,
    handleCloseCelebration
  } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasAction: true,
    hasQuiz: false,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }} className="animate-fade-in">
      <Header title={LESSON_TITLE} onBack={onBack} progress={lessonProgress} points={REWARD_POINTS} />

      <main className="academy-main-container" style={{
        flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '48px'
      }}>

        <section className="academy-hero-card theme-primary animate-slide-up" style={{ textAlign: 'center' }}>
          <div className="hero-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6', width: '64px', height: '64px', margin: '0 auto 24px' }}>
            <Sparkles size={32} />
          </div>
          <h2 className="hero-title" style={{ fontSize: 'var(--text-h1)', marginBottom: '16px' }}>Your Wellbeing Journey is Rewarding</h2>
          <p className="hero-desc" style={{ fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Taking care of your mental health takes effort, and we believe that consistency should be celebrated. Here is how your pathway helps you build healthy habits and rewards you along the way.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 'var(--text-h2)', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            How Your Journey Works
          </h2>
          <Timeline steps={TIMELINE_STEPS} currentStepIndex={TIMELINE_STEPS.length} />
        </section>

        <section>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: 'var(--text-h2)', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Where You Can Use Your Points
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Redeem your hard-earned points across the entire Mantra ecosystem.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
            {REWARDS.map((reward, idx) => {
              const Icon = reward.icon;
              return (
                <div key={idx} style={{ 
                  background: '#ffffff', 
                  borderRadius: '16px', 
                  padding: '24px 16px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'transform 0.2s',
                  cursor: 'default'
                }}>
                  <div style={{ padding: '12px', background: reward.color + '15', borderRadius: '50%', color: reward.color }}>
                    <Icon size={28} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>{reward.name}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ 
          background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', 
          padding: '40px 24px', 
          borderRadius: '24px', 
          textAlign: 'center',
          border: '1px solid #bae6fd'
        }}>
          <h2 style={{ fontSize: 'var(--text-h2)', fontWeight: 800, color: '#0369a1', marginBottom: '16px' }}>
            Keep Going!
          </h2>
          <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 32px' }}>
            Every activity you complete is a step toward a healthier, happier you. Build your daily streak and unlock the best version of yourself.
          </p>

          <Button 
            variant="primary" 
            onClick={handleActionComplete} 
            style={{ padding: '12px 32px', fontSize: '1rem', borderRadius: '999px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
          >
            <CheckCircle2 size={18} />
            <span>Mark as Completed</span>
          </Button>
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/views/EarnWhileYouImproveLessonPage.jsx', pageContent);
console.log('EarnWhileYouImproveLessonPage rewritten to fix all template strings.');
