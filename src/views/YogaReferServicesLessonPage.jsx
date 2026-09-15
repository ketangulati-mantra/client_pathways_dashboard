import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  Button,
  useToast
} from '../components';
import { CheckCircle2, Clock, Award, Activity, Search, Send, DollarSign, Star } from 'lucide-react';

const LESSON_ID     = 'yoga-refer-services';
const LESSON_TITLE  = 'Refer Other Services like Fit, Diet, Physio etc.';
const REWARD_POINTS = 5;

const STEPS = [
  {
    icon: Search,
    title: 'Identify Client Needs',
    description: (
      <>
        Listen carefully for goals or challenges that may benefit from additional professional support.
        <br/><br/>
        Common examples include:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Weight management</li>
          <li>Chronic pain</li>
          <li>Injury recovery</li>
          <li>Women's health concerns</li>
          <li>Nutrition guidance</li>
          <li>Fitness improvement</li>
        </ul>
      </>
    )
  },
  {
    icon: Activity,
    title: 'Recommend the Right Service',
    description: (
      <>
        Suggest the most suitable MantraCare service based on the client's needs.
        <br/><br/>
        Examples include:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li><strong>Fitness</strong> - Strength training, endurance, weight loss, or overall fitness improvement.</li>
          <li><strong>Dietitian / Nutrition</strong> - Meal planning, weight management, lifestyle diseases, and healthy eating.</li>
          <li><strong>Physiotherapy</strong> - Injury rehabilitation, posture correction, chronic pain, and mobility improvement.</li>
          <li><strong>Women's Wellness</strong> - Prenatal and postnatal care, hormonal wellness, and women's health support.</li>
        </ul>
        <br/>
        Always explain how these services complement their yoga practice.
      </>
    )
  },
  {
    icon: Send,
    title: 'Submit the Referral',
    description: (
      <>
        Guide the client to the appropriate MantraCare service or submit the referral using your provider workflow.
        <br/><br/>
        Ensure the referral includes:
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Client name</li>
          <li>Recommended service</li>
          <li>Reason for referral</li>
          <li>Relevant notes (if applicable)</li>
        </ul>
      </>
    )
  },
  {
    icon: DollarSign,
    title: 'Earn Referral Commission',
    description: (
      <>
        When an eligible referral converts successfully, you receive referral commission according to the MantraCare referral program.
        <br/><br/>
        Accurate recommendations and quality referrals help both your clients and your provider growth.
      </>
    )
  },
  {
    icon: Star,
    title: 'Best Practice',
    description: (
      <>
        Recommend additional services only when they genuinely benefit the client.
        <br/><br/>
        Personalized, need-based referrals build trust and improve long-term client outcomes while strengthening interdisciplinary care.
      </>
    )
  }
];

export default function YogaReferServicesLessonPage({ onBack }) {

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
            CROSS-REFERRALS
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
            Help your clients achieve better health outcomes by referring them to complementary MantraCare services whenever appropriate. Cross-referrals improve client care while allowing you to earn referral commissions.
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
              You now know how to effectively refer clients to complementary services.
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
