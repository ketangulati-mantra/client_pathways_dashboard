import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  LessonHero,
  FeatureGrid,
  StepTimeline,
  InfoCallout,
  SubmissionForm,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  UserPlus, Headset, PhoneCall, School, Heart, 
  Share2, UserCheck, Mail, Award, CheckCircle2,
  TrendingUp, Users
} from 'lucide-react';

const LESSON_ID = 'recruit-interns';
const LESSON_TITLE = 'Help Recruit New Therapy Interns & Listeners';
const REWARD_POINTS = 50;

const WHO_TO_REFER = [
  { icon: UserPlus, title: 'Therapy Interns', description: 'Students or graduates interested in mental health.' },
  { icon: Headset, title: 'Listeners', description: 'People passionate about offering emotional support.' },
  { icon: PhoneCall, title: 'Hotline Volunteers', description: 'Individuals available for crisis support shifts.' },
  { icon: School, title: 'Campus Ambassadors', description: 'Students who want to represent Mantra in colleges.' },
  { icon: Heart, title: 'Fundraising Partners', description: 'People interested in helping expand Mantra Foundation.' }
];

const TIMELINE = [
  { icon: Share2, title: 'Invite Someone', description: 'Share your referral or registration link.' },
  { icon: UserCheck, title: 'They Register', description: 'They complete registration using your referral.' },
  { icon: Mail, title: 'Inform Mantra', description: 'Email provider@mantra.care from your registered email with: Referral name, Registered email, and any supporting information.' },
  { icon: Award, title: 'Earn Credits', description: 'Credits are awarded once registration is successfully verified.' }
];

export default function RecruitInternsLessonPage({ onBack }) {


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
        flex: 1, padding: '40px 24px 80px', maxWidth: '860px', margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '48px'
      }}>

        <header style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block', padding: '6px 12px', background: '#e0f2fe', 
            color: '#0284c7', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
            marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <Users size={14} /> Referral Program
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Help grow Mantra's impact by inviting passionate people to join our mission. Earn points for every successful referral.
          </p>
        </header>

        {/* Who Can You Refer? */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Who Can You Refer?
          </h2>
          <FeatureGrid features={WHO_TO_REFER} />
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

        {/* Bonus Points Card */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Bonus Points
          </h2>
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', margin: 0 }}>
                Earn More
              </h3>
            </div>
            
            <p style={{ margin: '0', fontSize: '1.05rem', color: '#15803d', fontWeight: 600 }}>
              Want additional credits?
            </p>
            <ul style={{ margin: 0, paddingLeft: '24px', color: '#166534', fontSize: '1rem', lineHeight: '1.8' }}>
              <li>Share the internship program on LinkedIn</li>
              <li>Create Instagram stories or reels</li>
              <li>Post on Facebook or TikTok</li>
              <li>Encourage more referrals</li>
            </ul>
            <p style={{ margin: '8px 0 0 0', fontSize: '1.05rem', color: '#15803d', fontWeight: 700 }}>
              Every verified referral earns points.
            </p>
          </div>
        </section>

        {/* Important Callout */}
        <section>
          <InfoCallout 
            type="info" 
            title="Important" 
            text="Referral verification is required before credits are awarded. Only genuine registrations will be counted."
          />
        </section>

        {/* Application Form */}
        <section>
          <SubmissionForm 
            onSuccess={handleActionComplete} 
            title="Submit Referral Proof"
            successTitle="Proof Submitted Successfully"
            successMessage="Your referral has been logged. Credits will be awarded after verification."
            buttonText="Submit Proof"
          />
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Activity Complete!" subtitle="Thank you for helping us grow Mantra Foundation." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
