import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  InfoCallout,
  Checklist,
  InterestForm,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  School, Users, Megaphone, GraduationCap, Award,
  Headset, HeartPulse, Presentation, BookOpen, HeartHandshake, Leaf
} from 'lucide-react';

const LESSON_ID = 'campus-awareness';
const LESSON_TITLE = 'Campus Mental Health Awareness';
const REWARD_POINTS = 50;

const HOW_YOU_CAN_HELP = [
  { icon: School, title: 'Identify Colleges', description: 'Reach out to your college or nearby institutions.' },
  { icon: Users, title: 'Connect Decision Makers', description: 'Introduce Mantra to counselors, faculty, student welfare teams or administration.' },
  { icon: Megaphone, title: 'Spread Awareness', description: 'Share available mental health resources with students.' },
  { icon: GraduationCap, title: 'Become a Campus Ambassador', description: 'Represent Mantra within your college.' },
  { icon: Award, title: 'Earn Credits', description: 'Receive 50 certification credits for every successful campus partnership.' }
];

const WHAT_WE_PROVIDE = [
  { icon: Headset, title: 'Free Listener Support', description: 'Students can talk to trained listeners at no cost.' },
  { icon: HeartPulse, title: 'Affordable Therapy', description: 'Access licensed therapists at subsidized rates.' },
  { icon: Presentation, title: 'Mental Health Workshops', description: 'Interactive awareness sessions for students and faculty.' },
  { icon: BookOpen, title: 'Psychoeducation Resources', description: 'Guides, articles, and self-help material.' },
  { icon: HeartHandshake, title: 'Ongoing Campus Support', description: 'Long-term collaboration with Mantra Foundation.' },
  { icon: Leaf, title: 'Student Well-being Programs', description: 'Campaigns and initiatives promoting emotional wellness.' }
];

export default function CampusAwarenessLessonPage({ onBack }) {


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

      <main style={{
        flex: 1, padding: '40px 24px 80px', maxWidth: '900px', margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '48px'
      }}>

        <header style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block', padding: '6px 12px', background: '#e0f2fe', 
            color: '#0369a1', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
            marginBottom: '16px'
          }}>
            🎓 Community Initiative
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Help bring mental health support to your college by connecting your campus with Mantra Foundation programs.
          </p>
        </header>

        <section>
          <InfoCallout 
            type="info" 
            title="Why This Matters" 
            text="Many colleges lack accessible mental health support. You can help your institution connect students with free support programs, awareness sessions, and affordable therapy resources."
          />
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            How You Can Help
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {HOW_YOU_CAN_HELP.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px',
                background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
              }}
              >
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7',
                  color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            What We Provide
          </h2>
          <div className="academy-grid-2">
            {WHAT_WE_PROVIDE.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px',
                background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default', height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
              }}
              >
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe',
                  color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <InterestForm 
            initiative="Campus Awareness" 
            onSuccess={handleActionComplete} 
          />
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Activity Complete!" subtitle="You have successfully finished this task." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
