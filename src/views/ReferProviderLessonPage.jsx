import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  StepTimeline,
  InfoCallout,
  Button,
  QuizCard,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  Globe, Users, TrendingUp, Award, Share2, UserCheck, 
  Mail, ShieldCheck, Brain, Stethoscope, Salad, Heart, 
  Dumbbell, UserPlus, Activity, PlusSquare, Trophy, Link
} from 'lucide-react';

const LESSON_ID = 'refer-provider';
const LESSON_TITLE = 'Refer a Provider & Earn Rewards';
const REWARD_POINTS = 20;

const BENEFITS = [
  { icon: Globe, title: 'Grow the Network', description: 'Help expand access to mental health professionals.' },
  { icon: Users, title: 'More Specialists', description: 'Bring therapists, psychologists, coaches, dietitians and wellness experts onto the platform.' },
  { icon: TrendingUp, title: 'Increase Platform Growth', description: 'A stronger network creates better opportunities for everyone.' },
  { icon: Award, title: 'Earn Rewards', description: 'Receive Mantra Points after successful verification.' }
];

const CATEGORIES = [
  { icon: Brain, title: 'Therapists & Counselors' },
  { icon: Stethoscope, title: 'Clinical Psychologists' },
  { icon: Salad, title: 'Dietitians & Nutritionists' },
  { icon: Heart, title: 'Yoga & Wellness Experts' },
  { icon: Dumbbell, title: 'Fitness Coaches' },
  { icon: UserPlus, title: 'Doctors' },
  { icon: Activity, title: 'Physiotherapists' },
  { icon: PlusSquare, title: 'Other Allied Health Professionals' }
];

const TIMELINE = [
  { icon: Link, title: 'Invite a Provider', description: 'Share the official onboarding link.' },
  { icon: UserCheck, title: 'Provider Registers', description: 'The provider completes registration using your referral.' },
  { icon: Mail, title: 'Send Details', description: 'Email provider@mantra.care from your registered email including: Provider Name and Registered Email.' },
  { icon: ShieldCheck, title: 'Verification', description: 'Our team verifies the referral.' },
  { icon: Award, title: 'Earn Points', description: '20 Mantra Points are credited after successful verification.' }
];

const QUIZ_QUESTIONS = [
  {
    question: 'When are the 20 Mantra Points awarded for a successful provider referral?',
    options: [
      { text: 'Immediately after you send the referral email', isCorrect: false },
      { text: 'After the referred provider completes their first 10 client sessions', isCorrect: false },
      { text: 'After the referred provider has successfully registered and the referral has been verified', isCorrect: true },
      { text: 'As soon as the referred provider clicks the registration link', isCorrect: false }
    ],
    explanation: 'Points are awarded only after successful registration, verification by the Mantra team, and correct submission of referral details.'
  },
  {
    question: 'Which information should you include in your referral email so the Mantra team can correctly track your referral?',
    options: [
      { text: 'A screenshot of the provider\'s LinkedIn profile and professional credentials', isCorrect: false },
      { text: 'Your current Mantra Points balance and Premium status', isCorrect: false },
      { text: 'A list of clients the referred provider plans to bring to the platform', isCorrect: false },
      { text: 'The referred provider\'s full name and the email address they used to register', isCorrect: true }
    ],
    explanation: 'You must provide the referred provider\'s full name and registered email address so our team can accurately match and verify your referral.'
  }
];

export default function ReferProviderLessonPage({ onBack }) {


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
            display: 'inline-block', padding: '6px 12px', background: '#f3e8ff', 
            color: '#7e22ce', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
            marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <Share2 size={14} /> Referral Program
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Help grow the Mantra provider network while earning Mantra Points for successful referrals.
          </p>
          
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#fffbeb', color: '#b45309', padding: '10px 16px',
            borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600, marginTop: '24px',
            border: '1px solid #fde68a'
          }}>
            <Trophy size={18} fill="currentColor" /> 20 Points for every verified provider referral
          </div>
        </header>

        {/* Why Refer Providers? */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Why Refer Providers?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {BENEFITS.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px',
                background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        {/* Who Can You Refer? */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Who Can You Refer?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {CATEGORIES.map((cat, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ color: '#0ea5e9' }}>
                  <cat.icon size={24} />
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                  {cat.title}
                </span>
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

        {/* Important Note */}
        <section>
          <InfoCallout 
            type="info" 
            title="Referral Rewards"
            text="Points are awarded only after: Successful registration, Verification by the Mantra team, and Referral details are submitted correctly."
          />
        </section>

        {/* Knowledge Check */}
        <section>
          <QuizCard 
            id={LESSON_ID}
            questions={QUIZ_QUESTIONS}
            onComplete={handleActionComplete}
            isCompleted={lessonProgress === 100}
            isMulti={true}
          />
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Lesson Complete!" subtitle="Start referring providers today to grow the network." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
