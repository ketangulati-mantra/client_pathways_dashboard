import React from 'react';
import LessonTemplate from './LessonTemplate';
import DeveloperLessonsPage from './DeveloperLessonsPage';
import IntroductionLessonPage from './IntroductionLessonPage';
import AdminLoginPage from './AdminLoginPage';
import { ProtectedRoute } from '../auth/ProtectedRoute';

/**
 * Route-to-Component registry for User Pathways.
 * Maps route paths to user pathway component implementations.
 */
const ROUTE_VIEW_REGISTRY = {
  '/': { default: (props) => <ProtectedRoute><DeveloperLessonsPage {...props} /></ProtectedRoute> },
  '/user_pathways': { default: (props) => <ProtectedRoute><DeveloperLessonsPage {...props} /></ProtectedRoute> },
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
      normalizedPath === `/task/${actRoute.replace(/^\/task\//, '')}`
    );
  });

  if (matchingActivity) {
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
