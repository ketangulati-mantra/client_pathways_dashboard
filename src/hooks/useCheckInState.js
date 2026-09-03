import { useState, useEffect, useCallback, useRef } from 'react';
import { dailyCheckInService, subscribeToCheckInStateUpdates } from '../services/dailyCheckInService';
import { getActiveUserId } from '../services/authService';

// Global in-memory cache for zero layout shifts during in-session transitions
let globalCache = {
  userId: null,
  state: null,
  lastFetchedAt: 0
};

/**
 * Unified canonical hook for consuming Daily Check-in state across all application screens.
 * Auto-revalidates on window focus, tab visibility, route changes, and mutation events.
 */
export function useCheckInState(propUserId) {
  const userId = propUserId || getActiveUserId();
  const [checkInState, setCheckInState] = useState(() => {
    if (globalCache.userId === userId && globalCache.state) {
      return globalCache.state;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    if (globalCache.userId === userId && globalCache.state) {
      return false;
    }
    return true;
  });
  const [error, setError] = useState(null);

  const isFetchingRef = useRef(false);

  const fetchState = useCallback(async (forced = false) => {
    if (!userId) return;
    // Debounce parallel rapid requests if already in-flight
    if (isFetchingRef.current && !forced) return;
    isFetchingRef.current = true;

    try {
      const data = await dailyCheckInService.getCheckInState(userId);
      globalCache = {
        userId,
        state: data,
        lastFetchedAt: Date.now()
      };
      setCheckInState(data);
      setError(null);
    } catch (err) {
      console.warn('[useCheckInState] Error fetching check-in state:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    // 1. Initial fetch on mount / user change
    fetchState(true);

    // 2. Window focus & tab visibility revalidation (handles external database deletions smoothly)
    const handleFocus = () => {
      // Revalidate if more than 2 seconds have passed since last fetch
      if (Date.now() - globalCache.lastFetchedAt > 2000) {
        fetchState();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchState();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Application mutation subscriber
    const unsubscribe = subscribeToCheckInStateUpdates((detail) => {
      if (!detail?.userId || detail.userId === userId) {
        fetchState(true);
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubscribe();
    };
  }, [userId, fetchState]);

  const hasCheckedInToday = Boolean(checkInState?.today?.hasCheckedIn);
  const todayLatestCheckIn = checkInState?.today?.latestCheckIn || null;
  const todayCheckIns = checkInState?.today?.checkIns || [];
  const streak = checkInState?.streak || {
    current: 0,
    longest: 0,
    completedToday: false,
    totalCheckInDays: 0,
    lastCompletedDate: null,
    nextMilestone: 3,
    daysUntilNextMilestone: 3,
    progressToNextMilestone: { current: 0, target: 3 }
  };

  return {
    checkInState,
    isLoading,
    error,
    refetch: () => fetchState(true),
    hasCheckedInToday,
    todayLatestCheckIn,
    todayCheckIns,
    streak
  };
}
