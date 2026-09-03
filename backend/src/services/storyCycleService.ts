export type CycleStage =
  | 'beginning'
  | 'exploration'
  | 'development'
  | 'complication'
  | 'turning_point'
  | 'resolution'
  | 'transition';

export interface CycleProgress {
  stage: CycleStage;
  chapter_in_cycle: number;
  total_cycle_chapters?: number;
}

export interface NextCyclePreview {
  status: 'dormant' | 'teasing' | 'ready';
  previewText: string;
  nextCycleId: string;
  nextCycleName: string;
  unlocksAfter: string;
}

const CYCLE_THEMES = [
  {
    id: 'coastal_haven',
    name: 'The Quiet Harbour',
    world_theme: 'tides_and_harbor_lights',
    teaser: 'Beyond the harbour wall, distant lights have begun to gather along the outer cliffs.'
  },
  {
    id: 'highland_observatory',
    name: 'The Mountain of Echoes',
    world_theme: 'alpine_solitude_and_starlight',
    teaser: 'The wind from the high peaks carries the sound of ancient bells across the valley.'
  },
  {
    id: 'botanical_archives',
    name: 'The Sunken Greenhouse',
    world_theme: 'living_parchment_and_moss',
    teaser: 'Deep within the rain-washed corridors, a hidden door woven with ivy has quietly unlocked.'
  },
  {
    id: 'house_of_lights',
    name: 'The House of Small Lights',
    world_theme: 'lanterns_and_unspoken_letters',
    teaser: 'A path of glowing sea glass appears along the twilight shoreline.'
  },
  {
    id: 'city_in_fog',
    name: 'The City Beyond the Fog',
    world_theme: 'clocktowers_and_floating_bridges',
    teaser: 'Through the shifting morning mist, the silhouette of towering spires begins to form.'
  }
];

export const storyCycleService = {
  /**
   * Computes the current cycle progress stage for a chapter number.
   */
  calculateCycleProgress(chapterNumber: number): CycleProgress {
    const chapterInCycle = ((chapterNumber - 1) % 6) + 1;

    const stages: CycleStage[] = [
      'beginning',
      'exploration',
      'development',
      'complication',
      'turning_point',
      'resolution'
    ];

    const stage = stages[chapterInCycle - 1] || 'development';

    return {
      stage,
      chapter_in_cycle: chapterInCycle,
      total_cycle_chapters: 6
    };
  },

  /**
   * Returns a mysterious next cycle preview when approaching the conclusion of a cycle (Chapters 4+).
   */
  deriveNextCyclePreview(
    currentCycleId: string | null,
    chapterInCycle: number
  ): NextCyclePreview | null {
    if (chapterInCycle < 4) return null;

    const currentIndex = CYCLE_THEMES.findIndex((c) => c.id === currentCycleId);
    const nextIndex = (currentIndex + 1) % CYCLE_THEMES.length;
    const nextTheme = CYCLE_THEMES[nextIndex];

    return {
      status: chapterInCycle >= 5 ? 'teasing' : 'dormant',
      previewText: nextTheme.teaser,
      nextCycleId: nextTheme.id,
      nextCycleName: nextTheme.name,
      unlocksAfter: 'cycle_completion'
    };
  },

  /**
   * Returns cycle theme metadata.
   */
  getCycleTheme(cycleId?: string | null) {
    if (!cycleId) return CYCLE_THEMES[0];
    return CYCLE_THEMES.find((c) => c.id === cycleId) || CYCLE_THEMES[0];
  }
};
