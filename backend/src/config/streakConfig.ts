/**
 * Streak & Milestone Configuration for Mantra
 */

export const STREAK_MILESTONES = [3, 7, 15, 30, 60, 100, 180, 365] as const;

export interface MilestoneProgress {
  nextMilestone: number | null;
  daysUntilNextMilestone: number | null;
  progressToNextMilestone: {
    current: number;
    target: number;
  };
}

export function calculateMilestoneProgress(currentStreak: number): MilestoneProgress {
  const next = STREAK_MILESTONES.find((m) => m > currentStreak);
  
  if (next === undefined) {
    const maxMilestone = STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
    return {
      nextMilestone: null,
      daysUntilNextMilestone: null,
      progressToNextMilestone: {
        current: currentStreak,
        target: maxMilestone
      }
    };
  }

  return {
    nextMilestone: next,
    daysUntilNextMilestone: Math.max(0, next - currentStreak),
    progressToNextMilestone: {
      current: currentStreak,
      target: next
    }
  };
}
