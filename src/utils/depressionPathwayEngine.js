/**
 * Configuration & Deterministic Personalization Engine for Mantra 21: Depression Pathway (Day 1)
 * Activity: "What Is Depression?" (depression_what_is_depression)
 * Pathway: depression | Day: 1 | Type: education_personalization
 *
 * NOTE: Non-diagnostic product personalization engine.
 * Maps user experiences, motivation, and priorities to 7 explainable focus areas.
 */

export const ACTIVITY_ID = 'depression_what_is_depression';
export const PATHWAY_ID = 'depression';
export const DAY_NUMBER = 1;
export const ACTIVITY_TYPE = 'education_personalization';

// 1. Familiar Experiences Options (Multi-select)
export const FAMILIAR_EXPERIENCES_OPTIONS = [
  {
    id: 'low_mood',
    label: 'Feeling low or empty',
    signal: 'thoughts_and_mental_overload',
    weight: 2
  },
  {
    id: 'loss_of_interest',
    label: 'Losing interest in things you usually like',
    signal: 'interest_and_enjoyment',
    weight: 2
  },
  {
    id: 'low_energy',
    label: 'Feeling exhausted even without doing much',
    signal: 'energy_and_getting_started',
    weight: 2
  },
  {
    id: 'difficulty_with_everyday_tasks',
    label: 'Finding everyday tasks hard to start',
    signal: 'functioning_and_tasks',
    weight: 2
  },
  {
    id: 'social_withdrawal',
    label: 'Pulling away from people or isolating',
    signal: 'connection_and_support',
    weight: 2
  },
  {
    id: 'negative_thoughts',
    label: 'Getting stuck in critical or heavy thoughts',
    signal: 'thoughts_and_mental_overload',
    weight: 2
  },
  {
    id: 'sleep_or_appetite_changes',
    label: 'Changes in sleep or appetite patterns',
    signal: 'routine_and_sleep',
    weight: 2
  },
  {
    id: 'other',
    label: 'Something else not listed here',
    signal: 'energy_and_getting_started',
    weight: 1
  }
];

// Alias for backward-compatibility in UI components
export const EXPERIENCE_OPTIONS = FAMILIAR_EXPERIENCES_OPTIONS;

// 2. Reason for Joining Options (Multi-select)
export const REASON_FOR_JOINING_OPTIONS = [
  {
    id: 'low_mood',
    label: "I've been feeling down or low for a while",
    signal: 'thoughts_and_mental_overload',
    weight: 2
  },
  {
    id: 'low_energy_motivation',
    label: "I have very low energy and motivation lately",
    signal: 'energy_and_getting_started',
    weight: 3
  },
  {
    id: 'overwhelming_thoughts',
    label: 'My thoughts feel overwhelming or heavy',
    signal: 'thoughts_and_mental_overload',
    weight: 3
  },
  {
    id: 'social_withdrawal',
    label: "I've been withdrawing and disconnecting from others",
    signal: 'connection_and_support',
    weight: 3
  },
  {
    id: 'identity_disconnect',
    label: "I don't really feel like myself anymore",
    signal: 'identity_and_self_connection',
    weight: 3
  },
  {
    id: 'uncertain',
    label: "I'm not completely sure — I just know something feels off",
    signal: 'energy_and_getting_started',
    weight: 1
  }
];

// Alias for backward-compatibility in UI components
export const REASON_OPTIONS = REASON_FOR_JOINING_OPTIONS;

// 3. 10% Lighter Options (Single-select)
export const TEN_PERCENT_LIGHTER_OPTIONS = [
  {
    id: 'starting_the_day',
    label: 'Starting the day / getting out of bed',
    signal: 'energy_and_getting_started',
    weight: 3
  },
  {
    id: 'getting_things_done',
    label: 'Getting small everyday things done',
    signal: 'functioning_and_tasks',
    weight: 3
  },
  {
    id: 'enjoying_things',
    label: 'Enjoying things or feeling moments of lightness',
    signal: 'interest_and_enjoyment',
    weight: 3
  },
  {
    id: 'thoughts',
    label: 'Quieting my mind and harsh thoughts',
    signal: 'thoughts_and_mental_overload',
    weight: 3
  },
  {
    id: 'connecting_with_people',
    label: 'Connecting with people without feeling drained',
    signal: 'connection_and_support',
    weight: 3
  },
  {
    id: 'self_care',
    label: 'Taking basic care of myself',
    signal: 'identity_and_self_connection',
    weight: 3
  },
  {
    id: 'sleep_routine',
    label: 'My sleep routine and rest',
    signal: 'routine_and_sleep',
    weight: 3
  },
  {
    id: 'not_sure',
    label: "I'm not sure yet — just exploring",
    signal: 'energy_and_getting_started',
    weight: 1
  }
];

// Alias for backward-compatibility in UI components
export const LIGHTER_OPTIONS = TEN_PERCENT_LIGHTER_OPTIONS;

