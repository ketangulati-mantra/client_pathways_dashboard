/**
 * Context & Meaning Configuration for Emotion Discovery
 * Concise, emotion-specific choices and adaptive emotional needs for all 6 primary families + granular overrides.
 */

export interface ContextOption {
  id: string;
  label: string;
}

export interface NeedOption {
  id: string;
  label: string;
}

export interface EmotionMeaningConfig {
  prompt: string;
  subtitle: string;
  contextOptions: ContextOption[];
  notSureOption: ContextOption;
  needPrompt: string;
  needSubtitle: string;
  needOptions: NeedOption[];
  takeawayThought: string;
  actionPlaceholder: string;
}

export const FAMILY_DISCOVERY_CONFIGS: Record<string, EmotionMeaningConfig> = {
  anger: {
    prompt: 'What might be behind this feeling?',
    subtitle: 'Choose what feels closest.',
    contextOptions: [
      { id: 'boundary', label: 'A boundary was crossed' },
      { id: 'disrespected', label: 'I felt disrespected' },
      { id: 'unheard', label: "I wasn't heard" },
      { id: 'unfair', label: 'Something felt unfair' },
      { id: 'cornered', label: 'I felt pushed into a corner' },
      { id: 'control', label: 'Something felt out of my control' }
    ],
    notSureOption: {
      id: 'not_sure',
      label: 'Not sure yet'
    },
    needPrompt: 'What might help right now?',
    needSubtitle: 'Choose what would feel supportive.',
    needOptions: [
      { id: 'pause', label: 'A pause before I respond' },
      { id: 'express', label: 'A safe way to let this out' },
      { id: 'heard', label: 'To feel heard and understood' },
      { id: 'boundary', label: 'To set or clarify a boundary' },
      { id: 'distance', label: 'A little distance to think' },
      { id: 'clarity', label: "To understand what I'm reacting to" }
    ],
    takeawayThought: 'Your boundaries matter. You have the right to pause before you respond.',
    actionPlaceholder: 'Take a slow, deep breath before taking any action.'
  },

  sadness: {
    prompt: 'What might be behind this feeling?',
    subtitle: 'Choose what feels closest.',
    contextOptions: [
      { id: 'loss', label: 'Something or someone I miss' },
      { id: 'disappointment', label: 'A deep disappointment' },
      { id: 'alone', label: 'Carrying things by myself' },
      { id: 'left_out', label: 'Feeling disconnected or left out' },
      { id: 'drained', label: 'Feeling emotionally drained' },
      { id: 'event', label: 'Something specific that happened' }
    ],
    notSureOption: {
      id: 'not_sure',
      label: 'Not sure yet'
    },
    needPrompt: 'What might feel supportive right now?',
    needSubtitle: 'Choose what would feel supportive.',
    needOptions: [
      { id: 'comfort', label: 'Gentle comfort and warmth' },
      { id: 'space', label: 'Space to process without rush' },
      { id: 'connection', label: 'Connection with someone caring' },
      { id: 'release', label: 'Permission to let it out' },
      { id: 'rest', label: 'Quiet physical rest' }
    ],
    takeawayThought: 'You do not have to carry everything all at once. Be gentle with yourself.',
    actionPlaceholder: 'Give yourself quiet space to honor what you are feeling.'
  },

  fear: {
    prompt: 'What might be behind this feeling?',
    subtitle: 'Choose what feels closest.',
    contextOptions: [
      { id: 'uncertainty', label: 'Something uncertain is coming' },
      { id: 'worried', label: "I'm worried about what might happen" },
      { id: 'control', label: "I don't feel in control" },
      { id: 'overthinking', label: "I'm overthinking something" },
      { id: 'body_edge', label: 'My body feels on edge' },
      { id: 'expectations', label: "I don't know what to expect" }
    ],
    notSureOption: {
      id: 'not_sure',
      label: 'Not sure yet'
    },
    needPrompt: 'What would help you feel steadier right now?',
    needSubtitle: 'Choose what would feel supportive.',
    needOptions: [
      { id: 'grounding', label: 'A moment to breathe and ground' },
      { id: 'slow_down', label: 'Permission to slow down' },
      { id: 'reassurance', label: 'Reassurance that I can handle this' },
      { id: 'one_step', label: 'Clarity on just one small step' },
      { id: 'talk', label: 'A calming voice to talk with' }
    ],
    takeawayThought: 'You do not have to figure out the whole future right now. Just this present breath.',
    actionPlaceholder: 'Take a moment to ground your body and lengthen your exhale.'
  },

  love: {
    prompt: 'What might be behind this feeling?',
    subtitle: 'Choose what feels closest.',
    contextOptions: [
      { id: 'someone_special', label: 'Someone meaningful in my life' },
      { id: 'cared_for', label: 'Feeling cared for and accepted' },
      { id: 'gratitude', label: 'Deep gratitude toward someone' },
      { id: 'shared_moment', label: 'A sweet shared memory or moment' },
      { id: 'self_kindness', label: 'Warmth and kindness toward myself' },
      { id: 'belonging', label: 'A comforting sense of belonging' }
    ],
    notSureOption: {
      id: 'not_sure',
      label: 'Not sure yet'
    },
    needPrompt: 'How would you like to honor this feeling?',
    needSubtitle: 'Choose what would feel supportive.',
    needOptions: [
      { id: 'express_love', label: 'Express my appreciation to someone' },
      { id: 'hold_warmth', label: 'Hold and treasure this warmth within' },
      { id: 'reach_out', label: 'Spend quality time with someone close' },
      { id: 'self_compassion', label: 'Direct this compassion toward myself' }
    ],
    takeawayThought: 'Connection is one of our greatest anchors. Cherish what brings you closer.',
    actionPlaceholder: 'Send a warm thought or short note of appreciation to someone who matters.'
  },

  joy: {
    prompt: 'What might be behind this feeling?',
    subtitle: 'Choose what feels closest.',
    contextOptions: [
      { id: 'went_well', label: 'Something went really well' },
      { id: 'loved_one', label: 'Someone I deeply care about' },
      { id: 'progress', label: 'Making progress or achieving something' },
      { id: 'hope', label: 'A renewed sense of hope or lightness' },
      { id: 'simple_pleasure', label: 'A simple, beautiful everyday moment' },
      { id: 'freedom', label: 'A sense of relief, play, or freedom' }
    ],
    notSureOption: {
      id: 'not_sure',
      label: 'Not sure yet'
    },
    needPrompt: 'How would you like to savor this moment?',
    needSubtitle: 'Choose what would feel supportive.',
    needOptions: [
      { id: 'savor', label: 'Fully savor and enjoy the feeling' },
      { id: 'share', label: 'Share the good feeling with someone' },
      { id: 'gratitude', label: 'Take a moment for quiet gratitude' },
      { id: 'momentum', label: 'Use this positive energy in a project' }
    ],
    takeawayThought: 'Let yourself enjoy this light. You deserve to experience ease and joy.',
    actionPlaceholder: 'Pause for 15 seconds to fully soak in and savor this positive feeling.'
  },

  surprise: {
    prompt: 'What might be behind this feeling?',
    subtitle: 'Choose what feels closest.',
    contextOptions: [
      { id: 'unexpected_news', label: 'Unexpected news or information' },
      { id: 'sudden_change', label: 'A sudden shift in plans or circumstances' },
      { id: 'wonder', label: 'Something that sparked wonder or awe' },
      { id: 'confusion', label: 'Something I didn’t immediately understand' },
      { id: 'new_insight', label: 'A surprising realization or perspective' }
    ],
    notSureOption: {
      id: 'not_sure',
      label: 'Not sure yet'
    },
    needPrompt: 'What would help you adjust right now?',
    needSubtitle: 'Choose what would feel supportive.',
    needOptions: [
      { id: 'pause_digest', label: 'A moment to pause and digest what happened' },
      { id: 'curiosity', label: 'Curiosity to learn more about it' },
      { id: 'ground_change', label: 'Grounding to adapt to the change' },
      { id: 'talk_out', label: 'To talk it through with someone' }
    ],
    takeawayThought: 'It is natural to need a moment when things shift suddenly. Take your time.',
    actionPlaceholder: 'Give yourself a few minutes to absorb the new information without rushing.'
  }
};

