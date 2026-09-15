import { sql } from '../db/index.js';
import { streakService } from './streakService.js';

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
    const checkInId = metadata?.checkInId;

    // Idempotency: If checkInId is present, check for existing entry
    if (checkInId) {
      const existing = await sql`
        SELECT * FROM user_activities
        WHERE user_id = ${userId} AND metadata->>'checkInId' = ${checkInId}
        LIMIT 1;
      `;
      if (existing && existing.length > 0) {
        const updated = await sql`
          UPDATE user_activities SET
            emotion_zone = ${emotionZone || null},
            primary_emotion = ${primaryEmotion || null},
            additional_emotions = ${JSON.stringify(additionalEmotions)}::jsonb,
            intensity = ${intensity !== undefined ? Number(intensity) : null},
            contexts = ${JSON.stringify(contexts)}::jsonb,
            reflection = ${reflection || null},
            result_summary = ${JSON.stringify(resultSummary)}::jsonb,
            recommendation = ${JSON.stringify(recommendation)}::jsonb,
            metadata = ${JSON.stringify(metadata)}::jsonb,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${existing[0].id}
          RETURNING *;
        `;
        return updated[0];
      }
    }

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
      WHERE user_id = ${userId} 
        AND (activity_id = 'daily-check-in' OR activity_type = 'daily_check_in')
        AND created_at::date = CURRENT_DATE
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    return results[0] || null;
  },

  async deleteTodayCheckIn(userId: string) {
    await this.ensureActivityTable();

    const deleted = await sql`
      DELETE FROM user_activities 
      WHERE user_id = ${userId} 
        AND (activity_id = 'daily-check-in' OR activity_type = 'daily_check_in')
        AND created_at::date = CURRENT_DATE
      RETURNING *;
    `;

    // Recalculate streak after deletion
    await streakService.computeUserStreak(userId, 'UTC');

    return deleted;
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
    responseData?: any;
  }) {
    const { userId, lessonId, currentStep, totalSteps, actionDone, responseData = {} } = input;

    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        lesson_id VARCHAR(255) NOT NULL,
        current_step INT DEFAULT 0,
        total_steps INT DEFAULT 0,
        action_done VARCHAR(255),
        response_data JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_lesson_progress UNIQUE (user_id, lesson_id)
      );
    `;

    try {
      await sql`ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS current_step INT DEFAULT 0;`;
      await sql`ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS total_steps INT DEFAULT 0;`;
      await sql`ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS action_done VARCHAR(255);`;
      await sql`ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS response_data JSONB DEFAULT '{}'::jsonb;`;
    } catch (e) {}

    const result = await sql`
      INSERT INTO user_progress (user_id, lesson_id, current_step, total_steps, action_done, response_data, updated_at)
      VALUES (${userId}, ${lessonId}, ${currentStep}, ${totalSteps}, ${actionDone || null}, ${JSON.stringify(responseData)}::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET
        current_step = EXCLUDED.current_step,
        total_steps = EXCLUDED.total_steps,
        action_done = EXCLUDED.action_done,
        response_data = EXCLUDED.response_data,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    return result[0];
  },

  async getUserProgress(userId: string, lessonId: string) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_progress (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          lesson_id VARCHAR(255) NOT NULL,
          current_step INT DEFAULT 0,
          total_steps INT DEFAULT 0,
          action_done VARCHAR(255),
          response_data JSONB DEFAULT '{}'::jsonb,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_user_lesson_progress UNIQUE (user_id, lesson_id)
        );
      `;
    } catch (e) {}

    const result = await sql`
      SELECT * FROM user_progress WHERE user_id = ${userId} AND lesson_id = ${lessonId};
    `;
    return result[0] || null;
  },

  async recordPersonalizationSignal(input: {
    userId: string;
    pathwayId: string;
    signal: string;
    strength?: number;
    sourceType?: string;
    sourceId?: string;
    metadata?: any;
  }) {
    const {
      userId,
      pathwayId,
      signal,
      strength = 1,
      sourceType = 'activity',
      sourceId,
      metadata = {}
    } = input;

    await sql`
      CREATE TABLE IF NOT EXISTS user_personalization_signals (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        pathway_id VARCHAR(100) NOT NULL,
        signal VARCHAR(100) NOT NULL,
        strength INT DEFAULT 1,
        source_type VARCHAR(100) NOT NULL DEFAULT 'activity',
        source_id VARCHAR(255) NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_pathway_source_signal UNIQUE (user_id, pathway_id, source_type, source_id, signal)
      );
    `;

    try {
      await sql`ALTER TABLE user_personalization_signals ADD CONSTRAINT unique_user_pathway_source_signal UNIQUE (user_id, pathway_id, source_type, source_id, signal);`;
    } catch (e) {}

    // Idempotent UPSERT: If this activity/source already generated this signal, update metadata/strength without duplicating
    const result = await sql`
      INSERT INTO user_personalization_signals (
        user_id, pathway_id, signal, strength, source_type, source_id, metadata, created_at, updated_at
      ) VALUES (
        ${userId}, ${pathwayId}, ${signal}, ${strength}, ${sourceType}, ${sourceId}, ${JSON.stringify(metadata)}::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id, pathway_id, source_type, source_id, signal)
      DO UPDATE SET
        strength = EXCLUDED.strength,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    return result[0];
  },

  async getUserPersonalizationSignals(userId: string, pathwayId?: string) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_personalization_signals (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          pathway_id VARCHAR(100) NOT NULL,
          signal VARCHAR(100) NOT NULL,
          strength INT DEFAULT 1,
          source_type VARCHAR(100) NOT NULL DEFAULT 'activity',
          source_id VARCHAR(255) NOT NULL,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_user_pathway_source_signal UNIQUE (user_id, pathway_id, source_type, source_id, signal)
        );
      `;
    } catch (e) {}

    if (pathwayId) {
      return await sql`
        SELECT * FROM user_personalization_signals
        WHERE user_id = ${userId} AND pathway_id = ${pathwayId}
        ORDER BY created_at DESC;
      `;
    }
    return await sql`
      SELECT * FROM user_personalization_signals
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;
  },

  /**
   * Evaluates the evolving personalization profile across ALL accumulated signals
   * (Day 1 activities + Daily Check-Ins + future lessons).
   * current_focus is a derived calculation, never an immutable user state.
   */
  async getAggregatedPersonalizationFocus(userId: string, pathwayId: string = 'depression') {
    const signals = await this.getUserPersonalizationSignals(userId, pathwayId);
    
    const aggregatedScores: Record<string, number> = {
      energy_and_getting_started: 0,
      thoughts_and_mental_overload: 0,
      functioning_and_tasks: 0,
      interest_and_enjoyment: 0,
      connection_and_support: 0,
      identity_and_self_connection: 0,
      routine_and_sleep: 0
    };

    for (const row of signals) {
      const sig = String(row.signal);
      const str = Number(row.strength) || 1;
      if (aggregatedScores[sig] !== undefined) {
        aggregatedScores[sig] += str;
      } else {
        aggregatedScores[sig] = str;
      }
    }

    const priorityOrder = [
      'energy_and_getting_started',
      'thoughts_and_mental_overload',
      'functioning_and_tasks',
      'interest_and_enjoyment',
      'connection_and_support',
      'identity_and_self_connection',
      'routine_and_sleep'
    ];

    let currentFocus = 'energy_and_getting_started';
    let maxScore = -1;

    for (const key of priorityOrder) {
      if (aggregatedScores[key] > maxScore && aggregatedScores[key] > 0) {
        maxScore = aggregatedScores[key];
        currentFocus = key;
      }
    }

    return {
      userId,
      pathwayId,
      current_focus: currentFocus,
      aggregated_scores: aggregatedScores,
      total_signals_count: signals.length,
      signals
    };
  }
};
