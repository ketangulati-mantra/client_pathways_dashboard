export type Mantra21ActivityType =
  | 'BEHAVIORAL_ACTIVATION'
  | 'MULTI_SELECT'
  | 'EDUCATIONAL'
  | 'CHOICE'
  | 'CBT_THOUGHT_WORK'
  | 'VALUES'
  | 'SOCIAL_SUPPORT'
  | 'SELF_COMPASSION'
  | 'TOOLKIT';

export interface Mantra21Step {
  id: string;
  kind: 'arrive' | 'learn' | 'interact' | 'do' | 'reflect' | 'complete';
  title?: string;
  subtitle?: string;
  badge?: string;
  estimatedMinutes?: number;

  // Arrival / Context
  quote?: string;
  contextText?: string;
  highlightWords?: string[];

  // Educational / Micro-learning
  teachPoints?: Array<{
    heading: string;
    body: string;
    subtext?: string;
  }>;

  // Interactive Learning / Multi-select / Single-select
  prompt?: string;
  helperText?: string;
  interactionType?: 'single_choice' | 'multi_choice' | 'scale_spectrum' | 'action_selector' | 'thought_reframe' | 'drag_sort';
  maxSelections?: number;
  options?: Array<{
    id: string;
    label: string;
    description?: string;
    category?: string; // MIND, BODY, FEELINGS, ACTIONS
    iconName?: string;
    subOptions?: string[];
  }>;

  // Real-world "Do" Action Phase
  actionPrompt?: string;
  actionGuidance?: string;
  actionMicroSteps?: string[];
  allowTimer?: boolean;
  defaultTimerSeconds?: number;
  pauseAllowed?: boolean;

  // Reflection / Before-After
  reflectionQuestion?: string;
  reflectionPlaceholder?: string;
  showMoodDelta?: boolean; // Much worse -> Much better
  optionalReflection?: boolean;

  // Personalization / Signal tags emitted
  signalOnSelect?: Record<string, string>; // optionId -> signal_name
}

export interface Mantra21DayActivity {
  dayNumber: number;
  activityId: string;
  slug: string;
  title: string;
  tagline: string;
  durationMinutes: number;
  type: Mantra21ActivityType;
  accentColor: string;
  themeCategory: string;
  heroCanvasStyle: 'aurora' | 'dawn' | 'zenith' | 'twilight' | 'solitude';
  tinyWinTemplate: {
    title: string;
    format: (data: any) => string;
    badgeName: string;
  };
  steps: Mantra21Step[];
}