// 4. Non-Clinical Personalization Focus Definitions
export const PERSONALIZATION_FOCUS_DEFINITIONS = {
  energy_and_getting_started: {
    key: 'energy_and_getting_started',
    title: 'Energy & getting started',
    headline: 'A little context for your journey',
    body: "From what you shared, low energy and difficulty getting started seem to be two things you're carrying right now.\n\nThat's useful to know.\n\nOver the next few days, we'll help you experiment with tiny, zero-pressure steps that don't depend on feeling motivated first.",
    takeaway: 'Action can precede motivation when the step is small enough.'
  },
  thoughts_and_mental_overload: {
    key: 'thoughts_and_mental_overload',
    title: 'Thoughts & mental overload',
    headline: 'Giving your mind room to breathe',
    body: "From what you shared, racing or heavy thoughts seem to take up a lot of space right now.\n\nDepression has a way of magnifying self-criticism and making mental noise louder.\n\nTogether, we'll practice ways to create gentle distance from overwhelming thoughts without having to fight them.",
    takeaway: 'You do not have to believe every thought depression hands you.'
  },
  interest_and_enjoyment: {
    key: 'interest_and_enjoyment',
    title: 'Interest & everyday enjoyment',
    headline: 'Rediscovering small moments of connection',
    body: "When things you used to enjoy suddenly feel flat or distant, it can feel disorienting.\n\nThis isn't a permanent shift — it's one of the most common ways depression affects the brain's reward centers.\n\nWe'll explore gentle ways to re-engage with small comforts without pressure to feel 'happy' right away.",
    takeaway: 'Pleasure returns in micro-doses, not all at once.'
  },
  connection_and_support: {
    key: 'connection_and_support',
    title: 'Connection & safe space',
    headline: 'Honoring your need for space and connection',
    body: "Pulling back from people is often a protective instinct when your energy is depleted.\n\nYou don't have to force high-energy socializing.\n\nWe'll look at safe, low-friction ways to stay anchored and connected without overwhelming your social battery.",
    takeaway: 'Connection doesn’t require performing or pretending.'
  },
  identity_and_self_connection: {
    key: 'identity_and_self_connection',
    title: 'Identity & self-connection',
    headline: 'Reconnecting with who you are beneath the weight',
    body: "Not feeling like yourself is one of the quietest and heaviest parts of depression.\n\nRemember: your baseline self hasn't disappeared — it's simply resting under a layer of fog.\n\nOver the course of Mantra 21, we'll gently help clear that fog one day at a time.",
    takeaway: 'You are not your symptoms. You are the one experiencing them.'
  },
  routine_and_sleep: {
    key: 'routine_and_sleep',
    title: 'Routine & restorative sleep',
    headline: 'Restoring gentle rhythm to your days',
    body: "Disruptions to sleep and daily rhythms can make everything else feel twice as heavy.\n\nWe'll focus on grounding micro-routines and nervous system resets that help your body feel rested and supported.",
    takeaway: 'Gentle consistency calms the nervous system.'
  },
  functioning_and_tasks: {
    key: 'functioning_and_tasks',
    title: 'Functioning & everyday tasks',
    headline: 'Zero-pressure approaches to daily tasks',
    body: "When everyday tasks feel overwhelming, breaking them down into microscopic wins changes everything.\n\nWe'll give you practical tools to move through tasks without burnout or guilt.",
    takeaway: 'Half-done is always better than not started.'
  }
};

export const FOCUS_DEFINITIONS = PERSONALIZATION_FOCUS_DEFINITIONS;

/**
 * Deterministically calculates the user's primary personalization focus and signal strengths.
 *
 * @param {Object} responses - Raw user responses
 * @param {string[]} responses.familiarExperiences - Array of selected option IDs
 * @param {string[]} responses.reasonsForJoining - Array of selected option IDs
 * @param {string|null} responses.tenPercentLighter - Selected option ID
 * @returns {Object} Personalization analysis including current_focus and all signal strengths
 */
export function derivePersonalizedFocus({
  familiarExperiences = [],
  reasonsForJoining = [],
  tenPercentLighter = null
}) {
  const signalScores = {
    energy_and_getting_started: 0,
    thoughts_and_mental_overload: 0,
    connection_and_support: 0,
    interest_and_enjoyment: 0,
    identity_and_self_connection: 0,
    routine_and_sleep: 0,
    functioning_and_tasks: 0
  };

  // 1. Score Familiar Experiences
  familiarExperiences.forEach((item) => {
    const opt = FAMILIAR_EXPERIENCES_OPTIONS.find(
      (o) => o.id === item || o.label === item
    );
    if (opt && opt.signal && signalScores[opt.signal] !== undefined) {
      signalScores[opt.signal] += opt.weight || 2;
    }
  });

  // 2. Score Reason For Joining
  reasonsForJoining.forEach((item) => {
    const opt = REASON_FOR_JOINING_OPTIONS.find(
      (o) => o.id === item || o.label === item
    );
    if (opt && opt.signal && signalScores[opt.signal] !== undefined) {
      signalScores[opt.signal] += opt.weight || 3;
    }
  });

  // 3. Score 10% Lighter
  if (tenPercentLighter) {
    const opt = TEN_PERCENT_LIGHTER_OPTIONS.find(
      (o) => o.id === tenPercentLighter || o.label === tenPercentLighter
    );
    if (opt && opt.signal && signalScores[opt.signal] !== undefined) {
      signalScores[opt.signal] += opt.weight || 3;
    }
  }

  // Deterministic Priority Order in case of ties
  const priorityOrder = [
    'energy_and_getting_started',
    'thoughts_and_mental_overload',
    'functioning_and_tasks',
    'interest_and_enjoyment',
    'connection_and_support',
    'identity_and_self_connection',
    'routine_and_sleep'
  ];

  let highestKey = 'energy_and_getting_started';
  let highestScore = -1;

  for (const key of priorityOrder) {
    if (signalScores[key] > highestScore && signalScores[key] > 0) {
      highestScore = signalScores[key];
      highestKey = key;
    }
  }

  const focusDefinition =
    PERSONALIZATION_FOCUS_DEFINITIONS[highestKey] ||
    PERSONALIZATION_FOCUS_DEFINITIONS.energy_and_getting_started;

  return {
    ...focusDefinition,
    current_focus: highestKey,
    signal_scores: signalScores
  };
}

// ==============================================================================
// ACTIVITY 2: "How Is It Showing Up For Me?" (depression_how_is_it_showing_up)
// Day 1 • Pathway: depression • Activity Type: symptom_domain_mapping
// ==============================================================================

