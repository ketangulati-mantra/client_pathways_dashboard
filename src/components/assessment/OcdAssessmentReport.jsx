import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { submitAssessmentResults } from '../../mantra/api';
import { buildAssessmentWebhookPayload } from '../../utils/assessmentEngine';
import { analyzeOcdAssessmentResponses } from '../../utils/ocdAssessmentAnalytics';
import { goToDashboard } from '../../mantra/navigation';

const OCDMANTRA_LOGO_URL =
  'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png';

export function OcdAssessmentReport({ report, onComplete }) {
  const { t } = useTranslation('ocd_assessment');
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completeError, setCompleteError] = useState(null);

  const analytics = analyzeOcdAssessmentResponses(report);

  // Animated Score Counter (0 -> actualScore)
  const [displayedScore, setDisplayedScore] = useState(0);
  const targetScore = typeof analytics.totalScore === 'number' ? analytics.totalScore : 0;
  const maxScore = analytics.maxPossibleScore || 32;
  const meterPercent = analytics.meterPosition; // 0 to 100

  useEffect(() => {
    let startTimestamp = null;
    const duration = 800; // ms

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(easedProgress * targetScore));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayedScore(targetScore);
      }
    };

    const reqId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(reqId);
  }, [targetScore]);

  const handleMarkAsDone = async () => {
    if (isCompleted || isCompleting) return;

    setIsCompleting(true);
    setCompleteError(null);

    const payload = buildAssessmentWebhookPayload(report.results, {
      activityId: 'ocd-assessment'
    });

    try {
      const res = await submitAssessmentResults(payload);

      if (!res.success) {
        setCompleteError(
          res.error ||
            t('report.error_save', {
              defaultValue: "We couldn't save your activity completion right now. Your check-in summary is safe."
            })
        );
        setIsCompleting(false);
        return;
      }

      setIsCompleted(true);
      if (onComplete) {
        onComplete();
      }
      setTimeout(() => {
        goToDashboard();
      }, 700);
    } catch (err) {
      setCompleteError(
        t('report.error_save', {
          defaultValue: "We couldn't save your activity completion right now. Your check-in summary is safe."
        })
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const patterns = analytics.topPatterns || [];
  const isLowScore = targetScore <= 4 || analytics.isLowSignal;

  return (
    <div
      style={{
        maxWidth: '820px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: 'clamp(16px, 3vh, 32px) 20px 56px',
        boxSizing: 'border-box',
        color: '#0f172a',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* 1. BRANDING & HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <img
          src={OCDMANTRA_LOGO_URL}
          alt="OCDMantra"
          style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
        />
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#0284c7'
          }}
        >
          {t('report.eyebrow', { defaultValue: 'YOUR OCD CHECK-IN' })}
        </span>
      </div>

      {/* 2. RESULT TITLE & SHORT DYNAMIC SUMMARY */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 3.8vw, 2.3rem)',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.03em',
            margin: 0,
            lineHeight: 1.15
          }}
        >
          {t('report.hero_title', { defaultValue: 'Your assessment result' })}
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.96rem, 2vw, 1.05rem)',
            color: '#334155',
            lineHeight: 1.5,
            margin: '2px 0 0',
            fontWeight: 500,
            maxWidth: '680px'
          }}
        >
          {analytics.headlineSummary}
        </p>
      </div>

      {/* 3. HERO VISUAL METER & SCORE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%)',
          borderRadius: '24px',
          border: '1px solid #e0f2fe',
          padding: 'clamp(24px, 4vw, 36px) clamp(18px, 3.5vw, 32px)',
          boxShadow: '0 4px 20px rgba(2, 132, 199, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '20px'
        }}
      >
        {/* Score Eyebrow */}
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#0284c7'
          }}
        >
          {t('report.score_label', { defaultValue: 'YOUR SCORE' })}
        </span>

        {/* Large Prominent Score Display */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span
            style={{
              fontSize: 'clamp(2.8rem, 7vw, 3.8rem)',
              fontWeight: 800,
              color: '#0369a1',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {displayedScore}
          </span>
          <span
            style={{
              fontSize: 'clamp(1.15rem, 3vw, 1.45rem)',
              fontWeight: 700,
              color: '#94a3b8'
            }}
          >
            / {maxScore}
          </span>
        </div>

        {/* Horizontal Meter Container */}
        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '4px'
          }}
        >
          {/* Track Bar with Animated Indicator Marker */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '10px',
              background: '#e2e8f0',
              borderRadius: '9999px',
              overflow: 'visible'
            }}
          >
            {/* Subtle Gradient Fill up to indicator */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${meterPercent}%`,
                background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)',
                borderRadius: '9999px',
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />

            {/* Circular Indicator Marker */}
            <div
              style={{
                position: 'absolute',
                left: `${meterPercent}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '3.5px solid #0284c7',
                boxShadow: '0 2px 10px rgba(2, 132, 199, 0.4)',
                transition: 'left 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 2
              }}
            />
          </div>

          {/* Meter Segment Labels Below */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.74rem',
              fontWeight: 750,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#64748b'
            }}
          >
            <span style={{ color: meterPercent <= 33 ? '#0284c7' : '#64748b' }}>
              {t('report.meter_low', { defaultValue: 'LOWER' })}
            </span>
            <span style={{ color: meterPercent > 33 && meterPercent <= 66 ? '#0284c7' : '#64748b' }}>
              {t('report.meter_moderate', { defaultValue: 'MODERATE' })}
            </span>
            <span style={{ color: meterPercent > 66 ? '#0284c7' : '#64748b' }}>
              {t('report.meter_high', { defaultValue: 'HIGHER' })}
            </span>
          </div>
        </div>

        {/* Neutral Score Interpretation Box */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '12px 18px',
            maxWidth: '480px',
            width: '100%',
            boxSizing: 'border-box',
            marginTop: '4px'
          }}
        >
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#0284c7',
              display: 'block',
              marginBottom: '2px'
            }}
          >
            {t(analytics.interpretation.titleKey, {
              defaultValue: analytics.interpretation.titleFallback
            })}
          </span>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#334155',
              fontWeight: 500,
              lineHeight: 1.45
            }}
          >
            {t(analytics.interpretation.descriptionKey, {
              defaultValue: analytics.interpretation.descriptionFallback
            })}
          </p>
        </div>

        {/* Small Muted Disclaimer Line */}
        <span
          style={{
            fontSize: '0.76rem',
            color: '#94a3b8',
            fontWeight: 500
          }}
        >
          {t('report.score_explanation', {
            defaultValue: 'Your score reflects your responses in this check-in. It is not a diagnosis.'
          })}
        </span>
      </motion.div>

      {/* 4. WHAT STOOD OUT SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#0284c7'
          }}
        >
          {t('report.what_stood_out_title', { defaultValue: 'WHAT STOOD OUT' })}
        </span>

        {patterns && patterns.length > 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {patterns.map((item, idx) => {
              const itemNumber = `0${idx + 1}`;
              const isLast = idx === patterns.length - 1;

              return (
                <div
                  key={item.id}
                  style={{
                    paddingTop: idx === 0 ? 0 : '14px',
                    paddingBottom: isLast ? 0 : '14px',
                    borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: idx === 0 ? '#0284c7' : '#94a3b8',
                      paddingTop: '2px',
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    {itemNumber}
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                    <span
                      style={{
                        fontSize: '0.98rem',
                        fontWeight: 700,
                        color: idx === 0 ? '#0369a1' : '#0f172a'
                      }}
                    >
                      {t(item.nameKey, { defaultValue: item.nameFallback })}
                    </span>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.88rem',
                        color: '#475569',
                        lineHeight: 1.45
                      }}
                    >
                      {t(item.descriptionKey, { defaultValue: item.descriptionFallback })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Low-score / No-Pattern State */
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
              {t('report.no_pattern_title', { defaultValue: 'NO PARTICULAR PATTERN STOOD OUT' })}
            </span>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
              {t('report.no_pattern_desc', {
                defaultValue:
                  'Your responses did not point strongly toward one particular OCD-related pattern in this check-in.'
              })}
            </p>
          </div>
        )}
      </motion.div>



      {/* 6. COMPLETION SECTION */}
      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '24px',
          marginTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '10px'
        }}
      >
        <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 500 }}>
          {t('report.save_sub', { defaultValue: 'Save this check-in' })}
        </span>

        {completeError && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.84rem',
              fontWeight: 600
            }}
          >
            <span>{completeError}</span>
          </div>
        )}

        {isCompleted ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '9999px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            <CheckCircle2 size={16} color="#10b981" />
            <span>{t('report.completed_badge', { defaultValue: 'Check-In Saved & Completed' })}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleMarkAsDone}
            disabled={isCompleting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 28px',
              borderRadius: '9999px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: isCompleting ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              if (!isCompleting) {
                e.currentTarget.style.borderColor = '#94a3b8';
                e.currentTarget.style.background = '#f8fafc';
              }
            }}
            onMouseOut={(e) => {
              if (!isCompleting) {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.background = '#ffffff';
              }
            }}
          >
            {isCompleting ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>{t('report.saving', { defaultValue: 'Saving...' })}</span>
              </>
            ) : (
              <>
                <span>{t('report.btn_complete', { defaultValue: 'Mark Activity as Done →' })}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
