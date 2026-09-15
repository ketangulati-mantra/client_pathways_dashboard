import { generateCheckInExperience } from './personalizationEngine';
import { getCheckInRoute, CHECKIN_ROUTES } from './checkInRouter';

/**
 * Backwards-compatible wrapper routing to the robust personalizationEngine and checkInRouter.
 */
export function generatePersonalizedNextStep(params) {
  const exp = generateCheckInExperience(params);
  const routeDecision = getCheckInRoute(params);

  return {
    ...exp.nextStep,
    routeDecision,
    summary: exp.summary
  };
}

export { generateCheckInExperience, getCheckInRoute, CHECKIN_ROUTES };