export const ACTIVITY_2_ID = 'depression_how_is_it_showing_up';
export const ACTIVITY_2_TYPE = 'symptom_domain_mapping';

// 4 Distinct Symptom Domains (Mind, Feelings, Body, Actions)
export const FOUR_DOMAINS = [
  {
    id: 'cognitive',
    name: 'MIND',
    emoji: '🧠',
    iconName: 'Brain',
    question: 'What has been happening in my thoughts?',
    themeColor: '#D97706',
    themeBg: '#FEF3C7',
    themeBorder: '#FDE68A',
    options: [
      { id: 'negative_thoughts', label: 'Negative thoughts', signal: 'negative_thoughts', focusArea: 'thoughts_and_mental_overload' },
      { id: 'concentration_difficulty', label: 'Difficulty concentrating', signal: 'concentration_difficulty', focusArea: 'thoughts_and_mental_overload' },
      { id: 'overthinking', label: 'Overthinking', signal: 'negative_thoughts', focusArea: 'thoughts_and_mental_overload' },
      { id: 'feeling_hopeless', label: 'Feeling hopeless', signal: 'negative_thoughts', focusArea: 'thoughts_and_mental_overload' },
      { id: 'hard_to_make_decisions', label: 'Hard to make decisions', signal: 'concentration_difficulty', focusArea: 'functioning_and_tasks' },
      { id: 'self_criticism', label: 'Being hard on myself', signal: 'self_criticism', focusArea: 'identity_and_self_connection' },
      { id: 'mind_none', label: 'None of these', isNone: true },
      { id: 'mind_other', label: 'Something else', isOther: true }
    ]
  },
  {
    id: 'emotional',
    name: 'FEELINGS',
    emoji: '💭',
    iconName: 'Heart',
    question: 'What have I been feeling?',
    themeColor: '#7C3AED',
    themeBg: '#EDE9FE',
    themeBorder: '#DDD6FE',
    options: [
      { id: 'sad', label: 'Sad', signal: 'low_mood', focusArea: 'thoughts_and_mental_overload' },
      { id: 'empty', label: 'Empty', signal: 'low_mood', focusArea: 'thoughts_and_mental_overload' },
      { id: 'numb', label: 'Numb', signal: 'low_mood', focusArea: 'thoughts_and_mental_overload' },
      { id: 'irritable', label: 'Irritable', signal: 'emotional_reactivity', focusArea: 'thoughts_and_mental_overload' },
      { id: 'guilty', label: 'Guilty', signal: 'self_criticism', focusArea: 'identity_and_self_connection' },
      { id: 'low_interest', label: 'Less interested in things', signal: 'low_interest', focusArea: 'interest_and_enjoyment' },
      { id: 'feelings_none', label: 'None of these', isNone: true },
      { id: 'feelings_other', label: 'Something else', isOther: true }
    ]
  },
  {
    id: 'physical',
    name: 'BODY',
    emoji: '🫀',
    iconName: 'Flame',
    question: 'What have I noticed physically?',
    themeColor: '#DC2626',
    themeBg: '#FEE2E2',
    themeBorder: '#FECACA',
    options: [
      { id: 'low_energy', label: 'Low energy', signal: 'low_energy', focusArea: 'energy_and_getting_started' },
      { id: 'sleep_changes', label: 'Sleeping differently', signal: 'sleep_changes', focusArea: 'routine_and_sleep' },
      { id: 'appetite_changed', label: 'Appetite changed', signal: 'appetite_changes', focusArea: 'routine_and_sleep' },
      { id: 'feeling_slowed_down', label: 'Feeling slowed down', signal: 'low_energy', focusArea: 'energy_and_getting_started' },
      { id: 'feeling_restless', label: 'Feeling restless', signal: 'restlessness', focusArea: 'routine_and_sleep' },
      { id: 'physically_drained', label: 'Physically drained', signal: 'low_energy', focusArea: 'energy_and_getting_started' },
      { id: 'body_none', label: 'None of these', isNone: true },
      { id: 'body_other', label: 'Something else', isOther: true }
    ]
  },
  {
    id: 'behavioral',
    name: 'ACTIONS',
    emoji: '🏃',
    iconName: 'Activity',
    question: 'What have I been doing differently?',
    themeColor: '#059669',
    themeBg: '#D1FAE5',
    themeBorder: '#A7F3D0',
    options: [
      { id: 'staying_in_bed', label: 'Staying in bed', signal: 'avoidance', focusArea: 'energy_and_getting_started' },
      { id: 'avoiding_things', label: 'Avoiding things', signal: 'avoidance', focusArea: 'functioning_and_tasks' },
      { id: 'social_withdrawal', label: 'Isolating myself', signal: 'social_withdrawal', focusArea: 'connection_and_support' },
      { id: 'putting_things_off', label: 'Putting things off', signal: 'avoidance', focusArea: 'functioning_and_tasks' },
      { id: 'doing_less', label: 'Doing less', signal: 'doing_less', focusArea: 'energy_and_getting_started' },
      { id: 'everyday_tasks_harder', label: 'Everyday tasks feel harder', signal: 'task_difficulty', focusArea: 'functioning_and_tasks' },
      { id: 'actions_none', label: 'None of these', isNone: true },
      { id: 'actions_other', label: 'Something else', isOther: true }
    ]
  }
];

