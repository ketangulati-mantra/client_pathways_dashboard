import { geminiClient, GeminiGenerationOptions } from './geminiClient.js';
import { StoryContext } from '../storyContextService.js';
import { StoryState, StoryChapter } from '../storyService.js';
import { storyContinuityService, StoryThread, NarrativeFacts } from '../storyContinuityService.js';
import { storyPacingAndSuspense, PacingState, EndingStyle } from '../storyPacingAndSuspense.js';
import { storyCycleService, CycleProgress, NextCyclePreview } from '../storyCycleService.js';
import { storyPersonalizationService, StoryPersonalization } from '../storyPersonalizationService.js';

export interface GeneratedChapterPayload {
  title: string;
  content: string;
  narrative_summary: string;
  open_threads: StoryThread[];
  narrative_facts?: Partial<NarrativeFacts>;
  pacing_used?: PacingState;
  ending_style_used?: EndingStyle;
  cycle_id?: string | null;
  cycle_name?: string | null;
  world_theme?: string | null;
  cycle_progress?: CycleProgress;
  next_cycle_preview?: NextCyclePreview | null;
  creative_metadata?: Record<string, any>;
}

// Curated setting families for initialization variety
const SETTING_FAMILIES = [
  {
    id: 'coastal_haven',
    cycle_name: 'The Quiet Harbour',
    world_theme: 'tides_and_harbor_lights',
    motifs: ['listening bells', 'sea glass', 'tidal stone pathways', 'warm harbor light']
  },
  {
    id: 'highland_observatory',
    cycle_name: 'The Mountain of Echoes',
    world_theme: 'alpine_solitude_and_starlight',
    motifs: ['ancient cedar gates', 'star-chart lenses', 'mountain wind-chimes', 'inscribed stone keys']
  },
  {
    id: 'botanical_archives',
    cycle_name: 'The Sunken Greenhouse',
    world_theme: 'living_parchment_and_moss',
    motifs: ['fern-draped glass domes', 'terracotta lanterns', 'waterclock chimes', 'deep moss corridors']
  },
  {
    id: 'desert_wind_towers',
    cycle_name: 'The Whispering Dunes',
    world_theme: 'sandstone_and_hidden_springs',
    motifs: ['hollow flute stones', 'cool subterranean cisterns', 'twilight wind towers', 'woven silk maps']
  },
  {
    id: 'artisan_valley',
    cycle_name: 'The Glade of Apprentices',
    world_theme: 'carved_timber_and_riverstones',
    motifs: ['wooden footbridges', 'pottery kilns by the river', 'paper-lantern paths', 'river-smoothed gems']
  }
];

