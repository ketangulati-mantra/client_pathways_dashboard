import { getActiveUserId } from './authService';

export interface OcdMoodLog {
  id: number | string;
  userId: string;
  mood: number; // 1 | 2 | 3 | 4 | 5
  ocdImpact: number; // 1 | 2 | 3 | 4 | 5
  experiences: string[];
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOcdMoodLogPayload {
  userId?: string;
  mood: number;
  ocdImpact: number;
  experiences: string[];
  note?: string;
}

export interface UpdateOcdMoodLogPayload {
  mood: number;
  ocdImpact: number;
  experiences: string[];
  note?: string;
}

export const MOOD_LEVELS = [
  { value: 1, label: 'Very low', subtitle: 'Heavy or depleted', color: '#64748B' },
  { value: 2, label: 'Low', subtitle: 'Unsettled or subdued', color: '#475569' },
  { value: 3, label: 'Okay', subtitle: 'Balanced or steady', color: '#0284C7' },
  { value: 4, label: 'Good', subtitle: 'Clear and grounded', color: '#005387' },
  { value: 5, label: 'Very good', subtitle: 'Peaceful and engaged', color: '#047857' }
] as const;

export const OCD_EXPERIENCE_OPTIONS = [
  { id: 'INTRUSIVE_THOUGHTS', label: 'Intrusive thoughts' },
  { id: 'CHECKING', label: 'Checking' },
  { id: 'CONTAMINATION', label: 'Contamination' },
  { id: 'REASSURANCE', label: 'Reassurance seeking' },
  { id: 'AVOIDANCE', label: 'Avoidance' },
  { id: 'REPEATING', label: 'Repeating' },
  { id: 'MENTAL_REVIEW', label: 'Mental reviewing' },
  { id: 'OTHER', label: 'Other' },
  { id: 'NONE', label: 'Nothing in particular' }
] as const;

export function getExperienceLabel(id: string): string {
  const clean = (id || '').toUpperCase();
  const found = OCD_EXPERIENCE_OPTIONS.find(opt => opt.id === clean);
  return found ? found.label : (id.charAt(0).toUpperCase() + id.slice(1).toLowerCase().replace(/_/g, ' '));
}

export function getMoodLabel(mood: number): string {
  const found = MOOD_LEVELS.find(m => m.value === mood);
  return found ? found.label : 'Okay';
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
 * Save new OCD Mood Log
 */
export async function createOcdMoodLog(data: CreateOcdMoodLogPayload): Promise<OcdMoodLog> {
  const userId = data.userId || getActiveUserId();
  const url = getApiUrl('/api/ocd-mood/logs');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId
    },
    body: JSON.stringify({
      userId,
      mood: data.mood,
      ocdImpact: data.ocdImpact,
      experiences: data.experiences,
      note: data.note || ''
    })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => null);
    throw new Error(errJson?.error || `Failed to save check-in (${res.status})`);
  }

  const json = await res.json();
  const row = json.data;
  return {
    id: row.id,
    userId: row.user_id || row.userId || userId,
    mood: Number(row.mood),
    ocdImpact: Number(row.ocd_impact ?? row.ocdImpact),
    experiences: Array.isArray(row.experiences) ? row.experiences : [],
    note: row.note || '',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

/**
 * Fetch all logs for current authenticated user
 */
export async function getOcdMoodLogs(userIdParam?: string): Promise<OcdMoodLog[]> {
  const userId = userIdParam || getActiveUserId();
  const url = getApiUrl(`/api/ocd-mood/logs?userId=${encodeURIComponent(userId)}&limit=200`);

  const res = await fetch(url, {
    headers: {
      'x-user-id': userId
    }
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => null);
    throw new Error(errJson?.error || `Failed to fetch check-ins (${res.status})`);
  }

  const json = await res.json();
  const list = json.data || [];

  return list.map((row: any) => ({
    id: row.id,
    userId: row.userId || row.user_id || userId,
    mood: Number(row.mood),
    ocdImpact: Number(row.ocdImpact ?? row.ocd_impact),
    experiences: Array.isArray(row.experiences) ? row.experiences : [],
    note: row.note || '',
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at
  }));
}

/**
 * Update an existing log
 */
export async function updateOcdMoodLog(
  id: string | number,
  data: UpdateOcdMoodLogPayload,
  userIdParam?: string
): Promise<OcdMoodLog> {
  const userId = userIdParam || getActiveUserId();
  const url = getApiUrl(`/api/ocd-mood/logs/${id}`);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId
    },
    body: JSON.stringify({
      userId,
      mood: data.mood,
      ocdImpact: data.ocdImpact,
      experiences: data.experiences,
      note: data.note || ''
    })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => null);
    throw new Error(errJson?.error || `Failed to update check-in (${res.status})`);
  }

  const json = await res.json();
  const row = json.data;
  return {
    id: row.id,
    userId: row.userId || row.user_id || userId,
    mood: Number(row.mood),
    ocdImpact: Number(row.ocdImpact ?? row.ocd_impact),
    experiences: Array.isArray(row.experiences) ? row.experiences : [],
    note: row.note || '',
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at
  };
}

/**
 * Delete a log
 */
export async function deleteOcdMoodLog(id: string | number, userIdParam?: string): Promise<boolean> {
  const userId = userIdParam || getActiveUserId();
  const url = getApiUrl(`/api/ocd-mood/logs/${id}?userId=${encodeURIComponent(userId)}`);

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'x-user-id': userId
    }
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => null);
    throw new Error(errJson?.error || `Failed to delete check-in (${res.status})`);
  }

  return true;
}

/**
 * Fetch Trends
 */
export async function getOcdMoodTrends(days = 14, userIdParam?: string): Promise<OcdMoodLog[]> {
  const userId = userIdParam || getActiveUserId();
  const url = getApiUrl(`/api/ocd-mood/trends?days=${days}&userId=${encodeURIComponent(userId)}`);

  const res = await fetch(url, {
    headers: {
      'x-user-id': userId
    }
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => null);
    throw new Error(errJson?.error || `Failed to fetch trends (${res.status})`);
  }

  const json = await res.json();
  const list = json.data || [];

  return list.map((row: any) => ({
    id: row.id,
    userId: row.userId || row.user_id || userId,
    mood: Number(row.mood),
    ocdImpact: Number(row.ocdImpact ?? row.ocd_impact),
    experiences: Array.isArray(row.experiences) ? row.experiences : [],
    note: row.note || '',
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at
  }));
}
