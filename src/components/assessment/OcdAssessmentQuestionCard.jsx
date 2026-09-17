import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function OcdAssessmentQuestionCard({
  question,
  selectedResponse,
  onSelectOption,
  onNext,
  onPrev,
  isFirst,
  isLast,
  currentStepIndex = 0,
  totalQuestions = 8,
  isSubmitting = false
}) {
  const { t } = useTranslation('ocd_assessment');
  const [selectedScore, setSelectedScore] = useState(selectedResponse?.score);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    setSelectedScore(selectedResponse?.score);
    setIsAdvancing(false);
  }, [question.id, selectedResponse]);

  const handleOptionClick = (option) => {
    if (isAdvancing || isSubmitting) return;

    setSelectedScore(option.score);
    onSelectOption(option);

    if (!isLast) {
      setIsAdvancing(true);
      setTimeout(() => {
        onNext(option);
      }, 320);
    }
  };

  const stepNumber = currentStepIndex + 1;
  const progressPercentage = Math.min(100, Math.max(0, (stepNumber / totalQuestions) * 100));

  const getOptionLabel = (score, fallback) => {
    switch (score) {
      case 0:
        return t('options.not_at_all', { defaultValue: 'Not at all' });
      case 1:
        return t('options.a_little', { defaultValue: 'A little' });
      case 2:
        return t('options.moderately', { defaultValue: 'Moderately' });
      case 3:
        return t('options.a_lot', { defaultValue: 'A lot' });
      case 4:
        return t('options.extremely', { defaultValue: 'Extremely' });
      default:
        return fallback;
    }
  };

  const translatedQuestionText = t(`questions.${question.id}`, { defaultValue: question.text });

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '680px',
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 18px 24px',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
    >
      {/* Top Section: Progress Counter & Ultra-Sleek Blue Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '0.76rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#0284c7'
          }}>
            {t('question_counter', { current: stepNumber, total: totalQuestions, defaultValue: `${stepNumber} OF ${totalQuestions}` })}
          </span>
          <span style={{
            fontSize: '0.84rem',
            fontWeight: 800,
            color: '#0369a1',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {stepNumber} <span style={{ color: '#cbd5e1', fontWeight: 600 }}>/</span> {totalQuestions}
          </span>
        </div>

        {/* Thin Animated Blue Progress Bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: '#f1f5f9',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)',
              borderRadius: '9999px',
              width: `${progressPercentage}%`,
              transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>
      </div>

      {/* Middle Section: Focal Question & 5 Large Selectable Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            margin: '20px 0 auto',
            paddingBottom: '16px'
          }}
        >
          {/* Question Text & Instruction */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{
              fontSize: '0.84rem',
              color: '#64748b',
              fontWeight: 500
            }}>
              {t('instruction', { defaultValue: 'Reflect on how this has felt over the past few weeks:' })}
            </span>
            <h2 style={{
              fontSize: 'clamp(1.28rem, 4.4vw, 1.65rem)',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              {translatedQuestionText}
            </h2>
          </div>

          {/* 5 Large Selectable Option Rows in White/Blue */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '100%'
          }}>
            {question.options.map((opt) => {
              const isSelected = selectedScore === opt.score;
              const label = getOptionLabel(opt.score, opt.label);
              return (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => handleOptionClick(opt)}
                  disabled={isAdvancing || isSubmitting}
                  style={{
                    width: '100%',
                    minHeight: '54px',
                    padding: '12px 18px',
                    borderRadius: '16px',
                    border: isSelected ? '2px solid #0284c7' : '1.5px solid #e2e8f0',
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: (isAdvancing || isSubmitting) ? 'default' : 'pointer',
                    boxShadow: isSelected
                      ? '0 4px 14px rgba(2, 132, 199, 0.1)'
                      : '0 1px 3px rgba(15, 23, 42, 0.02)',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    outline: 'none'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOptionClick(opt);
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Circular Check Indicator */}
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
                      background: isSelected ? '#0284c7' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}>
                      {isSelected && <Check size={13} color="#ffffff" strokeWidth={3} />}
                    </div>

                    <span style={{
                      fontSize: '0.96rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#0369a1' : '#1e293b',
                      lineHeight: 1.4
                    }}>
                      {label}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.78rem',
                    color: isSelected ? '#0284c7' : '#94a3b8',
                    fontWeight: 700
                  }}>
                    {isSelected ? t('options.selected', { defaultValue: 'Selected' }) : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        flexShrink: 0,
        paddingTop: '16px',
        paddingBottom: '8px'
      }}>
        <div>
          {!isFirst && (
            <button
              type="button"
              onClick={onPrev}
              disabled={isAdvancing || isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: (isAdvancing || isSubmitting) ? 'default' : 'pointer',
                padding: '8px 10px',
                borderRadius: '8px',
                transition: 'color 0.15s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              <ArrowLeft size={16} />
              <span>{t('btn_prev', { defaultValue: 'Previous question' })}</span>
            </button>
          )}
        </div>

        {isLast && selectedScore !== undefined && (
          <button
            type="button"
            onClick={() => {
              const matchedOpt = question.options.find((o) => o.score === selectedScore);
              onNext(matchedOpt);
            }}
            disabled={isSubmitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              minHeight: '46px',
              borderRadius: '9999px',
              border: 'none',
              background: isSubmitting ? '#93c5fd' : '#0284c7',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.28)',
              transition: 'all 0.18s ease',
              marginLeft: 'auto'
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = '#0369a1';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = '#0284c7';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <span>{isSubmitting ? t('btn_submitting', { defaultValue: 'Submitting...' }) : t('btn_view_results', { defaultValue: 'View My Summary' })}</span>
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
