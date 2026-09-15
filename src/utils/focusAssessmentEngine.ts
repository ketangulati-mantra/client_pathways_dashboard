/**
 * Focus Assessment Engine
 * 
 * Deterministic scoring and rule-based evaluation for the 21-day personalized focus assessment.
 * Maps answers directly to ONE of the 9 canonical pathway categories:
 * - Depression
 * - ADHD
 * - Relationship Issues
 * - Other Concerns
 * - Sleep
 * - Anger
 * - Grief
 * - PTSD
 * - Eating Disorder
 * 
 * Step 1 establishes the primary starting concern.
 * Step 2 and Step 3 personalize the starting point within that concern and provide subthemes.
 * Never outputs invented categories.
 */

export type ConcernKey =
  | 'depression'
  | 'adhd'
  | 'relationship_issues'
  | 'sleep'
  | 'anxiety'
  | 'stress'
  | 'anger'
  | 'grief'
  | 'ptsd'
  | 'eating_disorder'
  | 'other_concerns';

export interface ConcernMetadata {
  key: ConcernKey;
  label: string; // Canonical label
  pathwayName: string; // Canonical pathway string for webhook assignment
  screen1OptionText: string;
}

// Step 1 ordered options: primary concerns 1-8, with "Something else" as the 9th (last) option
export const CONCERNS: Record<ConcernKey, ConcernMetadata> = {
  depression: {
    key: 'depression',
    label: 'Depression',
    pathwayName: 'Depression',
    screen1OptionText: 'Feeling low, hopeless, or losing interest in things'
  },
  adhd: {
    key: 'adhd',
    label: 'ADHD',
    pathwayName: 'ADHD',
    screen1OptionText: 'Trouble focusing, staying organized, or managing attention'
  },
  relationship_issues: {
    key: 'relationship_issues',
    label: 'Relationship Issues',
    pathwayName: 'Relationships',
    screen1OptionText: 'Problems in a relationship or difficulty connecting with people'
  },
  sleep: {
    key: 'sleep',
    label: 'Sleep',
    pathwayName: 'Sleep',
    screen1OptionText: 'Sleep problems'
  },
  anxiety: {
    key: 'anxiety',
    label: 'Anxiety',
    pathwayName: 'Anxiety',
    screen1OptionText: 'Feeling anxious, nervous, or on edge'
  },
  stress: {
    key: 'stress',
    label: 'Stress',
    pathwayName: 'Stress',
    screen1OptionText: 'Feeling overwhelmed or under high stress'
  },
  anger: {
    key: 'anger',
    label: 'Anger',
    pathwayName: 'Anger',
    screen1OptionText: 'Anger or strong reactions'
  },
  grief: {
    key: 'grief',
    label: 'Grief',
    pathwayName: 'Grief',
    screen1OptionText: 'Grief or dealing with a loss'
  },
  ptsd: {
    key: 'ptsd',
    label: 'PTSD',
    pathwayName: 'PTSD',
    screen1OptionText: 'Difficult experiences from the past that still affect you'
  },
  eating_disorder: {
    key: 'eating_disorder',
    label: 'Eating Disorder',
    pathwayName: 'Other Concerns',
    screen1OptionText: 'Food, eating, or body image concerns'
  },
  other_concerns: {
    key: 'other_concerns',
    label: 'Other Concerns',
    pathwayName: 'Other Concerns',
    screen1OptionText: 'Something else'
  }
};

// Step 1 ordered options: exactly the 8 supported assessment concern areas
export const STEP1_CONCERN_KEYS: ConcernKey[] = [
  'depression',
  'adhd',
  'relationship_issues',
  'sleep',
  'anger',
  'grief',
  'ptsd',
  'eating_disorder'
];

// Exactly the 10 supported manual focus options for the "Change my focus" selection modal:
export const MANUAL_CHANGE_FOCUS_KEYS: ConcernKey[] = [
  'depression',
  'adhd',
  'relationship_issues',
  'sleep',
  'anxiety',
  'stress',
  'anger',
  'grief',
  'ptsd',
  'eating_disorder'
];

