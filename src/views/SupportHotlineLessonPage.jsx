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
  Headset, HeartHandshake, PhoneCall, GraduationCap, ShieldCheck, 
  MessageSquare, UserCheck, PlayCircle
} from 'lucide-react';

const LESSON_ID = 'support-hotline';
const LESSON_TITLE = 'Support Our Mental Health Hotline';
const REWARD_POINTS = 5;

const WHAT_YOU_DO = [
  { icon: Headset, title: 'Active Listening', description: 'Provide empathetic, non-judgmental support to callers in distress.' },
  { icon: PhoneCall, title: 'Crisis De-escalation', description: 'Help callers regulate their emotions using proven grounding techniques.' },
  { icon: HeartHandshake, title: 'Resource Navigation', description: 'Guide callers to appropriate long-term care or emergency services if needed.' }
];

const BENEFITS = [
  { icon: GraduationCap, title: 'Certification Credits', description: 'Earn 5 credits upon completion of your shift.' },
  { icon: MessageSquare, title: 'Communication Skills', description: 'Develop crisis communication and de-escalation skills.' },
  { icon: ShieldCheck, title: 'Clinical Experience', description: 'Gain supervised experience interacting with individuals seeking support.' }
];

const TIMELINE = [
  { title: 'Application Review', description: 'Our clinical team reviews your profile and background.' },
  { title: 'Training Module', description: 'Complete a 2-hour mandatory crisis intervention training video.', icon: PlayCircle },
  { title: 'Shadowing', description: 'Listen in on 3 live calls with a senior responder.', icon: UserCheck },
  { title: 'Active Shift', description: 'Take your first live shift with a supervisor on standby.', icon: Headset }
];

export default function SupportHotlineLessonPage({ onBack }) {


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
          icon={Headset} 
          category="Community Initiative" 
          title="Support Our Mental Health Hotline" 
          description="Join Mantra's Mental Health Support Hotline and help provide compassionate emotional support while gaining valuable counselling experience." 
          duration="2 min"
          points={REWARD_POINTS}
        />

        <InfoCallout 
          type="info" 
          title="About the Hotline" 
          text="The MantraCare Support Hotline is a free, confidential service offering immediate emotional support to individuals experiencing distress, anxiety, or isolation."
        />

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px' }}>Your Responsibilities</h2>
          <FeatureGrid features={WHAT_YOU_DO} />
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px' }}>Benefits of Joining</h2>
          <div className="academy-grid-2">
            {BENEFITS.map((b, idx) => (
              <BenefitCard key={idx} icon={b.icon} title={b.title} description={b.description} />
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px' }}>Onboarding Process</h2>
          <StepTimeline steps={TIMELINE} />
        </section>

        <section>
          <InterestForm 
            initiative="Support Hotline" 
            onSuccess={handleActionComplete} 
            title="Apply to be a Responder"
            description="Complete this form to express your interest in joining the hotline team."
          />
        </section>

      </main>

      {showCelebrate && (
        <CompletionScreen points={REWARD_POINTS} title="Activity Complete!" subtitle="You have successfully finished this task." onClose={handleCloseCelebration} />
      )}
    </div>
  );
}
