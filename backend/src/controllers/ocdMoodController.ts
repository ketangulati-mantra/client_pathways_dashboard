import { Request, Response, NextFunction } from 'express';
import { sql } from '../db/client.js';

// Stable Allowed Enum Values
export const ALLOWED_EXPERIENCES = [
  'INTRUSIVE_THOUGHTS',
  'CHECKING',
  'CONTAMINATION',
  'REASSURANCE',
  'AVOIDANCE',
  'REPEATING',
  'MENTAL_REVIEW',
  'OTHER',
  'NONE'
] as const;

export type AllowedExperience = typeof ALLOWED_EXPERIENCES[number];

function extractUserId(req: Request): string {
  const extracted =
    req.body?.userId ||
    req.body?.user_id ||
    req.body?.uid ||
    req.query?.userId ||
    req.query?.user_id ||
    req.query?.uid ||
    req.cookies?.user_id ||
    req.headers['x-user-id'] ||
    '234306';

  return String(extracted).trim();
}

export const ocdMoodController = {
  // CREATE
  async createLog(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = extractUserId(req);
      const { mood, ocdImpact, experiences, note } = req.body;

      // 1. Validate Mood (1..5)
      const numMood = Number(mood);
      if (!Number.isInteger(numMood) || numMood < 1 || numMood > 5) {
        return res.status(400).json({
          success: false,
          error: 'Invalid mood value. Must be an integer between 1 and 5.'
        });
      }

      // 2. Validate OCD Impact (1..5)
      const numImpact = Number(ocdImpact);
      if (!Number.isInteger(numImpact) || numImpact < 1 || numImpact > 5) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ocdImpact value. Must be an integer between 1 and 5.'
        });
      }

      // 3. Validate Experiences (array of valid enums)
      let cleanedExperiences: string[] = [];
      if (Array.isArray(experiences)) {
        cleanedExperiences = experiences.filter((exp: any) =>
          typeof exp === 'string' && ALLOWED_EXPERIENCES.includes(exp.toUpperCase() as AllowedExperience)
        ).map((exp: string) => exp.toUpperCase());
      }
      if (cleanedExperiences.length === 0) {
        cleanedExperiences = ['NONE'];
      }

      // 4. Validate & sanitize note (max 500 chars)
      const cleanNote = typeof note === 'string' ? note.trim().slice(0, 500) : '';

      const rows = await sql`
        INSERT INTO ocd_mood_logs (
          user_id,
          mood,
          ocd_impact,
          experiences,
          note,
          created_at,
          updated_at
        ) VALUES (
          ${userId},
          ${numMood},
          ${numImpact},
          ${JSON.stringify(cleanedExperiences)}::jsonb,
          ${cleanNote},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING *;
      `;

      return res.status(201).json({
        success: true,
        message: 'OCD Mood log saved successfully',
        data: rows[0]
      });
    } catch (error) {
      console.error('[ocdMoodController.createLog] Error:', error);
      next(error);
    }
  },

  // READ ALL (for current user)
  async getUserLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = extractUserId(req);
      const limit = Math.min(Math.max(1, Number(req.query.limit) || 100), 500);
      const offset = Math.max(0, Number(req.query.offset) || 0);

      const rows = await sql`
        SELECT 
          id,
          user_id AS "userId",
          mood,
          ocd_impact AS "ocdImpact",
          experiences,
          note,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM ocd_mood_logs
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset};
      `;

      return res.status(200).json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('[ocdMoodController.getUserLogs] Error:', error);
      next(error);
    }
  },

  // READ SINGLE
  async getLogById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = extractUserId(req);
      const id = req.params.id;

      const rows = await sql`
        SELECT 
          id,
          user_id AS "userId",
          mood,
          ocd_impact AS "ocdImpact",
          experiences,
          note,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM ocd_mood_logs
        WHERE id = ${id} AND user_id = ${userId};
      `;

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Log entry not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error('[ocdMoodController.getLogById] Error:', error);
      next(error);
    }
  },

  // UPDATE
  async updateLog(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = extractUserId(req);
      const id = req.params.id;
      const { mood, ocdImpact, experiences, note } = req.body;

      // 1. Verify existence & ownership
      const existing = await sql`
        SELECT id FROM ocd_mood_logs WHERE id = ${id} AND user_id = ${userId};
      `;

      if (!existing || existing.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Log entry not found or permission denied'
        });
      }

      // 2. Validate Mood
      const numMood = Number(mood);
      if (!Number.isInteger(numMood) || numMood < 1 || numMood > 5) {
        return res.status(400).json({
          success: false,
          error: 'Invalid mood value. Must be an integer between 1 and 5.'
        });
      }

      // 3. Validate OCD Impact
      const numImpact = Number(ocdImpact);
      if (!Number.isInteger(numImpact) || numImpact < 1 || numImpact > 5) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ocdImpact value. Must be an integer between 1 and 5.'
        });
      }

      // 4. Validate Experiences
      let cleanedExperiences: string[] = [];
      if (Array.isArray(experiences)) {
        cleanedExperiences = experiences.filter((exp: any) =>
          typeof exp === 'string' && ALLOWED_EXPERIENCES.includes(exp.toUpperCase() as AllowedExperience)
        ).map((exp: string) => exp.toUpperCase());
      }
      if (cleanedExperiences.length === 0) {
        cleanedExperiences = ['NONE'];
      }

      // 5. Clean Note
      const cleanNote = typeof note === 'string' ? note.trim().slice(0, 500) : '';

      const updated = await sql`
        UPDATE ocd_mood_logs
        SET 
          mood = ${numMood},
          ocd_impact = ${numImpact},
          experiences = ${JSON.stringify(cleanedExperiences)}::jsonb,
          note = ${cleanNote},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING 
          id,
          user_id AS "userId",
          mood,
          ocd_impact AS "ocdImpact",
          experiences,
          note,
          created_at AS "createdAt",
          updated_at AS "updatedAt";
      `;

      return res.status(200).json({
        success: true,
        message: 'Log updated successfully',
        data: updated[0]
      });
    } catch (error) {
      console.error('[ocdMoodController.updateLog] Error:', error);
      next(error);
    }
  },

  // DELETE
  async deleteLog(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = extractUserId(req);
      const id = req.params.id;

      const deleted = await sql`
        DELETE FROM ocd_mood_logs
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id;
      `;

      if (!deleted || deleted.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Log entry not found or already deleted'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Log deleted successfully',
        deletedId: id
      });
    } catch (error) {
      console.error('[ocdMoodController.deleteLog] Error:', error);
      next(error);
    }
  },

  // TRENDS (14, 30, or 90 days)
  async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = extractUserId(req);
      const days = [14, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 14;

      const rows = await sql`
        SELECT 
          id,
          user_id AS "userId",
          mood,
          ocd_impact AS "ocdImpact",
          experiences,
          note,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM ocd_mood_logs
        WHERE user_id = ${userId}
          AND created_at >= CURRENT_TIMESTAMP - (${days} || ' days')::interval
        ORDER BY created_at ASC;
      `;

      return res.status(200).json({
        success: true,
        days,
        data: rows
      });
    } catch (error) {
      console.error('[ocdMoodController.getTrends] Error:', error);
      next(error);
    }
  }
};