// Service ID constant: Therapy is service_id 1
export const THERAPY_SERVICE_ID = 1;

// Centralized therapy pathway mapping (Focus Label -> Pathway ID)
export const THERAPY_PATHWAY_MAP = {
  Depression: 4,
  ADHD: 8,
  'Relationship Issues': 9,
  Sleep: 95,
  Anxiety: 7,
  Stress: 5,
  Anger: 96,
  Grief: 97,
  PTSD: 99,
  'Eating Disorder': 100
} as const;

// Concern Key -> Pathway ID mapping
export const CONCERN_KEY_TO_PATHWAY_ID: Record<string, number> = {
  depression: 4,
  adhd: 8,
  relationship_issues: 9,
  sleep: 95,
  anxiety: 7,
  stress: 5,
  anger: 96,
  grief: 97,
  ptsd: 99,
  eating_disorder: 100
};

// All canonical supported concerns
export const ALL_SUPPORTED_CONCERN_KEYS: ConcernKey[] = [
  'depression',
  'adhd',
  'relationship_issues',
  'sleep',
  'anxiety',
  'stress',
  'anger',
  'grief',
  'ptsd',
  'eating_disorder',
  'other_concerns'
];

// Backward compatibility alias if needed
export const ORDERED_CONCERN_KEYS = STEP1_CONCERN_KEYS;

export interface Screen2Option {
  id: string;
  text: string;
  subtheme: string;
  primaryPoints: number;
}

