import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OcdAssessmentQuestionCard } from './OcdAssessmentQuestionCard';
import { OcdAssessmentReport } from './OcdAssessmentReport';
import { calculateAssessmentResults } from '../../utils/assessmentEngine';

const OCDMANTRA_LOGO_URL = 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png';

export function OcdAssessmentWizard({ schema, onComplete }) {
  const { t } = useTranslation('ocd_assessment');
  // 0: Intro screen, 1..totalQuestions: Questions, totalQuestions + 1: Report
  const [currentStep, setCurrentStep] = useState(0);
  const responsesRef = React.useRef({});
  const [responses, setResponses] = useState({});
  const [report, setReport] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const totalQuestions = schema.questions.length; // 8
  const isIntroStep = currentStep === 0;
  const isReportStep = currentStep === totalQuestions + 1;
  const activeQuestionIndex = currentStep - 1; // 0 to 7

  const handleSelectOption = (option, questionOverride = null) => {
    const currentQ = questionOverride || schema.questions[activeQuestionIndex];
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

  const handleNext = (optionFromStep = null) => {
    if (isIntroStep) {
      setCurrentStep(1);
    } else {
      let updatedResponses = responsesRef.current;
      if (optionFromStep && activeQuestionIndex >= 0 && activeQuestionIndex < totalQuestions) {
        const currentQ = schema.questions[activeQuestionIndex];
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

      if (activeQuestionIndex < totalQuestions - 1) {
        setCurrentStep((prev) => prev + 1);
      } else if (activeQuestionIndex === totalQuestions - 1) {
        handleViewResults(updatedResponses);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      if (validationError) setValidationError(null);
    } else if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  const handleViewResults = (latestResponses = responsesRef.current) => {
    const calculatedReport = calculateAssessmentResults(latestResponses, schema);

    if (!calculatedReport.isComplete) {
      const firstUnansweredId = calculatedReport.unansweredQuestionIds[0];
      const unansweredIndex = schema.questions.findIndex((q) => q.id === firstUnansweredId);
      if (unansweredIndex !== -1) {
        setCurrentStep(unansweredIndex + 1);
      }
      setValidationError(t('wizard.validation_error', { defaultValue: 'Please answer all questions before viewing your summary.' }));
      return;
    }

    setValidationError(null);
    setReport(calculatedReport);
    setCurrentStep(totalQuestions + 1);
  };

  // 1. Report Screen
  if (isReportStep) {
    const activeReport = report || calculateAssessmentResults(responsesRef.current, schema);
    return (
      <div style={{
        overflowY: 'auto',
        flex: 1,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <OcdAssessmentReport report={activeReport} responses={responses} schema={schema} onComplete={onComplete} />
      </div>
    );
  }

  // Safety fallback if step is beyond question range
  if (activeQuestionIndex >= totalQuestions) {
    const activeReport = report || calculateAssessmentResults(responsesRef.current, schema);
    return (
      <div style={{
        overflowY: 'auto',
        flex: 1,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <OcdAssessmentReport report={activeReport} responses={responses} schema={schema} onComplete={onComplete} />
      </div>
    );
  }

  // 2. Intro Screen (Screen 1) - Ultra-Clean, Fast 3-Second Communication
  if (isIntroStep) {
    return (
      <div
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto',
          padding: 'clamp(20px, 4vh, 36px) 24px',
          boxSizing: 'border-box'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            maxWidth: '520px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            margin: 'auto 0',
            boxSizing: 'border-box'
          }}
        >
          {/* Logo Asset */}
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={OCDMANTRA_LOGO_URL}
              alt="OCDMantra"
              style={{
                height: '56px',
                width: 'auto',
                maxWidth: '200px',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          {/* Assessment Label */}
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0284c7',
              marginBottom: '10px'
            }}
          >
            {t('intro.label', { defaultValue: 'OCD CHECK-IN' })}
          </span>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.35rem)',
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
              color: '#0f172a',
              margin: '0 0 12px'
            }}
          >
            {t('intro.headline', { defaultValue: 'Understand your OCD patterns' })}
          </h1>

          {/* Clean One/Two-Line Description */}
          <p
            style={{
              fontSize: 'clamp(0.94rem, 1.8vw, 1.02rem)',
              color: '#475569',
              lineHeight: 1.5,
              margin: '0 0 16px',
              fontWeight: 450,
              maxWidth: '440px'
            }}
          >
            {t('intro.supporting', {
              defaultValue: "A quick check-in to help you notice what's been showing up lately."
            })}
          </p>

          {/* Compact Metadata Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              color: '#64748b',
              fontWeight: 500,
              marginBottom: '22px',
              flexWrap: 'wrap'
            }}
          >
            <span>{t('intro.meta_time', { defaultValue: '2–3 min' })}</span>
            <span style={{ color: '#cbd5e1' }}>·</span>
            <span>{t('intro.meta_private', { defaultValue: 'Private' })}</span>
            <span style={{ color: '#cbd5e1' }}>·</span>
            <span>{t('intro.meta_rules', { defaultValue: 'No right/wrong answers' })}</span>
          </div>

          {/* Primary CTA Button */}
          <button
            type="button"
            onClick={handleNext}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              maxWidth: '320px',
              height: '50px',
              padding: '0 24px',
              borderRadius: '14px',
              border: 'none',
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '0.96rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(2, 132, 199, 0.25)',
              transition: 'all 0.15s ease'
            }}
            className="ocd-intro-cta-btn"
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#0369a1';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#0284c7';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>{t('intro.btn_start', { defaultValue: 'Start Check-In' })}</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>

        <style>{`
          @media (max-width: 600px) {
            .ocd-intro-cta-btn {
              width: calc(100% - 32px) !important;
              max-width: 100% !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // 3. Question Cards Flow
  const currentQ = schema.questions[activeQuestionIndex];
  if (!currentQ) {
    return null;
  }

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
            maxWidth: '700px',
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

      <OcdAssessmentQuestionCard
        question={currentQ}
        selectedResponse={responses[currentQ.id]}
        onSelectOption={handleSelectOption}
        onNext={handleNext}
        onPrev={handlePrev}
        isFirst={activeQuestionIndex === 0}
        isLast={activeQuestionIndex === totalQuestions - 1}
        currentStepIndex={activeQuestionIndex}
        totalQuestions={totalQuestions}
        isSubmitting={false}
      />
    </div>
  );
}
