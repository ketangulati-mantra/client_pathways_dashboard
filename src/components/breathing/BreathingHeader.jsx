import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

const OCDMANTRA_LOGO_URL = 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png';

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

      {/* Center: Refined Smaller OCDMantra Logo */}
      <img
        src={OCDMANTRA_LOGO_URL}
        alt="OCDMantra"
        className="breathing-activity__logo"
      />

      {/* Right placeholder to keep logo perfectly centered */}
      <div style={{ width: '64px' }} />
    </header>
  );
}

