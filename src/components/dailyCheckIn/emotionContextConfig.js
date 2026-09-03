/**
 * Emotion-Aware Contextual Questions & Structured Taxonomy
 * Dynamically tailors follow-up questions and chips based on the selected emotion.
 */

export const EMOTION_CONTEXT_CONFIGS = {
  // 1. Positive / Happy / Good / Joyful
  positive: {
    primaryQuestion: (emotion) => `What contributed to you feeling ${emotion || 'good'}?`,
    primarySubtitle: 'Select any factors that played a role, or continue.',
    category: 'positive',
    contributingOptions: [
      'Something I achieved',
      'Spending time with someone',
      'Good news',
      'Doing something I enjoy',
      'A positive experience',
      'Feeling productive',
      'Something else'
    ],
    deeperQuestion: 'What made the biggest difference?',
    deeperOptions: [
      'Someone',
      'Something I did',
      'Something that happened',
      'A change in perspective',
      "I'm not sure"
    ]
  },

  // 2. Calm / Grounded / Peaceful / Relaxed
  calm: {
    primaryQuestion: (emotion) => `What helped you feel ${emotion || 'grounded'}?`,
    primarySubtitle: 'Select what supported this state of ease.',
    category: 'calm',
    contributingOptions: [
      'Taking a break',
      'A familiar routine',
      'Being present',
      'Time for myself',
      'Talking to someone',
      'Being outdoors',
      'Something else'
    ],
    deeperQuestion: 'What helped you slow down?',
    deeperOptions: [
      'Rest',
      'Quiet time',
      'Nature',
      'Exercise',
      'A conversation',
      'Stepping away from something'
    ]
  },

  // 3. Sad / Low / Lonely / Discouraged
  sad: {
    primaryQuestion: (emotion) => `What was weighing on you?`,
    primarySubtitle: 'Acknowledge what is present for you right now.',
    category: 'sad',
    contributingOptions: [
      'Something that happened',
      'Someone or a relationship',
      'Feeling alone',
      'Work or studies',
      'Missing someone or something',
      'Feeling disappointed',
      "I'm not sure"
    ],
    deeperQuestion: 'Did anything help you cope?',
    deeperOptions: [
      'Talking to someone',
      'Taking time alone',
      'Resting',
      'Doing something comforting',
      'Writing about it',
      'Nothing in particular'
    ]
  },

  // 4. Anxious / Worried / Overwhelmed / Stressed
  anxious: {
    primaryQuestion: (emotion) => `What was contributing to feeling ${emotion || 'this'}?`,
    primarySubtitle: 'Notice what might be adding pressure or weight.',
    category: 'anxious',
    contributingOptions: [
      'Too much to do',
      'Work or studies',
      'Uncertainty',
      'Relationships',
      'Money',
      'Something coming up',
      'Health concerns',
      'Something else'
    ],
    deeperQuestion: 'What felt most difficult right now?',
    deeperOptions: [
      'Not knowing what will happen',
      'Having too many things to manage',
      'Feeling pressure',
      'Losing control',
      'Making a decision',
      'Something else'
    ]
  },

  // 5. Angry / Frustrated / Irritated
  angry: {
    primaryQuestion: (emotion) => `What triggered this feeling?`,
    primarySubtitle: 'Notice what boundary or friction showed up.',
    category: 'angry',
    contributingOptions: [
      'Something someone said or did',
      "A situation didn't go as expected",
      'Feeling misunderstood',
      'Too much pressure',
      'An ongoing problem',
      'Something felt unfair',
      'Something else'
    ],
    deeperQuestion: 'What was behind the frustration?',
    deeperOptions: [
      'A person',
      'A situation',
      'Expectations',
      'Stress building up',
      'Lack of control',
      "I'm not sure"
    ]
  },

  // 6. Drained / Tired / Low Energy / Exhausted
  tired: {
    primaryQuestion: (emotion) => `What might be contributing to your low energy?`,
    primarySubtitle: 'Check in with what your body and mind have been carrying.',
    category: 'tired',
    contributingOptions: [
      'Poor rest',
      'Too much going on',
      'Work or studies',
      'Social exhaustion',
      'Feeling emotionally drained',
      'Physical tiredness',
      "I'm not sure"
    ],
    deeperQuestion: 'What do you feel you need most?',
    deeperOptions: [
      'Rest',
      'Space',
      'Support',
      'A break',
      'Something enjoyable',
      'More clarity'
    ]
  }
};

/**
 * Universal contextual groups (Activity, Social, Location)
 */
export const ACTIVITY_OPTIONS = [
  'Working',
  'Studying',
  'Resting',
  'Exercising',
  'Spending time with others',
  'Commuting',
  'Doing chores',
  'On my phone',
  'Something else'
];

export const SOCIAL_OPTIONS = [
  'By myself',
  'Family',
  'Friends',
  'Partner',
  'Co-workers',
  'Pets',
  'Someone else'
];

export const LOCATION_OPTIONS = [
  'Home',
  'Workplace',
  'School / College',
  'Outdoors',
  'Gym',
  'Commuting',
  'Somewhere else'
];

/**
 * Helper to resolve the appropriate emotion config for any given emotion string or object.
 */
export function getEmotionContextConfig(emotionInput, zoneId) {
  const name = (typeof emotionInput === 'string' ? emotionInput : emotionInput?.name || '').toLowerCase();
  const zone = zoneId || (typeof emotionInput === 'object' ? emotionInput?.zone : null) || '';

  // 1. Positive / High energy pleasant
  if (
    ['joyful', 'excited', 'motivated', 'inspired', 'proud', 'playful', 'confident', 'curious', 'happy', 'good'].includes(name) ||
    zone === 'high_pleasant'
  ) {
    return EMOTION_CONTEXT_CONFIGS.positive;
  }

  // 2. Calm / Low energy pleasant
  if (
    ['calm', 'peaceful', 'grateful', 'grounded', 'content', 'relaxed', 'relieved', 'safe'].includes(name) ||
    zone === 'low_pleasant'
  ) {
    return EMOTION_CONTEXT_CONFIGS.calm;
  }

  // 3. Angry / Frustrated
  if (['angry', 'frustrated', 'irritated', 'annoyed', 'furious'].includes(name)) {
    return EMOTION_CONTEXT_CONFIGS.angry;
  }

  // 4. Anxious / Overwhelmed / Stressed
  if (
    ['anxious', 'overwhelmed', 'stressed', 'panicked', 'tense', 'restless', 'worried'].includes(name) ||
    zone === 'high_unpleasant'
  ) {
    return EMOTION_CONTEXT_CONFIGS.anxious;
  }

  // 5. Tired / Drained
  if (['tired', 'drained', 'exhausted', 'numb', 'meh'].includes(name)) {
    return EMOTION_CONTEXT_CONFIGS.tired;
  }

  // 6. Sad / Lonely / Low
  if (['sad', 'lonely', 'hopeless', 'discouraged', 'guilty', 'low'].includes(name) || zone === 'low_unpleasant') {
    return EMOTION_CONTEXT_CONFIGS.sad;
  }

  // Fallback to anxious or calm depending on zone
  return EMOTION_CONTEXT_CONFIGS.anxious;
}
