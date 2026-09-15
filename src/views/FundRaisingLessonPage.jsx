import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  LessonHero,
  InterestForm,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  Heart, Megaphone, Link as LinkIcon, Video, Calendar, Users, Award, HeartPulse
} from 'lucide-react';

const LESSON_ID = 'fundraising';
const LESSON_TITLE = 'Fund Raising for Mantra Foundation';
const REWARD_POINTS = 50;

const WAYS_TO_HELP = [
  { icon: Megaphone, title: 'Spread Awareness', description: 'Share Mantra Foundation with your network.' },
  { icon: LinkIcon, title: 'Share Donation Link', description: 'Help more people discover the donation page.' },
  { icon: Video, title: 'Create Social Content', description: 'Make reels, posts or videos supporting the cause.' },
  { icon: Calendar, title: 'Organize Fundraisers', description: 'Host online or offline fundraising events.' },
  { icon: Users, title: 'Inspire Others', description: 'Encourage friends, colleagues and communities to contribute.' }
];

export default function FundRaisingLessonPage({ onBack }) {


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
            display: 'inline-block', padding: '6px 12px', background: '#ffe4e6', 
            color: '#e11d48', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
            marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <Heart size={14} fill="currentColor" /> Community Initiative
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Help make mental health support accessible to everyone by helping Mantra Foundation raise funds for outreach, therapy, and awareness programs.
          </p>
        </header>

        {/* Why It Matters Card */}
        <section>
          <div style={{
            background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '16px', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 12px rgba(225, 29, 72, 0.05)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#be123c', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartPulse size={24} /> Every contribution helps provide:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '24px', color: '#881337', fontSize: '1.05rem', lineHeight: '1.8', fontWeight: 500 }}>
              <li>Free Listener Support</li>
              <li>Subsidized Therapy</li>
              <li>Campus Mental Health Programs</li>
              <li>Crisis Support Initiatives</li>
              <li>Mental Health Awareness Campaigns</li>
            </ul>
          </div>
        </section>

        {/* Ways You Can Help */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Ways You Can Help
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {WAYS_TO_HELP.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '24px',
                background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default', height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(225, 29, 72, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
              }}
              >
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', background: '#ffe4e6',
                  color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5' }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rewards */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Rewards
          </h2>
          <div style={{
            background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0',
            padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7',
              color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Award size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Earn Credits</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.95rem', lineHeight: '1.7' }}>
                <li><strong>Successful fundraiser</strong> &rarr; 50 Credits</li>
                <li><strong>Awareness video/post</strong> &rarr; 5 Credits</li>
                <li><strong>Recognition</strong> within the Academy</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section>
          <InterestForm 
            initiative="Fund Raising" 
            onSuccess={handleActionComplete} 
            title="Join the Initiative"
            description="Complete this form to pledge your support and join our fundraising community."
          />
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Activity Complete!" subtitle="Thank you for supporting the Mantra Foundation." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
