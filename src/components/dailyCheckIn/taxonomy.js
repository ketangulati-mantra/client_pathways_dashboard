/**
 * Clinical & Therapeutic Taxonomy for Daily Check-In
 * High emotional intelligence classification, nuance maps, and therapeutic suggestions.
 */

export const SPECIFIC_EMOTIONS = {
  high_unpleasant: [
    { id: 'anxious', name: 'Anxious', nuance: 'Restless anticipation or uneasy tension in the body', def: 'Restless anticipation or uneasy tension in the body', tier: 'primary' },
    { id: 'overwhelmed', name: 'Overwhelmed', nuance: 'Too many demands pulling at your focus and energy', def: 'Too many demands pulling at your focus and energy', tier: 'primary' },
    { id: 'stressed', name: 'Stressed', nuance: 'Carrying heavy pressure to deliver or manage outcomes', def: 'Carrying heavy pressure to deliver or manage outcomes', tier: 'primary' },
    { id: 'frustrated', name: 'Frustrated', nuance: 'Hitting barriers and feeling blocked or delayed', def: 'Hitting barriers and feeling blocked or delayed', tier: 'secondary' },
    { id: 'angry', name: 'Angry', nuance: 'A strong surge of boundary violation or perceived injustice', def: 'A strong surge of boundary violation or perceived injustice', tier: 'secondary' },
    { id: 'panicked', name: 'Panicked', nuance: 'Sudden, acute escalation of acute worry or dread', def: 'Sudden, acute escalation of acute worry or dread', tier: 'secondary' },
    { id: 'tense', name: 'Tense', nuance: 'Tight physical strain held in jaw, neck, or shoulders', def: 'Tight physical strain held in jaw, neck, or shoulders', tier: 'supporting' },
    { id: 'restless', name: 'Restless', nuance: 'Agitated energy with difficulty finding a still point', def: 'Agitated energy with difficulty finding a still point', tier: 'supporting' }
  ],
  high_pleasant: [
    { id: 'joyful', name: 'Joyful', nuance: 'A warm, radiant sense of delight and connection', def: 'A warm, radiant sense of delight and connection', tier: 'primary' },
    { id: 'excited', name: 'Excited', nuance: 'High-tempo anticipation of something meaningful', def: 'High-tempo anticipation of something meaningful', tier: 'primary' },
    { id: 'motivated', name: 'Motivated', nuance: 'Clear forward drive and readiness to engage', def: 'Clear forward drive and readiness to engage', tier: 'primary' },
    { id: 'inspired', name: 'Inspired', nuance: 'Fresh mental clarity and creative vitality', def: 'Fresh mental clarity and creative vitality', tier: 'secondary' },
    { id: 'proud', name: 'Proud', nuance: 'Deep satisfaction in your effort or resilience', def: 'Deep satisfaction in your effort or resilience', tier: 'secondary' },
    { id: 'playful', name: 'Playful', nuance: 'Spontaneous, lighthearted ease with the moment', def: 'Spontaneous, lighthearted ease with the moment', tier: 'secondary' },
    { id: 'confident', name: 'Confident', nuance: 'Grounded trust in your capability and footing', def: 'Grounded trust in your capability and footing', tier: 'supporting' },
    { id: 'curious', name: 'Curious', nuance: 'Open, interested pull toward discovering something new', def: 'Open, interested pull toward discovering something new', tier: 'supporting' }
  ],
  low_unpleasant: [
    { id: 'sad', name: 'Sad', nuance: 'A tender, aching heaviness from loss or disappointment', def: 'A tender, aching heaviness from loss or disappointment', tier: 'primary' },
    { id: 'drained', name: 'Drained', nuance: 'Depleted internal battery with low physical reserves', def: 'Depleted internal battery with low physical reserves', tier: 'primary' },
    { id: 'lonely', name: 'Lonely', nuance: 'Longing for genuine presence, connection, or understanding', def: 'Longing for genuine presence, connection, or understanding', tier: 'primary' },
    { id: 'hopeless', name: 'Discouraged', nuance: 'A temporary sense of doubt or heavy friction', def: 'A temporary sense of doubt or heavy friction', tier: 'secondary' },
    { id: 'numb', name: 'Numb', nuance: 'Emotional protective distance or feeling disconnected', def: 'Emotional protective distance or feeling disconnected', tier: 'secondary' },
    { id: 'tired', name: 'Tired', nuance: 'Simple, honest bodily fatigue calling for restoration', def: 'Simple, honest bodily fatigue calling for restoration', tier: 'secondary' },
    { id: 'guilty', name: 'Guilty', nuance: 'Internal friction over personal standards or expectations', def: 'Internal friction over personal standards or expectations', tier: 'supporting' },
    { id: 'meh', name: 'Apathetic', nuance: 'Flat emotional response where little feels compelling', def: 'Flat emotional response where little feels compelling', tier: 'supporting' }
  ],
  low_pleasant: [
    { id: 'calm', name: 'Calm', nuance: 'Quiet, unhurried ease in the nervous system', def: 'Quiet, unhurried ease in the nervous system', tier: 'primary' },
    { id: 'peaceful', name: 'Peaceful', nuance: 'Harmony with the present without urgency', def: 'Harmony with the present without urgency', tier: 'primary' },
    { id: 'grateful', name: 'Grateful', nuance: 'Warm appreciation for what is good and present', def: 'Warm appreciation for what is good and present', tier: 'primary' },
    { id: 'grounded', name: 'Grounded', nuance: 'Solid, centered footing in your body and mind', def: 'Solid, centered footing in your body and mind', tier: 'secondary' },
    { id: 'content', name: 'Content', nuance: 'Satisfied stillness without needing more right now', def: 'Satisfied stillness without needing more right now', tier: 'secondary' },
    { id: 'relaxed', name: 'Relaxed', nuance: 'Muscles loose, breath natural, guard softened', def: 'Muscles loose, breath natural, guard softened', tier: 'secondary' },
    { id: 'relieved', name: 'Relieved', nuance: 'A release of tension as weight or worry clears', def: 'A release of tension as weight or worry clears', tier: 'supporting' },
    { id: 'safe', name: 'Secure', nuance: 'A gentle reassuring sense that you are okay right here', def: 'A gentle reassuring sense that you are okay right here', tier: 'supporting' }
  ]
};

