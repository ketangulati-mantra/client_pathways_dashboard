import { getCurrentService, normalizeService } from './services';

/**
 * Registered User Pathway Activities Config
 * Single source of truth for all user pathway activities, reward points, routes, and service availability.
 */
export interface Activity {
  lessonId: string;
  activityId: string;
  title: string;
  rewardPoints: number;
  estimatedDuration: string;
  route: string;
  services: string[]; // e.g. ["therapy"], ["wellness"], or ["*"] for all services
  service?: string;   // Optional string field for display/compatibility
  description?: string;
  completionEndpoint?: string;
  redirectAfterCompletion?: boolean;
}

// Empty activities array for fresh User Pathways creation
export const activities: Activity[] = [];

/**
 * Returns activities available for a specific service.
 */
export function getAvailableActivities(serviceInput?: string): Activity[] {
  const service = normalizeService(serviceInput || getCurrentService() || 'all');
  if (service === 'all') return activities;

  return activities.filter((act) => {
    if (!act.services || act.services.includes('*')) return true;
    return act.services.some((s) => normalizeService(s) === service);
  });
}

/**
 * Finds an activity by lessonId or route.
 */
export function findActivity(identifier: string): Activity | undefined {
  if (!identifier) return undefined;
  const clean = identifier.toLowerCase().trim();

  return activities.find((act) => {
    return (
      act.lessonId.toLowerCase() === clean ||
      act.activityId.toLowerCase() === clean ||
      act.route.toLowerCase() === clean ||
      act.route.toLowerCase() === `/task/${clean}`
    );
  });
}
