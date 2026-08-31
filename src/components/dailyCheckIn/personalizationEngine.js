/**
 * Robust Multi-Dimensional Personalization Engine for Daily Check-In
 * Dynamically synthesizes emotional category, specific emotion, intensity (1-5),
 * context tags (activities, people, places, topics), user reflections, and recent history
 * into a rich, structured, and compassionate check-in experience.
 */

// =========================================================================
// 1. EMOTIONAL CLUSTER DEFINITIONS
// =========================================================================
export const EMOTIONAL_CLUSTERS = {
  HIGH_ENERGY_DIFFICULT: 'high_energy_difficult',
  LOW_ENERGY_DIFFICULT: 'low_energy_difficult',
  CALM_REGULATED: 'calm_regulated',
  HIGH_ENERGY_POSITIVE: 'high_energy_positive',
  GRATITUDE_CONNECTION: 'gratitude_connection'
};

export function classifyEmotionCluster(emotionId, zoneId) {
  const eId = (emotionId || '').toLowerCase();

  if (['anxious', 'stressed', 'overwhelmed', 'tense', 'restless', 'angry', 'frustrated', 'panicked', 'peeved'].includes(eId)) {
    return EMOTIONAL_CLUSTERS.HIGH_ENERGY_DIFFICULT;
  }
  if (['sad', 'lonely', 'drained', 'tired', 'down', 'meh', 'discouraged', 'numb', 'spent'].includes(eId)) {
    return EMOTIONAL_CLUSTERS.LOW_ENERGY_DIFFICULT;
  }
  if (['calm', 'relaxed', 'peaceful', 'content', 'safe', 'grounded', 'relieved'].includes(eId)) {
    return EMOTIONAL_CLUSTERS.CALM_REGULATED;
  }
  if (['excited', 'energized', 'inspired', 'joyful', 'motivated', 'proud', 'confident', 'curious', 'playful'].includes(eId)) {
    return EMOTIONAL_CLUSTERS.HIGH_ENERGY_POSITIVE;
  }
  if (['grateful', 'loved', 'connected', 'hopeful', 'secure'].includes(eId)) {
    return EMOTIONAL_CLUSTERS.GRATITUDE_CONNECTION;
  }

  // Zone fallback
  if (zoneId === 'high_unpleasant') return EMOTIONAL_CLUSTERS.HIGH_ENERGY_DIFFICULT;
  if (zoneId === 'low_unpleasant') return EMOTIONAL_CLUSTERS.LOW_ENERGY_DIFFICULT;
  if (zoneId === 'low_pleasant') return EMOTIONAL_CLUSTERS.CALM_REGULATED;
  return EMOTIONAL_CLUSTERS.HIGH_ENERGY_POSITIVE;
}

// =========================================================================
// 2. RECENT HISTORY PATTERN RECOGNITION (NON-DIAGNOSTIC)
// =========================================================================
function analyzeRecentHistoryPatterns(history = [], currentEmotionId) {
  if (!Array.isArray(history) || history.length < 2) return null;

  const recent = history.slice(0, 5);
  const difficultCount = recent.filter((r) => {
    const e = (r.primary_emotion || '').toLowerCase();
    return ['stressed', 'anxious', 'overwhelmed', 'tired', 'drained', 'frustrated', 'sad'].includes(e);
  }).length;

  const positiveCount = recent.filter((r) => {
    const e = (r.primary_emotion || '').toLowerCase();
    return ['happy', 'calm', 'inspired', 'grateful', 'excited', 'peaceful', 'content'].includes(e);
  }).length;

  if (difficultCount >= 3) {
    return "Stress or strain has appeared in a few of your recent check-ins. Giving yourself permission to pause is especially important right now.";
  }

  if (positiveCount >= 3) {
    return "You've had a few lighter moments across your recent check-ins. Noticing these shifts helps anchor your sense of stability.";
  }

  return null;
}

