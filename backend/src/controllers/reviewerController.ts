import { Response, NextFunction } from 'express';
import { reviewerService } from '../services/reviewerService.js';
import { AuthRequest } from '../types/auth.js';

export const reviewerController = {
  /**
   * GET /api/admin/reviewers/available-users
   * Fetch users available to be added as reviewers (is_reviewer = false)
   */
  async getAvailableUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await reviewerService.getAvailableUsers();
      return res.status(200).json({
        success: true,
        users
      });
    } catch (error) {
      console.error('❌ Error in getAvailableUsers controller:', error);
      next(error);
    }
  },

  /**
   * GET /api/admin/reviewers
   * Fetch active reviewers (is_reviewer = true)
   */
  async getActiveReviewers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reviewers = await reviewerService.getActiveReviewers();
      return res.status(200).json({
        success: true,
        reviewers
      });
    } catch (error) {
      console.error('❌ Error in getActiveReviewers controller:', error);
      next(error);
    }
  },

  /**
   * POST /api/admin/reviewers
   * Body: { userId: string } or { user_id: string }
   * Set is_reviewer = true
   */
  async addReviewer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = String(req.body.userId || req.body.user_id || '').trim();
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required to add a reviewer.'
        });
      }

      const updated = await reviewerService.updateReviewerStatus(userId, true);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `User '${userId}' not found.`
        });
      }

      const activeReviewers = await reviewerService.getActiveReviewers();
      return res.status(200).json({
        success: true,
        message: `User '${updated.name || updated.email || updated.user_id}' added as reviewer successfully.`,
        user: updated,
        reviewers: activeReviewers
      });
    } catch (error) {
      console.error('❌ Error in addReviewer controller:', error);
      next(error);
    }
  },

  /**
   * DELETE /api/admin/reviewers/:userId
   * Set is_reviewer = false for given userId
   */
  async removeReviewer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const targetId = String(userId || req.body?.userId || '').trim();
      if (!targetId) {
        return res.status(400).json({
          success: false,
          error: 'userId parameter is required.'
        });
      }

      const updated = await reviewerService.updateReviewerStatus(targetId, false);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `User '${targetId}' not found.`
        });
      }

      const activeReviewers = await reviewerService.getActiveReviewers();
      return res.status(200).json({
        success: true,
        message: `User '${updated.name || updated.email || updated.user_id}' removed from reviewers.`,
        user: updated,
        reviewers: activeReviewers
      });
    } catch (error) {
      console.error('❌ Error in removeReviewer controller:', error);
      next(error);
    }
  },

  /**
   * PATCH /api/admin/users/:userId/reviewer
   * Body: { is_reviewer: boolean }
   */
  async setReviewerStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const targetId = String(userId || req.body?.userId || req.body?.user_id || '').trim();
      const isReviewer = Boolean(req.body.is_reviewer);

      if (!targetId) {
        return res.status(400).json({
          success: false,
          error: 'userId parameter is required.'
        });
      }

      const updated = await reviewerService.updateReviewerStatus(targetId, isReviewer);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `User '${targetId}' not found.`
        });
      }

      const activeReviewers = await reviewerService.getActiveReviewers();
      return res.status(200).json({
        success: true,
        message: `Reviewer status updated successfully.`,
        user: updated,
        reviewers: activeReviewers
      });
    } catch (error) {
      console.error('❌ Error in setReviewerStatus controller:', error);
      next(error);
    }
  }
};
