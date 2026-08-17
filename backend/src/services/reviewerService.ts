import { sql } from '../db/client.js';

export interface UserReviewerRecord {
  user_id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  is_reviewer: boolean;
  is_active: boolean;
}

export const reviewerService = {
  /**
   * Fetch users from users table who are available to be assigned as reviewers
   * (is_reviewer = false AND is_active = true)
   */
  async getAvailableUsers(): Promise<UserReviewerRecord[]> {
    const rows = await sql`
      SELECT user_id, name, email, role, is_reviewer, is_active
      FROM users
      WHERE (is_reviewer IS FALSE OR is_reviewer IS NULL)
        AND (is_active IS TRUE OR is_active IS NULL)
      ORDER BY name ASC, email ASC, user_id ASC;
    `;
    return (rows || []).map((r: any) => ({
      user_id: String(r.user_id),
      name: r.name ? String(r.name).trim() : null,
      email: r.email ? String(r.email).trim() : null,
      role: r.role ? String(r.role).trim() : 'user',
      is_reviewer: Boolean(r.is_reviewer),
      is_active: Boolean(r.is_active)
    }));
  },

  /**
   * Fetch active reviewers from users table
   * (is_reviewer = true AND is_active = true)
   */
  async getActiveReviewers(): Promise<UserReviewerRecord[]> {
    const rows = await sql`
      SELECT user_id, name, email, role, is_reviewer, is_active
      FROM users
      WHERE is_reviewer IS TRUE
        AND (is_active IS TRUE OR is_active IS NULL)
      ORDER BY name ASC, email ASC, user_id ASC;
    `;
    return (rows || []).map((r: any) => ({
      user_id: String(r.user_id),
      name: r.name ? String(r.name).trim() : null,
      email: r.email ? String(r.email).trim() : null,
      role: r.role ? String(r.role).trim() : 'user',
      is_reviewer: Boolean(r.is_reviewer),
      is_active: Boolean(r.is_active)
    }));
  },

  /**
   * Update is_reviewer status for a given user_id
   */
  async updateReviewerStatus(userId: string, isReviewer: boolean): Promise<UserReviewerRecord | null> {
    const targetId = String(userId).trim();
    if (!targetId) return null;

    const rows = await sql`
      UPDATE users
      SET is_reviewer = ${isReviewer}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id::text = ${targetId} OR LOWER(email) = ${targetId.toLowerCase()}
      RETURNING user_id, name, email, role, is_reviewer, is_active;
    `;

    if (!rows || rows.length === 0) return null;

    const r = rows[0] as any;
    return {
      user_id: String(r.user_id),
      name: r.name ? String(r.name).trim() : null,
      email: r.email ? String(r.email).trim() : null,
      role: r.role ? String(r.role).trim() : 'user',
      is_reviewer: Boolean(r.is_reviewer),
      is_active: Boolean(r.is_active)
    };
  }
};
