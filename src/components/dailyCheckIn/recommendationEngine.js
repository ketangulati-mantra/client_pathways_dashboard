import { generateCheckInExperience } from './personalizationEngine';

/**
 * Backwards-compatible wrapper routing to the new robust personalizationEngine.
 */
export function generatePersonalizedNextStep(params) {
  const exp = generateCheckInExperience(params);
  return {
    ...exp.nextStep,
    summary: exp.summary
  };
}

export { generateCheckInExperience };
