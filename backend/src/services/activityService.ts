import { sql } from '../db/index.js';

export const activityService = {
  async ensureActivityTable() {
    await sql`
      CREATE TABLE IF NOT EXISTS user_activities (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        activity_id VARCHAR(255) NOT NULL DEFAULT 'daily-check-in',
        activity_type VARCHAR(100) NOT NULL DEFAULT 'daily_check_in',
        lesson_id VARCHAR(255),
        service VARCHAR(100) DEFAULT 'therapy',
        emotion_zone VARCHAR(100),
        primary_emotion VARCHAR(100),
        additional_emotions JSONB DEFAULT '[]'::jsonb,
        intensity INT,
        contexts JSONB DEFAULT '[]'::jsonb,
        reflection TEXT,
        result_summary JSONB DEFAULT '{}'::jsonb,
        recommendation JSONB DEFAULT '{}'::jsonb,
        reward_points INT DEFAULT 0,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Ensure activity_id column exists if table was created previously
    try {
      await sql`ALTER TABLE user_activities ADD COLUMN IF NOT EXISTS activity_id VARCHAR(255) DEFAULT 'daily-check-in';`;
    } catch (e) {}

    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_activity_id ON user_activities(activity_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);`;
  },

  async logActivity(input: {
    userId: string;
    activityId?: string;
    activityType?: string;
    lessonId?: string;
    service?: string;
    emotionZone?: string;
    primaryEmotion?: string;
    additionalEmotions?: string[];
    intensity?: number;
    contexts?: string[];
    reflection?: string;
    resultSummary?: any;
    recommendation?: any;
    rewardPoints?: number;
    metadata?: any;
  }) {
    await this.ensureActivityTable();

    const {
      userId = '234306',
      activityId = 'daily-check-in',
      activityType = 'daily_check_in',
      lessonId = 'daily-check-in',
      service = 'therapy',
      emotionZone,
      primaryEmotion,
      additionalEmotions = [],
      intensity,
      contexts = [],
      reflection,
      resultSummary = {},
      recommendation = {},
      rewardPoints = 0,
      metadata = {}
    } = input;

    const finalActivityId = activityId || lessonId || 'daily-check-in';

    const result = await sql`
      INSERT INTO user_activities (
        user_id,
        activity_id,
        activity_type,
        lesson_id,
        service,
        emotion_zone,
        primary_emotion,
        additional_emotions,
        intensity,
        contexts,
        reflection,
        result_summary,
        recommendation,
        reward_points,
        metadata,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        ${finalActivityId},
        ${activityType},
        ${lessonId},
        ${service},
        ${emotionZone || null},
        ${primaryEmotion || null},
        ${JSON.stringify(additionalEmotions)}::jsonb,
        ${intensity !== undefined ? Number(intensity) : null},
        ${JSON.stringify(contexts)}::jsonb,
        ${reflection || null},
        ${JSON.stringify(resultSummary)}::jsonb,
        ${JSON.stringify(recommendation)}::jsonb,
        ${Number(rewardPoints) || 0},
        ${JSON.stringify(metadata)}::jsonb,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING *;
    `;

    return result[0];
  },

  async getUserActivities(userId: string, filter?: { activityId?: string; activityType?: string }) {
    await this.ensureActivityTable();

    if (filter?.activityId) {
      return await sql`
        SELECT * FROM user_activities 
        WHERE user_id = ${userId} AND activity_id = ${filter.activityId}
        ORDER BY created_at DESC;
      `;
    }

    if (filter?.activityType) {
      return await sql`
        SELECT * FROM user_activities 
        WHERE user_id = ${userId} AND activity_type = ${filter.activityType}
        ORDER BY created_at DESC;
      `;
    }

    return await sql`
      SELECT * FROM user_activities 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;
  },

  async getLatestCheckIn(userId: string) {
    await this.ensureActivityTable();

    const results = await sql`
      SELECT * FROM user_activities 
      WHERE user_id = ${userId} AND (activity_id = 'daily-check-in' OR activity_type = 'daily_check_in')
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    return results[0] || null;
  },

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
