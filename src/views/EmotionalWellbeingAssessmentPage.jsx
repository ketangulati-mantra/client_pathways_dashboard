import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { AssessmentWizard } from '../components/assessment/AssessmentWizard';
import { dass21Schema } from '../utils/dass21Schema';
import { handleExit } from '../mantra/navigation';

const LESSON_ID = 'emotional-wellbeing-assessment';

export default function EmotionalWellbeingAssessmentPage({ onBack }) {
  const {
    handleActionComplete
  } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasAction: true,
    hasQuiz: false
  });

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      handleExit();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at top, #f0f7ff 0%, #f8fafc 60%, #ffffff 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Compact Sticky Header */}
      <header style={{
        height: '52px',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(10px)',
        flexShrink: 0,
        zIndex: 10
      }}>
        {/* Back Button on Left */}
        <button
          type="button"
          onClick={handleBackClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          aria-label="Go back"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        {/* Section Label on Right */}
        <span style={{
          fontSize: '0.84rem',
          fontWeight: 600,
          color: '#64748b'
        }}>
          Assessment
        </span>
      </header>

      {/* Main Assessment Container (100% focused, distraction-free) */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <AssessmentWizard
          schema={dass21Schema}
          onComplete={handleActionComplete}
        />
      </main>
    </div>
  );
}
