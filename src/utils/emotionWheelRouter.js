import { classifyEmotionCluster, EMOTIONAL_CLUSTERS } from '../components/dailyCheckIn/personalizationEngine';

export const EMOTION_SUPPORT_TIERS = {
  POSITIVE_MAINTAIN: 'POSITIVE_MAINTAIN',
  SELF_GUIDED_SUPPORT: 'SELF_GUIDED_SUPPORT',
  STRONGER_SUPPORT: 'STRONGER_SUPPORT'
};

/**
 * Pure decision engine that maps Emotion Wheel discovery state into
 * tailored next steps, activities, and compassionate therapy support options.
 */
export function evaluateEmotionWheelNextStep({
  emotion,
  family,
  intensity = 3,
  selectedContexts = [],
  selectedNeeds = [],
  freeText = '',
  recentHistory = []
}) {
  const emotionId = (emotion?.id || '').toLowerCase();
  const familyId = (family?.id || '').toLowerCase();
  const cluster = classifyEmotionCluster(emotionId, familyId);

  const isDifficultCluster = (
    cluster === EMOTIONAL_CLUSTERS.HIGH_ENERGY_DIFFICULT ||
    cluster === EMOTIONAL_CLUSTERS.LOW_ENERGY_DIFFICULT ||
    ['anger', 'fear', 'sadness'].includes(familyId)
  );

  const isPositiveFamily = ['joy', 'love'].includes(familyId);

  // 1. TIER C: STRONGER SUPPORT
  // Triggered for serious/high-intensity difficult states (intensity >= 4 with acute emotions, or intensity 5)
  // or persistent pattern if history is present.
  const isAcuteEmotion = [
    'despair', 'hopeless', 'grief', 'heartbroken', 'panicked', 'terrified',
    'overwhelmed', 'furious', 'hostile', 'isolated', 'abandoned', 'numb'
  ].includes(emotionId);

  const requiresStrongerSupport = (
    (isDifficultCluster && intensity === 5) ||
    (isDifficultCluster && intensity >= 4 && isAcuteEmotion)
  );

  if (requiresStrongerSupport) {
    return {
      tier: EMOTION_SUPPORT_TIERS.STRONGER_SUPPORT,
      validation: "It sounds like you're carrying a significant amount of weight right now.",
      guidance: "You don't have to navigate heavy moments alone. Talking with a trained therapist can give you dedicated, non-judgmental space to unpack what is happening and find steady ground.",
      primaryAction: {
        type: 'therapy_support',
        title: 'Explore Therapy Support',
        subtitle: 'Connect with a licensed therapist matched to your needs.',
        route: '/task/personalized-focus-assessment', // Clean handoff to focus assessment for tailored care
        ctaLabel: 'Explore Therapy Support →'
      },
      secondaryAction: {
        type: 'self_guided_grounding',
        title: 'Take a gentle moment on your own',
        subtitle: 'Slow down with a gentle grounding practice.',
        activityId: 'journal',
        route: '/task/journal',
        ctaLabel: 'Reflect in Journal →'
      },
      takeawayThought: "You don't have to solve everything right now. Reaching for support is a sign of self-care, not weakness."
    };
  }

  // 2. TIER B: SELF-GUIDED SUPPORT
  // Triggered for mild/moderate difficult emotions (intensity 1-3, or intensity 4 non-acute)
  if (isDifficultCluster) {
    // Tailor recommended registered activity based on emotion & need
    let recommendedActivity = {
      type: 'activity',
      activityId: 'journal',
      title: 'Reflect & Unpack in Journal',
      subtitle: 'Write through what is on your mind to release tension.',
      route: '/task/journal',
      ctaLabel: 'Open Journal →'
    };

    if (familyId === 'fear' || emotionId === 'anxious' || emotionId === 'overwhelmed') {
      recommendedActivity = {
        type: 'activity',
        activityId: 'daily-check-in',
        title: 'Micro-Grounding & Breather',
        subtitle: 'Pause to slow your heart rate and settle your nervous system.',
        route: '/task/daily-check-in',
        ctaLabel: 'Practice Grounding →'
      };
    } else if (familyId === 'sadness' || selectedNeeds.some(n => n.toLowerCase().includes('space') || n.toLowerCase().includes('comfort'))) {
      recommendedActivity = {
        type: 'activity',
        activityId: 'journal',
        title: 'Reflective Journaling',
        subtitle: 'Give yourself space to put words to what is tender today.',
        route: '/task/journal',
        ctaLabel: 'Start Reflection →'
      };
    } else if (familyId === 'anger') {
      recommendedActivity = {
        type: 'activity',
        activityId: 'journal',
        title: 'Clarify Boundaries & Values',
        subtitle: 'Process the charge safely before responding or reacting.',
        route: '/task/journal',
        ctaLabel: 'Process Emotion →'
      };
    }

    return {
      tier: EMOTION_SUPPORT_TIERS.SELF_GUIDED_SUPPORT,
      validation: "Acknowledging what you are feeling is the first step toward finding balance.",
      guidance: "A small, intentional step right now can help your mind and body integrate this feeling without getting stuck in it.",
      primaryAction: recommendedActivity,
      optionalTherapyPrompt: {
        title: 'Want more ongoing guidance?',
        subtitle: 'If this feeling has been lingering, you can explore personalized support.',
        ctaLabel: 'Learn about therapy support →',
        route: '/task/how-can-therapy-help'
      },
      takeawayThought: "One small breath, one small moment of self-kindness is enough for right now."
    };
  }

  // 3. TIER A: POSITIVE / MAINTENANCE (Joy, Love, Calm, Surprise)
  let positiveAction = {
    type: 'activity',
    activityId: 'journal',
    title: 'Capture This Moment in Journal',
    subtitle: 'Write down what made this feel good to anchor positive memories.',
    route: '/task/journal',
    ctaLabel: 'Save in Journal →'
  };

  if (familyId === 'joy') {
    positiveAction = {
      type: 'activity',
      activityId: 'earn-while-you-improve-your-wellbeing',
      title: 'Celebrate Your Wellbeing Momentum',
      subtitle: 'Build on your positive habits and keep your consistency streak going.',
      route: '/task/earn-while-you-improve-your-wellbeing',
      ctaLabel: 'View Wellbeing Habits →'
    };
  }

  return {
    tier: EMOTION_SUPPORT_TIERS.POSITIVE_MAINTAIN,
    validation: "Noticing and celebrating ease and connection strengthens your resilience.",
    guidance: "Savoring what feels good helps your nervous system register stability and positive momentum.",
    primaryAction: positiveAction,
    optionalTherapyPrompt: null, // Zero therapy upsell for positive / regulated states
    takeawayThought: "Let yourself fully receive what is good in this moment."
  };
}
