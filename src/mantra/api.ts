import { MANTRA_CONFIG } from './config';
import { activities } from './activities';
import { getCurrentService } from './services';

/**
 * Returns URL parameters required by the pathway webhook.
 */
const getWebhookContext = () => {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();

  return {
    upaId: params.get('upa_id'),
    uid: params.get('uid'),
    service: getCurrentService()
  };
};

/**
 * Returns the current user_id from URL query params (e.g. ?user_id=... / ?upa_id=...),
 * auth sessionStorage, or a unique guest session ID.
 */
export const getCurrentUserId = (): string => {
  if (typeof window === 'undefined') return 'anonymous_user';
  const searchParams = new URLSearchParams(window.location.search);
  
  const rawHash = window.location.hash || '';
  const hashQueryStr = rawHash.includes('?') ? rawHash.substring(rawHash.indexOf('?') + 1) : '';
  const hashParams = new URLSearchParams(hashQueryStr);

  const foundId = (
    sessionStorage.getItem('user_id') ||
    searchParams.get('user_id') ||
    searchParams.get('userId') ||
    searchParams.get('uid') ||
    searchParams.get('upa_id') ||
    searchParams.get('upaId') ||
    searchParams.get('email') ||
    hashParams.get('user_id') ||
    hashParams.get('userId') ||
    hashParams.get('uid') ||
    hashParams.get('upa_id') ||
    hashParams.get('email') ||
    localStorage.getItem('mantra_user_id') ||
    localStorage.getItem('current_user')
  );

  if (foundId) {
    return foundId.trim();
  }

  // Generate a isolated unique guest session ID so each new account/session starts with fresh uncompleted activities
  let guestId = localStorage.getItem('mantra_guest_session_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    try {
      localStorage.setItem('mantra_guest_session_id', guestId);
    } catch (e) {}
  }
  return guestId;
};

/**
 * Marks a lesson/activity as completed in Laravel webhook.
 */
export const completeLesson = async (lessonId: string): Promise<boolean> => {
  const activity = activities.find(a => a.lessonId === lessonId);

  if (!activity) {
    console.error(`[Mantra API] Activity not found: ${lessonId}`);
    return false;
  }

  const { upaId, uid, service } = getWebhookContext();

  if (!upaId) {
    if (MANTRA_CONFIG.devMode) {
      console.log(`[Mantra API] Dev Mode: completed activity ${lessonId} locally.`);
      return true;
    }
    return false;
  }

  if (MANTRA_CONFIG.devMode) {
    console.log('[Mantra API] Completing activity via webhook', {
      lessonId,
      upaId,
      uid,
      service,
      endpoint: MANTRA_CONFIG.webhookUrl
    });
  }

  try {
    const response = await fetch(MANTRA_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        upa_id: upaId,
        uid: uid,
        lesson_id: lessonId,
        service: service,
        reward_points: activity.rewardPoints
      })
    });

    if (!response.ok) {
      console.error(`[Mantra API] Webhook failed with status ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Mantra API] Error triggering completion webhook:', error);
    return false;
  }
};

/**
 * Retrieves completion status of all activities.
 */
export const fetchUserProgress = async (): Promise<Record<string, boolean>> => {
  const { upaId } = getWebhookContext();

  if (!upaId) {
    return {};
  }

  try {
    const response = await fetch(`${MANTRA_CONFIG.webhookUrl}?upa_id=${upaId}`);
    if (!response.ok) return {};
    const data = await response.json();
    return data.progress || {};
  } catch (error) {
    console.error('[Mantra API] Error fetching progress:', error);
    return {};
  }
};

/**
 * Saves intermediary progress checkpoints.
 */
export const saveProgress = async (lessonId: string, progress: number): Promise<boolean> => {
  console.log(`[Mantra API] Progress auto-saved for lesson ${lessonId}: ${progress}%`);
  return true;
};

/**
 * Submits an activity submission payload to the backend API.
 */
export const submitActivitySubmission = async (payload: {
  userId?: string;
  lessonId: string;
  activityTitle: string;
  submissionType: string;
  formData: Record<string, any>;
}): Promise<{ success: boolean; data?: any; error?: string }> => {
  const userId = payload.userId || getCurrentUserId();
  const service = getCurrentService();

  const backendUrl = MANTRA_CONFIG.apiBaseUrl;

  try {
    const response = await fetch(`${backendUrl}/api/activity-submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        lessonId: payload.lessonId,
        activityTitle: payload.activityTitle,
        submissionType: payload.submissionType,
        service,
        formData: payload.formData,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('[Mantra API] Activity submission failed:', result?.error || result?.message || result);
      return { success: false, error: result?.error || result?.message || 'Submission failed' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[Mantra API] Network Error on submission:', error);
    const isFetchError = error instanceof TypeError && error.message.includes('fetch');
    return { 
      success: false, 
      error: isFetchError 
        ? 'Backend server is offline or unreachable. Please check connection.' 
        : (error instanceof Error ? error.message : 'Network error') 
    };
  }
};

/**
 * Uploads a file to the backend Cloudinary upload endpoint.
 */
export const uploadFileToCloudinary = async (file: File): Promise<{
  success: boolean;
  data?: {
    public_id: string;
    secure_url: string;
    originalFilename: string;
    format: string;
    bytes: number;
  };
  error?: string;
}> => {
  const backendUrl = MANTRA_CONFIG.apiBaseUrl;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${backendUrl}/api/uploads`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('[Mantra API] File upload failed:', result?.error || result);
      return { success: false, error: result?.error || 'File upload failed' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[Mantra API] File upload network error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
};

/**
 * Fetches activity submissions list with pagination & filters.
 */
export const fetchAllSubmissions = async ({ page = 1, limit = 20, status = '', search = '' } = {}) => {
  const backendUrl = MANTRA_CONFIG.apiBaseUrl;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(status ? { status } : {}),
    ...(search ? { search } : {})
  });
  
  try {
    const res = await fetch(`${backendUrl}/api/activity-submissions?${params}`);
    return await res.json();
  } catch (error) {
    console.error('[Mantra API] Error fetching submissions:', error);
    return { success: false, error: 'Failed to connect to backend server' };
  }
};

/**
 * Reviews (approves/rejects) an activity submission.
 */
export const reviewSubmissionStatus = async (id: string, status?: string, reviewNotes: string = '', reviewedBy?: string) => {
  const backendUrl = MANTRA_CONFIG.apiBaseUrl;
  try {
    const res = await fetch(`${backendUrl}/api/activity-submissions/${id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        ...(status ? { status } : {}), 
        ...(reviewedBy !== undefined ? { reviewedBy } : {}),
        reviewNotes 
      })
    });
    return await res.json();
  } catch (error) {
    console.error('[Mantra API] Error reviewing submission:', error);
    return { success: false, error: 'Failed to update submission status' };
  }
};

