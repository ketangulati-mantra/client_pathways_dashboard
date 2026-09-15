import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  StepTimeline,
  InfoCallout,
  Button,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  ShieldCheck, Globe, CreditCard, TrendingUp, CheckCircle2, FileText, 
  FileSearch, Activity, FileCheck, Send, AlertTriangle, Shield
} from 'lucide-react';

const LESSON_ID = 'insurance';
const LESSON_TITLE = 'Insurance for Therapy (US, UK & Canada)';
const REWARD_POINTS = 10;

const TIMELINE = [
  { 
    icon: FileSearch, 
    title: 'Collect Insurance Details', 
    description: 'Request Insurance Provider, Plan Type, Deductible, and Copay.' 
  },
  { 
    icon: ShieldCheck, 
    title: 'Verify Coverage', 
    description: 'Determine whether you are In Network (directly contracted) or Out of Network (client pays and seeks reimbursement).' 
  },
  { 
    icon: FileCheck, 
    title: 'Document Sessions', 
    description: 'Maintain proper documentation: Session Notes, Diagnosis Codes (if applicable), and Treatment Plan.' 
  },
  { 
    icon: Send, 
    title: 'Submit or Guide Claims', 
    description: 'If In Network: Submit claims directly. If Out of Network: Guide the client on seeking reimbursement.' 
  }
];

const TERMS = [
  { icon: CreditCard, title: 'Copay', description: 'Amount paid by the client each session.' },
  { icon: TrendingUp, title: 'Deductible', description: 'Amount paid before insurance begins covering costs.' },
  { icon: CheckCircle2, title: 'In Network', description: 'Provider approved by the insurance company.' },
  { icon: FileText, title: 'Claim', description: 'Request sent to insurance for reimbursement.' }
];

const INSURANCE_CONCEPTS = [
  { icon: Shield, title: 'Insurance Coverage', description: 'Clients may have different providers, plans, deductibles, copays, and coverage limits.' },
  { icon: CreditCard, title: 'Payment & Reimbursement', description: 'Some sessions are billed directly to insurance, while others require clients to pay first and seek reimbursement.' },
  { icon: FileText, title: 'Documentation', description: 'Good clinical documentation may be required depending on the insurer or reimbursement process.' },
  { icon: Globe, title: 'Country & Provider Differences', description: 'Insurance processes vary across countries, states/provinces, employers, and insurance companies. Always follow local regulations and your organization\'s policies.' }
];

export default function InsuranceLessonPage({ onBack }) {


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
            display: 'inline-block', padding: '6px 12px', background: '#ccfbf1', 
            color: '#0f766e', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
            marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <Globe size={14} /> International Practice
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Understand how insurance works so you can confidently guide clients through reimbursement and claims.
          </p>
          
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#e0f2fe', color: '#0369a1', padding: '10px 16px',
            borderRadius: '12px', fontSize: '0.95rem', fontWeight: 500, marginTop: '24px'
          }}>
            <Globe size={18} /> Available only for providers serving clients in the US, UK and Canada.
          </div>
        </header>

        {/* How The Process Works */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            How The Process Works
          </h2>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <StepTimeline steps={TIMELINE} />
          </div>
        </section>

        {/* Common Insurance Terms */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Common Insurance Terms
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {TERMS.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px',
                background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        {/* Understanding the Insurance Process */}
        <section>
          <header style={{ marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>
              Understanding the Insurance Process
            </h2>
            <p style={{ margin: 0, fontSize: '1rem', color: '#475569', lineHeight: '1.6' }}>
              Every insurer and healthcare system works differently. These are the common concepts providers should be familiar with when working with insured clients.
            </p>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {INSURANCE_CONCEPTS.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px',
                background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f8fafc', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <InfoCallout 
            type="info" 
            title="Note" 
            text="This lesson provides a general overview of insurance concepts and should not be considered legal, billing, or compliance guidance. Providers should always follow local regulations, insurer requirements, and Mantra's operational policies."
          />
        </section>

        {/* Action Button */}
        <section style={{ textAlign: 'center', paddingTop: '20px' }}>
          <Button variant="primary" onClick={handleActionComplete} style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
            Mark Lesson as Complete
          </Button>
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Activity Complete!" subtitle="You're now ready to navigate insurance for your clients." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