// =========================================================================
// 3. CORE GENERATOR FUNCTION
// =========================================================================
export function generateCheckInExperience({
  primaryEmotion,
  additionalEmotions = [],
  intensity = 3,
  contexts = [],
  reflection = '',
  zone,
  recentHistory = []
}) {
  const emotionName = primaryEmotion?.name || 'this moment';
  const emotionId = (primaryEmotion?.id || '').toLowerCase();
  const zoneId = zone?.id || 'high_unpleasant';

  const cluster = classifyEmotionCluster(emotionId, zoneId);
  const historyPattern = analyzeRecentHistoryPatterns(recentHistory, emotionId);

  // Context flags
  const hasContext = (...items) => items.some((i) => contexts.includes(i));
  const isWork = hasContext('Work', 'Workplace', 'Working', 'Job', 'Office');
  const isStudy = hasContext('School', 'Studies', 'Studying', 'Class');
  const isFriends = hasContext('Friends', 'Socializing', 'Social');
  const isPartner = hasContext('Partner', 'Dating', 'Relationship');
  const isFamily = hasContext('Family', 'Parents', 'Kids');
  const isHome = hasContext('Home', 'House');
  const isAlone = hasContext('By myself', 'Alone');
  const isMoney = hasContext('Money', 'Finances');
  const isExercise = hasContext('Exercising', 'Gym', 'Workout');

  const isHighIntensity = intensity >= 4;
  const isLowIntensity = intensity <= 2;

  // Initialize output containers
  let step5Headline = "";
  let step5Supporting = "";
  let recommendation = null;

  let completionHeadline = "";
  let completionSupporting = "";
  let closureAffirmation = "";

  let visualSceneType = "settling_fragments";
  let accentColor = zone?.accent || '#38bdf8';
  let glowColor = zone?.glowColor || 'rgba(56, 189, 248, 0.45)';
  let atmosphere = 'radial-gradient(circle at 50% 25%, rgba(56, 189, 248, 0.16) 0%, rgba(13, 27, 42, 0.98) 75%)';

  // =========================================================================
  // SCENARIO 1: HIGH-ENERGY DIFFICULT (Overwhelmed, Stressed, Anxious, Tense)
  // =========================================================================
  if (cluster === EMOTIONAL_CLUSTERS.HIGH_ENERGY_DIFFICULT) {
    visualSceneType = "settling_fragments";
    accentColor = '#f87171';
    glowColor = 'rgba(248, 113, 113, 0.45)';
    atmosphere = 'radial-gradient(circle at 50% 25%, rgba(248, 113, 113, 0.18) 0%, rgba(76, 29, 149, 0.18) 45%, rgba(13, 27, 42, 0.98) 80%)';

    if (emotionId === 'overwhelmed') {
      if (isWork || isMoney) {
        step5Headline = isHighIntensity
          ? "Work and responsibilities are asking a lot of you right now."
          : "Work seems to be taking up a lot of mental space today.";
        step5Supporting = isHighIntensity
          ? "When multiple demands pile up at once, trying to hold them all can feel exhausting. You don't need to solve everything today."
          : "Taking one thing off your mental plate helps clear a little room to breathe.";
        recommendation = {
          category: 'Prioritization',
          iconType: 'list',
          title: 'Clear one priority',
          description: 'What is the single task that actually needs your attention first? Let everything else wait for a moment.',
          duration: '2 min',
          cta: 'Clear priority',
          route: '/task/first-therapy-session',
          accentColor: '#f87171'
        };
      } else {
        step5Headline = "You've got a lot sitting with you right now.";
        step5Supporting = "When several things pile up at once, trying to untangle all of them at once is too heavy. Let's make space for just one breath.";
        recommendation = {
          category: 'Mental Unloading',
          iconType: 'compass',
          title: "Untangle what's on your mind",
          description: 'Putting the single heaviest pressure into words makes it feel much easier to hold.',
          duration: '2 min',
          cta: 'Untangle thoughts',
          route: '/task/first-therapy-session',
          accentColor: '#f87171'
        };
      }

      completionHeadline = "You don't have to carry it all at once.";
      completionSupporting = "Taking time to step back and acknowledge what is sitting with you gives your mind room to settle.";
      closureAffirmation = "You paused before the feeling took over.";
    } else if (['anxious', 'panicked', 'restless', 'worried'].includes(emotionId)) {
      step5Headline = isHighIntensity
        ? "Your mind seems to be carrying a lot of speed right now."
        : "You're noticing some uneasiness in the background.";
      step5Supporting = "You don't have to figure everything out this minute. Let your body catch up with your breath.";
      recommendation = {
        category: 'Sensory Grounding',
        iconType: 'wind',
        title: 'Anchor your physical senses',
        description: 'Slow down racing thoughts by gently focusing on three physical objects around you.',
        duration: '2 min',
        cta: 'Anchor senses',
        route: '/task/first-therapy-session',
        accentColor: '#818cf8'
      };

      completionHeadline = "You made space for yourself in the middle of the noise.";
      completionSupporting = "When thoughts are moving fast, giving yourself a pause is the kindest thing you can do.";
      closureAffirmation = "You grounded yourself in the present.";
    } else if (['frustrated', 'angry', 'peeved'].includes(emotionId)) {
      if (isPartner || isFamily) {
        step5Headline = "Something in your interactions isn't sitting right.";
        step5Supporting = "Before continuing the conversation, giving yourself a quiet moment helps you find clarity.";
        recommendation = {
          category: 'Taking Space',
          iconType: 'pause',
          title: 'Pause before responding',
          description: 'Give yourself a moment to understand what you need before continuing.',
          duration: '2 min',
          cta: 'Take a pause',
          route: '/task/first-therapy-session',
          accentColor: '#f87171'
        };
      } else {
        step5Headline = "Something clearly crossed a boundary today.";
        step5Supporting = "Frustration is your body's signal that something felt unfair or strained. Giving it room to settle comes first.";
        recommendation = {
          category: 'De-escalation',
          iconType: 'wind',
          title: 'Release the immediate heat',
          description: 'A physical tension release to help reset your nervous system and clear your head.',
          duration: '2 min',
          cta: 'Release tension',
          route: '/task/first-therapy-session',
          accentColor: '#f87171'
        };
      }

      completionHeadline = "You paused before the feeling took over.";
      completionSupporting = "Giving yourself room to acknowledge frustration is where calm and clarity begin.";
      closureAffirmation = "You chose reflection over reaction.";
    } else {
      // Tense / Generic high-energy difficult
      step5Headline = "Your body is holding onto some tight strain.";
      step5Supporting = "Notice where you're bracing, often it's shoulders, jaw, or chest.";
      recommendation = {
        category: 'Body Release',
        iconType: 'feather',
        title: 'Soft shoulder & jaw release',
        description: 'Consciously drop your shoulders, soften your brow, and let your body unclamp.',
        duration: '2 min',
        cta: 'Release strain',
        route: '/task/first-therapy-session',
        accentColor: '#38bdf8'
      };

      completionHeadline = "You noticed where your body was holding tension.";
      completionSupporting = "Allowing yourself to unclamp and breathe is a quiet, powerful act of care.";
      closureAffirmation = "You gave your body permission to soften.";
    }
  }

  // =========================================================================
  // SCENARIO 2: LOW-ENERGY DIFFICULT (Sad, Lonely, Drained, Tired, Down)
  // =========================================================================
  else if (cluster === EMOTIONAL_CLUSTERS.LOW_ENERGY_DIFFICULT) {
    visualSceneType = "embracing_light";
    accentColor = '#60a5fa';
    glowColor = 'rgba(96, 165, 250, 0.45)';
    atmosphere = 'radial-gradient(circle at 50% 25%, rgba(96, 165, 250, 0.16) 0%, rgba(30, 41, 59, 0.35) 45%, rgba(13, 27, 42, 0.98) 80%)';

    if (['tired', 'drained', 'spent'].includes(emotionId)) {
      step5Headline = "Your body is asking for a little stillness.";
      step5Supporting = "Rest is not a reward you have to earn, it's what your system needs right now.";
      recommendation = {
        category: 'Rest Permission',
        iconType: 'feather',
        title: 'A restful release',
        description: 'Let your shoulders drop and give your eyes a break for two quiet minutes.',
        duration: '2 min',
        cta: 'Rest a moment',
        route: '/task/first-therapy-session',
        accentColor: '#60a5fa'
      };

      completionHeadline = "You listened to what your body needed.";
      completionSupporting = "Rest is not something you have to earn, it's what your nervous system is asking for right now.";
      closureAffirmation = "You honored your body's need to slow down.";
    } else if (emotionId === 'lonely') {
      step5Headline = isAlone
        ? "Being with yourself can feel heavy sometimes."
        : "You can feel isolated even when people are around.";
      step5Supporting = "You don't need to force yourself to feel differently right now. Being patient with this feeling is enough.";
      recommendation = {
        category: 'Self-Compassion',
        iconType: 'heart',
        title: 'A gentle self-check',
        description: 'Give yourself the same warmth and understanding you would offer a close friend.',
        duration: '2 min',
        cta: 'Offer self-kindness',
        route: '/task/how-can-therapy-help',
        accentColor: '#60a5fa'
      };

      completionHeadline = "You showed up for yourself today.";
      completionSupporting = "Even on quieter or more isolated days, checking in with yourself is a meaningful act of presence.";
      closureAffirmation = "You are worthy of care and patience.";
    } else {
      // Sad / Down / Meh
      step5Headline = "It's okay to have a heavier moment.";
      step5Supporting = "You don't have to force yourself to feel differently right now. Giving yourself grace is enough.";
      recommendation = {
        category: 'Self-Compassion',
        iconType: 'heart',
        title: 'Give yourself permission to pause',
        description: 'A quiet, tender moment without any expectation to fix or change anything.',
        duration: '2 min',
        cta: 'Take gentle pause',
        route: '/task/how-can-therapy-help',
        accentColor: '#60a5fa'
      };

      completionHeadline = "Even on the harder days, you showed up for yourself.";
      completionSupporting = "You don't have to be at your best for this moment to matter. What you feel is valid.";
      closureAffirmation = "You made room for what is real.";
    }
  }

  // =========================================================================
  // SCENARIO 3: CALM / REGULATED (Calm, Relaxed, Peaceful, Content, Grounded)
  // =========================================================================
  else if (cluster === EMOTIONAL_CLUSTERS.CALM_REGULATED) {
    visualSceneType = "breathing_waves";
    accentColor = '#34d399';
    glowColor = 'rgba(52, 211, 153, 0.45)';
    atmosphere = 'radial-gradient(circle at 50% 25%, rgba(52, 211, 153, 0.22) 0%, rgba(6, 78, 59, 0.2) 45%, rgba(13, 27, 42, 0.98) 80%)';

    if (isHome) {
      step5Headline = "You've found a steady space to settle.";
      step5Supporting = "Having a moment of ease in your space gives your nervous system a chance to recharge.";
    } else {
      step5Headline = "You've found a little space to breathe.";
      step5Supporting = "Quiet moments like this are a steady foundation for your nervous system.";
    }

    recommendation = {
      category: 'Mindful Noticing',
      iconType: 'feather',
      title: 'Stay with the calm',
      description: 'Take a few seconds to notice what is helping you feel this way right now.',
      duration: '2 min',
      cta: 'Stay with ease',
      route: '/task/first-therapy-session',
      accentColor: '#34d399'
    };

    completionHeadline = "You noticed the peace that was already there.";
    completionSupporting = "Quiet moments like this are a steady foundation you can return to anytime.";
    closureAffirmation = "You allowed yourself to settle.";
  }

  // =========================================================================
  // SCENARIO 4: HIGH-ENERGY POSITIVE (Excited, Inspired, Joyful, Motivated)
  // =========================================================================
  else if (cluster === EMOTIONAL_CLUSTERS.HIGH_ENERGY_POSITIVE) {
    visualSceneType = "sunrise_sparks";
    accentColor = '#fbbf24';
    glowColor = 'rgba(251, 191, 36, 0.55)';
    atmosphere = 'radial-gradient(circle at 50% 25%, rgba(251, 191, 36, 0.22) 0%, rgba(217, 119, 6, 0.12) 45%, rgba(13, 27, 42, 0.98) 80%)';

    if (['inspired', 'curious'].includes(emotionId)) {
      if (isStudy) {
        step5Headline = "Something about learning has sparked your energy.";
        step5Supporting = "Curiosity and fresh ideas are showing up. Let's capture that momentum before it fades.";
      } else if (isWork || isExercise) {
        step5Headline = "Something has sparked your energy.";
        step5Supporting = "Creativity and drive are flowing, let's channel that into something real.";
      } else {
        step5Headline = "Something has sparked your energy.";
        step5Supporting = "Curiosity is an invitation to explore. Follow that spark before it slips away.";
      }

      recommendation = {
        category: 'Action',
        iconType: 'sparkles',
        title: 'Build on the momentum',
        description: "What's one tiny action you could take while this energy is still with you?",
        duration: '2 min',
        cta: 'Build momentum',
        route: '/task/first-therapy-session',
        accentColor: '#fbbf24'
      };

      completionHeadline = "Something meaningful is asking for your attention.";
      completionSupporting = "Curiosity and fresh energy are flowing. Let that spark unfold in its own natural time.";
      closureAffirmation = "You channeled your inspiration.";
    } else if (['happy', 'joyful', 'playful'].includes(emotionId)) {
      if (isFriends || isFamily) {
        step5Headline = "Being around people who matter added something good to your day.";
        step5Supporting = "Shared moments of warmth and laughter are deeply nourishing.";
        recommendation = {
          category: 'Connection',
          iconType: 'sparkles',
          title: 'Share the good moment',
          description: 'Tell someone what made today feel good or save this feeling in a short note.',
          duration: '2 min',
          cta: 'Share moment',
          route: '/task/first-therapy-session',
          accentColor: '#fbbf24'
        };
      } else {
        step5Headline = "Something feels good right now. Let yourself enjoy that.";
        step5Supporting = "When joy is present, letting yourself savor it helps anchor it for the day.";
        recommendation = {
          category: 'Savoring',
          iconType: 'sparkles',
          title: 'Savor this moment',
          description: "Take a moment to notice what's making today feel good without rushing past it.",
          duration: '2 min',
          cta: 'Savor this feeling',
          route: '/task/first-therapy-session',
          accentColor: '#fbbf24'
        };
      }

      completionHeadline = "Hold onto this moment. You helped create it.";
      completionSupporting = "Letting yourself enjoy what feels good without rushing past it is a gift to yourself.";
      closureAffirmation = "You made room for joy.";
    } else {
      // Excited / Motivated / Proud
      step5Headline = "You've got some real energy behind you right now.";
      step5Supporting = "Forward momentum is a wonderful feeling, give it a gentle channel.";
      recommendation = {
        category: 'Momentum',
        iconType: 'sparkles',
        title: 'Capture the excitement',
        description: "Write down what you're looking forward to so you can revisit this spark later.",
        duration: '2 min',
        cta: 'Capture spark',
        route: '/task/first-therapy-session',
        accentColor: '#fbbf24'
      };

      completionHeadline = "Forward energy is with you right now.";
      completionSupporting = "Carry that momentum into whatever you choose to do next, one step at a time.";
      closureAffirmation = "You celebrated your momentum.";
    }
  }

  // =========================================================================
  // SCENARIO 5: GRATITUDE / CONNECTION (Grateful, Loved, Connected, Hopeful)
  // =========================================================================
  else {
    visualSceneType = "sunrise_sparks";
    accentColor = '#34d399';
    glowColor = 'rgba(52, 211, 153, 0.45)';
    atmosphere = 'radial-gradient(circle at 50% 25%, rgba(52, 211, 153, 0.2) 0%, rgba(251, 191, 36, 0.12) 45%, rgba(13, 27, 42, 0.98) 80%)';

    step5Headline = "There's something worth appreciating in this moment.";
    step5Supporting = "Noticing the good helps anchor your sense of peace and warmth.";
    recommendation = {
      category: 'Appreciation',
      iconType: 'sparkles',
      title: 'A moment of gratitude',
      description: "Name one thing you're genuinely glad to have today.",
      duration: '2 min',
      cta: 'Notice gratitude',
      route: '/task/first-therapy-session',
      accentColor: '#34d399'
    };

    completionHeadline = "You made space for what matters.";
    completionSupporting = "Noticing what is good grounds your thoughts and brings warmth to the rest of your day.";
    closureAffirmation = "You anchored yourself in gratitude.";
  }

  return {
    cluster,
    intensity,
    historyPattern,
    nextStep: {
      openingHeadline: step5Headline,
      supportingMessage: step5Supporting,
      recommendation
    },
    completion: {
      headline: completionHeadline,
      supporting: completionSupporting,
      closureAffirmation,
      atmosphere,
      accentColor,
      glowColor
    },
    visualTheme: {
      sceneType: visualSceneType,
      accentColor,
      glowColor,
      atmosphere
    },
    summary: {
      primaryEmotion: emotionName,
      zone: zone?.name || 'Daily Check-In',
      intensity,
      contexts,
      reflection,
      recommendationTitle: recommendation?.title
    }
  };
}
