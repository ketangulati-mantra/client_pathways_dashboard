import { MANTRA_CONFIG } from './config';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * Centrally preserves all active URL query parameters (service, upa_id, uid, locale, etc.)
 * when navigating to a new path or route.
 */
export const preserveQueryParams = (targetPath: string): string => {
  if (typeof window === 'undefined' || !window.location) {
    return targetPath;
  }

  const [pathname, targetQuery] = targetPath.split('?');
  const currentParams = new URLSearchParams(window.location.search || '');

  // Normalize legacy 'source' param to 'service'
  if (currentParams.has('source')) {
    const val = currentParams.get('source');
    if (val && !currentParams.has('service')) {
      currentParams.set('service', val);
    }
    currentParams.delete('source');
  }

  // Fallback to cached upa_id and uid if missing from current search
  if (!currentParams.has('upa_id')) {
    try {
      const cachedUpa = sessionStorage.getItem('upa_id');
      if (cachedUpa) currentParams.set('upa_id', cachedUpa);
    } catch (e) {}
  }
  if (!currentParams.has('uid') && !currentParams.has('user_id')) {
    try {
      const cachedUid = sessionStorage.getItem('uid') || sessionStorage.getItem('user_id');
      if (cachedUid) currentParams.set('uid', cachedUid);
    } catch (e) {}
  }

  if (targetQuery) {
    const targetParams = new URLSearchParams(targetQuery);
    targetParams.forEach((value, key) => {
      if (key === 'source') {
        currentParams.set('service', value);
      } else {
        currentParams.set(key, value);
      }
    });
  }

  const mergedSearch = currentParams.toString();
  return mergedSearch ? `${pathname}?${mergedSearch}` : pathname;
};

/**
 * Centrally detects execution context and handles exit / back actions across all 3 contexts:
 * 1. React Native WebView -> window.ReactNativeWebView.postMessage
 * 2. iframe inside web.mantracare.com -> window.parent.postMessage
 * 3. Standalone browser -> window.location.href = "https://web.mantracare.com"
 */
export function handleExit() {
  if (typeof window === 'undefined') return;

  // 1. React Native WebView
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        action: 'exit'
      })
    );
    return;
  }

  // 2. iframe inside web.mantracare.com
  if (window.parent !== window) {
    window.parent.postMessage(
      {
        action: 'exit'
      },
      'https://web.mantracare.com'
    );
    return;
  }

  // Localhost dev environment fallback
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.history.pushState({}, '', '/admin/pathways');
    window.dispatchEvent(new Event('popstate'));
    return;
  }

  // 3. Standalone browser
  window.location.href = 'https://web.mantracare.com/tasks';
}

/**
 * Navigates to a specific screen inside the native React Native app
 */
export function navigateToNativeScreen(
  screen: string = 'Tasks',
  params: Record<string, any> = { page: '/tasks' }
) {
  if (typeof window === 'undefined') return;
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        action: 'navigate',
        screen,
        params
      })
    );
  }
}

/**
 * Handles back routing, delegating to onBackCallback or handleExit.
 */
export const goBack = (onBackCallback?: () => void) => {
  if (onBackCallback) {
    onBackCallback();
  } else {
    handleExit();
  }
};

/**
 * Redirects back to Dashboard / Exit.
 */
export const goToDashboard = () => {
  handleExit();
};

/**
 * Detects the active deployment subpath prefix (e.g. '/client_tasks', '/app/content', etc.)
 */
export const getDeploymentSubpath = (): string => {
  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname;
  const knownPrefixes = [
    '/client_tasks',
    '/client-tasks',
    '/app/content/provider_pathways',
    '/app/content',
  ];
  for (const prefix of knownPrefixes) {
    if (pathname.startsWith(prefix)) {
      return prefix;
    }
  }
  const match = pathname.match(/^(\/[^\/]+)/);
  if (match && match[1] && !match[1].startsWith('/task') && !match[1].startsWith('/admin') && !match[1].startsWith('/dev')) {
    return match[1];
  }
  return '';
};

/**
 * Navigates popstate router to the selected task route pathway within the app,
 * preserving query parameters and deployment subpath prefix.
 */
export const goToLesson = (route: string) => {
  if (typeof window === 'undefined') return;

  const currentSubpath = getDeploymentSubpath();
  const cleanRoute = route.startsWith('/') ? route : `/${route}`;
  const fullPath =
    cleanRoute === '/'
      ? currentSubpath || '/'
      : `${currentSubpath}${cleanRoute}`.replace(/\/+/g, '/');
  const targetUrl = preserveQueryParams(fullPath);

  window.history.replaceState(null, '', targetUrl);
  window.dispatchEvent(new Event('popstate'));
};

/**
 * Centrally completes an activity via the completion webhook and then invokes exit/back navigation.
 */
export const completeAndExit = async (lessonId: string, onBackCallback?: () => void) => {
  try {
    const { completeLesson } = await import('./api');
    await completeLesson(lessonId);
  } catch (error) {
    console.warn('[Mantra Navigation] Activity completion warning:', error);
  }
  goBack(onBackCallback);
};

/**
 * Controls completion redirection actions.
 * First hits the activity completion webhook and then uses the back button exit logic.
 */
export const redirectAfterCompletion = async (lessonId: string, onBackCallback?: () => void) => {
  await completeAndExit(lessonId, onBackCallback);
};

