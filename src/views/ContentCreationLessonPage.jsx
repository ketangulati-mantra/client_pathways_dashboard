import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  LessonHero,
  FeatureGrid,
  BenefitCard,
  InfoCallout,
  SubmissionForm,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  Palette, Edit3, Video, Mic, Globe, HeartHandshake, TrendingUp, Users
} from 'lucide-react';

const LESSON_ID = 'content-creation';
const LESSON_TITLE = 'Content Creation for Mental Health - 20 Credits';
const REWARD_POINTS = 20;

const CONTENT_IDEAS = [
  { icon: Edit3, title: 'Write an Article', description: 'Publish a blog post or Medium article about mental health, self-care, or therapy.' },
  { icon: Video, title: 'Create a Video', description: 'Make a short-form video (TikTok, Reels, Shorts) explaining mental health concepts.' },
  { icon: Mic, title: 'Record a Podcast', description: 'Host or guest on a podcast discussing mental wellness and Mantra.' },
  { icon: Palette, title: 'Design Graphics', description: 'Create infographics for Instagram or Pinterest sharing coping mechanisms.' },
  { icon: Globe, title: 'Social Media Threads', description: 'Write an educational thread on Twitter/X or LinkedIn about emotional well-being.' }
];

const BENEFITS = [
  { icon: HeartHandshake, title: 'Impact', description: 'Educate and help thousands of people' },
  { icon: TrendingUp, title: 'Personal Brand', description: 'Build your professional portfolio' },
  { icon: Users, title: 'Audience', description: 'Grow a following in the wellness space' }
];

export default function ContentCreationLessonPage({ onBack }) {


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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }} className="animate-fade-in">
      <Header title={LESSON_TITLE} onBack={onBack} progress={lessonProgress} points={REWARD_POINTS} />

      <main className="academy-main-container" style={{
        flex: 1, padding: '28px 24px 60px', maxWidth: '860px', margin: '0 auto', width: '100%'
      }}>

        <LessonHero 
          theme="orange" 
          icon={Palette} 
          category="Content Creation" 
          title={LESSON_TITLE} 
          description="Create meaningful mental health content that educates people, reduces stigma, and helps more individuals discover support through Mantra." 
          duration="8 min"
          points={REWARD_POINTS}
        />

        <InfoCallout 
          type="info" 
          title="Why This Matters" 
          text="Great mental health content reaches thousands of people. Your creativity can educate, inspire, and encourage people to seek help while helping grow Mantra's community."
        />

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px' }}>Content Ideas</h2>
          <FeatureGrid features={CONTENT_IDEAS} />
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px' }}>Benefits</h2>
          <div className="academy-grid-2">
            {BENEFITS.map((b, idx) => (
              <BenefitCard key={idx} icon={b.icon} title={b.title} description={b.description} />
            ))}
          </div>
        </section>

        <section>
          <SubmissionForm onSuccess={handleActionComplete} />
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Activity Complete!" subtitle="You have successfully finished this task." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
