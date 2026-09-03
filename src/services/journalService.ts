import { getActiveUserId } from './authService';

export interface JournalEntryPayload {
  userId?: string;
  title?: string;
  content: string;
  entryType?: string;
  emotion?: string;
  emotionZone?: string;
  intensity?: number;
  checkInId?: number | string;
  checkInDate?: string;
  metadata?: any;
}

export interface JournalEntry {
  id: string | number;
  user_id: string;
  title: string;
  content: string;
  entry_type: string;
  emotion: string | null;
  emotion_zone: string | null;
  intensity: number | null;
  check_in_id: number | null;
  check_in_date: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
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
 * Creates and persists a new journal reflection to Neon DB.
 */
// In-flight request deduplication map to prevent double-click / concurrent duplicates
const inFlightJournalCreates = new Map<string, Promise<JournalEntry>>();

export async function createJournalEntry(data: JournalEntryPayload): Promise<JournalEntry> {
  const userId = data.userId || getActiveUserId();

  const payload = {
    userId,
    title: data.title || '',
    content: data.content,
    entryType: data.entryType || 'free_write',
    emotion: data.emotion || null,
    emotionZone: data.emotionZone || null,
    intensity: data.intensity || null,
    checkInId: data.checkInId || null,
    checkInDate: data.checkInDate || new Date().toISOString().split('T')[0],
    metadata: data.metadata || {}
  };

  const dedupeKey = `${userId}_${payload.entryType}_${(payload.title || '').trim()}_${(payload.content || '').trim().substring(0, 80)}`;

  if (inFlightJournalCreates.has(dedupeKey)) {
    console.log('[journalService] Reusing in-flight create request for:', dedupeKey);
    return inFlightJournalCreates.get(dedupeKey)!;
  }

  const createPromise = (async () => {
    try {
      const url = getApiUrl('/api/journal/entries');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP error ${response.status}`);
      }

      const result = await response.json();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('journal-entry-created', { detail: result.entry }));
        window.dispatchEvent(new CustomEvent('journal-history-updated'));
      }

      return result.entry;
    } finally {
      // Release in-flight lock after brief cooldown
      setTimeout(() => {
        inFlightJournalCreates.delete(dedupeKey);
      }, 1500);
    }
  })();

  inFlightJournalCreates.set(dedupeKey, createPromise);
  return createPromise;
}

/**
 * Updates an existing journal reflection.
 */
export async function updateJournalEntry(id: string | number, data: { title?: string; content: string; metadata?: any }): Promise<JournalEntry> {
  const userId = getActiveUserId();
  const url = getApiUrl(`/api/journal/entries/${id}`);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      title: data.title || '',
      content: data.content,
      metadata: data.metadata
    })
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP error ${response.status}`);
  }

  const result = await response.json();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('journal-entry-updated', { detail: result.entry }));
    window.dispatchEvent(new CustomEvent('journal-history-updated'));
  }

  return result.entry;
}

/**
 * Deletes a journal reflection permanently from the database.
 */
export async function deleteJournalEntry(id: string | number): Promise<boolean> {
  const userId = getActiveUserId();
  const url = getApiUrl(`/api/journal/entries/${id}?userId=${encodeURIComponent(userId)}`);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP error ${response.status}`);
  }

  return true;
}

/**
 * Fetches recent journal reflections for the active user.
 */
export async function getUserJournalEntries(userIdInput?: string, limit = 20): Promise<JournalEntry[]> {
  const userId = userIdInput || getActiveUserId();
  const url = getApiUrl(`/api/journal/entries?userId=${encodeURIComponent(userId)}&limit=${limit}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP error ${response.status}`);
  }

  const result = await response.json();
  return result.entries || [];
}

/**
 * Fetches a single journal entry by ID.
 */
export async function getJournalEntryById(id: string | number): Promise<JournalEntry> {
  const userId = getActiveUserId();
  const url = getApiUrl(`/api/journal/entries/${id}?userId=${encodeURIComponent(userId)}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP error ${response.status}`);
  }

  const result = await response.json();
  return result.entry;
}

/**
 * Searches journal reflections by keyword across title, content, and prompts.
 */
export async function searchUserJournalEntries(
  query: string,
  entryType = 'all',
  limit = 30
): Promise<JournalEntry[]> {
  const userId = getActiveUserId();
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = getApiUrl(
    `/api/journal/search?userId=${encodeURIComponent(userId)}&query=${encodeURIComponent(
      trimmed
    )}&entryType=${encodeURIComponent(entryType)}&limit=${limit}`
  );

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP error ${response.status}`);
  }

  const result = await response.json();
  return result.entries || [];
}

/**
 * Fast unified fetcher for the Journal ecosystem (both reflections and check-in history).
 * Includes in-flight deduplication and responsive memory caching.
 */
interface EcosystemCacheEntry {
  data: { journals: JournalEntry[]; checkIns: any[] };
  timestamp: number;
}
const ecosystemCache = new Map<string, EcosystemCacheEntry>();
const inFlightEcosystemRequests = new Map<string, Promise<{ journals: JournalEntry[]; checkIns: any[] }>>();

export function invalidateJournalEcosystemCache(userIdInput?: string) {
  const userId = userIdInput || getActiveUserId();
  ecosystemCache.delete(userId);
}

// Invalidate cache on global mutation events
if (typeof window !== 'undefined') {
  window.addEventListener('journal-entry-created', () => ecosystemCache.clear());
  window.addEventListener('journal-entry-updated', () => ecosystemCache.clear());
  window.addEventListener('journal-history-updated', () => ecosystemCache.clear());
  window.addEventListener('check-in-state-updated', () => ecosystemCache.clear());
}

export async function getJournalEcosystemData(
  userIdInput?: string,
  limit = 100,
  forceFresh = false
): Promise<{ journals: JournalEntry[]; checkIns: any[] }> {
  const userId = userIdInput || getActiveUserId();

  // Check fast memory cache (valid for 60 seconds unless invalidated)
  const cached = ecosystemCache.get(userId);
  if (!forceFresh && cached && Date.now() - cached.timestamp < 60000) {
    return cached.data;
  }

  // Check in-flight promise to prevent duplicate concurrent network requests
  if (inFlightEcosystemRequests.has(userId)) {
    return inFlightEcosystemRequests.get(userId)!;
  }

  const fetchPromise = (async () => {
    try {
      const url = getApiUrl(`/api/journal/ecosystem-data?userId=${encodeURIComponent(userId)}&limit=${limit}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Graceful fallback to individual endpoints if needed
        const [journals, checkIns] = await Promise.all([
          getUserJournalEntries(userId, limit).catch(() => []),
          fetch(getApiUrl(`/api/activities/history/${encodeURIComponent(userId)}?activityId=daily-check-in`))
            .then((r) => r.json())
            .then((j) => j.data || [])
            .catch(() => [])
        ]);
        const fallbackData = { journals, checkIns };
        ecosystemCache.set(userId, { data: fallbackData, timestamp: Date.now() });
        return fallbackData;
      }

      const result = await response.json();
      const data = {
        journals: Array.isArray(result.journals) ? result.journals : [],
        checkIns: Array.isArray(result.checkIns) ? result.checkIns : []
      };

      ecosystemCache.set(userId, { data, timestamp: Date.now() });
      return data;
    } catch (err) {
      console.warn('[journalService] Error fetching ecosystem data:', err);
      return { journals: [], checkIns: [] };
    } finally {
      inFlightEcosystemRequests.delete(userId);
    }
  })();

  inFlightEcosystemRequests.set(userId, fetchPromise);
  return fetchPromise;
}

