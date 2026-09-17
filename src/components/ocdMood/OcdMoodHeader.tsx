import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, BarChart2 } from 'lucide-react';

interface OcdMoodHeaderProps {
  onBack: () => void;
  title?: string;
  activeTab?: 'checkin' | 'moments' | 'trends';
  onTabChange?: (tab: 'checkin' | 'moments' | 'trends') => void;
  showTabs?: boolean;
}

const OCDMANTRA_LOGO_URL = 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png';

export default function OcdMoodHeader({
  onBack,
  activeTab,
  onTabChange,
  showTabs = false
}: OcdMoodHeaderProps) {
  const { t } = useTranslation('ocd_mood_check_in');

  return (
    <header className="ocd-mood-header">
      {/* Back Button on Left */}
      <button
        type="button"
        onClick={onBack}
        className="ocd-mood-back-btn"
        aria-label="Go back"
      >
        <ArrowLeft size={14} strokeWidth={2.2} />
        <span>{t('header_back', { defaultValue: 'Back' })}</span>
      </button>

      {/* Exactly centered OCDMantra Logo */}
      <img
        src={OCDMANTRA_LOGO_URL}
        alt="OCDMantra"
        className="ocd-mood-logo"
      />

      {/* Right Action: History/Journal shortcut */}
      {showTabs && onTabChange ? (
        <div className="ocd-mood-header-actions">
          <button
            type="button"
            onClick={() => onTabChange(activeTab === 'moments' ? 'checkin' : 'moments')}
            className={`ocd-mood-header-pill ${activeTab === 'moments' || activeTab === 'trends' ? 'active' : ''}`}
            title="View Moments & Trends"
          >
            <BookOpen size={13} />
            <span>{t('header_history', { defaultValue: 'History' })}</span>
          </button>
        </div>
      ) : (
        <div style={{ width: '64px' }} />
      )}
    </header>
  );
}
