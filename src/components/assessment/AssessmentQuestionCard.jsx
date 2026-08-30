import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export function AssessmentQuestionCard({
  question,
  selectedResponse, // structured AssessmentResponse | undefined
  onSelectOption, // (option: AssessmentOption) => void
  onNext,
  onPrev,
  isFirst,
  isLast,
  currentStepIndex = 0,
  totalQuestions = 9,
  isSubmitting = false
}) {
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
        onNext();
      }, 320);
    }
  };

  const stepNumber = currentStepIndex + 1;
  const progressPercentage = Math.min(100, Math.max(0, (stepNumber / totalQuestions) * 100));

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
      {/* Top Section: Progress Counter & Ultra-Sleek Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#64748b'
          }}>
            Question {stepNumber} of {totalQuestions}
          </span>
          <span style={{
            fontSize: '0.86rem',
            fontWeight: 800,
            color: '#2563eb',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {stepNumber} <span style={{ color: '#cbd5e1', fontWeight: 600 }}>/</span> {totalQuestions}
          </span>
        </div>

        {/* Thin Animated Progress Bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: '#e2e8f0',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              height: '100%',
              background: '#2563eb',
              borderRadius: '999px',
              width: `${progressPercentage}%`,
              transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>
      </div>

      {/* Middle Section: Focal Question & 4 Large Selectable Cards */}
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
              fontSize: '0.86rem',
              color: '#64748b',
              fontWeight: 500
            }}>
              How much has this applied to you over the past week?
            </span>
            <h2 style={{
              fontSize: 'clamp(1.35rem, 5vw, 1.85rem)',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              {question.text}
            </h2>
          </div>

          {/* 4 Large Selectable Option Rows */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%'
          }}>
            {question.options.map((opt) => {
              const isSelected = selectedScore === opt.score;
              return (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => handleOptionClick(opt)}
                  disabled={isAdvancing || isSubmitting}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '14px 18px',
                    borderRadius: '16px',
                    border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: (isAdvancing || isSubmitting) ? 'default' : 'pointer',
                    boxShadow: isSelected
                      ? '0 4px 14px rgba(37, 99, 235, 0.08)'
                      : '0 1px 3px rgba(15, 23, 42, 0.03)',
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
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                      background: isSelected ? '#2563eb' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}>
                      {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </div>

                    <span style={{
                      fontSize: '1.02rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#1e40af' : '#1e293b',
                      lineHeight: 1.4
                    }}>
                      {opt.label}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.82rem',
                    color: isSelected ? '#2563eb' : '#94a3b8',
                    fontWeight: 700
                  }}>
                    {isSelected ? 'Selected' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Action Bar: Subtle Back Control & Final Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        paddingTop: '12px'
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
                fontSize: '0.88rem',
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
              <span>Previous question</span>
            </button>
          )}
        </div>

        {isLast && selectedScore !== undefined && (
          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '9999px',
              border: 'none',
              background: isSubmitting ? '#93c5fd' : '#2563eb',
              color: '#ffffff',
              fontSize: '0.94rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.18s ease'
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <span>{isSubmitting ? 'Submitting...' : 'View My Results'}</span>
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