export const MANTRA_21_ACTIVITIES: Record<number, Mantra21DayActivity> = {
  1: {
    dayNumber: 1,
    activityId: 'mantra21_day_01',
    slug: 'day-01-start-where-you-are',
    title: 'Start Where You Are',
    tagline: 'Choose one small thing that makes today 1% easier.',
    durationMinutes: 4,
    type: 'BEHAVIORAL_ACTIVATION',
    accentColor: '#38BDF8',
    themeCategory: 'Momentum',
    heroCanvasStyle: 'dawn',
    tinyWinTemplate: {
      title: "Today's Tiny Win",
      format: (data: any) => `✓ ${data.selectedActionText || 'Completed one tiny intentional step'}`,
      badgeName: 'First Step Badge'
    },
    steps: [
      {
        id: 'arrive',
        kind: 'arrive',
        badge: 'DAY 01 OF 21',
        title: 'Start Where You Are',
        subtitle: 'You do not need to overhaul your entire life today.',
        contextText: 'A universal 21-day journey starts with one real, manageable micro-action. Nothing more.',
        estimatedMinutes: 4
      },
      {
        id: 'learn',
        kind: 'learn',
        title: 'WHY MICRO-STEPS WORK',
        subtitle: 'Momentum follows motion, not motivation.',
        teachPoints: [
          {
            heading: 'The Motivation Myth',
            body: 'We often wait to feel ready before taking action. In reality, readiness arrives after you take a tiny 60-second step.',
            subtext: 'Behavioral Science: Micro-activation decreases nervous system friction.'
          },
          {
            heading: 'Lower The Bar on Purpose',
            body: 'Making a step ridiculously easy removes the resistance of overthinking.',
            subtext: 'Small counts. Always.'
          }
        ]
      },
      {
        id: 'interact',
        kind: 'interact',
        title: "WHAT'S BEEN HARDEST LATELY?",
        subtitle: 'Select what feels heaviest right now (select 1 or 2):',
        interactionType: 'multi_choice',
        maxSelections: 2,
        options: [
          { id: 'getting_started', label: 'Getting started on basic tasks', category: 'ACTIONS' },
          { id: 'quieting_mind', label: 'Quieting racing or self-critical thoughts', category: 'MIND' },
          { id: 'low_energy', label: 'Having very little physical energy', category: 'BODY' },
          { id: 'feeling_disconnected', label: 'Feeling disconnected or withdrawn from others', category: 'FEELINGS' },
          { id: 'staying_focused', label: 'Staying focused without feeling overwhelmed', category: 'ACTIONS' }
        ],
        signalOnSelect: {
          getting_started: 'struggling_with_activation',
          quieting_mind: 'cognitive_overthinking',
          low_energy: 'low_somatic_energy',
          feeling_disconnected: 'social_isolation'
        }
      },
      {
        id: 'choose_action',
        kind: 'interact',
        title: "WHAT'S ONE 1% ACTION FOR TODAY?",
        subtitle: 'Pick the easiest one. Seriously.',
        interactionType: 'action_selector',
        options: [
          { id: 'drink_water', label: 'Drink a glass of cold water', description: 'Immediate physical hydration anchor' },
          { id: 'step_outside', label: 'Step outside or open a window for 60 seconds', description: 'Fresh sensory reset' },
          { id: 'tidy_corner', label: 'Tidy one tiny 1-foot square area', description: 'Clear a small space on your desk or bed' },
          { id: 'stretch_body', label: 'Gentle 2-minute physical shoulder release', description: 'Ease built-up physical tension' },
          { id: 'reply_one', label: 'Send one simple check-in text', description: 'A lightweight message to someone you trust' },
          { id: 'rest_eyes', label: 'Close eyes and take 3 deep, slow breaths', description: 'Grounded pause without screen stimulation' }
        ]
      },
      {
        id: 'do_action',
        kind: 'do',
        title: 'TAKE YOUR TIME.',
        subtitle: 'Go do your chosen action now. We will wait right here.',
        actionPrompt: 'No rushing. When you finish, come back and tap below.',
        allowTimer: true,
        defaultTimerSeconds: 120
      },
      {
        id: 'reflect',
        kind: 'reflect',
        title: 'HOW DO YOU FEEL NOW?',
        subtitle: 'Notice whatever is here. Neutral is completely normal.',
        showMoodDelta: true,
        reflectionQuestion: 'What did you notice about taking that step?',
        reflectionPlaceholder: 'E.g. It was easier than I thought, or still felt a bit heavy...',
        optionalReflection: true
      },
      {
        id: 'complete',
        kind: 'complete',
        badge: 'DAY 01 COMPLETE',
        title: 'You showed up.',
        subtitle: 'That is one real step forward in your journey.'
      }
    ]
  },
  2: {
    dayNumber: 2,
    activityId: 'mantra21_day_02',
    slug: 'day-02-noticing-the-body',
    title: 'Noticing the Body',
    tagline: 'Map physical tension and give your nervous system a 2-minute anchor.',
    durationMinutes: 5,
    type: 'MULTI_SELECT',
    accentColor: '#10B981',
    themeCategory: 'Somatic Awareness',
    heroCanvasStyle: 'zenith',
    tinyWinTemplate: {
      title: "Today's Somatic Win",
      format: (data: any) => `✓ Released physical tension in ${data.selectedBodyParts?.length || 'primary'} body zones`,
      badgeName: 'Body Grounding Badge'
    },
    steps: [
      {
        id: 'arrive',
        kind: 'arrive',
        badge: 'DAY 02 OF 21',
        title: 'Noticing the Body',
        subtitle: 'Your body stores feelings before your mind names them.',
        contextText: 'Today we gently map physical tension without needing to fix or judge it.',
        estimatedMinutes: 5
      },
      {
        id: 'learn',
        kind: 'learn',
        title: 'THE BODY AS AN ALLY',
        subtitle: 'Stress and fatigue are physical experiences first.',
        teachPoints: [
          {
            heading: 'Signals, Not Failures',
            body: 'Tight shoulders, a clenched jaw, or a heavy chest are simply signals that your nervous system has been working overtime.',
            subtext: 'Neurobiology: Awareness alone begins downregulating cortisol.'
          }
        ]
      },
      {
        id: 'interact',
        kind: 'interact',
        title: 'WHERE ARE YOU HOLDING TENSION TODAY?',
        subtitle: 'Tap the areas that feel tight, heavy, or fatigued:',
        interactionType: 'multi_choice',
        options: [
          { id: 'jaw_neck', label: 'Jaw & Clenched Teeth', category: 'BODY' },
          { id: 'shoulders_traps', label: 'Shoulders & Upper Back', category: 'BODY' },
          { id: 'chest_breath', label: 'Chest & Shallow Breath', category: 'BODY' },
          { id: 'stomach_gut', label: 'Stomach / Knot in Gut', category: 'BODY' },
          { id: 'heavy_limbs', label: 'Heavy Arms or Legs', category: 'BODY' },
          { id: 'overall_fatigue', label: 'General Low Physical Energy', category: 'BODY' }
        ],
        signalOnSelect: {
          jaw_neck: 'somatic_tension_jaw',
          shoulders_traps: 'somatic_tension_shoulders',
          chest_breath: 'shallow_breathing_pattern',
          heavy_limbs: 'somatic_fatigue'
        }
      },
      {
        id: 'do_action',
        kind: 'do',
        title: 'A 90-SECOND PHYSICAL RELEASE',
        subtitle: 'Drop your shoulders away from your ears. Unclench your jaw.',
        actionPrompt: 'Take 3 deliberate exhales, making each exhale longer than the inhale.',
        allowTimer: true,
        defaultTimerSeconds: 90
      },
      {
        id: 'reflect',
        kind: 'reflect',
        title: 'HOW DOES YOUR BODY FEEL NOW?',
        subtitle: 'Even a 5% shift in physical ease is real progress.',
        showMoodDelta: true,
        reflectionQuestion: 'Did any tension shift or soften?',
        reflectionPlaceholder: 'E.g. My shoulders dropped, breathing felt a little deeper...',
        optionalReflection: true
      },
      {
        id: 'complete',
        kind: 'complete',
        badge: 'DAY 02 COMPLETE',
        title: 'Grounded and Present.',
        subtitle: 'You tuned into yourself today. Day 03 is ready when you are.'
      }
    ]
  },
  3: {
    dayNumber: 3,
    activityId: 'mantra21_day_03',
    slug: 'day-03-uncoupling-from-thoughts',
    title: 'Thoughts Are Not Facts',
    tagline: 'See automatic critical thoughts as mental weather, not truth.',
    durationMinutes: 6,
    type: 'CBT_THOUGHT_WORK',
    accentColor: '#818CF8',
    themeCategory: 'Cognitive Agility',
    heroCanvasStyle: 'twilight',
    tinyWinTemplate: {
      title: "Today's Mindset Win",
      format: (data: any) => `✓ Reframed an automatic critical narrative`,
      badgeName: 'Thought Clarity Badge'
    },
    steps: [
      {
        id: 'arrive',
        kind: 'arrive',
        badge: 'DAY 03 OF 21',
        title: 'Thoughts Are Not Facts',
        subtitle: 'Just because your mind tells you something does not make it true.',
        contextText: 'Today we learn to step back and observe our thoughts like clouds passing through the sky.',
        estimatedMinutes: 6
      },
      {
        id: 'learn',
        kind: 'learn',
        title: 'THE COGNITIVE FUSION CYCLE',
        subtitle: 'When thoughts feel like absolute reality.',
        teachPoints: [
          {
            heading: 'The Mind as a Problem Generator',
            body: 'Under stress, your brain defaults to catastrophic or self-critical stories to protect you. These are habitual reflexes, not facts.',
            subtext: 'CBT Insight: Notice the thought: "I am having the thought that..."'
          }
        ]
      },
      {
        id: 'interact',
        kind: 'interact',
        title: 'WHICH NARRATIVE HAS BEEN LOUDEST?',
        subtitle: 'Select the thought that has been repeating most frequently:',
        interactionType: 'single_choice',
        options: [
          { id: 'falling_behind', label: '"I am hopelessly falling behind everyone else."' },
          { id: 'not_enough', label: '"Whatever I do is never quite good enough."' },
          { id: 'too_much', label: '"Everything is too overwhelming to deal with right now."' },
          { id: 'pointless', label: '"Nothing I do will really change anything."' },
          { id: 'exhausted', label: '"I should be stronger than this."' }
        ],
        signalOnSelect: {
          falling_behind: 'perceived_inadequacy',
          not_enough: 'perfectionism_trap',
          too_much: 'overwhelm_freeze',
          pointless: 'hopelessness_signal'
        }
      },
      {
        id: 'reframe',
        kind: 'interact',
        title: 'PUTTING SPACE BETWEEN YOU & THE THOUGHT',
        subtitle: 'Pick a balanced, grounding alternative statement:',
        interactionType: 'single_choice',
        options: [
          { id: 'human_pace', label: '"I am moving at a human pace. It is okay to take one step at a time."' },
          { id: 'safe_pause', label: '"I do not have to solve the rest of my life this afternoon."' },
          { id: 'feeling_temporary', label: '"This is a heavy feeling right now, but feelings pass like weather."' }
        ]
      },
      {
        id: 'reflect',
        kind: 'reflect',
        title: 'HOW DOES THAT REFRAME FEEL IN YOUR MIND?',
        subtitle: 'Allow that balanced perspective to settle in.',
        showMoodDelta: true,
        reflectionQuestion: 'One thought or reminder you want to carry today?',
        reflectionPlaceholder: 'Write a short anchor phrase...',
        optionalReflection: true
      },
      {
        id: 'complete',
        kind: 'complete',
        badge: 'DAY 03 COMPLETE',
        title: 'Space Created.',
        subtitle: 'You practiced observing rather than reacting. Day 04 awaits.'
      }
    ]
  },
  4: {
    dayNumber: 4,
    activityId: 'mantra21_day_04',
    slug: 'day-04-see-the-cycle',
    title: 'See the Cycle',
    tagline: 'Understand how thoughts, feelings, body, and actions feed into each other.',
    durationMinutes: 7,
    type: 'CBT_THOUGHT_WORK',
    accentColor: '#38BDF8',
    themeCategory: 'Core CBT Framework',
    heroCanvasStyle: 'aurora',
    tinyWinTemplate: {
      title: "Today's Insight",
      format: (data: any) => `✓ Identified your 4-part mental cycle`,
      badgeName: 'Cycle Insight Badge'
    },
    steps: [
      {
        id: 'arrive',
        kind: 'arrive',
        badge: 'DAY 04 OF 21',
        title: 'See the Cycle',
        subtitle: 'Sometimes mind, body, feelings, and actions reinforce each other.',
        contextText: 'When one part is strained, the other three naturally follow. Seeing the loop is how we unhook from it.',
        estimatedMinutes: 7
      },
      {
        id: 'learn',
        kind: 'learn',
        title: 'WHY THIS HAPPENS',
        subtitle: 'When motivation is low, even simple things can feel unusually difficult.',
        teachPoints: [
          {
            heading: 'Not Laziness — A Feedback Loop',
            body: 'A low-energy body triggers self-critical thoughts. Those thoughts deepen heavy feelings, leading to avoidance actions that drain more energy.',
            subtext: 'Changing ANY one part of the loop begins changing the whole system.'
          }
        ]
      },
      {
        id: 'interact',
        kind: 'interact',
        title: "WHAT'S BEEN SHOWING UP ACROSS YOUR SYSTEM?",
        subtitle: 'Select what resonates across each area:',
        interactionType: 'multi_choice',
        options: [
          { id: 'cycle_mind', label: 'Mind: Overanalyzing and predicting worst-case scenarios', category: 'MIND' },
          { id: 'cycle_body', label: 'Body: Heavy limbs, shallow breathing, sluggishness', category: 'BODY' },
          { id: 'cycle_feelings', label: 'Feelings: Numbness, guilt, or feeling overwhelmed', category: 'FEELINGS' },
          { id: 'cycle_actions', label: 'Actions: Postponing tasks, withdrawing from calls', category: 'ACTIONS' }
        ],
        signalOnSelect: {
          cycle_mind: 'loop_mind_dominant',
          cycle_body: 'loop_body_dominant',
          cycle_feelings: 'loop_feelings_dominant',
          cycle_actions: 'loop_actions_dominant'
        }
      },
      {
        id: 'do_action',
        kind: 'do',
        title: 'DISRUPTING THE LOOP WITH ONE PIVOT',
        subtitle: 'Take 2 minutes to change your physical posture or environment right now.',
        actionPrompt: 'Stand up, roll your shoulders back, or wash your hands with cold water.',
        allowTimer: true,
        defaultTimerSeconds: 120
      },
      {
        id: 'reflect',
        kind: 'reflect',
        title: 'WHAT DID YOU NOTICE?',
        subtitle: 'Did changing one small physical piece create a subtle shift?',
        showMoodDelta: true,
        reflectionQuestion: 'Which part of the cycle is easiest for you to interrupt?',
        reflectionPlaceholder: 'E.g. My actions, by just doing 1 minute of something...',
        optionalReflection: true
      },
      {
        id: 'complete',
        kind: 'complete',
        badge: 'DAY 04 COMPLETE',
        title: 'The Loop is Visible.',
        subtitle: 'You now have the map. Tomorrow on Day 05, we build upon it.'
      }
    ]
  }
};

