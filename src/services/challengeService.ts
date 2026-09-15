import { getActiveUserId } from './authService';

export interface Challenge {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  durationDays: number;
  coverImage: string;
  category: string;
  status: 'active' | 'upcoming' | 'archived';
  dailyTimeMinutes: number;
  keyMilestones: Array<{ day: number; title: string; reward: string }>;
}

export interface ChallengeEnrollment {
  id: string | number;
  userId: string;
  challengeId: string;
  status: 'active' | 'completed' | 'paused';
  enrolledAt: string;
  currentDay: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: string | null;
  completedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaderboardSlice {
  top: Array<{ rank: number; name: string; score: number; streak: number }>;
  me: { rank: number; score: number; streak: number } | null;
  updatedAt: string;
}

export interface ChallengeDashboardPayload {
  state: 'active' | 'no_active_challenge';
  challenge?: Challenge | null;
  enrollment?: ChallengeEnrollment | null;
  progress?: {
    percentage: number;
    daysRemaining: number;
    completedDays: number;
    totalDays: number;
    currentStreak?: number;
    longestStreak?: number;
    isTodayCompleted: boolean;
    isChallengeCompleted?: boolean;
  };
  today?: {
    dayNumber: number;
    title: string;
    description: string;
    estimatedMinutes: number;
    actionRoute: string;
    isCompleted: boolean;
  };
  nextUp?: {
    dayNumber: number;
    title: string;
    description: string;
    estimatedMinutes: number;
    actionRoute: string;
    tag?: string;
  } | null;
  milestones?: Array<{ day: number; title: string; isReached: boolean; isCurrent: boolean }>;
  insights?: string[];
  suggestions?: Array<{
    id: string;
    title: string;
    description?: string;
    tag: string;
    estimatedMinutes?: number;
    actionRoute: string;
  }>;
  therapyRecommendation?: {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    actionRoute: string;
  };
  leaderboard?: LeaderboardSlice;
  community?: {
    activeParticipants: number;
    message: string;
  };
  availableChallenges?: Challenge[];
}

// High-speed In-Memory SWR Cache for Dashboard Payload
const dashboardCache = new Map<string, { timestamp: number; data: ChallengeDashboardPayload }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory freshness

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
 * Generate instantaneous optimistic active dashboard payload for Mantra 21
 */
export function createOptimisticActiveDashboard(userId: string, challengeId: string = 'mantra_21'): ChallengeDashboardPayload {
  const now = new Date().toISOString();
  const enrollment: ChallengeEnrollment = {
    id: `opt_${Date.now()}`,
    userId,
    challengeId,
    status: 'active',
    enrolledAt: now,
    currentDay: 1,
    completedDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now
  };

  return {
    state: 'active',
    challenge: {
      id: 'mantra_21',
      slug: 'mantra-21',
      name: 'Mantra 21',
      tagline: '21 days to show up for your mind.',
      description: 'A universal 21-day mental wellness challenge built around small, consistent actions, micro-habits, and self-discovery.',
      durationDays: 21,
      coverImage: 'https://res.cloudinary.com/hxbamdqf/image/upload/v1789476883/7b3a608d-4b8e-4d39-94e6-18821d25e8eb_apjy3r.png',
      category: 'Mental Wellness',
      status: 'active',
      dailyTimeMinutes: 10,
      keyMilestones: [
        { day: 1, title: 'First Step', reward: 'Starter Badge' },
        { day: 7, title: 'Consistency Checkpoint', reward: '7-Day Streak Badge' },
        { day: 14, title: 'Halfway Momentum', reward: 'Momentum Finisher' },
        { day: 21, title: 'Finisher Circle', reward: 'Mantra 21 Finisher Medal' }
      ]
    },
    enrollment,
    progress: {
      percentage: 0,
      daysRemaining: 21,
      completedDays: 0,
      totalDays: 21,
      currentStreak: 0,
      longestStreak: 0,
      isTodayCompleted: false,
      isChallengeCompleted: false
    },
    today: {
      dayNumber: 1,
      title: 'Start Where You Are',
      description: 'Choose one small thing that makes today 1% easier.',
      estimatedMinutes: 4,
      actionRoute: '/task/mantra21-day-1',
      isCompleted: false
    },
    nextUp: {
      dayNumber: 2,
      title: 'Noticing the Body',
      description: 'Map physical tension and give your nervous system a 2-minute anchor.',
      estimatedMinutes: 5,
      actionRoute: '/task/mantra21-day-2',
      tag: 'SOMATIC AWARENESS'
    },
    milestones: [
      { day: 1, title: 'First Step', isReached: false, isCurrent: true },
      { day: 7, title: 'Consistency Checkpoint', isReached: false, isCurrent: false },
      { day: 14, title: 'Halfway Momentum', isReached: false, isCurrent: false },
      { day: 21, title: 'Finisher Circle', isReached: false, isCurrent: false }
    ],
    insights: [
      "Keep exploring. Your personal patterns will appear here as you go."
    ],
    suggestions: [
      {
        id: 'support_circle',
        title: 'Your Support Circle',
        description: 'Identify the people you can lean on when things feel heavy.',
        tag: 'ACTIVITY',
        estimatedMinutes: 5,
        actionRoute: '/task/depression-where-am-i-right-now'
      },
      {
        id: 'find_enjoyment',
        title: 'Find Your Enjoyment',
        description: 'Discover small moments and simple routines that still feel worth doing.',
        tag: 'ACTIVITY',
        estimatedMinutes: 6,
        actionRoute: '/task/depression-one-tiny-step'
      },
      {
        id: 'emotion_wheel',
        title: 'Emotion Wheel Explorer',
        description: 'Map out exactly what you are feeling beyond simple labels.',
        tag: 'SELF-DISCOVERY',
        estimatedMinutes: 4,
        actionRoute: '/task/emotion-wheel'
      }
    ],
    therapyRecommendation: {
      title: 'A LITTLE MORE SUPPORT',
      subtitle: "You don't have to figure everything out alone.",
      description: "If you'd like someone beside you through this journey, explore structured 1-on-1 therapy support.",
      ctaText: 'EXPLORE SUPPORT →',
      actionRoute: '/task/how-can-therapy-help'
    },
    leaderboard: {
      top: [
        { rank: 1, name: 'Aarav K.', score: 21, streak: 21 },
        { rank: 2, name: 'Riya S.', score: 19, streak: 19 },
        { rank: 3, name: 'Karan M.', score: 18, streak: 18 }
      ],
      me: { rank: 4, score: 10, streak: 0 },
      updatedAt: now
    },
    community: {
      activeParticipants: 4280,
      message: "Everyone is on their own day. Everyone is simply showing up."
    }
  };
}

export const FALLBACK_CHALLENGES: Challenge[] = [
  {
    id: 'mantra_21',
    slug: 'mantra-21',
    name: 'Mantra 21',
    tagline: '21 days to show up for your mind.',
    description: 'A universal 21-day mental wellness challenge built around small, consistent actions, micro-habits, and self-discovery.',
    durationDays: 21,
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    category: 'Mental Wellness',
    status: 'active',
    dailyTimeMinutes: 10,
    keyMilestones: [
      { day: 1, title: 'First Step', reward: 'Starter Badge' },
      { day: 7, title: 'Consistency Checkpoint', reward: '7-Day Streak Badge' },
      { day: 14, title: 'Halfway Momentum', reward: 'Momentum Finisher' },
      { day: 21, title: 'Finisher Circle', reward: 'Mantra 21 Finisher Medal' }
    ]
  },
  {
    id: 'morning_calm_7',
    slug: 'morning-calm-7',
    name: '7-Day Morning Calm',
    tagline: 'Start your mornings with grounded clarity.',
    description: '7 days of 5-minute morning anchors, breathwork micro-steps, and intentional focus before your day begins.',
    durationDays: 7,
    coverImage: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80',
    category: 'Daily Grounding',
    status: 'active',
    dailyTimeMinutes: 5,
    keyMilestones: [
      { day: 1, title: 'Morning Spark', reward: 'Early Riser' },
      { day: 4, title: 'Rhythm Builder', reward: 'Grounded State' },
      { day: 7, title: '7-Day Anchor', reward: 'Morning Master' }
    ]
  },
  {
    id: 'sleep_reset_14',
    slug: 'sleep-reset-14',
    name: '14-Day Sleep & Unwind',
    tagline: 'Build an effortless bedtime routine.',
    description: 'Unwind your mind, release racing thoughts, and establish restful evening habits that last beyond two weeks.',
    durationDays: 14,
    coverImage: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80',
    category: 'Rest & Recovery',
    status: 'active',
    dailyTimeMinutes: 8,
    keyMilestones: [
      { day: 1, title: 'Unwind Onset', reward: 'Evening Pause' },
      { day: 7, title: 'Deep Rest', reward: 'Sleep Restorer' },
      { day: 14, title: '14-Day Reset', reward: 'Sleep Champion' }
    ]
  }
];

/**
 * Fetch Aggregated Challenge Dashboard with instantaneous cache + stale-while-revalidate
 */
export async function fetchChallengeHubDashboard(
  userIdInput?: string,
  options?: { skipCache?: boolean }
): Promise<ChallengeDashboardPayload> {
  const userId = userIdInput || getActiveUserId() || '234306';
  const cacheKey = `dashboard_${userId}`;

  // Check in-memory SWR cache first for 0ms render
  if (!options?.skipCache) {
    const cached = dashboardCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // Fast single fetch with short timeout
  const primaryUrl = getApiUrl(`/api/challenges/current?userId=${encodeURIComponent(userId)}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(primaryUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    const json = await res.json().catch(() => null);

    if (json?.data) {
      const data = json.data;
      if (data.state === 'no_active_challenge' && (!data.availableChallenges || data.availableChallenges.length === 0)) {
        data.availableChallenges = FALLBACK_CHALLENGES;
      }
      dashboardCache.set(cacheKey, { timestamp: Date.now(), data });
      return data;
    }

    // If local storage has enrollment, return optimistic active state rather than blank catalogue
    if (typeof window !== 'undefined') {
      const isEnrolled = localStorage.getItem(`mantra21_enrolled_${userId}`) === 'true';
      if (isEnrolled) {
        const optimistic = createOptimisticActiveDashboard(userId);
        dashboardCache.set(cacheKey, { timestamp: Date.now(), data: optimistic });
        return optimistic;
      }
    }

    const fallback: ChallengeDashboardPayload = {
      state: 'no_active_challenge',
      availableChallenges: FALLBACK_CHALLENGES
    };
    dashboardCache.set(cacheKey, { timestamp: Date.now(), data: fallback });
    return fallback;
  } catch (err) {
    console.warn('[ChallengeService] Quick fetch fallback:', err);
    // Offline / timeout fallback from localStorage
    if (typeof window !== 'undefined') {
      const isEnrolled = localStorage.getItem(`mantra21_enrolled_${userId}`) === 'true';
      if (isEnrolled) {
        return createOptimisticActiveDashboard(userId);
      }
    }
    return {
      state: 'no_active_challenge',
      availableChallenges: FALLBACK_CHALLENGES
    };
  }
}

/**
 * Fetch list of all active catalogue challenges
 */
export async function getAvailableChallenges(): Promise<Challenge[]> {
  const primaryUrl = getApiUrl('/api/challenges');

  try {
    const res = await fetch(primaryUrl);
    let json = await res.json().catch(() => null);

    if (!res.ok || json?.success === false) {
      const fallbackRes = await fetch('/api/challenges');
      json = await fallbackRes.json().catch(() => null);
    }

    if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return FALLBACK_CHALLENGES;
  } catch (err) {
    return FALLBACK_CHALLENGES;
  }
}

/**
 * Fetch single challenge details
 */
export async function getChallengeDetails(slugOrId: string): Promise<Challenge | null> {
  const primaryUrl = getApiUrl(`/api/challenges/details/${encodeURIComponent(slugOrId)}`);

  try {
    const res = await fetch(primaryUrl);
    let json = await res.json().catch(() => null);

    if (!res.ok || json?.success === false) {
      const fallbackRes = await fetch(`/api/challenges/details/${encodeURIComponent(slugOrId)}`);
      json = await fallbackRes.json().catch(() => null);
    }

    if (json?.data) {
      return json.data;
    }

    const found = FALLBACK_CHALLENGES.find((c) => c.id === slugOrId || c.slug === slugOrId);
    return found || null;
  } catch (err) {
    const found = FALLBACK_CHALLENGES.find((c) => c.id === slugOrId || c.slug === slugOrId);
    return found || null;
  }
}

/**
 * Idempotently enroll in a challenge enforcing single active challenge rule
 */
export async function enrollInChallenge(
  challengeId: string = 'mantra_21',
  userIdInput?: string
): Promise<{ success: boolean; data: ChallengeEnrollment | null; error?: string; code?: string }> {
  const userId = userIdInput || getActiveUserId();

  if (!userId) {
    return {
      success: false,
      data: null,
      error: 'No active user ID found for challenge enrollment'
    };
  }

  const payload = {
    userId,
    challengeId
  };

  const primaryUrl = getApiUrl('/api/challenges/enroll');

  try {
    const res = await fetch(primaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let json = await res.json().catch(() => null);

    if (!res.ok || json?.success === false) {
      const fallbackRes = await fetch('/api/challenges/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      json = await fallbackRes.json().catch(() => null);

      if (!fallbackRes.ok || json?.success === false) {
        return {
          success: false,
          data: null,
          error: json?.error || 'Failed to enroll in challenge',
          code: json?.code
        };
      }
    }

    const enrollment: ChallengeEnrollment = json.data;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`mantra21_enrollment_${userId}`, JSON.stringify(enrollment));
        localStorage.setItem(`mantra21_enrolled_${userId}`, 'true');
        localStorage.setItem(`mantra21_enrolled_at_${userId}`, enrollment.enrolledAt);
        localStorage.setItem(`mantra_21_plan_mode_${userId}`, 'challenge');

        window.dispatchEvent(
          new CustomEvent('mantra21-enrollment-updated', {
            detail: { userId, enrollment }
          })
        );
      } catch (e) {}
    }

    return {
      success: true,
      data: enrollment
    };

  } catch (error) {
    console.error('[ChallengeService] Error enrolling in challenge:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Network error during enrollment'
    };
  }
}

/**
 * Fetch user's active challenge enrollment
 */
export async function getChallengeEnrollment(
  challengeId: string = 'mantra_21',
  userIdInput?: string
): Promise<ChallengeEnrollment | null> {
  const userId = userIdInput || getActiveUserId();
  if (!userId) return null;

  const primaryUrl = getApiUrl(`/api/challenges/enrollment/${encodeURIComponent(userId)}/${encodeURIComponent(challengeId)}`);

  try {
    const res = await fetch(primaryUrl);
    let json = await res.json().catch(() => null);

    if (!res.ok || json?.success === false) {
      const fallbackRes = await fetch(`/api/challenges/enrollment/${encodeURIComponent(userId)}/${encodeURIComponent(challengeId)}`);
      json = await fallbackRes.json().catch(() => null);
    }

    if (json?.data) {
      const enrollment: ChallengeEnrollment = json.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem(`mantra21_enrollment_${userId}`, JSON.stringify(enrollment));
        localStorage.setItem(`mantra21_enrolled_${userId}`, 'true');
      }
      return enrollment;
    }

    return null;
  } catch (err) {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`mantra21_enrollment_${userId}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  }
}

export function subscribeToChallengeEnrollment(callback: (detail: any) => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: any) => callback(e.detail);
  window.addEventListener('mantra21-enrollment-updated', handler);
  return () => window.removeEventListener('mantra21-enrollment-updated', handler);
}
