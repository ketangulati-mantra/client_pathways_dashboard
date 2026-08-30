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
    window.location.hash = '#/admin/pathways';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
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
 * Navigates popstate router to the selected task route pathway within the app,
 * preserving query parameters.
 */
export const goToLesson = (route: string) => {
  if (typeof window === 'undefined') return;

  const currentPathname = window.location.pathname;
  const subpathMatch = currentPathname.match(/^(\/[^\/]+)/);
  const currentSubpath =
    subpathMatch && subpathMatch[1] && !subpathMatch[1].startsWith('/task')
      ? subpathMatch[1]
      : '';

  const fullPath =
    route === '/'
      ? currentSubpath || '/'
      : (currentSubpath + route).replace('//', '/');
  const targetUrl = preserveQueryParams(fullPath);

  window.history.replaceState(null, '', targetUrl);
  window.dispatchEvent(new Event('popstate'));
};

/**
 * Controls completion redirection actions.
 */
export const redirectAfterCompletion = (lessonId: string, onBackCallback?: () => void) => {
  goBack(onBackCallback);
};
