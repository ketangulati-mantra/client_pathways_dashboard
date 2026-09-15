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
  Globe, MessageCircle, Share2, UserPlus, HeartHandshake, GraduationCap, TrendingUp
} from 'lucide-react';

const LESSON_ID = 'community-management';
const LESSON_TITLE = 'Community Management - 10 Credits';
const REWARD_POINTS = 10;

const WHAT_YOU_DO = [
  { icon: MessageCircle, title: 'Answer Questions', description: 'Respond to basic mental health and well-being discussions under guidance.' },
  { icon: Globe, title: 'Participate in Communities', description: 'Contribute to Quora, Reddit, LinkedIn, Facebook groups, and student communities.' },
  { icon: Share2, title: 'Share Resources', description: 'Recommend Mantra\'s free listener support, hotline services, assessments, and awareness campaigns.' },
  { icon: UserPlus, title: 'Promote Your Profile', description: 'Share your Mantra profile where appropriate to help people discover professional support.' },
  { icon: HeartHandshake, title: 'Refer for Care', description: 'Direct people needing additional help to the appropriate Mantra programs.' }
];

const BENEFITS = [
  { icon: GraduationCap, title: 'Credits', description: 'Earn 10 certification credits' },
  { icon: MessageCircle, title: 'Communication', description: 'Improve communication skills' },
  { icon: Globe, title: 'Experience', description: 'Build community engagement experience' },
  { icon: TrendingUp, title: 'Visibility', description: 'Increase your professional visibility' },
  { icon: HeartHandshake, title: 'Awareness', description: 'Support mental health awareness' }
];

export default function CommunityManagementLessonPage({ onBack }) {


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
          icon={Globe} 
          category="Community Activity" 
          title={LESSON_TITLE} 
          description="Help build Mantra's online community by guiding people, sharing trusted mental health resources, and connecting individuals to the right support." 
          duration="5 min"
          points={REWARD_POINTS}
        />

        <InfoCallout 
          type="info" 
          title="Why This Matters" 
          text="Help expand access to mental health support while developing communication, empathy, and community engagement skills."
        />

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px' }}>Your Responsibilities</h2>
          <FeatureGrid features={WHAT_YOU_DO} />
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px' }}>Benefits</h2>
          <div className="academy-grid-2">
            {BENEFITS.map((b, idx) => (
              <BenefitCard key={idx} icon={b.icon} title={b.title} description={b.description} />
            ))}
          </div>
        </section>
        
        <InfoCallout 
          type="info" 
          title="Upload Proof" 
          text="Submit a screenshot or recording showing your contribution (post, discussion, reply, or shared resource). Valid submissions earn 10 certification credits after review."
        />

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