/**
 * Granular emotion overrides for specific emotional nuance
 */
export const GRANULAR_OVERRIDE_CONFIGS: Record<string, Partial<EmotionMeaningConfig>> = {
  provoked: {
    contextOptions: [
      { id: 'boundary', label: 'A boundary was crossed' },
      { id: 'disrespected', label: 'I felt disrespected' },
      { id: 'unheard', label: "I wasn't heard" },
      { id: 'unfair', label: 'Something felt unfair' },
      { id: 'cornered', label: 'I felt pushed into a corner' },
      { id: 'control', label: 'Something felt out of my control' }
    ]
  },

  nostalgic: {
    contextOptions: [
      { id: 'someone_meaningful', label: 'Someone meaningful in my life' },
      { id: 'memory_returning', label: 'A memory I keep returning to' },
      { id: 'missing_someone', label: 'Missing someone or something' },
      { id: 'time_felt_different', label: 'A time when life felt different' },
      { id: 'connected_to_past', label: 'Feeling connected to the past' },
      { id: 'wish_revisit', label: 'Something I wish I could revisit' }
    ]
  },

  anxious: {
    contextOptions: [
      { id: 'uncertainty', label: 'Something uncertain is coming' },
      { id: 'worried', label: "I'm worried about what might happen" },
      { id: 'control', label: "I don't feel in control" },
      { id: 'overthinking', label: "I'm overthinking something" },
      { id: 'body_edge', label: 'My body feels on edge' },
      { id: 'expectations', label: "I don't know what to expect" }
    ]
  },

  lonely: {
    contextOptions: [
      { id: 'disconnected', label: 'Feeling emotionally distant from others' },
      { id: 'unseen', label: 'Nobody seems to truly see or understand me' },
      { id: 'missing_someone', label: 'Missing a specific person' },
      { id: 'no_one_to_call', label: 'Not having someone to reach out to easily' }
    ],
    takeawayThought: 'Feeling alone is deeply human. Even in silence, your feelings are valid and matter.',
    actionPlaceholder: 'Reach out with a short message to a friend, or do something comforting just for you.'
  },

  overwhelmed: {
    contextOptions: [
      { id: 'too_many_demands', label: 'Too many demands pulling at once' },
      { id: 'time_pressure', label: 'Deadlines and lack of time' },
      { id: 'mental_noise', label: 'Mental fatigue and decision overload' },
      { id: 'unsupported', label: 'Carrying the responsibility alone' }
    ],
    takeawayThought: 'You do not have to solve everything all at once. Doing one small thing is enough.',
    actionPlaceholder: 'Stop and take 3 deep breaths. Step back from the rush for a few minutes.'
  },

  disappointed: {
    contextOptions: [
      { id: 'unmet_expectations', label: 'Things did not go as planned' },
      { id: 'let_down_by_someone', label: 'Someone let me down' },
      { id: 'self_disappointment', label: 'Disappointed with my own actions' }
    ]
  }
};

/**
 * Helper to resolve the best discovery configuration for a selected emotion
 */
export function getDiscoveryConfig(familyId: string, emotionId?: string): EmotionMeaningConfig {
  const base = FAMILY_DISCOVERY_CONFIGS[familyId?.toLowerCase()] || FAMILY_DISCOVERY_CONFIGS.sadness;
  if (!emotionId) return base;

  const override = GRANULAR_OVERRIDE_CONFIGS[emotionId?.toLowerCase()];
  if (!override) return base;

  return {
    ...base,
    ...override,
    contextOptions: override.contextOptions || base.contextOptions,
    needOptions: override.needOptions || base.needOptions,
    notSureOption: override.notSureOption || base.notSureOption
  };
}
