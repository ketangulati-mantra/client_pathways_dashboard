import { Request, Response, NextFunction } from 'express';
import { challengeService } from '../services/challengeService.js';

export const challengeController = {
  /**
   * GET /api/challenges
   * Get all available active challenges in the catalogue.
   */
  async getChallenges(req: Request, res: Response, next: NextFunction) {
    try {
      const challenges = await challengeService.getAvailableChallenges();
      return res.status(200).json({
        success: true,
        data: challenges
      });
    } catch (error) {
      console.error('[ChallengeController] Error fetching challenges:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve challenges'
      });
    }
  },

  /**
   * GET /api/challenges/details/:idOrSlug
   * Get challenge details.
   */
  async getChallengeDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { idOrSlug } = req.params;
      const challenge = await challengeService.getChallengeByIdOrSlug(idOrSlug);
      if (!challenge) {
        return res.status(404).json({
          success: false,
          error: 'Challenge not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: challenge
      });
    } catch (error) {
      console.error('[ChallengeController] Error fetching challenge details:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve challenge details'
      });
    }
  },

  /**
   * GET /api/challenges/current
   * Aggregated Authoritative Dashboard Endpoint:
   * Resolves whether user has an active challenge (State 2) or should see the catalogue (State 1).
   */
  async getCurrentDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const extractedUserId = 
        req.query.userId || 
        req.query.uid || 
        req.query.user_id || 
        req.cookies?.user_id || 
        req.headers['x-user-id'] || 
        '234306';

      const dashboard = await challengeService.getDashboardPayload(String(extractedUserId));

      return res.status(200).json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('[ChallengeController] Error fetching current challenge dashboard:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to load challenge dashboard'
      });
    }
  },

  /**
   * POST /api/challenges/enroll
   * Idempotent Challenge Enrollment enforcing the ONE-ACTIVE-CHALLENGE rule.
   */
  async enroll(req: Request, res: Response, next: NextFunction) {
    try {
      const extractedUserId = 
        req.body.userId || 
        req.body.user_id || 
        req.body.uid || 
        req.cookies?.user_id || 
        req.headers['x-user-id'];

      if (!extractedUserId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required for challenge enrollment'
        });
      }

      const challengeId = req.body.challengeId || req.body.challenge_id || 'mantra_21';

      const result = await challengeService.enrollUser(
        String(extractedUserId),
        String(challengeId)
      );

      if (!result.success) {
        const statusCode = result.code === 'ACTIVE_CHALLENGE_EXISTS' ? 409 : 400;
        return res.status(statusCode).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Enrolled in challenge successfully',
        data: result.enrollment
      });
    } catch (error) {
      console.error('[ChallengeController] Error enrolling in challenge:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enroll in challenge'
      });
    }
  },

  /**
   * GET /api/challenges/enrollment/:userId/:challengeId?
   */
  async getEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const enrollment = await challengeService.getActiveUserEnrollment(String(userId));

      return res.status(200).json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      console.error('[ChallengeController] Error fetching enrollment:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch enrollment'
      });
    }
  },

  /**
   * POST /api/challenges/leaderboard/snapshot
   * Trigger manual or cron snapshot update.
   */
  async triggerLeaderboardSnapshot(req: Request, res: Response, next: NextFunction) {
    try {
      const challengeId = req.body.challengeId || 'mantra_21';
      await challengeService.generateDailyLeaderboardSnapshot(challengeId);
      return res.status(200).json({
        success: true,
        message: `Leaderboard snapshot generated for ${challengeId}`
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate leaderboard snapshot'
      });
    }
  }
};
