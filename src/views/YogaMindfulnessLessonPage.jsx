import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  Button,
  useToast
} from '../components';
import { CheckCircle2, Clock, Award, Wind, Info, Send, Calendar, BarChart2, RefreshCw } from 'lucide-react';

const LESSON_ID     = 'yoga-mindfulness';
const LESSON_TITLE  = 'Sharing In-Session Mindfulness or Breathing Exercises to Boost Engagement';
const REWARD_POINTS = 5;

const STEPS = [
  {
    icon: Wind,
    title: 'Introduce the Technique During the Session',
    description: (
      <>
        Begin with a short mindfulness or breathing exercise during the yoga session.
        <br/><br/>
        Examples include:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Deep diaphragmatic breathing</li>
          <li>Box breathing</li>
          <li>Alternate nostril breathing (Nadi Shodhana)</li>
          <li>Mindful body scan</li>
          <li>Guided relaxation</li>
        </ul>
        <br/>
        Practice together for approximately 5-10 minutes.
      </>
    )
  },
  {
    icon: Info,
    title: 'Explain the Benefits',
    description: (
      <>
        Help clients understand why these techniques are valuable.
        <br/><br/>
        Discuss benefits such as:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Reduced stress and anxiety</li>
          <li>Improved focus and concentration</li>
          <li>Better emotional regulation</li>
          <li>Improved sleep quality</li>
          <li>Nervous system relaxation</li>
        </ul>
        <br/>
        Understanding the purpose increases long-term adherence.
      </>
    )
  },
  {
    icon: Send,
    title: 'Share Practice Instructions',
    description: (
      <>
        After the session, send simple written guidance through the MantraCare chat.
        <br/><br/>
        Include:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Step-by-step instructions</li>
          <li>Recommended duration</li>
          <li>Suggested frequency</li>
          <li>Helpful reminders for beginners</li>
        </ul>
        <br/>
        This allows clients to continue practicing independently.
      </>
    )
  },
  {
    icon: Calendar,
    title: 'Encourage Daily Practice',
    description: (
      <>
        Recommend practicing the exercise once or twice daily.
        <br/><br/>
        Encourage consistency rather than perfection, helping clients gradually build the habit into their daily routine.
      </>
    )
  },
  {
    icon: BarChart2,
    title: 'Track Progress and Gather Feedback',
    description: (
      <>
        During follow-up sessions, ask clients about:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Stress levels</li>
          <li>Mood changes</li>
          <li>Sleep improvements</li>
          <li>Ease of practice</li>
          <li>Challenges they encountered</li>
        </ul>
        <br/>
        Use their feedback to refine future sessions.
      </>
    )
  },
  {
    icon: RefreshCw,
    title: 'Adapt When Needed',
    description: (
      <>
        If a technique isn't effective or comfortable, modify the approach or introduce an alternative breathing or mindfulness exercise that better suits the client's needs.
      </>
    )
  }
];

export default function YogaMindfulnessLessonPage({ onBack }) {

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
            CARE PLANNING
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
            Teach clients simple mindfulness and breathing techniques during yoga sessions to improve relaxation, reduce stress, and encourage consistent practice beyond the session.
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
              You now know how to integrate and share mindfulness practices with your clients.
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
