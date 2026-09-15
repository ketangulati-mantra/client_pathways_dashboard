import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  Button,
  SubmissionForm,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  Clock, Award, ExternalLink, CheckCircle2 
} from 'lucide-react';

const LESSON_ID = 'share-linkedin';
const LESSON_TITLE = 'Share on LinkedIn & Earn Points';
const REWARD_POINTS = 5;

const BENEFITS = [
  { icon: Award, title: 'Boost Score', desc: 'Earn 5 Engagement Points instantly.' },
  { icon: ExternalLink, title: 'Network', desc: 'Connect with other health professionals.' }
];

const GUIDELINES = [
  "Do NOT share sensitive patient information.",
  "Ensure your profile states your affiliation with MantraCare (optional but recommended).",
  "Posts should be public to allow manual verification by the community team."
];

export default function ShareLinkedinLessonPage({ onBack }) {


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
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}
      className="animate-fade-in"
    >
      <Header title={LESSON_TITLE} onBack={onBack} progress={lessonProgress} points={REWARD_POINTS} />

      <main className="academy-main-container" style={{
        flex: 1,
        padding: '28px 24px 60px',
        maxWidth: '860px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #eef0f3',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-main)', margin: '0 0 8px' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: '1.5', maxWidth: '600px' }}>
            Promote MantraCare by sharing your professional experience, success stories, or helpful mental health content on LinkedIn. Every verified submission helps increase your provider visibility while earning Provider Engagement Points.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="overview-meta-badge"><Clock size={12} /><span>5 min activity</span></span>
            <span className="overview-meta-badge points"><Award size={12} /><span>+{REWARD_POINTS} Reward Points</span></span>
          </div>
        </div>

        {/* ── Section 1: Why This Matters ───────────────────────── */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-main)' }}>Why This Matters</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {BENEFITS.map((b, idx) => (
              <div key={idx} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #eef0f3', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: '#f0f9ff', color: 'var(--color-primary)' }}>
                  <b.icon size={16} />
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{b.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: How It Works ──────────────────────────── */}
        <section className="academy-flex-row" style={{ display: 'flex', gap: '24px' }}>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-main)' }}>How It Works</h2>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eef0f3', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>1</div>
                  <div style={{ width: '2px', flex: 1, background: '#eef0f3', marginTop: '4px' }}></div>
                </div>
                <div style={{ paddingBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>Create a LinkedIn post.</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>Suggestions:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <li>Your experience with MantraCare</li>
                    <li>Mental health awareness</li>
                    <li>Helpful wellness tips</li>
                    <li>Professional success story (without revealing client information)</li>
                  </ul>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>2</div>
                  <div style={{ width: '2px', flex: 1, background: '#eef0f3', marginTop: '4px' }}></div>
                </div>
                <div style={{ paddingBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px', color: 'var(--text-main)' }}>Publish the post.</h4>
                  <Button variant="secondary" onClick={() => window.open('https://www.linkedin.com/feed/', '_blank')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}>
                    Open LinkedIn <ExternalLink size={14} />
                  </Button>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>3</div>
                  <div style={{ width: '2px', flex: 1, background: '#eef0f3', marginTop: '4px' }}></div>
                </div>
                <div style={{ paddingBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Take a screenshot of your published LinkedIn post.</h4>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>4</div>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Upload the screenshot below.</h4>
                </div>
              </div>

            </div>
          </div>
          
          <div className="academy-w-full" style={{ width: '300px', flexShrink: 0 }}>
            {/* ── Section 3: Important Guidelines ──────────────────────── */}
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-main)' }}>Important Guidelines</h2>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eef0f3', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {GUIDELINES.map((guide, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{guide}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* ── Section 4: Submit Your Proof ─────────────────────────── */}
        <section>
          <SubmissionForm 
            onSuccess={handleActionComplete} 
            title="Submit Your Proof" 
            successTitle="Proof Submitted Successfully" 
            successMessage="Your submission has been sent for manual verification. After approval, Provider Engagement Points will automatically be credited to your account." 
            buttonText="Submit Proof"
          />
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen
          points={REWARD_POINTS}
          title="Activity Complete!"
          subtitle="You have successfully finished this task. Points will be awarded upon manual verification."
          onClose={handleCloseCelebration}
        />
      )}
    </div>
  );
}
