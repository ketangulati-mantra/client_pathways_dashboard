import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  StepTimeline,
  InfoCallout,
  VideoSection,
  SalesPartnerApplicationForm,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  Building2, MessageSquare, Share2, Users, Coins, Trophy, 
  Rocket, Heart, CheckCircle2, Search, ArrowRight, PenTool, Award, BookOpen
} from 'lucide-react';

const LESSON_ID = 'sales-partner';
const LESSON_TITLE = 'Becoming a Mantra Sales Partner';
const REWARD_POINTS = 50;

const WAYS_TO_HELP = [
  { icon: Building2, title: 'Introduce Companies', description: 'Recommend organizations that may benefit from EAP.' },
  { icon: MessageSquare, title: 'Make Introductions', description: 'Email, LinkedIn or personal introductions are enough.' },
  { icon: Share2, title: 'Share Opportunities', description: 'Mention Mantra when appropriate in your network.' },
  { icon: Users, title: 'Connect Decision Makers', description: 'Introduce HR teams, founders, managers or wellness leaders.' }
];

const BENEFITS = [
  { icon: Coins, title: 'Commission on successful deals' },
  { icon: Trophy, title: 'Earn Mantra Points' },
  { icon: Rocket, title: 'No sales targets' },
  { icon: Heart, title: 'Help expand mental healthcare' }
];

const TIMELINE = [
  { icon: Search, title: 'Identify a company', description: 'Think of organizations in your network.' },
  { icon: MessageSquare, title: 'Introduce Mantra', description: 'Start the conversation via email or LinkedIn.' },
  { icon: ArrowRight, title: 'Business team takes over', description: 'We handle demos, negotiations, and closing.' },
  { icon: PenTool, title: 'Company signs up', description: 'The organization officially partners with Mantra.' },
  { icon: Award, title: 'Earn commission & rewards', description: 'Receive your financial commission and Mantra Points.' }
];

const WAYS_TO_PARTICIPATE = [
  { icon: Users, title: 'Introduce a Client', description: 'Introduce MantraCare to a client or professional in your network.' },
  { icon: Building2, title: 'Recommend Companies', description: 'Share organizations where Employee Assistance Programs (EAPs) could be valuable.' },
  { icon: Share2, title: 'Make an Introduction', description: 'Connect our team with an HR leader or decision-maker through LinkedIn or email.' },
  { icon: BookOpen, title: 'Learn More', description: 'Not ready today? That\'s okay - you can explore the program and participate whenever you\'re comfortable.' }
];

export default function SalesPartnerLessonPage({ onBack }) {


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
            display: 'inline-block', padding: '6px 12px', background: '#e0e7ff', 
            color: '#4338ca', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
            marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <Building2 size={14} /> Business Development
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Help introduce organizations that may benefit from Mantra's Employee Assistance Programs while earning rewards for successful referrals.
          </p>
          
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#f0fdf4', color: '#15803d', padding: '10px 16px',
            borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600, marginTop: '24px',
            border: '1px solid #bbf7d0'
          }}>
            <Coins size={18} fill="currentColor" /> Earn commission + Mantra Points
          </div>
        </header>

        {/* Video Section */}
        <section>
          <VideoSection 
            title="Becoming a Mantra Sales Partner"
            duration="3 min"
            posterUrl="/using-mantra-thumbnail.png"
            videoUrl="https://vimeo.com/1132020422?fl=pl&fe=cm"
          />
        </section>

        {/* What Is This Program? */}
        <section>
          <InfoCallout 
            type="info" 
            title="You are NOT expected to sell."
            text="Your role is simply to introduce potential companies that could benefit from Mantra's services. Once an introduction is made, the Business Development team handles: Meetings, Product demos, Negotiations, Closing. You simply help start the conversation."
          />
        </section>

        {/* Ways You Can Help */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Ways You Can Help
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {WAYS_TO_HELP.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px',
                background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        <div className="academy-grid-2">
          {/* Why Join? */}
          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
              Why Join?
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {BENEFITS.map((cat, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px',
                  background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ color: '#0ea5e9', width: '24px', display: 'flex', justifyContent: 'center' }}>
                    <cat.icon size={24} />
                  </div>
                  <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b' }}>
                    {cat.title}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Spacer block if we wanted to keep the 2-column grid, but let's actually just close the grid here and make the next section full-width. */}
        </div>

        {/* Ways to Participate */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            Ways You Can Participate
          </h2>
          <p style={{ margin: '0 0 40px', fontSize: '1.05rem', color: '#64748b' }}>
            You don't need to commit to anything right now. Here are some examples of how our partners help:
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {WAYS_TO_PARTICIPATE.map((item, idx) => (
              <div 
                key={idx}
                style={{ 
                  display: 'flex', flexDirection: 'column', gap: '16px', padding: '32px 24px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: '#f0f9ff', color: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>
                    {item.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#475569', lineHeight: '1.6' }}>
                    {item.description}
                  </p>
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

        {/* Application Form */}
        <section>
          <SalesPartnerApplicationForm 
            onSuccess={handleActionComplete} 
          />
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Application Received!" subtitle="Our Business Development team will be in touch shortly." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
