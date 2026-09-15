import { Request, Response, NextFunction } from 'express';
import { focusAssessmentService } from '../services/focusAssessmentService.js';

export const assessmentController = {
  async saveFocusAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const extractedUserId =
        req.body.userId ||
        req.body.user_id ||
        req.body.uid ||
        req.body.upa_id ||
        req.cookies?.user_id ||
        req.headers['x-user-id'] ||
        '234306';

      const {
        assessmentVersion,
        answers,
        primaryConcern,
        secondaryConcern,
        desiredOutcome,
        confidence,
        assignedPathwayId,
        scores,
        metadata
      } = req.body;

      if (!primaryConcern || !assignedPathwayId) {
        return res.status(400).json({
          success: false,
          message: 'primaryConcern and assignedPathwayId are required'
        });
      }

      const result = await focusAssessmentService.saveFocusAssessment({
        userId: String(extractedUserId),
        assessmentVersion: assessmentVersion || '21_day_focus_v1',
        answers: answers || {},
        primaryConcern: String(primaryConcern),
        secondaryConcern: secondaryConcern ? String(secondaryConcern) : null,
        desiredOutcome: String(desiredOutcome || 'Improve overall wellbeing'),
        confidence: String(confidence || 'moderate'),
        assignedPathwayId: String(assignedPathwayId),
        scores: scores || {},
        metadata: metadata || {}
      });

      return res.status(200).json({
        success: true,
        message: 'Focus assessment saved successfully',
        data: result
      });
    } catch (error) {
      console.error('[assessmentController.saveFocusAssessment] Error:', error);
      next(error);
    }
  },

  async getLatestFocusAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.query.userId || req.cookies?.user_id || '234306';
      const assessment = await focusAssessmentService.getLatestFocusAssessment(String(userId));

      return res.status(200).json({
        success: true,
        data: assessment
      });
    } catch (error) {
      console.error('[assessmentController.getLatestFocusAssessment] Error:', error);
      next(error);
    }
  }
};
