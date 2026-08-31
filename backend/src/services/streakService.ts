import { sql } from '../db/index.js';
import { STREAK_MILESTONES, calculateMilestoneProgress } from '../config/streakConfig.js';
import { getLocalCalendarDate, getPreviousDayDate, getNextDayDate, getCalendarDaysDiff } from '../utils/dateUtils.js';

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  totalCheckInDays: number;
  completedToday: boolean;
  lastCompletedDate: string | null;
  nextMilestone: number | null;
  daysUntilNextMilestone: number | null;
  progressToNextMilestone: {
    current: number;
    target: number;
  } | null;
  newMilestoneAchieved: {
    milestone: number;
    achievedAt: string;
  } | null;
}

export const streakService = {
  /**
   * Ensures all streak & completion tables and indexes exist in Neon DB.
   */
  async ensureStreakTables() {
    // 1. Dedicated daily completion records (One record per user per local calendar date)
    await sql`
      CREATE TABLE IF NOT EXISTS daily_check_in_days (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        check_in_date DATE NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        timezone VARCHAR(100) DEFAULT 'UTC',
        activity_id VARCHAR(255) DEFAULT 'daily-check-in',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_check_in_day UNIQUE (user_id, check_in_date)
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_check_in_days_user_date ON daily_check_in_days(user_id, check_in_date DESC);`;

    // 2. User streaks aggregate cache table
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
    // Ensure all columns exist on user_streaks
    try {
      await sql`ALTER TABLE user_streaks ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;`;
      await sql`ALTER TABLE user_streaks ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0;`;
      await sql`ALTER TABLE user_streaks ADD COLUMN IF NOT EXISTS last_check_in_date DATE;`;
      await sql`ALTER TABLE user_streaks ADD COLUMN IF NOT EXISTS total_check_in_days INT DEFAULT 0;`;
      await sql`ALTER TABLE user_streaks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`;
    } catch (e) {}

    // 3. Milestone achievements table (Enforcing one-time achievement per milestone per user)
    await sql`
      CREATE TABLE IF NOT EXISTS streak_milestone_achievements (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        milestone INT NOT NULL,
        achieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        streak_day_id BIGINT REFERENCES daily_check_in_days(id) ON DELETE SET NULL,
        CONSTRAINT unique_user_milestone UNIQUE (user_id, milestone)
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_streak_milestones_user ON streak_milestone_achievements(user_id);`;
  },

  /**
   * Records a completed daily check-in, computes the new streak, verifies newly unlocked milestones,
   * and returns the full streak summary. Idempotent on same-day calls.
   */
  async recordDailyCheckInCompletion(userId: string, timezone?: string): Promise<StreakSummary> {
    await this.ensureStreakTables();

    const localDate = getLocalCalendarDate(new Date(), timezone);
    const safeTimezone = timezone || 'UTC';

    // 1. Insert or update the daily completion record for today
    const dayRows = await sql`
      INSERT INTO daily_check_in_days (user_id, check_in_date, timezone, completed_at)
      VALUES (${userId}, ${localDate}::date, ${safeTimezone}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, check_in_date)
      DO UPDATE SET completed_at = CURRENT_TIMESTAMP
      RETURNING id, user_id, check_in_date, completed_at;
    `;
    const todayStreakDayId = dayRows[0]?.id;

    // 2. Recalculate streak metrics from all unique historical check-in dates
    const summary = await this.computeUserStreak(userId, timezone);

    // 3. Check for newly achieved milestones
    let newlyAchieved: { milestone: number; achievedAt: string } | null = null;

    if (summary.currentStreak > 0) {
      // Find eligible milestones that the current streak meets or exceeds
      const eligibleMilestones = STREAK_MILESTONES.filter((m) => summary.currentStreak >= m);

      for (const milestone of eligibleMilestones) {
        // Attempt atomic insert with unique constraint protection
        const achievementRows = await sql`
          INSERT INTO streak_milestone_achievements (user_id, milestone, streak_day_id)
          VALUES (${userId}, ${milestone}, ${todayStreakDayId})
          ON CONFLICT (user_id, milestone) DO NOTHING
          RETURNING milestone, achieved_at;
        `;

        if (achievementRows && achievementRows.length > 0) {
          newlyAchieved = {
            milestone: Number(achievementRows[0].milestone),
            achievedAt: String(achievementRows[0].achieved_at)
          };
          console.log(`🎉 [StreakService] User ${userId} newly achieved ${milestone}-day streak milestone!`);
          break; // Report the highest new milestone unlocked in this session
        }
      }
    }

    // 4. Update the user_streaks cache table
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
        ${summary.currentStreak},
        ${summary.longestStreak},
        ${summary.lastCompletedDate}::date,
        ${summary.totalCheckInDays},
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
      ...summary,
      newMilestoneAchieved: newlyAchieved
    };
  },

  /**
   * Computes the complete, live streak state for a user from their unique calendar dates.
   */
  async computeUserStreak(userId: string, timezone?: string): Promise<StreakSummary> {
    await this.ensureStreakTables();

    const todayLocalDate = getLocalCalendarDate(new Date(), timezone);
    const yesterdayLocalDate = getPreviousDayDate(todayLocalDate);

    // Fetch all unique completed dates for this user ordered descending
    const dateRows = await sql`
      SELECT TO_CHAR(check_in_date, 'YYYY-MM-DD') AS check_in_date
      FROM daily_check_in_days
      WHERE user_id = ${userId}
      ORDER BY check_in_date DESC;
    `;

    const completedDates: string[] = dateRows.map((r: any) => String(r.check_in_date));
    const totalCheckInDays = completedDates.length;

    if (totalCheckInDays === 0) {
      const milestoneProg = calculateMilestoneProgress(0);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckInDays: 0,
        completedToday: false,
        lastCompletedDate: null,
        nextMilestone: milestoneProg.nextMilestone,
        daysUntilNextMilestone: milestoneProg.daysUntilNextMilestone,
        progressToNextMilestone: milestoneProg.progressToNextMilestone,
        newMilestoneAchieved: null
      };
    }

    const lastCompletedDate = completedDates[0];
    const completedToday = lastCompletedDate === todayLocalDate;
    const completedYesterday = lastCompletedDate === yesterdayLocalDate;

    // 1. Calculate Current Streak
    let currentStreak = 0;

    if (completedToday || completedYesterday) {
      // Streak is active!
      let expectedDate = lastCompletedDate;
      for (const date of completedDates) {
        const diff = getCalendarDaysDiff(expectedDate, date);
        if (diff === 0) {
          currentStreak++;
          expectedDate = getPreviousDayDate(date);
        } else {
          break; // Gap detected, streak chain ends
        }
      }
    } else {
      // Last check-in was before yesterday -> streak has broken
      currentStreak = 0;
    }

    // 2. Calculate Longest Streak in history
    let longestStreak = 0;
    let chain = 0;
    let nextExpected: string | null = null;

    // Evaluate from earliest to latest date
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

    // 3. Milestone Progress
    const milestoneProg = calculateMilestoneProgress(currentStreak);

    return {
      currentStreak,
      longestStreak,
      totalCheckInDays,
      completedToday,
      lastCompletedDate,
      nextMilestone: milestoneProg.nextMilestone,
      daysUntilNextMilestone: milestoneProg.daysUntilNextMilestone,
      progressToNextMilestone: milestoneProg.progressToNextMilestone,
      newMilestoneAchieved: null
    };
  },

  /**
   * Backfills daily_check_in_days and recalculates user_streaks from historical user_activities.
   */
  async backfillStreaksFromHistory(): Promise<{ usersMigrated: number; recordsCreated: number }> {
    await this.ensureStreakTables();

    console.log('🔄 [StreakService] Running backfill migration from user_activities...');

    const activities = await sql`
      SELECT DISTINCT user_id, TO_CHAR(created_at, 'YYYY-MM-DD') AS check_in_date, created_at
      FROM user_activities
      WHERE activity_type = 'daily_check_in' OR activity_id = 'daily-check-in'
      ORDER BY user_id, check_in_date;
    `;

    let recordsCreated = 0;
    const userIds = new Set<string>();

    for (const row of activities) {
      userIds.add(String(row.user_id));
      const inserted = await sql`
        INSERT INTO daily_check_in_days (user_id, check_in_date, completed_at, timezone)
        VALUES (${String(row.user_id)}, ${String(row.check_in_date)}::date, ${row.created_at}, 'UTC')
        ON CONFLICT (user_id, check_in_date) DO NOTHING
        RETURNING id;
      `;
      if (inserted && inserted.length > 0) {
        recordsCreated++;
      }
    }

    // Recompute streaks for all users with historical records
    for (const uid of userIds) {
      await this.computeUserStreak(uid);
    }

    console.log(`✅ [StreakService] Backfill complete: ${recordsCreated} days created for ${userIds.size} users.`);
    return { usersMigrated: userIds.size, recordsCreated };
  }
};