// Dynamic primary difficulty options pool mapped to selections
export const PRIMARY_DIFFICULTY_CANDIDATES = [
  {
    id: 'energy_really_low',
    label: 'My energy is really low',
    matchKeys: ['low_energy', 'physically_drained', 'feeling_slowed_down', 'staying_in_bed'],
    signal: 'low_energy',
    focusArea: 'energy_and_getting_started'
  },
  {
    id: 'thoughts_wont_switch_off',
    label: "My thoughts won't switch off",
    matchKeys: ['negative_thoughts', 'overthinking', 'feeling_hopeless', 'self_criticism'],
    signal: 'negative_thoughts',
    focusArea: 'thoughts_and_mental_overload'
  },
  {
    id: 'dont_enjoy_things',
    label: "I don't enjoy things like I used to",
    matchKeys: ['low_interest', 'numb', 'empty', 'sad'],
    signal: 'low_interest',
    focusArea: 'interest_and_enjoyment'
  },
  {
    id: 'keep_avoiding_things',
    label: 'I keep avoiding things',
    matchKeys: ['avoiding_things', 'putting_things_off', 'doing_less'],
    signal: 'avoidance',
    focusArea: 'functioning_and_tasks'
  },
  {
    id: 'dont_feel_like_seeing_people',
    label: "I don't feel like seeing people",
    matchKeys: ['social_withdrawal', 'irritable'],
    signal: 'social_withdrawal',
    focusArea: 'connection_and_support'
  },
  {
    id: 'everyday_tasks_overwhelming',
    label: 'Everyday tasks feel overwhelming',
    matchKeys: ['everyday_tasks_harder', 'concentration_difficulty', 'hard_to_make_decisions'],
    signal: 'task_difficulty',
    focusArea: 'functioning_and_tasks'
  },
  {
    id: 'something_else',
    label: 'Something else',
    matchKeys: ['*'],
    signal: 'general_reflection',
    focusArea: 'energy_and_getting_started',
    isOther: true
  }
];

/**
 * Computes relevant Primary Difficulty options based on user's 4 domain selections
 */
export function getRelevantPrimaryDifficulties(symptomDomains = {}) {
  const allSelectedIds = [
    ...(symptomDomains.cognitive || []),
    ...(symptomDomains.emotional || []),
    ...(symptomDomains.physical || []),
    ...(symptomDomains.behavioral || [])
  ];

  const matched = [];

  for (const candidate of PRIMARY_DIFFICULTY_CANDIDATES) {
    if (candidate.id === 'something_else') continue;
    const hasMatch = candidate.matchKeys.some((k) => allSelectedIds.includes(k));
    if (hasMatch) {
      matched.push(candidate);
    }
  }

  // Fallback defaults if few or none were selected
  if (matched.length === 0) {
    return [
      PRIMARY_DIFFICULTY_CANDIDATES[0],
      PRIMARY_DIFFICULTY_CANDIDATES[1],
      PRIMARY_DIFFICULTY_CANDIDATES[2],
      PRIMARY_DIFFICULTY_CANDIDATES[5],
      PRIMARY_DIFFICULTY_CANDIDATES[6]
    ];
  }

  // Always include "Something else" as the last option
  const somethingElse = PRIMARY_DIFFICULTY_CANDIDATES.find((c) => c.id === 'something_else');
  return [...matched, somethingElse];
}

/**
 * Evaluates the 4 domains and derives personalization signals idempotently
 */
export function evaluateHowIsItShowingUp(symptomDomains = {}, primaryDifficulty = null) {
  const selectedOptions = [];
  const signalsMap = {};
  const activeAreas = [];

  FOUR_DOMAINS.forEach((domain) => {
    const selectedIds = symptomDomains[domain.id] || [];
    const validSelections = selectedIds.filter((id) => !id.endsWith('_none'));
    
    if (validSelections.length > 0) {
      activeAreas.push({
        id: domain.id,
        name: domain.name,
        emoji: domain.emoji,
        count: validSelections.length
      });
    }

    selectedIds.forEach((optId) => {
      const opt = domain.options.find((o) => o.id === optId);
      if (opt && !opt.isNone) {
        selectedOptions.push({
          domainId: domain.id,
          domainName: domain.name,
          optionId: opt.id,
          label: opt.label,
          signal: opt.signal
        });

        if (opt.signal) {
          signalsMap[opt.signal] = (signalsMap[opt.signal] || 0) + 1;
        }
      }
    });
  });

  if (primaryDifficulty) {
    const prim = PRIMARY_DIFFICULTY_CANDIDATES.find((c) => c.id === primaryDifficulty || c.label === primaryDifficulty);
    if (prim && prim.signal && prim.signal !== 'general_reflection') {
      signalsMap[prim.signal] = (signalsMap[prim.signal] || 0) + 2;
    }
  }

  return {
    selectedOptions,
    signalsMap,
    activeAreas,
    activeAreasCount: activeAreas.length
  };
}

// ==============================================================================
// DAY 1 ACTIVITY 2: "Where Am I Right Now?" Snapshot Dimensions
// ==============================================================================

// Screen 1: Energy & Battery
export const SNAPSHOT_ENERGY_OPTIONS = [
  {
    id: 'enough_energy',
    label: 'I have enough energy for most of my day',
    score: 0,
    signal: 'energy_and_getting_started',
    strength: 0
  },
  {
    id: 'tired_more_easily',
    label: 'I get tired more easily than I used to',
    score: 1,
    signal: 'energy_and_getting_started',
    strength: 1
  },
  {
    id: 'simple_things_exhausting',
    label: 'Even simple things can feel exhausting',
    score: 2,
    signal: 'energy_and_getting_started',
    strength: 2
  }
];

