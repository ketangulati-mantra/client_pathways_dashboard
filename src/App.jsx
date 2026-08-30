import React, { useState, useEffect } from 'react';
import './App.css';
import { getCurrentService, getAvailableActivities, preserveQueryParams, handleExit } from './mantra';
import { resolveLessonView } from './views/viewResolver';
import DeveloperLessonsPage from './views/DeveloperLessonsPage';
import IntroductionLessonPage from './views/IntroductionLessonPage';
import AdminLoginPage from './views/AdminLoginPage';
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

      // Priority 1: Check window.location.hash for SPA client routes e.g. #/admin/dashboard, #/admin, #/task/introduction
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

    if (p && !p.startsWith('/task/') && !p.startsWith('/admin') && p !== '/' && p !== '/provider_activity') {
      return `/task${p.startsWith('/') ? p : '/' + p}`;
    }

    return p || '/';
  };

  const [currentPath, setCurrentPath] = useState(getPath());

  // Current service context extracted once at startup via URL parameter (e.g. ?service=therapy)
  const currentService = getCurrentService();

  // Clean up legacy 'source=' query parameter to standard 'service=' on startup
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('source=')) {
      const params = new URLSearchParams(window.location.search);
      const sourceVal = params.get('source');
      if (sourceVal && !params.has('service')) {
        params.set('service', sourceVal);
      }
      params.delete('source');
      const cleanSearch = params.toString();
      const newUrl = window.location.pathname + (cleanSearch ? `?${cleanSearch}` : '') + window.location.hash;
      window.history.replaceState(null, '', newUrl);
    }
  }, []);

  // Custom router state listener
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getPath());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (path) => {
    const p = window.location.pathname;
    const subpathMatch = p.match(/^(\/[^\/]+)/);
    const currentSubpath = (subpathMatch && subpathMatch[1] && !subpathMatch[1].startsWith('/task')) ? subpathMatch[1] : '';
    const activeBase = envBase || currentSubpath;
    const fullPath = path === '/' ? (activeBase || '/') : ((activeBase + path).replace('//', '/'));
    const targetUrl = preserveQueryParams(fullPath);
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mantra_last_path', path);
      if (path && path !== '/' && !path.startsWith('/admin')) {
        window.location.hash = `#${path}`;
      } else {
        window.history.replaceState(null, '', targetUrl);
      }
    } else {
      window.history.replaceState(null, '', targetUrl);
    }
    
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get activities filtered for the current service context
  const availableActivities = getAvailableActivities(currentService);

  // Render view based on route path and service context
  const renderView = () => {
    const onBackCallback = () => { if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) { navigate('/admin/pathways'); return; } handleExit(); };

    // 1. Home Screen / Admin Dashboard Base Routes
    if (currentPath === '/admin/login') {
      return <AdminLoginPage />;
    }

    if (
      currentPath === '/' || 
      currentPath === '/provider_activity' || 
      currentPath === '/admin' || 
      currentPath === '/admin/dashboard' || 
      currentPath === '/admin/users' || 
      currentPath === '/admin/pathways' || 
      currentPath === '/dev'
    ) {
      return <DeveloperLessonsPage onNavigate={navigate} />;
    }

    // 2. Try to resolve specific activity/lesson view
    const resolvedView = resolveLessonView({
      currentPath,
      currentService,
      onBack: onBackCallback,
      activities: availableActivities
    });

    if (resolvedView) {
      return resolvedView;
    }

    // 3. OCD Service Context Fallback -> OcdCertificatePage
    if (currentService === 'ocd' || currentService === 'ocdmantra' || currentService === 'ocd_mantra') {
      return <OcdCertificatePage onBack={onBackCallback} />;
    }

    // 4. Default Fallback -> DeveloperLessonsPage (Home Screen / Admin Dashboard)
    return <DeveloperLessonsPage onNavigate={navigate} />;
  };

  return (
    <ErrorBoundary>
      <div className="App" style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
        {renderView()}
      </div>
    </ErrorBoundary>
  );
}

export default App;
