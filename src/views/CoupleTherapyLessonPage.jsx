import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  Button,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { CheckCircle2, Clock, Award, Users, UserPlus, Video, CheckSquare } from 'lucide-react';

const LESSON_ID     = 'couple-therapy';
const LESSON_TITLE  = 'Couple Therapy on the Mantra App';
const REWARD_POINTS = 5;

const FEATURES = [
  {
    icon: Users,
    title: 'Automatic Group Chat',
    description: (
      <>
        When a client purchases a Couple Therapy plan, MantraCare automatically creates a shared group chat connecting:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>The primary client</li>
          <li>Their partner</li>
          <li>The assigned provider</li>
        </ul>
      </>
    )
  },
  {
    icon: UserPlus,
    title: 'Invite or Restore Access',
    description: (
      <>
        If the group chat is missing, invite the partner using the <strong>Invite Member</strong> option. If not created, email <strong>provider@mantra.care</strong> with:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Order ID</li>
          <li>Emails of Partner 1 & 2</li>
        </ul>
      </>
    )
  },
  {
    icon: Video,
    title: 'During the Session',
    description: (
      <>
        To conduct a Couple Therapy session:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Start the video session with the primary client</li>
          <li>Copy the meeting link</li>
          <li>Paste it into the couple's group chat</li>
        </ul>
      </>
    )
  },
  {
    icon: CheckSquare,
    title: 'Benefits',
    description: (
      <>
        Using the shared group chat helps you:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Keep both partners informed</li>
          <li>Coordinate appointments easily</li>
          <li>Share session links quickly</li>
          <li>Maintain organized communication</li>
        </ul>
      </>
    )
  }
];

export default function CoupleTherapyLessonPage({ onBack }) {


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

  useEffect(() => {
    const pct = completedSteps.lessonRead ? 100 : 0;
    if (pct === 100) {
      const t = setTimeout(() => setShowCelebrate(true), 800);
      return () => clearTimeout(t);
    }
  }, [completedSteps]);

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
        gap: '12px'
      }}>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: '8px' }}>
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
            COLLABORATION
          </span>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: 'var(--text-main)',
            margin: '0 0 6px'
          }}>
            {LESSON_TITLE}
          </h1>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            margin: '0 0 10px',
            lineHeight: '1.6',
            maxWidth: '540px'
          }}>
            Learn how MantraCare manages Couple Therapy sessions using a shared group chat, making communication and session coordination simple for providers and both partners.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="overview-meta-badge"><Clock size={11} /><span>2 min read</span></span>
            <span className="overview-meta-badge points"><Award size={11} /><span>+{REWARD_POINTS} Points</span></span>
          </div>
        </div>

        {/* ── How Couple Therapy Works (4 Cards) ───────────────────── */}
        <div style={{ marginTop: '12px', marginBottom: '8px' }}>
          <div className="academy-grid-2" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            {FEATURES.map((feature, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #eef0f3',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '8px',
                  background: '#f8fafc', color: 'var(--text-main)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <feature.icon size={16} />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  margin: 0
                }}>
                  {feature.title}
                </h3>
                <div style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Completion card ─────────────────────────────────────── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #eef0f3',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginTop: '4px'
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CheckCircle2 size={16} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.92rem',
              color: 'var(--text-main)',
              margin: '0 0 2px'
            }}>
              You're all set!
            </p>
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: '1.5'
            }}>
              You now understand how Couple Therapy sessions are coordinated on MantraCare.
            </p>
          </div>
          <Button
            className="academy-btn-full"
            variant="primary"
            onClick={handleActionComplete}
            disabled={completedSteps.lessonRead}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '8px 18px',
              fontSize: '0.82rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <CheckCircle2 size={13} />
            <span>{completedSteps.lessonRead ? 'Complete' : 'Mark Lesson as Complete'}</span>
          </Button>
        </div>

      </main>

      {showCelebrate && (
        <CompletionScreen
          points={REWARD_POINTS}
          title="Lesson Complete!"
          subtitle="You have successfully finished this lesson and boosted your provider score."
          onClose={handleCloseCelebration}
        />
      )}
    </div>
  );
}
