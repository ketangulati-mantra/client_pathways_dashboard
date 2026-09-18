import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { AssessmentQuestionCard } from './AssessmentQuestionCard';
import { AssessmentReport } from './AssessmentReport';
import { calculateAssessmentResults } from '../../utils/assessmentEngine';

export function AssessmentWizard({ schema, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const responsesRef = useRef({});
  const [responses, setResponses] = useState({}); // Record<string, AssessmentResponse>
  const [report, setReport] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const totalQuestions = schema.questions.length; // exactly 9
  const isReportStep = currentStep === totalQuestions;

  const handleSelectOption = (option, questionOverride = null) => {
    const currentQ = questionOverride || schema.questions[currentStep];
    if (!currentQ) return;
    const newResponse = {
      questionId: currentQ.id,
      response: option.label,
      score: option.score,
      categoryId: currentQ.categoryId
    };
    responsesRef.current = {
      ...responsesRef.current,
      [currentQ.id]: newResponse
    };
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: newResponse
    }));
    if (validationError) setValidationError(null);
  };

  const handleNext = (optionFromStep = null, questionOverride = null) => {
    let updatedResponses = responsesRef.current;
    const currentQ = questionOverride || schema.questions[currentStep];
    if (optionFromStep && currentQ) {
      const newResp = {
        questionId: currentQ.id,
        response: optionFromStep.label,
        score: optionFromStep.score,
        categoryId: currentQ.categoryId
      };
      updatedResponses = {
        ...updatedResponses,
        [currentQ.id]: newResp
      };
      responsesRef.current = updatedResponses;
      setResponses(updatedResponses);
    }

    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === totalQuestions - 1) {
      handleViewResults(updatedResponses);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      if (validationError) setValidationError(null);
    }
  };

  const handleViewResults = (latestResponses = responsesRef.current) => {
    // 1. Calculate and validate all 9 questions using the freshest responsesRef
    const calculatedReport = calculateAssessmentResults(latestResponses, schema);

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

  if (isReportStep) {
    const activeReport = report || calculateAssessmentResults(responsesRef.current, schema);
    return (
      <div style={{
        overflowY: 'auto',
        flex: 1,
        padding: '16px 16px 48px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <AssessmentReport report={activeReport} responses={responsesRef.current} schema={schema} onComplete={onComplete} />
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
        selectedResponse={responsesRef.current[currentQ.id] || responses[currentQ.id]}
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
