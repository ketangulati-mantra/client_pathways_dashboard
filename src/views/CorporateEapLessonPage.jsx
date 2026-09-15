import React, { useState, useEffect } from 'react';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import {
  Header,
  CompletionScreen,
  LessonHero,
  FeatureGrid,
  BenefitCard,
  InfoCallout,
  InterestForm,
  useToast
} from '../components';
import { completeLesson, goToDashboard } from '../mantra';
import { 
  Building2, MonitorPlay, Users, Presentation, 
  Briefcase, GraduationCap, TrendingUp, HeartHandshake
} from 'lucide-react';

const LESSON_ID = 'corporate-eap';
const LESSON_TITLE = 'Corporate EAP Program Support';
const REWARD_POINTS = 5;

const WHAT_YOU_DO = [
  { icon: Building2, title: 'Client Onboarding', description: 'Assist companies and employees in getting started on the platform.' },
  { icon: Presentation, title: 'Workshops', description: 'Help organize and moderate mental health and wellness webinars.' },
  { icon: MonitorPlay, title: 'Program Promotion', description: 'Share resources to increase employee utilization of EAP services.' },
  { icon: Briefcase, title: 'Corporate Wellness', description: 'Gather feedback to improve workplace mental health initiatives.' }
];

const BENEFITS = [
  { icon: GraduationCap, title: 'Credits', description: 'Earn 5 certification credits' },
  { icon: HeartHandshake, title: 'Impact', description: 'Improve workplace well-being' },
  { icon: Users, title: 'Networking', description: 'Connect with HR professionals' },
  { icon: TrendingUp, title: 'Experience', description: 'Gain B2B wellness experience' }
];

export default function CorporateEapLessonPage({ onBack }) {


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
          icon={Building2} 
          category="Community Initiative" 
          title={LESSON_TITLE} 
          description="Support workplace mental health initiatives by assisting with onboarding, webinars, workshops, and corporate wellness programs." 
          duration="2 min"
          points={REWARD_POINTS}
        />

        <InfoCallout 
          type="info" 
          title="Why Join" 
          text="Help improve employee well-being while gaining real-world experience in corporate mental health programs."
        />

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px' }}>Your Responsibilities</h2>
          <FeatureGrid features={WHAT_YOU_DO} />
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px' }}>Benefits You'll Gain</h2>
          <div className="academy-grid-2">
            {BENEFITS.map((b, idx) => (
              <BenefitCard key={idx} icon={b.icon} title={b.title} description={b.description} />
            ))}
          </div>
        </section>

        <section>
          <InterestForm 
            initiative="EAP Support Program" 
            onSuccess={handleActionComplete} 
            title="Apply for the Initiative"
            description="Complete this form to express your interest in joining the EAP Support team."
          />
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Activity Complete!" subtitle="You have successfully finished this task." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
