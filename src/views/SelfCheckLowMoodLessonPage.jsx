import React from 'react';
import { Header, CompletionScreen } from '../components';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { AssessmentWizard } from '../components/assessment/AssessmentWizard';
import { phq9Schema } from '../utils/phq9Schema';

const LESSON_ID = 'self-check-low-mood';
const REWARD_POINTS = 100;

export default function SelfCheckLowMoodLessonPage({ onBack }) {
  const {
    lessonProgress,
    showCelebrate,
    handleActionComplete,
    handleCloseCelebration
  } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasAction: true,
    hasQuiz: false
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      <Header title={phq9Schema.title} onBack={onBack} progress={lessonProgress} points={REWARD_POINTS} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <AssessmentWizard 
          schema={phq9Schema} 
          onComplete={handleActionComplete} 
        />
      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