export const EMOTION_ZONES = [
  {
    id: 'high_unpleasant',
    name: 'Stressed & Intense',
    subtitle: 'High Energy · Unpleasant',
    tag: 'High Energy · Heavy',
    description: 'Feeling tense, overwhelmed, angry, or anxious',
    baseColor: '#f87171',
    accent: '#f87171',
    glowColor: 'rgba(248, 113, 113, 0.45)',
    borderActive: 'rgba(248, 113, 113, 0.7)',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(248, 113, 113, 0.22) 0%, rgba(13, 27, 42, 0) 75%)',
    activeBg: 'linear-gradient(135deg, #f87171 0%, #b91c1c 100%)',
    emotions: SPECIFIC_EMOTIONS.high_unpleasant
  },
  {
    id: 'high_pleasant',
    name: 'Energized & Uplifted',
    subtitle: 'High Energy · Pleasant',
    tag: 'High Energy · Light',
    description: 'Feeling joyful, excited, motivated, or proud',
    baseColor: '#fbbf24',
    accent: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.45)',
    borderActive: 'rgba(251, 191, 36, 0.7)',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(251, 191, 36, 0.22) 0%, rgba(13, 27, 42, 0) 75%)',
    activeBg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    emotions: SPECIFIC_EMOTIONS.high_pleasant
  },
  {
    id: 'low_unpleasant',
    name: 'Heavy & Drained',
    subtitle: 'Low Energy · Unpleasant',
    tag: 'Low Energy · Heavy',
    description: 'Feeling down, exhausted, lonely, or numb',
    baseColor: '#60a5fa',
    accent: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.45)',
    borderActive: 'rgba(96, 165, 250, 0.7)',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(96, 165, 250, 0.22) 0%, rgba(13, 27, 42, 0) 75%)',
    activeBg: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)',
    emotions: SPECIFIC_EMOTIONS.low_unpleasant
  },
  {
    id: 'low_pleasant',
    name: 'Calm & Content',
    subtitle: 'Low Energy · Pleasant',
    tag: 'Low Energy · Light',
    description: 'Feeling peaceful, grounded, grateful, or relaxed',
    baseColor: '#34d399',
    accent: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.45)',
    borderActive: 'rgba(52, 211, 153, 0.7)',
    bgGradient: 'radial-gradient(circle at 50% 40%, rgba(52, 211, 153, 0.22) 0%, rgba(13, 27, 42, 0) 75%)',
    activeBg: 'linear-gradient(135deg, #34d399 0%, #047857 100%)',
    emotions: SPECIFIC_EMOTIONS.low_pleasant
  }
];

