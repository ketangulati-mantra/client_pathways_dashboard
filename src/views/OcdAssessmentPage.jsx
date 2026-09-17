import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { OcdAssessmentWizard } from '../components/assessment/OcdAssessmentWizard';
import { ocdAssessmentSchema } from '../utils/ocdAssessmentSchema';
import { handleExit } from '../mantra/navigation';

const LESSON_ID = 'ocd-assessment';

export default function OcdAssessmentPage({ onBack }) {
  const { t } = useTranslation('ocd_assessment');
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
      background: 'radial-gradient(ellipse at top, #f0f9ff 0%, #f8fafc 55%, #ffffff 100%)',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Compact Sticky Header */}
      <header style={{
        height: '52px',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'sticky',
        top: 0,
        borderBottom: '1px solid rgba(224, 242, 254, 0.8)',
        background: 'rgba(255, 255, 255, 0.92)',
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
          <span>{t('header_back', { defaultValue: 'Back' })}</span>
        </button>
      </header>

      {/* Main Assessment Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <OcdAssessmentWizard
          schema={ocdAssessmentSchema}
          onComplete={handleActionComplete}
        />
      </main>
    </div>
  );
}
