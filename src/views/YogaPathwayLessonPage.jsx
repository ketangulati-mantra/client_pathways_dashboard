import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  Button,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { CheckCircle2, Clock, Award, MessageCircle, User, FileText, Smartphone, PlusCircle } from 'lucide-react';

const LESSON_ID     = 'yoga-pathway';
const LESSON_TITLE  = 'Creating a Yoga Pathway for Your Client';
const REWARD_POINTS = 5;

const STEPS = [
  {
    icon: MessageCircle,
    title: 'Go to Chats',
    description: 'Open your client conversations inside the MantraCare Provider Portal.'
  },
  {
    icon: User,
    title: 'Select a Client',
    description: 'Choose the client for whom you want to create a yoga program.'
  },
  {
    icon: FileText,
    title: 'Open Client Profile',
    description: 'Click the client\'s profile to access available care pathways.'
  },
  {
    icon: PlusCircle,
    title: 'Create or Assign a Yoga Pathway',
    description: (
      <>
        Choose an existing yoga pathway or create a new one based on the client's needs, such as:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Flexibility</li>
          <li>Stress Relief</li>
          <li>Weight Management</li>
          <li>Back Pain</li>
          <li>Prenatal Yoga</li>
          <li>Strength & Balance</li>
          <li>Breathing Exercises</li>
        </ul>
      </>
    )
  },
  {
    icon: Smartphone,
    title: 'Client Starts Following the Program',
    description: 'Once assigned, the client receives the pathway in the MantraCare app and can begin following the guided yoga sessions, track progress, and complete activities.'
  }
];

export default function YogaPathwayLessonPage({ onBack }) {

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
            Build personalized yoga programs for your clients directly from the MantraCare Provider Portal. Assign structured yoga pathways based on each client's goals so they can follow guided sessions inside the app.
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
              You now know how to assign personalized yoga pathways to help your clients meet their goals.
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
