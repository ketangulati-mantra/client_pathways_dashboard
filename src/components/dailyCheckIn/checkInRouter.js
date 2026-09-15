import { classifyEmotionCluster, EMOTIONAL_CLUSTERS } from './personalizationEngine';

export const CHECKIN_ROUTES = {
  MAINTAIN: 'MAINTAIN',
  IMMEDIATE_SUPPORT: 'IMMEDIATE_SUPPORT',
  FOCUS_ASSESSMENT: 'FOCUS_ASSESSMENT'
};

/**
 * Pure, decoupled routing decision layer for post-Daily Check-In.
 *
 * Evaluates:
 * - Current emotion & emotional cluster
 * - Intensity (1-5)
 * - Multi-checkin recent history patterns (3-day pattern)
 * - Context flags
 *
 * Returns:
 * {
 *   type: 'MAINTAIN' | 'IMMEDIATE_SUPPORT' | 'FOCUS_ASSESSMENT',
 *   reason: string,
 *   ctaText: string,
 *   headline: string,
 *   supporting: string,
 *   targetRoute: string | null
 * }
 */
export function getCheckInRoute({
  primaryEmotion,
  additionalEmotions = [],
  intensity = 3,
  contexts = [],
  reflection = '',
  zone,
  recentHistory = []
}) {
  const emotionId = (primaryEmotion?.id || '').toLowerCase();
  const zoneId = zone?.id || 'high_unpleasant';
  const cluster = classifyEmotionCluster(emotionId, zoneId);

  const isDifficultCluster = (
    cluster === EMOTIONAL_CLUSTERS.HIGH_ENERGY_DIFFICULT ||
    cluster === EMOTIONAL_CLUSTERS.LOW_ENERGY_DIFFICULT
  );

  // 1. Evaluate Recent History (Inspect up to the last 4 previous check-ins)
  let pastDifficultCount = 0;
  if (Array.isArray(recentHistory) && recentHistory.length > 0) {
    const previousEntries = recentHistory.slice(0, 4);
    pastDifficultCount = previousEntries.filter((entry) => {
      const e = (entry.primary_emotion || entry.primaryEmotion || '').toLowerCase();
      const z = entry.emotion_zone || entry.emotionZone || '';
      const c = classifyEmotionCluster(e, z);
      return (
        c === EMOTIONAL_CLUSTERS.HIGH_ENERGY_DIFFICULT ||
        c === EMOTIONAL_CLUSTERS.LOW_ENERGY_DIFFICULT
      );
    }).length;
  }

  // 2. Route C — FOCUS_ASSESSMENT
  // Triggered when current emotion is difficult (intensity >= 3) AND at least 2 previous check-ins were also difficult
  // (forming a persistent 3+ check-in difficulty pattern).
  if (isDifficultCluster && intensity >= 3 && pastDifficultCount >= 2) {
    return {
      type: CHECKIN_ROUTES.FOCUS_ASSESSMENT,
      reason: 'persistent_difficult_pattern_across_recent_checkins',
      ctaText: 'Help me understand what’s going on',
      headline: "It sounds like some of these feelings have been showing up more often lately.",
      supporting: "It might help to take a closer look at what's been affecting you and find the kind of support that fits.",
      targetRoute: '/task/personalized-focus-assessment'
    };
  }

  // 3. Route B — IMMEDIATE_SUPPORT
  // Triggered when current emotion is difficult and intensity >= 3 (isolated or emerging difficulty),
  // or high intensity (4-5) without a 3-day history (help regulate first).
  if (isDifficultCluster && intensity >= 3) {
    return {
      type: CHECKIN_ROUTES.IMMEDIATE_SUPPORT,
      reason: intensity >= 4 ? 'high_intensity_current_emotion' : 'moderate_difficulty_immediate_support',
      ctaText: 'Help me feel a little better',
      headline: intensity >= 4
        ? "It sounds like today is carrying a little more weight than usual."
        : "Let's take a gentle moment for yourself right now.",
      supporting: "Taking a moment to pause and breathe can help you feel a little more grounded.",
      targetRoute: null // Ready for assignActivity() once specific activity mapping is configured
    };
  }

  // 4. Route A — MAINTAIN
  // Triggered for positive, calm, regulated, gratitude states, or mild difficulty (intensity <= 2)
  // without a persistent negative history pattern.
  return {
    type: CHECKIN_ROUTES.MAINTAIN,
    reason: isDifficultCluster ? 'mild_intensity_no_persistent_pattern' : 'positive_or_regulated_state',
    ctaText: 'Keep building on this',
    headline: "Good moments are worth noticing.",
    supporting: "You don't have to hold on to a feeling forever for it to be meaningful.",
    targetRoute: null // Ready for lightweight wellbeing activity
  };
}
