import { sql } from '../db/client.js';

export interface UserInput {
  userId: string;
  name?: string;
  email?: string;
  service?: string;
  promotionToolkitData?: any;
}

export const userService = {
  async upsertUser(input: UserInput) {
    const { userId, name, email, service, promotionToolkitData } = input;
    const result = await sql`
      INSERT INTO users (user_id, name, email, service, promotion_toolkit_data, updated_at)
      VALUES (
        ${userId}, 
        ${name || null}, 
        ${email || null}, 
        ${service || null}, 
        ${promotionToolkitData ? JSON.stringify(promotionToolkitData) : '{}'}::jsonb, 
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        name = COALESCE(EXCLUDED.name, users.name),
        email = COALESCE(EXCLUDED.email, users.email),
        service = COALESCE(EXCLUDED.service, users.service),
        promotion_toolkit_data = CASE 
          WHEN EXCLUDED.promotion_toolkit_data != '{}'::jsonb THEN EXCLUDED.promotion_toolkit_data 
          ELSE users.promotion_toolkit_data 
        END,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    return result[0];
  },

  async getUserById(userId: string) {
    const result = await sql`
      SELECT * FROM users WHERE user_id = ${userId};
    `;
    return result[0] || null;
  }
};
