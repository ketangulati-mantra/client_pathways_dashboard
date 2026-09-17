import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function OcdPatternProfile({ domainScores = {} }) {
  const { t } = useTranslation('ocd_assessment');

  // 4 Core Domains to visualize
  const domains = [
    {
      id: 'intrusive_thoughts',
      nameKey: 'domains.intrusive_thoughts',
      nameFallback: 'Intrusive thoughts',
      score: domainScores['intrusive_thoughts'] || 0,
      max: 8
    },
    {
      id: 'compulsions',
      nameKey: 'domains.compulsions',
      nameFallback: 'Compulsive responses',
      score: domainScores['compulsions'] || 0,
      max: 4
    },
    {
      id: 'mental_rituals',
      nameKey: 'domains.mental_rituals',
      nameFallback: 'Mental rituals',
      score: domainScores['mental_rituals'] || 0,
      max: 4
    },
    {
      id: 'functional_impact',
      nameKey: 'domains.functional_impact',
      nameFallback: 'Daily-life impact',
      score: domainScores['functional_impact'] || 0,
      max: 8
    }
  ];

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1.5px solid #e0f2fe',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 2px 10px rgba(2, 132, 199, 0.05)',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f9ff', paddingBottom: '8px' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#0284c7'
          }}
        >
          {t('report.pattern_profile_title', { defaultValue: 'YOUR PATTERN PROFILE' })}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
          {t('report.pattern_profile_sub', { defaultValue: 'Relative focus areas' })}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {domains.map((item, idx) => {
          const ratio = Math.min(1, Math.max(0.12, item.score / item.max));
          const isProminent = ratio >= 0.5;
          const label = isProminent
            ? t('report.level_noticeable', { defaultValue: 'More noticeable' })
            : t('report.level_low', { defaultValue: 'Less noticeable' });

          return (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                  {t(item.nameKey, { defaultValue: item.nameFallback })}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: isProminent ? '#0284c7' : '#64748b'
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Smooth Pill Bar with Soft Blue Aesthetic */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: '#f1f5f9',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${ratio * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.1 + idx * 0.08, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    borderRadius: '999px',
                    background: isProminent
                      ? 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)'
                      : 'linear-gradient(90deg, #cbd5e1 0%, #94a3b8 100%)'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
