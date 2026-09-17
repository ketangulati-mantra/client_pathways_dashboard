import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

const OCDMANTRA_LOGO_URL = 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png';

export default function PauseHeader({ onBack }) {
  const { t } = useTranslation('ocd_delay_tactic');

  return (
    <header className="sixty-second-pause__header">
      {/* Left: Pill-styled Back button */}
      <button
        type="button"
        onClick={onBack}
        className="sixty-second-pause__back-btn"
        aria-label="Go back"
      >
        <ArrowLeft size={15} strokeWidth={2.2} />
        <span>{t('header_back', { defaultValue: 'Back' })}</span>
      </button>

      {/* Center: Official OCDMantra Icon Logo */}
      <img
        src={OCDMANTRA_LOGO_URL}
        alt="OCDMantra"
        className="sixty-second-pause__logo"
      />

      {/* Right placeholder to keep logo perfectly centered */}
      <div style={{ width: '70px' }} />
    </header>
  );
}
