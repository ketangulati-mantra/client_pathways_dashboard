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
  Brain, Activity, ClipboardList, Leaf, Dumbbell, Compass,
  Search, MessageSquare, CreditCard, Coins, Briefcase, CheckCircle2
} from 'lucide-react';

const LESSON_ID = 'refer-services';
const LESSON_TITLE = 'Refer Other Services & Earn';
const REWARD_POINTS = 10;

const SERVICES_TO_REFER = [
  { icon: Brain, title: 'Psychiatry', description: 'Medication evaluation and psychiatric consultations.' },
  { icon: Activity, title: 'OCD Care', description: 'Structured treatment for OCD and related conditions.' },
  { icon: ClipboardList, title: 'Clinical Assessments', description: 'Diagnostic assessments for better treatment planning.' },
  { icon: Leaf, title: 'Yoga & Mindfulness', description: 'Stress reduction and emotional well-being.' },
  { icon: Dumbbell, title: 'Fitness & Nutrition', description: 'Lifestyle coaching and healthy habit support.' },
  { icon: Compass, title: 'Life Coaching', description: 'Career, confidence and personal growth guidance.' }
];

const TIMELINE = [
  { icon: Search, title: 'Identify Need', description: 'Understand what additional support the client requires.' },
  { icon: MessageSquare, title: 'Recommend Service', description: 'Use Auto-Responses or the Refer & Earn section.' },
  { icon: CreditCard, title: 'Client Purchases', description: 'The client books the recommended service.' },
  { icon: Coins, title: 'Earn Commission', description: 'Receive your referral commission after verification.' }
];

export default function ReferServicesLessonPage({ onBack }) {


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
        flex: 1, padding: '40px 24px 80px', maxWidth: '1000px', margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '48px'
      }}>

        <header style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block', padding: '6px 12px', background: '#dcfce7', 
            color: '#16a34a', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
            marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <Briefcase size={14} /> Referral & Commission
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Help clients access the right care while earning referral commissions for successful recommendations.
          </p>
        </header>

        {/* Services You Can Refer (3-col responsive grid) */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Services You Can Refer
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {SERVICES_TO_REFER.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px',
                background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default', height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
              }}
              >
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe',
                  color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5' }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            How It Works
          </h2>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <StepTimeline steps={TIMELINE} />
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {/* Rewards Card */}
          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
              Rewards
            </h2>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '24px',
              display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.05)', height: '100%'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Coins size={20} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', margin: 0 }}>
                  Earn 10% Commission
                </h3>
              </div>
              
              <p style={{ margin: '0', fontSize: '1rem', color: '#15803d' }}>
                For every successful verified referral you'll receive:
              </p>
              <ul style={{ margin: 0, paddingLeft: '24px', color: '#166534', fontSize: '1rem', lineHeight: '1.8', fontWeight: 500 }}>
                <li>10% referral commission</li>
                <li>Additional provider credits</li>
                <li>Better provider engagement score</li>
              </ul>
            </div>
          </section>

          {/* When To Refer Card */}
          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
              When To Refer
            </h2>
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px',
              display: 'flex', flexDirection: 'column', gap: '16px', height: '100%'
            }}>
              <p style={{ margin: '0', fontSize: '1.05rem', color: '#334155', fontWeight: 600 }}>
                Good referral situations:
              </p>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Client requires medication',
                  'Client needs diagnostic testing',
                  'Client needs wellness support',
                  'Client wants lifestyle coaching',
                  'Client needs specialist care'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#475569', fontSize: '1rem' }}>
                    <CheckCircle2 size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Important Callout */}
        <section>
          <InfoCallout 
            type="info" 
            title="Important" 
            text="Referral commissions are credited only after the client's purchase is successfully verified. Only genuine referrals qualify."
          />
        </section>

        {/* Action Button */}
        <section style={{ textAlign: 'center', paddingTop: '20px' }}>
          <Button variant="primary" onClick={handleActionComplete} style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
            Mark Lesson as Complete
          </Button>
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Activity Complete!" subtitle="Thank you for supporting Mantra clients." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
