import { MANTRA_CONFIG } from './config';
import { activities } from './activities';
import { AssessmentWebhookPayload } from '../utils/assessmentEngine';

/**
 * Returns user ID from query params or session storage.
 */
export const getCurrentUserId = (): string => {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get('uid') || params.get('user_id') || sessionStorage.getItem('user_id') || '';
};

/**
 * Returns URL parameters required by the pathway webhook.
 */
const getWebhookContext = () => {
  if (typeof window === 'undefined') {
    return { upaId: null, uid: null };
  }
  const params = new URLSearchParams(window.location.search);

  return {
    upaId: params.get('upa_id'),
    uid: params.get('uid')
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
