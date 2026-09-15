import React from 'react';
import {
  Header,
  VideoSection,
  Button,
  CompletionScreen,
} from '../components';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { CheckCircle2 } from 'lucide-react';

// Lesson constants
const LESSON_ID = 'understand-depression';
const LESSON_TITLE = 'Understand What is Depression?';
const REWARD_POINTS = 50;

const VIDEO = {
  title: 'What is Depression?',
  duration: '4 min',
  posterUrl: 'https://img.youtube.com/vi/WQCnxTiZZa0/maxresdefault.jpg',
  videoUrl: 'https://www.youtube.com/embed/WQCnxTiZZa0'
};

export default function UnderstandDepressionLessonPage({ onBack }) {
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
        display: 'flex', flexDirection: 'column', gap: '40px'
      }}>

        {/* Hero Section */}
        <section style={{ textAlign: 'center', background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', padding: '40px 24px', borderRadius: '16px', border: '1px solid #f3e8ff' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, margin: '0 0 16px', color: '#86198f' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#4a044e', lineHeight: '1.6', margin: '0 auto', maxWidth: '600px' }}>
            Depression is more than just feeling sad. Let's learn about what it is, why it happens, and how to find hope and healing.
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

        {/* Summary Sections */}
        {videoWatched && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* What is Depression? */}
            <section>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🧠</span> What is Depression?
              </h2>
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.7', margin: 0 }}>
                  Depression is a common and serious medical illness that negatively affects how you feel, the way you think, and how you act. It causes feelings of sadness and/or a loss of interest in activities you once enjoyed. <strong>It is not a sign of weakness or a character flaw.</strong>
                </p>
              </div>
            </section>

            {/* Common Symptoms Grid */}
            <section>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🚩</span> Common Symptoms
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem', marginBottom: '12px' }}>😔</span>
                  <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>Persistent Sadness</strong>
                  <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>Feeling empty, hopeless, or tearful most days.</p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem', marginBottom: '12px' }}>💤</span>
                  <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>Changes in Sleep</strong>
                  <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>Insomnia or sleeping significantly more than usual.</p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem', marginBottom: '12px' }}>🔋</span>
                  <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>Loss of Energy</strong>
                  <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>Chronic fatigue or feeling physically drained.</p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem', marginBottom: '12px' }}>🎯</span>
                  <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>Loss of Interest</strong>
                  <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>No longer finding joy in hobbies or activities.</p>
                </div>
              </div>
            </section>

            {/* Common Myths vs Facts */}
            <section>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>💡</span> Common Myths vs. Facts
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', background: '#fff1f2', padding: '20px', borderRadius: '12px', border: '1px solid #fecdd3' }}>
                  <div style={{ flexShrink: 0, fontSize: '1.5rem' }}>❌</div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: '#9f1239', marginBottom: '4px' }}>Myth: "You can just snap out of it."</strong>
                    <span style={{ color: '#4c0519', fontSize: '0.95rem' }}>Fact: Depression is a medical condition, not a choice. It requires proper treatment and support.</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <div style={{ flexShrink: 0, fontSize: '1.5rem' }}>✅</div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: '#166534', marginBottom: '4px' }}>Myth: "It only happens after a tragic event."</strong>
                    <span style={{ color: '#14532d', fontSize: '0.95rem' }}>Fact: While life events can trigger it, depression can also happen without a clear external reason due to biological factors.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Treatment and When to Seek Help */}
            <section style={{ background: '#f0f9ff', padding: '32px 24px', borderRadius: '16px', border: '1px solid #bae6fd', textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>🤝</span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 12px', color: '#0369a1' }}>
                Depression is Highly Treatable
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#0c4a6e', lineHeight: '1.6', margin: '0 auto 20px', maxWidth: '600px' }}>
                Between 80% and 90% of people with depression eventually respond well to treatment. Support includes therapy (like CBT), medication, and lifestyle adjustments. 
                <br /><br />
                <strong>When to seek professional help:</strong> If symptoms last for more than two weeks and interfere with your daily life, relationships, or work, it's time to reach out to a professional.
              </p>
            </section>
          </div>
        )}

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
