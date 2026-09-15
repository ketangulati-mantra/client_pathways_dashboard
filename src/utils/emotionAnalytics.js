/**
 * Light, privacy-safe analytics dispatcher for TherapyMantra.
 * Dispatches standard window CustomEvents and logs structured events.
 * 
 * PRIVACY SAFEGUARDS:
 * - NEVER logs or transmits free-text reflections or sensitive narratives.
 * - Only sends categorical IDs (e.g. emotionId, familyId, intensity rating, tier).
 */

export function trackEmotionWheelEvent(eventName, properties = {}) {
  try {
    // Sanitized payload (strip out any freeText or personal notes if passed inadvertently)
    const sanitizedProps = { ...properties };
    delete sanitizedProps.freeText;
    delete sanitizedProps.reflection;
    delete sanitizedProps.notes;

    const eventPayload = {
      event: eventName,
      properties: sanitizedProps,
      timestamp: new Date().toISOString()
    };

    // Dispatch DOM CustomEvent for any listeners (e.g. parent shell, Google Tag Manager, etc.)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mantra_analytics_event', {
          detail: eventPayload
        })
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}`, sanitizedProps);
    }
  } catch (err) {
    console.warn('[Analytics] Non-blocking tracking error:', err);
  }
}