// Screen 2: Mind & Thoughts
export const SNAPSHOT_THOUGHTS_OPTIONS = [
  {
    id: 'focus_and_switch_off',
    label: 'I can usually focus and switch off',
    score: 0,
    signal: 'thoughts_and_mental_overload',
    strength: 0
  },
  {
    id: 'thoughts_stuck_or_distracted',
    label: 'My thoughts get stuck or distracted sometimes',
    score: 1,
    signal: 'thoughts_and_mental_overload',
    strength: 1
  },
  {
    id: 'mind_heavy_noisy_hard_to_switch_off',
    label: 'My mind feels heavy, noisy, or hard to switch off',
    score: 2,
    signal: 'thoughts_and_mental_overload',
    strength: 2
  }
];

// Screen 3: Interest & Lightness
export const SNAPSHOT_ENJOYMENT_OPTIONS = [
  {
    id: 'look_forward_to_things',
    label: 'I still look forward to things I enjoy',
    score: 0,
    signal: 'interest_and_enjoyment',
    strength: 0
  },
  {
    id: 'enjoy_but_not_quite_same',
    label: "I enjoy things, but they don't feel quite the same",
    score: 1,
    signal: 'interest_and_enjoyment',
    strength: 1
  },
  {
    id: 'rarely_feel_enjoyable',
    label: 'Things I normally enjoy rarely feel enjoyable right now',
    score: 2,
    signal: 'interest_and_enjoyment',
    strength: 2
  }
];

// Screen 4: Functioning & Rhythm
export const SNAPSHOT_EVERYDAY_OPTIONS = [
  {
    id: 'keep_up_with_most',
    label: 'I can keep up with most everyday tasks',
    score: 0,
    signal: 'functioning_and_tasks',
    strength: 0
  },
  {
    id: 'put_things_off_or_struggle',
    label: 'I put things off or struggle to get started sometimes',
    score: 1,
    signal: 'functioning_and_tasks',
    strength: 1
  },
  {
    id: 'basic_tasks_feel_like_lot',
    label: 'Even basic tasks can feel like a lot',
    score: 2,
    signal: 'functioning_and_tasks',
    strength: 2
  }
];

// Screen 5: People & Space
export const SNAPSHOT_CONNECTION_OPTIONS = [
  {
    id: 'make_time_for_people',
    label: 'I still make time for people I care about',
    score: 0,
    signal: 'connection_and_support',
    strength: 0
  },
  {
    id: 'keeping_to_myself_more',
    label: "I've been keeping to myself more than usual",
    score: 1,
    signal: 'connection_and_support',
    strength: 1
  },
  {
    id: 'avoiding_or_feeling_cut_off',
    label: "I've been avoiding people or feeling cut off from them",
    score: 2,
    signal: 'connection_and_support',
    strength: 2
  }
];

// Screen 6: Rest & Self-Care
export const SNAPSHOT_SELF_CARE_OPTIONS = [
  {
    id: 'mostly_keeping_up',
    label: "I'm mostly keeping up with sleep, food and personal care",
    score: 0,
    signal: 'routine_and_sleep',
    strength: 0
  },
  {
    id: 'letting_some_things_slide',
    label: "I've been letting some things slide",
    score: 1,
    signal: 'routine_and_sleep',
    strength: 1
  },
  {
    id: 'basic_self_care_difficult',
    label: 'Basic self-care has started to feel difficult',
    score: 2,
    signal: 'routine_and_sleep',
    strength: 2
  }
];

export const SNAPSHOT_DIMENSIONS = [
  { key: 'energy', label: 'Energy', icon: '☀️', options: SNAPSHOT_ENERGY_OPTIONS },
  { key: 'thoughts', label: 'Thoughts & mind', icon: '🧠', options: SNAPSHOT_THOUGHTS_OPTIONS },
  { key: 'enjoyment', label: 'Enjoyment & interest', icon: '✨', options: SNAPSHOT_ENJOYMENT_OPTIONS },
  { key: 'everyday_life', label: 'Everyday things', icon: '🏃', options: SNAPSHOT_EVERYDAY_OPTIONS },
  { key: 'connection', label: 'Connection with people', icon: '🫂', options: SNAPSHOT_CONNECTION_OPTIONS },
  { key: 'self_care', label: 'Self-care & rest', icon: '🌱', options: SNAPSHOT_SELF_CARE_OPTIONS }
];

/**
 * Evaluates the Day 1 Activity 2 snapshot into non-clinical categorizations:
 * "Things feeling harder right now" vs "Still within reach", preserving the exact selected statement.
 */