export const SCREEN2_QUESTIONS: Record<ConcernKey, { question: string; options: Screen2Option[] }> = {
  depression: {
    question: 'What has been hardest lately?',
    options: [
      { id: 'dep_feeling_low', text: 'Feeling low most of the time', subtheme: 'feeling_low_persistent', primaryPoints: 8 },
      { id: 'dep_losing_interest', text: 'Losing interest in things', subtheme: 'anhedonia_loss_of_interest', primaryPoints: 8 },
      { id: 'dep_everyday_tasks', text: 'Getting through everyday tasks', subtheme: 'daily_tasks_difficulty', primaryPoints: 8 },
      { id: 'dep_feeling_hopeless', text: 'Feeling hopeless about things', subtheme: 'hopelessness', primaryPoints: 8 },
      { id: 'dep_disconnected', text: 'Feeling disconnected from people', subtheme: 'social_disconnection', primaryPoints: 8 },
      { id: 'dep_finding_motivation', text: 'Finding motivation', subtheme: 'low_motivation', primaryPoints: 8 }
    ]
  },
  adhd: {
    question: "What's been hardest to manage?",
    options: [
      { id: 'adhd_staying_focused', text: 'Staying focused', subtheme: 'staying_focused', primaryPoints: 8 },
      { id: 'adhd_getting_started', text: 'Getting started', subtheme: 'task_initiation', primaryPoints: 8 },
      { id: 'adhd_staying_organized', text: 'Staying organized', subtheme: 'organization', primaryPoints: 8 },
      { id: 'adhd_managing_distractions', text: 'Managing distractions', subtheme: 'managing_distractions', primaryPoints: 8 },
      { id: 'adhd_finishing_things', text: 'Finishing things', subtheme: 'finishing_tasks', primaryPoints: 8 },
      { id: 'adhd_managing_time', text: 'Managing my time', subtheme: 'time_management', primaryPoints: 8 }
    ]
  },
  relationship_issues: {
    question: "What's been hardest in your relationships?",
    options: [
      { id: 'rel_communicating_needs', text: 'Communicating what I need', subtheme: 'communicating_needs', primaryPoints: 8 },
      { id: 'rel_handling_arguments', text: 'Handling arguments', subtheme: 'handling_arguments', primaryPoints: 8 },
      { id: 'rel_feeling_understood', text: 'Feeling understood', subtheme: 'feeling_understood', primaryPoints: 8 },
      { id: 'rel_setting_boundaries', text: 'Setting boundaries', subtheme: 'setting_boundaries', primaryPoints: 8 },
      { id: 'rel_trust', text: 'Trust', subtheme: 'trust', primaryPoints: 8 },
      { id: 'rel_getting_close', text: 'Getting close to people', subtheme: 'emotional_closeness', primaryPoints: 8 }
    ]
  },
  sleep: {
    question: "What's been hardest about your sleep?",
    options: [
      { id: 'sleep_falling_asleep', text: 'Falling asleep', subtheme: 'falling_asleep', primaryPoints: 8 },
      { id: 'sleep_staying_asleep', text: 'Staying asleep', subtheme: 'staying_asleep', primaryPoints: 8 },
      { id: 'sleep_waking_early', text: 'Waking up too early', subtheme: 'early_awakening', primaryPoints: 8 },
      { id: 'sleep_getting_enough', text: 'Getting enough sleep', subtheme: 'sleep_duration', primaryPoints: 8 },
      { id: 'sleep_regular_routine', text: 'Having a regular sleep routine', subtheme: 'sleep_routine', primaryPoints: 8 },
      { id: 'sleep_feeling_rested', text: 'Feeling rested during the day', subtheme: 'daytime_restedness', primaryPoints: 8 }
    ]
  },
  anxiety: {
    question: 'What has been hardest to manage with anxiety?',
    options: [
      { id: 'anx_constant_worry', text: 'Constant worry or overthinking', subtheme: 'persistent_worry', primaryPoints: 8 },
      { id: 'anx_physical_tension', text: 'Physical tension or restlessness', subtheme: 'physical_anxiety', primaryPoints: 8 },
      { id: 'anx_panic_feelings', text: 'Sudden feelings of panic', subtheme: 'panic_symptoms', primaryPoints: 8 },
      { id: 'anx_social_situations', text: 'Anxiety in social situations', subtheme: 'social_anxiety', primaryPoints: 8 },
      { id: 'anx_avoiding_things', text: 'Avoiding things because of fear', subtheme: 'anxiety_avoidance', primaryPoints: 8 },
      { id: 'anx_uncertainty', text: 'Difficulty dealing with uncertainty', subtheme: 'intolerance_of_uncertainty', primaryPoints: 8 }
    ]
  },
  stress: {
    question: "What's been causing the most stress?",
    options: [
      { id: 'str_overwhelmed', text: 'Feeling overwhelmed by too much to do', subtheme: 'overwhelm_workload', primaryPoints: 8 },
      { id: 'str_burnout', text: 'Exhaustion or burnout', subtheme: 'burnout_exhaustion', primaryPoints: 8 },
      { id: 'str_work_pressure', text: 'Work or academic pressure', subtheme: 'work_academic_stress', primaryPoints: 8 },
      { id: 'str_unwinding', text: 'Inability to switch off and relax', subtheme: 'relaxation_difficulty', primaryPoints: 8 },
      { id: 'str_irritability', text: 'Feeling snappy or irritable under pressure', subtheme: 'stress_irritability', primaryPoints: 8 },
      { id: 'str_physical_toll', text: 'Headaches, tight muscles, or fatigue', subtheme: 'somatic_stress', primaryPoints: 8 }
    ]
  },
  anger: {
    question: 'What tends to happen when anger takes over?',
    options: [
      { id: 'ang_irritated_quickly', text: 'I get irritated quickly', subtheme: 'quick_irritation', primaryPoints: 8 },
      { id: 'ang_react_strongly', text: 'I react more strongly than I want', subtheme: 'strong_reactions', primaryPoints: 8 },
      { id: 'ang_argue_snap', text: 'I argue or snap at people', subtheme: 'snapping_at_others', primaryPoints: 8 },
      { id: 'ang_struggle_calm', text: 'I struggle to calm down', subtheme: 'calming_down', primaryPoints: 8 },
      { id: 'ang_keep_inside', text: 'I keep anger inside', subtheme: 'internalized_anger', primaryPoints: 8 },
      { id: 'ang_regret_actions', text: 'I regret things I say or do', subtheme: 'anger_regret', primaryPoints: 8 }
    ]
  },
  grief: {
    question: 'What has been hardest since the loss?',
    options: [
      { id: 'grief_missing', text: 'Missing the person', subtheme: 'missing_person', primaryPoints: 8 },
      { id: 'grief_empty', text: 'Feeling empty or alone', subtheme: 'feeling_empty_alone', primaryPoints: 8 },
      { id: 'grief_life', text: 'Getting through everyday life', subtheme: 'daily_life_functioning', primaryPoints: 8 },
      { id: 'grief_accepting', text: 'Accepting what happened', subtheme: 'accepting_loss', primaryPoints: 8 },
      { id: 'grief_memories', text: 'Handling difficult memories', subtheme: 'grief_memories', primaryPoints: 8 },
      { id: 'grief_routine', text: 'Finding a new routine', subtheme: 'new_routine', primaryPoints: 8 }
    ]
  },
  ptsd: {
    question: 'What has been hardest to deal with?',
    options: [
      { id: 'ptsd_difficult_memories', text: 'Difficult memories', subtheme: 'difficult_memories', primaryPoints: 8 },
      { id: 'ptsd_past_reminders', text: 'Things that remind me of the past', subtheme: 'triggers_and_reminders', primaryPoints: 8 },
      { id: 'ptsd_on_edge', text: 'Feeling on edge or unsafe', subtheme: 'feeling_on_edge', primaryPoints: 8 },
      { id: 'ptsd_avoiding_situations', text: 'Avoiding certain situations', subtheme: 'avoidance_behavior', primaryPoints: 8 },
      { id: 'ptsd_trouble_sleeping', text: 'Trouble sleeping', subtheme: 'trauma_sleep_impact', primaryPoints: 8 },
      { id: 'ptsd_feeling_disconnected', text: 'Feeling disconnected', subtheme: 'emotional_disconnection', primaryPoints: 8 }
    ]
  },
  eating_disorder: {
    question: 'What has been hardest lately?',
    options: [
      { id: 'ed_thoughts_food', text: 'Thoughts about food', subtheme: 'food_preoccupation', primaryPoints: 8 },
      { id: 'ed_out_of_control', text: 'Feeling out of control around food', subtheme: 'loss_of_control_food', primaryPoints: 8 },
      { id: 'ed_restricting_food', text: 'Restricting or avoiding food', subtheme: 'food_restriction', primaryPoints: 8 },
      { id: 'ed_worrying_body', text: 'Worrying about my body', subtheme: 'body_image_distress', primaryPoints: 8 },
      { id: 'ed_feeling_guilty', text: 'Feeling guilty after eating', subtheme: 'post_eating_guilt', primaryPoints: 8 },
      { id: 'ed_appearance_thoughts', text: 'Thoughts about my appearance', subtheme: 'appearance_preoccupation', primaryPoints: 8 }
    ]
  },
  other_concerns: {
    question: 'What would you most like support with?',
    options: [
      { id: 'other_daily_stress', text: 'Managing daily stress and overwhelm', subtheme: 'stress_management', primaryPoints: 8 },
      { id: 'other_healthy_habits', text: 'Building healthy daily routines and habits', subtheme: 'habits_and_routine', primaryPoints: 8 },
      { id: 'other_mental_clarity', text: 'Gaining mental clarity and direction', subtheme: 'clarity_and_direction', primaryPoints: 8 },
      { id: 'other_work_life_balance', text: 'Work-life balance and burnout recovery', subtheme: 'burnout_recovery', primaryPoints: 8 },
      { id: 'other_custom_situation', text: 'Something else', subtheme: 'custom_personal_focus', primaryPoints: 6 }
    ]
  }
};

