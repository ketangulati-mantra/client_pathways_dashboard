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
