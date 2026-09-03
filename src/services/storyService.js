const API_BASE = '/api/story';

function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    return 'UTC';
  }
}

export const storyService = {
  /**
   * Fetch current story state and latest chapter for the user.
   */
  async getStoryState(userId) {
    if (!userId) throw new Error('User ID is required');

    const tz = getUserTimezone();
    const res = await fetch(`${API_BASE}/state?userId=${encodeURIComponent(userId)}&timezone=${encodeURIComponent(tz)}`, {
      headers: {
        'x-timezone': tz
      }
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Failed to fetch story state [${res.status}]: ${errorText}`);
    }

    const json = await res.json();
    return json.data; // { state, latestChapter, hasChapters, dailyEligibility, ... }
  },

  /**
   * Fetch all chronological chapters for the user.
   */
  async getStoryChapters(userId, limit = 50) {
    if (!userId) return [];

    const res = await fetch(`${API_BASE}/chapters?userId=${encodeURIComponent(userId)}&limit=${limit}`);
    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Failed to fetch story chapters [${res.status}]: ${errorText}`);
    }

    const json = await res.json();
    return json.data || [];
  },

  /**
   * Fetch the latest chapter for the user.
   */
  async getLatestChapter(userId) {
    if (!userId) return null;

    const res = await fetch(`${API_BASE}/chapters/latest?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.data || null;
  },

  /**
   * Trigger next chapter generation for the user (guarded by daily calendar boundary).
   */
  async generateNextChapter(userId) {
    if (!userId) throw new Error('User ID is required');

    const tz = getUserTimezone();
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-timezone': tz
      },
      body: JSON.stringify({ userId, timezone: tz })
    });

    const json = await res.json();

    if (!res.ok) {
      const is409 = res.status === 409;
      const isDailyLimit = json.code === 'DAILY_CHAPTER_LIMIT_REACHED';
      const errorMessage = json.error || (isDailyLimit ? 'A story chapter has already been generated for today.' : (is409 ? 'Story generation is already in progress' : 'Failed to generate chapter'));
      const err = new Error(errorMessage);
      err.statusCode = res.status;
      err.isLockConflict = is409 && !isDailyLimit;
      err.isDailyLimit = isDailyLimit;
      err.code = json.code;
      throw err;
    }

    // Broadcast state update event across the app for real-time reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('story-state-updated', { detail: { userId, data: json.data } }));
    }

    return json.data; // { chapter, state, unified }
  }
};
