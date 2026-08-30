import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { AssessmentQuestionCard } from './AssessmentQuestionCard';
import { AssessmentReport } from './AssessmentReport';
import { calculateAssessmentResults } from '../../utils/assessmentEngine';

export function AssessmentWizard({ schema, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({}); // Record<string, AssessmentResponse>
  const [report, setReport] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const totalQuestions = schema.questions.length; // exactly 9
  const isReportStep = currentStep === totalQuestions;

  const handleSelectOption = (option) => {
    const currentQ = schema.questions[currentStep];
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        response: option.label,
        score: option.score,
        categoryId: currentQ.categoryId
      }
    }));
    if (validationError) setValidationError(null);
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === totalQuestions - 1) {
      handleViewResults();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      if (validationError) setValidationError(null);
    }
  };

  const handleViewResults = () => {
    // 1. Calculate and validate all 9 questions
    const calculatedReport = calculateAssessmentResults(responses, schema);

    if (!calculatedReport.isComplete) {
      // Find the first unanswered question and jump to it
      const firstUnansweredId = calculatedReport.unansweredQuestionIds[0];
      const unansweredIndex = schema.questions.findIndex((q) => q.id === firstUnansweredId);
      if (unansweredIndex !== -1) {
        setCurrentStep(unansweredIndex);
      }
      setValidationError('Please select a response for all 9 questions before viewing your results.');
      return;
    }

    setValidationError(null);
    setReport(calculatedReport);
    setCurrentStep(totalQuestions);
  };

  if (isReportStep && report) {
    return (
      <div style={{
        overflowY: 'auto',
        flex: 1,
        padding: '16px 16px 48px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <AssessmentReport report={report} responses={responses} schema={schema} onComplete={onComplete} />
      </div>
    );
  }

  const currentQ = schema.questions[currentStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>
      {/* Validation Warning */}
      {validationError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: '12px',
            left: '20px',
            right: '20px',
            maxWidth: '740px',
            margin: '0 auto',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 20,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)',
            color: '#991b1b',
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          <AlertCircle size={18} color="#ef4444" />
          <span>{validationError}</span>
        </motion.div>
      )}

      <AssessmentQuestionCard
        question={currentQ}
        selectedResponse={responses[currentQ.id]}
        onSelectOption={handleSelectOption}
        onNext={handleNext}
        onPrev={handlePrev}
        isFirst={currentStep === 0}
        isLast={currentStep === totalQuestions - 1}
        currentStepIndex={currentStep}
        totalQuestions={totalQuestions}
        isSubmitting={false}
      />
    </div>
  );
}
