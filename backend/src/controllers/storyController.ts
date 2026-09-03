import { Request, Response } from 'express';
import { storyService } from '../services/storyService.js';

export const storyController = {
  /**
   * GET /api/story/state
   * Retrieves the unified, single-source-of-truth story state for the active user.
   */
  async getStoryState(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.query.userId as string) || (req.params.userId as string) || (req as any).user?.user_id || 'test-user-1';
      const timezone = (req.headers['x-timezone'] as string) || (req.query.timezone as string) || undefined;

      const unified = await storyService.getUnifiedStoryState(userId, timezone);

      res.status(200).json({
        success: true,
        data: {
          state: unified.storyState,
          latestChapter: unified.latestChapter,
          chapters: unified.chapters,
          hasChapters: unified.chapters.length > 0,
          canUnlockNextChapter: unified.canUnlockNextChapter,
          dailyEligibility: unified.dailyEligibility,
          nextChapterHint: unified.nextChapterHint,
          currentCycle: unified.currentCycle,
          status: unified.status
        }
      });
    } catch (error: any) {
      console.error('[StoryController] getStoryState error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve story state'
      });
    }
  },

  /**
   * GET /api/story/chapters
   * Retrieves chronological chapters for the active user.
   */
  async getStoryChapters(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.query.userId as string) || (req.params.userId as string) || (req as any).user?.user_id || 'test-user-1';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const chapters = await storyService.getStoryChapters(userId, limit);

      res.status(200).json({
        success: true,
        data: chapters
      });
    } catch (error: any) {
      console.error('[StoryController] getStoryChapters error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve story chapters'
      });
    }
  },

  /**
   * GET /api/story/chapters/latest
   * Retrieves the latest chapter for the active user.
   */
  async getLatestChapter(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.query.userId as string) || (req.params.userId as string) || (req as any).user?.user_id || 'test-user-1';

      const chapter = await storyService.getLatestChapter(userId);

      res.status(200).json({
        success: true,
        data: chapter
      });
    } catch (error: any) {
      console.error('[StoryController] getLatestChapter error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve latest chapter'
      });
    }
  },

  /**
   * POST /api/story/generate
   * Deterministically composes the next chapter for the user (ZERO AI / NO EXTERNAL API).
   * Enforces HARD limit of maximum 1 chapter per local calendar day.
   */
  async generateChapter(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.body?.userId as string) || (req.query.userId as string) || (req as any).user?.user_id || 'test-user-1';
      const timezone = (req.headers['x-timezone'] as string) || req.body?.timezone || (req.query.timezone as string) || undefined;

      const result = await storyService.generateNextChapterForUser(userId, { timezone });
      const unified = await storyService.getUnifiedStoryState(userId, timezone);

      res.status(201).json({
        success: true,
        data: {
          chapter: result.chapter,
          state: result.state,
          unified
        }
      });
    } catch (error: any) {
      console.error('[StoryController] generateChapter error:', error);
      const isLockError = error.message && error.message.includes('STORY_GENERATION_IN_PROGRESS');
      const isDailyLimit = error.message && error.message.includes('DAILY_CHAPTER_LIMIT_REACHED');
      const isNotEligible = error.message && error.message.includes('STORY_NOT_ELIGIBLE');

      let statusCode = 500;
      if (isLockError || isDailyLimit) statusCode = 409;
      else if (isNotEligible) statusCode = 400;

      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to generate chapter',
        code: isDailyLimit ? 'DAILY_CHAPTER_LIMIT_REACHED' : (isLockError ? 'STORY_GENERATION_IN_PROGRESS' : 'GENERATION_ERROR')
      });
    }
  }
};
