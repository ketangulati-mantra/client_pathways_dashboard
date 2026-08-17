import React from 'react';
import LessonTemplate from './LessonTemplate';

export default function UserOnboardingFoundationPage({ onBack }) {
  const lessonData = {
    id: 'user-onboarding',
    title: 'Welcome to Mantra User Pathways',
    description: 'This is the foundational activity for your User Journey on Mantra. Learn how pathways help you navigate care, build daily healthy habits, and track your wellbeing.',
    duration: '2 min',
    points: 20,
    checklist: [
      {
        id: 'step-1',
        title: 'Understand Your Pathway Dashboard',
        description: 'Explore the activities and milestones customized for your wellness journey.'
      },
      {
        id: 'step-2',
        title: 'Set Your Personal Health & Wellness Goals',
        description: 'Select your primary wellness priorities to receive targeted recommendations.'
      },
      {
        id: 'step-3',
        title: 'Review Daily Routine Check-ins',
        description: 'Discover how daily progress tracking keeps you accountable and consistent.'
      }
    ],
    quiz: {
      question: 'What is the primary benefit of following your Mantra User Pathway?',
      options: [
        'A structured, guided journey tailored to achieve your personal health & wellness goals',
        'Receiving random, unorganized articles',
        'Only tracking calendar appointments',
        'None of the above'
      ]
    }
  };

  return <LessonTemplate lesson={lessonData} onBack={onBack} />;
}