export const INTENSITY_LEVELS = [
  { level: 1, label: 'Barely noticeable', hint: 'A faint background flicker' },
  { level: 2, label: 'Mild', hint: 'Present, but easily set aside' },
  { level: 3, label: 'Moderate', hint: 'Noticeably coloring your mood' },
  { level: 4, label: 'Strong', hint: 'Demanding active focus and energy' },
  { level: 5, label: 'Overwhelming', hint: 'Flooding and difficult to carry' }
];

export const CONTEXT_CATEGORIES = [
  {
    group: 'WHAT WERE YOU DOING?',
    items: [
      'Working',
      'Studying',
      'Commuting',
      'Exercising',
      'Eating',
      'Resting',
      'Socializing',
      'Doing chores',
      'On my phone'
    ]
  },
  {
    group: 'WHO WAS AROUND?',
    items: [
      'By myself',
      'Family',
      'Friends',
      'Partner',
      'Co-workers',
      'Pets'
    ]
  },
  {
    group: 'WHERE WERE YOU?',
    items: [
      'Home',
      'Workplace',
      'School',
      'Outside',
      'Gym',
      'Somewhere else'
    ]
  },
  {
    group: 'WHAT WAS ON YOUR MIND?',
    items: [
      'Work',
      'Studies',
      'Money',
      'Relationships',
      'Health',
      'Something else'
    ]
  }
];

export const CONTEXT_GROUPS = CONTEXT_CATEGORIES;

/**
 * Generates an empathetic, human therapeutic response based on complete check-in inputs.
 */
