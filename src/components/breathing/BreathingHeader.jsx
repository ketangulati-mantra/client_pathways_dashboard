import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export default function BreathingHeader({ onBack }) {
  const { t } = useTranslation('ocd_478_breathing');

  return (
    <header className="breathing-activity__header">
      {/* Left: Subtle Back button */}
      <button
        type="button"
        onClick={onBack}
        className="breathing-activity__back-btn"
        aria-label="Go back"
      >
        <ArrowLeft size={14} strokeWidth={2.2} />
        <span>{t('header_back', { defaultValue: 'Back' })}</span>
      </button>

      {/* Right placeholder for spacing */}
      <div style={{ width: '64px' }} />
    </header>
  );
}