export function evaluateWhereAmISnapshot(answers = {}) {
  const harderItems = [];
  const withinReachItems = [];
  const signalStrengths = {};

  const dimensions = [
    { key: 'thoughts', label: 'Thoughts & mind', icon: '🧠', options: SNAPSHOT_THOUGHTS_OPTIONS, signal: 'thoughts_and_mental_overload' },
    { key: 'enjoyment', label: 'Enjoyment & interest', icon: '✨', options: SNAPSHOT_ENJOYMENT_OPTIONS, signal: 'interest_and_enjoyment' },
    { key: 'connection', label: 'Connection with people', icon: '🫂', options: SNAPSHOT_CONNECTION_OPTIONS, signal: 'connection_and_support' },
    { key: 'self_care', label: 'Self-care & rest', icon: '🌱', options: SNAPSHOT_SELF_CARE_OPTIONS, signal: 'routine_and_sleep' },
    { key: 'energy', label: 'Energy', icon: '☀️', options: SNAPSHOT_ENERGY_OPTIONS, signal: 'energy_and_getting_started' },
    { key: 'everyday_life', label: 'Everyday things', icon: '🏃', options: SNAPSHOT_EVERYDAY_OPTIONS, signal: 'functioning_and_tasks' }
  ];

  let maxDifficultyScore = -1;
  let primaryStruggleDimension = null;

  dimensions.forEach((dim) => {
    const selectedId = answers[dim.key];
    const opt = dim.options.find((o) => o.id === selectedId);
    const score = opt ? opt.score : 0;
    const strength = opt ? opt.strength : 0;

    signalStrengths[dim.signal] = strength;

    const entry = {
      key: dim.key,
      label: dim.label,
      icon: dim.icon,
      selectedId: selectedId || 'not_answered',
      selectedStatement: opt ? opt.label : 'Not answered',
      selectedLabel: opt ? opt.label : 'Not selected',
      score
    };

    if (score >= 1) {
      harderItems.push(entry);
    } else {
      withinReachItems.push(entry);
    }

    if (score > maxDifficultyScore) {
      maxDifficultyScore = score;
      primaryStruggleDimension = dim.key;
    }
  });

  // Tailored compassionate observation (non-diagnostic)
  let insightHeadline = "Starting with clear self-awareness";
  let insightBody = "Notice what is taking extra effort right now without judgment. We'll pace each day gently.";

  const energyScore = SNAPSHOT_ENERGY_OPTIONS.find((o) => o.id === answers.energy)?.score || 0;
  const everydayScore = SNAPSHOT_EVERYDAY_OPTIONS.find((o) => o.id === answers.everyday_life)?.score || 0;
  const thoughtsScore = SNAPSHOT_THOUGHTS_OPTIONS.find((o) => o.id === answers.thoughts)?.score || 0;
  const enjoymentScore = SNAPSHOT_ENJOYMENT_OPTIONS.find((o) => o.id === answers.enjoyment)?.score || 0;
  const connectionScore = SNAPSHOT_CONNECTION_OPTIONS.find((o) => o.id === answers.connection)?.score || 0;
  const selfCareScore = SNAPSHOT_SELF_CARE_OPTIONS.find((o) => o.id === answers.self_care)?.score || 0;

  if (energyScore >= 1 && everydayScore >= 1) {
    insightHeadline = "Getting started takes extra patience";
    insightBody = "Right now, getting started and keeping up with daily tasks seem to be taking more effort than usual.\n\nOver the next few days, we'll focus on tiny, zero-pressure steps that help you move without burning through your limited battery.";
  } else if (thoughtsScore === 2 || (thoughtsScore >= 1 && thoughtsScore >= energyScore && thoughtsScore >= enjoymentScore)) {
    insightHeadline = "Giving your mind space to breathe";
    insightBody = "It sounds like your mind and internal thoughts may be taking up a lot of your energy right now.\n\nTogether, we'll practice ways to create gentle distance from mental noise without forcing yourself to 'think positive.'";
  } else if (enjoymentScore === 2 || (enjoymentScore >= 1 && enjoymentScore >= energyScore)) {
    insightHeadline = "Allowing moments to reconnect quietly";
    insightBody = "It sounds like some things that usually bring you lightness or interest are feeling a little further away right now.\n\nRemember: pleasure returns in micro-doses, and you don't need to force yourself to feel excited right away.";
  } else if (connectionScore === 2 || (connectionScore >= 1 && connectionScore >= energyScore)) {
    insightHeadline = "Honoring your social battery";
    insightBody = "It sounds like having people around you or staying connected may feel a little heavier right now.\n\nPulling back is a normal protective instinct when depleted. We'll explore safe, low-pressure ways to stay anchored.";
  } else if (selfCareScore >= 1) {
    insightHeadline = "Gently supporting your foundation";
    insightBody = "Basic self-care and daily rhythms appear to need extra care right now.\n\nWe'll focus on gentle, forgiving resets that help your body and mind feel supported without any guilt.";
  }

  return {
    harderItems,
    withinReachItems,
    signalStrengths,
    primaryStruggleDimension: primaryStruggleDimension || 'energy',
    insight: {
      headline: insightHeadline,
      body: insightBody
    }
  };
}

// ==============================================================================
// ACTIVITY 3: "One Tiny Step" (depression_one_tiny_step)
// ==============================================================================

export const ACTIVITY_3_ID = 'depression_one_tiny_step';
export const ACTIVITY_3_TYPE = 'behavioral_activation';

