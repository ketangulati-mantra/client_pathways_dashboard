import React from 'react';
import CertificateDownloadPage from './CertificateDownloadPage';

const listenerConfig = {
  certificateTitle: 'Certificate of Completion',
  programName: 'LISTENER PROVIDER PROGRAM',
  awardText: 'This certificate is proudly awarded to',
  completionText: 'for successfully completing the',
  courseName: 'Listener Provider Pathway',
  quote: '"Being heard is so close to being loved that for the average person, they are almost indistinguishable. Thank you for holding space, listening deeply, and offering empathy."',
  authorizedBy: 'MantraCare Listener Program',
  footer: 'MANTRACARE LISTENER PROVIDER PROGRAM | mantracare.org',
  certificateIdPrefix: 'MC-LPP',
  congratsBadge: '🎉 LISTENER PROVIDER PATHWAY COMPLETE',
  congratsHeading: 'You did it!',
  congratsDescription: 'Completing the Listener Provider Pathway takes dedication and compassion. Enter your name to receive your certificate.',
};

export default function ListenerCertificatePage({ onBack }) {
  return <CertificateDownloadPage onBack={onBack} certificateConfig={listenerConfig} />;
}
