import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activityService.js';
import { streakService } from '../services/streakService.js';

export const activityController = {
  // Log any user activity or daily check-in with activityId and calculate streaks
  async logActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const extractedUserId = 
        req.body.userId || 
        req.body.user_id || 
        req.body.uid || 
        req.body.upa_id || 
        req.cookies?.user_id || 
        req.headers['x-user-id'] || 
        '234306'; // default sample user id for local testing

      const timezone = 
        req.body.timezone || 
        req.body.clientTimezone || 
        req.headers['x-timezone'] || 
        'UTC';

      const {
        activityId,
        activityType,
        lessonId,
        service,
        emotionZone,
        primaryEmotion,
        additionalEmotions,
        intensity,
        contexts,
        reflection,
        resultSummary,
        recommendation,
        rewardPoints,
        metadata
      } = req.body;

      const finalActivityId = activityId || lessonId || 'daily-check-in';
      const finalActivityType = activityType || 'daily_check_in';

      // 1. Log the full activity entry in user_activities
      const activity = await activityService.logActivity({
        userId: String(extractedUserId),
        activityId: finalActivityId,
        activityType: finalActivityType,
        lessonId: lessonId || finalActivityId,
        service: service || 'therapy',
        emotionZone,
        primaryEmotion,
        additionalEmotions,
        intensity,
        contexts,
        reflection,
        resultSummary,
        recommendation,
        rewardPoints,
        metadata
      });

      // 2. If this is a completed Daily Check-In, record and calculate streak in user timezone
      let streakSummary = null;
      if (finalActivityId === 'daily-check-in' || finalActivityType === 'daily_check_in') {
        streakSummary = await streakService.recordDailyCheckInCompletion(
          String(extractedUserId),
          String(timezone)
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Activity logged successfully',
        data: {
          ...activity,
          streak: streakSummary
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get live streak summary for a user
  async getUserStreak(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.query.userId || req.cookies?.user_id || '234306';
      const timezone = req.query.timezone || req.headers['x-timezone'] || 'UTC';

      const streak = await streakService.computeUserStreak(String(userId), String(timezone));
      return res.status(200).json({ success: true, data: streak });
    } catch (error) {
      next(error);
    }
  },

  // Get all user activities mapped by userId and optional activityId
  async getUserActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.query.userId || req.cookies?.user_id || '234306';
      const activityId = req.params.activityId || req.query.activityId;
      const type = req.query.type;

      const activities = await activityService.getUserActivities(String(userId), {
        activityId: activityId ? String(activityId) : undefined,
        activityType: type ? String(type) : undefined
      });
      return res.status(200).json({ success: true, data: activities });
    } catch (error) {
      next(error);
    }
  },

  // Get latest daily check-in for a user
  async getLatestCheckIn(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.query.userId || req.cookies?.user_id || '234306';
      const latest = await activityService.getLatestCheckIn(String(userId));
      return res.status(200).json({ success: true, data: latest });
    } catch (error) {
      next(error);
    }
  },

  async completeActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { upa_id, uid, userId, service, lesson_id, lessonId, rewardPoints } = req.body;
      const finalUserId = String(userId || upa_id || uid || req.cookies?.user_id || '234306');
      const finalLessonId = String(lessonId || lesson_id || '');

      if (!finalUserId || !service || !finalLessonId) {
        return res.status(400).json({ 
          success: false, 
          message: 'userId/upa_id, service, and lessonId are required' 
        });
      }

      const completion = await activityService.completeActivity({
        userId: finalUserId,
        service: String(service),
        lessonId: finalLessonId,
        rewardPoints: rewardPoints ? Number(rewardPoints) : 0,
        metadata: req.body.metadata || {}
      });

      return res.status(200).json({
        success: true,
        message: 'Activity completed successfully',
        data: completion
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserCompletions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.query.userId || req.cookies?.user_id || '234306';

      const completions = await activityService.getUserCompletions(String(userId));
      return res.status(200).json({ success: true, data: completions });
    } catch (error) {
      next(error);
    }
  },

  async saveProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { upa_id, uid, userId, lesson_id, lessonId, currentStep, totalSteps, actionDone } = req.body;
      const finalUserId = String(userId || upa_id || uid || req.cookies?.user_id || '234306');
      const finalLessonId = String(lessonId || lesson_id || '');

      if (!finalUserId || !finalLessonId) {
        return res.status(400).json({ 
          success: false, 
          message: 'userId/upa_id and lessonId are required' 
        });
      }

      const progress = await activityService.saveProgress({
        userId: finalUserId,
        lessonId: finalLessonId,
        currentStep: currentStep !== undefined ? Number(currentStep) : 0,
        totalSteps: totalSteps !== undefined ? Number(totalSteps) : 0,
        actionDone: actionDone ? String(actionDone) : undefined
      });

      return res.status(200).json({
        success: true,
        message: 'Progress saved successfully',
        data: progress
      });
    } catch (error) {
      next(error);
    }
  },

  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.query.userId || req.cookies?.user_id || '234306';
      const lessonId = req.params.lessonId || req.query.lessonId;

      if (!lessonId) {
        return res.status(400).json({ success: false, message: 'lessonId is required' });
      }

      const progress = await activityService.getUserProgress(String(userId), String(lessonId));
      return res.status(200).json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  }
};
