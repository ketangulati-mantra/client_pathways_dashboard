import React from 'react';
import CertificateDownloadPage from './CertificateDownloadPage';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { CompletionScreen } from '../components';

const LESSON_ID = 'yoga-certificate';
const REWARD_POINTS = 20;

const yogaConfig = {
  certificateTitle: 'Certificate of Completion',
  programName: 'YOGA PROVIDER PROGRAM',
  awardText: 'This certificate is proudly awarded to',
  completionText: 'for successfully completing the',
  courseName: 'Yoga Provider Pathway',
  quote: '"Yoga is the journey of the self, through the self, to the self. Thank you for guiding others toward balance, strength, and mindful living."',
  authorizedBy: 'MantraCare Yoga Program',
  footer: 'Nurturing mind, body, and spirit. | mantracare.org',
  certificateIdPrefix: 'MC-YPP',
  congratsBadge: '🧘 YOGA PROVIDER PATHWAY COMPLETE',
  congratsHeading: 'You did it!',
  congratsDescription: 'Completing the Yoga Provider Pathway takes dedication and commitment. Enter your name to generate your certificate.',
};

export default function YogaCertificatePage({ onBack }) {
  const { 
    showCelebrate, 
    handleCloseCelebration, 
    handleActionComplete 
  } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasQuiz: false,
    hasAction: true
  });

  return (
    <>
      <CertificateDownloadPage 
        onBack={onBack} 
        certificateConfig={yogaConfig}
        onDownload={handleActionComplete}
      />
      {showCelebrate && (
        <CompletionScreen
          points={REWARD_POINTS}
          title="Pathway Complete!"
          subtitle="Congratulations on completing the Yoga Provider Pathway."
          onClose={handleCloseCelebration}
        />
      )}
    </>
  );
}