export function generatePersonalizedResponse({
  primaryEmotion,
  additionalEmotions = [],
  intensity = 3,
  contexts = [],
  reflection = ''
}) {
  const emotionName = primaryEmotion?.name || 'this moment';
  const emotionId = (primaryEmotion?.id || '').toLowerCase();
  const isHighIntensity = intensity >= 4;

  const hasAnyContext = (...items) => items.some((i) => contexts.includes(i));
  const mainContext = contexts[0] ? contexts[0].toLowerCase() : null;

  // 1. Human Headline Opening (Warm & Reflective)
  let openingHeadline = "You've got a lot sitting with you right now.";
  if (['calm', 'peaceful', 'content', 'relaxed', 'grateful', 'grounded', 'secure'].includes(emotionId)) {
    openingHeadline = "You've found a quiet space of ease today.";
  } else if (['happy', 'excited', 'energized', 'motivated', 'joyful', 'hopeful', 'inspired', 'confident'].includes(emotionId)) {
    openingHeadline = "You're holding some good energy today.";
  } else if (['sad', 'lonely', 'drained', 'tired', 'discouraged', 'numb'].includes(emotionId)) {
    openingHeadline = "You're carrying something heavy right now.";
  } else if (['angry', 'frustrated'].includes(emotionId)) {
    openingHeadline = "You've got some strong frustration in you right now.";
  } else if (isHighIntensity || ['overwhelmed', 'stressed', 'anxious'].includes(emotionId)) {
    openingHeadline = "You've got a lot sitting with you right now.";
  }

  // 2. Empathetic Conversational Observation (Simple, Human, Warm)
  let empatheticObservation = `When several things feel heavy at once, you don't have to untangle everything today.`;

  if (['frustrated', 'angry'].includes(emotionId)) {
    empatheticObservation = `When frustration builds up, giving yourself permission to step back for a moment helps clear the air.`;
  } else if (['anxious', 'worried', 'restless', 'uneasy', 'panicked'].includes(emotionId)) {
    if (hasAnyContext('Work', 'Workplace', 'Working', 'Studies')) {
      empatheticObservation = `With the pressure around ${mainContext || 'work'} feeling high, taking a brief pause helps separate the noise from what actually matters next.`;
    } else {
      empatheticObservation = `When thoughts start racing, giving your mind a gentle moment helps bring your body back to the present.`;
    }
  } else if (['overwhelmed', 'stressed', 'tense'].includes(emotionId)) {
    empatheticObservation = `When several things feel heavy at once, you don't have to solve it all today. Taking one breath at a time is enough.`;
  } else if (['sad', 'lonely', 'drained', 'down', 'discouraged'].includes(emotionId)) {
    empatheticObservation = `It's completely okay that today feels tender. You don't have to force a fix, simply noticing how you feel is an act of care.`;
  } else if (['tired', 'spent'].includes(emotionId)) {
    empatheticObservation = `Your body and mind are asking for a little rest. A quiet pause can help restore a small piece of your energy.`;
  } else if (['calm', 'peaceful', 'content', 'relaxed', 'grounded', 'secure'].includes(emotionId)) {
    empatheticObservation = `These quiet, grounded moments are precious. Taking a breath to savor this feeling helps anchor it for the rest of your day.`;
  } else if (['happy', 'excited', 'energized', 'motivated', 'inspired'].includes(emotionId)) {
    empatheticObservation = `Letting yourself enjoy this positive momentum without rushing to the next task is a wonderful way to honor yourself.`;
  }

  // 3. Gentle Invitation Recommendation (Human, not clinical)
  let recommendation = {
    title: 'Take a quiet moment',
    description: 'A breath to acknowledge how you feel and choose what feels right next.',
    duration: '2 min',
    cta: 'Try this for a moment',
    actionId: 'quiet-moment',
    route: '/task/first-therapy-session'
  };

  if (['frustrated', 'angry'].includes(emotionId)) {
    recommendation = {
      title: 'Take a little space',
      description: 'Stepping back for a moment can make it easier to decide what comes next.',
      duration: '3 min',
      cta: 'Take a little space',
      actionId: 'cool-down',
      route: '/task/first-therapy-session'
    };
  } else if (['overwhelmed', 'stressed', 'anxious', 'panicked'].includes(emotionId) || (emotionId === 'tense' && isHighIntensity)) {
    recommendation = {
      title: "Untangle what's on your mind",
      description: "Sometimes naming one thing that's weighing on you can make it easier to hold.",
      duration: '3 min',
      cta: "Untangle what's on your mind",
      actionId: 'untangle-mind',
      route: '/task/first-therapy-session'
    };
  } else if (['restless', 'tense'].includes(emotionId)) {
    recommendation = {
      title: 'Release physical tension',
      description: 'A soft shoulder and neck release to help let go of the physical strain you’re holding.',
      duration: '2 min',
      cta: 'Release physical tension',
      actionId: 'release-tension',
      route: '/task/first-therapy-session'
    };
  } else if (['sad', 'lonely', 'drained', 'meh', 'discouraged'].includes(emotionId)) {
    recommendation = {
      title: 'Give yourself a gentle pause',
      description: 'A quiet, tender moment without any expectation to fix or change how you feel.',
      duration: '2 min',
      cta: 'Take a gentle pause',
      actionId: 'gentle-pause',
      route: '/task/how-can-therapy-help'
    };
  } else if (emotionId === 'tired') {
    recommendation = {
      title: 'A restful breathing pause',
      description: 'A slow, restorative rhythm to help your eyes, shoulders, and mind settle.',
      duration: '3 min',
      cta: 'Start resting breath',
      actionId: 'restful-breath',
      route: '/task/first-therapy-session'
    };
  } else if (['calm', 'peaceful', 'content', 'relaxed', 'grounded', 'grateful', 'secure'].includes(emotionId)) {
    recommendation = {
      title: 'Savor this quiet moment',
      description: 'A breath to stay with this peaceful feeling and carry it with you.',
      duration: '2 min',
      cta: 'Savor this moment',
      actionId: 'savor-ease',
      route: '/task/first-therapy-session'
    };
  } else if (['happy', 'excited', 'energized', 'motivated', 'inspired'].includes(emotionId)) {
    recommendation = {
      title: 'Channel this good energy',
      description: 'A quick reflection on what brought you joy today.',
      duration: '2 min',
      cta: 'Reflect on this feeling',
      actionId: 'channel-energy',
      route: '/task/first-therapy-session'
    };
  }

  // 4. Clinical Structured Summary
  const summary = {
    primaryEmotion: emotionName,
    zone: primaryEmotion?.zoneTitle || 'Check-In',
    intensity: 'Moderate',
    intensityNum: intensity,
    contexts: contexts,
    reflection: reflection || null,
    recommendationTitle: recommendation.title
  };

  return {
    openingHeadline,
    empatheticObservation,
    recommendation,
    summary
  };
}
