import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  Button,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { CheckCircle2, Clock, Award, MessageCircle, ClipboardCheck, DollarSign, Link, Sparkles } from 'lucide-react';

const LESSON_ID     = 'canned-responses';
const LESSON_TITLE  = 'Mantra Auto-Responses (Canned Responses)';
const REWARD_POINTS = 5;

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: 'Assessments',
    description: (
      <>
        Quickly send mental health assessments including:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Anxiety</li>
          <li>Depression</li>
          <li>Anger</li>
          <li>Relationship assessments</li>
        </ul>
        <p style={{ margin: '8px 0 0' }}>Client results automatically appear in the <strong>Insights</strong> section.</p>
      </>
    )
  },
  {
    icon: DollarSign,
    title: 'Paid Assessments',
    description: (
      <>
        Providers can refer clients for clinical assessments:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Clinical Psychologists earn <strong>50%</strong> of the assessment fee.</li>
          <li>Non-clinical providers earn <strong>10%</strong> referral commission.</li>
        </ul>
      </>
    )
  },
  {
    icon: Link,
    title: 'Other Resources',
    description: (
      <>
        You can instantly share:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Therapy exercises and worksheets</li>
          <li>Referrals to specialists and wellness services</li>
          <li>Payment links & Renewal links</li>
          <li>Subscription information</li>
          <li>Helpful client resources</li>
        </ul>
      </>
    )
  },
  {
    icon: Sparkles,
    title: 'Benefits',
    description: (
      <>
        Using canned responses helps you:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Save time replying to common questions</li>
          <li>Deliver consistent information</li>
          <li>Share resources in one click</li>
          <li>Improve the client communication experience</li>
        </ul>
      </>
    )
  }
];

export default function CannedResponsesLessonPage({ onBack }) {


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
            CHAT TOOLS
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
            Learn how to use Mantra's built-in canned responses to quickly send helpful resources, assessments, referrals, exercises, and payment links to clients.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="overview-meta-badge"><Clock size={11} /><span>2 min read</span></span>
            <span className="overview-meta-badge points"><Award size={11} /><span>+{REWARD_POINTS} Points</span></span>
          </div>
        </div>

        {/* ── Access Auto-Responses Card ──────────────────────────── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #eef0f3',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '8px',
              background: '#f0f9ff', color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <MessageCircle size={16} />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1.05rem',
              color: 'var(--text-main)',
              margin: 0
            }}>
              How to Access Auto-Responses
            </h2>
          </div>
          <ol style={{
            margin: '0',
            paddingLeft: '28px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.8'
          }}>
            <li>Open the <strong>Chats</strong> section.</li>
            <li>Select the client conversation.</li>
            <li>Click the <strong>Canned Response</strong> button in the bottom-right corner.</li>
            <li>Choose the response you want to send.</li>
          </ol>
        </div>

        {/* ── Options and Benefits (4 Cards) ───────────────────── */}
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
              You now know how to quickly send automated resources and assessments to clients.
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
