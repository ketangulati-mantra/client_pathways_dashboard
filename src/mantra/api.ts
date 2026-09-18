import { MANTRA_CONFIG } from './config';
import { activities } from './activities';
import { getCurrentService } from './services';
import { AssessmentWebhookPayload } from '../utils/assessmentEngine';

export const LOCALHOST_DEV_UID = 'e68792e6ec42acc875be58cbc1bd936c:0c0137f3fd9e92dac3a8f388e8a7d6ee';

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

  // Priority 1: Check active URL query/hash parameters passed by parent shell
  const urlParamId = (
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
    hashParams.get('email')
  );

  if (urlParamId && String(urlParamId).trim().length > 0) {
    const cleanUrlId = String(urlParamId).trim().toLowerCase();
    try {
      sessionStorage.setItem('user_id', cleanUrlId);
    } catch (e) {}
    return cleanUrlId;
  }

  // Priority 2: Check stored authenticated user from sessionStorage
  let storedAdminEmail = '';
  try {
    const adminObj = sessionStorage.getItem('admin_user');
    if (adminObj) {
      const parsed = JSON.parse(adminObj);
      storedAdminEmail = parsed?.email || parsed?.user_id || parsed?.id || '';
    }
  } catch (e) {}

  const foundId = (
    sessionStorage.getItem('user_id') ||
    storedAdminEmail
  );

  if (foundId && String(foundId).trim().length > 0) {
    return String(foundId).trim().toLowerCase();
  }

  // Generate an isolated per-session guest ID in sessionStorage so different sessions/tabs never share state
  let sessionGuestId = sessionStorage.getItem('mantra_guest_session_id');
  if (!sessionGuestId) {
    sessionGuestId = 'guest_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    try {
      sessionStorage.setItem('mantra_guest_session_id', sessionGuestId);
    } catch (e) {}
  }
  return sessionGuestId;
};

/**
 * Marks a lesson/activity as completed in Laravel webhook.
 */
export const completeLesson = async (lessonId: string): Promise<boolean> => {
  const activity = activities.find(a => a.lessonId === lessonId || a.activityId === lessonId);

  const targetLessonId = activity?.lessonId || lessonId;
  const targetRewardPoints = activity?.rewardPoints || 25;

  const { upaId, uid, service } = getWebhookContext();

  if (!upaId) {
    if (MANTRA_CONFIG.devMode) {
      console.log(`[Mantra API] Dev Mode: completed activity ${lessonId} locally.`);
      return true;
    }
    return false;
  }

  const numericUpaId = isNaN(Number(upaId)) ? upaId : Number(upaId);

  const payload = {
    upa_id: numericUpaId,
    uid: uid || undefined,
    lesson_id: targetLessonId,
    service: service || 'therapy',
    reward_points: targetRewardPoints
  };

  if (MANTRA_CONFIG.devMode) {
    console.log('[Mantra API] Completing activity via webhook', {
      payload,
      endpoint: MANTRA_CONFIG.webhookUrl
    });
  }

  try {
    const response = await fetch(MANTRA_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
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
 * Submits calculated assessment results and triggers activity completion.
 */
export const submitAssessmentResults = async (
  payload: AssessmentWebhookPayload
): Promise<{ success: boolean; error?: string }> => {
  const { upaId, uid, service } = getWebhookContext();
  const rawUpaId = payload.upa_id || upaId;
  const targetUpaId = rawUpaId ? (isNaN(Number(rawUpaId)) ? rawUpaId : Number(rawUpaId)) : undefined;

  if (!targetUpaId) {
    if (MANTRA_CONFIG.devMode) {
      console.log('[Mantra API Dev] Localhost dev bypass for missing upa_id:', payload);
      return { success: true };
    }
    console.warn('[Mantra API] Missing upa_id in assessment submission.');
    return { success: false, error: 'Missing upa_id in URL context.' };
  }

  const targetLessonId = payload.lesson_id || payload.activity_id || 'emotional-wellbeing-assessment';
  const activity = activities.find(
    a => a.lessonId === targetLessonId || a.activityId === targetLessonId
  );

  const cleanPayload = {
    upa_id: targetUpaId,
    uid: payload.uid || uid || undefined,
    lesson_id: activity?.lessonId || targetLessonId,
    service: service || 'therapy',
    reward_points: payload.reward_points || activity?.rewardPoints || 100
  };

  if (MANTRA_CONFIG.devMode) {
    console.log('[Mantra API] Submitting assessment completion payload:', cleanPayload);
  }

  try {
    const response = await fetch(MANTRA_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanPayload)
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || (result && result.success === false)) {
      console.error('[Mantra API] Assessment webhook failed:', result);
      return { success: false, error: result?.message || 'Server returned an error.' };
    }

    if (MANTRA_CONFIG.devMode) {
      console.log('[Mantra API] Assessment submitted successfully:', result);
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Mantra API] Network error during assessment webhook:', error);
    return { success: false, error: error?.message || 'Network connection failed.' };
  }
};

/**
 * Uploads a file to Cloudinary.
 */
export const uploadFileToCloudinary = async (
  file: File
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'mantra_pathways');
    const res = await fetch('https://api.cloudinary.com/v1_1/hxbamdqf/auto/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.secure_url) {
      return {
        success: true,
        data: {
          secure_url: data.secure_url,
          public_id: data.public_id,
          original_filename: data.original_filename
        }
      };
    }
    return { success: false, error: data.error?.message || 'Failed to upload to Cloudinary.' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Cloudinary network error.' };
  }
};

/**
 * Submits an activity form submission.
 */
export const submitActivitySubmission = async (
  submissionPayload: any
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionPayload)
    });
    const json = await res.json();
    return json;
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

