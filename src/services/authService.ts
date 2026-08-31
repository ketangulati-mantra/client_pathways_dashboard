/**
 * User ID Extraction & Session Service
 * Extracts user ID from URL params (uid, user_id, userId, token, upa_id), cookies, or localStorage/sessionStorage.
 * Defaults to sample user ID '234306' on localhost / local development.
 */

const DEFAULT_SAMPLE_USER_ID = '234306';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function extractAndInitializeUserId(): string {
  if (typeof window === 'undefined') return DEFAULT_SAMPLE_USER_ID;

  try {
    const isLocalhost = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' || 
      window.location.hostname.includes('192.168.');

    const urlParams = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes('?') 
      ? new URLSearchParams(window.location.hash.split('?')[1]) 
      : null;

    // 1. Explicit URL parameter (highest priority)
    const urlUserId = 
      urlParams.get('uid') ||
      urlParams.get('userId') ||
      urlParams.get('user_id') ||
      urlParams.get('upa_id') ||
      (hashQuery ? (hashQuery.get('uid') || hashQuery.get('userId') || hashQuery.get('user_id')) : null);

    if (urlUserId && urlUserId.trim() !== '') {
      setCookie('user_id', urlUserId);
      localStorage.setItem('user_id', urlUserId);
      sessionStorage.setItem('user_id', urlUserId);
      return urlUserId;
    }

    // 2. On Localhost, enforce the requested sample user ID 234306
    if (isLocalhost) {
      const existing = getCookie('user_id') || localStorage.getItem('user_id');
      // If the existing cookie was an email or invalid, reset to 234306
      if (!existing || existing.includes('@') || isNaN(Number(existing))) {
        setCookie('user_id', DEFAULT_SAMPLE_USER_ID);
        localStorage.setItem('user_id', DEFAULT_SAMPLE_USER_ID);
        return DEFAULT_SAMPLE_USER_ID;
      }
      return existing;
    }

    // 3. Check cookies
    const cookieUserId = getCookie('user_id');
    if (cookieUserId && !cookieUserId.includes('@')) {
      localStorage.setItem('user_id', cookieUserId);
      return cookieUserId;
    }

    // 4. Check local / session storage
    const storageUserId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
    if (storageUserId && !storageUserId.includes('@')) {
      setCookie('user_id', storageUserId);
      return storageUserId;
    }

    // 5. Default fallback
    setCookie('user_id', DEFAULT_SAMPLE_USER_ID);
    localStorage.setItem('user_id', DEFAULT_SAMPLE_USER_ID);
    return DEFAULT_SAMPLE_USER_ID;

  } catch (e) {
    console.warn('[AuthService] Error extracting user ID, using default sample ID:', e);
    return DEFAULT_SAMPLE_USER_ID;
  }
}

export function getActiveUserId(): string {
  return extractAndInitializeUserId();
}
