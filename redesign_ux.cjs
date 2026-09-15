const fs = require('fs');

// 1. EmotionalWellbeingAssessmentPage.jsx
const pageContent = `import React from 'react';
import { Header, CompletionScreen } from '../components';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { AssessmentWizard } from '../components/assessment/AssessmentWizard';
import { dass21Schema } from '../utils/dass21Schema';

const LESSON_ID = 'emotional-wellbeing-assessment';
const REWARD_POINTS = 100;

export default function EmotionalWellbeingAssessmentPage({ onBack }) {
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

  // Notice the 100dvh and overflow: hidden on the parent to completely prevent page scrolling.
  // The header stays fixed at the top, and the wizard fills the remaining space.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      <Header title={dass21Schema.title} onBack={onBack} progress={lessonProgress} points={REWARD_POINTS} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <AssessmentWizard 
          schema={dass21Schema} 
          onComplete={handleActionComplete} 
        />
      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/views/EmotionalWellbeingAssessmentPage.jsx', pageContent);


// 2. AssessmentWizard.jsx
const wizardContent = `import React, { useState } from 'react';
import { AssessmentQuestionCard } from './AssessmentQuestionCard';
import { AssessmentReport } from './AssessmentReport';
import { calculateScores } from '../../utils/assessmentEngine';

export function AssessmentWizard({ schema, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [report, setReport] = useState(null);

  const totalQuestions = schema.questions.length;
  const isReportStep = currentStep === totalQuestions;

  const handleSelect = (value) => {
    const currentQ = schema.questions[currentStep];
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === totalQuestions - 1) {
      const results = calculateScores(schema, answers);
      setReport(results);
      setCurrentStep(totalQuestions); 
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    window.open('https://web.mantracare.com/plans/therapy', '_blank');
    if (onComplete) {
      onComplete();
    }
  };

  if (isReportStep && report) {
    // Report allows normal scrolling
    return (
      <div style={{ overflowY: 'auto', flex: 1, padding: '24px 16px 40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', background: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <AssessmentReport report={report} onComplete={handleFinish} />
        </div>
      </div>
    );
  }

  const currentQ = schema.questions[currentStep];
  const progressPercentage = ((currentStep + 1) / totalQuestions) * 100;

  return (
    <AssessmentQuestionCard
      key={currentQ.id} // forces animation on step change
      question={currentQ}
      currentValue={answers[currentQ.id]}
      onSelect={handleSelect}
      onNext={handleNext}
      onPrev={handlePrev}
      isFirst={currentStep === 0}
      isLast={currentStep === totalQuestions - 1}
      progressPercentage={progressPercentage}
    />
  );
}
`;
fs.writeFileSync('src/components/assessment/AssessmentWizard.jsx', wizardContent);


// 3. AssessmentQuestionCard.jsx
const cardContent = `import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function AssessmentQuestionCard({ 
  question, 
  currentValue, 
  onSelect,
  onNext,
  onPrev,
  isFirst,
  isLast,
  progressPercentage
}) {
  return (
    <div className="animate-slide-up" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%',
      maxWidth: '800px', 
      margin: '0 auto',
      background: '#ffffff',
      position: 'relative'
    }}>
      
      {/* Top Header Section (Fixed) */}
      <div style={{ padding: '24px 16px 12px', flexShrink: 0 }}>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            background: '#3b82f6', 
            width: \`\${progressPercentage}%\`, 
            transition: 'width 0.3s ease-out' 
          }} />
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h2)', fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: '1.3' }}>
          {question.text}
        </h2>
      </div>

      {/* Options Scrollable Region */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {question.options.map((opt, idx) => (
          <label 
            key={idx}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 16px', 
              background: currentValue === opt.value ? '#eff6ff' : '#ffffff',
              border: currentValue === opt.value ? '2px solid #3b82f6' : '1px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: currentValue === opt.value ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <input 
              type="radio" 
              name={\`q-\${question.id}\`} 
              value={opt.value}
              checked={currentValue === opt.value}
              onChange={() => onSelect(opt.value)}
              style={{ display: 'none' }} 
            />
            
            <div style={{ 
              width: '20px', height: '20px', borderRadius: '50%', 
              border: currentValue === opt.value ? '6px solid #3b82f6' : '2px solid #cbd5e1',
              marginRight: '12px',
              transition: 'all 0.15s',
              flexShrink: 0
            }} />
            
            <span style={{ fontSize: '0.95rem', color: currentValue === opt.value ? '#1e40af' : '#475569', fontWeight: currentValue === opt.value ? 600 : 400, lineHeight: '1.4' }}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>

      {/* Bottom Action Bar (Fixed/Docked) */}
      <div style={{ 
        flexShrink: 0,
        padding: '16px', 
        display: 'flex', 
        justifyContent: 'space-between',
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc'
      }}>
        <button 
          onClick={onPrev} 
          disabled={isFirst}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '6px', 
            padding: '8px 16px', fontSize: '0.95rem', cursor: isFirst ? 'not-allowed' : 'pointer', 
            borderRadius: '8px', border: '1px solid #cbd5e1', 
            background: '#ffffff', color: isFirst ? '#94a3b8' : '#334155',
            opacity: isFirst ? 0 : 1 
          }}
        >
          <ArrowLeft size={16} />
          <span>Prev</span>
        </button>

        <button 
          onClick={onNext} 
          disabled={currentValue === undefined}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '6px', 
            padding: '8px 24px', fontSize: '0.95rem', fontWeight: 600,
            cursor: currentValue === undefined ? 'not-allowed' : 'pointer', 
            borderRadius: '8px', border: 'none', 
            background: currentValue === undefined ? '#cbd5e1' : '#3b82f6', 
            color: '#ffffff',
            transition: 'background 0.2s'
          }}
        >
          <span>{isLast ? 'Finish' : 'Next'}</span>
          {!isLast && <ArrowRight size={16} />}
        </button>
      </div>

    </div>
  );
}
`;
fs.writeFileSync('src/components/assessment/AssessmentQuestionCard.jsx', cardContent);

console.log("UX Redesign Layout Update Complete.");