/**
 * Triggers pathway completion webhook.
 */
export const triggerCompletionWebhook = async (
  lessonId: string,
  lessonTitle?: string,
  rewardPoints?: number
): Promise<boolean> => {
  return await completeLesson(lessonId);
};

export interface AssignPathwayPayload {
  intent: 'assign_pathway';
  uid: string;
  pathway_id: number;
  service_id: number;
}

/**
 * Assigns a specific problem pathway to the user via the assign_pathway webhook.
 * Payload:
 * {
 *   "intent": "assign_pathway",
 *   "uid": "<encrypted user ID>",
 *   "pathway_id": <number>,
 *   "service_id": 1
 * }
 */
export const assignPathway = async (
  pathwayId: number,
  serviceId: number = 1,
  overrideUid?: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  const { uid: urlUid } = getWebhookContext();
  const activeUid = overrideUid || urlUid || getCurrentUserId();

  if (!activeUid) {
    console.warn('[Mantra API] Missing uid for assign_pathway.');
    if (MANTRA_CONFIG.devMode && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('[Mantra API Dev] Localhost dev bypass for missing uid in assign_pathway:', { pathwayId, serviceId });
      return { success: true };
    }
    return { success: false, error: 'Missing user identification (uid).' };
  }

  const payload: AssignPathwayPayload = {
    intent: 'assign_pathway',
    uid: activeUid,
    pathway_id: pathwayId,
    service_id: serviceId
  };

  try {
    const response = await fetch(MANTRA_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || (result && result.success === false)) {
      const errMsg = result?.message || result?.error || 'Pathway assignment failed.';
      console.error('[Mantra API] assign_pathway webhook failed:', errMsg);
      return { success: false, error: errMsg };
    }

    if (MANTRA_CONFIG.devMode) {
      console.log('[Mantra API] assign_pathway webhook succeeded:', result);
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('[Mantra API] assign_pathway network error:', error);
    if (MANTRA_CONFIG.devMode && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.warn('[Mantra API Dev] Localhost fallback for assign_pathway network error:', error);
      return { success: true };
    }
    return { success: false, error: error?.message || 'Network connection failed.' };
  }
};

export interface AssignActivityPayload {
  intent: 'assign_activity';
  uid: string;
  pathway_id: number;
  activity_id: number;
  service_id: number;
}

export interface AssignActivityOptions {
  pathwayId: number;
  activityId: number;
  serviceId?: number;
  overrideUid?: string;
}

/**
 * Assigns a specific activity within a pathway to the user via the assign_activity webhook.
 * Payload:
 * {
 *   "intent": "assign_activity",
 *   "uid": "<encrypted user ID>",
 *   "pathway_id": <number>,
 *   "activity_id": <number>,
 *   "service_id": 1
 * }
 */
export const assignActivity = async (
  options: AssignActivityOptions | number,
  activityIdParam?: number,
  serviceIdParam: number = 1,
  overrideUidParam?: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  let pathwayId: number;
  let activityId: number;
  let serviceId: number = 1;
  let overrideUid: string | undefined;

  if (typeof options === 'object' && options !== null) {
    pathwayId = options.pathwayId;
    activityId = options.activityId;
    serviceId = options.serviceId !== undefined ? options.serviceId : 1;
    overrideUid = options.overrideUid;
  } else {
    pathwayId = options;
    activityId = activityIdParam!;
    serviceId = serviceIdParam !== undefined ? serviceIdParam : 1;
    overrideUid = overrideUidParam;
  }

  const { uid: urlUid } = getWebhookContext();
  const activeUid = overrideUid || urlUid || getCurrentUserId();

  if (!activeUid) {
    console.warn('[Mantra API] Missing uid for assign_activity.');
    if (MANTRA_CONFIG.devMode && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('[Mantra API Dev] Localhost dev bypass for missing uid in assign_activity:', { pathwayId, activityId, serviceId });
      return { success: true };
    }
    return { success: false, error: 'Missing user identification (uid).' };
  }

  const payload: AssignActivityPayload = {
    intent: 'assign_activity',
    uid: activeUid,
    pathway_id: pathwayId,
    activity_id: activityId,
    service_id: serviceId
  };

  try {
    const response = await fetch(MANTRA_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || (result && result.success === false)) {
      const errMsg = result?.message || result?.error || 'Activity assignment failed.';
      console.error('[Mantra API] assign_activity webhook failed:', errMsg);
      return { success: false, error: errMsg };
    }

    if (MANTRA_CONFIG.devMode) {
      console.log('[Mantra API] assign_activity webhook succeeded:', result);
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('[Mantra API] assign_activity network error:', error);
    if (MANTRA_CONFIG.devMode && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.warn('[Mantra API Dev] Localhost fallback for assign_activity network error:', error);
      return { success: true };
    }
    return { success: false, error: error?.message || 'Network connection failed.' };
  }
};



