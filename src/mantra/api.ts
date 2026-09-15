import { MANTRA_CONFIG } from './config';
import { activities } from './activities';
import { AssessmentWebhookPayload } from '../utils/assessmentEngine';

export const LOCALHOST_DEV_UID = 'e68792e6ec42acc875be58cbc1bd936c:0c0137f3fd9e92dac3a8f388e8a7d6ee';

/**
 * Returns user ID from query params, session storage, or default localhost dev UID.
 */
export const getCurrentUserId = (): string => {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const uid = params.get('uid') || params.get('user_id') || sessionStorage.getItem('user_id');
  if (uid) return uid;

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return LOCALHOST_DEV_UID;
  }
  return '';
};

/**
 * Returns URL parameters required by the pathway webhook.
 */
const getWebhookContext = () => {
  if (typeof window === 'undefined') {
    return { upaId: null, uid: null };
  }
  const params = new URLSearchParams(window.location.search);
  let uid = params.get('uid');

  if (!uid && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    uid = LOCALHOST_DEV_UID;
  }

  return {
    upaId: params.get('upa_id'),
    uid
  };
};

/**
 * Marks a lesson/activity as completed in Laravel.
 */
export const completeLesson = async (lessonId: string): Promise<boolean> => {
  const activity = activities.find(a => a.lessonId === lessonId);

  if (!activity) {
    console.error(`[Mantra API] Activity not found: ${lessonId}`);
    return false;
  }

  const { upaId, uid } = getWebhookContext();

  if (!upaId) {
    console.error('[Mantra API] Missing upa_id in URL.');
    if (MANTRA_CONFIG.devMode && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return true;
    }
    return false;
  }

  try {
    const response = await fetch(MANTRA_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'complete_activity',
        upa_id: Number(upaId),
        uid: uid || undefined
      })
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || (result && result.success === false)) {
      console.error(
        '[Mantra API] Webhook failed:',
        result?.message || result
      );
      return false;
    }

    if (MANTRA_CONFIG.devMode) {
      console.log('[Mantra API] Activity completed successfully.', result);
    }

    return true;

  } catch (error) {
    console.error('[Mantra API] Network/Webhook Error:', error);
    if (MANTRA_CONFIG.devMode && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return true;
    }
    return false;
  }
};

/**
 * Submits calculated assessment results and triggers activity completion.
 */
export const submitAssessmentResults = async (
  payload: AssessmentWebhookPayload
): Promise<{ success: boolean; error?: string }> => {
  const { upaId, uid } = getWebhookContext();
  const targetUpaId = payload.upa_id || (upaId ? Number(upaId) : undefined);

  if (!targetUpaId) {
    console.warn('[Mantra API] Missing upa_id in assessment submission.');
    if (MANTRA_CONFIG.devMode && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('[Mantra API Dev] Localhost dev bypass for missing upa_id:', payload);
      return { success: true };
    }
    return { success: false, error: 'Missing upa_id in URL context.' };
  }

  try {
    const finalPayload = {
      ...payload,
      upa_id: targetUpaId,
      uid: payload.uid || uid || undefined
    };

    const response = await fetch(MANTRA_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(finalPayload)
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
    if (MANTRA_CONFIG.devMode && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.warn('[Mantra API Dev] Localhost graceful fallback for network error:', error);
      return { success: true };
    }
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



