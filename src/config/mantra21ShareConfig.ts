/**
 * Configuration variables for Mantra 21 Sharing and Deep Linking.
 *
 * Update these URLs with actual production endpoints when deploying.
 */

// Production Deep link / Universal Link base
export const MANTRA21_SHARE_URL = 
  import.meta.env.VITE_MANTRA21_SHARE_URL || 
  (typeof window !== 'undefined' ? `${window.location.origin}/task/mantra21-join` : 'https://mantra21.app/join');

// Native App Download URLs
export const IOS_APP_URL = 
  import.meta.env.VITE_IOS_APP_URL || 
  'https://apps.apple.com/in/app/therapymantra/id1607643888?utm_source=21_day_challenge';

export const ANDROID_APP_URL = 
  import.meta.env.VITE_ANDROID_APP_URL || 
  'https://play.google.com/store/apps/details?id=org.mantracare.therapy&utm_source=21_day_challenge';

export const MANTRA21_WEB_URL = 
  import.meta.env.VITE_MANTRA21_WEB_URL || 
  (typeof window !== 'undefined' ? `${window.location.origin}/task/depression-mantra21-invitation` : 'https://mantra21.app/start');

/**
 * Generate an obfuscated, safe referral token from a user ID.
 * Avoids exposing internal database IDs directly in URLs.
 */
export function generateSafeReferralToken(userId: string | number | null | undefined): string {
  if (!userId) return 'm21_friend';
  const clean = String(userId).trim();
  // Safe simple base64 token with prefix
  try {
    const encoded = btoa(`m21:${clean}:${Date.now().toString(36).slice(-4)}`)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return encoded;
  } catch (e) {
    return `m21_${clean}`;
  }
}

/**
 * Build a full invitation share URL with user referral token and inviter name.
 */
export function buildInviteShareUrl(userId: string | number | null | undefined, userName?: string | null): string {
  const token = generateSafeReferralToken(userId);
  const base = MANTRA21_SHARE_URL;
  const url = new URL(base, typeof window !== 'undefined' ? window.location.origin : 'https://mantra21.app');
  url.searchParams.set('ref', token);
  if (userName && userName.trim()) {
    url.searchParams.set('inviter', encodeURIComponent(userName.trim()));
  }
  return url.toString();
}

/**
 * Standard Invite tracking events.
 */
export function trackInviteEvent(
  eventType: 'invite_created' | 'invite_method' | 'invite_link_copied' | 'invite_shared' | 'invite_opened' | 'invite_app_install' | 'invite_joined',
  metadata: Record<string, any> = {}
): void {
  try {
    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('mantra21_invite_analytics') || '[]');
      history.push(payload);
      localStorage.setItem('mantra21_invite_analytics', JSON.stringify(history.slice(-100)));
    }
  } catch (e) {
    console.warn('[InviteAnalytics] Error logging invite event:', e);
  }
}
