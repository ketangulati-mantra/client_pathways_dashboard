import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  Button,
  SubmissionForm,
  useToast
} from '../components';
import { Clock, Award, UserCheck, Share2, FileText, CheckCircle2, Mail, Lightbulb } from 'lucide-react';

const LESSON_ID     = 'yoga-market-profile';
const LESSON_TITLE  = 'Market Your Profile - Yoga Experts';
const REWARD_POINTS = 5;

export default function YogaMarketProfileLessonPage({ onBack }) {

  const { 
    lessonProgress, 
    showCelebrate, 
    handleCloseCelebration, 
    handleActionComplete,
    actionDone
  } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasQuiz: false,
    hasAction: true
  });

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}
      className="animate-fade-in"
    >
      <Header title={LESSON_TITLE} onBack={onBack} progress={lessonProgress} points={REWARD_POINTS} />

      <main className="academy-main-container" style={{
        flex: 1,
        padding: '28px 24px 48px',
        maxWidth: '800px',
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
          <span style={{
            display: 'inline-block',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-primary)',
            background: '#f0f9ff',
            borderRadius: '4px',
            padding: '3px 8px',
            marginBottom: '10px'
          }}>
            MARKETING
          </span>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.4rem',
            color: 'var(--text-main)',
            margin: '0 0 8px'
          }}>
            {LESSON_TITLE}
          </h1>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            margin: '0 0 16px',
            lineHeight: '1.6',
            maxWidth: '600px'
          }}>
            Increase your visibility and attract more clients by actively promoting your YogaMantra profile and sharing valuable yoga-related content online. Consistent engagement helps improve your reach and professional reputation.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="overview-meta-badge"><Clock size={12} /><span>5 min activity</span></span>
            <span className="overview-meta-badge points"><Award size={12} /><span>+{REWARD_POINTS} Points</span></span>
          </div>
        </div>

        {/* ── Instructions Flow ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Step 1 */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #eef0f3', padding: '20px', display: 'flex', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f0f9ff', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', margin: '0 0 8px' }}>Step 1: Complete Your Profile</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: '1.5' }}>
                Before promoting yourself, ensure your YogaMantra profile is fully updated. A complete profile builds trust and improves conversions.
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: '1.5', fontWeight: 600 }}>Include:</p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                <li>Professional profile photo</li>
                <li>Qualifications & certifications</li>
                <li>Experience</li>
                <li>Specializations</li>
                <li>Services offered</li>
                <li>Bio and expertise</li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #eef0f3', padding: '20px', display: 'flex', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f0f9ff', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Share2 size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', margin: '0 0 8px' }}>Step 2: Promote Your Profile or Create Content</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: '1.5' }}>
                You may complete <strong>either</strong> of the following:
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 8px', color: 'var(--text-main)' }}>Share Your YogaMantra Profile</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>Share your public YogaMantra profile on platforms such as:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.6' }}>
                    <li>LinkedIn</li>
                    <li>Instagram</li>
                    <li>Facebook</li>
                    <li>X (Twitter)</li>
                    <li>Reddit</li>
                    <li>Quora</li>
                  </ul>
                </div>
                
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 8px', color: 'var(--text-main)' }}>Share Educational Content</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>Create and publish content related to:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.6' }}>
                    <li>Yoga tips</li>
                    <li>Breathing techniques</li>
                    <li>Stretching routines</li>
                    <li>Wellness advice</li>
                    <li>Meditation</li>
                    <li>Client success stories (without revealing confidential information)</li>
                  </ul>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '8px 0 0', fontStyle: 'italic' }}>
                    Mention or tag <strong>YogaMantra</strong> whenever appropriate.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #eef0f3', padding: '20px', display: 'flex', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f0f9ff', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', margin: '0 0 8px' }}>Step 3: Submit Your Proof</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: '1.5' }}>
                After completing the activity:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                <li>Take a screenshot of your post or profile share.</li>
                <li>Upload the screenshot using the Activity Submission Form below.</li>
                <li>Every valid submission earns engagement points after verification.</li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #eef0f3', padding: '20px', display: 'flex', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f0f9ff', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', margin: '0 0 8px' }}>Step 4: Additional Submissions</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: '1.5' }}>
                This activity can be completed multiple times. For additional submissions:
              </p>
              <ul style={{ margin: '0 0 12px', paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                <li>Email your screenshots to <strong>Provider@mantra.care</strong></li>
                <li>Subject: <strong>Provider Activity Submission Proof</strong></li>
                <li>Use the same email address registered on YogaMantra.</li>
              </ul>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                Each verified submission is eligible for additional engagement points.
              </p>
            </div>
          </div>

        </div>

        {/* ── Pro Tip ─────────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div style={{ color: '#10b981', flexShrink: 0 }}>
            <Lightbulb size={24} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#047857' }}>Pro Tip</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#065f46', lineHeight: '1.5' }}>
              Consistently sharing helpful yoga content builds credibility, improves discoverability, and attracts more clients than occasional promotional posts.
            </p>
          </div>
        </div>

        {/* ── Submission Form ─────────────────────────────────────── */}
        <section>
          <SubmissionForm 
            onSuccess={handleActionComplete} 
            title="Activity Submission Form" 
            successTitle="Proof Submitted Successfully" 
            successMessage="Your submission has been sent for manual verification. After approval, Provider Engagement Points will automatically be credited to your account." 
            buttonText="Submit Activity"
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
