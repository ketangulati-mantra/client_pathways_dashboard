import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  Button,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { CheckCircle2, Clock, Award } from 'lucide-react';

const LESSON_ID     = 'premium-provider';
const LESSON_TITLE  = 'What is a Premium Provider?';
const REWARD_POINTS = 5;

const STAGES = [
  {
    badge: 'Stage 1',
    title: 'Listed Provider',
    description: 'Your profile is visible across the MantraCare network and can receive organic client enquiries.',
    left: [
      {
        heading: 'Visibility',
        items: [
          'Your public profile is searchable on MantraCare.',
          'Clients can discover and contact you directly.',
        ]
      },
      {
        heading: 'Expectations',
        items: [
          'Optimise your profile, specialties and reviews.',
          'Build your session history and client ratings.',
        ]
      }
    ],
    right: [
      {
        heading: 'How it Works',
        items: [
          'At this stage, there is no automatic client matching.',
          'You acquire bookings organically through your profile presence.',
        ]
      }
    ]
  },
  {
    badge: 'Stage 2',
    title: 'Verified Provider',
    description: 'Increase client trust by having your professional credentials reviewed and approved by Mantra.',
    left: [
      {
        heading: 'Benefits',
        items: [
          'A verified badge appears on your public profile.',
          'Higher client trust and improved booking conversion.',
        ]
      },
      {
        heading: 'Notes',
        items: [
          'Approval is manual and reviewed by the compliance team.',
          'Ensure all documents are current and clearly legible.',
        ]
      }
    ],
    right: [
      {
        heading: 'Verification Process',
        items: [
          'Upload practitioner credentials and licences (PDF or JPEG, max 5 MB).',
          'Compliance team reviews your submission within 1-2 business days.',
        ]
      }
    ]
  },
  {
    badge: 'Stage 3',
    title: 'Premium Provider',
    description: 'Unlock automatic client referrals and become eligible for Mantra\'s internal client allocation engine.',
    left: [
      {
        heading: 'Benefits',
        items: [
          'Corporate and individual client referrals sent directly to you.',
          'Higher platform visibility and monthly earning opportunities.',
        ]
      },
      {
        heading: 'Requirement',
        items: [
          '500 Provider Points required to activate Premium status.',
          'Progress is tracked automatically on your dashboard.',
        ]
      }
    ],
    right: [
      {
        heading: 'How to Unlock',
        items: [
          'Earn 500 Provider Engagement Points.',
          'Complete Academy lessons, onboarding tasks and portal activities.',
        ]
      }
    ]
  }
];

export default function PremiumProviderLessonPage({ onBack }) {


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
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: 'var(--text-main)',
            margin: '0 0 6px'
          }}>
            What is a Premium Provider?
          </h1>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            margin: '0 0 10px',
            lineHeight: '1.6',
            maxWidth: '540px'
          }}>
            Understand how providers progress through MantraCare, what each stage means, and how to unlock Premium status.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="overview-meta-badge"><Clock size={11} /><span>3 min read</span></span>
            <span className="overview-meta-badge points"><Award size={11} /><span>+{REWARD_POINTS} Points</span></span>
          </div>
        </div>

        {/* ── Stage cards ────────────────────────────────────────── */}
        {STAGES.map((stage, idx) => (
          <div
            key={idx}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #eef0f3',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
              padding: '20px 24px'
            }}
          >
            {/* Card header */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{
                display: 'inline-block',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#6b7280',
                background: '#f3f4f6',
                borderRadius: '4px',
                padding: '2px 7px',
                marginBottom: '7px'
              }}>
                {stage.badge}
              </span>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: 'var(--text-main)',
                margin: '0 0 5px'
              }}>
                {stage.title}
              </h2>
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: '1.55'
              }}>
                {stage.description}
              </p>
            </div>

            {/* Two-column content */}
            <div className="academy-grid-2" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              borderTop: '1px solid #f3f4f6',
              paddingTop: '16px'
            }}>
              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {stage.left.map((block, bIdx) => (
                  <div key={bIdx}>
                    <p style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      margin: '0 0 5px'
                    }}>
                      {block.heading}
                    </p>
                    {block.items.map((item, iIdx) => (
                      <p key={iIdx} style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        margin: '0 0 3px',
                        lineHeight: '1.5'
                      }}>
                        {item}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              {/* Right column */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderLeft: '1px solid #f3f4f6',
                paddingLeft: '20px'
              }}>
                {stage.right.map((block, bIdx) => (
                  <div key={bIdx}>
                    <p style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      margin: '0 0 5px'
                    }}>
                      {block.heading}
                    </p>
                    {block.items.map((item, iIdx) => (
                      <p key={iIdx} style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        margin: '0 0 3px',
                        lineHeight: '1.5'
                      }}>
                        {item}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

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
              You now understand how provider levels work and how to unlock Premium status.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleActionComplete}
            disabled={completedSteps.lessonRead}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '8px 18px',
              fontSize: '0.82rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <CheckCircle2 size={13} />
            <span>{completedSteps.lessonRead ? 'Complete' : 'Mark as Complete'}</span>
          </Button>
        </div>

      </main>

      {showCelebrate && (
        <CompletionScreen
          points={REWARD_POINTS}
          title="Lesson Complete!"
          subtitle="You have finished this lesson and boosted your provider score."
          onClose={handleCloseCelebration}
        />
      )}
    </div>
  );
}
