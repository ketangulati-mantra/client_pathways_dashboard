import { sql } from '../db/client.js';

export interface SourceReference {
  source_type: 'journal_entry' | 'daily_check_in';
  source_id: number | string;
}

export interface EmotionalDataPoint {
  emotion: string;
  intensity?: number;
  timestamp: string;
  source: SourceReference;
}

export interface ThematicSignal {
  theme: string;
  label: string;
  frequency: number;
  evidence: SourceReference[];
}

export interface EmotionalDirection {
  status: 'improving' | 'stable' | 'fluctuating' | 'difficult' | 'insufficient_data';
  summary: string;
  evidence: SourceReference[];
}

export interface GrowthSignal {
  type: string;
  description: string;
  evidence: SourceReference[];
}

export interface StoryContext {
  userId: string;
  generatedAt: string;
  dataConfidence: {
    level: 'none' | 'low' | 'medium' | 'high';
    totalDataPoints: number;
    journalCount: number;
    checkInCount: number;
    reason: string;
  };
  recentContext: {
    emotions: EmotionalDataPoint[];
    themes: ThematicSignal[];
    situations: string[];
    reflectionsSummary: string;
  };
  recurringPatterns: ThematicSignal[];
  emotionalDirection: EmotionalDirection;
  growthSignals: GrowthSignal[];
  storyRelevantSignals: {
    primaryAtmosphericTone: string;
    allegoricalSeeds: string[];
    dominantThemes: string[];
  };
  sourceInputs: SourceReference[];
}

// Helper: Check if string is meaningful text
function isMeaningfulText(text: string | null | undefined): boolean {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  
  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = normalized.split(' ').filter(Boolean);
  
  const placeholderTokens = ['na', 'none', 'null', 'undefined', 'nil', 'no', 'nope', 'test', 'sample', 'n', 'a'];
  if (tokens.length > 0 && tokens.every(t => placeholderTokens.includes(t))) {
    return false;
  }

  const lower = trimmed.toLowerCase();
  if (['na', 'n/a', 'none', 'null', 'undefined', 'nil', '-', '--', 'n.a.', 'n.a', 'no', 'nope', 'na na na', 'na na'].includes(lower)) {
    return false;
  }
  return true;
}

