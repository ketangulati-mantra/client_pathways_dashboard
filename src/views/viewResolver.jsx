import React from 'react';
import LessonTemplate from './LessonTemplate';
import DeveloperLessonsPage from './DeveloperLessonsPage';
import IntroductionLessonPage from './IntroductionLessonPage';
import GettingStartedActivity from './GettingStartedActivity';
import FirstTherapySessionActivity from './FirstTherapySessionActivity';
import EmotionalWellbeingAssessmentPage from './EmotionalWellbeingAssessmentPage';
import HowCanTherapyHelpLessonPage from './HowCanTherapyHelpLessonPage';
import EarnWhileYouImproveLessonPage from './EarnWhileYouImproveLessonPage';
import AdminLoginPage from './AdminLoginPage';
import { ProtectedRoute } from '../auth/ProtectedRoute';

/**
 * Route-to-Component registry for User Pathways.
 * Maps route paths to user pathway component implementations.
 */
const ROUTE_VIEW_REGISTRY = {
  '/': { default: (props) => <ProtectedRoute><DeveloperLessonsPage {...props} /></ProtectedRoute> },
  '/user_pathways': { default: (props) => <ProtectedRoute><DeveloperLessonsPage {...props} /></ProtectedRoute> },
  '/task/getting-started': { default: GettingStartedActivity },
  '/task/getting_started': { default: GettingStartedActivity },
  '/task/first-therapy-session': { default: FirstTherapySessionActivity },
  '/task/first_therapy_session': { default: FirstTherapySessionActivity },
  '/task/activity-02': { default: FirstTherapySessionActivity },
  '/task/emotional-wellbeing-assessment': { default: EmotionalWellbeingAssessmentPage },
  '/task/emotional_wellbeing_assessment': { default: EmotionalWellbeingAssessmentPage },
  '/emotional-wellbeing-assessment': { default: EmotionalWellbeingAssessmentPage },
  '/task/how-can-therapy-help': { default: HowCanTherapyHelpLessonPage },
  '/task/how_can_therapy_help': { default: HowCanTherapyHelpLessonPage },
  '/how-can-therapy-help': { default: HowCanTherapyHelpLessonPage },
  '/task/earn-while-you-improve-your-wellbeing': { default: EarnWhileYouImproveLessonPage },
  '/task/earn_while_you_improve_your_wellbeing': { default: EarnWhileYouImproveLessonPage },
  '/earn-while-you-improve-your-wellbeing': { default: EarnWhileYouImproveLessonPage },
  '/task/earn-while-you-improve': { default: EarnWhileYouImproveLessonPage },
  '/task/earn_while_you_improve': { default: EarnWhileYouImproveLessonPage },
  '/earn-while-you-improve': { default: EarnWhileYouImproveLessonPage },
  '/task/introduction': { default: IntroductionLessonPage },
  '/admin/login': { default: AdminLoginPage },
  '/admin/dashboard': { default: (props) => <ProtectedRoute><DeveloperLessonsPage {...props} /></ProtectedRoute> },
  '/admin/pathways': { default: (props) => <ProtectedRoute><DeveloperLessonsPage {...props} /></ProtectedRoute> },
  '/admin/users': { default: (props) => <ProtectedRoute requireSuperAdmin><DeveloperLessonsPage {...props} /></ProtectedRoute> },
  '/admin': { default: (props) => <ProtectedRoute><DeveloperLessonsPage {...props} /></ProtectedRoute> }
};

/**
 * Resolves appropriate React view component for a given path and service context.
 */
export function resolveLessonView({ currentPath, currentService, onBack, activities = [] }) {
  if (!currentPath) return null;

  // Clean path format
  const normalizedPath = currentPath.toLowerCase().trim();

  // 1. Direct registry lookup
  const registered = ROUTE_VIEW_REGISTRY[normalizedPath];
  if (registered) {
    const Component = registered[currentService] || registered.default;
    if (Component) {
      return <Component onBack={onBack} service={currentService} />;
    }
  }

  // 2. Activity catalog matching
  const matchingActivity = activities.find((act) => {
    if (!act) return false;
    const actRoute = (act.route || '').toLowerCase().trim();
    const actLessonId = (act.lessonId || '').toLowerCase().trim();
    
    return (
      normalizedPath === actRoute ||
      normalizedPath === `/task/${actLessonId}` ||
      normalizedPath === `/${actLessonId}`
    );
  });

  if (matchingActivity) {
    if (matchingActivity.lessonId === 'getting-started') {
      return <GettingStartedActivity onBack={onBack} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'first-therapy-session' || matchingActivity.lessonId === 'first_therapy_session') {
      return <FirstTherapySessionActivity onBack={onBack} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'emotional-wellbeing-assessment' || matchingActivity.lessonId === 'emotional_wellbeing_assessment') {
      return <EmotionalWellbeingAssessmentPage onBack={onBack} service={currentService} />;
    }

    if (matchingActivity.lessonId === 'how-can-therapy-help' || matchingActivity.lessonId === 'how_can_therapy_help') {
      return <HowCanTherapyHelpLessonPage onBack={onBack} service={currentService} />;
    }

    return (
      <LessonTemplate
        onBack={onBack}
        service={currentService}
        activity={matchingActivity}
      />
    );
  }

  return null;
}
