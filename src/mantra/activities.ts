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
  {
    lessonId: 'getting-started',
    activityId: 'getting-started',
    title: 'TherapyMantra Getting Started',
    rewardPoints: 25,
    estimatedDuration: '4 min',
    route: '/task/getting-started',
    services: ['therapy'],
    description: 'Learn how TherapyMantra works, how to access your support, and what to expect along the way.'
  },
  {
    lessonId: 'first-therapy-session',
    activityId: 'first-therapy-session',
    title: 'How to Book a Session',
    rewardPoints: 25,
    estimatedDuration: '3 min',
    route: '/task/first-therapy-session',
    services: ['therapy'],
    description: 'Learn how to choose a therapist, book a convenient time, and join your session.'
  },
  {
    lessonId: 'emotional-wellbeing-assessment',
    activityId: 'emotional-wellbeing-assessment',
    title: 'Emotional Well-Being Assessment',
    rewardPoints: 100,
    estimatedDuration: '3 min',
    route: '/task/emotional-wellbeing-assessment',
    services: ['therapy'],
    description: 'Check in on your current emotional state across anxiety, depression, and stress in 9 simple questions.'
  },
  {
    lessonId: 'how-can-therapy-help',
    activityId: 'how-can-therapy-help',
    title: 'How Can Therapy Help?',
    rewardPoints: 25,
    estimatedDuration: '2-3 min',
    route: '/task/how-can-therapy-help',
    services: ['therapy'],
    description: 'Learn what therapy actually helps with, what happens in a session, and how to get started.'
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
    lessonId: 'daily-check-in',
    activityId: 'daily-check-in',
    title: 'Daily Check-In',
    rewardPoints: 25,
    estimatedDuration: '1 min',
    route: '/task/daily-check-in',
    services: ['therapy'],
    description: 'A 30-60 second pause to explore your emotional state and discover personalized next steps.'
  },
  {
    lessonId: 'journal',
    activityId: 'journal',
    title: 'Journal & Reflections',
    rewardPoints: 20,
    estimatedDuration: '3 min',
    route: '/task/journal',
    services: ['therapy'],
    description: 'Deepen self-awareness with connected daily reflections and free-form journaling.'
  },
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
    lessonId: 'emotion-wheel',
    activityId: 'emotion-wheel',
    title: 'Emotion Wheel',
    rewardPoints: 25,
    estimatedDuration: '2 min',
    route: '/task/emotion-wheel',
    services: ['therapy'],
    description: 'Identify and understand what you are feeling right now through an interactive emotion wheel.'
  },
  {
    lessonId: 'mantra21_myths_we_tell_ourselves',
    activityId: 'mantra21_myths_we_tell_ourselves',
    title: 'Myths We Tell Ourselves',
    rewardPoints: 25,
    estimatedDuration: '3 min',
    route: '/task/myths-we-tell-ourselves',
    services: ['therapy'],
    problem: 'depression',
    problems: ['depression'],
    day: 1,
    description: 'Day 1: 5 common beliefs about mental health. Let’s question them.'
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
    lessonId: 'depression_one_tiny_step',
    activityId: 'depression_one_tiny_step',
    title: 'One Tiny Step',
    rewardPoints: 25,
    estimatedDuration: '3 min',
    route: '/task/depression-one-tiny-step',
    services: ['therapy'],
    problem: 'depression',
    problems: ['depression'],
    day: 1,
    description: 'Day 1: Move from reflection into action. Choose one tiny, micro-stepped action to make today 1% easier.'
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
