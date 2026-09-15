import React from 'react';
import {
  Header,
  OverviewCard,
  VideoSection,
  ExpandableCard,
  QuizCard,
  CompletionScreen,
  useToast
} from '../components';
import { useLessonCompletion } from '../hooks/useLessonCompletion';

// Lesson constants
const LESSON_ID     = 'getting-paid';
const LESSON_TITLE  = 'Getting Paid on MantraCare';
const REWARD_POINTS = 5;
const DURATION      = '4 min';

const VIDEO = {
  title:    'Getting Paid on MantraCare',
  duration: 'Video Lesson • 4 min',
  posterUrl: '/using-mantra-thumbnail.png',
  videoUrl:  'https://vimeo.com/1130777919?fl=pl&fe=cm'
};

const ACCORDIONS = [
  {
    title: 'Viewing Your Billings',
    content: (
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        <li style={{ marginBottom: '8px' }}>Open the Billing section from your provider dashboard.</li>
        <li style={{ marginBottom: '8px' }}>View monthly billing summaries.</li>
        <li style={{ marginBottom: '8px' }}>Track completed sessions.</li>
        <li>Review payment status for each billing cycle.</li>
      </ul>
    )
  },
  {
    title: 'Understanding Your Payments',
    content: (
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        <li style={{ marginBottom: '8px' }}>Each billing cycle displays total earnings.</li>
        <li style={{ marginBottom: '8px' }}>See amount already received.</li>
        <li style={{ marginBottom: '8px' }}>Track pending payouts.</li>
        <li>Monitor payment dates from one place.</li>
      </ul>
    )
  }
];

const QUIZ_QUESTIONS = [
  {
    question: 'According to the lesson, where should you go to begin checking your billings?',
    options: [
      { text: 'Dashboard', isCorrect: false },
      { text: 'Reports',   isCorrect: false },
      { text: 'Payments',  isCorrect: false },
      { text: 'Billing',   isCorrect: true  }
    ]
  },
  {
    question: 'Which information is displayed during each billing cycle?',
    options: [
      { text: 'Only the payment due', isCorrect: false },
      { text: 'Only billed sessions', isCorrect: false },
      { text: 'Total earnings, amount received, and payment due', isCorrect: true },
      { text: 'Only total earnings', isCorrect: false }
    ]
  }
];

export default function GettingPaidLessonPage({ onBack }) {
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
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}
      className="animate-fade-in"
    >
      {/* Header  -  same as LessonTemplate, passes lessonProgress */}
      <Header
        title={LESSON_TITLE}
        onBack={onBack}
        progress={lessonProgress}
        points={REWARD_POINTS}
      />

      <main
        className="academy-main-container"
        style={{
          flex: '1',
          padding: '24px 20px 80px 20px',
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px'
        }}
      >
        {/* 1. Overview */}
        <OverviewCard
          description="Learn how to view your billings, track payments, understand payout timelines and monitor your earnings on MantraCare."
          duration={DURATION}
          points={`+${REWARD_POINTS}`}
        />

        {/* 2. Video  -  first play sets videoWatched → 50% */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Video Tutorial</span>
          </h3>
          <VideoSection
            title={VIDEO.title}
            duration={VIDEO.duration}
            posterUrl={VIDEO.posterUrl}
            videoUrl={VIDEO.videoUrl}
            onCompleted={handleVideoComplete}
            isCompleted={videoWatched}
          />
        </section>

        {/* 3. Step-by-Step Guide */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Key Takeaways</span>
          </h3>
          <div>
            {ACCORDIONS.map((guide, idx) => (
              <ExpandableCard key={idx} title={guide.title} isOpenDefault={idx === 0}>
                <div style={{ lineHeight: '1.6', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {guide.content}
                </div>
              </ExpandableCard>
            ))}
          </div>
        </section>

        {/* 4. Knowledge Check
             Q1 first answer  → q1Answered → 75%
             Done after submit → quizDone  → 100% → 800ms → modal */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Knowledge Check</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'left', marginBottom: '4px' }}>
            Answer both questions and submit to complete this lesson.
          </p>
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

      {/* Completion modal  -  same as LessonTemplate, triggered after 800ms delay */}
      {showCelebrate && (
        <CompletionScreen
          points={REWARD_POINTS}
          title="Lesson Complete!"
          subtitle="You have finished this lesson and boosted your provider score."
          onClose={handleCloseCelebration}
        />
      )}
    </div>
  );
}
