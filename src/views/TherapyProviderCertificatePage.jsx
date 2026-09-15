import React from 'react';
import CertificateDownloadPage from './CertificateDownloadPage';

const providerConfig = {
  certificateTitle: 'Therapy Provider Pathway',
  programName: 'MANTRACARE THERAPY PROVIDER PROGRAM',
  awardText: 'This certificate is proudly awarded to',
  completionText: 'for successfully completing the',
  courseName: 'Therapy Provider Pathway',
  quote: '"Therapy is a sacred collaboration of self-discovery and healing. Your presence, guidance, and compassion support others in navigating life\'s challenges and finding their strength."',
  authorizedBy: 'MantraCare Therapy Program',
  footer: 'Guiding minds and healing hearts. | mantracare.org',
  certificateIdPrefix: 'MC-TPP'
};

export default function TherapyProviderCertificatePage({ onBack }) {
  return <CertificateDownloadPage onBack={onBack} certificateConfig={providerConfig} />;
}
