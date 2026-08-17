import React, { useState, useEffect } from 'react';
import { 
  Header, 
  OverviewCard, 
  VideoSection, 
  InfoCard, 
  ExpandableCard, 
  Checklist, 
  Timeline, 
  ScenarioCard, 
  QuizCard, 
  CompletionScreen,
  Button
} from '../components';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { 
  Award, 
  Sparkles, 
  Compass, 
  Lightbulb, 
  HelpCircle,
  Play,
  Loader2,
  ShieldCheck,
  Server
} from 'lucide-react';

export default function LessonTemplate({ 
  lesson, 
  onBack 
}) {
  const hasVideo = !!lesson.video;
  const hasChecklist = !!lesson.checklist && lesson.checklist.length > 0;
  const hasScenario = !!lesson.scenario;
  const hasQuiz = !!lesson.quiz;

  const {
    videoWatched,
    quizDone,
    checklistDone,
    isCompleted,
    lessonProgress,
    showCelebrate,
    handleVideoComplete,
    handleQuizComplete,
    handleChecklistComplete,
    handleScenarioComplete,
    handleCloseCelebration
  } = useLessonCompletion(lesson.id, onBack, {
    hasVideo,
    hasQuiz,
    hasChecklist,
    hasScenario
  });

  const handleChecklistChange = (checkedIds, totalItems) => {
    const allChecked = checkedIds.length === totalItems;
    handleChecklistComplete(allChecked);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }} className="animate-fade-in">
      {/* Dynamic Header */}
      <Header 
        title={lesson.title} 
        onBack={onBack} 
        progress={lessonProgress}
        points={lesson.points}
        isCompleted={isCompleted}
      />

      {/* Lesson Content Container */}
      <main className="academy-main-container" style={{
        flex: 1,
        padding: '28px 24px 60px',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {isCompleted && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={22} color="#059669" />
              <div>
                <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.9rem' }}>Activity Already Completed</div>
                <div style={{ color: '#047857', fontSize: '0.78rem' }}>You have completed this lesson. Your reward points have been awarded.</div>
              </div>
            </div>
            <span style={{ background: '#059669', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
              Verified
            </span>
          </div>
        )}

        {/* Lesson Description Card */}
        <OverviewCard 
          description={lesson.description}
          duration={lesson.duration}
          points={lesson.points}
        />

        {/* Video Section Component */}
        {hasVideo && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎥</span> Video Tutorial
            </h3>
            <VideoSection 
              title={lesson.video.title}
              duration={lesson.video.duration}
              posterUrl={lesson.video.posterUrl}
              videoUrl={lesson.video.videoUrl}
              onCompleted={handleVideoComplete}
              isCompleted={videoWatched}
            />
          </section>
        )}

        {/* Timeline roadmap component */}
        {lesson.timelineSteps && lesson.timelineSteps.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🗺️</span> Growth Roadmap
            </h3>
            <div className="academy-card">
              <Timeline 
                steps={lesson.timelineSteps}
                currentStepIndex={videoWatched ? 1 : 0}
              />
            </div>
          </section>
        )}

        {/* Info Cards / Core Reading Section */}
        {lesson.infoCards && lesson.infoCards.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💡</span> Key Concepts
            </h3>
            <div className="academy-info-grid">
              {lesson.infoCards.map((card, idx) => (
                <InfoCard 
                  key={idx}
                  title={card.title}
                  description={card.description}
                  icon={card.icon || Lightbulb}
                />
              ))}
            </div>
          </section>
        )}

        {/* Interactive Accordion List */}
        {lesson.accordionGuides && lesson.accordionGuides.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📖</span> Step-by-Step Guides
            </h3>
            <div>
              {lesson.accordionGuides.map((guide, idx) => (
                <ExpandableCard 
                  key={idx}
                  title={guide.title}
                  isOpenDefault={idx === 0}
                >
                  <p style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>{guide.content}</p>
                </ExpandableCard>
              ))}
            </div>
          </section>
        )}

        {/* Horizontal split layout for Checklist + Timeline if both exist */}
        {hasChecklist && hasScenario === false && hasQuiz === false && (
          <section className="academy-flex-row" style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 2 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span> Actionable Checklist
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Check all items below to complete this section of the lesson.
              </p>
              <Checklist 
                items={lesson.checklist}
                onChange={handleChecklistChange}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span>📍</span> Lesson Progress
              </h3>
              <Timeline 
                steps={lesson.timelineSteps}
                currentStepIndex={videoWatched ? 1 : 0}
              />
            </div>
          </section>
        )}

        {/* Scenario Card Component */}
        {hasScenario && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎭</span> Quick Practice Simulation
            </h3>
            <ScenarioCard 
              scenario={lesson.scenario.prompt}
              options={lesson.scenario.options}
              onSelect={handleScenarioComplete}
            />
          </section>
        )}

        {/* Quiz Component Card */}
        {hasQuiz && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📝</span> Final Quiz Check
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'left', marginBottom: '4px' }}>
              Select the correct answer and submit to earn your lesson points.
            </p>
             <QuizCard 
              id={lesson.id}
              question={lesson.quiz.question}
              options={lesson.quiz.options}
              questions={lesson.quiz.questions}
              onSubmitQuiz={handleQuizComplete}
              onComplete={handleQuizComplete}
              hasVideo={hasVideo}
              videoWatched={videoWatched}
            />
          </section>
        )}

      </main>

      {/* Completion Overlay Screen */}
      {showCelebrate && (
        <CompletionScreen 
          points={lesson.points}
          title="Lesson Completed!"
          subtitle={`You successfully finished "${lesson.title}" and boosted your ranking score.`}
          onClose={handleCloseCelebration}
        />
      )}
    </div>
  );
}
