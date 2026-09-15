import React from 'react';
import {
  Header,
  VideoSection,
  Button,
  CompletionScreen,
  useToast
} from '../components';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { CheckCircle2 } from 'lucide-react';

// Lesson constants
const LESSON_ID = 'book-join-session';
const LESSON_TITLE = 'How to Book & Join a Session';
const REWARD_POINTS = 5;

const VIDEO = {
  title: 'How to Book & Join a Session',
  duration: '4 min',
  posterUrl: 'https://img.youtube.com/vi/qVDdQS5oUUo/maxresdefault.jpg',
  videoUrl: 'https://www.youtube.com/embed/qVDdQS5oUUo?si=BjufsgmMIftTlj2g'
};

export default function BookJoinSessionLessonPage({ onBack }) {
  const {
    videoWatched,
    actionDone,
    lessonProgress,
    showCelebrate,
    handleVideoComplete,
    handleActionComplete,
    handleCloseCelebration
  } = useLessonCompletion(LESSON_ID, onBack, { hasVideo: true, hasAction: true, hasQuiz: false });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }} className="animate-fade-in">
      <Header title={LESSON_TITLE} onBack={onBack} progress={lessonProgress} points={REWARD_POINTS} />

      <main className="academy-main-container" style={{
        flex: 1, padding: '40px 24px 80px', maxWidth: '800px', margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '32px'
      }}>

        {/* Lesson Information */}
        <section>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
            This video explains how to easily find an available time slot, book a session with your provider, and successfully join your video call when the time comes.
          </p>
        </section>

        {/* Video Section */}
        <section>
          <VideoSection
            title={VIDEO.title}
            duration={VIDEO.duration}
            posterUrl={VIDEO.posterUrl}
            videoUrl={VIDEO.videoUrl}
            onCompleted={handleVideoComplete}
            isCompleted={videoWatched}
          />
        </section>

        {/* Completion Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <Button variant="primary" disabled={!videoWatched} onClick={handleActionComplete} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', border: 'none', background: videoWatched ? 'var(--color-primary)' : '#cbd5e1', color: 'white' }}>
              <CheckCircle2 size={18} />
              <span>Mark as Completed</span>
            </Button>
          </div>
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} onClose={handleCloseCelebration} />
      )}
    </div>
  );
}

