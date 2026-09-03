/**
 * Highly Dynamic, Multi-Variable Recommendation Engine for Daily Check-In
 * Evaluates emotional category, specific emotion, intensity (1-5), and context dimensions
 * (activity, who was around, location, thoughts) to deliver human, contextually accurate guidance.
 */

export function generatePersonalizedNextStep({
  primaryEmotion,
  additionalEmotions = [],
  intensity = 3,
  contexts = [],
  reflection = '',
  zone
}) {
  const emotionName = primaryEmotion?.name || 'this moment';
  const emotionId = (primaryEmotion?.id || '').toLowerCase();
  const zoneId = zone?.id || 'high_unpleasant';

  const hasContext = (...items) => items.some((item) => contexts.includes(item));
  const isHighIntensity = intensity >= 4;
  const isLowIntensity = intensity <= 2;

  // Context flags
  const isWorkContext = hasContext('Work', 'Workplace', 'Working', 'Studies', 'School');
  const isRelationshipContext = hasContext('Partner', 'Family', 'Relationships', 'Friends');
  const isPartner = hasContext('Partner');
  const isAlone = hasContext('By myself');
  const isFriends = hasContext('Friends', 'Socializing');
  const isExercise = hasContext('Exercising', 'Gym');
  const isHome = hasContext('Home');

  // Defaults
  let openingHeadline = "You've got a lot sitting with you right now.";
  let supportingMessage = "When several things feel heavy at once, you don't have to solve it all today.";
  let recommendation = {
    category: 'Reflection',
    iconType: 'compass',
    title: "Untangle what's on your mind",
    description: "Putting the single heaviest pressure into words helps loosen mental tightness.",
    duration: '2 min',
    cta: 'Try this →',
    route: '/task/first-therapy-session',
    accentColor: '#38bdf8'
  };

  // =========================================================================
  // 1. OVERWHELMED & STRESSED SCENARIOS
  // =========================================================================
  if (['overwhelmed', 'stressed'].includes(emotionId) || (zoneId === 'high_unpleasant' && isHighIntensity)) {
    if (isWorkContext) {
      openingHeadline = isHighIntensity
        ? "You've got a lot sitting on your mind right now."
        : "It sounds like work is asking a lot from you today.";
      supportingMessage = "You don't need to solve everything at once. Let's make a little space for one thing at a time.";
      recommendation = {
        category: 'Prioritization',
        iconType: 'list',
        title: 'Clear one priority',
        description: 'Write down the single task that actually needs your attention first.',
        duration: '2 min',
        cta: 'Clear priority →',
        route: '/task/first-therapy-session',
        accentColor: '#f87171'
      };
    } else if (isRelationshipContext && isHome) {
      openingHeadline = "Things feel heavy around your space right now.";
      supportingMessage = "When home pressures build up, taking a small step back helps you find your footing.";
      recommendation = {
        category: 'Taking Space',
        iconType: 'wind',
        title: 'Create a little breathing room',
        description: 'Step away for a few minutes before taking on another conversation or chore.',
        duration: '3 min',
        cta: 'Take space →',
        route: '/task/first-therapy-session',
        accentColor: '#f87171'
      };
    } else {
      openingHeadline = "You've got a lot sitting on your mind right now.";
      supportingMessage = "You don't need to solve everything at once. Let's make a little space for one thing at a time.";
      recommendation = {
        category: 'Prioritization',
        iconType: 'list',
        title: "Untangle what's on your mind",
        description: "Naming one thing that's weighing on you makes it feel easier to hold.",
        duration: '3 min',
        cta: 'Untangle thoughts →',
        route: '/task/first-therapy-session',
        accentColor: '#f87171'
      };
    }
  }

  // =========================================================================
  // 2. ANXIOUS / PANICKED / RESTLESS SCENARIOS
  // =========================================================================
  else if (['anxious', 'panicked', 'restless', 'worried', 'uneasy'].includes(emotionId)) {
    openingHeadline = isHighIntensity
      ? "Your mind seems to be carrying a lot right now."
      : "You're noticing some uneasiness in the background.";
    supportingMessage = "You don't have to figure everything out this minute. Let your body catch up with your breath.";
    recommendation = {
      category: 'Regulation',
      iconType: 'wind',
      title: 'Anchor your physical senses',
      description: 'A quick sensory exercise to slow down racing thoughts and ground your body.',
      duration: '2 min',
      cta: 'Anchor senses →',
      route: '/task/first-therapy-session',
      accentColor: '#38bdf8'
    };
  }

  // =========================================================================
  // 3. FRUSTRATED & ANGRY SCENARIOS
  // =========================================================================
  else if (['frustrated', 'angry', 'peeved'].includes(emotionId)) {
    if (isPartner || isRelationshipContext) {
      openingHeadline = "Something clearly isn't sitting right with you.";
      supportingMessage = "Before reacting, giving yourself a little space can make all the difference.";
      recommendation = {
        category: 'Taking Space',
        iconType: 'pause',
        title: 'Pause before responding',
        description: 'Give yourself a moment to understand what you feel before continuing the conversation.',
        duration: '2 min',
        cta: 'Take a pause →',
        route: '/task/first-therapy-session',
        accentColor: '#f87171'
      };
    } else {
      openingHeadline = "Something clearly isn't sitting right with you.";
      supportingMessage = "Frustration is your body's signal that a boundary or expectation was crossed.";
      recommendation = {
        category: 'De-escalation',
        iconType: 'wind',
        title: 'Release the immediate heat',
        description: 'A 2-minute physical tension release to help reset your nervous system.',
        duration: '2 min',
        cta: 'Release tension →',
        route: '/task/first-therapy-session',
        accentColor: '#f87171'
      };
    }
  }

  // =========================================================================
  // 4. PHYSICAL TENSION SCENARIOS
  // =========================================================================
  else if (['tense'].includes(emotionId)) {
    openingHeadline = "Your body is holding onto some tight strain.";
    supportingMessage = "Notice where you're bracing—often it's shoulders, jaw, or chest.";
    recommendation = {
      category: 'Body Release',
      iconType: 'feather',
      title: 'Soft shoulder & jaw release',
      description: 'A guided somatic scan to consciously drop your shoulders and soften your brow.',
      duration: '2 min',
      cta: 'Release strain →',
      route: '/task/first-therapy-session',
      accentColor: '#38bdf8'
    };
  }

  // =========================================================================
  // 5. HAPPY, JOYFUL, PLAYFUL SCENARIOS
  // =========================================================================
  else if (['happy', 'joyful', 'playful'].includes(emotionId)) {
    if (isFriends || isRelationshipContext) {
      openingHeadline = "Something feels good right now. Let yourself enjoy that.";
      supportingMessage = "Shared moments of warmth and laughter are deeply nourishing.";
      recommendation = {
        category: 'Connection',
        iconType: 'sparkles',
        title: 'Share the good moment',
        description: 'Tell someone what made today feel good or save the memory.',
        duration: '2 min',
        cta: 'Share moment →',
        route: '/task/first-therapy-session',
        accentColor: '#fbbf24'
      };
    } else {
      openingHeadline = "Something feels good right now. Let yourself enjoy that.";
      supportingMessage = "When joy is present, letting yourself savor it helps anchor it for the day.";
      recommendation = {
        category: 'Savoring',
        iconType: 'sparkles',
        title: 'Savor this moment',
        description: "Take a moment to notice what's making today feel good.",
        duration: '2 min',
        cta: 'Savor feeling →',
        route: '/task/first-therapy-session',
        accentColor: '#fbbf24'
      };
    }
  }

  // =========================================================================
  // 6. EXCITED & MOTIVATED SCENARIOS
  // =========================================================================
  else if (['excited', 'motivated', 'confident', 'proud'].includes(emotionId)) {
    openingHeadline = "You've got some energy behind you right now.";
    supportingMessage = "Forward momentum is a wonderful feeling, give it a gentle channel.";
    recommendation = {
      category: 'Momentum',
      iconType: 'sparkles',
      title: 'Capture the excitement',
      description: "Write down what you're looking forward to so you can revisit this spark later.",
      duration: '2 min',
      cta: 'Capture spark →',
      route: '/task/first-therapy-session',
      accentColor: '#fbbf24'
    };
  }

  // =========================================================================
  // 7. INSPIRED SCENARIOS
  // =========================================================================
  else if (['inspired', 'curious'].includes(emotionId)) {
    if (isExercise || isWorkContext) {
      openingHeadline = "Something has sparked your energy.";
      supportingMessage = "Creativity and drive are flowing, let's channel that into something real.";
      recommendation = {
        category: 'Action',
        iconType: 'sparkles',
        title: 'Build on the momentum',
        description: 'Turn that spark into one tiny action you can complete today.',
        duration: '2 min',
        cta: 'Build momentum →',
        route: '/task/first-therapy-session',
        accentColor: '#fbbf24'
      };
    } else {
      openingHeadline = "Something has sparked your energy.";
      supportingMessage = "Curiosity is an invitation to explore. Follow that spark before it slips away.";
      recommendation = {
        category: 'Creation',
        iconType: 'sparkles',
        title: 'Follow the spark',
        description: "Take one tiny step toward the idea that's inspiring you.",
        duration: '2 min',
        cta: 'Follow spark →',
        route: '/task/first-therapy-session',
        accentColor: '#fbbf24'
      };
    }
  }

  // =========================================================================
  // 8. CALM, PEACEFUL, GROUNDED, RELAXED SCENARIOS
  // =========================================================================
  else if (['calm', 'peaceful', 'grounded', 'relaxed', 'safe', 'relieved'].includes(emotionId)) {
    openingHeadline = "You've found a little space to breathe.";
    supportingMessage = "Quiet moments like this are a steady foundation for your nervous system.";
    recommendation = {
      category: 'Mindful Noticing',
      iconType: 'feather',
      title: 'Stay with the calm',
      description: 'Take a few seconds to notice what is helping you feel this way.',
      duration: '2 min',
      cta: 'Stay with ease →',
      route: '/task/first-therapy-session',
      accentColor: '#34d399'
    };
  }

  // =========================================================================
  // 9. GRATEFUL & CONTENT SCENARIOS
  // =========================================================================
  else if (['grateful', 'content'].includes(emotionId)) {
    openingHeadline = "There's something worth appreciating in this moment.";
    supportingMessage = "Noticing the good helps anchor your sense of peace.";
    recommendation = {
      category: 'Appreciation',
      iconType: 'sparkles',
      title: 'A moment of gratitude',
      description: "Name one thing you're genuinely glad to have today.",
      duration: '2 min',
      cta: 'Notice gratitude →',
      route: '/task/first-therapy-session',
      accentColor: '#34d399'
    };
  }

  // =========================================================================
  // 10. SAD, LONELY, DOWN, DISCOURAGED SCENARIOS
  // =========================================================================
  else if (['sad', 'lonely', 'down', 'discouraged', 'numb', 'meh'].includes(emotionId)) {
    openingHeadline = "It's okay to have a heavier moment.";
    supportingMessage = "You don't have to force yourself to feel differently right now. Giving yourself grace is enough.";
    recommendation = {
      category: 'Self-Compassion',
      iconType: 'heart',
      title: 'Give yourself permission to pause',
      description: 'A quiet, tender moment without any expectation to fix anything.',
      duration: '3 min',
      cta: 'Take gentle pause →',
      route: '/task/how-can-therapy-help',
      accentColor: '#60a5fa'
    };
  }

  // =========================================================================
  // 11. TIRED & DRAINED SCENARIOS
  // =========================================================================
  else if (['tired', 'drained', 'spent'].includes(emotionId)) {
    openingHeadline = "Your body is asking for a little stillness.";
    supportingMessage = "Rest is not a reward you have to earnm, it's what you need right now.";
    recommendation = {
      category: 'Rest Permission',
      iconType: 'feather',
      title: 'A restful release',
      description: 'Let your shoulders drop and give your eyes a break for two minutes.',
      duration: '2 min',
      cta: 'Rest a moment →',
      route: '/task/first-therapy-session',
      accentColor: '#60a5fa'
    };
  }

  return {
    openingHeadline,
    supportingMessage,
    recommendation,
    summary: {
      primaryEmotion: emotionName,
      zone: zone?.name || 'Check-In',
      intensity,
      contexts,
      reflection,
      recommendationTitle: recommendation.title
    }
  };
}
