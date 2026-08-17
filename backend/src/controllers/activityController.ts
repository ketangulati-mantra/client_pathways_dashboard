import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activityService.js';

export const activityController = {
  async completeActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { upa_id, uid, userId, service, lesson_id, lessonId, rewardPoints } = req.body;
      const finalUserId = String(userId || upa_id || uid || '');
      const finalLessonId = String(lessonId || lesson_id || '');

      if (!finalUserId || !service || !finalLessonId) {
        return res.status(400).json({ 
          success: false, 
          message: 'userId/upa_id, service, and lessonId are required' 
        });
      }

      const completion = await activityService.completeActivity({
        userId: finalUserId,
        service,
        lessonId: finalLessonId,
        rewardPoints: rewardPoints || 0
      });

      return res.status(200).json({ success: true, data: completion });
    } catch (error) {
      next(error);
    }
  },

  async getUserCompletions(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }

      const completions = await activityService.getUserCompletions(userId);
      return res.status(200).json({ success: true, data: completions });
    } catch (error) {
      next(error);
    }
  },

  async saveProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, lessonId, currentStep, totalSteps, stepIndex, actionDone } = req.body;
      if (!userId || !lessonId) {
        return res.status(400).json({ success: false, message: 'userId and lessonId are required' });
      }

      const progress = await activityService.saveProgress({
        userId,
        lessonId,
        currentStep: currentStep !== undefined ? Number(currentStep) : Number(stepIndex || 0),
        totalSteps: totalSteps !== undefined ? Number(totalSteps) : 0,
        actionDone
      });

      return res.status(200).json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  },

  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, lessonId } = req.params;
      if (!userId || !lessonId) {
        return res.status(400).json({ success: false, message: 'userId and lessonId are required' });
      }

      const progress = await activityService.getUserProgress(userId, lessonId);
      return res.status(200).json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  }
};