export const TINY_STEP_CATEGORIES = [
  {
    id: 'self_care',
    title: 'TAKE CARE OF ME',
    subtitle: 'Something small for my body',
    signal: 'self_care_preference',
    color: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    sizes: [
      { id: 'sc_large', label: 'Take a full warm shower & get dressed', sizeLevel: 4, minutes: 20, difficulty: 'standard' },
      { id: 'sc_medium', label: 'Wash my face and brush my teeth', sizeLevel: 3, minutes: 5, difficulty: 'moderate' },
      { id: 'sc_small', label: 'Drink a fresh glass of cold water', sizeLevel: 2, minutes: 2, difficulty: 'small' },
      { id: 'sc_micro', label: 'Put on clean comfortable socks', sizeLevel: 1, minutes: 1, difficulty: 'tiny' },
      { id: 'sc_nano', label: 'Take 3 slow deep breaths right where I am', sizeLevel: 0, minutes: 1, difficulty: 'micro' }
    ]
  },
  {
    id: 'space_reset',
    title: 'MAKE MY SPACE EASIER',
    subtitle: 'Clear, tidy or reset one small thing',
    signal: 'environment_reset_preference',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    sizes: [
      { id: 'sp_large', label: 'Clean and vacuum the entire room', sizeLevel: 4, minutes: 30, difficulty: 'standard' },
      { id: 'sp_medium', label: 'Clear the cluttered desk or table', sizeLevel: 3, minutes: 10, difficulty: 'moderate' },
      { id: 'sp_small', label: 'Put 3 cups or dishes in the sink', sizeLevel: 2, minutes: 3, difficulty: 'small' },
      { id: 'sp_micro', label: 'Open the curtains or a window for fresh air', sizeLevel: 1, minutes: 1, difficulty: 'tiny' },
      { id: 'sp_nano', label: 'Straighten one pillow or blanket on my bed', sizeLevel: 0, minutes: 1, difficulty: 'micro' }
    ]
  },
  {
    id: 'get_moving',
    title: 'GET MOVING',
    subtitle: 'Step outside, stretch or take a short walk',
    signal: 'movement_preference',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    sizes: [
      { id: 'mv_large', label: '20-minute brisk walk in the neighborhood', sizeLevel: 4, minutes: 20, difficulty: 'standard' },
      { id: 'mv_medium', label: '10-minute gentle stroll outside', sizeLevel: 3, minutes: 10, difficulty: 'moderate' },
      { id: 'mv_small', label: '5-minute slow walk or stretch', sizeLevel: 2, minutes: 5, difficulty: 'small' },
      { id: 'mv_micro', label: 'Step outside for 2 minutes and feel the breeze', sizeLevel: 1, minutes: 2, difficulty: 'tiny' },
      { id: 'mv_nano', label: 'Stand up and stretch my arms overhead for 10 seconds', sizeLevel: 0, minutes: 1, difficulty: 'micro' }
    ]
  },
  {
    id: 'deal_with_one_thing',
    title: 'DEAL WITH ONE THING',
    subtitle: 'Reply, send, start or finish something small',
    signal: 'task_avoidance_preference',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    sizes: [
      { id: 'dl_large', label: 'Clear all pending emails and messages', sizeLevel: 4, minutes: 30, difficulty: 'standard' },
      { id: 'dl_medium', label: 'Write a full thoughtful reply to one email', sizeLevel: 3, minutes: 10, difficulty: 'moderate' },
      { id: 'dl_small', label: 'Send a quick 1-sentence text reply', sizeLevel: 2, minutes: 2, difficulty: 'small' },
      { id: 'dl_micro', label: 'Open the app or document and read the first line', sizeLevel: 1, minutes: 1, difficulty: 'tiny' },
      { id: 'dl_nano', label: 'Acknowledge the message with a simple reaction emoji', sizeLevel: 0, minutes: 1, difficulty: 'micro' }
    ]
  },
  {
    id: 'enjoyment',
    title: 'DO SOMETHING I ENJOY',
    subtitle: 'Bring a little pleasure back into today',
    signal: 'pleasure_activity_preference',
    color: '#EA580C',
    bg: '#FFF7ED',
    border: '#FFEDD5',
    sizes: [
      { id: 'ej_large', label: 'Watch a full movie or cook a complete recipe', sizeLevel: 4, minutes: 45, difficulty: 'standard' },
      { id: 'ej_medium', label: 'Read a book chapter or play a game for 15 mins', sizeLevel: 3, minutes: 15, difficulty: 'moderate' },
      { id: 'ej_small', label: 'Listen to 1 favorite uplifting song with headphones', sizeLevel: 2, minutes: 4, difficulty: 'small' },
      { id: 'ej_micro', label: 'Make and smell a warm cup of tea or coffee', sizeLevel: 1, minutes: 2, difficulty: 'tiny' },
      { id: 'ej_nano', label: 'Look at a photo that makes me smile for 30 seconds', sizeLevel: 0, minutes: 1, difficulty: 'micro' }
    ]
  },
  {
    id: 'avoidance_facing',
    title: 'FACE SOMETHING I’VE BEEN AVOIDING',
    subtitle: 'Take the smallest possible step',
    signal: 'avoidance_present',
    color: '#BE123C',
    bg: '#FFF1F2',
    border: '#FECDD3',
    sizes: [
      { id: 'av_large', label: 'Finish the whole avoided project today', sizeLevel: 4, minutes: 60, difficulty: 'standard' },
      { id: 'av_medium', label: 'Work on the avoided item for 15 minutes straight', sizeLevel: 3, minutes: 15, difficulty: 'moderate' },
      { id: 'av_small', label: 'Locate and open the file/envelope/item', sizeLevel: 2, minutes: 3, difficulty: 'small' },
      { id: 'av_micro', label: 'Write down just the first single step on a sticky note', sizeLevel: 1, minutes: 1, difficulty: 'tiny' },
      { id: 'av_nano', label: 'Look at the task for 10 seconds without doing anything', sizeLevel: 0, minutes: 1, difficulty: 'micro' }
    ]
  },
  {
    id: 'custom',
    title: 'SOMETHING ELSE',
    subtitle: 'Type my own small action',
    signal: 'custom_action_preference',
    color: '#475569',
    bg: '#F8FAFC',
    border: '#E2E8F0',
    sizes: []
  }
];

/**
 * Check for crisis or self-harm keywords in free-text input
 */
export function containsCrisisKeywords(text = '') {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  const crisisTerms = [
    'suicide',
    'kill myself',
    'end my life',
    'self harm',
    'cutting myself',
    'don\'t want to live',
    'want to die',
    'better off dead',
    'harm myself'
  ];
  return crisisTerms.some((term) => lower.includes(term));
}

/**
 * Evaluates Activity 3 responses and generates deterministic personalization signals
 */
