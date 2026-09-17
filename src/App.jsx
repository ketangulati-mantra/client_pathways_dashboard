import React, { useState, useEffect } from 'react';
import './App.css';
import { getCurrentService, getAvailableActivities, preserveQueryParams, handleExit } from './mantra';
import { resolveLessonView } from './views/viewResolver';
import DeveloperLessonsPage from './views/DeveloperLessonsPage';
import IntroductionLessonPage from './views/IntroductionLessonPage';
import AdminLoginPage from './views/AdminLoginPage';
import DailyCheckInPage from './views/DailyCheckInPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  // Dynamic base path support for root (Vercel/local) or subfolder (/provider_pathways) deployments
  const envBase = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

  const getPath = () => {
    if (typeof window !== 'undefined') {
      const fullHref = window.location.href.toLowerCase();
      
      // Immediate resolution if OCD Certificate is in URL, search params, or hash
      if (
        fullHref.includes('ocd-certificate') || 
        fullHref.includes('ocd_certificate') || 
        fullHref.includes('ocd-provider-certificate') || 
        fullHref.includes('ocd_provider_certificate') || 
        fullHref.includes('download-ocd-certificate') || 
        fullHref.includes('download_ocd_certificate') || 
        (fullHref.includes('ocd') && fullHref.includes('cert'))
      ) {
        return '/task/ocd-certificate';
      }

      // Priority 0: Check URL query parameters for task/lesson/activity passed by phone apps
      const searchParams = new URLSearchParams(window.location.search);
      const paramTask = searchParams.get('task') || 
                        searchParams.get('lesson_id') || 
                        searchParams.get('lessonId') || 
                        searchParams.get('lesson') || 
                        searchParams.get('activity') || 
                        searchParams.get('activityId') || 
                        searchParams.get('id') || 
                        searchParams.get('path') || 
                        searchParams.get('route') || 
                        searchParams.get('page') || 
                        searchParams.get('view') || 
                        searchParams.get('name') || 
                        searchParams.get('action');
      if (paramTask) {
        const cleanTask = paramTask.startsWith('/') ? paramTask : `/task/${paramTask}`;
        return cleanTask.split('?')[0];
      }

      // Priority 1: Check window.location.hash for SPA client routes e.g. #/admin/dashboard, #/admin, #/task/daily-check-in
      if (window.location.hash) {
        const rawHash = window.location.hash.replace(/^#\/?/, '');
        if (rawHash) {
          const pathOnly = rawHash.split('?')[0];
          if (pathOnly.startsWith('admin') || pathOnly.startsWith('dev')) {
            return `/${pathOnly}`;
          }
          const cleanPath = pathOnly.startsWith('task/') ? `/${pathOnly}` : (pathOnly.startsWith('/') ? pathOnly : `/task/${pathOnly}`);
          if (cleanPath.startsWith('/task/') || cleanPath.startsWith('/admin') || cleanPath.length > 1) {
            return cleanPath;
          }
        }
      }
    }

    let p = window.location.pathname;
    const base = envBase ? envBase.replace(/\/$/, '') : '';

    const knownPrefixes = [
      base,
      '/app/content/provider_pathways',
      '/provider_activity/app/content',
      '/app/content',
      '/client_tasks',
      '/client-tasks',
      '/provider_pathways_dashboard_v3',
      '/provider_pathways_dashboard_v2',
      '/provider_dashboard_v1',
      '/provider_pathways_dashboard_v1',
      '/provider_pathways_v2_testing',
      '/provider_pathways',
      '/provider_pathway',
      '/provider_activity'
    ].filter(Boolean);

    let changed = true;
    while (changed) {
      changed = false;
      for (const prefix of knownPrefixes) {
        if (prefix !== '/' && p.startsWith(prefix)) {
          p = p.slice(prefix.length) || '/';
          changed = true;
          break;
        }
      }
    }

    // Direct clean pathname routing (e.g. /task/fear-ladder, /admin/pathways, /task/emotional-wellbeing-assessment)
    if (p && p !== '/' && p !== '') {
      const cleanP = p.startsWith('/') ? p : `/${p}`;
      return cleanP;
    }

    // Default root path opens Daily Check-In for standard users
    return '/task/daily-check-in';
  };

  const [currentPath, setCurrentPath] = useState(getPath());
  const [currentService, setCurrentService] = useState('therapy');
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // 1. Service Context Detection
    const service = getCurrentService();
    setCurrentService(service);

    // 2. Load Activities Catalog
    const acts = getAvailableActivities();
    setActivities(acts);

    // 3. Listen to browser history changes
    const handlePopState = () => {
      setCurrentPath(getPath());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (newPath) => {
    let finalPath = newPath;
    if (newPath === '/' || !newPath) {
      finalPath = '/task/daily-check-in';
    }
    window.history.pushState({}, '', finalPath);
    setCurrentPath(finalPath);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    handleExit();
  };

  const renderView = () => {
    // Explicit Admin/Developer routes
    if (currentPath === '/admin/login') {
      return <AdminLoginPage onNavigate={navigate} />;
    }
    if (
      currentPath.startsWith('/admin') ||
      currentPath === '/dev' ||
      currentPath === '/developer'
    ) {
      return <DeveloperLessonsPage onNavigate={navigate} />;
    }

    // Resolve lesson or task view
    const view = resolveLessonView({
      currentPath,
      currentService,
      onBack: handleBack,
      onNavigate: navigate,
      activities
    });

    if (view) {
      return view;
    }

    // Fallback if path didn't resolve to a specific activity: render Daily Check-In
    return <DailyCheckInPage onBack={handleBack} service={currentService} />;
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        {renderView()}
      </div>
    </ErrorBoundary>
  );
}

export default App;
