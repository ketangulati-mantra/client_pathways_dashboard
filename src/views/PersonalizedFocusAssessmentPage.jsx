import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { PersonalizedFocusWizard } from '../components/assessment/PersonalizedFocusWizard';
import { handleExit } from '../mantra/navigation';

const LESSON_ID = 'personalized-focus-assessment';

export default function PersonalizedFocusAssessmentPage({ onBack }) {
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        width: '100%',
        background: 'radial-gradient(ellipse at top, #f0f7ff 0%, #f8fafc 60%, #ffffff 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* Top Header */}
      <header
        style={{
          height: '56px',
          padding: '0 clamp(16px, 4vw, 32px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          flexShrink: 0,
          zIndex: 20
        }}
      >
        <button
          type="button"
          onClick={handleBackClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.84rem',
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

        <span
          style={{
            fontSize: '0.86rem',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.01em'
          }}
        >
          Personalized Focus
        </span>
      </header>

      {/* Main Focus Wizard Container */}
      <main
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          boxSizing: 'border-box'
        }}
      >
        <PersonalizedFocusWizard onComplete={handleActionComplete} />
      </main>
    </div>
  );
}
