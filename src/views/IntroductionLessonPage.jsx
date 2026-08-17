import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Header,
  VideoSection,
  QuizCard,
  CompletionScreen,
  useToast
} from '../components';
import { useLessonCompletion } from '../hooks/useLessonCompletion';

// Lesson constants
const LESSON_ID = 'introduction';
const REWARD_POINTS = 5;

const VIDEO = {
  duration: '4 min',
  posterUrl: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1784698444/intro-to-mantra-thumbnail_gc7iso.jpg',
  videoUrl: 'https://vimeo.com/1149587565?fl=pl&fe=cm'
};

const QUIZ_QUESTIONS = [
  {
    question: 'What is the mission of MantraCare?',
    options: [
      { text: 'To sell pharmaceutical products and medical equipment', isCorrect: false },
      { text: 'To provide affordable and accessible mental healthcare globally', isCorrect: true },
      { text: 'To provide fitness training and gym memberships', isCorrect: false },
      { text: 'To build medical hardware and devices', isCorrect: false }
    ],
    explanation: 'MantraCare is dedicated to making quality mental healthcare affordable and accessible to everyone around the world.'
  },
  {
    question: 'For what purposes can the Mantra app be used?',
    options: [
      { text: 'Managing client sessions, notes, and payments', isCorrect: true },
      { text: 'Ordering food delivery and groceries', isCorrect: false },
      { text: 'Booking international flights and hotels', isCorrect: false },
      { text: 'Playing mobile games and entertainment', isCorrect: false }
    ],
    explanation: 'The Mantra app is designed for providers to seamlessly manage client sessions, keep session notes, and process payments.'
  }
];

export default function IntroductionLessonPage({ onBack }) {
  const { t } = useTranslation('shared');
  const lessonTitle = t('introduction.title', 'Introduction to Mantra Platform');
  const lessonDesc = t('introduction.description', 'This video explains how therapists, coaches, doctors, and wellness experts can create a free listing on MantraCare. Learn how to set up your professional profile, showcase your expertise, and start connecting with clients globally — all at zero cost.');

  const {
    videoWatched,
    quizDone,
    lessonProgress,
    showCelebrate,
    handleVideoComplete,
    handleQuizComplete,
    handleCloseCelebration
  } = useLessonCompletion(LESSON_ID, onBack);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }} className="animate-fade-in">
      <Header title={lessonTitle} onBack={onBack} progress={lessonProgress} points={REWARD_POINTS} />

      <main className="academy-main-container" style={{
        flex: 1, padding: '40px 24px 80px', maxWidth: '800px', margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '32px'
      }}>

        {/* Lesson Information */}
        <section>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            {lessonTitle}
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
            {lessonDesc}
          </p>
        </section>

        {/* Video Section */}
        <section>
          <VideoSection
            title={lessonTitle}
            duration={VIDEO.duration}
            posterUrl={VIDEO.posterUrl}
            videoUrl={VIDEO.videoUrl}
            onCompleted={handleVideoComplete}
            isCompleted={videoWatched}
          />
        </section>

        {/* Quiz Section */}
        <section>
          <QuizCard
            id={LESSON_ID}
            questions={QUIZ_QUESTIONS}
            onComplete={handleQuizComplete}
            isCompleted={quizDone}
            hasVideo={true}
            videoWatched={videoWatched}
          />
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