/**
 * Fallback generator for generic days (Days 5 to 21) ensuring all 21 days have rich, structured definitions.
 */
export function getMantra21DayActivity(dayNumber: number): Mantra21DayActivity {
  const cleanDay = Math.max(1, Math.min(21, dayNumber));
  if (MANTRA_21_ACTIVITIES[cleanDay]) {
    return MANTRA_21_ACTIVITIES[cleanDay];
  }

  // Dynamic deterministic template for remaining challenge days
  const titles = [
    '',
    'Start Where You Are',
    'Noticing the Body',
    'Thoughts Are Not Facts',
    'See the Cycle',
    'Your Inner Dialogue',
    'Finding Micro-Enjoyment',
    'Consistency Checkpoint (Day 07)',
    'Mapping Your Support Circle',
    'Values Over Pressure',
    'The Gentle Boundary',
    'Reclaiming Your Energy',
    'Overcoming Procrastination',
    'Self-Compassion in Action',
    'Halfway Momentum (Day 14)',
    'Mindful Breathing Anchors',
    'Decisional Balance',
    'Untangling Worry Loops',
    'Rewarding Small Wins',
    'Creating Your Sanctuary Routine',
    'Looking Back & Ahead',
    'Finisher Circle (Day 21)'
  ];

  const title = titles[cleanDay] || `Day ${String(cleanDay).padStart(2, '0')} Practice`;

  return {
    dayNumber: cleanDay,
    activityId: `mantra21_day_${String(cleanDay).padStart(2, '0')}`,
    slug: `day-${String(cleanDay).padStart(2, '0')}`,
    title,
    tagline: `Show up for Day ${cleanDay} with intentional focus and steady micro-actions.`,
    durationMinutes: 5 + (cleanDay % 4),
    type: cleanDay % 3 === 0 ? 'CBT_THOUGHT_WORK' : cleanDay % 2 === 0 ? 'MULTI_SELECT' : 'BEHAVIORAL_ACTIVATION',
    accentColor: cleanDay >= 14 ? '#38BDF8' : cleanDay >= 7 ? '#10B981' : '#818CF8',
    themeCategory: cleanDay >= 14 ? 'Integration' : cleanDay >= 7 ? 'Deepening Practice' : 'Foundations',
    heroCanvasStyle: cleanDay % 2 === 0 ? 'dawn' : 'aurora',
    tinyWinTemplate: {
      title: `Day ${cleanDay} Milestone`,
      format: () => `✓ Completed Day ${cleanDay} Daily Practice`,
      badgeName: `Day ${cleanDay} Milestone`
    },
    steps: [
      {
        id: 'arrive',
        kind: 'arrive',
        badge: `DAY ${String(cleanDay).padStart(2, '0')} OF 21`,
        title,
        subtitle: 'Another day of showing up for your mind.',
        contextText: 'Take a quiet breath. You are building something real, one day at a time.',
        estimatedMinutes: 5
      },
      {
        id: 'learn',
        kind: 'learn',
        title: 'TODAY’S FOCUS POINT',
        subtitle: 'Consistency is formed in moments when energy is imperfect.',
        teachPoints: [
          {
            heading: 'Showing Up Imperfectly',
            body: 'You do not need 100% motivation today. You only need a 2-minute willingness to engage.',
            subtext: 'Neuroplasticity: Small daily practice rewires autonomic reactivity.'
          }
        ]
      },
      {
        id: 'interact',
        kind: 'interact',
        title: "WHAT'S PRESENT FOR YOU TODAY?",
        subtitle: 'Select what best reflects your current mindset:',
        interactionType: 'single_choice',
        options: [
          { id: 'curious', label: 'I feel curious and ready to explore.' },
          { id: 'a_bit_tired', label: 'I am somewhat tired, but I am here.' },
          { id: 'heavy', label: 'Things feel heavy today, taking it extra slow.' }
        ]
      },
      {
        id: 'do_action',
        kind: 'do',
        title: 'ONE FOCUSED PRACTICE STEP',
        subtitle: 'Take 2 quiet minutes to ground yourself in the present moment.',
        actionPrompt: 'Close your eyes or look out a window. Focus on 5 calm breaths.',
        allowTimer: true,
        defaultTimerSeconds: 120
      },
      {
        id: 'reflect',
        kind: 'reflect',
        title: 'HOW ARE YOU FEELING NOW?',
        subtitle: 'Notice the state of your mind and body.',
        showMoodDelta: true,
        reflectionQuestion: 'Any small insight or feeling from today?',
        reflectionPlaceholder: 'Write a brief note...',
        optionalReflection: true
      },
      {
        id: 'complete',
        kind: 'complete',
        badge: `DAY ${String(cleanDay).padStart(2, '0')} COMPLETE`,
        title: 'You showed up.',
        subtitle: `Day ${cleanDay} is in the books. Small steps lead to lasting change.`
      }
    ]
  };
}
