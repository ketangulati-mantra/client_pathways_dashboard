import { sql } from '../db/index.js';
import { STREAK_MILESTONES, calculateMilestoneProgress } from '../config/streakConfig.js';
import { getLocalCalendarDate, getPreviousDayDate, getNextDayDate, getCalendarDaysDiff } from '../utils/dateUtils.js';

export interface CheckInStateResponse {
  today: {
    hasCheckedIn: boolean;
    checkIns: any[];
    latestCheckIn: any | null;
  };
  streak: {
    current: number;
    longest: number;
    completedToday: boolean;
    totalCheckInDays: number;
    lastCompletedDate: string | null;
    nextMilestone: number | null;
    daysUntilNextMilestone: number | null;
    progressToNextMilestone: {
      current: number;
      target: number;
    } | null;
  };
}

export interface CreateCheckInInput {
  userId: string;
  activityId?: string;
  activityType?: string;
  lessonId?: string | null;
  service?: string;
  emotionZone?: string | null;
  primaryEmotion: string;
  additionalEmotions?: string[];
  intensity?: number;
  contexts?: string[];
  reflection?: string;
  resultSummary?: any;
  recommendation?: any;
  rewardPoints?: number;
  metadata?: any;
  timezone?: string;
}

export const dailyCheckInService = {
  /**
   * Ensures the canonical activity table and milestone tables exist.
   */
  async ensureTables() {
    await sql`
      CREATE TABLE IF NOT EXISTS user_activities (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        activity_id VARCHAR(255) NOT NULL DEFAULT 'daily-check-in',
        activity_type VARCHAR(100) NOT NULL DEFAULT 'daily_check_in',
        lesson_id VARCHAR(255),
        service VARCHAR(100) DEFAULT 'mental_wellness',
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
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_user_type_created ON user_activities(user_id, activity_type, created_at DESC);`;

    await sql`
      CREATE TABLE IF NOT EXISTS user_streaks (
        user_id VARCHAR(255) PRIMARY KEY,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        last_check_in_date DATE,
        total_check_in_days INT DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS streak_milestone_achievements (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        milestone INT NOT NULL,
        achieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        streak_day_id BIGINT,
        CONSTRAINT unique_user_milestone UNIQUE (user_id, milestone)
      );
    `;
  },

  /**
   * Side-effect-free, canonical check-in state computation.
   * Derives today's check-ins and streaks directly from user_activities.
   */
  async getCheckInState(userId: string, timezone: string = 'UTC'): Promise<CheckInStateResponse> {
    await this.ensureTables();

    const safeTimezone = timezone && timezone.trim() ? timezone.trim() : 'UTC';
    const todayLocalDate = getLocalCalendarDate(new Date(), safeTimezone);
    const yesterdayLocalDate = getPreviousDayDate(todayLocalDate);

    // 1. Fetch all check-in entries logged on the user's local calendar day for today
    const todayCheckIns = await sql`
      SELECT * FROM user_activities
      WHERE user_id = ${userId}
        AND (activity_id = 'daily-check-in' OR activity_type = 'daily_check_in')
        AND TO_CHAR(created_at AT TIME ZONE ${safeTimezone}, 'YYYY-MM-DD') = ${todayLocalDate}
      ORDER BY created_at DESC;
    `;

    // 2. Fetch distinct historical calendar dates in user's local timezone
    const dateRows = await sql`
      SELECT DISTINCT TO_CHAR(created_at AT TIME ZONE ${safeTimezone}, 'YYYY-MM-DD') AS check_in_date
      FROM user_activities
      WHERE user_id = ${userId}
        AND (activity_id = 'daily-check-in' OR activity_type = 'daily_check_in')
      ORDER BY check_in_date DESC;
    `;

    const completedDates: string[] = dateRows.map((r: any) => String(r.check_in_date));
    const totalCheckInDays = completedDates.length;

    const hasCheckedIn = todayCheckIns.length > 0;
    const latestCheckIn = todayCheckIns.length > 0 ? todayCheckIns[0] : null;

    if (totalCheckInDays === 0) {
      const milestoneProg = calculateMilestoneProgress(0);
      return {
        today: {
          hasCheckedIn: false,
          checkIns: [],
          latestCheckIn: null
        },
        streak: {
          current: 0,
          longest: 0,
          completedToday: false,
          totalCheckInDays: 0,
          lastCompletedDate: null,
          nextMilestone: milestoneProg.nextMilestone,
          daysUntilNextMilestone: milestoneProg.daysUntilNextMilestone,
          progressToNextMilestone: milestoneProg.progressToNextMilestone
        }
      };
    }

    const lastCompletedDate = completedDates[0];
    const completedToday = lastCompletedDate === todayLocalDate;
    const completedYesterday = lastCompletedDate === yesterdayLocalDate;

    // Calculate current continuous streak
    let currentStreak = 0;
    if (completedToday || completedYesterday) {
      let expectedDate = lastCompletedDate;
      for (const date of completedDates) {
        const diff = getCalendarDaysDiff(expectedDate, date);
        if (diff === 0) {
          currentStreak++;
          expectedDate = getPreviousDayDate(date);
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }

    // Calculate longest historical streak
    let longestStreak = 0;
    let chain = 0;
    let nextExpected: string | null = null;
    const ascendingDates = [...completedDates].reverse();

    for (const date of ascendingDates) {
      if (nextExpected === null || date === nextExpected) {
        chain++;
      } else {
        chain = 1;
      }
      if (chain > longestStreak) {
        longestStreak = chain;
      }
      nextExpected = getNextDayDate(date);
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    const milestoneProg = calculateMilestoneProgress(currentStreak);

    return {
      today: {
        hasCheckedIn,
        checkIns: todayCheckIns,
        latestCheckIn
      },
      streak: {
        current: currentStreak,
        longest: longestStreak,
        completedToday,
        totalCheckInDays,
        lastCompletedDate,
        nextMilestone: milestoneProg.nextMilestone,
        daysUntilNextMilestone: milestoneProg.daysUntilNextMilestone,
        progressToNextMilestone: milestoneProg.progressToNextMilestone
      }
    };
  },

  /**
   * Persists a daily check-in to user_activities, checks milestones, and syncs user_streaks cache.
   */
  async createCheckIn(input: CreateCheckInInput) {
    await this.ensureTables();

    const {
      userId,
      activityId = 'daily-check-in',
      activityType = 'daily_check_in',
      lessonId = null,
      service = 'mental_wellness',
      emotionZone = null,
      primaryEmotion,
      additionalEmotions = [],
      intensity = 3,
      contexts = [],
      reflection = '',
      resultSummary = {},
      recommendation = {},
      rewardPoints = 10,
      metadata = {},
      timezone = 'UTC'
    } = input;

    const safeTimezone = timezone && timezone.trim() ? timezone.trim() : 'UTC';

    // Insert canonical record into user_activities
    const insertResult = await sql`
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
        ${activityId},
        ${activityType},
        ${lessonId},
        ${service},
        ${emotionZone},
        ${primaryEmotion},
        ${JSON.stringify(additionalEmotions)}::jsonb,
        ${Number(intensity) || 3},
        ${JSON.stringify(contexts)}::jsonb,
        ${reflection || null},
        ${JSON.stringify(resultSummary)}::jsonb,
        ${JSON.stringify(recommendation)}::jsonb,
        ${Number(rewardPoints) || 10},
        ${JSON.stringify(metadata)}::jsonb,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING *;
    `;

    const savedCheckIn = insertResult[0];

    // Compute fresh state
    const state = await this.getCheckInState(userId, safeTimezone);

    // Sync user_streaks aggregate table
    await sql`
      INSERT INTO user_streaks (
        user_id,
        current_streak,
        longest_streak,
        last_check_in_date,
        total_check_in_days,
        updated_at
      ) VALUES (
        ${userId},
        ${state.streak.current},
        ${state.streak.longest},
        ${state.streak.lastCompletedDate}::date,
        ${state.streak.totalCheckInDays},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        last_check_in_date = EXCLUDED.last_check_in_date,
        total_check_in_days = EXCLUDED.total_check_in_days,
        updated_at = CURRENT_TIMESTAMP;
    `;

    // Check newly achieved milestone
    let newlyAchieved: { milestone: number; achievedAt: string } | null = null;
    if (state.streak.current > 0) {
      const eligibleMilestones = [...STREAK_MILESTONES]
        .filter((m) => state.streak.current >= m)
        .reverse();

      for (const milestone of eligibleMilestones) {
        const achievementRows = await sql`
          INSERT INTO streak_milestone_achievements (user_id, milestone)
          VALUES (${userId}, ${milestone})
          ON CONFLICT (user_id, milestone) DO NOTHING
          RETURNING milestone, achieved_at;
        `;
        if (achievementRows && achievementRows.length > 0 && !newlyAchieved) {
          newlyAchieved = {
            milestone: Number(achievementRows[0].milestone),
            achievedAt: String(achievementRows[0].achieved_at)
          };
        }
      }
    }

    return {
      checkIn: savedCheckIn,
      state,
      newMilestoneAchieved: newlyAchieved
    };
  },

  /**
   * Deletes one or all check-in records for a user from user_activities and syncs user_streaks.
   */
  async deleteCheckIn(userId: string, checkInId?: string | number, timezone: string = 'UTC') {
    await this.ensureTables();
    const safeTimezone = timezone && timezone.trim() ? timezone.trim() : 'UTC';

    let deletedRows = [];
    if (checkInId) {
      deletedRows = await sql`
        DELETE FROM user_activities
        WHERE user_id = ${userId}
          AND id = ${checkInId}
          AND (activity_id = 'daily-check-in' OR activity_type = 'daily_check_in')
        RETURNING id;
      `;
    } else {
      // If no checkInId is specified, delete all of today's check-ins
      const todayLocalDate = getLocalCalendarDate(new Date(), safeTimezone);
      deletedRows = await sql`
        DELETE FROM user_activities
        WHERE user_id = ${userId}
          AND (activity_id = 'daily-check-in' OR activity_type = 'daily_check_in')
          AND TO_CHAR(created_at AT TIME ZONE ${safeTimezone}, 'YYYY-MM-DD') = ${todayLocalDate}
        RETURNING id;
      `;
    }

    // Recompute state after deletion
    const state = await this.getCheckInState(userId, safeTimezone);

    // Sync user_streaks aggregate table
    await sql`
      INSERT INTO user_streaks (
        user_id,
        current_streak,
        longest_streak,
        last_check_in_date,
        total_check_in_days,
        updated_at
      ) VALUES (
        ${userId},
        ${state.streak.current},
        ${state.streak.longest},
        ${state.streak.lastCompletedDate}::date,
        ${state.streak.totalCheckInDays},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        last_check_in_date = EXCLUDED.last_check_in_date,
        total_check_in_days = EXCLUDED.total_check_in_days,
        updated_at = CURRENT_TIMESTAMP;
    `;

    return {
      deletedCount: deletedRows.length,
      deletedIds: deletedRows.map((r: any) => r.id),
      state
    };
  },

  /**
   * Fetches check-in history from canonical user_activities.
   */
  async getCheckInHistory(userId: string, limit: number = 50) {
    await this.ensureTables();

    return await sql`
      SELECT * FROM user_activities
      WHERE user_id = ${userId}
        AND (activity_id = 'daily-check-in' OR activity_type = 'daily_check_in')
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;
  }
};
