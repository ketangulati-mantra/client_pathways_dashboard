import React from 'react';
import {
  Header,
  Button,
  CompletionScreen,
} from '../components';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { CheckCircle2 } from 'lucide-react';

// Lesson constants
const LESSON_ID = 'create-your-personalized-wellbeing-plan';
const LESSON_TITLE = 'Create Your Personalized Wellbeing Plan';
const REWARD_POINTS = 50;

export default function CreateWellbeingPlanLessonPage({ onBack }) {
  const {
    actionDone,
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
        flex: 1, padding: '40px 24px 80px', maxWidth: '800px', margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '40px'
      }}>

        {/* Hero Section */}
        <section style={{ textAlign: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)', padding: '40px 24px', borderRadius: '16px', border: '1px solid #dbeafe' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px', color: '#1e40af' }}>
            Build Your Personal Roadmap to Recovery
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#334155', lineHeight: '1.6', margin: '0 auto', maxWidth: '600px' }}>
            Mantra enables you to design a personalized wellbeing plan based on your unique condition. Discover how daily structured activities can empower your mental health journey.
          </p>
        </section>

        {/* What is a Wellbeing Plan? */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🧭</span> What is a Wellbeing Plan?
          </h2>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.7', margin: 0 }}>
              Your Wellbeing Plan is an evidence-based pathway designed by top psychologists after extensive research. It provides you with structured, daily activities and coping strategies uniquely tailored to support your specific mental health needs. By returning daily and following the steps, you reinforce positive habits that lead to sustainable recovery.
            </p>
          </div>
        </section>

        {/* How It Works (Step Cards) */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🛠️</span> How It Works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>1</div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: '#0f172a' }}>Select Your Condition</h3>
                <p style={{ margin: 0, color: '#64748b', lineHeight: '1.5' }}>Open the Pathways section on your dashboard and select the specific area you want to focus on.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>2</div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: '#0f172a' }}>Follow Daily Activities</h3>
                <p style={{ margin: 0, color: '#64748b', lineHeight: '1.5' }}>Your plan will provide structured, bite-sized tasks and exercises to complete each day.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>3</div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: '#0f172a' }}>Track Your Progress</h3>
                <p style={{ margin: 0, color: '#64748b', lineHeight: '1.5' }}>Monitor your consistency and see your improvement over time right from your dashboard.</p>
              </div>
            </div>

          </div>
        </section>

        {/* Supported Conditions (Chips) */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🧠</span> Supported Conditions
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {['Depression', 'Anxiety', 'Stress', 'ADHD', 'OCD', 'PTSD', 'Burnout', 'Grief', 'Relationship Issues', '+ Many More'].map(condition => (
              <span key={condition} style={{ 
                background: '#f1f5f9', 
                color: '#334155', 
                padding: '8px 16px', 
                borderRadius: '999px', 
                fontSize: '0.95rem',
                fontWeight: 500,
                border: '1px solid #e2e8f0'
              }}>
                {condition}
              </span>
            ))}
          </div>
        </section>

        {/* Key Takeaways */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, margin: '0', color: '#0f172a' }}>
            Key Takeaways
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>✔️</span>
              <span style={{ fontSize: '1.05rem', color: '#334155' }}><strong>Evidence-based:</strong> Designed by psychologists to ensure effectiveness.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>✔️</span>
              <span style={{ fontSize: '1.05rem', color: '#334155' }}><strong>Customizable:</strong> Adapts to your specific chosen condition.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>✔️</span>
              <span style={{ fontSize: '1.05rem', color: '#334155' }}><strong>Actionable:</strong> Breaks recovery down into daily, manageable steps.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>✔️</span>
              <span style={{ fontSize: '1.05rem', color: '#334155' }}><strong>Proven:</strong> The majority of users report feeling much better after following their daily plan.</span>
            </div>
          </div>
        </section>

        {/* Completion Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <Button variant="primary" onClick={handleActionComplete} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white' }}>
              <CheckCircle2 size={18} />
              <span>Mark as Completed</span>
            </Button>
          </div>
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
