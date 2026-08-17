import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService.js';

export const userController = {
  async upsertUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, name, email, service, promotionToolkitData } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }

      const user = await userService.upsertUser({ userId, name, email, service, promotionToolkitData });
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async getNonReviewers(req: Request, res: Response, next: NextFunction) {
    try {
      const { sql } = await import('../db/client.js');
      const users = await sql`
        SELECT user_id, name, email, role, is_reviewer, is_active, created_at
        FROM users
        WHERE is_reviewer IS NOT TRUE OR is_reviewer = FALSE
        ORDER BY name ASC, user_id ASC;
      `;
      return res.status(200).json({
        success: true,
        users: (users as any[]).map((u: any) => ({
          id: String(u.user_id),
          user_id: String(u.user_id),
          name: u.name || u.email || 'Unnamed User',
          email: u.email || '',
          role: u.role || 'User',
          is_reviewer: Boolean(u.is_reviewer)
        }))
      });
    } catch (error) {
      next(error);
    }
  }
};