export interface DesiredOutcomeOption {
  id: string;
  text: string;
  subtheme: string;
}

export const DESIRED_OUTCOMES: DesiredOutcomeOption[] = [
  { id: 'feel_more_in_control', text: 'Feel more in control', subtheme: 'feel_more_in_control' },
  { id: 'feel_calmer', text: 'Feel calmer', subtheme: 'feel_calmer' },
  { id: 'have_more_energy', text: 'Have more energy', subtheme: 'have_more_energy' },
  { id: 'sleep_better', text: 'Sleep better', subtheme: 'sleep_better' },
  { id: 'handle_situations_better', text: 'Handle difficult situations better', subtheme: 'handle_situations_better' },
  { id: 'improve_relationships', text: 'Improve my relationships', subtheme: 'improve_relationships' },
  { id: 'focus_and_get_things_done', text: 'Focus and get things done more easily', subtheme: 'focus_and_get_things_done' },
  { id: 'feel_better_about_myself', text: 'Feel better about myself', subtheme: 'feel_better_about_myself' },
  { id: 'understand_myself_better', text: 'Understand myself better', subtheme: 'understand_myself_better' },
  { id: 'something_else', text: 'Something else', subtheme: 'custom_outcome' }
];

export interface AssessmentSubmissionAnswers {
  selectedConcern: ConcernKey;
  screen2OptionId: string;
  screen2OptionText?: string;
  customText?: string;
  desiredOutcomeId: string;
  desiredOutcomeText?: string;
}

