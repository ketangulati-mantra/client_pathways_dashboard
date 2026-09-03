export type PacingState =
  | 'quiet'
  | 'building'
  | 'turning_point'
  | 'intense'
  | 'release'
  | 'reflection'
  | 'transition';

export type EndingStyle =
  | 'discovery'
  | 'question'
  | 'unexpected_consequence'
  | 'symbolic_mystery'
  | 'choice'
  | 'arrival'
  | 'emotional_realization';

const ALL_PACING: PacingState[] = [
  'quiet',
  'building',
  'turning_point',
  'release',
  'reflection',
  'building',
  'transition'
];

const ALL_ENDINGS: EndingStyle[] = [
  'discovery',
  'question',
  'unexpected_consequence',
  'symbolic_mystery',
  'choice',
  'arrival',
  'emotional_realization'
];

export const storyPacingAndSuspense = {
  /**
   * Selects an organic target pacing state that avoids repetitive cadences.
   */
  determineTargetPacing(
    chapterNumber: number,
    recentPacing: PacingState[] = [],
    emotionalStatus?: string
  ): PacingState {
    const lastPacing = recentPacing[recentPacing.length - 1];

    if (chapterNumber === 1) return 'quiet';
    if (chapterNumber === 2) return 'building';
    if (chapterNumber === 3) return 'turning_point';

    if (emotionalStatus === 'difficult' && lastPacing !== 'release' && lastPacing !== 'reflection') {
      return 'release';
    }

    if (lastPacing === 'turning_point') return 'release';
    if (lastPacing === 'release') return 'reflection';
    if (lastPacing === 'reflection') return 'quiet';
    if (lastPacing === 'quiet') return 'building';
    if (lastPacing === 'building') return 'turning_point';

    // Fallback: pick one not in recent history
    const candidates = ALL_PACING.filter((p) => !recentPacing.slice(-2).includes(p));
    return candidates.length > 0 ? candidates[0] : 'building';
  },

  /**
   * Selects an ending style that ensures high narrative variety and suspense.
   */
  determineTargetEndingStyle(recentEndingStyles: EndingStyle[] = []): EndingStyle {
    const lastTwo = recentEndingStyles.slice(-2);
    const available = ALL_ENDINGS.filter((e) => !lastTwo.includes(e));

    if (available.length === 0) return 'discovery';

    // Deterministically pick the first unused style
    return available[0];
  },

  /**
   * Appends to recent lists keeping bounded memory (max 5 items).
   */
  updateRecentPacing(recent: PacingState[] = [], next: PacingState): PacingState[] {
    return [...recent, next].slice(-5);
  },

  updateRecentEndingStyles(recent: EndingStyle[] = [], next: EndingStyle): EndingStyle[] {
    return [...recent, next].slice(-5);
  }
};
