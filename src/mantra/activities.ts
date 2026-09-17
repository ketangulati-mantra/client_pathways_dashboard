import { getCurrentService, normalizeService } from './services';

export interface Activity {
  lessonId: string;
  activityId: string;
  title: string;
  rewardPoints: number;
  estimatedDuration: string;
  route: string;
  services: string[];
  service?: string;
  problem?: string;
  problems?: string[];
  day?: number;
  description?: string;
  completionEndpoint?: string;
  redirectAfterCompletion?: boolean;
}

export const activities: Activity[] = [
  // ==========================================
  // FOUNDATIONAL ACTIVITIES (IN SPECIFIC ORDER)
  // ==========================================
  {
    lessonId: 'emotional-wellbeing-assessment',
    activityId: 'emotional-wellbeing-assessment',
    title: 'Emotional Well-Being Assessment',
    rewardPoints: 100,
    estimatedDuration: '3 min',
    route: '/task/emotional-wellbeing-assessment',
    services: ['therapy'],
    problem: 'foundational',
    problems: ['foundational'],
    description: 'Check in on your current emotional state across anxiety, depression, and stress in 9 simple questions.'
  },
  {
    lessonId: 'ocd-assessment',
    activityId: 'ocd-assessment',
    title: 'OCD Check-In',
    rewardPoints: 100,
    estimatedDuration: '2-3 min',
    route: '/task/ocd-assessment',
    services: ['ocd'],
    problem: 'foundational',
    problems: ['foundational', 'ocd'],
    description: 'A 2-3 minute check-in to understand how unwanted thoughts, repetitive behaviors, and the need for certainty affect your day.'
  },
  {
    lessonId: 'ocd_what_is_ocd',
    activityId: '400',
    title: 'What is OCD?',
    rewardPoints: 25,
    estimatedDuration: '5-8 min',
    route: '/task/what-is-ocd',
    services: ['ocd'],
    problem: 'foundational',
    problems: ['foundational', 'ocd'],
    day: 1,
    description: 'Understand the pattern behind OCD: learn what obsessions and compulsions are, how they connect, and why the cycle can keep repeating.'
  },
  {
    lessonId: 'ocd_cycle',
    activityId: '401',
    title: 'Inside an OCD Loop',
    rewardPoints: 25,
    estimatedDuration: '3-4 min',
    route: '/task/inside-an-ocd-loop',
    services: ['ocd'],
    problem: 'foundational',
    problems: ['foundational', 'ocd'],
    day: 1,
    description: 'See how a thought can turn into a cycle: explore the 4-part OCD loop interactively with real-life examples.'
  },
  {
    lessonId: 'ocd_habit',
    activityId: '402',
    title: 'Is It OCD or Just a Habit?',
    rewardPoints: 25,
    estimatedDuration: '3 min',
    route: '/task/is-it-ocd-or-just-a-habit',
    services: ['ocd'],
    problem: 'foundational',
    problems: ['foundational', 'ocd'],
    day: 1,
    description: 'Same action, different experience: discover how the pattern around a behavior distinguishes a routine from a doubt-driven cycle.'
  },
  {
    lessonId: 'ocd_fear_ladder',
    activityId: '404',
    title: 'Fear Ladder: The Ascent',
    rewardPoints: 50,
    estimatedDuration: '4-5 min',
    route: '/task/fear-ladder',
    services: ['ocd'],
    problem: 'foundational',
    problems: ['foundational', 'ocd'],
    day: 2,
    description: 'Construct your visual 3D Fear Ladder: organize uncomfortable situations from easier to more challenging to map out your hierarchy.'
  },
  {
    lessonId: 'ocd_alarm_danger',
    activityId: '403',
    title: 'The Alarm Is Not The Danger',
    rewardPoints: 50,
    estimatedDuration: '3-4 min',
    route: '/task/alarm-is-not-the-danger',
    services: ['ocd'],
    problem: 'foundational',
    problems: ['foundational', 'ocd'],
    day: 2,
    description: 'Discover the distinction between an alarm signal and actual danger through an interactive 3D signal experience.'
  },
  {
    lessonId: 'ocd_delay_tactic',
    activityId: '405',
    title: 'The 60-Second Pause',
    rewardPoints: 50,
    estimatedDuration: '2-3 min',
    route: '/task/the-60-second-pause',
    services: ['ocd'],
    problem: 'foundational',
    problems: ['foundational', 'ocd'],
    day: 3,
    description: 'Create a 60-second buffer between an urge and a response with an interactive circular time practice.'
  },
  {
    lessonId: 'ocd_478_breathing',
    activityId: '406',
    title: '4–7–8 Breathing',
    rewardPoints: 50,
    estimatedDuration: '2-3 min',
    route: '/task/4-7-8-breathing',
    services: ['ocd'],
    problem: 'foundational',
    problems: ['foundational', 'ocd'],
    day: 3,
    description: 'An ancient yogic breathing practice to slow down and settle your attention with a living organic particle guide.'
  },
  {
    lessonId: 'ocd_how_erp_works',
    activityId: '407',
    title: 'How ERP Works',
    rewardPoints: 50,
    estimatedDuration: '3-4 min',
    route: '/task/how-erp-works',
    services: ['ocd'],
    problem: 'foundational',
    problems: ['foundational', 'ocd'],
    day: 3,
    description: 'Understand how Exposure and Response Prevention (ERP) changes what you do in response to an OCD trigger.'
  },
  {
    lessonId: 'ocd_mood_check_in',
    activityId: '408',
    title: 'OCD Mood Check-In',
    rewardPoints: 25,
    estimatedDuration: '1 min',
    route: '/task/ocd-mood-check-in',
    services: ['ocd'],
    problem: 'foundational',
    problems: ['foundational', 'ocd'],
    day: 3,
    description: 'Record your current mood, OCD impact today, what experiences stood out, and view your private moments and trends.'
  },
  {
    lessonId: 'getting-started',
    activityId: 'getting-started',
    title: 'How TherapyMantra Works?',
    rewardPoints: 25,
    estimatedDuration: '4 min',
    route: '/task/getting-started',
    services: ['therapy'],
    problem: 'foundational',
    problems: ['foundational'],
    description: 'Learn how TherapyMantra works, how to access your support, and what to expect along the way.'
  },
  {
    lessonId: 'how-can-therapy-help',
    activityId: 'how-can-therapy-help',
    title: 'How Can Therapy Help?',
    rewardPoints: 25,
    estimatedDuration: '2-3 min',
    route: '/task/how-can-therapy-help',
    services: ['therapy'],
    problem: 'foundational',
    problems: ['foundational'],
    description: 'Learn what therapy actually helps with, what happens in a session, and how to get started.'
  },
  {
    lessonId: 'mantra21_myths_we_tell_ourselves',
    activityId: 'mantra21_myths_we_tell_ourselves',
    title: 'Myths We Tell Ourselves',
    rewardPoints: 25,
    estimatedDuration: '3 min',
    route: '/task/myths-we-tell-ourselves',
    services: ['therapy'],
    problem: 'foundational',
    problems: ['foundational', 'depression'],
    day: 1,
    description: 'Day 1: 5 common beliefs about mental health. Let’s question them.'
  },
  {
    lessonId: 'emotion-wheel',
    activityId: 'emotion-wheel',
    title: 'Emotion Wheel',
    rewardPoints: 25,
    estimatedDuration: '2 min',
    route: '/task/emotion-wheel',
    services: ['therapy'],
    problem: 'foundational',
    problems: ['foundational'],
    description: 'Identify and understand what you are feeling right now through an interactive emotion wheel.'
  },
  {
    lessonId: 'daily-check-in',
    activityId: 'daily-check-in',
    title: 'Daily Check-In',
    rewardPoints: 25,
    estimatedDuration: '1 min',
    route: '/task/daily-check-in',
    services: ['therapy'],
    problem: 'foundational',
    problems: ['foundational'],
    description: 'A 30-60 second pause to explore your emotional state and discover personalized next steps.'
  },
  {
    lessonId: 'journal',
    activityId: 'journal',
    title: 'Journal',
    rewardPoints: 20,
    estimatedDuration: '3 min',
    route: '/task/journal',
    services: ['therapy'],
    problem: 'foundational',
    problems: ['foundational'],
    description: 'Deepen self-awareness with connected daily reflections and free-form journaling.'
  },
  {
    lessonId: 'depression_one_tiny_step',
    activityId: 'depression_one_tiny_step',
    title: 'One Tiny Step',
    rewardPoints: 25,
    estimatedDuration: '3 min',
    route: '/task/depression-one-tiny-step',
    services: ['therapy'],
    problem: 'foundational',
    problems: ['foundational', 'depression'],
    day: 1,
    description: 'Day 1: Move from reflection into action. Choose one tiny, micro-stepped action to make today 1% easier.'
  },
  {
    lessonId: 'mantra21_my_support_circle',
    activityId: 'mantra21_my_support_circle',
    title: 'My Support Circle',
    rewardPoints: 25,
    estimatedDuration: '3 min',
    route: '/task/my-support-circle',
    services: ['therapy'],
    problem: 'foundational',
    problems: ['foundational', 'depression'],
    day: 1,
    description: 'Day 1: Who can you lean on when things feel difficult?'
  },
  {
    lessonId: 'first-therapy-session',
    activityId: 'first-therapy-session',
    title: 'How to Book a Session?',
    rewardPoints: 25,
    estimatedDuration: '3 min',
    route: '/task/first-therapy-session',
    services: ['therapy', 'ocd'],
    problem: 'foundational',
    problems: ['foundational', 'ocd'],
    description: 'Learn how to choose a therapist, book a convenient time, and join your session.'
  },

  // ==========================================
  // ADDITIONAL THERAPY & CONDITION ACTIVITIES
  // ==========================================
  {
    lessonId: 'personalized-focus-assessment',
    activityId: 'personalized-focus-assessment',
    title: 'Personalized Focus Assessment',
    rewardPoints: 100,
    estimatedDuration: '3 min',
    route: '/task/personalized-focus-assessment',
    services: ['therapy'],
    description: 'Discover your personalized 21-day wellbeing focus and get matched with your tailored daily plan.'
  },
  {
    lessonId: 'earn-while-you-improve-your-wellbeing',
    activityId: 'earn-while-you-improve-your-wellbeing',
    title: 'Earn While You Improve Your Wellbeing',
    rewardPoints: 50,
    estimatedDuration: '2 min',
    route: '/task/earn-while-you-improve-your-wellbeing',
    services: ['therapy'],
    description: 'Learn how your guided pathway supports your daily wellbeing habits and recognizes consistency.'
  },
  {
    lessonId: 'depression_what_is_depression',
    activityId: 'depression_what_is_depression',
    title: 'What Is Depression?',
    rewardPoints: 25,
    estimatedDuration: '3-5 min',
    route: '/task/depression-what-is-depression',
    services: ['therapy'],
    problem: 'depression',
    problems: ['depression'],
    day: 1,
    description: 'Day 1: Understand what depression actually is, why it affects how you think, feel and function, and identify what matters most right now.'
  },
  {
    lessonId: 'depression_how_is_it_showing_up',
    activityId: 'depression_how_is_it_showing_up',
    title: 'How Is It Showing Up For Me?',
    rewardPoints: 25,
    estimatedDuration: '2-3 min',
    route: '/task/depression-how-is-it-showing-up',
    services: ['therapy'],
    problem: 'depression',
    problems: ['depression'],
    day: 1,
    description: 'Day 1: Recognize how depression is showing up across mind, feelings, body, and actions — without judgment or clinical labels.'
  },
  {
    lessonId: 'depression_where_am_i_right_now',
    activityId: 'depression_where_am_i_right_now',
    title: 'Where Am I Right Now?',
    rewardPoints: 25,
    estimatedDuration: '2 min',
    route: '/task/depression-where-am-i-right-now',
    services: ['therapy'],
    problem: 'depression',
    problems: ['depression'],
    day: 1,
    description: 'Day 1: Take a quick, compassionate snapshot of what everyday areas feel harder right now.'
  },
  {
    lessonId: 'depression_mantra21_invitation',
    activityId: 'depression_mantra21_invitation',
    title: 'Mantra 21: Keep Going',
    rewardPoints: 25,
    estimatedDuration: '2 min',
    route: '/task/depression-mantra21-invitation',
    services: ['therapy'],
    problem: 'depression',
    problems: ['depression'],
    day: 1,
    description: 'Day 1: Discover the 21-day journey, choose what would make it worth it for you, and join at your own pace.'
  },
  {
    lessonId: 'challenge_hub',
    activityId: 'challenge_hub',
    title: 'Mantra Challenge Hub',
    rewardPoints: 50,
    estimatedDuration: '5 min',
    route: '/challenges',
    services: ['therapy', 'all'],
    problem: 'depression',
    problems: ['depression', 'anxiety', 'sleep', 'stress', 'all'],
    day: 1,
    description: 'Universal 21-Day Challenge Sanctuary: discover challenges, track streak momentum, and explore personalized daily practices.'
  }
];

export function getAvailableActivities(serviceInput?: string): Activity[] {
  const service = normalizeService(serviceInput || getCurrentService() || 'all');
  if (service === 'all') return activities;

  return activities.filter((act) => {
    if (!act.services || act.services.includes('*')) return true;
    return act.services.some((s) => normalizeService(s) === service);
  });
}

export function findActivity(identifier: string): Activity | undefined {
  if (!identifier) return undefined;
  const clean = identifier.toLowerCase().trim();

  return activities.find((act) => {
    const lessonId = (act.lessonId || '').toLowerCase();
    const activityId = (act.activityId || '').toLowerCase();
    const route = (act.route || '').toLowerCase();

    return (
      lessonId === clean ||
      activityId === clean ||
      route === clean ||
      route === '/task/' + clean ||
      route.replace(/^\/task\//, '') === clean
    );
  });
}
