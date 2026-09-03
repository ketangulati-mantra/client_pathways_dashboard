import { getActiveUserId } from './authService';

export interface CheckInTodayState {
  hasCheckedIn: boolean;
  checkIns: any[];
  latestCheckIn: any | null;
}

export interface CheckInStreakState {
  current: number;
  longest: number;
  completedToday: boolean;
  totalCheckInDays: number;
  lastCompletedDate: string | null;
  nextMilestone: number | null;
  daysUntilNextMilestone: number | null;
  progressToNextMilestone: {
    current: number;
    target: number;
  } | null;
}

export interface CheckInState {
  today: CheckInTodayState;
  streak: CheckInStreakState;
}

export function getUserClientTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    return 'UTC';
  }
}

function getApiUrl(endpoint: string): string {
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (isLocalhost && window.location.port === '5173') {
      return `http://localhost:5001${endpoint}`;
    }
  }
  return endpoint;
}

/**
 * Event bus for instant global notification across all active React components on check-in mutations.
 */
export function invalidateCheckInState(userId?: string) {
  if (typeof window === 'undefined') return;
  const targetUserId = userId || getActiveUserId();
  window.dispatchEvent(new CustomEvent('check-in-state-invalidated', {
    detail: { userId: targetUserId, timestamp: Date.now() }
  }));
}

export function subscribeToCheckInStateUpdates(callback: (detail: any) => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: any) => callback(e.detail);
  window.addEventListener('check-in-state-invalidated', handler);
  return () => window.removeEventListener('check-in-state-invalidated', handler);
}

/**
 * Centralized Daily Check-in SDK
 */
export const dailyCheckInService = {
  /**
   * Fetches canonical check-in state for a user (side-effect free, timezone aware).
   */
  async getCheckInState(userId?: string, timezone?: string): Promise<CheckInState> {
    const targetUserId = userId || getActiveUserId();
    const targetTz = timezone || getUserClientTimezone();
    const url = getApiUrl(`/api/users/${targetUserId}/check-in-state?timezone=${encodeURIComponent(targetTz)}`);

    try {
      const res = await fetch(url, {
        headers: { 'x-timezone': targetTz }
      });
      const json = await res.json().catch(() => null);
      if (json?.success && json?.data) {
        return json.data;
      }

      // Fallback relative url
      const fallbackRes = await fetch(`/api/activities/check-in-state/${targetUserId}?timezone=${encodeURIComponent(targetTz)}`);
      const fallbackJson = await fallbackRes.json().catch(() => null);
      if (fallbackJson?.success && fallbackJson?.data) {
        return fallbackJson.data;
      }

      return {
        today: { hasCheckedIn: false, checkIns: [], latestCheckIn: null },
        streak: {
          current: 0,
          longest: 0,
          completedToday: false,
          totalCheckInDays: 0,
          lastCompletedDate: null,
          nextMilestone: 3,
          daysUntilNextMilestone: 3,
          progressToNextMilestone: { current: 0, target: 3 }
        }
      };
    } catch (error) {
      console.warn('[dailyCheckInService] Failed to load check-in state:', error);
      return {
        today: { hasCheckedIn: false, checkIns: [], latestCheckIn: null },
        streak: {
          current: 0,
          longest: 0,
          completedToday: false,
          totalCheckInDays: 0,
          lastCompletedDate: null,
          nextMilestone: 3,
          daysUntilNextMilestone: 3,
          progressToNextMilestone: { current: 0, target: 3 }
        }
      };
    }
  },

  /**
   * Creates and persists a daily check-in through the centralized API.
   */
  async createCheckIn(payload: any) {
    const targetUserId = payload.userId || getActiveUserId();
    const targetTz = payload.timezone || getUserClientTimezone();

    const body = {
      userId: targetUserId,
      activityId: payload.activityId || 'daily-check-in',
      activityType: payload.activityType || 'daily_check_in',
      lessonId: payload.lessonId || null,
      service: payload.service || 'mental_wellness',
      emotionZone: payload.emotionZone || null,
      primaryEmotion: payload.primaryEmotion,
      additionalEmotions: payload.additionalEmotions || [],
      intensity: payload.intensity || 3,
      contexts: payload.contexts || [],
      reflection: payload.reflection || '',
      resultSummary: payload.resultSummary || {},
      recommendation: payload.recommendation || {},
      rewardPoints: payload.rewardPoints || 10,
      metadata: payload.metadata || {},
      timezone: targetTz
    };

    const url = getApiUrl('/api/activities/check-in');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-timezone': targetTz
      },
      body: JSON.stringify(body)
    });

    const json = await res.json().catch(() => null);

    // Invalidate state globally
    invalidateCheckInState(targetUserId);

    return json;
  },

  /**
   * Deletes one or all of today's check-ins and recalculates streaks.
   */
  async deleteCheckIn(checkInId?: string | number, userId?: string) {
    const targetUserId = userId || getActiveUserId();
    const targetTz = getUserClientTimezone();
    const url = getApiUrl(`/api/users/${targetUserId}/check-in${checkInId ? `/${checkInId}` : ''}?timezone=${encodeURIComponent(targetTz)}`);

    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'x-timezone': targetTz }
    });
    const json = await res.json().catch(() => null);

    // Invalidate state globally
    invalidateCheckInState(targetUserId);

    return json;
  }
};
