import { sql } from '../db/index.js';

export const activityService = {
  async completeActivity(input: {
    userId: string;
    service: string;
    lessonId: string;
    rewardPoints?: number;
    metadata?: any;
  }) {
    const { userId, service, lessonId, rewardPoints = 0, metadata = {} } = input;

    await sql`
      CREATE TABLE IF NOT EXISTS user_activity_completions (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        service VARCHAR(100) NOT NULL,
        lesson_id VARCHAR(255) NOT NULL,
        reward_points INT DEFAULT 0,
        metadata JSONB DEFAULT '{}'::jsonb,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_service_lesson UNIQUE (user_id, service, lesson_id)
      );
    `;

    const completion = await sql`
      INSERT INTO user_activity_completions (user_id, service, lesson_id, reward_points, metadata, completed_at)
      VALUES (${userId}, ${service}, ${lessonId}, ${rewardPoints}, ${JSON.stringify(metadata)}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, service, lesson_id)
      DO UPDATE SET
        reward_points = EXCLUDED.reward_points,
        metadata = EXCLUDED.metadata,
        completed_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    return completion[0];
  },

  async getUserCompletions(userId: string) {
    await sql`
      CREATE TABLE IF NOT EXISTS user_activity_completions (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        service VARCHAR(100) NOT NULL,
        lesson_id VARCHAR(255) NOT NULL,
        reward_points INT DEFAULT 0,
        metadata JSONB DEFAULT '{}'::jsonb,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_service_lesson UNIQUE (user_id, service, lesson_id)
      );
    `;

    return await sql`
      SELECT * FROM user_activity_completions WHERE user_id = ${userId} ORDER BY completed_at DESC;
    `;
  },

  async saveProgress(input: {
    userId: string;
    lessonId: string;
    currentStep: number;
    totalSteps: number;
    actionDone?: string;
  }) {
    const { userId, lessonId, currentStep, totalSteps, actionDone } = input;

    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        lesson_id VARCHAR(255) NOT NULL,
        current_step INT DEFAULT 0,
        total_steps INT DEFAULT 0,
        action_done VARCHAR(255),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_lesson_progress UNIQUE (user_id, lesson_id)
      );
    `;

    const result = await sql`
      INSERT INTO user_progress (user_id, lesson_id, current_step, total_steps, action_done, updated_at)
      VALUES (${userId}, ${lessonId}, ${currentStep}, ${totalSteps}, ${actionDone || null}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET
        current_step = EXCLUDED.current_step,
        total_steps = EXCLUDED.total_steps,
        action_done = EXCLUDED.action_done,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    return result[0];
  },

  async getUserProgress(userId: string, lessonId: string) {
    const result = await sql`
      SELECT * FROM user_progress WHERE user_id = ${userId} AND lesson_id = ${lessonId};
    `;
    return result[0] || null;
  }
};