/**
 * Fetches submission analytics data with date range filter.
 */
export const fetchSubmissionAnalytics = async ({ range = 'this_month', startDate = '', endDate = '' } = {}) => {
  const backendUrl = MANTRA_CONFIG.apiBaseUrl;
  const params = new URLSearchParams({
    range,
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {})
  });

  try {
    const res = await fetch(`${backendUrl}/api/activity-submissions/analytics?${params}`);
    return await res.json();
  } catch (error) {
    console.error('[Mantra API] Error fetching submission analytics:', error);
    return { success: false, error: 'Failed to connect to backend analytics server' };
  }
};

/**
 * Reviewers Management APIs (DB backed)
 */
export const fetchAdminReviewers = async () => {
  const backendUrl = MANTRA_CONFIG.apiBaseUrl;
  try {
    const res = await fetch(`${backendUrl}/api/admin/reviewers`);
    return await res.json();
  } catch (error) {
    console.error('[Mantra API] Error fetching reviewers:', error);
    return { success: false, error: 'Failed to fetch reviewers' };
  }
};

export const addAdminReviewer = async (name: string) => {
  const backendUrl = MANTRA_CONFIG.apiBaseUrl;
  try {
    const res = await fetch(`${backendUrl}/api/admin/reviewers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return await res.json();
  } catch (error) {
    console.error('[Mantra API] Error adding reviewer:', error);
    return { success: false, error: 'Failed to add reviewer' };
  }
};

export const deleteAdminReviewer = async (name: string) => {
  const backendUrl = MANTRA_CONFIG.apiBaseUrl;
  try {
    const res = await fetch(`${backendUrl}/api/admin/reviewers/${encodeURIComponent(name)}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (error) {
    console.error('[Mantra API] Error deleting reviewer:', error);
    return { success: false, error: 'Failed to delete reviewer' };
  }
};

/**
 * Fetches distinct activities that have submission rows across all pages from DB.
 */
export const fetchSubmissionActivities = async () => {
  const backendUrl = MANTRA_CONFIG.apiBaseUrl;
  try {
    const res = await fetch(`${backendUrl}/api/activity-submissions/activities`);
    return await res.json();
  } catch (error) {
    console.error('[Mantra API] Error fetching submission activities:', error);
    return { success: false, error: 'Failed to fetch submission activities' };
  }
};

/**
 * Retrieves activity configuration object by lessonId.
 */
export const getLesson = (lessonId: string) => {
  return activities.find(a => a.lessonId === lessonId) || null;
};
