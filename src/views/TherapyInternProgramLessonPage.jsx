import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  LessonHero,
  FeatureGrid,
  BenefitCard,
  InfoCallout,
  StepTimeline,
  InterestForm,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  GraduationCap, ClipboardCheck, Video, Users, 
  BookOpen, Award, CheckCircle2, Stethoscope, Briefcase
} from 'lucide-react';

const LESSON_ID = 'intern-program';
const LESSON_TITLE = 'Mantra Foundation Therapy Intern Program';
const REWARD_POINTS = 5;

const WHAT_YOU_DO = [
  { icon: ClipboardCheck, title: 'Shadowing', description: 'Observe mock therapy sessions and case conceptualizations with senior psychologists.' },
  { icon: Video, title: 'Supervised Practice', description: 'Conduct supervised mock counseling sessions with feedback from mentors.' },
  { icon: Users, title: 'Group Discussions', description: 'Participate in weekly case discussions and therapeutic approach analyses.' },
  { icon: BookOpen, title: 'Clinical Assignments', description: 'Complete practical assignments on treatment planning and diagnostics.' }
];

const BENEFITS = [
  { icon: Award, title: 'Certification', description: 'Receive a verified internship completion certificate.' },
  { icon: Stethoscope, title: 'Clinical Hours', description: 'Log supervised hours required for your academic degree.' },
  { icon: Briefcase, title: 'Career Growth', description: 'Enhance your resume with practical, supervised clinical experience.' }
];

const TIMELINE = [
  { title: 'Application', description: 'Submit your interest form detailing your academic background.' },
  { title: 'Interview', description: 'Complete a brief video interview to assess your foundational knowledge.' },
  { title: 'Orientation', description: 'Attend the onboarding session to understand program guidelines.' },
  { title: 'Program Start', description: 'Begin your 4-week structured internship curriculum.', icon: CheckCircle2 }
];

export default function TherapyInternProgramLessonPage({ onBack }) {


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
          theme="purple" 
          icon={GraduationCap} 
          category="Community Initiative" 
          title="Therapy Intern Program" 
          description="Gain real-world clinical experience and professional supervision through the official Mantra Foundation Therapy Internship." 
          duration="3 min"
          points={REWARD_POINTS}
        />

        <InfoCallout 
          type="info" 
          title="About the Program" 
          text="This program provides psychology students and aspiring mental health professionals with supervised clinical exposure, structured learning, and real-world experience."
        />

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px' }}>What You'll Do</h2>
          <FeatureGrid features={WHAT_YOU_DO} />
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px' }}>Program Benefits</h2>
          <div className="academy-grid-2">
            {BENEFITS.map((b, idx) => (
              <BenefitCard key={idx} icon={b.icon} title={b.title} description={b.description} />
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px' }}>How Certification Works</h2>
          <StepTimeline steps={TIMELINE} />
        </section>

        <section>
          <InterestForm 
            initiative="Therapy Intern Program" 
            onSuccess={handleActionComplete} 
            title="Apply for the Internship"
            description="Complete the short application below. Our team will review your submission and contact you with the next steps."
          />
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Activity Complete!" subtitle="You have successfully finished this task." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
