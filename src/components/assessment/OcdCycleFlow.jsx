import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function OcdCycleFlow() {
  const { t } = useTranslation('ocd_assessment');

  const steps = [
    {
      id: 'step_thought',
      num: '01',
      titleKey: 'cycle.step1_title',
      titleFallback: 'Unwanted Thought',
      descKey: 'cycle.step1_desc',
      descFallback: 'An intrusive thought, doubt, or mental image suddenly appears.'
    },
    {
      id: 'step_discomfort',
      num: '02',
      titleKey: 'cycle.step2_title',
      titleFallback: 'Discomfort & Uncertainty',
      descKey: 'cycle.step2_desc',
      descFallback: 'Internal anxiety, tension, or urgency rises: "What if?"'
    },
    {
      id: 'step_compulsion',
      num: '03',
      titleKey: 'cycle.step3_title',
      titleFallback: 'Compulsive Response',
      descKey: 'cycle.step3_desc',
      descFallback: 'A physical action or mental ritual is done to neutralize the doubt.'
    },
    {
      id: 'step_relief',
      num: '04',
      titleKey: 'cycle.step4_title',
      titleFallback: 'Temporary Relief',
      descKey: 'cycle.step4_desc',
      descFallback: 'Discomfort drops briefly, reinforcing the urge for next time.'
    },
    {
      id: 'step_returns',
      num: '05',
      titleKey: 'cycle.step5_title',
      titleFallback: 'The Cycle Returns',
      descKey: 'cycle.step5_desc',
      descFallback: 'The brain learns the ritual is required, keeping the loop active.'
    }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Desktop / Tablet Horizontal Connected Timeline */}
      <div
        className="ocd-cycle-desktop"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '10px',
          position: 'relative',
          width: '100%'
        }}
      >
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #e0f2fe',
                borderRadius: '16px',
                padding: '16px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.04)',
                boxSizing: 'border-box',
                height: '100%'
              }}
            >
              {/* Step Counter Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#0284c7',
                    background: '#f0f9ff',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em'
                  }}
                >
                  {step.num}
                </span>

                {isLast ? (
                  <RotateCcw size={14} color="#0284c7" />
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>→</span>
                )}
              </div>

              {/* Step Title */}
              <h4
                style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.3
                }}
              >
                {t(step.titleKey, { defaultValue: step.titleFallback })}
              </h4>

              {/* Step Description */}
              <p
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  color: '#475569',
                  lineHeight: 1.45,
                  fontWeight: 400
                }}
              >
                {t(step.descKey, { defaultValue: step.descFallback })}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Vertical Flow */}
      <div
        className="ocd-cycle-mobile"
        style={{
          display: 'none',
          flexDirection: 'column',
          gap: '8px',
          width: '100%'
        }}
      >
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <React.Fragment key={step.id}>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e0f2fe',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.04)'
                }}
              >
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#0284c7',
                    background: '#f0f9ff',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  {step.num}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                    {t(step.titleKey, { defaultValue: step.titleFallback })}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                    {t(step.descKey, { defaultValue: step.descFallback })}
                  </p>
                </div>
              </motion.div>

              {!isLast && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
                  <ArrowDown size={14} color="#94a3b8" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ocd-cycle-desktop {
            display: none !important;
          }
          .ocd-cycle-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