export function evaluateOneTinyStep({
  selectedCategory,
  selectedAction,
  actionSizeLevel,
  actionCompleted,
  perceivedDifficulty,
  expectedVsActual
}) {
  const signalsMap = {};

  // 1. Category signal
  const catObj = TINY_STEP_CATEGORIES.find((c) => c.id === selectedCategory);
  if (catObj && catObj.signal) {
    signalsMap[catObj.signal] = 2;
  }

  // 2. Action size preference
  if (actionSizeLevel <= 1) {
    signalsMap['prefers_low_effort_actions'] = 3;
  } else if (actionSizeLevel >= 3) {
    signalsMap['prefers_standard_effort_actions'] = 2;
  }

  // 3. Completion signal
  if (actionCompleted) {
    signalsMap['action_completion_strength'] = 3;
  } else {
    signalsMap['action_completion_strength'] = 1;
    signalsMap['needs_smaller_actions'] = 2;
  }

  // 4. Perceived difficulty signal
  if (expectedVsActual === 'much_easier' || expectedVsActual === 'easier') {
    signalsMap['underestimates_action_capability'] = 2;
  } else if (expectedVsActual === 'much_harder' || expectedVsActual === 'harder') {
    signalsMap['high_friction_for_activation'] = 2;
  }

  return {
    signalsMap,
    categoryTitle: catObj ? catObj.title : 'Custom Action',
    actionText: selectedAction?.label || (typeof selectedAction === 'string' ? selectedAction : 'One Tiny Step')
  };
}

// ==========================================
// MANTRA 21 TRANSITION & CHALLENGE ENGINE
// ==========================================

export const MANTRA_21_INVITATION_ACTIVITY_ID = 'depression_mantra21_invitation';
export const MANTRA_21_INVITATION_ACTIVITY_TYPE = 'pathway_invitation';

export const MANTRA_21_MOTIVATION_OPTIONS = [
  {
    id: 'identity_reconnection',
    emoji: '🌱',
    title: 'FEEL MORE LIKE MYSELF',
    description: "I want to reconnect with the person I feel I've been losing touch with.",
    signal: 'identity_reconnection',
    bridgeTitle: "Then let's start there.",
    bridgeBody: "You don't need to know exactly how to get there yet.\n\nFor the next 21 days, we'll help you explore small steps that move in that direction."
  },
  {
    id: 'daily_functioning',
    emoji: '⚡',
    title: 'MAKE EVERYDAY LIFE MORE DOABLE',
    description: 'I want everyday things to feel a little easier to start.',
    signal: 'daily_functioning',
    bridgeTitle: "Then let's make things more doable.",
    bridgeBody: 'Small actions. Practical tools. One day at a time.'
  },
  {
    id: 'thought_management',
    emoji: '🧠',
    title: 'UNDERSTAND MY THOUGHTS',
    description: 'I want to get better at noticing and working with difficult thoughts.',
    signal: 'thought_management',
    bridgeTitle: "Then let's look at thoughts together.",
    bridgeBody: "You don't have to force positive thinking. We'll learn how to notice heavy thought spirals without getting swept away."
  },
  {
    id: 'enjoyment',
    emoji: '✨',
    title: 'BRING BACK SOME ENJOYMENT',
    description: 'I want to reconnect with things that used to feel good.',
    signal: 'enjoyment',
    bridgeTitle: "Then let's invite lightness back in.",
    bridgeBody: "Even when things feel flat, small micro-moments can slowly rekindle warmth and interest. We'll start gently."
  },
  {
    id: 'connection',
    emoji: '🫂',
    title: 'FEEL MORE CONNECTED',
    description: 'I want to reconnect with people I care about.',
    signal: 'connection',
    bridgeTitle: "Then let's build low-pressure connection.",
    bridgeBody: "You don't have to explain everything to everyone. We'll explore comfortable, low-battery ways to feel less alone."
  },
  {
    id: 'routine',
    emoji: '🎯',
    title: 'BUILD A BETTER RHYTHM',
    description: 'I want to find a routine that actually feels manageable.',
    signal: 'routine',
    bridgeTitle: "Then let's find a steady rhythm.",
    bridgeBody: "No rigid schedules or unrealistic habits. Just steady, sustainable anchors that protect your energy."
  },
  {
    id: 'curiosity',
    emoji: '💭',
    title: "I'M JUST CURIOUS",
    description: "I don't know exactly what I need yet. I just want to try.",
    signal: 'curiosity',
    bridgeTitle: "Curiosity is a wonderful place to begin.",
    bridgeBody: "You don't need all the answers today. Taking it one day at a time is all that's required."
  }
];

export const MANTRA_21_MILESTONES = [
  {
    day: '01',
    title: 'Start where you are',
    status: 'completed'
  },
  {
    day: '07',
    title: 'Bring something back',
    status: 'upcoming'
  },
  {
    day: '14',
    title: 'Understand your patterns',
    status: 'upcoming'
  },
  {
    day: '21',
    title: 'Build your own toolkit',
    status: 'upcoming'
  }
];

/**
 * Generate bridge copy dynamic for single or multi-selected motivations
 */
export function getMantra21BridgeContent(selectedMotivationIds = []) {
  if (!selectedMotivationIds || selectedMotivationIds.length === 0) {
    return {
      bridgeTitle: "Then let's take it one step at a time.",
      bridgeBody: "Small actions. Practical tools. One day at a time. Showing up is what counts."
    };
  }

  const primaryObj = MANTRA_21_MOTIVATION_OPTIONS.find((m) => m.id === selectedMotivationIds[0]);
  if (selectedMotivationIds.length === 1 && primaryObj) {
    return {
      bridgeTitle: primaryObj.bridgeTitle,
      bridgeBody: primaryObj.bridgeBody
    };
  }

  const secondaryObj = MANTRA_21_MOTIVATION_OPTIONS.find((m) => m.id === selectedMotivationIds[1]);
  if (primaryObj && secondaryObj) {
    return {
      bridgeTitle: primaryObj.bridgeTitle,
      bridgeBody: `${primaryObj.bridgeBody}\n\nWe'll also explore practical ways to ${secondaryObj.title.toLowerCase()} along the way.`
    };
  }

  return {
    bridgeTitle: primaryObj?.bridgeTitle || "Then let's begin.",
    bridgeBody: primaryObj?.bridgeBody || "One small step at a time."
  };
}

