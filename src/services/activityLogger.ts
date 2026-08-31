import { getActiveUserId } from './authService';

export interface ActivityLogPayload {
  userId?: string;
  activityId?: string;
  activityType?: string;
  lessonId?: string;
  service?: string;
  emotionZone?: string;
  primaryEmotion?: string;
  additionalEmotions?: string[];
  intensity?: number;
  contexts?: string[];
  reflection?: string;
  resultSummary?: any;
  recommendation?: any;
  rewardPoints?: number;
  metadata?: any;
  timezone?: string;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  totalCheckInDays: number;
  completedToday: boolean;
  lastCompletedDate: string | null;
  nextMilestone: number | null;
  daysUntilNextMilestone: number | null;
  progressToNextMilestone: {
    current: number;
    target: number;
  } | null;
  newMilestoneAchieved: {
    milestone: number;
    achievedAt: string;
  } | null;
}

/**
 * Standard Activity IDs mapped across the platform
 */
export const PLATFORM_ACTIVITIES = {
  DAILY_CHECK_IN: 'daily-check-in',
  FIRST_THERAPY_SESSION: 'first-therapy-session',
  EMOTIONAL_WELLBEING_ASSESSMENT: 'emotional-wellbeing-assessment',
  HOW_CAN_THERAPY_HELP: 'how-can-therapy-help',
  GETTING_STARTED: 'getting-started',
  EARN_WHILE_YOU_IMPROVE: 'earn-while-you-improve-your-wellbeing'
} as const;

function getUserClientTimezone(): string {
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
    
    // When running on frontend dev port (5173), direct fallback or proxied endpoint
    if (isLocalhost && window.location.port === '5173') {
      return `http://localhost:5001${endpoint}`;
    }
  }
  return endpoint;
}

/**
 * Persists any user activity (including Daily Check-In) to the database mapped with userId and activityId.
 */
export async function logUserActivityToDB(data: ActivityLogPayload) {
  const userId = data.userId || getActiveUserId();
  const activityId = data.activityId || data.lessonId || PLATFORM_ACTIVITIES.DAILY_CHECK_IN;
  const timezone = data.timezone || getUserClientTimezone();

  const payload = {
    userId,
    activityId,
    activityType: data.activityType || 'daily_check_in',
    lessonId: data.lessonId || activityId,
    service: data.service || 'therapy',
    emotionZone: data.emotionZone,
    primaryEmotion: data.primaryEmotion,
    additionalEmotions: data.additionalEmotions || [],
    intensity: data.intensity,
    contexts: data.contexts || [],
    reflection: data.reflection || '',
    resultSummary: data.resultSummary || {},
    recommendation: data.recommendation || {},
    rewardPoints: data.rewardPoints || 10,
    metadata: data.metadata || {},
    timezone
  };

  const primaryUrl = getApiUrl('/api/activities/check-in');

  try {
    const res = await fetch(primaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-timezone': timezone
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || json?.success === false) {
      // Fallback to relative /api if direct localhost failed
      const fallbackRes = await fetch('/api/activities/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-timezone': timezone },
        body: JSON.stringify(payload)
      });
      const fallbackJson = await fallbackRes.json().catch(() => null);
      return { success: fallbackRes.ok, data: fallbackJson?.data };
    }

    console.log(`[ActivityLogger] Activity (${activityId}) logged to DB for user:`, userId, json?.data);
    return { success: true, data: json?.data };

  } catch (error) {
    try {
      const fallbackRes = await fetch('/api/activities/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-timezone': timezone },
        body: JSON.stringify(payload)
      });
      const fallbackJson = await fallbackRes.json().catch(() => null);
      return { success: fallbackRes.ok, data: fallbackJson?.data };
    } catch (err2) {
      console.error(`[ActivityLogger] Network error logging activity (${activityId}) to DB:`, error);
      return { success: false, error };
    }
  }
}

/**
 * Specific helper for Daily Check-In
 */
export async function logDailyCheckInToDB(data: ActivityLogPayload) {
  return logUserActivityToDB({
    ...data,
    activityId: PLATFORM_ACTIVITIES.DAILY_CHECK_IN,
    activityType: 'daily_check_in',
    timezone: data.timezone || getUserClientTimezone()
  });
}

/**
 * Fetches the user's live streak calculation & milestone progress.
 */
export async function getUserStreak(userId?: string): Promise<StreakSummary | null> {
  const targetUserId = userId || getActiveUserId();
  const timezone = getUserClientTimezone();
  const url = getApiUrl(`/api/activities/streak/${targetUserId}?timezone=${encodeURIComponent(timezone)}`);

  try {
    const res = await fetch(url, {
      headers: { 'x-timezone': timezone }
    });
    const json = await res.json().catch(() => null);
    if (json?.data) return json.data;

    // Fallback to relative URL
    const fallbackRes = await fetch(`/api/activities/streak/${targetUserId}?timezone=${encodeURIComponent(timezone)}`, {
      headers: { 'x-timezone': timezone }
    });
    const fallbackJson = await fallbackRes.json().catch(() => null);
    return fallbackJson?.data || null;
  } catch (error) {
    console.error('[ActivityLogger] Error fetching user streak:', error);
    return null;
  }
}

/**
 * Fetches user activity history filtered by userId and optional activityId (e.g. 'daily-check-in').
 */
export async function getUserActivityHistory(activityId?: string, userId?: string) {
  const targetUserId = userId || getActiveUserId();
  const queryParam = activityId ? `?activityId=${encodeURIComponent(activityId)}` : '';
  const url = getApiUrl(`/api/activities/history/${targetUserId}${queryParam}`);

  try {
    const res = await fetch(url);
    const json = await res.json().catch(() => null);
    if (json?.data && Array.isArray(json.data)) {
      return json.data;
    }

    // Fallback to relative URL
    const fallbackRes = await fetch(`/api/activities/history/${targetUserId}${queryParam}`);
    const fallbackJson = await fallbackRes.json().catch(() => null);
    return fallbackJson?.data || [];
  } catch (error) {
    try {
      const fallbackRes = await fetch(`/api/activities/history/${targetUserId}${queryParam}`);
      const fallbackJson = await fallbackRes.json().catch(() => null);
      return fallbackJson?.data || [];
    } catch (e2) {
      console.error(`[ActivityLogger] Error fetching activity history for ${activityId}:`, error);
      return [];
    }
  }
}

/**
 * Fetches the latest check-in for the active user.
 */
export async function getLatestUserCheckIn(userId?: string) {
  const targetUserId = userId || getActiveUserId();
  const url = getApiUrl(`/api/activities/latest-check-in/${targetUserId}`);

  try {
    const res = await fetch(url);
    const json = await res.json().catch(() => null);
    if (json?.data) return json.data;

    const fallbackRes = await fetch(`/api/activities/latest-check-in/${targetUserId}`);
    const fallbackJson = await fallbackRes.json().catch(() => null);
    return fallbackJson?.data || null;
  } catch (error) {
    return null;
  }
}
