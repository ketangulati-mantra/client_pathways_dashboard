import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  LessonHero,
  StepTimeline,
  InfoCallout,
  Button,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  Target, Handshake, Lightbulb, Calendar, TrendingUp, ArrowRight,
  Ear, Puzzle, Leaf, UserCheck, Clock, CheckCircle2, XCircle, Star
} from 'lucide-react';

const LESSON_ID = 'converting-clients';
const LESSON_TITLE = 'Converting Trial Clients';
const REWARD_POINTS = 10;

const TIMELINE = [
  { icon: Handshake, title: 'Build Trust', description: "Create rapport and understand the client's core concern." },
  { icon: Lightbulb, title: 'Deliver Value', description: 'Provide one meaningful insight, exercise, or coping strategy during the session.' },
  { icon: Calendar, title: 'Set Expectations', description: 'Explain how consistent weekly sessions create better outcomes.' },
  { icon: TrendingUp, title: 'Discuss Long-Term Progress', description: 'Help clients understand that meaningful change usually happens over multiple sessions.' },
  { icon: ArrowRight, title: 'Guide the Next Step', description: 'Recommend the appropriate therapy plan and answer any questions before they leave.' }
];

const BEST_PRACTICES = [
  { icon: Ear, title: 'Listen More Than You Speak', description: 'Give the client space to feel heard.' },
  { icon: Puzzle, title: 'Focus on Outcomes', description: 'Talk about the benefits, not just the features.' },
  { icon: Leaf, title: 'Emphasize Progress', description: 'Remind them that therapy is a journey.' },
  { icon: UserCheck, title: 'Personalize Recommendation', description: 'Suggest a plan tailored to their specific needs.' },
  { icon: Clock, title: 'Encourage Consistency', description: 'Highlight the value of regular sessions.' }
];

export default function ConvertingClientsLessonPage({ onBack }) {


  const { 
    lessonProgress, 
    showCelebrate, 
    handleCloseCelebration, 
    handleActionComplete 
  } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasQuiz: false,
    hasAction: true
  });

  const { showToast } = useToast();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }} className="animate-fade-in">
      <Header title={LESSON_TITLE} onBack={onBack} progress={lessonProgress} points={REWARD_POINTS} />

      <main className="academy-main-container" style={{
        flex: 1, padding: '40px 24px 80px', maxWidth: '900px', margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '48px'
      }}>

        <header style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block', padding: '6px 12px', background: '#fef3c7', 
            color: '#d97706', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
            marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <Target size={14} /> Growth Skill
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Learn how to build trust during the trial session and ethically guide clients toward long-term therapy.
          </p>
        </header>

        {/* The Goal */}
        <section>
          <div style={{
            background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '16px', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.05)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0369a1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={20} /> Goal
            </h3>
            <p style={{ margin: 0, color: '#0c4a6e', fontSize: '1.05rem', lineHeight: '1.6', fontWeight: 500 }}>
              Help clients understand the value of continued therapy by focusing on their long-term well-being - not by selling.
            </p>
          </div>
        </section>

        {/* Success Framework */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Success Framework
          </h2>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <StepTimeline steps={TIMELINE} />
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Best Practices
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {BEST_PRACTICES.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px',
                background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f8fafc', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Do's & Don'ts */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Do's & Don'ts
          </h2>
          <div className="academy-grid-2">
            {/* DO Column */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={24} /> DO
              </h3>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Build genuine trust',
                  'Be transparent',
                  'Recommend only when appropriate',
                  'Explain the therapy journey',
                  'Focus on client benefit'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#166534', fontSize: '1rem', fontWeight: 500 }}>
                    <span style={{ color: '#22c55e', marginTop: '2px' }}>•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* DON'T Column */}
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={24} /> DON'T
              </h3>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Pressure clients',
                  'Promise unrealistic results',
                  'Rush into selling',
                  'Oversell plans',
                  'Ignore client concerns'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#991b1b', fontSize: '1rem', fontWeight: 500 }}>
                    <span style={{ color: '#ef4444', marginTop: '2px' }}>•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Key Takeaway */}
        <section>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '32px',
            color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Star size={24} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#cbd5e1', margin: '0 0 8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Remember
            </h3>
            <p style={{ margin: 0, fontSize: '1.25rem', lineHeight: '1.6', fontWeight: 300, fontStyle: 'italic', maxWidth: '600px' }}>
              "Always frame therapy as an investment in the client's well-being - not as a transaction."
            </p>
          </div>
        </section>

        {/* Action Button */}
        <section style={{ textAlign: 'center', paddingTop: '20px' }}>
          <Button variant="primary" onClick={handleActionComplete} style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
            Mark Lesson as Complete
          </Button>
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Activity Complete!" subtitle="You've mastered the principles of converting trial clients." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