export interface AssessmentEvaluationResult {
  concernKey: ConcernKey;
  concernLabel: string; // Exactly: Depression, ADHD, Relationship Issues, Other Concerns, Sleep, Anger, Grief, PTSD, Eating Disorder
  pathwayName: string;
  confidence: 'high' | 'moderate' | 'low';
  assessmentCompleted: true;
  subthemes: string[];
  desiredOutcome: string;
  completedAt: string;
}

/**
 * Deterministically evaluates assessment answers:
 * - Step 1 firmly establishes the primary concern (never mutated by Step 3 answers).
 * - Step 2 collects the symptom subtheme.
 * - Step 3 collects the desired outcome subtheme.
 * - Always maps to EXACTLY ONE of the 9 supported canonical categories.
 */
export function evaluateFocusAssessment(answers: AssessmentSubmissionAnswers): AssessmentEvaluationResult {
  const primaryKey: ConcernKey = answers.selectedConcern && CONCERNS[answers.selectedConcern]
    ? answers.selectedConcern
    : 'other_concerns';

  const collectedSubthemes: string[] = [];

  // Step 2 subtheme extraction
  const screen2Config = SCREEN2_QUESTIONS[primaryKey];
  if (screen2Config) {
    const chosenOption = screen2Config.options.find((o) => o.id === answers.screen2OptionId);
    if (chosenOption && chosenOption.subtheme) {
      collectedSubthemes.push(chosenOption.subtheme);
    }
  }

  // Step 3 outcome extraction
  const outcome = DESIRED_OUTCOMES.find((o) => o.id === answers.desiredOutcomeId);
  if (outcome && outcome.subtheme) {
    collectedSubthemes.push(outcome.subtheme);
  }

  const meta = CONCERNS[primaryKey];
  const desiredOutcomeText = outcome ? outcome.text : answers.desiredOutcomeText || 'Improve overall wellbeing';

  return {
    concernKey: meta.key,
    concernLabel: meta.label,
    pathwayName: meta.pathwayName,
    confidence: primaryKey === 'other_concerns' ? 'moderate' : 'high',
    assessmentCompleted: true,
    subthemes: collectedSubthemes,
    desiredOutcome: desiredOutcomeText,
    completedAt: new Date().toISOString()
  };
}
