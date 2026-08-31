import { sql } from '../db/client.js';
import { streakService } from '../services/streakService.js';

export async function setupDb() {
  console.log('⚡ Running Neon DB Schema Verification & Cleanup...');

  try {
    // 1. Drop Deprecated / Irrelevant Legacy Tables
    const deprecatedTables = [
      'campus_ambassadors',
      'campus_programs',
      'campus_ambassador_applications',
      'campus_program_applications',
      'ambassador_profiles',
      'ambassador_proofs',
      'corporate_partners',
      'corporate_partner_applications',
      'corporate_learning',
      'corporate_learning_progress',
      'program_learning',
      'program_learning_progress',
      'program_missions',
      'program_certificates',
      'program_notifications',
      'admins',
      'certificate_logs',
      'credit_ledger',
      'lesson_completions'
    ];

    for (const tableName of deprecatedTables) {
      try {
        await sql.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
      } catch (err) {
        // Table might not exist or already dropped
      }
    }

    // 2. Verified Active Tables for the Platform

    // Table 1: users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        service VARCHAR(50) DEFAULT 'therapy',
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Table 2: user_activities (Universal activity logger for Daily Check-In, Therapy, Lessons, etc.)
    await sql`
      CREATE TABLE IF NOT EXISTS user_activities (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        activity_id VARCHAR(255),
        activity_type VARCHAR(100) NOT NULL,
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
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_activity_id ON user_activities(activity_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);`;

    // Table 3: daily_check_in_days (Dedicated daily completion tracking with UNIQUE (user_id, check_in_date))
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

    // Table 4: streak_milestone_achievements (Track one-time milestone unlocks)
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

    // Table 5: user_streaks (Cache table for fast aggregate queries)
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

    // Table 6: user_progress
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
    await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);`;

    // Table 7: activity_submissions
    await sql`
      CREATE TABLE IF NOT EXISTS activity_submissions (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        lesson_id VARCHAR(255) NOT NULL,
        service VARCHAR(100) DEFAULT 'therapy',
        form_data JSONB DEFAULT '{}'::jsonb,
        files JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_submissions_user_id ON activity_submissions(user_id);`;

    // Table 8: assessment_results
    await sql`
      CREATE TABLE IF NOT EXISTS assessment_results (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        assessment_type VARCHAR(100) NOT NULL,
        score INT NOT NULL,
        category VARCHAR(100),
        answers JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON assessment_results(user_id);`;

    // 3. Run safe migration backfill for existing historical records
    await streakService.backfillStreaksFromHistory().catch((err) => {
      console.warn('⚠️ Non-critical warning in streak backfill:', err);
    });

    console.log('✅ Neon DB verified cleanly with streak & milestone architecture.');
  } catch (error) {
    console.error('❌ Error in setupDb:', error);
    throw error;
  }
}
