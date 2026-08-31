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
    services: ['*'],
    description: 'Learn how TherapyMantra works, how to access your support, and what to expect along the way.'
  },
  {
    lessonId: 'first-therapy-session',
    activityId: 'first-therapy-session',
    title: 'How to Book a Session',
    rewardPoints: 25,
    estimatedDuration: '3 min',
    route: '/task/first-therapy-session',
    services: ['*'],
    description: 'Learn how to choose a therapist, book a convenient time, and join your session.'
  },
  {
    lessonId: 'emotional-wellbeing-assessment',
    activityId: 'emotional-wellbeing-assessment',
    title: 'Emotional Well-Being Assessment',
    rewardPoints: 100,
    estimatedDuration: '3 min',
    route: '/task/emotional-wellbeing-assessment',
    services: ['*'],
    description: 'Check in on your current emotional state across anxiety, depression, and stress in 9 simple questions.'
  },
  {
    lessonId: 'how-can-therapy-help',
    activityId: 'how-can-therapy-help',
    title: 'How Can Therapy Help?',
    rewardPoints: 25,
    estimatedDuration: '2-3 min',
    route: '/task/how-can-therapy-help',
    services: ['*'],
    description: 'Learn what therapy actually helps with, what happens in a session, and how to get started.'
  },
  {
    lessonId: 'earn-while-you-improve-your-wellbeing',
    activityId: 'earn-while-you-improve-your-wellbeing',
    title: 'Earn While You Improve Your Wellbeing',
    rewardPoints: 50,
    estimatedDuration: '2 min',
    route: '/task/earn-while-you-improve-your-wellbeing',
    services: ['*'],
    description: 'Learn how your guided pathway supports your daily wellbeing habits and recognizes consistency.'
  },
  {
    lessonId: 'daily-check-in',
    activityId: 'daily-check-in',
    title: 'Daily Check-In',
    rewardPoints: 25,
    estimatedDuration: '1 min',
    route: '/task/daily-check-in',
    services: ['*'],
    description: 'A 30-60 second pause to explore your emotional state and discover personalized next steps.'
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
