import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  LessonHero,
  StepTimeline,
  InfoCallout,
  SubmissionForm,
  QuizCard,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  TrendingUp, Users, Award, Rocket, PlayCircle, Monitor, 
  Upload, Repeat, CheckCircle2, AlertTriangle, Mail, Star
} from 'lucide-react';

const LESSON_ID = 'earn-points';
const LESSON_TITLE = 'Earn Points for Every Session';
const REWARD_POINTS = 5;

const WHY_POINTS_MATTER = [
  { icon: TrendingUp, title: 'Better Profile Ranking', description: 'Become more visible to potential clients.' },
  { icon: Users, title: 'More Client Opportunities', description: 'Higher engagement increases your chances of receiving clients.' },
  { icon: Award, title: 'Certification Progress', description: 'Earn points toward milestones and certifications.' },
  { icon: Rocket, title: 'Long-Term Growth', description: 'Unlock recognition, badges and future opportunities.' }
];

const TIMELINE = [
  { icon: PlayCircle, title: 'Conduct Therapy Session', description: 'Complete a genuine therapy session through the Mantra platform.' },
  { icon: Monitor, title: 'Complete Session on Mantra', description: 'Ensure the session is conducted using the official Mantra web or mobile platform.' },
  { icon: Upload, title: 'Submit Proof', description: 'Upload a screenshot within 7 days.' },
  { icon: Repeat, title: 'Repeat Sessions', description: 'Continue conducting sessions to earn additional engagement points.' },
  { icon: CheckCircle2, title: 'Verification', description: 'After successful verification, points are credited to your account.' }
];

const QUIZ_QUESTIONS = [
  {
    question: 'How long do you have to submit session proof for points?',
    options: [
      { text: 'Within 24 hours', isCorrect: false },
      { text: 'Within 7 days', isCorrect: true },
      { text: 'Within 30 days', isCorrect: false },
      { text: 'There is no time limit', isCorrect: false }
    ],
    explanation: 'You must submit your screenshot proof within 7 days of the completed session to qualify for points.'
  },
  {
    question: 'Where should you email proof for repeat or additional sessions?',
    options: [
      { text: 'support@mantra.care', isCorrect: false },
      { text: 'provider@mantra.care', isCorrect: true },
      { text: 'billing@mantra.care', isCorrect: false },
      { text: 'No email required', isCorrect: false }
    ],
    explanation: 'Additional session proofs should be emailed to provider@mantra.care using your registered email ID.'
  }
];

export default function EarnPointsLessonPage({ onBack }) {


  const { 
    lessonProgress, 
    showCelebrate, 
    handleCloseCelebration, 
    handleActionComplete 
  } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasQuiz: false,
    hasAction: true
  });

  const { showToast } = useToast();
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (lessonProgress === 100 && quizCompleted) {
      const timer = setTimeout(() => {
        setShowCelebrate(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [lessonProgress, quizCompleted]);

  const handleQuizComplete = () => {
    setQuizCompleted(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }} className="animate-fade-in">
      <Header title={LESSON_TITLE} onBack={onBack} progress={lessonProgress} points={REWARD_POINTS} />

      <main className="academy-main-container" style={{
        flex: 1, padding: '40px 24px 80px', maxWidth: '900px', margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '48px'
      }}>

        <header style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block', padding: '6px 12px', background: '#fef9c3', 
            color: '#a16207', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
            marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <Award size={14} /> Engagement Rewards
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a' }}>
            {LESSON_TITLE}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Learn how to earn Mantra Points by conducting therapy sessions through the platform and submitting valid proof.
          </p>
          
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#fffbeb', color: '#b45309', padding: '10px 16px',
            borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600, marginTop: '24px',
            border: '1px solid #fde68a'
          }}>
            <Star size={18} fill="currentColor" /> More sessions = More Points = Better Visibility
          </div>
        </header>

        {/* Why Mantra Points Matter */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            Why Mantra Points Matter
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {WHY_POINTS_MATTER.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px',
                background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How To Earn Points */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
            How To Earn Points
          </h2>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <StepTimeline steps={TIMELINE} />
          </div>
        </section>

        <div className="academy-grid-2">
          {/* Important Rules */}
          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
              Important Rules
            </h2>
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '24px',
              display: 'flex', flexDirection: 'column', gap: '16px', height: '100%',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.05)'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#b91c1c', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={24} /> Important
              </h3>
              <ul style={{ margin: 0, paddingLeft: '24px', color: '#991b1b', fontSize: '1rem', lineHeight: '1.8', fontWeight: 500 }}>
                <li>Submit proof within 7 days.</li>
                <li>Session must be genuine.</li>
                <li>Session must be conducted through Mantra.</li>
                <li>Invalid or incomplete submissions may be rejected.</li>
              </ul>
            </div>
          </section>

          {/* Repeat Submissions */}
          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px', color: '#0f172a' }}>
              Repeat Submissions
            </h2>
            <div style={{
              background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px',
              display: 'flex', flexDirection: 'column', gap: '16px', height: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={20} color="#0ea5e9" /> For additional sessions:
              </h3>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
                Email screenshots to <strong>provider@mantra.care</strong>
              </p>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
                <strong>Subject:</strong> Provider Activity Submission Proof
              </p>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
                Use the same registered email ID.
              </p>
            </div>
          </section>
        </div>

        {/* Knowledge Check */}
        <section>
          <QuizCard 
            id={LESSON_ID}
            questions={QUIZ_QUESTIONS}
            onComplete={handleQuizComplete}
            isMulti={true}
          />
        </section>

        {/* Application Form */}
        <section>
          <SubmissionForm 
            onSuccess={handleActionComplete} 
            title="Activity Submission"
            successTitle="Proof Submitted Successfully"
            successMessage="Your submission is being reviewed. Points will be awarded upon verification."
            buttonText="Submit Proof"
          />
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Lesson Complete!" subtitle="You're on your way to earning more engagement points." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