// Helper: Strip raw markdown headings
function cleanMarkdown(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/^###\s+.*$/gm, '')
    .replace(/^##\s+.*$/gm, '')
    .replace(/^#\s+.*$/gm, '')
    .trim();
}

// Classification maps for emotions
const POSITIVE_EMOTIONS = new Set([
  'calm', 'peaceful', 'relaxed', 'content', 'happy', 'inspired', 'joyful',
  'grateful', 'grounded', 'good', 'optimistic', 'safe', 'motivated', 'hopeful', 'relieved'
]);

const HEAVY_EMOTIONS = new Set([
  'overwhelmed', 'anxious', 'stressed', 'frustrated', 'angry', 'exhausted',
  'sad', 'panicked', 'panic', 'alarmed', 'terrified', 'fearful', 'lonely', 'hurt', 'tired', 'drained'
]);

export const storyContextService = {
  /**
   * Builds an on-demand, evidence-based Story Context from canonical journal and check-in records.
   * Does NOT store permanent profile facts or call AI models.
   */
  async buildStoryContext(userId: string, options: { maxJournals?: number; maxCheckIns?: number; sinceDate?: Date | string | null } = {}): Promise<StoryContext> {
    if (!userId) throw new Error('User ID is required');

    const maxJournals = options.maxJournals || 15;
    const maxCheckIns = options.maxCheckIns || 20;
    const since = options.sinceDate ? new Date(options.sinceDate) : null;

    // 1. Parallel Bounded Queries with Index Scan (Scoped by sinceDate if provided)
    const [rawJournals, rawCheckIns] = await Promise.all([
      since
        ? sql`
            SELECT id, user_id, title, content, entry_type, emotion, intensity, metadata, created_at
            FROM journal_entries
            WHERE user_id = ${userId} AND created_at > ${since}
            ORDER BY created_at DESC
            LIMIT ${maxJournals};
          `
        : sql`
            SELECT id, user_id, title, content, entry_type, emotion, intensity, metadata, created_at
            FROM journal_entries
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT ${maxJournals};
          `,
      since
        ? sql`
            SELECT id, user_id, activity_type, activity_id, primary_emotion, additional_emotions, intensity, contexts, reflection, created_at
            FROM user_activities
            WHERE user_id = ${userId}
              AND (activity_type = 'daily_check_in' OR activity_id = 'daily-check-in')
              AND created_at > ${since}
            ORDER BY created_at DESC
            LIMIT ${maxCheckIns};
          `
        : sql`
            SELECT id, user_id, activity_type, activity_id, primary_emotion, additional_emotions, intensity, contexts, reflection, created_at
            FROM user_activities
            WHERE user_id = ${userId}
              AND (activity_type = 'daily_check_in' OR activity_id = 'daily-check-in')
            ORDER BY created_at DESC
            LIMIT ${maxCheckIns};
          `
    ]);

    const journals = (rawJournals || []) as any[];
    const checkIns = (rawCheckIns || []) as any[];

    // 2. Sanitize and Normalize Canonical Records
    const validJournals = journals.filter((j) => {
      const cleanText = cleanMarkdown(j.content);
      return isMeaningfulText(cleanText) || isMeaningfulText(j.title) || (j.metadata && isMeaningfulText(j.metadata.prompt));
    });

    const sourceInputsMap = new Map<string, SourceReference>();

    // 3. Extract Chronological Emotional Trajectory
    const allEmotions: EmotionalDataPoint[] = [];

    checkIns.forEach((c) => {
      const em = c.primary_emotion;
      if (em && typeof em === 'string') {
        const src: SourceReference = { source_type: 'daily_check_in', source_id: c.id };
        sourceInputsMap.set(`check_in_${c.id}`, src);
        allEmotions.push({
          emotion: em.toLowerCase(),
          intensity: c.intensity || undefined,
          timestamp: c.created_at,
          source: src
        });
      }
    });

    validJournals.forEach((j) => {
      if (j.emotion && typeof j.emotion === 'string') {
        const src: SourceReference = { source_type: 'journal_entry', source_id: j.id };
        sourceInputsMap.set(`journal_${j.id}`, src);
        allEmotions.push({
          emotion: j.emotion.toLowerCase(),
          intensity: j.intensity || undefined,
          timestamp: j.created_at,
          source: src
        });
      }
    });

    // Sort emotions chronologically (oldest to newest for trajectory analysis)
    allEmotions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // 4. Extract Thematic Signals across Journals
    const themeCounts: Record<string, { label: string; evidence: SourceReference[] }> = {
      communication: { label: 'Interpersonal communication & openness', evidence: [] },
      self_compassion: { label: 'Self-compassion & inner growth', evidence: [] },
      ease_gratitude: { label: 'Ordinary comforts & moments of ease', evidence: [] },
      work_pressure: { label: 'Work or academic capacity & boundaries', evidence: [] },
      rest_recharge: { label: 'Rest, slowing down & pacing', evidence: [] },
      processing_heavy: { label: 'Processing heavy or complex emotions', evidence: [] },
      creative_spark: { label: 'Momentum, curiosity & creative energy', evidence: [] }
    };

    validJournals.forEach((j) => {
      const text = `${j.title || ''} ${cleanMarkdown(j.content)} ${j.metadata?.prompt || ''} ${j.metadata?.category || ''}`.toLowerCase();
      const src: SourceReference = { source_type: 'journal_entry', source_id: j.id };
      sourceInputsMap.set(`journal_${j.id}`, src);

      if (text.includes('communication') || text.includes('communicate') || text.includes('openly') || text.includes('express') || text.includes('relationship') || text.includes('friends') || text.includes('conversation')) {
        themeCounts.communication.evidence.push(src);
      }
      if (text.includes('strength') || text.includes('pressure') || text.includes('grow') || text.includes('progress') || text.includes('proud') || text.includes('learn') || text.includes('myself') || text.includes('grace')) {
        themeCounts.self_compassion.evidence.push(src);
      }
      if (text.includes('gratitude') || text.includes('grateful') || text.includes('coffee') || text.includes('walk') || text.includes('quiet') || text.includes('simple') || text.includes('comfort') || text.includes('peace') || text.includes('relief')) {
        themeCounts.ease_gratitude.evidence.push(src);
      }
      if (text.includes('work') || text.includes('study') || text.includes('deadline') || text.includes('career') || text.includes('demand') || text.includes('focus')) {
        themeCounts.work_pressure.evidence.push(src);
      }
      if (text.includes('rest') || text.includes('tired') || text.includes('sleep') || text.includes('break') || text.includes('exhausted') || text.includes('slow') || text.includes('pause')) {
        themeCounts.rest_recharge.evidence.push(src);
      }
      if (text.includes('overwhelm') || text.includes('anxious') || text.includes('stress') || text.includes('frustrat') || text.includes('sad') || text.includes('panic') || text.includes('heavy')) {
        themeCounts.processing_heavy.evidence.push(src);
      }
      if (text.includes('motivated') || text.includes('inspired') || text.includes('spark') || text.includes('excited') || text.includes('momentum') || text.includes('build')) {
        themeCounts.creative_spark.evidence.push(src);
      }
    });

    // Check-in contexts (e.g. work, alone, with others)
    const situationsSet = new Set<string>();
    checkIns.forEach((c) => {
      if (Array.isArray(c.contexts)) {
        c.contexts.forEach((ctx: string) => {
          if (typeof ctx === 'string') situationsSet.add(ctx);
        });
      }
    });

    // Filter active thematic signals
    const activeThemes: ThematicSignal[] = Object.entries(themeCounts)
      .filter(([_, data]) => data.evidence.length > 0)
      .map(([theme, data]) => ({
        theme,
        label: data.label,
        frequency: data.evidence.length,
        evidence: data.evidence
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // Recurring patterns (appearing in >= 2 distinct sources)
    const recurringPatterns: ThematicSignal[] = activeThemes.filter((t) => t.frequency >= 2);

    // 5. Derive Emotional Direction
    let emotionalDirection: EmotionalDirection = {
      status: 'insufficient_data',
      summary: 'Not enough emotional check-ins or reflections to establish a trajectory.',
      evidence: []
    };

    if (allEmotions.length >= 3) {
      const midpoint = Math.floor(allEmotions.length / 2);
      const olderHalf = allEmotions.slice(0, midpoint);
      const newerHalf = allEmotions.slice(midpoint);

      const olderPositiveCount = olderHalf.filter((e) => POSITIVE_EMOTIONS.has(e.emotion)).length;
      const olderHeavyCount = olderHalf.filter((e) => HEAVY_EMOTIONS.has(e.emotion)).length;

      const newerPositiveCount = newerHalf.filter((e) => POSITIVE_EMOTIONS.has(e.emotion)).length;
      const newerHeavyCount = newerHalf.filter((e) => HEAVY_EMOTIONS.has(e.emotion)).length;

      const allEv = allEmotions.map((e) => e.source);

      if (olderHeavyCount >= olderPositiveCount && newerPositiveCount > newerHeavyCount) {
        emotionalDirection = {
          status: 'improving',
          summary: 'Emotional signals show a shift toward greater calm, ease, or groundedness.',
          evidence: allEv
        };
      } else if (newerHeavyCount > newerPositiveCount && olderPositiveCount >= olderHeavyCount) {
        emotionalDirection = {
          status: 'difficult',
          summary: 'Recent reflections reflect heavier demands, tiredness, or tension asking for space.',
          evidence: allEv
        };
      } else if (newerHeavyCount > 0 && newerPositiveCount > 0) {
        emotionalDirection = {
          status: 'fluctuating',
          summary: 'Navigating mixed moments of both demanding tension and grounding ease.',
          evidence: allEv
        };
      } else {
        emotionalDirection = {
          status: 'stable',
          summary: 'A steady, consistent emotional baseline across recent check-ins.',
          evidence: allEv
        };
      }
    }

    // 6. Growth & Agency Signals (Non-clinical evidence of self-understanding)
    const growthSignals: GrowthSignal[] = [];

    if (themeCounts.self_compassion.evidence.length >= 2) {
      growthSignals.push({
        type: 'self_understanding',
        description: 'Returning to self-compassion, learning from challenges, and recognizing personal capabilities.',
        evidence: themeCounts.self_compassion.evidence
      });
    }
    if (themeCounts.communication.evidence.length >= 2) {
      growthSignals.push({
        type: 'relational_clarity',
        description: 'Mindful intentionality around expressing feelings and communicating clearly with others.',
        evidence: themeCounts.communication.evidence
      });
    }
    if (themeCounts.rest_recharge.evidence.length >= 2) {
      growthSignals.push({
        type: 'capacity_awareness',
        description: 'Acknowledging personal limits and actively giving oneself permission to pause and recharge.',
        evidence: themeCounts.rest_recharge.evidence
      });
    }

    // 7. Atmospheric & Allegorical Seeds for Future Story Generation
    const dominantThemes = activeThemes.slice(0, 3).map((t) => t.theme);
    let primaryAtmosphericTone = 'contemplative_quiet';
    const allegoricalSeeds: string[] = [];

    if (dominantThemes.includes('communication')) {
      allegoricalSeeds.push('unspoken letters, listening bells, resonant stones across the harbor');
    }
    if (dominantThemes.includes('ease_gratitude')) {
      allegoricalSeeds.push('warm hearthlight, quiet tea in the greenhouse, sea glass catching morning sun');
    }
    if (dominantThemes.includes('rest_recharge')) {
      allegoricalSeeds.push('sheltered coves, resting by the tidal pools, unhurried twilight walks');
    }
    if (dominantThemes.includes('self_compassion') || dominantThemes.includes('creative_spark')) {
      allegoricalSeeds.push('the high observatory lenses, uncovering hidden craftsmanship in the stone wall');
    }

    if (emotionalDirection.status === 'improving') {
      primaryAtmosphericTone = 'clearing_skies_and_gentle_warmth';
    } else if (emotionalDirection.status === 'difficult') {
      primaryAtmosphericTone = 'misty_winds_and_sheltered_haven';
    } else if (emotionalDirection.status === 'fluctuating') {
      primaryAtmosphericTone = 'shifting_tides_and_weathered_light';
    }

    // 8. Assess Data Confidence Level
    const totalDataPoints = validJournals.length + checkIns.length;
    let confidenceLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
    let confidenceReason = 'No reflections or check-in records found.';

    if (totalDataPoints === 0) {
      confidenceLevel = 'none';
    } else if (totalDataPoints < 3) {
      confidenceLevel = 'low';
      confidenceReason = `Sparse data (${totalDataPoints} total item${totalDataPoints > 1 ? 's' : ''}). Context is early and light.`;
    } else if (totalDataPoints < 7) {
      confidenceLevel = 'medium';
      confidenceReason = `Moderate context based on ${validJournals.length} reflections and ${checkIns.length} check-ins.`;
    } else {
      confidenceLevel = 'high';
      confidenceReason = `Rich context supported by ${validJournals.length} reflections and ${checkIns.length} check-ins.`;
    }

    const reflectionsTextList: string[] = [];
    validJournals.forEach((j) => {
      if (j.title) reflectionsTextList.push(j.title);
      if (j.content) reflectionsTextList.push(cleanMarkdown(j.content));
    });
    checkIns.forEach((c) => {
      if (c.reflection && isMeaningfulText(c.reflection)) {
        reflectionsTextList.push(c.reflection);
      }
    });
    const reflectionsSummary = reflectionsTextList.join('. ');

    return {
      userId,
      generatedAt: new Date().toISOString(),
      dataConfidence: {
        level: confidenceLevel,
        totalDataPoints,
        journalCount: validJournals.length,
        checkInCount: checkIns.length,
        reason: confidenceReason
      },
      recentContext: {
        emotions: allEmotions.slice(-5), // Latest 5 emotions
        themes: activeThemes.slice(0, 4),
        situations: Array.from(situationsSet),
        reflectionsSummary
      },
      recurringPatterns,
      emotionalDirection,
      growthSignals,
      storyRelevantSignals: {
        primaryAtmosphericTone,
        allegoricalSeeds: allegoricalSeeds.length > 0 ? allegoricalSeeds : ['quiet pathways, weathered stones, soft morning mist'],
        dominantThemes
      },
      sourceInputs: Array.from(sourceInputsMap.values())
    };
  }
};
