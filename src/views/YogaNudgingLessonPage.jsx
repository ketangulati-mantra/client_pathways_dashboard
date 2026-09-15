import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  Button,
  useToast
} from '../components';
import { CheckCircle2, Clock, Award, Target, MessageCircle, Users, PartyPopper, ShieldAlert } from 'lucide-react';

const LESSON_ID     = 'yoga-nudging';
const LESSON_TITLE  = 'Nudging Clients to Practice Daily';
const REWARD_POINTS = 5;

const STEPS = [
  {
    icon: Target,
    title: 'Set Clear Practice Goals',
    description: (
      <>
        During each session, recommend a realistic daily practice goal based on the client's schedule and experience level.
        <br/><br/>
        Examples include:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>10-20 minutes of yoga</li>
          <li>5 minutes of breathing exercises</li>
          <li>A short morning stretching routine</li>
          <li>Evening relaxation practice</li>
        </ul>
        <br/>
        Small, achievable goals improve long-term consistency.
      </>
    )
  },
  {
    icon: MessageCircle,
    title: 'Send Friendly Reminders',
    description: (
      <>
        Use chat messages to gently remind clients to stay on track.
        <br/><br/>
        Examples:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>"Have you completed today's yoga practice?"</li>
          <li>"A few mindful breaths can make a big difference today."</li>
          <li>"Keep your streak going - you're doing great!"</li>
        </ul>
        <br/>
        Supportive reminders are more effective than pressure.
      </>
    )
  },
  {
    icon: Users,
    title: 'Encourage Accountability',
    description: (
      <>
        Ask clients to send a quick update after completing their daily practice.
        <br/><br/>
        They can share:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>A short message</li>
          <li>A selfie after practice</li>
          <li>A progress update</li>
          <li>Questions or observations</li>
        </ul>
        <br/>
        This helps reinforce commitment and keeps communication active.
      </>
    )
  },
  {
    icon: PartyPopper,
    title: 'Celebrate Consistency',
    description: (
      <>
        Recognize and appreciate client efforts whenever they practice regularly.
        <br/><br/>
        Examples:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Congratulate practice streaks</li>
          <li>Appreciate improvements</li>
          <li>Highlight positive changes in flexibility, energy, or stress levels</li>
        </ul>
        <br/>
        Positive reinforcement increases motivation.
      </>
    )
  },
  {
    icon: ShieldAlert,
    title: 'Help Overcome Barriers',
    description: (
      <>
        If clients miss practice sessions, discuss what prevented them from practicing.
        <br/><br/>
        Together:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Identify obstacles</li>
          <li>Reduce session length if needed</li>
          <li>Suggest alternative timings</li>
          <li>Modify routines to fit their lifestyle</li>
        </ul>
        <br/>
        The goal is to build a sustainable long-term habit rather than expecting perfection.
      </>
    )
  }
];

export default function YogaNudgingLessonPage({ onBack }) {

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
            CLIENT ENGAGEMENT
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
            Help clients build consistency by encouraging regular yoga practice through simple reminders, motivation, and accountability between sessions.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="overview-meta-badge"><Clock size={11} /><span>2-3 min read</span></span>
            <span className="overview-meta-badge points"><Award size={11} /><span>+{REWARD_POINTS} Points</span></span>
          </div>
        </div>

        {/* ── Steps Section Header ───────────────────────────────── */}
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'var(--text-main)',
          margin: '12px 0 0'
        }}>
          Here's how it works
        </h2>

        {/* ── Steps Cards ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {STEPS.map((step, idx) => (
            <div key={idx} style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eef0f3',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
              padding: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '8px',
                background: '#f0f9ff', color: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <step.icon size={18} />
              </div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  margin: '0 0 4px'
                }}>
                  {step.title}
                </h3>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  {step.description}
                </div>
              </div>
            </div>
          ))}
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
          marginTop: '12px'
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
              You now know how to encourage daily consistency for your clients effectively.
            </p>
          </div>
          <Button
            className="academy-btn-full"
            variant="primary"
            onClick={handleActionComplete}
            disabled={actionDone}
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
            <span>{actionDone ? 'Complete' : 'Mark Lesson as Complete'}</span>
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
