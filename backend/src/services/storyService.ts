import { sql } from '../db/client.js';
import { storyContextService } from './storyContextService.js';
import { storyComposerService, ComposedStoryChapter } from './storyComposerService.js';
import { NarrativeFacts, StoryThread } from './storyContinuityService.js';
import { PacingState, EndingStyle, storyPacingAndSuspense } from './storyPacingAndSuspense.js';
import { CycleProgress, NextCyclePreview, storyCycleService } from './storyCycleService.js';
import { storyPersonalizationService } from './storyPersonalizationService.js';
import { storyQualityEngine } from './storyQualityEngine.js';
import { getLocalCalendarDate } from '../utils/dateUtils.js';

export interface StorySourceInput {
  source_type: 'journal_entry' | 'daily_check_in';
  source_id: number | string;
}

export interface StoryState {
  user_id: string;
  status: 'not_started' | 'active' | 'completed';
  current_chapter_number: number;
  current_cycle_id: string | null;
  current_cycle_name: string | null;
  world_theme: string | null;
  open_threads: StoryThread[];
  narrative_facts?: NarrativeFacts;
  recent_pacing?: PacingState[];
  recent_ending_styles?: EndingStyle[];
  cycle_progress?: CycleProgress;
  next_cycle_preview?: NextCyclePreview | null;
  is_generating: boolean;
  generation_started_at: string | null;
  last_unlocked_at: string | null;
  last_chapter_date: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface StoryChapter {
  id: number;
  user_id: string;
  chapter_number: number;
  story_day_date: string;
  cycle_id: string | null;
  title: string;
  content: string;
  narrative_summary: string;
  source_inputs: StorySourceInput[];
  metadata: Record<string, any>;
  created_at: string;
}

export interface DailyEligibilityResult {
  eligible: boolean;
  reason: 'today_chapter_exists' | 'no_new_reflections' | 'ready_to_unfold' | 'genesis_ready';
  todayStoryDay: string;
  todayChapterGenerated: boolean;
  todayChapterNumber: number | null;
  lastChapterDate: string | null;
  unconsumedInputsCount: number;
}

export interface UnifiedStoryResponse {
  status: 'not_started' | 'active' | 'generating' | 'completed';
  storyState: StoryState;
  latestChapter: StoryChapter | null;
  chapters: StoryChapter[];
  canUnlockNextChapter: boolean;
  dailyEligibility: DailyEligibilityResult;
  nextChapterHint: {
    previewText?: string;
    nextCycleName?: string;
  } | null;
  currentCycle: {
    id: string | null;
    name: string | null;
    worldTheme: string | null;
    stage?: string;
    chapterInCycle?: number;
  };
}

export const storyService = {
  /**
   * Safely retrieves the story state for a user.
   * If the user does not have a story record yet, safely and idempotently initializes a neutral 'not_started' state.
   */
  async getStoryState(userId: string): Promise<StoryState> {
    if (!userId) throw new Error('User ID is required');

    const rows = await sql`
      SELECT * FROM story_states WHERE user_id = ${userId} LIMIT 1;
    `;

    if (rows && rows.length > 0) {
      return rows[0] as StoryState;
    }

    await sql`
      INSERT INTO story_states (
        user_id,
        status,
        current_chapter_number,
        current_cycle_id,
        current_cycle_name,
        world_theme,
        open_threads,
        narrative_facts,
        recent_pacing,
        recent_ending_styles,
        cycle_progress,
        next_cycle_preview,
        is_generating,
        last_chapter_date,
        timezone
      ) VALUES (
        ${userId},
        'not_started',
        0,
        NULL,
        NULL,
        NULL,
        '[]'::jsonb,
        '{"characters":[],"locations":[],"symbols":[]}'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        '{"stage":"beginning","chapter_in_cycle":1}'::jsonb,
        NULL,
        FALSE,
        NULL,
        'UTC'
      )
      ON CONFLICT (user_id) DO NOTHING;
    `;

    const initialized = await sql`
      SELECT * FROM story_states WHERE user_id = ${userId} LIMIT 1;
    `;

    return initialized[0] as StoryState;
  },

  /**
   * Evaluates if the user is eligible for a new chapter on the current local calendar day.
   * HARD RULE: Maximum 1 chapter per user per local calendar day.
   */
  async evaluateEligibility(userId: string, timezone?: string): Promise<DailyEligibilityResult> {
    if (!userId) {
      return {
        eligible: false,
        reason: 'no_new_reflections',
        todayStoryDay: getLocalCalendarDate(new Date(), timezone),
        todayChapterGenerated: false,
        todayChapterNumber: null,
        lastChapterDate: null,
        unconsumedInputsCount: 0
      };
    }

    const state = await this.getStoryState(userId);
    const userTz = timezone || state.timezone || 'UTC';
    const todayStoryDay = getLocalCalendarDate(new Date(), userTz);

    // 1. Check if a chapter already exists for today's story date in the database
    const todayChapterRows = await sql`
      SELECT id, chapter_number, story_day_date
      FROM story_chapters
      WHERE user_id = ${userId} AND story_day_date = ${todayStoryDay}::date
      LIMIT 1;
    `;

    if (todayChapterRows && todayChapterRows.length > 0) {
      return {
        eligible: false,
        reason: 'today_chapter_exists',
        todayStoryDay,
        todayChapterGenerated: true,
        todayChapterNumber: todayChapterRows[0].chapter_number,
        lastChapterDate: todayStoryDay,
        unconsumedInputsCount: 0
      };
    }

    // 2. Fetch latest chapter to establish input consumption cutoff
    const latestChapter = await this.getLatestChapter(userId);

    // 3. Check for unconsumed reflections / check-ins created since last chapter
    const lastUnlocked = latestChapter ? new Date(latestChapter.created_at) : null;

    let unconsumedJournals: any[] = [];
    let unconsumedCheckins: any[] = [];

    if (lastUnlocked) {
      [unconsumedJournals, unconsumedCheckins] = await Promise.all([
        sql`
          SELECT id FROM journal_entries
          WHERE user_id = ${userId} AND created_at > ${lastUnlocked}
          LIMIT 10;
        `,
        sql`
          SELECT id FROM user_activities
          WHERE user_id = ${userId} 
            AND (activity_type = 'daily_check_in' OR activity_id = 'daily-check-in')
            AND created_at > ${lastUnlocked}
          LIMIT 10;
        `
      ]);
    } else {
      // Genesis: Check if there's any reflection or check-in
      [unconsumedJournals, unconsumedCheckins] = await Promise.all([
        sql`
          SELECT id FROM journal_entries
          WHERE user_id = ${userId}
          LIMIT 10;
        `,
        sql`
          SELECT id FROM user_activities
          WHERE user_id = ${userId} 
            AND (activity_type = 'daily_check_in' OR activity_id = 'daily-check-in')
          LIMIT 10;
        `
      ]);
    }

    const unconsumedCount = (unconsumedJournals?.length || 0) + (unconsumedCheckins?.length || 0);

    // 4. Genesis Chapter Logic (Chapter 1)
    if (!latestChapter) {
      return {
        eligible: true,
        reason: 'genesis_ready',
        todayStoryDay,
        todayChapterGenerated: false,
        todayChapterNumber: null,
        lastChapterDate: null,
        unconsumedInputsCount: unconsumedCount
      };
    }

    // 5. Subsequent Daily Chapters (Chapter 2+): Requires unconsumed inputs on a new calendar day
    if (unconsumedCount > 0) {
      return {
        eligible: true,
        reason: 'ready_to_unfold',
        todayStoryDay,
        todayChapterGenerated: false,
        todayChapterNumber: null,
        lastChapterDate: latestChapter.story_day_date ? String(latestChapter.story_day_date).split('T')[0] : null,
        unconsumedInputsCount: unconsumedCount
      };
    }

    // 6. No new reflections since last chapter -> wait for user reflection
    return {
      eligible: false,
      reason: 'no_new_reflections',
      todayStoryDay,
      todayChapterGenerated: false,
      todayChapterNumber: null,
      lastChapterDate: latestChapter.story_day_date ? String(latestChapter.story_day_date).split('T')[0] : null,
      unconsumedInputsCount: 0
    };
  },

  /**
   * Retrieves the unified, single-source-of-truth story state for the frontend.
   */
  async getUnifiedStoryState(userId: string, timezone?: string): Promise<UnifiedStoryResponse> {
    if (!userId) throw new Error('User ID is required');

    const state = await this.getStoryState(userId);
    const chapters = await this.getStoryChapters(userId, 50);
    const latestChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
    const dailyEligibility = await this.evaluateEligibility(userId, timezone);

    let displayStatus: 'not_started' | 'active' | 'generating' | 'completed' = state.status;
    if (state.is_generating) displayStatus = 'generating';

    return {
      status: displayStatus,
      storyState: state,
      latestChapter,
      chapters,
      canUnlockNextChapter: dailyEligibility.eligible,
      dailyEligibility,
      nextChapterHint: state.next_cycle_preview
        ? {
            previewText: state.next_cycle_preview.previewText,
            nextCycleName: state.next_cycle_preview.nextCycleName
          }
        : null,
      currentCycle: {
        id: state.current_cycle_id,
        name: state.current_cycle_name,
        worldTheme: state.world_theme,
        stage: state.cycle_progress?.stage,
        chapterInCycle: state.cycle_progress?.chapter_in_cycle
      }
    };
  },

  /**
   * Retrieves all chronological chapters for a user.
   */
  async getStoryChapters(userId: string, limit: number = 50): Promise<StoryChapter[]> {
    if (!userId) return [];

    const rows = await sql`
      SELECT * FROM story_chapters
      WHERE user_id = ${userId}
      ORDER BY chapter_number ASC
      LIMIT ${limit};
    `;

    return rows as StoryChapter[];
  },

  /**
   * Retrieves the latest N chapters in chronological order for memory/anti-repetition lookback.
   */
  async getRecentStoryChapters(userId: string, limit: number = 5): Promise<StoryChapter[]> {
    if (!userId) return [];

    const rows = await sql`
      SELECT * FROM story_chapters
      WHERE user_id = ${userId}
      ORDER BY chapter_number DESC
      LIMIT ${limit};
    `;

    return (rows as StoryChapter[]).reverse();
  },

  /**
   * Retrieves the latest unlocked chapter for a user.
   */
  async getLatestChapter(userId: string): Promise<StoryChapter | null> {
    if (!userId) return null;

    const rows = await sql`
      SELECT * FROM story_chapters
      WHERE user_id = ${userId}
      ORDER BY chapter_number DESC
      LIMIT 1;
    `;

    return rows.length > 0 ? (rows[0] as StoryChapter) : null;
  },

  /**
   * Persists a newly unlocked chapter and atomically updates the story state.
   */
  async createChapter(data: {
    user_id: string;
    chapter_number: number;
    story_day_date: string;
    cycle_id?: string | null;
    cycle_name?: string | null;
    world_theme?: string | null;
    title: string;
    content: string;
    narrative_summary: string;
    source_inputs?: StorySourceInput[];
    metadata?: Record<string, any>;
    open_threads?: StoryThread[];
    narrative_facts?: NarrativeFacts;
    recent_pacing?: PacingState[];
    recent_ending_styles?: EndingStyle[];
    cycle_progress?: CycleProgress;
    next_cycle_preview?: NextCyclePreview | null;
  }): Promise<StoryChapter> {
    const {
      user_id,
      chapter_number,
      story_day_date,
      cycle_id = null,
      cycle_name = null,
      world_theme = null,
      title,
      content,
      narrative_summary,
      source_inputs = [],
      metadata = {},
      open_threads,
      narrative_facts,
      recent_pacing,
      recent_ending_styles,
      cycle_progress,
      next_cycle_preview = null
    } = data;

    // Ensure story state row exists before updating
    await this.getStoryState(user_id);

    // 1. Insert chapter record with story_day_date and unique constraint check
    const insertResult = await sql`
      INSERT INTO story_chapters (
        user_id,
        chapter_number,
        story_day_date,
        cycle_id,
        title,
        content,
        narrative_summary,
        source_inputs,
        metadata
      ) VALUES (
        ${user_id},
        ${chapter_number},
        ${story_day_date}::date,
        ${cycle_id},
        ${title},
        ${content},
        ${narrative_summary},
        ${JSON.stringify(source_inputs)}::jsonb,
        ${JSON.stringify(metadata)}::jsonb
      )
      RETURNING *;
    `;

    // 2. Update parent story state atomically
    await sql`
      UPDATE story_states
      SET
        status = 'active',
        current_chapter_number = ${chapter_number},
        current_cycle_id = COALESCE(${cycle_id}, current_cycle_id),
        current_cycle_name = COALESCE(${cycle_name}, current_cycle_name),
        world_theme = COALESCE(${world_theme}, world_theme),
        open_threads = COALESCE(${open_threads ? JSON.stringify(open_threads) : null}::jsonb, open_threads),
        narrative_facts = COALESCE(${narrative_facts ? JSON.stringify(narrative_facts) : null}::jsonb, narrative_facts),
        recent_pacing = COALESCE(${recent_pacing ? JSON.stringify(recent_pacing) : null}::jsonb, recent_pacing),
        recent_ending_styles = COALESCE(${recent_ending_styles ? JSON.stringify(recent_ending_styles) : null}::jsonb, recent_ending_styles),
        cycle_progress = COALESCE(${cycle_progress ? JSON.stringify(cycle_progress) : null}::jsonb, cycle_progress),
        next_cycle_preview = ${next_cycle_preview ? JSON.stringify(next_cycle_preview) : null}::jsonb,
        last_unlocked_at = CURRENT_TIMESTAMP,
        last_chapter_date = ${story_day_date}::date,
        is_generating = FALSE,
        generation_started_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user_id};
    `;

    return insertResult[0] as StoryChapter;
  },

  /**
   * Orchestrates the deterministic generation of the next chapter for a user with atomic locking,
   * daily calendar gating (MAX 1 CHAPTER PER DAY), scoped input consumption, continuity preservation,
   * and cycle arcs.
   * Uses 100% local deterministic composition (ZERO external AI API calls).
   */
  async generateNextChapterForUser(
    userId: string,
    options: { timezone?: string; [key: string]: any } = {}
  ): Promise<{ chapter: StoryChapter; state: StoryState }> {
    if (!userId) throw new Error('User ID is required');

    const state = await this.getStoryState(userId);
    const userTz = options.timezone || state.timezone || 'UTC';
    const todayStoryDay = getLocalCalendarDate(new Date(), userTz);

    // Hard Daily Check: Enforce maximum 1 chapter per local calendar day
    const eligibility = await this.evaluateEligibility(userId, userTz);
    if (eligibility.todayChapterGenerated) {
      throw new Error(`DAILY_CHAPTER_LIMIT_REACHED: Chapter ${eligibility.todayChapterNumber} has already been created for today (${todayStoryDay}). Only one chapter can be generated per calendar day.`);
    }

    if (!eligibility.eligible) {
      if (eligibility.reason === 'no_new_reflections') {
        throw new Error('STORY_NOT_ELIGIBLE: New reflections or daily check-ins are required to shape the next chapter.');
      }
      throw new Error(`STORY_NOT_ELIGIBLE: Cannot generate chapter for ${todayStoryDay}.`);
    }

    const lockRows = await sql`
      UPDATE story_states
      SET
        is_generating = TRUE,
        generation_started_at = CURRENT_TIMESTAMP
      WHERE
        user_id = ${userId}
        AND (is_generating = FALSE OR generation_started_at < CURRENT_TIMESTAMP - INTERVAL '45 seconds')
      RETURNING *;
    `;

    if (!lockRows || lockRows.length === 0) {
      throw new Error('STORY_GENERATION_IN_PROGRESS: Another chapter generation is currently running for this user.');
    }

    const lockedState = lockRows[0] as StoryState;

    try {
      const latestChapter = await this.getLatestChapter(userId);
      const sinceCutoff = latestChapter ? latestChapter.created_at : null;

      // Build context scoped to unconsumed inputs since previous chapter
      const context = await storyContextService.buildStoryContext(userId, { sinceDate: sinceCutoff });
      const recentChapters = await this.getRecentStoryChapters(userId, 5);

      // Derive Personalization Layer
      const personalization = storyPersonalizationService.derivePersonalization(context, lockedState);

      // Deterministic Multi-Pass Generation with Quality Scorer
      let bestComposed: ComposedStoryChapter | null = null;
      let highestQualityScore = -1;

      for (let variant = 0; variant < 3; variant++) {
        const candidate = await storyComposerService.composeNextChapter(
          context,
          lockedState,
          recentChapters,
          { variant }
        );

        const quality = storyQualityEngine.evaluateChapterQuality(candidate, personalization, context);

        if (quality.overallScore > highestQualityScore) {
          highestQualityScore = quality.overallScore;
          bestComposed = candidate;
          bestComposed.metadata = {
            ...bestComposed.metadata,
            qualityScore: quality.overallScore,
            qualityBreakdown: quality.breakdown,
            personalDimensions: quality.detectedPersonalDimensions
          } as any;
        }

        if (quality.isSufficient) {
          break;
        }
      }

      const composed = bestComposed!;
      const nextChapterNumber = lockedState.current_chapter_number + 1;

      // Update recent pacing and ending styles lists
      const updatedPacing = storyPacingAndSuspense.updateRecentPacing(
        lockedState.recent_pacing || [],
        composed.metadata.pacing || 'building'
      );

      const updatedEndingStyles = storyPacingAndSuspense.updateRecentEndingStyles(
        lockedState.recent_ending_styles || [],
        composed.metadata.endingStyle || 'discovery'
      );

      // 4. Persist newly created chapter with story_day_date
      const newChapter = await this.createChapter({
        user_id: userId,
        chapter_number: nextChapterNumber,
        story_day_date: todayStoryDay,
        cycle_id: composed.cycleId,
        cycle_name: composed.cycleName,
        world_theme: composed.worldTheme,
        title: composed.title,
        content: composed.content,
        narrative_summary: composed.narrativeSummary,
        source_inputs: context.sourceInputs,
        metadata: composed.metadata,
        open_threads: composed.openThreads,
        narrative_facts: composed.narrativeFacts,
        recent_pacing: updatedPacing,
        recent_ending_styles: updatedEndingStyles,
        cycle_progress: composed.cycleProgress,
        next_cycle_preview: composed.nextCyclePreview
      });

      const updatedState = await this.getStoryState(userId);

      return {
        chapter: newChapter,
        state: updatedState
      };
    } catch (err) {
      await sql`
        UPDATE story_states
        SET
          is_generating = FALSE,
          generation_started_at = NULL
        WHERE user_id = ${userId};
      `;
      throw err;
    }
  },

  /**
   * Resets a user's story if explicitly requested, leaving journal entries 100% untouched.
   */
  async resetStory(userId: string): Promise<void> {
    if (!userId) return;

    await sql`DELETE FROM story_chapters WHERE user_id = ${userId};`;
    await sql`
      UPDATE story_states
      SET
        status = 'not_started',
        current_chapter_number = 0,
        current_cycle_id = NULL,
        current_cycle_name = NULL,
        world_theme = NULL,
        open_threads = '[]'::jsonb,
        narrative_facts = '{"characters":[],"locations":[],"symbols":[]}'::jsonb,
        recent_pacing = '[]'::jsonb,
        recent_ending_styles = '[]'::jsonb,
        cycle_progress = '{"stage":"beginning","chapter_in_cycle":1}'::jsonb,
        next_cycle_preview = NULL,
        is_generating = FALSE,
        generation_started_at = NULL,
        last_unlocked_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId};
    `;
  }
};