export const storyGenerator = {
  /**
   * Generates a new chapter payload using the Story Context, Personalization Layer, Continuity, Pacing, and Cycles.
   */
  async generateNextChapter(
    context: StoryContext,
    currentState: StoryState,
    recentChapters: StoryChapter[],
    options: GeminiGenerationOptions = {}
  ): Promise<GeneratedChapterPayload> {
    const isFirstChapter = currentState.current_chapter_number === 0 || currentState.status === 'not_started';
    const targetChapterNumber = currentState.current_chapter_number + 1;

    // 1. Derive Dynamic Narrative Personalization
    const personalization = storyPersonalizationService.derivePersonalization(context, currentState);
    const personalizationPrompt = storyPersonalizationService.formatPersonalizationPrompt(personalization);

    // 2. Determine or Preserve World Setting & Cycle
    let cycleId = currentState.current_cycle_id;
    let cycleName = currentState.current_cycle_name;
    let worldTheme = currentState.world_theme;

    if (isFirstChapter || !cycleId) {
      const dominant = context.storyRelevantSignals.dominantThemes[0] || '';
      let pickedFamily = SETTING_FAMILIES[0];

      if (dominant === 'communication') {
        pickedFamily = SETTING_FAMILIES[1];
      } else if (dominant === 'rest_recharge') {
        pickedFamily = SETTING_FAMILIES[2];
      } else if (dominant === 'creative_spark' || dominant === 'self_compassion') {
        pickedFamily = SETTING_FAMILIES[4];
      } else if (dominant === 'work_pressure') {
        pickedFamily = SETTING_FAMILIES[3];
      } else {
        const hash = context.userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        pickedFamily = SETTING_FAMILIES[hash % SETTING_FAMILIES.length];
      }

      cycleId = pickedFamily.id;
      cycleName = pickedFamily.cycle_name;
      worldTheme = pickedFamily.world_theme;
    }

    // 3. Determine Narrative Pacing & Ending Style
    const targetPacing = storyPacingAndSuspense.determineTargetPacing(
      targetChapterNumber,
      currentState.recent_pacing || [],
      context.emotionalDirection.status
    );

    const targetEndingStyle = storyPacingAndSuspense.determineTargetEndingStyle(
      currentState.recent_ending_styles || []
    );

    // 4. Determine Cycle Progress and Next Cycle Preview
    const cycleProgress = storyCycleService.calculateCycleProgress(targetChapterNumber);
    const nextCyclePreview = storyCycleService.deriveNextCyclePreview(
      cycleId,
      cycleProgress.chapter_in_cycle
    );

    // 5. Compile Recent Narrative Recaps (Bounded 3)
    const recentRecaps = recentChapters.slice(-3).map((ch) => ({
      chapter_number: ch.chapter_number,
      title: ch.title,
      summary: ch.narrative_summary
    }));

    // 6. Compile Persistent Facts & Open Threads Packet
    const narrativeFacts: NarrativeFacts = currentState.narrative_facts || {
      characters: [],
      locations: [],
      symbols: []
    };

    // Pre-populate facts with derived personalization motifs
    personalization.narrativeMotifs.forEach((m) => {
      if (!narrativeFacts.symbols.some((s) => s.symbol.toLowerCase() === m.motif.toLowerCase())) {
        narrativeFacts.symbols.push({ symbol: m.motif, meaning: m.meaning });
      }
    });

    const openThreads: StoryThread[] = currentState.open_threads || [];
    const continuityPacket = storyContinuityService.formatContinuityPacket(narrativeFacts, openThreads);

    // 7. Build Structured System Instruction
    const systemInstruction = `You are a master literary fantasy author and gentle companion storyteller.
You write evocative, atmospheric, second-person ("You") serialized chapters for an introspective fantasy journey.
The story must mirror the user's emotional movement allegorically and symbolically—NEVER literally.
You must maintain strict narrative continuity with established characters, locations, and open mysteries.
You must return your output strictly in JSON according to the requested schema.`;

    // 8. Build Compact Generation Prompt
    const promptPacket = `
=== CHAPTER GENERATION TASK ===
Target Chapter: Chapter ${targetChapterNumber}
World Setting: "${worldTheme}"
Narrative Cycle: "${cycleName}" (Cycle Stage: ${cycleProgress.stage})
Is Chapter 1 (Story Genesis): ${isFirstChapter ? 'YES' : 'NO'}
Target Pacing: "${targetPacing}"
Target Ending Style: "${targetEndingStyle}"

=== USER EMOTIONAL CONTEXT (INSPIRATION ONLY - DO NOT REPRODUCE LITERALLY) ===
- Primary Atmospheric Tone: ${context.storyRelevantSignals.primaryAtmosphericTone}
- Emotional Direction: ${context.emotionalDirection.status} (${context.emotionalDirection.summary})
- Dominant Themes: ${context.storyRelevantSignals.dominantThemes.join(', ') || 'quiet presence'}
- Allegorical Seeds: ${context.storyRelevantSignals.allegoricalSeeds.join(' | ')}
- Situational Influences: ${context.recentContext.situations.join(', ') || 'solitude and reflection'}

${personalizationPrompt}

=== STORY CONTINUITY & RECENT RECAPS ===
${
  recentRecaps.length > 0
    ? recentRecaps
        .map((r) => `Chapter ${r.chapter_number} ("${r.title}"): ${r.summary}`)
        .join('\n')
    : 'No previous chapters. This is the opening chapter of the story.'
}

${continuityPacket}

=== CREATIVE RULES & REQUIREMENTS ===
1. Perspective: Second-person ("You"). You are the protagonist exploring this wondrous, quiet realm.
2. Tone: Warm, cinematic, introspective, curious.
3. Pacing: Align with target pacing "${targetPacing}".
4. Ending: Conclude using the "${targetEndingStyle}" ending style. Avoid cliches like "little did they know" or "perhaps tomorrow things would be clearer".
5. Word Count: 200 to 350 words of immersive sensory prose in 3-4 paragraphs.
6. Facts & Thread Management:
   - Continue or advance at least one existing open thread or character.
   - You may resolve one thread and/or introduce a new thread (lifecycle: "introduced" | "developing" | "escalating" | "resolved").
7. Format: Return STRICT JSON conforming to this schema:
{
  "title": "Poetic title (e.g., Chapter ${targetChapterNumber}: The Inscribed Key)",
  "content": "Full chapter prose (200-350 words)",
  "narrative_summary": "Concise 2-sentence summary of what happened and changed in this chapter",
  "open_threads": [
    { "id": "string", "text": "description", "status": "introduced | developing | escalating | resolved", "importance": "high | medium | subtle" }
  ],
  "narrative_facts": {
    "characters": [ { "name": "string", "role": "string", "status": "active" } ],
    "locations": [ { "name": "string", "significance": "string" } ],
    "symbols": [ { "symbol": "string", "meaning": "string" } ]
  },
  "creative_metadata": {
    "pacing": "${targetPacing}",
    "ending_style": "${targetEndingStyle}",
    "tone": "${context.storyRelevantSignals.primaryAtmosphericTone}"
  }
}
`;

    // 9. Call Gemini
    const result = await geminiClient.generateStructuredContent<GeneratedChapterPayload>(promptPacket, {
      ...options,
      systemInstruction
    });

    // 10. Validate Generation Output
    if (!result || typeof result !== 'object') {
      throw new Error('Story generator received empty or invalid response object');
    }

    if (!result.title || typeof result.title !== 'string' || result.title.trim().length === 0) {
      throw new Error('Generated chapter is missing a valid title');
    }

    if (!result.content || typeof result.content !== 'string') {
      throw new Error('Generated chapter is missing valid content');
    }

    const wordCount = result.content.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 20 || wordCount > 800) {
      throw new Error(`Generated chapter word count (${wordCount}) is outside expected bounds`);
    }

    if (!result.narrative_summary || typeof result.narrative_summary !== 'string') {
      result.narrative_summary = result.content.slice(0, 160) + '...';
    }

    // 11. Evolve Threads and Merge Facts
    const evolvedThreads = storyContinuityService.evolveThreads(
      openThreads,
      Array.isArray(result.open_threads) ? result.open_threads : [],
      targetChapterNumber
    );

    const mergedFacts = storyContinuityService.mergeNarrativeFacts(
      narrativeFacts,
      result.narrative_facts
    );

    return {
      title: result.title.replace(/^#+\s*/, '').trim(),
      content: result.content.trim(),
      narrative_summary: result.narrative_summary.trim(),
      open_threads: evolvedThreads,
      narrative_facts: mergedFacts,
      pacing_used: targetPacing,
      ending_style_used: targetEndingStyle,
      cycle_id: cycleId,
      cycle_name: cycleName,
      world_theme: worldTheme,
      cycle_progress: cycleProgress,
      next_cycle_preview: nextCyclePreview,
      creative_metadata: result.creative_metadata || {}
    };
  }
};
